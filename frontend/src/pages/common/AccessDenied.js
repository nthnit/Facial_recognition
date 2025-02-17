import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { FrownOutlined } from "@ant-design/icons";

const AccessDenied = ({ defaultRoute }) => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <FrownOutlined style={styles.icon} />
                <h1 style={styles.title}>🚫 Oops! Bạn không có quyền truy cập</h1>
                <p style={styles.description}>
                    Có vẻ như bạn đang cố gắng truy cập một trang không dành cho bạn. Nhưng đừng lo! Hãy quay lại và tiếp tục khám phá những gì phù hợp với bạn nhé. 😊
                </p>
                <Button type="primary" size="large" onClick={() => navigate(defaultRoute || "/")} style={styles.button}>
                    🔙 Quay về trang chính
                </Button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        textAlign: "center",
    },
    content: {
        padding: "40px",
        borderRadius: "10px",
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
    },
    icon: {
        fontSize: "60px",
        color: "#ff4d4f",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        margin: "20px 0",
    },
    description: {
        fontSize: "16px",
        color: "#666",
        marginBottom: "20px",
    },
    button: {
        fontSize: "16px",
        padding: "10px 20px",
    },
};

export default AccessDenied;
