from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Enum, DateTime
from sqlalchemy.orm import relationship
from database.mysql import Base
from datetime import datetime

class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    grade = Column(DECIMAL(5, 2), nullable=True)
    status = Column(Enum("Complete", "Incomplete", "Not Done"), default="Not Done", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    session = relationship("Session", back_populates="grades")
    student = relationship("Student", back_populates="grades")
