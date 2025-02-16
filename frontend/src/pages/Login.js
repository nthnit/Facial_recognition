import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const response = await axios.post("http://localhost:8000/login/", values);
            const { token, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            message.success("Đăng nhập thành công!");
            
            // Điều hướng dựa trên role
            if (role === "admin") {
                navigate("/admin/users");
            } else if (role === "teacher_manager") {
                navigate("/manager/assign");
            } else if (role === "teacher") {
                navigate("/teacher/dashboard");
            }
        } catch (error) {
            message.error("Đăng nhập thất bại! Kiểm tra lại tài khoản.");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Card title="Đăng nhập" style={{ width: 300 }}>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Đăng nhập</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
