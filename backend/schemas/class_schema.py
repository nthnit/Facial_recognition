from pydantic import BaseModel
from datetime import date
from typing import Optional

# Schema để tạo lớp mới
class ClassCreate(BaseModel):
    name: str
    teacher_id: int
    start_date: date
    end_date: date
    total_sessions: int
    subject: str
    status: str
    class_code: str

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

# Schema để trả về thông tin lớp học
class ClassResponse(BaseModel):
    id: int
    class_code: str
    name: str
    teacher_id: Optional[int]
    start_date: date
    end_date: date
    total_sessions: int
    subject: str
    status: str

    class Config:
        from_attributes = True
