from fastapi import APIRouter
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.manager import router as manager_router  # Thêm dòng này
from routes.admin import router as admin_router
# Khởi tạo router chính
router = APIRouter()

# Gộp tất cả routes vào router chính
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(user_router, prefix="/users", tags=["Users"])
router.include_router(manager_router, prefix="/manager", tags=["Manager"])  # Thêm dòng này
router.include_router(admin_router, prefix="/admin", tags=["Admin"])

