from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from models.class_model import Class
from schemas.teacher_schema import TeacherCreate, TeacherUpdate, TeacherResponse, ClassResponse
from typing import List
from utils.security import hash_password

router = APIRouter()

# 📌 **1. API: Lấy danh sách giáo viên**
@router.get("/", response_model=List[TeacherResponse])
def get_teachers(db: Session = Depends(get_db)):
    teachers = db.query(User).filter(User.role == "teacher").all()
    return teachers

# 📌 **2. API: Lấy thông tin giáo viên theo ID**
@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

# 📌 **3. API: Thêm mới giáo viên**
@router.post("/create", response_model=TeacherResponse)
def create_teacher(teacher_data: TeacherCreate, db: Session = Depends(get_db)):
    # Kiểm tra xem email đã tồn tại chưa
    existing_teacher = db.query(User).filter(User.email == teacher_data.email).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Mật khẩu mặc định khi tạo tài khoản giáo viên
    default_password = "Teacher123!"
    hashed_password = hash_password(default_password)

    new_teacher = User(
        email=teacher_data.email,
        full_name=teacher_data.full_name,
        password=hashed_password,
        phone_number=teacher_data.phone_number,
        role="teacher",
        date_of_birth=teacher_data.date_of_birth
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    
    return new_teacher

# 📌 **4. API: Cập nhật thông tin giáo viên**
@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(teacher_id: int, teacher_data: TeacherUpdate, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    teacher.full_name = teacher_data.full_name
    teacher.phone_number = teacher_data.phone_number
    teacher.date_of_birth = teacher_data.date_of_birth

    db.commit()
    db.refresh(teacher)

    return teacher

# 📌 **5. API: Xóa giáo viên**
@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()

    return {"detail": "Teacher deleted successfully"}

# 📌 **6. API: Lấy danh sách lớp học mà giáo viên đang giảng dạy**
@router.get("/{teacher_id}/classes", response_model=List[ClassResponse])
def get_teacher_classes(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher.classes  # Trả về danh sách lớp học mà giáo viên này dạy
