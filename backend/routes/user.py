from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from models.user import User
from schemas.user_schema import UserCreateRequest, UserResponse, ChangePasswordRequest
from utils.security import hash_password, decode_access_token, verify_password
from typing import List

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 🔹 Middleware kiểm tra token và lấy user hiện tại
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    return user

# 🔹 API GET: Lấy danh sách người dùng (Yêu cầu xác thực)
@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(User).all()

# 🔹 API GET: Lấy thông tin chi tiết người dùng (Yêu cầu xác thực)
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")
    return user

# 🔹 API POST: Thêm người dùng mới (Yêu cầu xác thực)
@router.post("/create", response_model=UserResponse)
def create_user(user_data: UserCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Kiểm tra quyền admin trước khi tạo user
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền tạo người dùng")

    # Kiểm tra email trùng lặp
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")

    # Mật khẩu mặc định
    default_password = "Active123!"
    hashed_password = hash_password(default_password)

    # Tạo user mới
    new_user = User(
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        full_name=user_data.full_name,
        date_of_birth=user_data.date_of_birth,
        phone_number=user_data.phone_number
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# 🔹 API PUT: Cập nhật thông tin người dùng (Yêu cầu xác thực)
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    # Kiểm tra quyền (Admin mới có thể chỉnh sửa người khác)
    if current_user.role != "admin" and current_user.id != user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa thông tin người dùng khác")
    
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)

    return user

# 🔹 API DELETE: Xóa người dùng (Yêu cầu xác thực)
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    # Chỉ Admin mới có quyền xóa user
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa người dùng")

    db.delete(user)
    db.commit()

    return {"detail": "Người dùng đã được xóa thành công"}

# 🔹 API GET: Kiểm tra email có tồn tại không (Không yêu cầu xác thực)
@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    return {"exists": bool(user)}

# 🔹 API GET: Lấy thông tin user hiện tại từ token (Yêu cầu xác thực)
@router.get("/user/info")
def get_user_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "date_of_birth": current_user.date_of_birth
    }

# 🔹 API PUT: Đổi mật khẩu người dùng (Yêu cầu xác thực)
@router.put("/{user_id}/change-password", response_model=UserResponse)
def change_password(
    user_id: int,
    change_password_request: ChangePasswordRequest,  # Thay đổi đây
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra xem user_id có phải là người dùng hiện tại hoặc admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền đổi mật khẩu của người khác")

    # Kiểm tra mật khẩu cũ
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    if not verify_password(change_password_request.old_password, user.password):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác")

    # Mã hóa mật khẩu mới và lưu vào cơ sở dữ liệu
    hashed_new_password = hash_password(change_password_request.new_password)
    user.password = hashed_new_password

    db.commit()
    db.refresh(user)

    return user