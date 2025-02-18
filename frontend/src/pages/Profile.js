import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Form, Input, Divider, message } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    message.error("Bạn chưa đăng nhập!");
                    return;
                }
                console.log(token);
                
                const response = await axios.get("http://127.0.0.1:8000/users/user/info", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
                form.setFieldsValue(response.data);
            } catch (error) {
                message.error("Lỗi khi lấy thông tin người dùng.");
            }
        };

        fetchUserInfo();
    }, []);

    if (!user) {
        return <div style={{ textAlign: "center", padding: "50px" }}>Đang tải...</div>;
    }

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    const token = localStorage.getItem("token");
                    await axios.put(`http://127.0.0.1:8000/users/${user.id}`, values, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setUser(values);
                    setIsEditing(false);
                    message.success("Thông tin đã được cập nhật!");
                } catch (error) {
                    message.error("Lỗi khi cập nhật thông tin.");
                }
            })
            .catch((errorInfo) => {
                console.log("Validate Failed:", errorInfo);
            });
    };

    const handleChangePassword = () => {
        passwordForm.validateFields()
            .then(async (values) => {
                if (values.newPassword !== values.confirmPassword) {
                    message.error("Mật khẩu xác nhận không khớp!");
                    return;
                }

                try {
                    const token = localStorage.getItem("token");
                    await axios.put(`http://127.0.0.1:8000/users/${user.id}/change-password`, 
                        { newPassword: values.newPassword }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    message.success("Mật khẩu đã được thay đổi!");
                    setIsChangingPassword(false);
                    passwordForm.resetFields();
                } catch (error) {
                    message.error("Lỗi khi đổi mật khẩu.");
                }
            })
            .catch((errorInfo) => {
                console.log("Validate Failed:", errorInfo);
            });
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Card style={{ width: 400, textAlign: "center" }}>
                <Avatar size={100} icon={<UserOutlined />} />
                <h2 style={{ marginTop: 10 }}>{user.full_name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Số điện thoại:</strong> {user.phone_number}</p>
                <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : user.role === "manager" ? "Quản lý giảng viên" : "Giảng viên"}</p>
                <Divider />

                {isEditing ? (
                    <Form form={form} initialValues={user} layout="vertical">
                        <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                            <Input />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}> 
                            <Input disabled />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}> 
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
