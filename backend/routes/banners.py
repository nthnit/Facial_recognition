from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.banner_model import Banner
from schemas.banner_schema import BannerCreate, BannerResponse, ChangeBannerStatusRequest
from database.mysql import get_db
from typing import List, Optional

router = APIRouter()

# API lấy danh sách banner
@router.get("/", response_model=List[BannerResponse])
async def get_banners(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Banner)
    
    if status:
        status = status.capitalize()  
        if status not in ["Active", "Deactivate"]:
            raise HTTPException(status_code=400, detail="Invalid status. Allowed values are 'Active' or 'Deactivate'.")
        query = query.filter(Banner.status == status)
    
    banners = query.all()

    if not banners:
        raise HTTPException(status_code=404, detail="No banners found with the given status")
    
    return banners

# API tạo mới banner
@router.post("/", response_model=BannerResponse)
async def create_banner(banner_data: BannerCreate, db: Session = Depends(get_db)):
    new_banner = Banner(image_url=banner_data.image_url, status=banner_data.status)
    db.add(new_banner)
    db.commit()
    db.refresh(new_banner)
    return new_banner

# API change Banner's status
@router.put("/{banner_id}/change-status", response_model=BannerResponse)
def change_banner_status(banner_id: int, body: ChangeBannerStatusRequest, db: Session = Depends(get_db)):
    status = body.status
    if status not in ["Active", "Deactivate"]:
        raise HTTPException(status_code=400, detail="Invalid status. Can only be 'Active' or 'Deactivate'.")
    
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found.")

    banner.status = status
    db.commit()
    db.refresh(banner)
    
    return banner

import cloudinary.uploader
# API xóa banner
# API xoá banner và xoá ảnh trên Cloudinary
@router.delete("/{banner_id}", response_model=BannerResponse)
def delete_banner(banner_id: int, db: Session = Depends(get_db)):
    # Tìm banner trong database
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner không tồn tại")

    try:
        # Xoá ảnh banner trên Cloudinary
        image_url = banner.image_url
        public_id = image_url.split('/')[-1].split('.')[0]  # Lấy public_id từ URL ảnh
        cloudinary.uploader.destroy(public_id)  # Xoá ảnh từ Cloudinary

        # Xoá banner trong cơ sở dữ liệu
        db.delete(banner)
        db.commit()
        
        return banner
    except Exception as e:
        # Xử lý lỗi nếu xảy ra khi xoá ảnh trên Cloudinary
        raise HTTPException(status_code=500, detail=f"Lỗi khi xoá ảnh trên Cloudinary: {str(e)}")

