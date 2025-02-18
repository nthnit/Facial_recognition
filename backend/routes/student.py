from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.student_model import Student
from schemas.student_schema import StudentCreate, StudentUpdate, StudentResponse
from typing import List

router = APIRouter()

# 🟢 API GET: Lấy danh sách Student
@router.get("/", response_model=List[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students

# 🔵 API GET: Lấy thông tin Student theo ID
@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# 🟡 API POST: Thêm Student mới
@router.post("/", response_model=StudentResponse)
def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    # Kiểm tra email có tồn tại không
    existing_student = db.query(Student).filter(Student.email == student_data.email).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    new_student = Student(**student_data.dict())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

# 🟠 API PUT: Cập nhật thông tin Student theo ID
@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for key, value in student_data.dict(exclude_unset=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student

# 🔴 API DELETE: Xóa Student theo ID
@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"detail": "Student deleted successfully"}
