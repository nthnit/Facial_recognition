from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.attendance_model import Attendance
from models.class_students_model import ClassStudent
from models.class_model import Class
from models.student_model import Student
from schemas.attendance_schema import AttendanceCreate, AttendanceResponse
from typing import List
from routes.user import get_current_user

router = APIRouter()

# 🟢 **1. API: Lấy danh sách điểm danh của một buổi học**
@router.get("/sessions/{session_id}/attendance", response_model=List[AttendanceResponse])
def get_attendance_by_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem điểm danh.")

    attendance_records = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    return attendance_records


# 🟢 **2. API: Cập nhật điểm danh cho một buổi học**
@router.post("/sessions/{session_id}/attendance")
def update_attendance(
    session_id: int,
    attendance_data: List[AttendanceCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật điểm danh.")

    for record in attendance_data:
        existing_attendance = db.query(Attendance).filter(
            Attendance.session_id == session_id,
            Attendance.student_id == record.student_id
        ).first()

        if existing_attendance:
            existing_attendance.present = record.present
        else:
            new_attendance = Attendance(
                session_id=session_id,
                student_id=record.student_id,
                present=record.present
            )
            db.add(new_attendance)

    db.commit()
    return {"message": "Cập nhật điểm danh thành công"}


# 🟢 **3. API: Lấy danh sách điểm danh theo lớp học**
@router.get("/classes/{class_id}/attendance", response_model=List[AttendanceResponse])
def get_attendance_by_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem điểm danh.")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại.")

    attendance_records = db.query(Attendance).join(ClassStudent, Attendance.student_id == ClassStudent.student_id)\
        .filter(ClassStudent.class_id == class_id).all()

    return attendance_records
