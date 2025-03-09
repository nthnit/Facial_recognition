from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.schedule_model import Schedule
from models.room_model import Room
from schemas.schedule_schema import ScheduleResponse  # Sử dụng schema tương ứng với bảng schedules
from database import get_db
from typing import List
from sqlalchemy import desc

router = APIRouter()

# 🟢 API Lấy Danh Sách Lịch Học Của Lớp
@router.get("/{class_id}", response_model=List[ScheduleResponse])
def get_class_schedule(class_id: int, db: Session = Depends(get_db)):
    # Lấy tất cả các lịch học của lớp từ bảng schedules
    schedules = db.query(Schedule).filter(Schedule.class_id == class_id).all()

    if not schedules:
        raise HTTPException(status_code=404, detail="Lịch học không tồn tại")

    # Trả về dữ liệu lịch học, bao gồm trường created_at
    return [
        {
            "class_id": schedule.class_id,
            "day_of_week": schedule.day_of_week,
            "start_time": schedule.start_time.strftime("%H:%M"),  # Chuyển datetime.time thành string
            "end_time": schedule.end_time.strftime("%H:%M"),  # Chuyển datetime.time thành string
            "created_at": schedule.created_at.strftime("%Y-%m-%d %H:%M:%S")  # Thêm trường created_at
        }
        for schedule in schedules
    ]
    
@router.get("/{class_id}/latest", response_model=List[ScheduleResponse])
def get_latest_class_schedule(class_id: int, db: Session = Depends(get_db)):
    # Lấy bản ghi lịch học mới nhất theo class_id và created_at
    latest_schedule = db.query(Schedule).filter(Schedule.class_id == class_id).order_by(desc(Schedule.created_at)).first()

    if not latest_schedule:
        raise HTTPException(status_code=404, detail="Không có lịch học mới cho lớp này")

    # Lấy tất cả lịch học có created_at giống bản ghi lịch học mới nhất
    latest_schedules = db.query(Schedule).filter(
        Schedule.class_id == class_id,
        Schedule.created_at == latest_schedule.created_at
    ).join(Room, Room.id == Schedule.room_id).all()  # Join với bảng Room để lấy thông tin phòng học

    # Chuyển start_time và end_time thành chuỗi HH:MM cho tất cả các bản ghi và thêm tên phòng học
    schedule_list = []
    for schedule in latest_schedules:
        start_time_str = schedule.start_time.strftime("%H:%M") if schedule.start_time else None
        end_time_str = schedule.end_time.strftime("%H:%M") if schedule.end_time else None

        schedule_list.append({
            "class_id": schedule.class_id,
            "day_of_week": schedule.day_of_week,
            "start_time": start_time_str,
            "end_time": end_time_str,
            "created_at": schedule.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "room_name": schedule.room.room_name  # Trả về tên phòng học
        })

    return schedule_list



