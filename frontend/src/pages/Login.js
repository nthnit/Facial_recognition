import React, { useState } from "react";
import { Form, Input, Button, Card, App } from "antd"; // Import App từ antd
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";  // Import API login từ file auth.js

const Login = () => {
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
                navigate("/manager/assign");
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
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#f5f5f5"  // Thêm màu nền nhẹ
        }}>
            <Card title="Đăng nhập" style={{ width: 350, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
                    >
                        <Input placeholder="Nhập email của bạn" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
