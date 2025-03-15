import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Divider, message, Button, Row, Col, List, Pagination } from "antd";
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import usePageTitle from "./common/usePageTitle";
import API_BASE_URL from "../api/config";

const { Title, Text } = Typography;

const NewsDetail = () => {
    const { id } = useParams(); // Lấy id từ URL
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedNews, setRelatedNews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4; // Number of related news per page
    const userRole = localStorage.getItem("role");
    const navigate = useNavigate();
    usePageTitle(news?.title || "Chi tiết tin tức");

    // Lấy token từ localStorage
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login"); // Điều hướng về trang login nếu không có token
        }
        return { Authorization: `Bearer ${token}` };
    };

    // Fetch news detail from API
    const fetchNewsDetail = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;
            const response = await axios.get(`${API_BASE_URL}/news/${id}`, { headers });
            setNews(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải tin tức chi tiết:", error);
            message.error("Lỗi khi tải tin tức chi tiết.");
        }
    };

    // Fetch related news for the sidebar
    const fetchRelatedNews = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;
            const response = await axios.get(`${API_BASE_URL}/news/`, { headers });
            setRelatedNews(response.data); // Assuming you get related news from the same API
        } catch (error) {
            console.error("Lỗi khi tải tin tức liên quan:", error);
        }
    };

    useEffect(() => {
        fetchNewsDetail();
        fetchRelatedNews();
    }, [id]);

    // Hiển thị loading khi dữ liệu chưa được tải xong
    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
                <Spin size="large" />
            </div>
        );
    }

    // Handle pagination for related news
    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    // Render related news
    const paginatedRelatedNews = relatedNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
            {/* Nút quay lại */}
            <Button 
                onClick={() => navigate(userRole === "manager" ? "/manager/news" : "/teacher/dashboard")} 
                icon={<ArrowLeftOutlined />}
                style={{
                    paddingLeft: 0,
                    fontSize: 16,
                    marginBottom: 16
                }}
                type='link'
            >
                {userRole === "manager" ? "Quay lại quản lý tin tức" : "Quay lại Dashboard"}
            </Button>

            {/* Title, Date, and Author Block with background image */}
            <div 
                style={{
                    backgroundImage: `url(${news?.image_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "40px",
                    borderRadius: "10px",
                    position: "relative",
                    color: "white",
                    marginBottom: "20px",
                    height: "20rem"
                }}
            >
                {/* Overlay */}
                <div 
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: "10px",
                        zIndex: 1
                    }}
                ></div>
                
                <div style={{ position: "absolute", zIndex: 2, bottom: "1.5rem" }}>
                    <Title level={2} style={{ color: "white", fontSize: "34px" }}>{news?.title}</Title>
                    <Text type="secondary" style={{ color: "white", fontSize: "18px" }}>
                     <ClockCircleOutlined />  {new Date(news?.created_at).toLocaleDateString()}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ color: "white", fontSize: "18px", display:"inline-block", marginTop: "1rem" }}>
                        {news?.author_name} ({news?.author_email})
                    </Text>
                </div>
            </div>

            {/* Main Content and Sidebar */}
            <Row gutter={16}>
                <Col span={18}>
                    {/* Content Block */}
                    <Card
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            backgroundColor: "#fff"
                        }}
                    >
                        <Title level={2} style={{ color: "rgb(0, 174, 239)" }}>{news?.title}</Title>
                        <img
                            src={news?.image_url}
                            alt={news?.title}
                            style={{
                                width: "50%",  // Adjust the width as needed
                                height: "auto",
                                borderRadius: "8px",
                                marginBottom: "20px",
                                display: "block",  // Ensures the image is treated as a block-level element
                                marginLeft: "auto",  // Centers the image horizontally
                                marginRight: "auto",  // Centers the image horizontally
                            }}
                        />
                        <Divider />
                        <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>{news?.content}</Text>
                        <Divider />
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                            Ngày đăng: {new Date(news?.created_at).toLocaleDateString()}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                            Tác giả: {news?.author_name} ({news?.author_email})
                        </Text>
                    </Card>

                </Col>

                <Col span={6}>
                    {/* Related News Block */}
                    <Card title="Tin tức liên quan" style={{ marginBottom: 20 }}>
                        <List
                            dataSource={paginatedRelatedNews}
                            renderItem={(item) => (
                                <List.Item>
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                                            />
                                        </Col>
                                        <Col span={18}>
                                            <Text 
                                                strong 
                                                onClick={() => navigate(`/news/${item.id}`)} 
                                                style={{ 
                                                    cursor: "pointer", 
                                                    textDecoration: "none" 
                                                }} 
                                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'} // Khi hover
                                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'} // Khi không hover
                                            >
                                                {item.title}
                                            </Text>
                                            <p>{item.content.slice(0, 100)}...</p>
                                            <Text type="secondary">Ngày đăng: {new Date(item.created_at).toLocaleDateString()}</Text>
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />
                        {/* Pagination */}
                        <Pagination
                            current={currentPage}
                            total={relatedNews.length}
                            pageSize={pageSize}
                            onChange={onPageChange}
                            style={{ marginTop: "16px", textAlign: "center" }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NewsDetail;
