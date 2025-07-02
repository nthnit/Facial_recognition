from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.student_model import Student
from models.user import User
from models.class_model import Class
from models.session_student_model import SessionStudent
from models.class_students_model import ClassStudent
from schemas.class_schema import ClassResponse
from schemas.student_schema import StudentCreate, StudentUpdate, StudentResponse
from models.session_model import Session as SessionModel
from models.attendance_model import Attendance
from schemas.session_schema import StudentSessionResponse
from typing import List
from routes.user import get_current_user  # Import xác thực user

router = APIRouter()

# 🟢 API GET: Lấy danh sách Student (chỉ Manager mới có quyền)
@router.get("/", response_model=List[StudentResponse])
def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách học sinh")

    students = db.query(Student).all()
    return students

# 🔵 API GET: Lấy thông tin Student theo ID
@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student

# 🟡 API POST: Thêm học sinh mới (chỉ Manager có quyền)
from deepface import DeepFace
import numpy as np
import cv2
import cloudinary
import cloudinary.uploader
from cloudinary.api import resource
import requests
from models.face_embeddings import FaceEmbedding
# Cấu hình Cloudinary sử dụng giá trị từ .env
cloudinary.config(
    cloud_name="djlyqcbjt",
    api_key="566599374368736",
    api_secret="Dp_vonlQ_41ws2R9PrXMGbyX1JM"
)


import json
from utils.image_processing import load_image_from_url, detect_and_crop_face, extract_face_embedding


