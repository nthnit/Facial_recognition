import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, message, Button, Carousel } from "antd";
import { UserOutlined, BookOutlined, SolutionOutlined, ReadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import { fetchManagerStats, fetchActiveBanners } from "../../api/dashboard";

const { Title } = Typography;

const ManagerDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        news: 0,
    });
    const [banners, setBanners] = useState([]);
    const navigate = useNavigate(); 

    usePageTitle("Manager Dashboard");

    useEffect(() => {
        fetchStatsData();
        fetchBannersData();
    }, []);

    const fetchStatsData = async () => {
        try {
            const data = await fetchManagerStats();
            setStats(data);
        } catch (error) {
            handleRequestError(error, "Failed to load statistics");
        }
    };

    const fetchBannersData = async () => {
        try {
            const data = await fetchActiveBanners();
            setBanners(data);
        } catch (error) {
            message.error("Error fetching banners");
        }
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.message === "Unauthorized") {
            message.error("Session expired. Please log in again!");
            localStorage.removeItem("token");
            navigate("/login");
        } else {
            message.error(defaultMessage);
        }
    };

    return (
        <div style={styles.container}>
            <Title level={2} style={styles.title}>📊 Dashboard Management</Title>

            {/* Carousel for active banners */}
            {banners.length > 0 && (
                <Carousel autoplay>
                    {banners.map((banner) => (
                        <div key={banner.id}>
                            <img
                                src={banner.image_url}
                                alt="Banner"
                                style={{ width: "70%", borderRadius: "10px", objectFit: "cover", overflow: "hidden", aspectRatio:"4/1", marginLeft:"auto", marginRight:"auto" }}
                            />
                        </div>
                    ))}
                </Carousel>
            )}

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <UserOutlined style={styles.icon} />
                        <Title level={3}>{stats.students}</Title>
                        <p>Students</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/students')}>
                            View Details
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <SolutionOutlined style={styles.icon} />
                        <Title level={3}>{stats.teachers}</Title>
                        <p>Teachers</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/teachers')}>
                            View Details
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <BookOutlined style={styles.icon} />
                        <Title level={3}>{stats.classes}</Title>
                        <p>Classes</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/classes')}>
                            View Details
                        </Button>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={styles.card} hoverable>
                        <ReadOutlined style={styles.icon} />
                        <Title level={3}>{stats.news}</Title>
                        <p>News</p>
                        <Button type="link" style={styles.linkButton} onClick={() => navigate('/manager/news')}>
                            View Details
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
        backgroundColor: "#f5f5f5",
        borderRadius: "10px",
    },
    title: {
        marginBottom: "30px",
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
        backgroundColor: "#fff",
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
