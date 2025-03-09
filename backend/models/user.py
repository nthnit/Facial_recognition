from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from database.mysql import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    role = Column(Enum("admin", "manager", "teacher"), nullable=False)
    gender = Column(Enum("male", "female", "other"), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    access_token = Column(Text, nullable=True)   # 🔹 Lưu Access Token
    refresh_token = Column(Text, nullable=True)  # 🔹 Lưu Refresh Token
    avatar_url = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    

    # Liên kết với bảng news (một người dùng có thể có nhiều bài viết)
    news = relationship("News", back_populates="author")
    
    # ✅ Thêm mối quan hệ với bảng classes
    classes = relationship("Class", back_populates="teacher")

