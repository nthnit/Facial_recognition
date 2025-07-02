import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Space, Modal, Form, Input, message, Popconfirm, DatePicker, Breadcrumb, Table, Tabs, Upload } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import wonderbotSearching from "../assets/images/apollo_robot.162763f5b5ae3d3729e593515018f621.svg"
import moment from "moment";
import {
    fetchStudentDetail,
    fetchStudentClasses,
    fetchStudentSessions,
    updateStudent,
    deleteStudent,
    uploadStudentImage
} from "../api/students";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [classes, setClasses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    // Lấy role từ localStorage
    const role = localStorage.getItem("role");

    useEffect(() => {
        loadData();
        // Lấy role từ localStorage (hoặc context nếu có)
        const role = localStorage.getItem("role");
        setUserRole(role);
    }, []);

    const loadData = async () => {
        try {
            const [studentData, classesData, sessionsData] = await Promise.all([
                fetchStudentDetail(id),
                fetchStudentClasses(id),
                fetchStudentSessions(id)
            ]);
            setStudent(studentData);
            setClasses(classesData);
            setSessions(sessionsData);
        } catch (error) {
            if (error.message === "Unauthorized") {
                message.error("Bạn chưa đăng nhập!");
                navigate("/login");
            } else {
                message.error("Lỗi khi tải dữ liệu học sinh.");
            }
        }
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : "2000-01-01",
            };

            await updateStudent(id, payload);
            messageApi.success("Cập nhật thông tin thành công!");
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            message.error("Lỗi khi cập nhật thông tin học sinh.");
        }
    };

    const handleUpload = async ({ file }) => {
        setUploading(true);
        try {
            const response = await uploadStudentImage(file);
            form.setFieldsValue({ image_url: response.image_url });
            message.success("Ảnh đã tải lên thành công!");
        } catch (error) {
            message.error("Lỗi khi tải ảnh lên.");
        }
        setUploading(false);
    };

    const handleDelete = async () => {
        try {
            await deleteStudent(id);
            messageApi.success("Xóa học sinh thành công!");
            navigate("/students");
        } catch (error) {
            message.error("Lỗi khi xóa học sinh.");
        }
    };

    const showUpdateModal = () => {
        form.setFieldsValue({
            full_name: student.full_name,
            email: student.email,
            phone_number: student.phone_number,
            address: student.address,
            date_of_birth: student.date_of_birth ? moment(student.date_of_birth) : null,
            image_url: student.image || "",
        });
        setIsModalOpen(true);
    };

    if (!student) return <div>Đang tải...</div>;

    return (
        <div style={{ padding: 20 }}>
            {contextHolder}

            <Breadcrumb style={{ marginBottom: 20 }}>
                <Breadcrumb.Item>
                    <Link to="/manager/students">Quản lý học sinh</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{student.id} - {student.full_name}</Breadcrumb.Item>
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
                    <img
                        src={student.image || "https://via.placeholder.com/150"}
                        alt="Ảnh học sinh"
                        style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "3px solid #1890ff",
                        }}
                    />

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

                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Space>
                        <Button icon={<EditOutlined />} type="primary" onClick={() => showUpdateModal(true)}>
                            Cập nhật
                        </Button>
                        {/* Ẩn nút xoá nếu role là teacher */}
                        {role !== "teacher" && (
                            <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={handleDelete} okText="Xóa" cancelText="Hủy">
                                <Button icon={<DeleteOutlined />} danger>
                                    Xóa
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                </div>
            </Card>

            <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
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

                <TabPane tab="Danh sách buổi học" key="2">
                    <Table
                        columns={[
                            {
                                title: "Mã buổi học",
                                dataIndex: "session_id",
                                key: "class_session_idname",
                                render: (text, record) => (
                                    <Link to={`/sessions/${record.session_id}`} style={{ color: "blue" }}>
                                        {text}
                                    </Link>
                                ),
                            },
                            {
                                title: "Tên lớp học",
                                dataIndex: "class_name",
                                key: "class_name",
                            },
                            { title: "Mã lớp", dataIndex: "class_code", key: "class_code" },
                            {
                                title: "Ngày",
                                dataIndex: "date",
                                key: "date",
                                render: (date) => moment(date).format("DD-MM-YYYY"),
                            },
                            { title: "Thứ", dataIndex: "weekday", key: "weekday" },
                            {
                                title: "Thời gian",
                                key: "time",
                                render: (_, record) => `${record.start_time} - ${record.end_time}`,
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
