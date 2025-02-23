from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.news_model import News
from models.user import User
from schemas.news_schema import NewsCreate, NewsUpdate, NewsResponse
from typing import List
from routes.user import get_current_user
from datetime import date

router = APIRouter()

# 🟢 API LẤY DANH SÁCH TIN TỨC (chỉ Manager và Admin có quyền)
@router.get("/", response_model=List[NewsResponse])
def get_news(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách tin tức")

    news = db.query(News).all()
    return news

# 🟢 API LẤY CHI TIẾT MỘT TIN TỨC (chỉ Manager và Admin có quyền)
@router.get("/{news_id}", response_model=NewsResponse)
def get_news_detail(
    news_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ Yêu cầu xác thực
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem chi tiết tin tức")

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
        raise HTTPException(status_code=403, detail="Bạn không có quyền tạo tin tức")

    new_news = News(
        title=news_data.title,
        content=news_data.content,
        image_url=news_data.image_url,
        author_id=current_user.id,  # Lấy ID của người đăng tin
        status=news_data.status,
        created_at=date.today(),
        updated_at=date.today()
    )

    db.add(new_news)
    db.commit()
    db.refresh(new_news)
    return new_news

# 🟢 API CẬP NHẬT TIN TỨC (chỉ Manager và Admin có quyền)
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

    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa tin tức")

    for key, value in news_data.dict(exclude_unset=True).items():
        setattr(news_item, key, value)

    news_item.updated_at = date.today()  # Cập nhật ngày chỉnh sửa
    db.commit()
    db.refresh(news_item)
    return news_item

# 🟢 API XÓA TIN TỨC (chỉ Manager và Admin có quyền)
@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(status_code=404, detail="Tin tức không tồn tại")

    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa tin tức")

    db.delete(news_item)
    db.commit()
    return {"detail": "Tin tức đã được xóa thành công"}
