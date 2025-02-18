import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const TeacherManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [form] = Form.useForm();

    // Fetch danh sách giáo viên từ API
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/teachers");
            setTeachers(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách giáo viên");
        }
    };

    const showModal = (teacher = null) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
        form.setFieldsValue(teacher || { full_name: "", email: "", phone_number: "" });
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    if (editingTeacher) {
                        await axios.put(`http://127.0.0.1:8000/teachers/${editingTeacher.id}`, values);
                        message.success("Cập nhật thông tin giáo viên thành công!");
                    } else {
                        await axios.post("http://127.0.0.1:8000/teachers/create", values);
                        message.success("Thêm giáo viên mới thành công!");
                    }
                    fetchTeachers();
                    setIsModalOpen(false);
                    form.resetFields();
                } catch (error) {
                    message.error("Lỗi khi lưu thông tin giáo viên");
                }
            });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/teachers/${id}`);
            message.success("Xóa giáo viên thành công!");
            fetchTeachers();
        } catch (error) {
            message.error("Lỗi khi xóa giáo viên");
        }
    };

    const columns = [
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Title level={2}>Quản lý Giáo viên</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 20 }}>
                Thêm Giáo viên
            </Button>
            <Table columns={columns} dataSource={teachers} rowKey="id" />

            <Modal title={editingTeacher ? "Chỉnh sửa Giáo viên" : "Thêm Giáo viên"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
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
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherManagement;
