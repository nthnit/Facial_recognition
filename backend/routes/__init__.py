from fastapi import APIRouter
from backend.routes.auth import router as auth_router
from backend.routes.user import router as user_router

# Khởi tạo router chính
router = APIRouter()

# Gộp tất cả routes vào router chính
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(user_router, prefix="/users", tags=["Users"])
