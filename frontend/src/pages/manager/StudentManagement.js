import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx"; 
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
            return {};
        }
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // 🔹 API lấy danh sách học sinh
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/students", {
                headers: getAuthHeaders(),
            });
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách học sinh.");
        }
        setLoading(false);
    };

    // 🔹 Xử lý lỗi API
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

    // 🔹 Chức năng tìm kiếm học sinh
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        
        const filtered = students.filter(
            (student) =>
                student.id.toString().includes(value) ||
                student.full_name.toLowerCase().includes(value) ||
                student.email.toLowerCase().includes(value) ||
                student.phone_number.includes(value)
        );

        setFilteredStudents(filtered);
    };

    // 🔹 Hiển thị modal thêm/sửa học sinh
    const showModal = (student = null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
        form.setFieldsValue(
            student
                ? { ...student, date_of_birth: student.date_of_birth ? moment(student.date_of_birth) : null }
                : { full_name: "", email: "", phone_number: "", address: "", date_of_birth: null }
        );
    };

    // 🔹 Xử lý thêm hoặc cập nhật học sinh
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
                admission_year: values.admission_year || new Date().getFullYear(),
                status: values.status || "active",
            };

            if (editingStudent) {
                await axios.put(`http://127.0.0.1:8000/students/${editingStudent.id}`, payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Cập nhật học sinh thành công!");
            } else {
                await axios.post("http://127.0.0.1:8000/students", payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Thêm học sinh thành công!");
            }

            fetchStudents();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi lưu học sinh.");
        }
    };

    // 🔹 Xử lý xoá học sinh
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/students/${id}`, {
                headers: getAuthHeaders(),
            });
            message.success("Xóa học sinh thành công!");
            fetchStudents();
        } catch (error) {
            handleRequestError(error, "Lỗi khi xóa học sinh.");
        }
    };

    // 🔹 Xuất danh sách học sinh ra file Excel
    const exportToExcel = () => {
        if (students.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }

        const dataToExport = students.map((student) => ({
            "Mã sinh viên": student.id,
            "Họ và Tên": student.full_name,
            "Email": student.email,
            "Số điện thoại": student.phone_number,
            "Địa chỉ": student.address,
            "Ngày sinh": student.date_of_birth ? moment(student.date_of_birth).format("DD-MM-YYYY") : "N/A",
            "Năm nhập học": student.admission_year,
            "Trạng thái": student.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách học sinh");

        XLSX.writeFile(workbook, "DanhSachHocSinh.xlsx");
        message.success("Xuất danh sách học sinh thành công!");
    };

    // 🔹 Cấu hình cột của bảng danh sách học sinh
    const columns = [
        {
            title: "Mã sinh viên",
            dataIndex: "id",
            key: "id",
            render: (id) => (
                <Typography.Link onClick={() => navigate(`/manager/students/${id}`)}>
                    {id}
                </Typography.Link>
            ),
        },
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
        { title: "Địa chỉ", dataIndex: "address", key: "address" },
        {
            title: "Ngày sinh",
            dataIndex: "date_of_birth",
            key: "date_of_birth",
            render: (dob) => (dob ? moment(dob).format("DD-MM-YYYY") : "N/A"),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa học sinh này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Title level={2}>Quản lý học sinh</Title>
            <Space style={{ marginBottom: 20 }}>
                <Input placeholder="Tìm kiếm học sinh..." prefix={<SearchOutlined />} onChange={handleSearch} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm học sinh
                </Button>
                <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                    Xuất Excel
                </Button>
            </Space>
            <Table columns={columns} dataSource={filteredStudents} loading={loading} rowKey="id" />
        </div>
    );
};

export default StudentManagement;
