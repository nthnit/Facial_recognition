from sqlalchemy import Column, Integer, String, Date, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.mysql import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=False)
    admission_year = Column(Integer, nullable=False)
    status = Column(Enum("active", "inactive", "graduated"), default="active")
    image = Column(String(255), nullable=True)  # Field to store the image URL or path
    created_at = Column(DateTime, default=func.now())  # Lưu thời điểm tạo
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # 🔹 Sử dụng bảng trung gian ClassStudent thay vì `secondary="class_students"`
    classes = relationship("ClassStudent", back_populates="student_rel", cascade="all, delete-orphan")

    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")