import React, { useState } from "react";
import { Form, Input, Button, Card, App } from "antd"; // Import App from antd
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";  // Import the login API
import logoWL from "../assets/images/logoWL.png";
import logoWeLearn from "../assets/images/logoWeLearn.svg";
import loginPattern from "../assets/images/image 4.svg";
import usePageTitle from "./common/usePageTitle";

const Login = () => {
    usePageTitle("Login");
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log("Sending login info:", values);

            const response = await login(values.email, values.password);
            console.log("Backend response:", response);

            const { access_token, role } = response;
            localStorage.setItem("token", access_token);
            localStorage.setItem("role", role);

            message.success("Login successful!");

            if (role === "admin") {
                navigate("/admin/users");
            } else if (role === "teacher_manager") {
                navigate("/manager/assign");
            } else if (role === "teacher") {
                navigate("/teacher/dashboard");
            } else if (role === "manager") {
                navigate("/manager/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            message.error("Login failed! Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f5f5f5" }}>
            {/* Image Section */}
            <div style={{ width: "75%", height: "100vh", background: "linear-gradient( #3F8CFF, #265499)", padding: "50px", color: "#fff", textAlign: "center"}}>
                <img 
                    src={logoWeLearn} 
                    alt="WeLearn Logo" 
                    style={{ maxWidth: "350px", marginBottom: "30px", marginTop: "40px" }}
                />
                <h2 style={{ fontSize: "40px", fontWeight:"bold"}}>Hệ thống quản lý giảng dạy nội bộ <br/> WeLearn</h2>
                <img 
                    src={loginPattern} 
                    alt="Login illustration"
                    style={{ width: "32%", height: "auto", position: "absolute", bottom:"7%", left:"20%",  }}
                />
            </div>

            {/* Login Form Section */}
            <Card style={{ width: "25%", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", padding: "40px", height: "100vh", justifyContent:"center", alignItems:"center" }}>
                <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "bold" }}>Sign In to WeLearn Hub</h2>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item
                        label="Email Address"
                        name="email"
                        rules={[{ required: true, message: "Please enter your email!" }]}
                    >
                        <Input placeholder="youremail@gmail.com" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: "Please enter your password!" }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ background: "linear-gradient(to right, #00aaff, #0066cc)", borderRadius: "5px", fontWeight: "bold" }}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
