import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AccessDenied from "../pages/common/AccessDenied";

// Định nghĩa các routes hợp lệ cho từng role
const roleRoutes = {
    admin: ["/admin/users", "/admin/banner", "/profile"],
    manager: [
        "/manager/dashboard",
        "/manager/students",
        "/manager/assign",
        "/manager/news",
        "/manager/classes",
        "/profile",
        "/manager/teachers"
    ],
    teacher: [
        "/teacher/dashboard", 
        "/teacher/classes", 
        "/teacher/schedule", 
        "/profile", 
        "/teacher/classes",  // Thêm quyền truy cập cho teacher vào chi tiết lớp
        "/teacher/students" // Thêm quyền truy cập cho teacher vào chi tiết học sinh
    ]
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

    // Kiểm tra xem đường dẫn có hợp lệ với role không
    const isAllowed =
        allowedRoles.includes(userRole) &&
        (roleRoutes[userRole]?.includes(location.pathname) ||
         (userRole === "manager" && (location.pathname.startsWith("/manager/students/") || location.pathname.startsWith("/manager/classes/"))) ||
         (userRole === "teacher" && (location.pathname.startsWith("/teacher/students/") || location.pathname.startsWith("/teacher/classes/"))));

    if (!isAllowed) {
        console.warn("🚨 Không có quyền truy cập vào:", location.pathname);
        return <AccessDenied defaultRoute={defaultRoutes[userRole]} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
