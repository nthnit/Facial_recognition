from sqlalchemy import Column, Integer, String, Enum, DateTime
from database.mysql import Base
from sqlalchemy.sql import func
from enum import Enum as PyEnum



class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(255), nullable=False)
    status = Column(Enum("Active", "Deactivate"), default="Active", nullable=False)  # Thêm trường status
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Banner(id={self.id}, image_url={self.image_url}, status={self.status})>"
