from pydantic import BaseModel 
from datetime import time, datetime
from typing import List, Optional

class ScheduleBase(BaseModel):
    class_id: int
    day_of_week: int  # 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    start_time: time
    end_time: time


# Schema để phản hồi dữ liệu
class ScheduleResponse(BaseModel):
    class_id: int
    day_of_week: int
    start_time: str
    end_time: str
    created_at: str 
    room_name: Optional[str] = None  # Thêm trư��ng tên phòng học nếu có

    class Config:
        orm_mode = True

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    
    class Config:
        orm_mode = True

class ScheduleList(BaseModel):
    schedules: List[Schedule]

