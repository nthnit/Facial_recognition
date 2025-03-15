from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database.mysql import Base

class SessionStudent(Base):
    __tablename__ = "session_students"

    session_id = Column(Integer, ForeignKey("sessions.id"), primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"), primary_key=True)

    # Quan hệ với session
    session = relationship("Session", back_populates="students")
    
    # Quan hệ với student
    student = relationship("Student", back_populates="sessions")
