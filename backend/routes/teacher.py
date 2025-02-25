from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from models.class_model import Class
from schemas.teacher_schema import TeacherCreate, TeacherUpdate, TeacherResponse
from schemas.class_schema import ClassResponse
from typing import List
from utils.security import hash_password
from routes.user import get_current_user  # ✅ Import xác thực user

router = APIRouter()

# 📌 **1. API: Lấy danh sách giáo viên (Chỉ Manager hoặc Admin có quyền)**
@router.get("/", response_model=List[TeacherResponse])
def get_teachers(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập danh sách giáo viên")

    teachers = db.query(User).filter(User.role == "teacher").all()
    return teachers

# 📌 **2. API: Lấy thông tin giáo viên theo ID (Chỉ Manager hoặc Admin có quyền)**
@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem thông tin giáo viên")

    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher

# 📌 **3. API: Thêm mới giáo viên (Admin và Manager đều có quyền)**
@router.post("/create", response_model=TeacherResponse)
def create_teacher(
    teacher_data: TeacherCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm giáo viên")

    # Kiểm tra email đã tồn tại chưa
    existing_teacher = db.query(User).filter(User.email == teacher_data.email).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Email already exists")

    # ✅ Đảm bảo date_of_birth không bị NULL
    date_of_birth = teacher_data.date_of_birth if teacher_data.date_of_birth else "2000-01-01"

    # Mật khẩu mặc định khi tạo tài khoản giáo viên
    default_password = "Teacher123!"
    hashed_password = hash_password(default_password)

    new_teacher = User(
        email=teacher_data.email,
        full_name=teacher_data.full_name,
        password=hashed_password,
        phone_number=teacher_data.phone_number,
        role="teacher",
        date_of_birth=date_of_birth  # ✅ Gán giá trị mặc định nếu NULL
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    
    return new_teacher


# 📌 **4. API: Cập nhật thông tin giáo viên (Admin và Manager đều có quyền)**
@router.put("/{teacher_id}", response_model=TeacherResponse)
def update_teacher(
    teacher_id: int, 
    teacher_data: TeacherUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:  # ✅ Cho phép cả Admin & Manager
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa thông tin giáo viên")

    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    teacher.full_name = teacher_data.full_name
    teacher.phone_number = teacher_data.phone_number
    teacher.date_of_birth = teacher_data.date_of_birth

    db.commit()
    db.refresh(teacher)

    return teacher

# 📌 **5. API: Xóa giáo viên (Admin và Manager đều có quyền)**
@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:  # ✅ Cho phép cả Admin & Manager
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa giáo viên")

    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()

    return {"detail": "Teacher deleted successfully"}

# 📌 **6. API: Lấy danh sách lớp học mà giáo viên đang giảng dạy**
@router.get("/{teacher_id}/classes", response_model=List[ClassResponse])
def get_teacher_classes(
    teacher_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Chỉ cho phép admin, manager hoặc chính giáo viên xem danh sách lớp học
    if current_user.role not in ["admin", "manager", "teacher"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách lớp của giáo viên")

    teacher = db.query(User).filter(User.id == teacher_id, User.role == "teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Lấy danh sách lớp mà giáo viên đang giảng dạy
    classes = db.query(Class).filter(Class.teacher_id == teacher_id).all()

    return [
        ClassResponse(
            id=class_obj.id,
            class_code=class_obj.class_code,
            name=class_obj.name,
            teacher_id=class_obj.teacher_id,
            teacher_name=teacher.full_name,
            start_date=class_obj.start_date,
            end_date=class_obj.end_date,
            total_sessions=class_obj.total_sessions,
            subject=class_obj.subject,
            status=class_obj.status,
            weekly_schedule=[int(day) for day in class_obj.weekly_schedule.split(",")] if class_obj.weekly_schedule else []
        )
        for class_obj in classes
    ]
