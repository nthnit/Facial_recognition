from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.class_model import Class
from models.user import User
from schemas.class_schema import ClassCreate, ClassUpdate, ClassResponse
from typing import List
import pandas as pd
from fastapi.responses import FileResponse
import os
from routes.user import get_current_user  # ✅ Import xác thực user

router = APIRouter()

# 🟢 API LẤY DANH SÁCH LỚP HỌC (Admin & Manager có quyền)
@router.get("", response_model=List[ClassResponse])
def get_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem danh sách lớp học")

    classes = db.query(Class).all()
    return classes

# 🟢 API LẤY CHI TIẾT LỚP HỌC THEO ID (Admin & Manager có quyền)
@router.get("/{class_id}", response_model=ClassResponse)
def get_class_detail(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem chi tiết lớp học")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")
    
    return class_obj

# 🟢 API THÊM MỚI LỚP HỌC (Admin & Manager có quyền)
@router.post("", response_model=ClassResponse)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền thêm lớp học")

    new_class = Class(
        name=class_data.name,
        teacher_id=class_data.teacher_id,
        start_date=class_data.start_date,
        end_date=class_data.end_date,
        total_sessions=class_data.total_sessions,
        subject=class_data.subject,
        status=class_data.status,
        class_code=class_data.class_code,
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

# 🟢 API CẬP NHẬT THÔNG TIN LỚP HỌC (Admin & Manager có quyền)
@router.put("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    class_data: ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật thông tin lớp học")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    for key, value in class_data.dict(exclude_unset=True).items():
        setattr(class_obj, key, value)

    db.commit()
    db.refresh(class_obj)
    return class_obj

# 🟢 API XOÁ LỚP HỌC (Admin & Manager có quyền)
@router.delete("/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xoá lớp học")

    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Lớp học không tồn tại")

    db.delete(class_obj)
    db.commit()
    return {"detail": "Lớp học đã được xóa thành công"}

# 🟢 API XUẤT DANH SÁCH LỚP RA FILE EXCEL (Admin & Manager có quyền)
@router.get("/export")
def export_classes_to_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xuất danh sách lớp học")

    classes = db.query(Class).all()
    if not classes:
        raise HTTPException(status_code=404, detail="Không có lớp học nào để xuất")

    data = [{
        "Mã lớp": cls.class_code,
        "Tên lớp": cls.name,
        "Giảng viên": cls.teacher_id,
        "Ngày bắt đầu": cls.start_date.strftime("%Y-%m-%d"),
        "Ngày kết thúc": cls.end_date.strftime("%Y-%m-%d"),
        "Số buổi học": cls.total_sessions,
        "Môn học": cls.subject,
        "Trạng thái": cls.status
    } for cls in classes]

    df = pd.DataFrame(data)
    file_path = "class_list.xlsx"
    df.to_excel(file_path, index=False)

    return FileResponse(
        file_path, 
        filename="DanhSachLop.xlsx", 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
