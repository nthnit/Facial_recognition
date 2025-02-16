import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { UserOutlined, CalendarOutlined, BookOutlined, DashboardOutlined, PictureOutlined, SolutionOutlined, LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Menu cho từng role
    const menus = {
        admin: [
            { key: "/admin/users", icon: <UserOutlined />, label: "Quản lý người dùng" },
            { key: "/admin/banner", icon: <PictureOutlined />, label: "Quản lý banner" },
            { key: "/admin/profile", icon: <UserOutlined />, label: "Hồ sơ cá nhân" },
        ],
        manager: [
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
        localStorage.removeItem("token"); // Xóa token khi đăng xuất
        localStorage.removeItem("role"); // Xóa role nếu cần
        navigate("/");
    };

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapse} trigger={null} style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#001529", color: "white", fontSize: "18px", fontWeight: "bold" }}>
                {!collapsed && "🎓 School System"}
                <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={toggleCollapse} style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={(e) => navigate(e.key)}
                    items={menus[role] || []} // Hiển thị menu theo role
                />
                <div style={{ marginTop: "auto", padding: "10px", textAlign: "center" }}>
                    <Button type="primary" danger icon={<LogoutOutlined />} block onClick={handleLogout}>Đăng xuất</Button>
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
