from pydantic import BaseModel, constr, Field, EmailStr, ValidationError
from datetime import date
from typing import Optional, List

# Schema cho request điểm danh bằng khuôn mặt
class FaceAttendanceRequest(BaseModel):
    """
    Schema để xác thực dữ liệu gửi lên từ frontend khi thực hiện điểm danh bằng khuôn mặt.
    """
    image: constr(min_length=10, max_length=1000000) = Field(..., description="Chuỗi base64 của ảnh khuôn mặt (phần base64 thuần, không chứa metadata như 'data:image/jpeg;base64,')")
    class_id: int = Field(..., ge=1, description="ID của lớp học, phải là số nguyên dương")
    session_date: date = Field(..., description="Ngày của buổi học, định dạng YYYY-MM-DD")

    class Config:
        schema_extra = {
            "example": {
                "image": "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3Nw...",
                "class_id": 80,
                "session_date": "2025-02-27"
            }
        }

# Schema cho response thành công khi điểm danh
class FaceAttendanceResponse(BaseModel):
    """
    Schema cho phản hồi khi điểm danh thành công.
    """
    student_id: int = Field(..., description="ID của học sinh được nhận diện")
    full_name: str = Field(..., description="Tên đầy đủ của học sinh")
    message: Optional[str] = None
    class Config:
        schema_extra = {
            "example": {
                "student_id": 1,
                "full_name": "Nguyen Van A"
            }
        }

# Schema cho lỗi khi không tìm thấy học sinh phù hợp
class FaceAttendanceErrorResponse(BaseModel):
    """
    Schema cho phản hồi lỗi khi không tìm thấy học sinh hoặc dữ liệu không hợp lệ.
    """
    detail: str = Field(..., description="Thông báo lỗi chi tiết")

    class Config:
        schema_extra = {
            "example": {
                "detail": "Không tìm thấy học sinh phù hợp"
            }
        }

# Schema để tạo bản ghi điểm danh (nếu cần lưu vào database)
class AttendanceCreate(BaseModel):
    """
    Schema để tạo bản ghi điểm danh trong bảng attendance.
    """
    class_id: int = Field(..., ge=1, description="ID của lớp học")
    session_id: int = Field(..., ge=1, description="ID của buổi học")
    student_id: int = Field(..., ge=1, description="ID của học sinh")
    status: str = Field(..., pattern="^(Present|Absent|Late|Excused)$", description="Trạng thái điểm danh")

    class Config:
        schema_extra = {
            "example": {
                "class_id": 80,
                "session_id": 1,
                "student_id": 1,
                "status": "Present"
            }
        }

# Schema để cập nhật bản ghi điểm danh (nếu cần)
class AttendanceUpdate(BaseModel):
    """
    Schema để cập nhật trạng thái điểm danh trong bảng attendance.
    """
    status: Optional[str] = Field(None, pattern="^(Present|Absent|Late|Excused)$", description="Trạng thái điểm danh mới")

    class Config:
        schema_extra = {
            "example": {
                "status": "Present"
            }
        }