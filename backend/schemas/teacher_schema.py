from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class TeacherCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = ""
    date_of_birth: Optional[date] = None
    address: Optional[str] = ""

class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = ""

class TeacherResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = ""
    date_of_birth: Optional[date] = None
    avatar_url: Optional[str] = ""
    address: Optional[str] = ""
    gender: Optional[str] = ""

    class Config:
        from_attributes = True


from pydantic import BaseModel
from typing import List

class TeacherScheduleResponse(BaseModel):
    session_id: int
    class_id: int
    class_name: str
    teacher_name: str
    date: str
    start_time: str
    end_time: str
    student_count: int

    class Config:
        orm_mode = True
