import React, { useState, useEffect } from "react";
import { Card, Avatar, Button, Form, Input, Divider, message, DatePicker, Upload, Row, Col } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, LockOutlined, UploadOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import API_BASE_URL from "../api/config";
import moment from "moment";
import usePageTitle from "./common/usePageTitle";


const Profile = () => {
    usePageTitle("Profile");
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [user, setUser] = useState(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/users/user/info`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(response.data);
            form.setFieldsValue({
                ...response.data,
                date_of_birth: response.data.date_of_birth ? moment(response.data.date_of_birth) : null,
            });
        } catch (error) {
            message.error("Lỗi khi lấy thông tin người dùng.");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        form.setFieldsValue({
            ...user,
            date_of_birth: user.date_of_birth ? moment(user.date_of_birth) : null,
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem("token");

            // Chuyển ngày sinh từ moment thành định dạng 'YYYY-MM-DD'
            values.date_of_birth = values.date_of_birth.format("YYYY-MM-DD");

            await axios.put(`${API_BASE_URL}/users/${user.id}`, values, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(values);
            setIsEditing(false);
            message.success("Thông tin đã được cập nhật!");
            fetchUserInfo();
        } catch (error) {
            message.error("Lỗi khi cập nhật thông tin.");
        }
    };

    const handleUpload = async ({ file }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE_URL}/uploads/upload-image/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            // Cập nhật đường dẫn ảnh vào form
            form.setFieldsValue({ avatar_url: response.data.image_url });
            message.success("Ảnh đã tải lên thành công!");
        } catch (error) {
            message.error("Lỗi khi tải ảnh lên.");
        }
        setUploading(false);
    };

    const handleChangePassword = async () => {
        try {
            const values = await passwordForm.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                message.error("Mật khẩu xác nhận không khớp!");
                return;
            }

            const token = localStorage.getItem("token");
            await axios.put(
                `${API_BASE_URL}/users/${user.id}/change-password`,
                {
                    old_password: values.oldPassword,
                    new_password: values.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            message.success("Mật khẩu đã được thay đổi!");
            setIsChangingPassword(false);
            passwordForm.resetFields();
        } catch (error) {
            message.error("Lỗi khi đổi mật khẩu.");
        }
    };

    const handleCancelPasswordChange = () => {
        passwordForm.resetFields();
        setIsChangingPassword(false);
    };

    if (!user) {
        return <div style={{ textAlign: "center", padding: "50px" }}>Đang tải...</div>;
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Card style={{ width: 500, textAlign: "center", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", borderRadius: 10 }}>
                <Avatar size={120} src={user.avatar_url || "https://via.placeholder.com/150"} style={{border:"5px solid rgb(0, 147, 239)"}}/>
                <h2 style={{ marginTop: 10 }}>{user.full_name}</h2>
                <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : user.role === "manager" ? "Quản lý giảng viên" : "Giảng viên"}</p>

                <Divider />

                {isEditing ? (
                    <Form form={form} layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}>
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Địa chỉ" name="address">
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <Form.Item label="Ngày sinh" name="date_of_birth">
                            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item label="Tải ảnh đại diện lên">
                            <Upload customRequest={handleUpload} showUploadList={false}>
                                <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item label="Đường dẫn ảnh đại diện" name="avatar_url" initialValue={user.avatar_url}>
                            <Input readOnly />
                        </Form.Item>

                        <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
                            <Input disabled value={user.role} />
                        </Form.Item>

                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} block>
                            Lưu thay đổi
                        </Button>
                        <Button type="default" icon={<CloseOutlined />} onClick={handleCancelEdit} block style={{ marginTop: 10 }}>
                            Hủy
                        </Button>
                    </Form>
                ) : (
                    <>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Số điện thoại:</strong> {user.phone_number}</p>
                        <p><strong>Địa chỉ:</strong> {user.address}</p>
                        <p><strong>Ngày sinh:</strong> {moment(user.date_of_birth).format("DD-MM-YYYY")}</p>
                        <p><strong>Vai trò:</strong> {user.role}</p>

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
                        <Form.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" rules={[{ required: true, message: "Vui lòng nhập lại mật khẩu!" }]}>
                            <Input.Password />
                        </Form.Item>
                        <Button type="primary" onClick={handleChangePassword} block>
                            Lưu mật khẩu mới
                        </Button>
                        <Button type="default" icon={<CloseOutlined />} onClick={handleCancelPasswordChange} block style={{ marginTop: 10 }}>
                            Hủy
                        </Button>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default Profile;
