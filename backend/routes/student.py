from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.student_model import Student
from models.user import User
from models.class_model import Class
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

# 🟡 API POST: Thêm học sinh mới (chỉ Manager có quyền)
@router.post("/", response_model=StudentResponse)
def create_student(
    student_data: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    print("📥 Received Payload:", student_data.dict())
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm học sinh")

    existing_student = db.query(Student).filter(Student.email == student_data.email).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    date_of_birth = student_data.date_of_birth if student_data.date_of_birth else "2000-01-01"

    new_student = Student(
        full_name=student_data.full_name,
        email=student_data.email,
        phone_number=student_data.phone_number,
        address=student_data.address or "Chưa cập nhật",  # ✅ Đảm bảo không bị NULL
        date_of_birth=date_of_birth,
        admission_year=student_data.admission_year if student_data.admission_year else 2024,
        status=student_data.status,
        image=student_data.image_url  # Lưu đường dẫn ảnh từ Cloudinary
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    print(new_student.image)
    # 🔹 Đăng ký dữ liệu khuôn mặt ngay sau khi thêm học sinh
    if new_student.image:  # Nếu có ảnh
        try:
            # Lấy ảnh từ Cloudinary
            response = requests.get(new_student.image, stream=True)
            img_data = response.content

            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Không thể tải ảnh từ Cloudinary")

            # Chuyển dữ liệu hình ảnh thành mảng numpy
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Trích xuất vector đặc trưng bằng DeepFace
            result = DeepFace.represent(img, model_name="Facenet")
            embedding = result[0]["embedding"]  # Lấy vector đặc trưng từ phần tử đầu tiên

            # Lưu vector đặc trưng vào bảng face_embeddings
            face_embedding = FaceEmbedding(
                student_id=new_student.id,
                embedding=str(embedding)  # Lưu dưới dạng chuỗi
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
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa thông tin học sinh")

    # Kiểm tra xem học sinh có tồn tại không
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

    # ✅ In ra payload để kiểm tra
    print("📥 Payload received:", student_data.dict(exclude_unset=True))

    # ✅ Lưu giá trị cũ của image để so sánh
    old_image_url = student.image

    # ✅ Cập nhật tất cả các trường, xử lý image_url riêng
    for key, value in student_data.dict(exclude_unset=True).items():
        if key != "image_url":  # Ignore `image_url`, handle separately
            setattr(student, key, value)
        # Cập nhật image_url nếu có trong payload
        if key == "image_url":
            student.image = value

    # ✅ Kiểm tra nếu `image_url` không có trong `student_data`, giữ nguyên giá trị cũ
    if "image_url" not in student_data.dict(exclude_unset=True):
        student.image = student.image  # Giữ nguyên đường dẫn cũ

    db.commit()
    db.refresh(student)

    # ✅ In ra để debug sau khi cập nhật
    print("✅ Cập nhật thành công:", student.image)

    # 🔹 Đăng ký lại dữ liệu khuôn mặt nếu image_url được cập nhật hoặc khác với giá trị cũ
    if student.image and student.image != old_image_url:  # Nếu có ảnh mới hoặc ảnh đã thay đổi
        try:
            # Lấy ảnh từ URL (Cloudinary)
            response = requests.get(student.image, stream=True, timeout=10)
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Không thể tải ảnh từ Cloudinary")

            img_data = response.content
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Trích xuất vector đặc trưng bằng DeepFace
            result = DeepFace.represent(img, model_name="Facenet")
            embedding = result[0]["embedding"]  # Lấy vector đặc trưng từ phần tử đầu tiên

            # Xóa embedding cũ (nếu có) để tránh trùng lặp
            db.query(FaceEmbedding).filter(FaceEmbedding.student_id == student_id).delete()

            # Lưu vector đặc trưng mới vào bảng face_embeddings
            face_embedding = FaceEmbedding(
                student_id=student_id,
                embedding=str(embedding)  # Lưu dưới dạng chuỗi
            )
            db.add(face_embedding)
            db.commit()
            print("✅ Đăng ký lại dữ liệu khuôn mặt thành công cho học sinh ID:", student_id)
        except requests.RequestException as e:
            print(f"⚠️ Lỗi khi tải ảnh từ Cloudinary: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi tải ảnh từ Cloudinary: {str(e)}")
        except Exception as e:
            print(f"⚠️ Lỗi khi đăng ký dữ liệu khuôn mặt: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý khuôn mặt: {str(e)}")

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

    classes = (
        db.query(Class)
        .join(ClassStudent, Class.id == ClassStudent.class_id)
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
            start_date=class_obj.start_date,
            end_date=class_obj.end_date,
            total_sessions=class_obj.total_sessions,
            status= class_obj.status,
            weekly_schedule=[int(day) for day in class_obj.weekly_schedule.split(",")] if class_obj.weekly_schedule else []
        )
        for class_obj in classes
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

    sessions = (
        db.query(SessionModel, Class.name.label("class_name"), Class.class_code.label("class_code"))
        .join(ClassStudent, SessionModel.class_id == ClassStudent.class_id)
        .join(Class, Class.id == SessionModel.class_id)
        .filter(ClassStudent.student_id == student_id)
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
            db.query(ClassStudent)
            .filter(ClassStudent.class_id == session.class_id)
            .count()
        )

        attendance_rate = (total_present / total_students * 100) if total_students > 0 else 0

        session_list.append(StudentSessionResponse(
            session_id=session.id,
            class_id=session.class_id,
            class_name=class_name,
            class_code=class_code,  # ✅ Thêm class_code
            date=session.date,
            weekday=session.date.strftime("%A"),
            start_time=session.start_time.strftime("%H:%M"),
            end_time=session.end_time.strftime("%H:%M"),
            attendance_status=attendance_record or "Absent",
            attendance_rate=round(attendance_rate, 2)
        ))

    return session_list


# API search
@router.get("/search", response_model=List[StudentResponse])
def search_students(query: str, db: Session = Depends(get_db)):
    # Tìm kiếm học sinh theo tên, email hoặc mã học sinh
    results = db.query(Student).filter(
        (Student.full_name.ilike(f"%{query}%")) |
        (Student.email.ilike(f"%{query}%")) |
        (Student.id.ilike(f"%{query}%"))
    ).all()
    
    return results