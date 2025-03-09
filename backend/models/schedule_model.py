from sqlalchemy import Column, Integer, ForeignKey, Time, DateTime
from sqlalchemy.orm import relationship
from database.mysql import Base
from sqlalchemy.sql import func

class Schedule(Base):
    __tablename__ = 'schedules'
    
    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey('classes.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)  # Thêm created_at để phân biệt bản ghi
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)

    # Relationship to Class
    class_info = relationship("Class", back_populates="schedules")
    
    room = relationship("Room", back_populates="schedules")

    def __repr__(self):
        return f"<Schedule(class_id={self.class_id}, day_of_week={self.day_of_week}, start_time={self.start_time}, end_time={self.end_time})>"
