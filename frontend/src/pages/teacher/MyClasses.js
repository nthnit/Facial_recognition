import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Spin, message } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import usePageTitle from "../common/usePageTitle";

const { Title, Text } = Typography;
const API_BASE_URL = "http://127.0.0.1:8000";

const MyClasses = () => {
    usePageTitle("My Classes");
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            return {};
        }
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        // 🔹 Lấy thông tin người dùng để lấy teacher_id
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/user/info`, {
                    headers: getAuthHeaders(),
                });
                if (response.data.role === "teacher") {
                    setTeacherId(response.data.id);
                } else {
                    message.error("Bạn không có quyền truy cập!");
                }
            } catch (error) {
                message.error("Lỗi khi lấy thông tin người dùng.");
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        // 🔹 Khi có teacher_id, gọi API lấy danh sách lớp học
        if (teacherId) {
            const fetchClasses = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/classes`, {
                        headers: getAuthHeaders(),
                    });
                    setClasses(response.data);
                } catch (error) {
                    message.error("Lỗi khi tải danh sách lớp học.");
                }
                setLoading(false);
            };

            fetchClasses();
        }
    }, [teacherId]);

    return (
        <div style={{ padding: 20 }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>Lớp học của tôi</Title>

            {loading ? (
                <div style={{ textAlign: "center", padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : classes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 50, fontSize: 16, color: "gray" }}>
                    Không có lớp học nào.
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {classes.map((classItem) => (
                        <Col key={classItem.id} xs={24} sm={12} md={8} lg={6}>
                            <Link to={`/teacher/classes/${classItem.id}`} style={{ textDecoration: "none" }}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: "10px",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                        transition: "transform 0.2s ease-in-out",
                                        textAlign: "center",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    <Title level={4} style={{ color: "#1890ff", marginBottom: 10 }}>
                                        {classItem.name}
                                    </Title>
                                    <Text strong>Mã lớp:</Text> {classItem.class_code} <br />
                                    <Text strong>Số học sinh:</Text> {classItem.total_students} <br />
                                    <Text strong>Ngày bắt đầu:</Text> {classItem.start_date} <br />
                                    <Text strong>Ngày kết thúc:</Text> {classItem.end_date} <br />
                                    <Text strong>Trạng thái:</Text>{" "}
                                    <span
                                        style={{
                                            color:
                                                classItem.status === "Active"
                                                    ? "green"
                                                    : classItem.status === "Planning"
                                                    ? "rgb(230,178,67)"
                                                    : classItem.status === "Closed"
                                                    ? "red"
                                                    : "rgb(85,127,213)",
                                            fontWeight: "bold",
                                            border: "2px solid",
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "5px",
                                            backgroundColor: "rgba(255,255,255,0.8)",
                                        }}
                                    >
                                        {classItem.status}
                                    </span>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default MyClasses;
