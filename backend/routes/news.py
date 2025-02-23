from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.news_model import News
from models.user import User
from schemas.news_schema import NewsCreate, NewsUpdate, NewsResponse
from typing import List
from routes.user import get_current_user
from datetime import datetime
import logging

# ✅ Khởi tạo logger để theo dõi lỗi và hành động
logger = logging.getLogger(__name__)

router = APIRouter()

# 🟢 API LẤY DANH SÁCH TIN TỨC (chỉ Manager và Admin có quyền)
@router.get("/", response_model=List[NewsResponse])
def get_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        logger.warning(f"Người dùng {current_user.id} không có quyền xem danh sách tin tức")
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách tin tức")

    news = db.query(News).order_by(News.created_at.desc()).all()  # ✅ Sắp xếp theo thời gian mới nhất
    return news

# 🟢 API LẤY CHI TIẾT MỘT TIN TỨC
@router.get("/{news_id}", response_model=NewsResponse)
def get_news_detail(
    news_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")

    return news_item

# 🟢 API TẠO TIN TỨC (chỉ Manager và Admin có quyền)
@router.post("/", response_model=NewsResponse)
def create_news(
    news_data: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        logger.warning(f"Người dùng {current_user.id} không có quyền đăng tin")
        raise HTTPException(status_code=403, detail="Bạn không có quyền tạo tin tức")

    try:
        new_news = News(
            title=news_data.title,
            content=news_data.content,
            image_url=news_data.image_url,
            author_id=current_user.id,
            status=news_data.status,
            created_at=datetime.utcnow(),  # ✅ Đảm bảo đúng kiểu datetime
            updated_at=datetime.utcnow()
        )

        db.add(new_news)
        db.commit()
        db.refresh(new_news)
        logger.info(f"Người dùng {current_user.id} đã đăng tin: {news_data.title}")
        return new_news
    except Exception as e:
        logger.error(f"Lỗi khi đăng tin: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống, vui lòng thử lại sau")

# 🟢 API CẬP NHẬT TIN TỨC
@router.put("/{news_id}", response_model=NewsResponse)
def update_news(
    news_id: int,
    news_data: NewsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")

    # ✅ Chỉ cho phép admin hoặc chính người tạo tin chỉnh sửa
    if current_user.role != "admin" and news_item.author_id != current_user.id:
        logger.warning(f"Người dùng {current_user.id} cố gắng chỉnh sửa tin không thuộc sở hữu")
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa tin tức này")

    try:
        for key, value in news_data.dict(exclude_unset=True).items():
            setattr(news_item, key, value)

        news_item.updated_at = datetime.utcnow()  # ✅ Đúng kiểu datetime
        db.commit()
        db.refresh(news_item)
        logger.info(f"Người dùng {current_user.id} đã chỉnh sửa tin: {news_id}")
        return news_item
    except Exception as e:
        logger.error(f"Lỗi khi cập nhật tin tức: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống, vui lòng thử lại sau")

# 🟢 API XÓA TIN TỨC
@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")

    # ✅ Chỉ cho phép admin hoặc người tạo tin xóa tin
    if current_user.role != "admin" and news_item.author_id != current_user.id:
        logger.warning(f"Người dùng {current_user.id} cố gắng xóa tin không thuộc sở hữu")
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa tin tức này")

    try:
        db.delete(news_item)
        db.commit()
        logger.info(f"Người dùng {current_user.id} đã xóa tin: {news_id}")
        return {"detail": "Tin tức đã được xóa thành công"}
    except Exception as e:
        logger.error(f"Lỗi khi xóa tin tức: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống, vui lòng thử lại sau")
