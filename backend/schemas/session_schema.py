from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class SessionStudent(BaseModel):
    id: int
    full_name: str

class SessionResponse(BaseModel):
    session_number: int
    date: date
    weekday: str
    start_time: str
    end_time: str
    total_students: int
    attendance_rate: float
    students: List[SessionStudent]
