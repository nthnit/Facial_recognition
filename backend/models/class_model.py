from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database.mysql import Base

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    class_code = Column(String(20), unique=True, nullable=False)  # Mã lớp
    name = Column(String(255), nullable=False)  # Tên lớp
    teacher_id = Column(Integer, ForeignKey("users.id"))  # Giảng viên dạy lớp
    start_date = Column(Date, nullable=False)  # Ngày bắt đầu
    end_date = Column(Date, nullable=False)  # Ngày kết thúc
    total_sessions = Column(Integer, nullable=False, default=15)  # Tổng số buổi học
    subject = Column(String(255), nullable=False)  # Môn học
    status = Column(String(50), nullable=False, default="active")  # Trạng thái lớp
    weekly_schedule = Column(String(255), nullable=False)

    # 🔹 Sử dụng bảng trung gian ClassStudent thay vì `secondary=class_students`
    students = relationship("ClassStudent", back_populates="class_rel", cascade="all, delete-orphan")

    # 🔹 Mối quan hệ với giáo viên
    teacher = relationship("User", back_populates="classes")
    
    attendances = relationship("Attendance", back_populates="class_", cascade="all, delete-orphan")

    sessions = relationship("Session", back_populates="class_obj", cascade="all, delete-orphan")