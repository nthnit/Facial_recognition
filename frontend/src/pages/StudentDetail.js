import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, Modal, Form, Input, message, Popconfirm, DatePicker } from "antd";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf"; // ✅ Import jsPDF để xuất PDF
import * as XLSX from "xlsx"; // ✅ Import để xuất Word
import moment from "moment";

const { Title, Text } = Typography;

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchStudent();
    }, []);

    const fetchStudent = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/students/${id}`);
            setStudent(response.data);
        } catch (error) {
            messageApi.error("Lỗi khi tải thông tin học sinh.");
        }
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
            };

            await axios.put(`http://127.0.0.1:8000/students/${id}`, payload);
            messageApi.success("Cập nhật thông tin thành công!");
            setIsModalOpen(false);
            fetchStudent();
        } catch (error) {
            messageApi.error("Lỗi khi cập nhật.");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/students/${id}`);
            messageApi.success("Xóa học sinh thành công!");
            navigate("/students");
        } catch (error) {
            messageApi.error("Lỗi khi xóa học sinh.");
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Thông tin Học Sinh: ${student.full_name}`, 10, 10);
        doc.text(`Mã sinh viên: ${student.id}`, 10, 20);
        doc.text(`Email: ${student.email}`, 10, 30);
        doc.text(`Số điện thoại: ${student.phone_number}`, 10, 40);
        doc.text(`Địa chỉ: ${student.address}`, 10, 50);
        doc.text(`Ngày sinh: ${moment(student.date_of_birth).format("DD-MM-YYYY")}`, 10, 60);
        doc.save(`Student_${student.id}.pdf`);
    };

    if (!student) return <div>Đang tải...</div>;

    return (
        <div style={{ padding: 20 }}>
            {contextHolder}
            <Card title="Thông tin chi tiết học sinh">
                <Title level={3}>{student.full_name}</Title>
                <Text strong>Mã sinh viên:</Text> {student.id} <br />
                <Text strong>Email:</Text> {student.email} <br />
                <Text strong>Số điện thoại:</Text> {student.phone_number} <br />
                <Text strong>Địa chỉ:</Text> {student.address} <br />
                <Text strong>Ngày sinh:</Text> {moment(student.date_of_birth).format("DD-MM-YYYY")} <br />

                <Space style={{ marginTop: 20 }}>
                    <Button icon={<EditOutlined />} type="primary" onClick={() => setIsModalOpen(true)}>
                        Cập nhật
                    </Button>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={handleDelete} okText="Xóa" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                    <Button icon={<FilePdfOutlined />} onClick={exportToPDF}>
                        Xuất PDF
                    </Button>
                </Space>
            </Card>

            <Modal title="Cập nhật thông tin" open={isModalOpen} onOk={handleUpdate} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical" initialValues={{ ...student, date_of_birth: moment(student.date_of_birth) }}>
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="date_of_birth">
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentDetail;
