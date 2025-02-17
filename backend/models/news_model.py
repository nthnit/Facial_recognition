from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from database.mysql import Base
import enum

class NewsStatusEnum(str, enum.Enum):
    active = 'active'
    inactive = 'inactive'


class News(Base):
    __tablename__ = 'news'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Liên kết với bảng users
    status = Column(Enum(NewsStatusEnum), default=NewsStatusEnum.active)  # Trạng thái bài đăng
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)

    # Liên kết với bảng users để lấy thông tin tác giả
    author = relationship("User", back_populates="news")

    def __repr__(self):
        return f"<News(title={self.title}, author={self.author_id})>"

