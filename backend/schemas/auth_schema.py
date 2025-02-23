from pydantic import BaseModel

# 📌 Schema cho request khi đăng nhập
class LoginRequest(BaseModel):
    email: str
    password: str

# 📌 Schema cho response khi đăng nhập thành công (KHÔNG gửi refresh_token)
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    id: int

# 📌 Schema cho request gửi refresh token (KHÔNG cần thiết nữa vì lấy từ cookie)
class RefreshTokenRequest(BaseModel):
    pass  # Không cần truyền dữ liệu, refresh token được lấy từ cookie

# 📌 Schema cho response khi refresh token thành công
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 📌 Schema cho response khi logout
class LogoutResponse(BaseModel):
    message: str = "Đăng xuất thành công"

# 📌 Schema cho response khi lấy thông tin user
class UserInfoResponse(BaseModel):
    id: int
    email: str
    role: str
