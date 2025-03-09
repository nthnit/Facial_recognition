from pydantic import BaseModel
from datetime import date, time
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
    # Thêm các trường start_time và end_time cho các buổi học
    start_time: Optional[List[time]] = None  # Danh sách giờ bắt đầu cho từng buổi học
    end_time: Optional[List[time]] = None    # Danh sách giờ kết thúc cho từng buổi học
    room_ids: Optional[List[Optional[int]]] = None

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
    # Thêm các trường start_time và end_time cho các buổi học
    start_time: Optional[List[time]] = None  # Danh sách giờ bắt đầu cho từng buổi học
    end_time: Optional[List[time]] = None    # Danh sách giờ kết thúc cho từng buổi học

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
    # total_students: Optional[int]

    class Config:
        from_attributes = True  # ✅ Hỗ trợ ORM mode để convert từ SQLAlchemy model
        
# Schema để trả về thông tin lớp học
class ClassTeacherResponse(BaseModel):
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
    total_students: Optional[int]

    class Config:
        from_attributes = True  # ✅ Hỗ trợ ORM mode để convert từ SQLAlchemy model
        
