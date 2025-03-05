from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class NewsStatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"

class NewsCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    status: NewsStatusEnum

class NewsUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    image_url: Optional[str]
    status: Optional[NewsStatusEnum]

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    author_id: int
    status: NewsStatusEnum
    created_at: datetime  # ✅ Đổi từ `date` thành `datetime`
    updated_at: datetime  # ✅ Đổi từ `date` thành `datetime`

    class Config:
        orm_mode = True

class NewsDetailResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    author_id: int
    status: NewsStatusEnum
    created_at: datetime  # ✅ Đổi từ `date` thành `datetime`
    updated_at: datetime  # ✅ Đổi từ `date` thành `datetime`
    author_name: str  # Thêm trường author_name
    author_email: str

    class Config:
        orm_mode = True