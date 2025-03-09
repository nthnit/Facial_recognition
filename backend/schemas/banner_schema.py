from pydantic import BaseModel
from enum import Enum as PyEnum
from datetime import datetime
from typing import Optional


class BannerCreate(BaseModel):
    image_url: str
    status: Optional[str] = "Active"  # Mặc định status là Active

class BannerResponse(BannerCreate):
    id: int
    created_at: datetime  # Đảm bảo định dạng chuỗi cho created_at

    class Config:
        orm_mode = True

    @staticmethod
    def from_orm(banner):
        data = super().from_orm(banner)
        data.created_at = data.created_at.strftime("%Y-%m-%d %H:%M:%S") if data.created_at else None
        return data
    
class ChangeBannerStatusRequest(BaseModel):
    status: str