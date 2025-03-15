from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import List, Optional

class SessionStudent(BaseModel):
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

class SessionResponse(BaseModel):
    session_id: int
    # session_number: Optional[int]
    class_code: Optional[str] = None
    class_id: Optional[int]
    date: date
    weekday: str
    start_time: str
    end_time: str
    total_students: int
    attendance_rate: float
    students: List[SessionStudent]
    room_name: Optional[str] = ""

class StudentSessionResponse(BaseModel):
    session_id: int
    class_id: int
    class_name: str
    class_code: str  # ✅ Thêm class_code
    date: date
    weekday: str
    start_time: str
    end_time: str
    attendance_status: Optional[str] = "Absent"
    attendance_rate: Optional[float] = 0.0

    class Config:
        from_attributes = True
        
class SessionAttendanceResponse(BaseModel):
    session_id: int
    student_id: int
    status: str
    session_date: date
    student_full_name: str
    student_email: str

    class Config:
        orm_mode = True