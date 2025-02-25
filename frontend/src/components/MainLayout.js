import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import AppFooter from "./AppFooter";
import TopNavbar from "./TopNavbar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false); // State để theo dõi trạng thái của Sidebar

    const handleSidebarCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout style={{ minHeight: "100vh", display: "flex" }}>
            {/* Sidebar Cố Định */}
            <Sidebar collapsed={collapsed} onCollapse={handleSidebarCollapse} />

            {/* Layout chính */}
            <Layout style={{ marginLeft: collapsed ? "80px" : "200px", display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Truyền collapsed vào TopNavbar */}
                <TopNavbar collapsed={collapsed} />
                {/* Nội dung chính */}
                <Content style={{ padding: 20, flex: 1, marginTop: 64 }}>
                    <Outlet />
                </Content>

                {/* Footer luôn nằm dưới */}
                <AppFooter />
            </Layout>
        </Layout>
    );
};

export default MainLayout;
