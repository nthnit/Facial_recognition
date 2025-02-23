from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from utils.security import (
    verify_password, 
    hash_password, 
    create_access_token, 
    create_refresh_token, 
    decode_access_token
)
from schemas.auth_schema import LoginRequest, LoginResponse, TokenResponse

from fastapi.responses import JSONResponse

router = APIRouter()

# 🔹 Đăng nhập & cấp token
@router.post("/login", response_model=LoginResponse)
def login(user_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Sai email hoặc mật khẩu")

    # 🔹 Tạo access token và refresh token
    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email, "role": user.role})

    # 🔹 Lưu refresh token vào database
    user.refresh_token = refresh_token
    db.commit()

    # 🔹 Gửi refresh token qua HttpOnly Cookie
    response = JSONResponse(content={
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "id": user.id,
    })
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Chỉ bật khi dùng HTTPS
        samesite="Lax"
    )

    return response

# 🔹 Làm mới access token
@router.post("/refresh-token", response_model=TokenResponse)
def refresh_token(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")  # Lấy token từ Cookie

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Không tìm thấy Refresh Token")

    payload = decode_access_token(refresh_token)
    email = payload.get("sub")

    user = db.query(User).filter(User.email == email, User.refresh_token == refresh_token).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Refresh token không hợp lệ")

    # 🔹 Tạo access token mới
    new_access_token = create_access_token({"sub": user.email, "role": user.role})

    return {"access_token": new_access_token, "token_type": "bearer"}

# 🔹 Đăng xuất (Xóa refresh token)
@router.post("/logout")
def logout(response: Response, db: Session = Depends(get_db), request: Request = None):
    refresh_token = request.cookies.get("refresh_token")
    
    if refresh_token:
        payload = decode_access_token(refresh_token)
        email = payload.get("sub")

        user = db.query(User).filter(User.email == email, User.refresh_token == refresh_token).first()
        if user:
            user.refresh_token = None  # Xóa refresh token khỏi database
            db.commit()

    # Xóa refresh token trong cookie
    response = JSONResponse(content={"message": "Đăng xuất thành công"})
    response.delete_cookie("refresh_token")

    return response

# 🔹 Lấy thông tin người dùng hiện tại
@router.get("/me")
def get_current_user(request: Request):
    user_data = request.state.user  # Lấy thông tin user từ middleware
    if not user_data:
        raise HTTPException(status_code=401, detail="Chưa xác thực")
    return {"user": user_data}
