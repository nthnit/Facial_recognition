from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AttendanceCreate(BaseModel):
    class_id: int
    student_id: int
    session_id: int  # ✅ Thêm session_id để liên kết với bảng sessions
    status: str  # Present, Absent, Late, Excused

class AttendanceResponse(BaseModel):
    id: int
    class_id: int
    student_id: int
    session_id: int  # ✅ Thêm session_id để phản ánh mối quan hệ
    session_date: date
    status: str

    class Config:
        from_attributes = True
