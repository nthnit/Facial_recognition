import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import usePageTitle from "./usePageTitle";
import wonderbotSad from "../../assets/images/sad.png"
import logoSB from "../../assets/images/logoSB.svg"
const NotFound = () => {
    usePageTitle("Page Not Found");
    const navigate = useNavigate();
    const [redirectPath, setRedirectPath] = useState("/");

    useEffect(() => {
        // Lấy role từ localStorage và thiết lập đường dẫn quay về
        const role = localStorage.getItem("role");
        if (role === "admin") setRedirectPath("/admin/users");
        else if (role === "manager") setRedirectPath("/manager/assign");
        else if (role === "teacher") setRedirectPath("/teacher/dashboard");
        else setRedirectPath("/login"); // Nếu không có role, quay về trang login
    }, []);

    return (
        <>
            <img src={logoSB} alt="Logo" style={styles.logo} />
            <div style={styles.container}>
                <div style={styles.content}>
                    <img src={wonderbotSad} alt="Wonderbot Searching" style={styles.image} />
                    <h1 style={styles.title}>404 - Không tìm thấy trang</h1>
                    <p style={styles.description}>
                        Oops! Trang bạn đang tìm kiếm không tồn tại. Hãy kiểm tra lại địa chỉ hoặc quay về trang chính nhé!
                    </p>
                    <Button type="primary" size="large" onClick={() => navigate(redirectPath)} style={styles.button}>
                        <ArrowLeftOutlined /> Quay về trang chính
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
    image: {
        width: "200px", 
        height: "auto",
        marginBottom: "20px",
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
    logo: {
        position: "absolute",
        top: "25px",
        left: "25px",
        width: "80px",
        height: "auto",
    },
};

export default NotFound;
