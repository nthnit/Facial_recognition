import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography } from "antd";
import { UserOutlined, BookOutlined, SolutionOutlined, ReadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        news: 0,
    });

    useEffect(() => {
        // Gọi API để lấy dữ liệu tổng quan
        const fetchStats = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/manager/stats");
                setStats(response.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={styles.container}>
            <Title level={2} style={styles.title}>📊 Dashboard Quản lý</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <UserOutlined style={styles.icon} />
                        <Title level={3}>{stats.students}</Title>
                        <p>Sinh viên</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <SolutionOutlined style={styles.icon} />
                        <Title level={3}>{stats.teachers}</Title>
                        <p>Giảng viên</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <BookOutlined style={styles.icon} />
                        <Title level={3}>{stats.classes}</Title>
                        <p>Lớp học</p>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <ReadOutlined style={styles.icon} />
                        <Title level={3}>{stats.news}</Title>
                        <p>Bài viết mới</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
    },
    title: {
        marginBottom: "20px",
        textAlign: "center",
    },
    card: {
        textAlign: "center",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    icon: {
        fontSize: "50px",
        color: "#1890ff",
        marginBottom: "10px",
    },
};

export default ManagerDashboard;
