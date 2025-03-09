from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from models.room_model import Room 
from schemas.room_schema import RoomCreate, RoomUpdate, RoomResponse, ChangeRoomStatusRequest
from database.mysql import get_db
from datetime import datetime
router = APIRouter()

# API lấy danh sách phòng học
@router.get("/", response_model=List[RoomResponse])
async def get_rooms(status: str = None, db: Session = Depends(get_db)):
    # Nếu có tham số `status` là 'active', chỉ lấy các phòng học có trạng thái 'Active'
    if status and status.lower() == "active":
        active_rooms = db.query(Room).filter(Room.status == "Active").all()
        if not active_rooms:
            raise HTTPException(status_code=404, detail="Không có phòng học nào có trạng thái 'Active'")
        return [RoomResponse.from_orm(room) for room in active_rooms]
    
    # Nếu không có tham số `status`, trả về tất cả phòng học
    rooms = db.query(Room).all()
    return [RoomResponse.from_orm(room) for room in rooms]



# API lấy chi tiết phòng học theo ID
@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Phòng học không tồn tại")
    return room

# API tạo phòng học mới
@router.post("/", response_model=RoomResponse)
def create_room(room_data: RoomCreate, db: Session = Depends(get_db)):
    # Tạo room_code tự động với cú pháp "ROOM{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    room_code = f"CR{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Tạo phòng học mới với room_code đã được tạo
    room = Room(
        room_code=room_code,
        room_name=room_data.room_name,
        capacity=room_data.capacity,
        location=room_data.location,
        status=room_data.status
    )

    db.add(room)
    db.commit()
    db.refresh(room)
    
    return room
# API cập nhật thông tin phòng học
@router.put("/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, room_data: RoomUpdate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Phòng học không tồn tại")
    
    for key, value in room_data.dict(exclude_unset=True).items():
        setattr(room, key, value)
    
    db.commit()
    db.refresh(room)
    return room

# API xóa phòng học
@router.delete("/{room_id}", response_model=RoomResponse)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Phòng học không tồn tại")
    
    db.delete(room)
    db.commit()
    return room

# API change Room's statius
@router.put("/{room_id}/change-status", response_model=RoomResponse)
def change_room_status(room_id: int, body: ChangeRoomStatusRequest, db: Session = Depends(get_db)):
    # Kiểm tra trạng thái hợp lệ
    status = body.status
    if status not in ["Active", "Deactive"]:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ. Chỉ có thể là 'Active' hoặc 'Deactive'.")
    
    # Lấy phòng học từ database
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng học.")

    # Cập nhật trạng thái phòng
    room.status = status
    db.commit()
    db.refresh(room)
    
    return room


