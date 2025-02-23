from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class TeacherCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = ""
    date_of_birth: Optional[date] = None

class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None

class TeacherResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = ""
    date_of_birth: Optional[date] = None

    class Config:
        from_attributes = True
