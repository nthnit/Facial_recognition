from fastapi import APIRouter
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.manager import router as manager_router
from routes.admin import router as admin_router
from routes.student import router as student_router  
from routes.classes import router as class_router
from routes.teacher import router as teacher_router
from routes.news import router as news_router
from routes.uploads import router as upload_router  # ✅ Thêm route của uploads
from routes.attendance import router as attendance_router  # ✅ Thêm route của điểm danh

# Khởi tạo router chính
router = APIRouter()

# Gộp tất cả routes vào router chính
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(user_router, prefix="/users", tags=["Users"])
router.include_router(manager_router, prefix="/manager", tags=["Manager"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
router.include_router(student_router, prefix="/students", tags=["Students"]) 
router.include_router(class_router, prefix="/classes", tags=["Classes"])
router.include_router(teacher_router, prefix="/teachers", tags=["Teachers"])
router.include_router(news_router, prefix="/news", tags=["News"])
router.include_router(upload_router, prefix="/uploads", tags=["Uploads"])  # ✅ Thêm route upload ảnh
router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])  # ✅ Thêm route điểm danh
