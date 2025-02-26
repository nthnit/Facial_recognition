from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.mysql import Base

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    embedding = Column(String(4096), nullable=False)  # Lưu vector đặc trưng dưới dạng chuỗi JSON hoặc chuỗi dài
    created_at = Column(DateTime, default=func.now())  # Lưu thời điểm tạo

    # Mối quan hệ với bảng students (một học sinh có nhiều embedding, nhưng thường chỉ cần 1 embedding chính)
    student = relationship("Student", back_populates="face_embeddings")