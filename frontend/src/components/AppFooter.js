import React from "react";
import { Layout, Typography, Space } from "antd";

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter = () => {
    return (
        <Footer style={{
            textAlign: "center",
            background: "#f0f2f5",
            padding: "20px",
            fontSize: "14px",
            color: "#666",
            borderTop: "1px solid #ddd"
        }}>
            <Space direction="vertical">
                <Text strong>WeLearn Hub ©{new Date().getFullYear()} - All Rights Reserved</Text>
                <Space>
                    <a href="/privacy-policy" style={{ color: "#1890ff" }}>Privacy Policy</a>
                    <a href="/terms-of-service" style={{ color: "#1890ff" }}>Terms of Service</a>
                    <a href="/contact" style={{ color: "#1890ff" }}>Contact Us</a>
                </Space>
            </Space>
        </Footer>
    );
};

export default AppFooter;
