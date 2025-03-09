from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RoomBase(BaseModel):
    room_code: str
    room_name: str
    capacity: int
    location: Optional[str] = None
    status: Optional[str] = "Active"  # Thêm trường status

class RoomCreate(BaseModel):
    room_name: str
    capacity: int
    location: str
    status: str

    class Config:
        orm_mode = True

class RoomUpdate(RoomBase):
    pass

class RoomResponse(BaseModel):
    id: int
    room_code: str
    room_name: str
    capacity: int
    location: str
    status: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        # Convert datetime to string format in response
        return cls(
            id=obj.id,
            room_code=obj.room_code,
            room_name=obj.room_name,
            capacity=obj.capacity,
            location=obj.location,
            status=obj.status,
            created_at=obj.created_at.isoformat() if obj.created_at else None,
            updated_at=obj.updated_at.isoformat() if obj.updated_at else None,
        )

class ChangeRoomStatusRequest(BaseModel):
    status: str
