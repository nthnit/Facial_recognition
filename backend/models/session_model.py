from sqlalchemy import Column, Integer, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from database.mysql import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)

    # Quan hệ với lớp học
    class_obj = relationship("Class", back_populates="sessions")
    
    # Quan hệ với bảng Attendance
    attendances = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")
    
    room = relationship("Room", back_populates="sessions")
    
    students = relationship("SessionStudent", back_populates="session", cascade="all, delete-orphan")
    
    grades = relationship("Grade", back_populates="session", cascade="all, delete-orphan")
    
