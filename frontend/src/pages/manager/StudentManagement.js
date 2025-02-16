import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;

const StudentManagement = () => {
    const [students, setStudents] = useState([
        { key: "1", id: "101", name: "Nguyễn Văn A", email: "a@example.com", phone: "0123456789" },
        { key: "2", id: "102", name: "Trần Thị B", email: "b@example.com", phone: "0987654321" },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();

    const showModal = (student = null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
        form.setFieldsValue(student || { id: "", name: "", email: "", phone: "" });
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (editingStudent) {
                setStudents(students.map((student) => (student.key === editingStudent.key ? values : student)));
            } else {
                setStudents([...students, { ...values, key: (students.length + 1).toString() }]);
            }
            setIsModalOpen(false);
            form.resetFields();
        });
    };

    const handleDelete = (key) => {
        setStudents(students.filter((student) => student.key !== key));
    };

    const columns = [
        { title: "Mã sinh viên", dataIndex: "id", key: "id" },
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.key)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Title level={2}>Quản lý học sinh</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 20 }}>
                Thêm học sinh
            </Button>
            <Table columns={columns} dataSource={students} />
            
            <Modal title={editingStudent ? "Chỉnh sửa học sinh" : "Thêm học sinh"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Mã sinh viên" name="id" rules={[{ required: true, message: "Vui lòng nhập mã sinh viên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Họ và Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentManagement;
