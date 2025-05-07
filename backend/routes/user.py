from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from models.user import User
from schemas.user_schema import UserCreateRequest, UserResponse, ChangePasswordRequest
from utils.security import hash_password, decode_access_token, verify_password
from typing import List
import pandas as pd
from io import BytesIO

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
        "date_of_birth": current_user.date_of_birth,
        "address": current_user.address,
        "avatar_url": current_user.avatar_url,
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


# 🔹 API POST: Reset mật khẩu người dùng (Yêu cầu xác thực)
@router.post("/{user_id}/reset-password")
def reset_password(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện thao tác này")

    # Lấy người dùng cần reset mật khẩu
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    # Cập nhật mật khẩu thành "Active123!"
    new_password = "Active123!"
    hashed_password = hash_password(new_password)
    user.password = hashed_password

    db.commit()
    db.refresh(user)

    return {"detail": "Mật khẩu đã được reset thành công"}

# 🔹 API POST: Tạo nhiều người dùng từ file Excel (Yêu cầu xác thực)
@router.post("/bulk-create")
async def create_users_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kiểm tra quyền admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền thực hiện thao tác này")

    # Kiểm tra định dạng file
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="File không đúng định dạng. Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV")

    try:
        # Đọc file Excel/CSV
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents), encoding='utf-8')
        else:
            df = pd.read_excel(BytesIO(contents))

        # Chuyển đổi tên cột thành chữ thường
        df.columns = df.columns.str.lower()

        # Kiểm tra các cột bắt buộc
        required_columns = ['full_name', 'email', 'phone_number', 'role', 'date_of_birth']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Thiếu các cột bắt buộc: {', '.join(missing_columns)}"
            )

        # Mật khẩu mặc định
        default_password = "Active123!"
        hashed_password = hash_password(default_password)

        success_count = 0
        error_count = 0
        errors = []

        # Xử lý từng dòng trong file
        for index, row in df.iterrows():
            try:
                # Kiểm tra dữ liệu trống
                if pd.isna(row['email']) or pd.isna(row['full_name']) or pd.isna(row['phone_number']) or pd.isna(row['role']) or pd.isna(row['date_of_birth']):
                    error_count += 1
                    errors.append(f"Dòng {index + 2}: Thiếu thông tin bắt buộc")
                    continue

                # Chuyển đổi ngày sinh thành định dạng chuẩn
                try:
                    if isinstance(row['date_of_birth'], str):
                        date_of_birth = pd.to_datetime(row['date_of_birth']).date()
                    else:
                        date_of_birth = row['date_of_birth'].date()
                except:
                    error_count += 1
                    errors.append(f"Dòng {index + 2}: Định dạng ngày sinh không hợp lệ")
                    continue

                # Kiểm tra email trùng lặp
                existing_user = db.query(User).filter(User.email == row['email']).first()
                if existing_user:
                    error_count += 1
                    errors.append(f"Dòng {index + 2}: Email {row['email']} đã tồn tại")
                    continue

                # Kiểm tra vai trò hợp lệ
                valid_roles = ['teacher', 'manager', 'admin']
                if row['role'] not in valid_roles:
                    error_count += 1
                    errors.append(f"Dòng {index + 2}: Vai trò không hợp lệ. Chỉ chấp nhận: {', '.join(valid_roles)}")
                    continue

                # Tạo user mới
                new_user = User(
                    email=row['email'].strip(),
                    password=hashed_password,
                    role=row['role'].strip(),
                    full_name=row['full_name'].strip(),
                    date_of_birth=date_of_birth,
                    phone_number=str(row['phone_number']).strip()
                )

                db.add(new_user)
                success_count += 1

            except Exception as e:
                error_count += 1
                errors.append(f"Dòng {index + 2}: {str(e)}")

        # Commit tất cả các thay đổi
        db.commit()

        return {
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi khi xử lý file: {str(e)}")
