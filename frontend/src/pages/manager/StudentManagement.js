import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage(); // ✅ Sử dụng message.useMessage()

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/students");
            setStudents(response.data);
        } catch (error) {
            messageApi.error("Lỗi khi tải danh sách học sinh."); // ✅ Dùng messageApi thay vì message.error
        }
        setLoading(false);
    };

    const showModal = (student = null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
        form.setFieldsValue(
            student || { full_name: "", email: "", phone_number: "", address: "" }
        );
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingStudent) {
                await axios.put(`http://127.0.0.1:8000/students/${editingStudent.id}`, values);
                messageApi.success("Cập nhật học sinh thành công!"); // ✅ Sử dụng messageApi
            } else {
                await axios.post("http://127.0.0.1:8000/students", values);
                messageApi.success("Thêm học sinh thành công!");
            }
            fetchStudents();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            messageApi.error("Lỗi khi lưu học sinh.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/students/${id}`);
            messageApi.success("Xóa học sinh thành công!"); // ✅ Sử dụng messageApi
            fetchStudents();
        } catch (error) {
            messageApi.error("Lỗi khi xóa học sinh.");
        }
    };

    const columns = [
        { title: "Mã sinh viên", dataIndex: "id", key: "id" },
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
        { title: "Địa chỉ", dataIndex: "address", key: "address" },
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
            {contextHolder} {/* ✅ Đặt contextHolder ở đây để message hoạt động */}
            <Title level={2}>Quản lý học sinh</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 20 }}>
                Thêm học sinh
            </Button>
            <Table columns={columns} dataSource={students} loading={loading} rowKey="id" />

            <Modal
                title={editingStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh"}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
            >
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
                    <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentManagement;
