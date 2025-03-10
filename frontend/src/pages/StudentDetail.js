import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, Modal, Form, Input, message, Popconfirm, DatePicker, Breadcrumb, Table, Tabs, Upload } from "antd";
import { EditOutlined, DeleteOutlined, FilePdfOutlined, UploadOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import wonderbotSearching from "../assets/images/apollo_robot.162763f5b5ae3d3729e593515018f621.svg"
import axios from "axios";
import API_BASE_URL from "../api/config";
import jsPDF from "jspdf"; // ✅ Import jsPDF để xuất PDF
import moment from "moment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [classes, setClasses] = useState([]); // ✅ Danh sách lớp học
    const [sessions, setSessions] = useState([]); // ✅ Danh sách buổi học
    const [uploading, setUploading] = useState(false);
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
        fetchStudentClasses();
        fetchStudentSessions();
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

    // ✅ API lấy danh sách lớp mà học sinh tham gia
    const fetchStudentClasses = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/students/${id}/classes`, {
                headers: getAuthHeaders(),
            });
            setClasses(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách lớp học của học sinh.");
        }
    };

    // ✅ API lấy danh sách buổi học (sessions) của học sinh
    const fetchStudentSessions = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/students/${id}/sessions`, {
                headers: getAuthHeaders(),
            });
            setSessions(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách buổi học.");
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

    // Xử lý upload ảnh lên Cloudinary
    const handleUpload = async ({ file }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                navigate("/login");
                return;
            }
        
            const response = await axios.post(`${API_BASE_URL}/uploads/upload-image/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // Gửi token khi upload ảnh
                },
            });
        
            // Lấy URL từ Cloudinary và set vào form
            form.setFieldsValue({ image_url: response.data.image_url });
            message.success("Ảnh đã tải lên Cloudinary!");
        } catch (error) {
            if (error.response?.status === 403) {
                message.error("Bạn không có quyền upload ảnh.");
            } else {
                message.error("Lỗi khi tải ảnh lên Cloudinary.");
            }
        }
        setUploading(false);
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

    const showUpdateModal = () => {
        form.setFieldsValue({
            full_name: student.full_name,
            email: student.email,
            phone_number: student.phone_number,
            address: student.address,
            date_of_birth: student.date_of_birth ? moment(student.date_of_birth) : null, // Convert to Moment for DatePicker
            image_url: student.image || "", // Prefill with student image
        });
        setIsModalOpen(true);
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

            <Breadcrumb style={{ marginBottom: 20 }}>
                <Breadcrumb.Item>
                    <Link to="/manager/students">Quản lý học sinh</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{student.full_name}</Breadcrumb.Item>
            </Breadcrumb>

            <Card
                title="Thông tin chi tiết học sinh"
                style={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    padding: "20px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {/* Ảnh đại diện */}
                    <img
                        src={student.image || "https://via.placeholder.com/150"} // Nếu không có ảnh, hiển thị ảnh mặc định
                        alt="Ảnh học sinh"
                        style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid #1890ff",
                        }}
                    />

                    {/* Thông tin cá nhân */}
                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ marginBottom: 10, color: "#1890ff" }}>
                            {student.full_name}
                        </Title>

                        <Card.Grid style={{ width: "50%", boxShadow: "none" }}>
                            <Text strong>Mã sinh viên:</Text> {student.id}
                        </Card.Grid>
                        <Card.Grid style={{ width: "50%", boxShadow: "none" }}>
                            <Text strong>Email:</Text> {student.email}
                        </Card.Grid>
                        <Card.Grid style={{ width: "50%", boxShadow: "none" }}>
                            <Text strong>Số điện thoại:</Text> {student.phone_number}
                        </Card.Grid>
                        <Card.Grid style={{ width: "50%", boxShadow: "none" }}>
                            <Text strong>Địa chỉ:</Text> {student.address}
                        </Card.Grid>
                        <Card.Grid style={{ width: "50%", boxShadow: "none" }}>
                            <Text strong>Ngày sinh:</Text> {moment(student.date_of_birth).format("DD-MM-YYYY")}
                        </Card.Grid>
                    </div>
                </div>

                {/* Nút hành động */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Space>
                        <Button icon={<EditOutlined />} type="primary" onClick={() => showUpdateModal(true)}>
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
                </div>
            </Card>


            {/* ✅ Tabs */}
            <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
                {/* ✅ Tab 1: Danh sách lớp học */}
                <TabPane tab="Lớp học đã tham gia" key="1">
                    {classes.length > 0 ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                                gap: "20px",
                                justifyContent: "center",
                                padding: "10px",
                            }}
                        >
                            {classes.map((classItem) => (
                                <Card
                                    key={classItem.id}
                                    hoverable
                                    style={{
                                        borderRadius: "12px",
                                        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                                        transition: "transform 0.3s ease-in-out",
                                        padding: "20px",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <Link to={`/manager/classes/${classItem.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <Title level={4} style={{ color: "#1890ff", marginBottom: "10px" }}>
                                            {classItem.name}
                                        </Title>
                                    </Link>

                                    <p><Text strong>Mã lớp:</Text> {classItem.class_code}</p>
                                    <p><Text strong>Môn học:</Text> {classItem.subject}</p>
                                    <p><Text strong>Giáo viên:</Text> {classItem.teacher_name || "Chưa cập nhật"}</p>
                                    <p><Text strong>Trạng thái:</Text>{" "}
                                        <span style={{
                                            color: classItem.status === "Active" ? "green" : classItem.status === "Closed" ? "red" : "gray",
                                            fontWeight: "bold",
                                        }}>
                                            {classItem.status}
                                        </span>
                                    </p>
                                    <p><Text strong>Ngày bắt đầu:</Text> {moment(classItem.start_date).format("DD-MM-YYYY")}</p>
                                    <p><Text strong>Ngày kết thúc:</Text> {moment(classItem.end_date).format("DD-MM-YYYY")}</p>
                                    <p><Text strong>Tổng số buổi:</Text> {classItem.total_sessions}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        // **UI when there are no classes available**
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#888",
                            fontSize: "16px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "10px",
                            marginTop: "20px",
                        }}>
                            <img 
                                src={wonderbotSearching} 
                                alt="No Classes Available"
                                style={{ width: "350px", height: "350px", marginBottom: "15px", opacity: 1 }}
                            />
                            <p>📚 Học sinh chưa tham gia lớp học nào.</p>
                            <p>Hãy đăng ký lớp để bắt đầu học tập!</p>
                        </div>
                    )}
                </TabPane>


                {/* ✅ Tab 2: Danh sách buổi học */}
                <TabPane tab="Danh sách buổi học" key="2">
                    <Table
                        columns={[
                            {
                                title: "Tên lớp học",
                                dataIndex: "class_name",
                                key: "class_name",
                                render: (text, record) => (
                                    <Link to={`/manager/classes/${record.class_id}`} style={{ color: "blue" }}>
                                        {text}
                                    </Link>
                                ),
                            },
                            { title: "Mã lớp", dataIndex: "class_code", key: "class_code" }, // ✅ Mã lớp
                            {
                                title: "Ngày",
                                dataIndex: "date",
                                key: "date",
                                render: (date) => moment(date).format("DD-MM-YYYY"),
                            },
                            { title: "Thứ", dataIndex: "weekday", key: "weekday" }, // ✅ Thứ trong tuần
                            {
                                title: "Thời gian",
                                key: "time",
                                render: (_, record) => `${record.start_time} - ${record.end_time}`, // ✅ Thời gian bắt đầu - kết thúc
                            },
                            {
                                title: "Trạng thái điểm danh",
                                dataIndex: "attendance_status",
                                key: "attendance_status",
                                render: (status) => {
                                    const color = status === "Present" ? "green" : status === "Absent" ? "red" : "orange";
                                    return <span style={{ color }}>{status}</span>;
                                },
                            },
                            {
                                title: "Tỷ lệ điểm danh",
                                dataIndex: "attendance_rate",
                                key: "attendance_rate",
                                render: (rate) => `${rate}%`,
                            },
                        ]}
                        dataSource={sessions}
                        rowKey="session_id"
                        pagination={{ pageSize: 5 }}
                    />
                </TabPane>

            </Tabs>
            
            <Modal title="Cập nhật thông tin" open={isModalOpen} onOk={handleUpdate} onCancel={() => setIsModalOpen(false)}>
            <Form form={form} layout="vertical">
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address">
                        <Input placeholder="Nhập địa chỉ học sinh" />
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="date_of_birth">
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item label="Tải ảnh lên">
                        <Upload customRequest={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Ảnh đã tải lên" name="image_url">
                        <Input placeholder="Đường dẫn ảnh" readOnly />
                     </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentDetail;
