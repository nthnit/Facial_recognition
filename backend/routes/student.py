from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.student_model import Student
from models.user import User
from schemas.student_schema import StudentCreate, StudentUpdate, StudentResponse
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
@router.post("/", response_model=StudentResponse)
def create_student(
    student_data: StudentCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
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
        address=student_data.address,
        date_of_birth=date_of_birth,
        admission_year=student_data.admission_year if student_data.admission_year else 2024,
        status=student_data.status,
        image=student_data.image
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
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

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in student_data.dict(exclude_unset=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
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
