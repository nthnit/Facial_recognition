from pydantic import BaseModel, EmailStr

# Schema cho yêu cầu đăng nhập
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Schema cho phản hồi khi đăng nhập thành công
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    id:int

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str