import React from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const MainLayout = () => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar />
            <Layout>
                <Content style={{ padding: 20 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
