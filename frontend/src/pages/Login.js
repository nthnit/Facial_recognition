import React, { useState } from "react";
import { Form, Input, Button, Card, App } from "antd"; // Import App từ antd
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";  // Import API login từ file auth.js
import logoWL from "../assets/images/logoWL.png"
import logoWhite from "../assets/images/logowhite.svg"
import loginPattern from "../assets/images/image 4.svg"
import usePageTitle from "./common/usePageTitle";
const Login = () => {
    usePageTitle("Login");
    const navigate = useNavigate();
    const { message } = App.useApp();  // Lấy `message` từ App.useApp() để tránh cảnh báo antd
    const [loading, setLoading] = useState(false);  // State để hiển thị loading khi đang đăng nhập

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log("Đang gửi thông tin đăng nhập:", values); // Log thông tin gửi đi

            // Gọi API login từ auth.js
            const response = await login(values.email, values.password);
            
            console.log("Phản hồi từ backend:", response); // Log phản hồi từ backend

            const { access_token, role } = response;

            // Lưu token và role vào localStorage
            localStorage.setItem("token", access_token);
            localStorage.setItem("role", role);

            message.success("Đăng nhập thành công!");

            // Điều hướng đến trang tương ứng với role
            if (role === "admin") {
                navigate("/admin/users");
            } else if (role === "teacher_manager") {
                navigate("/manager/assign");
            } else if (role === "teacher") {
                navigate("/teacher/dashboard");
            } else if (role === "manager") {
                navigate("/manager/dashboard");
            } else {
                navigate("/"); // Mặc định về trang chủ nếu role không khớp
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            message.error("Đăng nhập thất bại! Kiểm tra lại tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" }}>
            <div style={{ width: "50%", background: "linear-gradient( #D4EDFF, #0066cc)", padding: "50px", color: "#fff", textAlign: "center", borderRadius: "10px 0 0 10px" }}>
                <img 
                    src={logoWL}  // Thay logo thật của bạn
                    alt="WeLearn Logo"
                    style={{ maxWidth: "150px", marginBottom: "20px", marginTop: "60px"}}
                />
                <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>WeLearn English</h1>
                <p style={{ fontSize: "16px" }}>Hệ thống quản lý nội bộ WeLearn</p>
                <img 
                    src={loginPattern} 
                    alt=""
                    style={{ width: "500px", height: "auto", marginBottom: "20px", marginLeft: "auto", marginRight: "auto" }}
                />
            </div>

            <Card style={{ width: 400, boxShadow: "0 4px 8px rgba(0,0,0,0.1)", borderRadius: "0 10px 10px 0", padding: "40px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "bold" }}>Sign In to WeLearn Hub</h2>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item
                        label="Email Address"
                        name="email"
                        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                    >
                        <Input placeholder="youremail@gmail.com" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ background: "linear-gradient(to right, #00aaff, #0066cc)"
, borderRadius: "5px", fontWeight: "bold" }}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
