import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import wonderbotVSad from "../../assets/images/verysad.png"
import usePageTitle from "./usePageTitle";
import logoSB from "../../assets/images/logoSB.svg"
const AccessDenied = ({ defaultRoute }) => {
    usePageTitle("Access Denied");
    const navigate = useNavigate();

    return (
        <>
            <img src={logoSB} alt="Logo" style={styles.logo} />
            <div style={styles.container}>
                <div style={styles.content}>
                    <img src={wonderbotVSad} alt="Wonderbot Searching" style={styles.image} />
                    <h1 style={styles.title}>🚫 Oops! Bạn không có quyền truy cập</h1>
                    <p style={styles.description}>
                        Có vẻ như bạn đang cố gắng truy cập một trang không dành cho bạn. Nhưng đừng lo! Hãy quay lại và tiếp tục khám phá những gì phù hợp với bạn nhé. 😊
                    </p>
                    <Button type="primary" size="large" onClick={() => navigate(defaultRoute || "/")} style={styles.button}>
                        <ArrowLeftOutlined />  Quay về trang chính
                    </Button>
                </div>
            </div>
        </>
        
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
    image: {
        width: "200px", 
        height: "auto",
        marginBottom: "20px",
    },
    logo: {
        position: "absolute",
        top: "25px",
        left: "25px",
        width: "80px",
        height: "auto",
    },
};

export default AccessDenied;
