import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, Modal, Form, Input, message, Popconfirm, DatePicker } from "antd";
import { EditOutlined, DeleteOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf"; // ✅ Import jsPDF để xuất PDF
import moment from "moment";

const { Title, Text } = Typography;

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        fetchStudent();
    }, []);

    const fetchStudent = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/students/${id}`, {
                headers: getAuthHeaders(),
            });
            setStudent(response.data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải thông tin học sinh.");
        }
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.response?.status === 401) {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        } else if (error.response?.status === 403) {
            message.error("Bạn không có quyền thực hiện thao tác này!");
        } else {
            message.error(defaultMessage);
        }
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : "2000-01-01",
            };

            await axios.put(`http://127.0.0.1:8000/students/${id}`, payload, {
                headers: getAuthHeaders(),
            });
            messageApi.success("Cập nhật thông tin thành công!");
            setIsModalOpen(false);
            fetchStudent();
        } catch (error) {
            handleRequestError(error, "Lỗi khi cập nhật.");
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/students/${id}`, {
                headers: getAuthHeaders(),
            });
            messageApi.success("Xóa học sinh thành công!");
            navigate("/students");
        } catch (error) {
            handleRequestError(error, "Lỗi khi xóa học sinh.");
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
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address">
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
