import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Space, Typography, message, Popconfirm, Form } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from "@ant-design/icons";
import moment from "moment";
import * as XLSX from "xlsx"; 
import { useNavigate, Link } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import { fetchStudents, createStudent, updateStudent, deleteStudent, uploadStudentImage } from "../../api/students";
import { detectFaceAPI } from "../../api/face";
import StudentForm from "../../components/StudentForm";

const { Title } = Typography;
const StudentManagement = () => {
    usePageTitle("Student Management");
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [previewImage, setPreviewImage] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudentsData();
        // eslint-disable-next-line
    }, []);

    const fetchStudentsData = async () => {
        setLoading(true);
        try {
            const data = await fetchStudents();
            setStudents(data);
            setFilteredStudents(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách học sinh.");
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
        const filtered = students.filter(
            (student) =>
                student.id.toString().includes(value) ||
                student.full_name.toLowerCase().includes(value) ||
                student.email.toLowerCase().includes(value) ||
                student.phone_number.includes(value)
        );
        setFilteredStudents(filtered);
    };

    const showModal = (student = null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
        form.setFieldsValue(
            student
                ? { 
                    ...student, 
                    date_of_birth: student.date_of_birth ? moment(student.date_of_birth) : null,
                    image_url: student.image || student.image_url || ""
                  }
                : { full_name: "", email: "", phone_number: "", address: "", date_of_birth: null, image_url: "" }
        );
    };

    const handleOk = async () => {
        try {
            // Validate form trước khi upload ảnh
            const values = await form.validateFields();
            let imageUrl = form.getFieldValue("image_url");
            // Nếu có file preview (ảnh mới), kiểm tra khuôn mặt và upload lên cloud trước khi lưu
            if (previewFile) {
                setUploading(true);
                // Gọi API backend kiểm tra khuôn mặt trước khi upload
                const faceCheck = await detectFaceAPI(previewFile);
                if (!faceCheck.success) {
                    setUploading(false);
                    message.error("Không phát hiện khuôn mặt trong ảnh. Vui lòng chọn ảnh khác!");
                    return;
                }
                // Nếu qua kiểm tra khuôn mặt thì upload lên cloud
                const response = await uploadStudentImage(previewFile);
                imageUrl = response.image_url;
                setUploading(false);
            }
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null,
                admission_year: values.admission_year || new Date().getFullYear(),
                status: values.status || "active",
                address: values.address || "Chưa cập nhật",
                image_url: imageUrl || null
            };
            
            if (editingStudent) {
                await updateStudent(editingStudent.id, payload);
                message.success("Cập nhật học sinh thành công!");
            } else {
                await createStudent(payload);
                message.success("Thêm học sinh thành công!");
            }

            fetchStudentsData();
            setIsModalOpen(false);
            form.resetFields();
            setPreviewImage(null);
            setPreviewFile(null);
        } catch (error) {
            setUploading(false);
            if (error.name === "ValidationError") {
                // Form chưa hoàn thành
                return;
            }
            if (error.response?.status === 400 && error.response.data.detail === "Email đã tồn tại") {
                message.error("Email đã tồn tại. Vui lòng nhập email khác!");
            } else {
                message.error("Lỗi khi lưu học sinh. Vui lòng thử lại.");
            }
        }
    };

    const handleUpload = async ({ file }) => {
        setUploading(true);
        try {
            const response = await uploadStudentImage(file);
            form.setFieldsValue({ image_url: response.image_url });
            message.success("Ảnh mới đã tải lên thành công! Ảnh cũ sẽ được xóa tự động.");
        } catch (error) {
            if (error.message === "Unauthorized") {
                message.error("Bạn không có quyền upload ảnh.");
            } else {
                message.error("Lỗi khi tải ảnh lên Cloudinary.");
            }
        }
        setUploading(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteStudent(id);
            message.success("Xóa học sinh thành công!");
            fetchStudentsData();
        } catch (error) {
            handleRequestError(error, "Lỗi khi xóa học sinh.");
        }
    };

    // 🔹 Cấu hình cột của bảng danh sách học sinh
    const columns = [
        {
            title: "Mã sinh viên",
            dataIndex: "id",
            key: "id",
            render: (text) => (
                <Link to={`/manager/students/${text}`} style={{ color: 'blue' }}>
                    {text}
                </Link>
            ), // Link tới trang chi tiết học sinh
        },
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Năm nhập học", dataIndex: "admission_year", key: "admission_year" },
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

    return (
        <div style={{ padding: 20 }}>
            <Title level={2}>Quản lý học sinh</Title>
            <Space style={{ marginBottom: 20 }}>
                <input placeholder="Tìm kiếm học sinh..." onChange={handleSearch} />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm học sinh
                </Button>
                <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                    Xuất Excel
                </Button>
            </Space>
            <Table columns={columns} dataSource={filteredStudents} loading={loading} rowKey="id" />
            <Modal 
                title={editingStudent ? "Cập nhật học sinh" : "Thêm học sinh"} 
                open={isModalOpen} 
                onOk={handleOk} 
                onCancel={() => { setIsModalOpen(false); setPreviewImage(null); setPreviewFile(null); }}
            >
                <StudentForm
                    form={form}
                    editingStudent={editingStudent}
                    uploading={uploading}
                    setPreviewFile={setPreviewFile}
                    previewImage={previewImage}
                    setPreviewImage={setPreviewImage}
                />
            </Modal>
        </div>
    );
};

export default StudentManagement;