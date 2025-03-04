from pydantic import BaseModel
from datetime import date
from typing import Optional

# Pydantic schema để xác định dữ liệu đầu vào khi tạo người dùng
class UserCreateRequest(BaseModel):
    email: str
    role: str
    full_name: str
    date_of_birth: date  # Thêm trường date_of_birth vào
    phone_number: Optional[str] = ""

# Pydantic schema để trả về thông tin người dùng khi tạo thành công
class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: str
    phone_number: Optional[str] = ""  # Trường số điện thoại mặc định là chuỗi rỗng

    class Config:
        orm_mode = True  # Đảm bảo trả về được dữ liệu theo model
        
# change PW
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
        
# schemas/user_schema.py
class PasswordChangeResponse(BaseModel):
    message: str

    class Config:
        orm_mode = True

