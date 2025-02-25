from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

# Schema để tạo mới sinh viên
class StudentCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    address: Optional[str] = "Chưa cập nhật"
    date_of_birth: Optional[date] = None
    admission_year: Optional[int] = None  # Để None nếu không có
    status: Optional[str] = "active"
    image_url: Optional[str] = None

# Schema để cập nhật sinh viên
class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    admission_year: Optional[int] = None
    status: Optional[str] = None
    image_url: Optional[str] = None

# Schema để trả về thông tin sinh viên
class StudentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    admission_year: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    image: Optional[str] = None

    class Config:
        from_attributes = True  # Hỗ trợ lấy từ SQLAlchemy model
