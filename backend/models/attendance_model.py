from sqlalchemy import Column, Integer, ForeignKey, Date, String
from sqlalchemy.orm import relationship
from database.mysql import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_date = Column(Date, nullable=False)  # Ngày buổi học diễn ra
    status = Column(String(20), nullable=False)  # Trạng thái điểm danh: Present, Absent, Late, Excused

    student = relationship("Student", back_populates="attendances")
    class_ = relationship("Class", back_populates="attendances")
    session = relationship("Session", back_populates="attendances")
