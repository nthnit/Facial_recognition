from fastapi import FastAPI
from routes import router
from middleware.auth_middleware import AuthMiddleware
from middleware.cors_middleware import CORSMiddleware  # ✅ Import middleware CORS mới

app = FastAPI()

# ✅ Đảm bảo CORS Middleware đứng đầu tiên
app.add_middleware(CORSMiddleware)

# ✅ Thêm Middleware xác thực (AuthMiddleware)
app.add_middleware(AuthMiddleware)

# ✅ Thêm router vào ứng dụng
app.include_router(router)
