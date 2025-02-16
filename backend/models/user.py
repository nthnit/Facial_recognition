from sqlalchemy import Column, Integer, String, Enum
from database.mysql import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # Mật khẩu đã hash
    role = Column(Enum('admin', 'teacher_manager', 'teacher', 'student'), nullable=False)
    avatar_url = Column(String, nullable=True)
