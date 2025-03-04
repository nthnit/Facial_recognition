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
        "/manager/teachers",
        "/face-attendance" // Thêm route FaceAttendance cho manager
    ],
    teacher: [
        "/teacher/dashboard", 
        "/teacher/classes", 
        "/teacher/schedule", 
        "/profile", 
        "/teacher/classes",  // Thêm quyền truy cập cho teacher vào chi tiết lớp
        "/teacher/students", // Thêm quyền truy cập cho teacher vào chi tiết học sinh
        "/face-attendance",   // Thêm route FaceAttendance cho teacher
    ]
};

// Định nghĩa trang mặc định cho từng role
const defaultRoutes = {
    admin: "/admin/users",
    manager: "/manager/assign",
    teacher: "/teacher/dashboard"
};

const ProtectedRoute = ({ allowedRoles, component: Component }) => {
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
         (userRole === "manager" && (location.pathname.startsWith("/manager/students/") || location.pathname.startsWith("/manager/classes/") || location.pathname === "/face-attendance")) ||
         (userRole === "teacher" && (location.pathname.startsWith("/teacher/students/") || location.pathname.startsWith("/teacher/classes/") || location.pathname === "/face-attendance")));

    if (!isAllowed) {
        console.warn("🚨 Không có quyền truy cập vào:", location.pathname);
        return <AccessDenied defaultRoute={defaultRoutes[userRole]} />;
    }

    // Nếu có Component được truyền vào, render Component đó; nếu không, render Outlet
    return Component ? <Component /> : <Outlet />;
};

export default ProtectedRoute;