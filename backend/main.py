from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router  # Import tất cả các routes

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Cho phép frontend React truy cập
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Cho phép tất cả các headers
)

# Thêm các router vào ứng dụng
app.include_router(router)
