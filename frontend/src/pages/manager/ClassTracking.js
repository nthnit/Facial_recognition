import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Modal, Form, message, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";

const ClassTracking = () => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    // Fetch danh sách lớp học từ API
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/classes", {
                headers: getAuthHeaders(),
            });
            setClasses(response.data);
            setFilteredClasses(response.data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách lớp học.");
        }
        setLoading(false);
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

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = classes.filter(
            (cls) =>
                cls.class_code.toLowerCase().includes(value) ||
                cls.name.toLowerCase().includes(value) ||
                cls.teacher_id.toString().includes(value)
        );

        setFilteredClasses(filtered);
    };

    const exportToExcel = () => {
        if (classes.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }

        const dataToExport = classes.map((cls) => ({
            "Mã lớp": cls.class_code,
            "Tên lớp": cls.name,
            "Giáo viên": cls.teacher_id,
            "Ngày bắt đầu": moment(cls.start_date).format("DD-MM-YYYY"),
            "Ngày kết thúc": moment(cls.end_date).format("DD-MM-YYYY"),
            "Số buổi học": cls.total_sessions,
            "Môn học": cls.subject,
            "Trạng thái": cls.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách lớp");

        XLSX.writeFile(workbook, "DanhSachLop.xlsx");
        message.success("Xuất danh sách lớp học thành công!");
    };

    const showModal = (classData = null) => {
        setEditingClass(classData);
        setIsModalOpen(true);
        form.setFieldsValue(
            classData
                ? {
                      ...classData,
                      start_date: classData.start_date ? moment(classData.start_date) : null,
                      end_date: classData.end_date ? moment(classData.end_date) : null,
                  }
                : { class_code: "", name: "", teacher_id: "", start_date: null, end_date: null, total_sessions: "", subject: "", status: "" }
        );
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
                end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
            };

            if (editingClass) {
                await axios.put(`http://127.0.0.1:8000/classes/${editingClass.id}`, payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Cập nhật lớp học thành công!");
            } else {
                await axios.post("http://127.0.0.1:8000/classes", payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Thêm lớp học thành công!");
            }
            fetchClasses();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi lưu lớp học.");
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá lớp học?",
            content: "Bạn có chắc chắn muốn xoá lớp học này không?",
            onOk: async () => {
                try {
                    await axios.delete(`http://127.0.0.1:8000/classes/${id}`, {
                        headers: getAuthHeaders(),
                    });
                    message.success("Xóa lớp học thành công!");
                    fetchClasses();
                } catch (error) {
                    handleRequestError(error, "Lỗi khi xóa lớp học.");
                }
            },
        });
    };

    const columns = [
        {
            title: "Mã lớp",
            dataIndex: "class_code",
            key: "class_code",
            render: (text, record) => <Link to={`/manager/classes/${record.id}`}>{text}</Link>,
        },
        { title: "Tên lớp", dataIndex: "name", key: "name" },
        { title: "Giảng viên", dataIndex: "teacher_id", key: "teacher_id" },
        { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date", render: (date) => moment(date).format("DD-MM-YYYY") },
        { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date", render: (date) => moment(date).format("DD-MM-YYYY") },
        { title: "Số buổi học", dataIndex: "total_sessions", key: "total_sessions" },
        { title: "Môn học", dataIndex: "subject", key: "subject" },
        { title: "Trạng thái", dataIndex: "status", key: "status" },
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
            <h2>Danh sách Lớp học</h2>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tìm kiếm lớp học..." prefix={<SearchOutlined />} onChange={handleSearch} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm lớp học
                </Button>
                <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                    Xuất Excel
                </Button>
            </Space>
            <Table columns={columns} dataSource={filteredClasses} loading={loading} rowKey="id" />

            <Modal title={editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClassTracking;
