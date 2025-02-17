import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AccessDenied from "../pages/common/AccessDenied";

// Định nghĩa các routes hợp lệ cho từng role
const roleRoutes = {
    admin: ["/admin/users", "/admin/banner", "/admin/profile"],
    manager: ["/manager/dashboard","/manager/students", "/manager/assign", "/manager/news", "/manager/classes", "/manager/profile"],
    teacher: ["/teacher/dashboard", "/teacher/classes", "/teacher/schedule", "/teacher/profile"]
};

// Định nghĩa trang mặc định cho từng role
const defaultRoutes = {
    admin: "/admin/users",
    manager: "/manager/assign",
    teacher: "/teacher/dashboard"
};

const ProtectedRoute = ({ allowedRoles }) => {
    const location = useLocation();
    const userRole = localStorage.getItem("role");

    // Nếu chưa đăng nhập, chuyển hướng về trang login
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // Nếu role không hợp lệ hoặc không có quyền truy cập, hiển thị trang Access Denied
    if (!allowedRoles.includes(userRole) || !roleRoutes[userRole]?.includes(location.pathname)) {
        return <AccessDenied defaultRoute={defaultRoutes[userRole]} />;
    }

    // Nếu role hợp lệ, render nội dung trang
    return <Outlet />;
};

export default ProtectedRoute;
