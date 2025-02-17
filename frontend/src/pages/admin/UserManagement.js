import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Modal, Form, Input, Select, Space, message, DatePicker } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios"; // Thêm axios để gọi API
import moment from "moment"; // Để xử lý ngày tháng

const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // Fetch danh sách người dùng từ backend khi component được render
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/users")
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                message.error("Lỗi khi tải danh sách người dùng");
            });
    }, []);

    const showModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
        form.setFieldsValue(user || { full_name: "", email: "", phone_number: "", role: "", date_of_birth: null });
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            
            // Chuyển đổi date_of_birth nếu có
            const dateOfBirth = values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null;
            const payload = { ...values, date_of_birth: dateOfBirth };
            
            
            // Kiểm tra xem ngày sinh đã được chọn hay chưa
            if (!payload.date_of_birth) {
                message.error("Vui lòng chọn ngày sinh");
                return;
            }

            // Xử lý Thêm/Sửa người dùng
            if (editingUser) {
                // Cập nhật người dùng
                axios.put(`http://127.0.0.1:8000/users/${editingUser.id}`, payload)
                    .then(response => {
                        setUsers(users.map((user) => user.id === editingUser.id ? response.data : user));
                        setIsModalOpen(false);
                        form.resetFields();
                    })
                    .catch(error => {
                        message.error("Lỗi khi cập nhật người dùng");
                    });
            } else {
                // Thêm mới người dùng
                axios.post("http://127.0.0.1:8000/users/create", payload)
                    .then(response => {
                        setUsers([...users, response.data]);
                        setIsModalOpen(false);
                        form.resetFields();
                    })
                    .catch(error => {
                        message.error("Lỗi khi thêm người dùng");
                    });
            }
        }).catch(err => {
            console.log("Form validation failed", err);
        });
    };

    const handleDelete = (id) => {
        // Xóa người dùng
        axios.delete(`http://127.0.0.1:8000/users/${id}`)
            .then(response => {
                setUsers(users.filter(user => user.id !== id));
                message.success("Xóa người dùng thành công");
            })
            .catch(error => {
                message.error("Lỗi khi xóa người dùng");
            });
    };

    const columns = [
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
        { title: "Vai trò", dataIndex: "role", key: "role", render: (role) => {
            if (role === "teacher") return "Giáo viên";
            if (role === "manager") return "Quản lý giảng dạy";
            if (role === "admin") return "Quản trị viên";
            return role;
        }},
        { 
            title: "Hành động", 
            key: "action", 
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý Người dùng</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 20 }}>Thêm Người Dùng</Button>
            <Table columns={columns} dataSource={users} rowKey="id" />
            
            <Modal title={editingUser ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}> 
                        <Select>
                            <Option value="teacher">Giáo viên</Option>
                            <Option value="manager">Quản lý giảng dạy</Option>
                            <Option value="admin">Quản trị viên</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="date_of_birth" rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} defaultValue={editingUser ? moment(editingUser.date_of_birth) : null} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
