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

from typing import List
import pandas as pd
from fastapi.responses import FileResponse
import os
from datetime import datetime, timedelta
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
    if current_user.role not in ["admin", "manager"]:
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

    # Tính toán số buổi học (sessions)
    start_date = class_data.start_date
    total_sessions = class_data.total_sessions
    weekly_schedule = class_data.weekly_schedule  # Danh sách các thứ học trong tuần, ví dụ: [0, 2, 4]
    
    # Tính toán ngày kết thúc (end_date)
    current_date = start_date
    sessions_count = 0

    while sessions_count < total_sessions:
        if current_date.weekday() in weekly_schedule:  # Kiểm tra xem ngày hiện tại có trong lịch học không
            sessions_count += 1
        current_date += timedelta(days=1)

    end_date = current_date - timedelta(days=1)  # Đặt end_date là ngày cuối cùng của buổi học

    # Tạo mã lớp học tự động "CLASS{id}"
    new_class_code = f"CLASS{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"  # Tạo mã lớp tự động theo thời gian

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
        weekly_schedule=",".join(map(str, weekly_schedule))  # Lưu danh sách các thứ học vào bảng dưới dạng chuỗi
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

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
        weekly_schedule=[int(day) for day in new_class.weekly_schedule.split(",")]  # ✅ Chuyển chuỗi thành List[int]
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

    # Nếu `start_date`, `total_sessions`, hoặc `weekly_schedule` thay đổi → tính lại `end_date`
    if "start_date" in update_data or "total_sessions" in update_data or "weekly_schedule" in update_data:
        start_date = class_obj.start_date
        total_sessions = class_obj.total_sessions

        # Chuyển đổi `weekly_schedule` thành danh sách số nguyên
        weekly_schedule = [int(day) for day in class_obj.weekly_schedule.split(",")]

        # Tính toán lại `end_date`
        current_date = start_date
        sessions_count = 0

        while sessions_count < total_sessions:
            if current_date.weekday() in weekly_schedule:
                sessions_count += 1
            current_date += timedelta(days=1)

        class_obj.end_date = current_date - timedelta(days=1)  # Ngày cuối cùng của buổi học

    # Lưu thay đổi vào database
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
    current_user = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách buổi học")

    # 🔹 Lấy thông tin lớp học
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    # 🔹 Giải mã weekly_schedule
    weekly_schedule = [int(day) for day in class_obj.weekly_schedule.split(",")] if class_obj.weekly_schedule else []
    
    # 🔹 Tạo danh sách buổi học
    current_date = class_obj.start_date
    sessions = []
    session_count = 0

    while session_count < class_obj.total_sessions and current_date <= class_obj.end_date:
        if current_date.weekday() in weekly_schedule:
            # 🔹 Lấy danh sách học sinh của lớp
            students = (
                db.query(Student)
                .join(ClassStudent, Student.id == ClassStudent.student_id)
                .filter(ClassStudent.class_id == class_id)
                .all()
            )

            # 🔹 Lấy danh sách điểm danh của buổi học
            attendance_records = (
                db.query(Attendance)
                .filter(Attendance.class_id == class_id, Attendance.session_date == current_date)
                .all()
            )

            # 🔹 Tính tỉ lệ điểm danh
            attendance_rate = (
                len([a for a in attendance_records if a.status == "Present"]) / len(students)
                if students else 0
            )

            # 🔹 Thêm buổi học vào danh sách
            sessions.append({
                "session_number": session_count + 1,
                "date": current_date,
                "weekday": current_date.strftime("%A"),
                "start_time": "19:30",  # 🔹 Cố định giờ học, có thể thay đổi theo lớp
                "end_time": "21:30",
                "total_students": len(students),
                "attendance_rate": round(attendance_rate * 100, 2),
                "students": [{"id": s.id, "full_name": s.full_name} for s in students],
            })
            session_count += 1
        current_date += timedelta(days=1)

    return sessions


# API: Cập nhật điểm danh cho một buổi học
@router.post("/{class_id}/sessions/{session_date}/attendance")
def update_attendance(
    class_id: int,
    session_date: str,
    attendance_data: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin","manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật điểm danh.")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại.")

    for record in attendance_data:
        if record.class_id != class_id:
            raise HTTPException(status_code=400, detail="Dữ liệu không hợp lệ. class_id không khớp.")

        existing_attendance = db.query(Attendance).filter(
            Attendance.class_id == class_id,
            Attendance.session_date == session_date,
            Attendance.student_id == record.student_id
        ).first()

        if existing_attendance:
            existing_attendance.status = record.status
        else:
            new_attendance = Attendance(
                class_id=class_id,
                session_date=session_date,
                student_id=record.student_id,
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