from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.student_model import Student
from models.user import User
from models.class_model import Class
from models.news_model import News
from routes.user import get_current_user  # Import hàm lấy user hiện tại

router = APIRouter()

@router.get("/stats", response_model=dict)
def get_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)  # Kiểm tra quyền truy cập
):
    # Chỉ cho phép Manager truy cập
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập thống kê")

    try:
        # Lấy số lượng học sinh từ bảng students
        student_count = db.query(Student).count()

        # Lấy số lượng giáo viên từ bảng users với điều kiện role = "teacher"
        teacher_count = db.query(User).filter(User.role == "teacher").count()

        # Lấy số lượng lớp học từ bảng classes
        class_count = db.query(Class).count()

        # Lấy số lượng bài viết từ bảng news
        news_count = db.query(News).count()

        # Trả về thông tin thống kê
        return {
            "students": student_count,
            "teachers": teacher_count,
            "classes": class_count,
            "news": news_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")
