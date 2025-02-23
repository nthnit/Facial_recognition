from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
import cloudinary.uploader
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from utils.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Middleware xác thực token và lấy user hiện tại
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User không tồn tại")

    return user

# API upload ảnh lên Cloudinary (Chỉ dành cho Admin & Manager)
@router.post("/upload-image/")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Chỉ cho phép Admin và Manager upload ảnh
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền upload ảnh")

    try:
        # Upload ảnh lên Cloudinary
        upload_result = cloudinary.uploader.upload(file.file)
        
        # Lấy URL từ Cloudinary
        image_url = upload_result.get("secure_url")

        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi upload ảnh: {str(e)}")
