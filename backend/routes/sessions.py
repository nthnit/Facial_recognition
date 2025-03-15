from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from models.grade_model import Grade
from models.session_student_model import SessionStudent
from models.session_model import Session as SessionModel
from models.student_model import Student
from models.class_model import Class
from models.attendance_model import Attendance
from schemas.attendance_schema import AttendanceResponse
from models.room_model import Room
from schemas.student_schema import StudentResponse
from schemas.session_schema import SessionResponse, SessionAttendanceResponse
# from schemas.grade_schema import GradeCreate, GradeUpdate, GradeResponse
from database.mysql import get_db
from models.user import User
from routes.user import get_current_user 


router = APIRouter()


@router.get("/{session_id}/students", response_model=List[StudentResponse])
def get_students_of_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền của người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách học sinh của tiết học")

    # Kiểm tra sự tồn tại của session
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")

    # Truy vấn học sinh tham gia tiết học này thông qua bảng SessionStudent
    students = (
        db.query(Student)
        .join(SessionStudent, SessionStudent.student_id == Student.id)
        .filter(SessionStudent.session_id == session_id)
        .all()
    )

    if not students:
        raise HTTPException(status_code=404, detail="Không có học sinh nào trong tiết học này")

    return students

# API lấy thông tin chi tiết của session theo ID
@router.get("/{session_id}/info", response_model=SessionResponse)
def get_session_info(session_id: int, db: Session = Depends(get_db)):
    # Kiểm tra nếu session có tồn tại
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Buổi học không tồn tại")

    # Lấy tên phòng học
    room_name = db.query(Room.room_name).filter(Room.id == session.room_id).first()
    room_name = room_name[0] if room_name else None
    
    # Lấy thông tin lớp học thông qua class_id (class_code)
    class_code = db.query(Class.class_code).filter(Class.id == session.class_id).first()
    class_code = class_code[0] if class_code else None

    # Lấy danh sách học sinh trong buổi học qua bảng SessionStudent
    students = (
        db.query(Student)
        .join(SessionStudent, SessionStudent.student_id == Student.id)
        .filter(SessionStudent.session_id == session_id)
        .all()
    )

    # Tính tỉ lệ điểm danh
    total_students = len(students)
    attendance_records = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    attendance_rate = (len([a for a in attendance_records if a.status == "Present"]) / total_students) * 100 if total_students > 0 else 0.0

    # Trả về thông tin chi tiết buổi học, bao gồm thông tin học sinh
    return SessionResponse(
        session_id=session.id,
        class_id=session.class_id,
        class_code=class_code, 
        # session_numer=index
        date=session.date,
        weekday=session.date.strftime("%A"),
        start_time=session.start_time.strftime("%H:%M"),
        end_time=session.end_time.strftime("%H:%M"),
        total_students=total_students,
        attendance_rate=attendance_rate,
        students=[StudentResponse.from_orm(student) for student in students],  # Lấy thông tin học sinh chi tiết
        room_name=room_name
    )

# API Lấy danh sách điểm danh của session theo session_id
@router.get("/{session_id}/attendance", response_model=List[SessionAttendanceResponse])
@router.get("/sessions/{session_id}/attendance", response_model=List[SessionAttendanceResponse])
def get_attendance_of_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem điểm danh của tiết học")

    # Kiểm tra sự tồn tại của session
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Tiết học không tồn tại")

    # Lấy danh sách điểm danh của học sinh trong session
    attendance_records = db.query(Attendance).filter(Attendance.session_id == session_id).all()

    # Nếu không có bản ghi điểm danh nào
    if not attendance_records:
        raise HTTPException(status_code=404, detail="Không có điểm danh cho tiết học này")

    # Trả về danh sách các bản ghi điểm danh của học sinh trong session, bao gồm thông tin chi tiết học sinh
    session_attendance = []
    for attendance in attendance_records:
        # Lấy thông tin học sinh từ bảng Student
        student = db.query(Student).filter(Student.id == attendance.student_id).first()
        
        if student:
            # Kết hợp thông tin điểm danh với thông tin học sinh và thêm vào danh sách trả về
            session_attendance.append(SessionAttendanceResponse(
                session_id=attendance.session_id,
                student_id=attendance.student_id,
                status=attendance.status,
                session_date=attendance.session_date,
                student_full_name=student.full_name,
                student_email=student.email
            ))

    return session_attendance
    



