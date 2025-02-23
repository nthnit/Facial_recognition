from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# Schema để tạo lớp mới
class ClassCreate(BaseModel):
    name: str
    teacher_id: Optional[int] = None
    start_date: date
    total_sessions: int
    subject: Optional[str] = None
    status: Optional[str] = None
    weekly_schedule: Optional[List[int]] = None

# Schema để cập nhật lớp học
class ClassUpdate(BaseModel):
    name: Optional[str] = None
    teacher_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_sessions: Optional[int] = None
    subject: Optional[str] = None
    status: Optional[str] = None
    class_code: Optional[str] = None
    weekly_schedule: Optional[List[int]] = None 

# Schema để trả về thông tin lớp học
class ClassResponse(BaseModel):
    id: int
    class_code: str
    name: str
    teacher_id: Optional[int]  # ✅ Giữ teacher_id để tránh lỗi
    teacher_name: Optional[str] = None  # ✅ Thêm teacher_name để hiển thị tên giáo viên
    start_date: date
    end_date: date
    total_sessions: int
    subject: str
    status: str
    weekly_schedule: Optional[List[int]] = None  # ✅ Thêm lịch học vào response

    class Config:
        from_attributes = True  # ✅ Hỗ trợ ORM mode để convert từ SQLAlchemy model