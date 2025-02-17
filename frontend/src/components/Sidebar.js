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
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        // Lấy role từ localStorage khi component được mount
        const storedRole = localStorage.getItem("role");
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Danh sách menu theo role
    const menus = {
        admin: [
            { key: "/admin/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: "/admin/banner", icon: <PictureOutlined />, label: "Quản lý banner" },
            { key: "/admin/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
        manager: [
            { key: "/manager/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/manager/students", icon: <UserOutlined />, label: "Quản lý học sinh" },
            { key: "/manager/assign", icon: <SolutionOutlined />, label: "Phân công giảng viên" },
            { key: "/manager/news", icon: <DashboardOutlined />, label: "Cập nhật tin tức" },
            { key: "/manager/classes", icon: <BookOutlined />, label: "Theo dõi lớp học" },
            { key: "/manager/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
        teacher: [
            { key: "/teacher/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/teacher/classes", icon: <BookOutlined />, label: "Lớp học của tôi" },
            { key: "/teacher/schedule", icon: <CalendarOutlined />, label: "Lịch giảng dạy" },
            { key: "/teacher/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login"; 
    };
    

    return (
        <Sider collapsible collapsed={collapsed} trigger={null} style={{ height: "100vh" }}>
            {/* Logo + Toggle button */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "#001529",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                }}
            >
                {!collapsed && "🎓 School System"}
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={toggleCollapse}
                    style={{ color: "white" }}
                />
            </div>

            {/* Hiển thị Menu nếu role hợp lệ */}
            {role && menus[role] ? (
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={(e) => navigate(e.key)}
                    items={menus[role]}
                />
            ) : (
                <div style={{ padding: "20px", color: "white" }}>Không có quyền truy cập</div>
            )}

            {/* Logout Button */}
            <div style={{ position: "absolute", bottom: "20px", width: "100%", padding: "10px" }}>
                <Button type="primary" danger icon={<LogoutOutlined />} block onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </div>
        </Sider>
    );
};

export default Sidebar;
