from sqlalchemy import Column, Integer, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from database.mysql import Base

# Bảng trung gian giữa Class và Student (Nhiều-Nhiều)
class_student_association = Table(
    "class_students",  # Đảm bảo tên bảng này khớp với bảng trung gian thực tế
    Base.metadata,
    Column("class_id", Integer, ForeignKey("classes.id")),
    Column("student_id", Integer, ForeignKey("students.id")),
)

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

    # Mối quan hệ với bảng Student qua bảng trung gian
    students = relationship("Student", secondary=class_student_association, back_populates="classes")
    teacher = relationship("User", back_populates="classes")  # Mối quan hệ với giáo viên