@router.post("/", response_model=StudentResponse)
def create_student(
    student_data: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm học sinh")

    existing_student = db.query(Student).filter(Student.email == student_data.email).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    new_student = Student(
        full_name=student_data.full_name,
        email=student_data.email,
        phone_number=student_data.phone_number,
        address=student_data.address or "Chưa cập nhật",
        date_of_birth=student_data.date_of_birth or "2000-01-01",
        admission_year=student_data.admission_year or 2024,
        status=student_data.status,
        image=student_data.image_url  # Đường dẫn ảnh từ Cloudinary
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Nếu có ảnh, tiến hành xử lý khuôn mặt
    if new_student.image:
        try:
            img = load_image_from_url(new_student.image)
            face_img = detect_and_crop_face(img)
            embedding = extract_face_embedding(face_img)
            print(img)
            print(face_img)
            print(embedding)
            
            face_embedding = FaceEmbedding(
                student_id=new_student.id,
                embedding=json.dumps(embedding)
            )
            db.add(face_embedding)
            db.commit()
            print("✅ Đăng ký dữ liệu khuôn mặt thành công cho học sinh ID:", new_student.id)
        except Exception as e:
            print(f"⚠️ Lỗi khi đăng ký dữ liệu khuôn mặt: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý khuôn mặt: {e}")

    return new_student


# 🟠 API PUT: Cập nhật thông tin học sinh (chỉ Manager có quyền)
@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa thông tin học sinh")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    old_image_url = student.image
    new_image_url = student_data.image_url if "image_url" in student_data.dict(exclude_unset=True) else None

    # Nếu có ảnh mới và khác ảnh cũ thì xoá ảnh cũ trên Cloudinary trước khi cập nhật
    if new_image_url and new_image_url != old_image_url and old_image_url:
        try:
            public_id = old_image_url.split('/')[-1].split('.')[0]
            import cloudinary.uploader
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xoá ảnh cũ trên Cloudinary: {str(e)}")

    for key, value in student_data.dict(exclude_unset=True).items():
        if key != "image_url":
            setattr(student, key, value)
        if key == "image_url":
            student.image = value

    db.commit()
    db.refresh(student)

    # Nếu ảnh được cập nhật hoặc thay đổi, xử lý lại embedding
    if student.image and student.image != old_image_url:
        try:
            img = load_image_from_url(student.image)
            face_img = detect_and_crop_face(img)
            embedding = extract_face_embedding(face_img)
            db.query(FaceEmbedding).filter(FaceEmbedding.student_id == student_id).delete()
            face_embedding = FaceEmbedding(
                student_id=student_id,
                embedding=json.dumps(embedding)
            )
            db.add(face_embedding)
            db.commit()
            print("✅ Đăng ký lại dữ liệu khuôn mặt thành công cho học sinh ID:", student_id)
        except Exception as e:
            print(f"⚠️ Lỗi khi đăng ký dữ liệu khuôn mặt: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý khuôn mặt: {e}")

    return student



# 🔴 API DELETE: Xóa học sinh (chỉ Manager có quyền)
@router.delete("/{student_id}")
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa học sinh")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Xoá ảnh trên Cloudinary nếu có
    if student.image:
        try:
            image_url = student.image
            public_id = image_url.split('/')[-1].split('.')[0]  # Lấy public_id từ URL ảnh
            import cloudinary.uploader
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xoá ảnh trên Cloudinary: {str(e)}")

    db.delete(student)
    db.commit()
    return {"detail": "Student deleted successfully"}

# ✅ API: Lấy danh sách lớp học mà học sinh tham gia
@router.get("/{student_id}/classes", response_model=List[ClassResponse])
def get_student_classes(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách lớp học của học sinh")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # Truy vấn lớp học và thông tin giáo viên liên quan
    classes = (
        db.query(Class, User.full_name.label("teacher_name"))  # Thêm thông tin tên giáo viên
        .join(ClassStudent, Class.id == ClassStudent.class_id)
        .join(User, User.id == Class.teacher_id)  # Kết hợp với bảng Teacher để lấy tên giáo viên
        .filter(ClassStudent.student_id == student_id)
        .all()
    )

    # ✅ Chuyển đổi weekly_schedule từ chuỗi hoặc None sang danh sách số nguyên
    return [
        ClassResponse(
            id=class_obj.id,
            class_code=class_obj.class_code,
            name=class_obj.name,
            subject=class_obj.subject,
            teacher_id=class_obj.teacher_id,
            teacher_name=teacher_name,  # Trả về tên giáo viên
            start_date=class_obj.start_date,
            end_date=class_obj.end_date,
            total_sessions=class_obj.total_sessions,
            status=class_obj.status,
            weekly_schedule=[int(day) for day in class_obj.weekly_schedule.split(",")] if class_obj.weekly_schedule else []
        )
        for class_obj, teacher_name in classes  # Lấy cả thông tin lớp học và tên giáo viên từ kết quả truy vấn
    ]

    

# API lấy danh sách buổi học (sessions) của học sinh

@router.get("/{student_id}/sessions", response_model=List[StudentSessionResponse])
def get_student_sessions(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách buổi học của học sinh")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # Thay vì lấy từ ClassStudent, ta lấy từ SessionStudent để truy vấn các buổi học của học sinh
    sessions = (
        db.query(SessionModel, Class.name.label("class_name"), Class.class_code.label("class_code"))
        .join(SessionStudent, SessionModel.id == SessionStudent.session_id)
        .join(Class, Class.id == SessionModel.class_id)
        .filter(SessionStudent.student_id == student_id)
        .order_by(SessionModel.date.asc())
        .all()
    )

    session_list = []
    for session, class_name, class_code in sessions:
        attendance_record = (
            db.query(Attendance.status)
            .filter(Attendance.session_id == session.id, Attendance.student_id == student_id)
            .scalar()
        )

        total_present = (
            db.query(Attendance)
            .filter(Attendance.session_id == session.id, Attendance.status == "Present")
            .count()
        )

        total_students = (
            db.query(SessionStudent)
            .filter(SessionStudent.session_id == session.id)
            .count()
        )

        attendance_rate = (total_present / total_students * 100) if total_students > 0 else 0

        session_list.append(StudentSessionResponse(
            session_id=session.id,
            class_id=session.class_id,
            class_name=class_name,
            class_code=class_code, 
            date=session.date,
            weekday=session.date.strftime("%A"),
            start_time=session.start_time.strftime("%H:%M"),
            end_time=session.end_time.strftime("%H:%M"),
            attendance_status=attendance_record or "Absent",
            attendance_rate=round(attendance_rate, 2)
        ))

    return session_list



# API tìm kiếm học sinh
@router.get("/studentlist/search", response_model=List[StudentResponse])
def search_students(
    query: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Xác thực người dùng
):
    # Kiểm tra quyền của người dùng
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền tìm kiếm học sinh")

    # Tìm kiếm học sinh theo tên, email hoặc mã học sinh
    results = db.query(Student).filter(
        (Student.full_name.ilike(f"%{query}%")) |
        (Student.email.ilike(f"%{query}%")) |
        (Student.id.ilike(f"%{query}%"))
    ).all()
    
    return results