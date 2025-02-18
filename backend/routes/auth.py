from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from utils.security import verify_password, create_access_token
from schemas.auth_schema import LoginRequest, LoginResponse

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(user_data: LoginRequest, db: Session = Depends(get_db)):
    # Tìm người dùng trong database theo email
    user = db.query(User).filter(User.email == user_data.email).first()
    
    # Kiểm tra email và mật khẩu
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")

    # Tạo access token
    access_token = create_access_token({"sub": user.email, "role": user.role})
    
    # Lưu token vào database
    user.access_token = access_token  # Cập nhật token vào cơ sở dữ liệu
    db.commit()  # Lưu thay đổi
    db.refresh(user)  # Làm mới đối tượng user từ database
    
    # Trả về thông tin người dùng kèm với access_token
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "id": user.id,
    }
