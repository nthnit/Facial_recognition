import React, { useState, useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    BookOutlined,
    DashboardOutlined,
    PictureOutlined,
    SolutionOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logoSB.svg"; // ✅ Thay đường dẫn logo

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    // Danh sách menu theo role
    const menus = {
        admin: [
            { key: "/admin/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: "/admin/banner", icon: <PictureOutlined />, label: "Quản lý banner" },
            { key: "/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
        manager: [
            { key: "/manager/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/manager/students", icon: <UserOutlined />, label: "Quản lý học sinh" },
            { key: "/manager/teachers", icon: <TeamOutlined />, label: "Quản lý giáo viên" },
            { key: "/manager/assign", icon: <SolutionOutlined />, label: "Phân công giảng viên" },
            { key: "/manager/news", icon: <DashboardOutlined />, label: "Cập nhật tin tức" },
            { key: "/manager/classes", icon: <BookOutlined />, label: "Theo dõi lớp học" },
            { key: "/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
        teacher: [
            { key: "/teacher/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/teacher/classes", icon: <BookOutlined />, label: "Lớp học của tôi" },
            { key: "/teacher/schedule", icon: <CalendarOutlined />, label: "Lịch giảng dạy" },
            { key: "/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login"; 
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            onCollapse={onCollapse}
            style={{
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                backgroundColor: "#ffffff",
                borderRight: "1px solid #ddd",
                zIndex: 1000,
                padding: 0,
            }}
        >
            {/* Header Sidebar */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    padding: "15px",
                    backgroundColor: "#ffffff",
                    transition: "all 0.3s ease"
                }}
            >
                {/* ✅ Logo chỉ hiển thị khi sidebar mở */}
                {!collapsed && (
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            width: "50%", // Logo takes the full width when sidebar is open
                            transition: "opacity 0.3s ease",
                            margin: "auto",
                            paddingTop: ".75rem"
                        }}
                    />
                )}

                {/* ✅ Nút collapse luôn nằm ở giữa khi sidebar đóng */}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onCollapse}
                    style={{
                        color: "#333",
                        position: "absolute", // Makes button fixed within the sidebar
                        top: collapsed ? "9px" : "10px", // Adjust top positioning when collapsed
                        right: collapsed ? "23px" : "10px", // Adjust right positioning when collapsed
                        zIndex: 9999, // Keeps the button above other elements
                        fontSize: "17px"
                    }}
                />

            </div>

            {/* Hiển thị Menu nếu role hợp lệ */}
            {role && menus[role] ? (
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={(e) => navigate(e.key)}
                    items={menus[role]}
                    style={{ borderRight: "none" }}
                />
            ) : (
                <div style={{ padding: "20px", color: "#666" }}>Không có quyền truy cập</div>
            )}

            {/* Logout Button */}
            <div style={{ position: "absolute", bottom: "20px", width: "100%", padding: "10px" }}>
                <Button
                    type="primary"
                    danger
                    icon={collapsed ? <LogoutOutlined /> : <><LogoutOutlined /> </>}
                    block
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#ff4d4f",
                        borderColor: "#ff4d4f",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:  "center",
                        paddingLeft: "1.5rem" 
                    }}
                >
                    {!collapsed && "Đăng xuất"} {/* Only show text when sidebar is not collapsed */}
                </Button>
            </div>
        </Sider>
    );
};

export default Sidebar;
