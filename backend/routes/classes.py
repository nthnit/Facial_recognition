from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import outerjoin
from database import get_db
from models.class_model import Class
from models.student_model import Student
from models.class_students_model import ClassStudent
from models.user import User
from models.attendance_model import Attendance
from schemas.class_schema import ClassCreate, ClassUpdate, ClassResponse
from schemas.student_schema import StudentResponse
from schemas.session_schema import SessionResponse
from schemas.attendance_schema import AttendanceCreate, AttendanceResponse
from models.session_model import Session as SessionModel
from typing import List
import pandas as pd
from fastapi.responses import FileResponse
import os
from datetime import datetime, timedelta, time, date
from routes.user import get_current_user  # ✅ Import xác thực user

router = APIRouter()

# 🟢 API LẤY DANH SÁCH LỚP HỌC (Trả về cả `teacher_id` và `teacher_name`)
@router.get("", response_model=List[ClassResponse])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách lớp học")

    classes = db.query(Class, User.id.label("teacher_id"), User.full_name.label("teacher_name"))\
                .outerjoin(User, User.id == Class.teacher_id)\
                .all()

    current_date = datetime.utcnow().date()  # ✅ Lấy thời gian thực

    class_list = []
    for cls, teacher_id, teacher_name in classes:
        # ✅ Tự động cập nhật status
        if current_date < cls.start_date:
            cls.status = "Planning"
        elif cls.start_date <= current_date <= cls.end_date:
            cls.status = "Active"
        else:
            cls.status = "Closed"

        # Lưu vào database nếu status thay đổi
        db.commit()
        db.refresh(cls)

        class_list.append({
            "id": cls.id,
            "name": cls.name,
            "teacher_id": teacher_id,
            "teacher_name": teacher_name,
            "start_date": cls.start_date,
            "end_date": cls.end_date,
            "total_sessions": cls.total_sessions,
            "subject": cls.subject,
            "status": cls.status,  # ✅ Trả về trạng thái cập nhật
            "class_code": cls.class_code,
        })

    return class_list

