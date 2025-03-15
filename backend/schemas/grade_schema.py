from pydantic import BaseModel
from typing import Optional
from datetime import datetime
# from schemas.student_schema import StudentResponse

class GradeCreate(BaseModel):
    # session_id: int
    student_id: int
    grade: Optional[float] = None
    status: str

class GradeUpdate(BaseModel):
    grade: Optional[float] = None
    status: Optional[str] = None

class GradeResponse(BaseModel):
    id: Optional[int]
    session_id: int
    student_id: int
    grade: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime
    student_full_name: str  # Thêm trường tên học sinh
    student_email: str

    class Config:
        orm_mode = True
