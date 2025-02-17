from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from schemas.user_schema import UserResponse  # Bạn cần định nghĩa schema UserResponse trong schemas/user_schema.py

router = APIRouter()

# API để lấy danh sách người dùng
@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

# API để lấy thông tin chi tiết người dùng
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
