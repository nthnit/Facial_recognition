from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user_schema import UserCreateRequest, UserResponse  # Import schema từ user_schema.py
from utils.security import hash_password
from typing import List

router = APIRouter()

# API GET: Lấy danh sách người dùng
@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

# API GET: Lấy thông tin chi tiết người dùng
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# API POST: Thêm người dùng mới
@router.post("/create", response_model=UserResponse)
def create_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    # Kiểm tra xem email đã tồn tại chưa
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    # Mật khẩu mặc định
    default_password = "Active123!"
    hashed_password = hash_password(default_password)

    # Tạo người dùng mới
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        full_name=user_data.full_name,
        date_of_birth=user_data.date_of_birth,  # Thêm date_of_birth vào
        phone_number=user_data.phone_number
    )

    # Thêm người dùng vào cơ sở dữ liệu
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Để lấy thông tin vừa thêm vào

    return new_user

# API PUT: Cập nhật thông tin người dùng
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserCreateRequest, db: Session = Depends(get_db)):
    # Tìm người dùng trong cơ sở dữ liệu
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Cập nhật các trường thông tin
    user.email = user_data.email
    user.role = user_data.role
    user.full_name = user_data.full_name
    user.date_of_birth = user_data.date_of_birth
    user.phone_number=user_data.phone_number

    db.commit()
    db.refresh(user)
    
    return user

# API DELETE: Xóa người dùng
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # Tìm người dùng trong cơ sở dữ liệu
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    
    return {"detail": "User deleted successfully"}



# # API GET: Kiểm tra xem email đã tồn tại chưa
# @router.get("/check-email")
# def check_email(email: str, db: Session = Depends(get_db)):
#     existing_user = db.query(User).filter(User.email == email).first()
#     if existing_user:
#         return {"exists": True}
#     return {"exists": False}


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return {"exists": True}  # Trả về True nếu email đã tồn tại
    return {"exists": False}  # Trả về False nếu email chưa tồn tại




