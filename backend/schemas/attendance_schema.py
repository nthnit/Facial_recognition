from pydantic import BaseModel
from typing import List
from datetime import date

class AttendanceCreate(BaseModel):
    class_id: int
    student_id: int
    status: str  # Present, Absent, Late, Excused

class AttendanceResponse(BaseModel):
    id: int
    class_id: int
    student_id: int
    session_date: date
    status: str

    class Config:
        from_attributes = True
