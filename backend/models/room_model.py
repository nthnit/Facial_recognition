from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.mysql import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String(50), unique=True, nullable=False)
    room_name = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False)
    location = Column(String(255), nullable=True)
    status = Column(Enum("Active", "Deactive"), default="Active", nullable=False)  # Thêm cột status
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Mối quan hệ với sessions
    sessions = relationship("Session", back_populates="room")
    
    schedules = relationship("Schedule", back_populates="room")
