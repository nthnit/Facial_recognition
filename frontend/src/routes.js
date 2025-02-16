import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import UserManagement from "./pages/admin/UserManagement";
import AssignTeaching from "./pages/manager/AssignTeaching";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Trang login không dùng layout */}
                <Route path="/login" element={<Login />} />

                {/* MainLayout bao bọc tất cả route cần bảo vệ */}
                <Route element={<ProtectedRoute allowedRoles={["admin", "teacher_manager", "teacher"]} />}>
                    <Route path="/" element={<MainLayout />}>
                        {/* Routes cho Admin */}
                        <Route path="admin/users" element={<UserManagement />} />

                        {/* Routes cho Quản lý giảng viên */}
                        <Route path="manager/assign" element={<AssignTeaching />} />

                        {/* Routes cho Giảng viên */}
                        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
