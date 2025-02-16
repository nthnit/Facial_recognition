import React, { useState } from "react";
import { Table, Button, Popconfirm, Modal, Form, Input, Select, Space } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([
        { key: "1", name: "Nguyễn Văn A", email: "a@example.com", role: "Giảng viên" },
        { key: "2", name: "Trần Thị B", email: "b@example.com", role: "Quản lý giảng viên" },
    ]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const showModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
        form.setFieldsValue(user || { name: "", email: "", role: "" });
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (editingUser) {
                setUsers(users.map((user) => (user.key === editingUser.key ? { ...values, key: editingUser.key } : user)));
            } else {
                setUsers([...users, { ...values, key: (users.length + 1).toString() }]);
            }
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    const handleDelete = (key) => {
        setUsers(users.filter(user => user.key !== key));
    };

    const columns = [
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Vai trò", dataIndex: "role", key: "role" },
        { 
            title: "Hành động", 
            key: "action", 
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)} okText="Xóa" cancelText="Hủy">
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
            <Table columns={columns} dataSource={users} />
            
            <Modal title={editingUser ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ và Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}> 
                        <Select>
                            <Option value="Giảng viên">Giảng viên</Option>
                            <Option value="Quản lý giảng viên">Quản lý giảng viên</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
