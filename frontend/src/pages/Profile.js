import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Form, Input, Divider, message } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, LockOutlined } from "@ant-design/icons";

// Hàm lấy thông tin user (có thể thay bằng API backend)
const getUserInfo = () => {
    return {
        name: "Nguyễn Văn A",
        email: "user@example.com",
        role: localStorage.getItem("role") || "teacher", // Lấy role từ localStorage
    };
};

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [user, setUser] = useState(getUserInfo());
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(user);
    }, [user, form]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        form.validateFields()
            .then((values) => {
                setUser(values);
                setIsEditing(false);
                message.success("Thông tin đã được cập nhật!");
            })
            .catch((errorInfo) => {
                console.log("Validate Failed:", errorInfo);
            });
    };

    const handleChangePassword = () => {
        passwordForm.validateFields()
            .then((values) => {
                if (values.newPassword !== values.confirmPassword) {
                    message.error("Mật khẩu xác nhận không khớp!");
                    return;
                }
                message.success("Mật khẩu đã được thay đổi!");
                setIsChangingPassword(false);
                passwordForm.resetFields();
            })
            .catch((errorInfo) => {
                console.log("Validate Failed:", errorInfo);
            });
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Card style={{ width: 400, textAlign: "center" }}>
                <Avatar size={100} icon={<UserOutlined />} />
                <h2 style={{ marginTop: 10 }}>{user.name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : user.role === "manager" ? "Quản lý giảng viên" : "Giảng viên"}</p>
                <Divider />

                {isEditing ? (
                    <Form form={form} initialValues={user} layout="vertical">
                        <Form.Item label="Họ và Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                            <Input />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}> 
                            <Input />
                        </Form.Item>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                            Lưu thay đổi
                        </Button>
                    </Form>
                ) : (
                    <>
                        <Button type="default" icon={<EditOutlined />} onClick={handleEdit} block>
                            Chỉnh sửa thông tin
                        </Button>
                        <Button type="danger" icon={<LockOutlined />} onClick={() => setIsChangingPassword(true)} block style={{ marginTop: 10 }}>
                            Đổi mật khẩu
                        </Button>
                    </>
                )}

                {isChangingPassword && (
                    <Form form={passwordForm} layout="vertical" style={{ marginTop: 20 }}>
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}> 
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới!" }]}> 
                            <Input.Password />
                        </Form.Item>
                        <Button type="primary" onClick={handleChangePassword} block>
                            Lưu mật khẩu mới
                        </Button>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default Profile;
