import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, message, Button } from "antd";
import { UserOutlined, BookOutlined, SolutionOutlined, ReadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        news: 0,
    });

    const navigate = useNavigate(); // Điều hướng khi token hết hạn

    // Hàm lấy token từ localStorage và tạo headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login"); // Điều hướng về trang login nếu không có token
        }
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        // Gọi API để lấy dữ liệu tổng quan
        const fetchStats = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/manager/stats", {
                    headers: getAuthHeaders()
                });
                setStats(response.data);
            } catch (error) {
                handleRequestError(error, "Lỗi khi tải dữ liệu tổng quan");
            }
        };

        fetchStats();
    }, []);

    const handleRequestError = (error, defaultMessage) => {
        if (error.response?.status === 401) {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token"); // Xóa token khi hết hạn
            navigate("/login");
        } else if (error.response?.status === 403) {
            message.error("Bạn không có quyền xem thống kê!");
        } else {
            message.error(defaultMessage);
        }
    };

    return (
        <div style={styles.container}>
            <Title level={2} style={styles.title}>📊 Dashboard Quản lý</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <UserOutlined style={styles.icon} />
                        <Title level={3}>{stats.students}</Title>
                        <p>Sinh viên</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/students')}>
                            Xem chi tiết
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <SolutionOutlined style={styles.icon} />
                        <Title level={3}>{stats.teachers}</Title>
                        <p>Giảng viên</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/teachers')}>
                            Xem chi tiết
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <BookOutlined style={styles.icon} />
                        <Title level={3}>{stats.classes}</Title>
                        <p>Lớp học</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/classes')}>
                            Xem chi tiết
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <ReadOutlined style={styles.icon} />
                        <Title level={3}>{stats.news}</Title>
                        <p>Bài viết mới</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/news')}>
                            Xem chi tiết
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#f5f5f5", // Thêm màu nền cho giao diện
        borderRadius: "10px", // Bo góc toàn bộ trang
    },
    title: {
        marginBottom: "30px",  // Tăng khoảng cách giữa tiêu đề và các phần khác
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "24px",
        color: "#333",
    },
    card: {
        textAlign: "center",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",  // Màu nền của mỗi card
    },
    icon: {
        fontSize: "50px",
        color: "#1890ff",
        marginBottom: "10px",
    },
    linkButton: {
        color: "#1890ff",
        padding: 0,
        fontSize: "14px",
        fontWeight: "bold",
    },
};

export default ManagerDashboard;