# 🟢 API LẤY CHI TIẾT LỚP HỌC (Trả về `teacher_id` và `teacher_name`)
@router.get("/{class_id}", response_model=ClassResponse)
def get_class_detail(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem chi tiết lớp học")

    class_obj = (
        db.query(Class, User.id.label("teacher_id"), User.full_name.label("teacher_name"))
        .outerjoin(User, User.id == Class.teacher_id)
        .filter(Class.id == class_id)
        .first()
    )

    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    cls, teacher_id, teacher_name = class_obj

    # ✅ Chuyển `weekly_schedule` từ chuỗi thành danh sách số [0,2,4] (nếu có)
    weekly_schedule = [int(day) for day in cls.weekly_schedule.split(",")] if cls.weekly_schedule else []

    return {
        "id": cls.id,
        "name": cls.name,
        "teacher_id": teacher_id,
        "teacher_name": teacher_name,
        "start_date": cls.start_date,
        "end_date": cls.end_date,
        "total_sessions": cls.total_sessions,
        "subject": cls.subject,
        "status": cls.status,
        "class_code": cls.class_code,
        "weekly_schedule": weekly_schedule,  # ✅ Trả về danh sách ngày học trong tuần
    }


# 🟢 API THÊM MỚI LỚP HỌC
@router.post("", response_model=ClassResponse)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("Received payload:", class_data.dict())

    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm lớp học")

    # Tính toán ngày kết thúc dựa trên số buổi học
    start_date = class_data.start_date
    total_sessions = class_data.total_sessions
    weekly_schedule = class_data.weekly_schedule  # Danh sách các thứ học trong tuần, ví dụ: [0, 2, 4]

    current_date = start_date
    sessions_count = 0
    session_dates = []

    while sessions_count < total_sessions:
        if current_date.weekday() in weekly_schedule:  # Nếu ngày hiện tại thuộc lịch học
            session_dates.append(current_date)  # Lưu lại ngày của session
            sessions_count += 1
        current_date += timedelta(days=1)

    end_date = session_dates[-1] if session_dates else start_date  # Ngày kết thúc là ngày học cuối cùng

    # Tạo mã lớp học tự động
    new_class_code = f"CLASS{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    # Tạo lớp học mới
    new_class = Class(
        name=class_data.name,
        teacher_id=class_data.teacher_id,
        start_date=start_date,
        end_date=end_date,
        total_sessions=total_sessions,
        subject=class_data.subject,
        status=class_data.status,
        class_code=new_class_code,
        weekly_schedule=",".join(map(str, weekly_schedule))
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    # 🔹 Tạo sessions tự động
    session_objects = []
    default_start_time = time(8, 0)  # Giờ bắt đầu mặc định: 08:00 AM
    default_end_time = time(10, 0)  # Giờ kết thúc mặc định: 10:00 AM

    for session_date in session_dates:
        session_obj = SessionModel(
            class_id=new_class.id,
            date=session_date,
            start_time=default_start_time,
            end_time=default_end_time
        )
        session_objects.append(session_obj)

    # Lưu sessions vào database
    db.add_all(session_objects)
    db.commit()

    return ClassResponse(
        id=new_class.id,
        name=new_class.name,
        teacher_id=new_class.teacher_id,
        start_date=new_class.start_date,
        end_date=new_class.end_date,
        total_sessions=new_class.total_sessions,
        subject=new_class.subject,
        status=new_class.status,
        class_code=new_class.class_code,
        weekly_schedule=[int(day) for day in new_class.weekly_schedule.split(",")]
    )

# 🟢 API CẬP NHẬT THÔNG TIN LỚP HỌC


@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    class_data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền hạn
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật thông tin lớp học")

    # Lấy thông tin lớp học từ database
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    # Cập nhật thông tin từ request (bỏ qua các giá trị không được gửi lên)
    update_data = class_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(class_obj, key, value)

    # Nếu `weekly_schedule` được cập nhật, chuyển thành chuỗi để lưu vào database
    if "weekly_schedule" in update_data:
        class_obj.weekly_schedule = ",".join(map(str, update_data["weekly_schedule"]))

    # Nếu `start_date`, `total_sessions`, hoặc `weekly_schedule` thay đổi → tính lại `end_date` và cập nhật sessions
    if "start_date" in update_data or "total_sessions" in update_data or "weekly_schedule" in update_data:
        start_date = class_obj.start_date
        total_sessions = class_obj.total_sessions
        weekly_schedule = [int(day) for day in class_obj.weekly_schedule.split(",")]

        # 🔹 Xóa tất cả sessions hiện tại của lớp này trước khi tạo lại
        existing_sessions = db.query(SessionModel).filter(SessionModel.class_id == class_id).all()
        for session in existing_sessions:
            db.delete(session)
        db.commit()  # Commit để xóa hoàn toàn sessions trước khi thêm mới

        # 🔹 Tạo lại danh sách sessions mới
        current_date = start_date
        sessions_count = 0
        session_list = []

        while sessions_count < total_sessions:
            if current_date.weekday() in weekly_schedule:
                new_session = SessionModel(
                    class_id=class_id,
                    date=current_date,
                    start_time="19:30",  # 🔹 Có thể sửa giờ học theo yêu cầu
                    end_time="21:30"
                )
                session_list.append(new_session)
                sessions_count += 1
            current_date += timedelta(days=1)

        # 🔹 Lưu các sessions mới vào database
        db.add_all(session_list)

        # 🔹 Cập nhật `end_date` dựa trên session cuối cùng
        if session_list:
            class_obj.end_date = session_list[-1].date

    # 🔹 Lưu thay đổi vào database
    db.commit()
    db.refresh(class_obj)

    # ✅ Chuyển lại `weekly_schedule` thành List[int] khi trả về response
    return ClassResponse(
        id=class_obj.id,
        name=class_obj.name,
        teacher_id=class_obj.teacher_id,
        start_date=class_obj.start_date,
        end_date=class_obj.end_date,
        total_sessions=class_obj.total_sessions,
        subject=class_obj.subject,
        status=class_obj.status,
        class_code=class_obj.class_code,
        weekly_schedule=[int(day) for day in class_obj.weekly_schedule.split(",")]  # ✅ Chuyển chuỗi thành List[int]
    )




# 🟢 API XOÁ LỚP HỌC
@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xoá lớp học")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    db.delete(class_obj)
    db.commit()
    return {"detail": "Lớp học đã được xóa thành công"}

# 🟢 API XUẤT DANH SÁCH LỚP RA FILE EXCEL (Trả về `teacher_id` và `teacher_name`)
@router.get("/export")
def export_classes_to_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xuất danh sách lớp học")

    classes = (
        db.query(Class, User.id.label("teacher_id"), User.full_name.label("teacher_name"))
        .outerjoin(User, User.id == Class.teacher_id)
        .all()
    )

    if not classes:
        raise HTTPException(status_code=404, detail="Không có lớp học nào để xuất")

    data = [{
        "Mã lớp": cls.class_code,
        "Tên lớp": cls.name,
        "Giảng viên ID": teacher_id,  # ✅ Trả về teacher_id để giữ nguyên dữ liệu
        "Giảng viên": teacher_name,  # ✅ Hiển thị tên giáo viên thay vì ID
        "Ngày bắt đầu": cls.start_date.strftime("%Y-%m-%d"),
        "Ngày kết thúc": cls.end_date.strftime("%Y-%m-%d"),
        "Số buổi học": cls.total_sessions,
        "Môn học": cls.subject,
        "Trạng thái": cls.status
    } for cls, teacher_id, teacher_name in classes]

    df = pd.DataFrame(data)
    file_path = "class_list.xlsx"
    df.to_excel(file_path, index=False)

    return FileResponse(
        file_path, 
        filename="DanhSachLop.xlsx", 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# 🟢 API Lấy danh sách học sinh theo lớp
@router.get("/{class_id}/students", response_model=List[StudentResponse])
def get_students_by_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách học sinh")

    # Kiểm tra lớp có tồn tại không
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    # Lấy danh sách học sinh của lớp
    students = (
        db.query(Student)
        .join(ClassStudent, Student.id == ClassStudent.student_id)
        .filter(ClassStudent.class_id == class_id)
        .all()
    )

    return students

# 🟢 API THÊM HỌC SINH VÀO LỚP
@router.post("/{class_id}/enroll/{student_id}")
def enroll_student(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm học sinh vào lớp")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    student_obj = db.query(Student).filter(Student.id == student_id).first()

    if not class_obj or not student_obj:
        raise HTTPException(status_code=404, detail="Lớp học hoặc học sinh không tồn tại")

    existing_enrollment = db.query(ClassStudent).filter_by(class_id=class_id, student_id=student_id).first()
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Học sinh đã đăng ký lớp này")

    new_enrollment = ClassStudent(class_id=class_id, student_id=student_id, enrolled_at=datetime.utcnow())
    db.add(new_enrollment)
    db.commit()

    return {"message": "Học sinh đã được thêm vào lớp"}


# API XỬ LÝ SESSION CỦA LỚP HỌC
@router.get("/{class_id}/sessions", response_model=List[SessionResponse])
def get_class_sessions(
    class_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách buổi học")

    # Kiểm tra lớp học có tồn tại không
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    # Truy vấn danh sách sessions từ bảng `sessions`
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.class_id == class_id)
        .order_by(SessionModel.date)
        .all()
    )

    session_list = []
    for index, session in enumerate(sessions, start=1):
        # Lấy danh sách học sinh của lớp
        students = (
            db.query(Student)
            .join(ClassStudent, Student.id == ClassStudent.student_id)
            .filter(ClassStudent.class_id == class_id)
            .all()
        )

        # Lấy danh sách điểm danh của buổi học
        attendance_records = (
            db.query(Attendance)
            .filter(Attendance.session_id == session.id)
            .all()
        )

        # Tính tỉ lệ điểm danh
        attendance_rate = (
            len([a for a in attendance_records if a.status == "Present"]) / len(students)
            if students else 0
        )

        # Thêm session vào danh sách trả về (bao gồm `session_id`)
        session_list.append({
            "session_id": session.id,  # ✅ Thêm session_id vào response
            "session_number": index,
            "date": session.date,
            "weekday": session.date.strftime("%A"),
            "start_time": session.start_time.strftime("%H:%M"),
            "end_time": session.end_time.strftime("%H:%M"),
            "total_students": len(students),
            "attendance_rate": round(attendance_rate * 100, 2),
            "students": [{"id": s.id, "full_name": s.full_name} for s in students],
        })

    return session_list


# API: Cập nhật điểm danh cho một buổi học
@router.post("/{class_id}/sessions/{session_date}/attendance")
def update_attendance(
    class_id: int,
    session_date: date,
    attendance_data: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật điểm danh.")

    # 🔹 Kiểm tra xem lớp học có tồn tại không
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại.")

    # 🔹 Tìm session dựa trên `class_id` và `session_date`
    session = db.query(SessionModel).filter(
        SessionModel.class_id == class_id,
        SessionModel.date == session_date
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Buổi học không tồn tại.")

    for record in attendance_data:
        if record.class_id != class_id:
            raise HTTPException(status_code=400, detail="Dữ liệu không hợp lệ. class_id không khớp.")

        # 🔹 Kiểm tra xem điểm danh đã tồn tại chưa
        existing_attendance = db.query(Attendance).filter(
            Attendance.class_id == class_id,
            Attendance.session_id == session.id,
            Attendance.student_id == record.student_id
        ).first()

        if existing_attendance:
            # 🔹 Cập nhật trạng thái điểm danh nếu đã tồn tại
            existing_attendance.status = record.status
        else:
            # 🔹 Tạo bản ghi điểm danh mới nếu chưa tồn tại
            new_attendance = Attendance(
                class_id=class_id,
                session_id=session.id,  # ✅ Liên kết session_id thay vì chỉ dùng ngày
                student_id=record.student_id,
                session_date=session_date,  # 🔹 Lưu lại ngày của buổi học
                status=record.status
            )
            db.add(new_attendance)

    db.commit()
    return {"message": "Cập nhật điểm danh thành công"}


# API LẤY TRẠNG THÁI ĐIỂM DANH
@router.get("/{class_id}/sessions/{session_date}/attendance", response_model=List[AttendanceResponse])
def get_attendance_status(
    class_id: int,
    session_date: str,
    db: Session = Depends(get_db)
):
    """
    API lấy trạng thái điểm danh của một buổi học.
    """
    attendance_records = (
        db.query(Attendance)
        .filter(Attendance.class_id == class_id, Attendance.session_date == session_date)
        .all()
    )

    if not attendance_records:
        raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu điểm danh cho buổi học này.")

    return attendance_records

# ✅ API LẤY ĐIỂM DANH CỦA MỘT LỚP HỌC
@router.get("/{class_id}/attendance", response_model=List[AttendanceResponse])
def get_class_attendance(class_id: int, db: Session = Depends(get_db)):
    # 🔹 Lấy danh sách các session của lớp
    sessions = db.query(SessionModel).filter(SessionModel.class_id == class_id).all()
    if not sessions:
        raise HTTPException(status_code=404, detail="Không có buổi học nào cho lớp này.")

    # 🔹 Lấy danh sách điểm danh của lớp
    attendance_records = (
        db.query(Attendance)
        .filter(Attendance.class_id == class_id)
        .all()
    )

    # 🔹 Kiểm tra nếu không có dữ liệu điểm danh
    if not attendance_records:
        raise HTTPException(status_code=404, detail="Không có dữ liệu điểm danh cho lớp này.")

    # 🔹 Chuyển đổi dữ liệu sang dạng danh sách
    attendance_list = [
        {
            "id": att.id,
            "class_id": att.class_id,
            "session_id": att.session_id,
            "student_id": att.student_id,
            "session_date": att.session_date,
            "status": att.status,
        }
        for att in attendance_records
    ]

    return attendance_list

