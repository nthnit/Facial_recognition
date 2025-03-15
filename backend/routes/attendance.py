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



from fastapi import APIRouter, Depends, HTTPException, Query
from models.student_model import Student
from models.face_embeddings import FaceEmbedding
from models.attendance_model import Attendance
from models.session_model import Session as SessionModel
from models.class_model import Class
import base64
import requests
import numpy as np
import cv2
from deepface import DeepFace
from datetime import date
from pydantic import ValidationError
from schemas.face_attendance_schema import FaceAttendanceRequest, FaceAttendanceResponse, FaceAttendanceErrorResponse

router = APIRouter()




@router.post("/face-attendance", response_model=FaceAttendanceResponse, responses={404: {"model": FaceAttendanceErrorResponse}, 422: {"model": FaceAttendanceErrorResponse}})
async def face_attendance(
    request: FaceAttendanceRequest,  # Chỉ sử dụng Pydantic model trong body
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["teacher", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện điểm danh")

    try:
        # Log dữ liệu nhận được để debug
        print("Received face attendance request:", request.dict())

        # Giải mã base64 thành ảnh
        img_data = request.image
        nparr = np.frombuffer(base64.b64decode(img_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Trích xuất vector đặc trưng từ ảnh mới
        new_embedding = DeepFace.represent(img, model_name="Facenet")[0]["embedding"]
        print(new_embedding)

        # Lấy tất cả vector đặc trưng từ bảng face_embeddings
        face_embeddings = db.query(FaceEmbedding).all()

        # So sánh với từng embedding trong database
        matched_student = None
        min_distance = float('inf')
        

        for embedding in face_embeddings:
            stored_embedding = eval(embedding.embedding)  # Chuyển chuỗi JSON thành list
            distance = np.linalg.norm(np.array(new_embedding) - np.array(stored_embedding))
            if distance < 3.9:  # Ngưỡng khoảng cách (có thể điều chỉnh)
                if distance < min_distance:
                    min_distance = distance
                    matched_student = db.query(Student).filter(Student.id == embedding.student_id).first()

        if matched_student:
            # Kiểm tra lớp học và buổi học
            class_obj = db.query(Class).filter(Class.id == request.class_id).first()
            if not class_obj:
                raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

            session = db.query(SessionModel).filter(
                SessionModel.class_id == request.class_id,
                SessionModel.date == request.session_date
            ).first()
            if not session:
                raise HTTPException(status_code=404, detail="Buổi học không tồn tại")

            # Kiểm tra xem học sinh đã điểm danh chưa trong buổi học này
            existing_attendance = db.query(Attendance).filter(
                Attendance.class_id == request.class_id,
                Attendance.session_id == session.id,
                Attendance.student_id == matched_student.id
            ).first()

            
            if existing_attendance:
                # Nếu học sinh đã có bản ghi điểm danh, cập nhật trạng thái
                print("Học sinh đã điểm danh rồi, cập nhật bản ghi điểm danh.")
                existing_attendance.status = "Present" 
                existing_attendance.session_date = request.session_date  
                db.commit()  
                return FaceAttendanceResponse(student_id=matched_student.id, full_name=matched_student.full_name)

            # Ghi nhận điểm danh vào bảng attendance
            attendance = Attendance(
                class_id=request.class_id,
                session_id=session.id,
                student_id=matched_student.id,
                session_date=request.session_date,
                status="Present"
            )
            db.add(attendance)
            db.commit()

            return FaceAttendanceResponse(student_id=matched_student.id, full_name=matched_student.full_name)
        else:
            raise HTTPException(status_code=404, detail="Không tìm thấy học sinh phù hợp")

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e.errors()))
    except Exception as e:
        print(f"⚠️ Lỗi khi xử lý điểm danh: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý điểm danh: {str(e)}")
