from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class SessionStudent(BaseModel):
    id: int
    full_name: str

class SessionResponse(BaseModel):
    session_id: int
    session_number: int
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