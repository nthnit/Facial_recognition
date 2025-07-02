from fastapi import APIRouter
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.manager import router as manager_router
from routes.admin import router as admin_router
from routes.student import router as student_router  
from routes.classes import router as class_router
from routes.teacher import router as teacher_router
from routes.news import router as news_router
from routes.uploads import router as upload_router  
from routes.attendance import router as attendance_router 
from routes.schedules import router as schedule_router 
from routes.rooms import router as room_router 
from routes.banners import router as banner_router 
from routes.grades import router as grade_router 
from routes.sessions import router as session_router 
from routes.face import router as face_router

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
router.include_router(upload_router, prefix="/uploads", tags=["Uploads"])
router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
router.include_router(schedule_router, prefix="/schedules", tags=["Schedules"])
router.include_router(room_router, prefix="/rooms", tags=["Rooms"])
router.include_router(banner_router, prefix="/banners", tags=["Banners"])
router.include_router(grade_router, prefix="/grades", tags=["Grades"])
router.include_router(session_router, prefix="/sessions", tags=["Sessions"])
router.include_router(face_router, prefix="/face", tags=["Face"])
