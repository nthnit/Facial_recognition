from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.mysql import Base
from datetime import datetime

class ClassStudent(Base):
    __tablename__ = "class_students"
    __table_args__ = {"extend_existing": True}  # ✅ Fix lỗi trùng bảng

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)  # Ngày đăng ký lớp học

    # 🔹 Mối quan hệ với Class
    class_rel = relationship("Class", back_populates="students")
    
    # 🔹 Mối quan hệ với Student
    student_rel = relationship("Student", back_populates="classes")

    def __repr__(self):
        return f"<ClassStudent(class_id={self.class_id}, student_id={self.student_id})>"
