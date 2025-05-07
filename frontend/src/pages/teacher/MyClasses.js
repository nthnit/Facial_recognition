import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Spin, message } from "antd";
import { Link } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import { fetchUserInfo } from "../../api/userInfo";
import { fetchTeacherClasses } from "../../api/teacherClasses";

const { Title, Text } = Typography;

const MyClasses = () => {
    usePageTitle("My Classes");
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState(null);

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const userData = await fetchUserInfo();
                if (userData.role === "teacher") {
                    setTeacherId(userData.id);
                } else {
                    message.error("Bạn không có quyền truy cập!");
                }
            } catch (error) {
                message.error("Lỗi khi lấy thông tin người dùng.");
            }
        };

        getUserInfo();
    }, []);

    useEffect(() => {
        if (teacherId) {
            const getClasses = async () => {
                try {
                    const data = await fetchTeacherClasses(teacherId);
                    setClasses(data);
                } catch (error) {
                    message.error("Lỗi khi tải danh sách lớp học.");
                }
                setLoading(false);
            };

            getClasses();
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
