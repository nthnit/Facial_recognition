import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm, DatePicker, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import * as XLSX from "xlsx";
import moment from "moment";
import usePageTitle from "../common/usePageTitle";
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from "../../api/teachers";

const { Title } = Typography;

const TeacherManagement = () => {
    usePageTitle("Teacher Management");
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeachersData();
    }, []);

    const fetchTeachersData = async () => {
        setLoading(true);
        try {
            const data = await fetchTeachers();
            setTeachers(data);
            setFilteredTeachers(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách giáo viên");
        }
        setLoading(false);
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.message === "Unauthorized") {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        } else {
            message.error(defaultMessage);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = teachers.filter(
            (teacher) =>
                teacher.full_name.toLowerCase().includes(value) ||
                teacher.email.toLowerCase().includes(value) ||
                teacher.phone_number.includes(value)
        );

        setFilteredTeachers(filtered);
    };

    const exportToExcel = () => {
        if (teachers.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }

        const dataToExport = teachers.map((teacher) => ({
            "Họ và Tên": teacher.full_name,
            "Email": teacher.email,
            "Số điện thoại": teacher.phone_number,
            "Ngày sinh": teacher.date_of_birth ? moment(teacher.date_of_birth).format("DD-MM-YYYY") : "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách giáo viên");

        XLSX.writeFile(workbook, "DanhSachGiaoVien.xlsx");
        message.success("Xuất danh sách giáo viên thành công!");
    };

    const showModal = (teacher = null) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
        form.setFieldsValue(
            teacher
                ? { ...teacher, date_of_birth: teacher.date_of_birth ? moment(teacher.date_of_birth) : null }
                : { full_name: "", email: "", phone_number: "", date_of_birth: null, address: "", gender: "male" }
        );
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : "2000-01-01",
            };

            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, payload);
                message.success("Cập nhật thông tin giáo viên thành công!");
            } else {
                await createTeacher(payload);
                message.success("Thêm giáo viên mới thành công!");
            }
            fetchTeachersData();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi lưu thông tin giáo viên");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTeacher(id);
            message.success("Xóa giáo viên thành công!");
            fetchTeachersData();
        } catch (error) {
            handleRequestError(error, "Lỗi khi xóa giáo viên");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", render: (text) => <Link to={`/manager/teachers/${text}`}>{text}</Link> },  // Thêm cột ID
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
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
                        title="Bạn có chắc chắn muốn xóa giáo viên này?"
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
            <Title level={2}>Quản lý Giáo viên</Title>
            <Space style={{ marginBottom: 20 }}>
                <Input
                    placeholder="Tìm kiếm giáo viên..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm Giáo viên
                </Button>
                <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                    Xuất Excel
                </Button>
            </Space>
            <Table columns={columns} dataSource={filteredTeachers} loading={loading} rowKey="id" />

            <Modal title={editingTeacher ? "Chỉnh sửa Giáo viên" : "Thêm Giáo viên"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="date_of_birth">
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender">
                        <Select defaultValue="male">
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                            <Select.Option value="other">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherManagement;
