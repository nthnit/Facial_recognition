import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/common/NotFound";

// general routes
import StudentDetail from "./pages/StudentDetail";
import ClassDetail from "./pages/ClassDetail"; // ✅ Import trang thông tin chi tiết lớp học
import FaceAttendance from "./components/FaceAttendance";

// Admin Pages
import UserManagement from "./pages/admin/UserManagement";
import BannerManagement from "./pages/admin/BannerManagement";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AssignTeaching from "./pages/manager/AssignTeaching";
import StudentManagement from "./pages/manager/StudentManagement";
import NewsManagement from "./pages/manager/NewsManagement";
import ClassTracking from "./pages/manager/ClassTracking";
import TeacherManagement from "./pages/manager/TeacherManagement";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeachingSchedule from "./pages/teacher/TeachingSchedule";
import MyClasses from "./pages/teacher/MyClasses";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Trang login không dùng layout */}
                <Route path="/login" element={<Login />} />

                {/* MainLayout bao bọc tất cả route cần bảo vệ */}
                <Route element={<ProtectedRoute allowedRoles={["admin", "manager", "teacher"]} />}>
                    <Route path="/" element={<MainLayout />}>
                        
                        {/* 📌 Routes cho Admin */}
                        <Route path="admin/users" element={<UserManagement />} />
                        <Route path="admin/banner" element={<BannerManagement />} />
                        <Route path="/profile" element={<Profile />} />

                        {/* 📌 Routes cho Quản lý giảng viên */}
                        <Route path="manager/dashboard" element={<ManagerDashboard />} />
                        <Route path="manager/students" element={<StudentManagement />} />
                        <Route path="manager/assign" element={<AssignTeaching />} />
                        <Route path="manager/news" element={<NewsManagement />} />
                        <Route path="manager/classes" element={<ClassTracking />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="manager/teachers" element={<TeacherManagement />} />
                        <Route path="manager/students/:id" element={<StudentDetail />} />
                        <Route path="manager/classes/:id" element={<ClassDetail />} /> {/* ✅ Thêm route chi tiết lớp học */}

                        {/* 📌 Routes cho Giảng viên */}
                        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                        <Route path="teacher/schedule" element={<TeachingSchedule />} />
                        <Route path="teacher/classes" element={<MyClasses />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="teacher/students/:id" element={<StudentDetail />} />
                        <Route path="teacher/classes/:id" element={<ClassDetail />} />

                        {/* 📌 Route cho điểm danh khuôn mặt (chỉ cho teacher và manager) */}
                        <Route 
                          path="/face-attendance" 
                          element={<ProtectedRoute allowedRoles={["teacher", "manager"]} component={FaceAttendance} />}
                        />

                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
