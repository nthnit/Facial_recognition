import React, { useState, useEffect } from "react";
import { Card, List, Typography, Row, Col, Tabs, Divider, Skeleton, Empty, Pagination } from "antd";
import usePageTitle from "../common/usePageTitle";
import axios from "axios";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const API_BASE_URL = "http://127.0.0.1:8000";

const TeacherDashboard = () => {
    usePageTitle("Teacher Dashboard");

    // State
    const [todayClasses, setTodayClasses] = useState([]);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [pastClasses, setPastClasses] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại cho phần tin tức
    const [pageSize] = useState(4); // Số tin tức hiển thị mỗi trang

    // Fetch classes data
    const fetchClassesData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/classes/teacher/schedule`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const today = [];
            const upcoming = [];
            const past = [];

            const currentDate = new Date().toISOString().split("T")[0];  // YYYY-MM-DD format

            response.data.forEach(item => {
                if (item.date === currentDate) {
                    today.push(item);
                } else if (item.date > currentDate) {
                    upcoming.push(item);
                } else {
                    past.push(item);
                }
            });

            setTodayClasses(today);
            setUpcomingClasses(upcoming);
            setPastClasses(past);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải lịch giảng dạy:", error);
            setLoading(false);
        }
    };

    // Fetch news from API
    const fetchNews = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/news/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNews(response.data);
        } catch (error) {
            console.error("Lỗi khi tải tin tức:", error);
        }
    };

    useEffect(() => {
        fetchClassesData();
        fetchNews();
    }, []);

    // Hàm nhóm các lớp theo ngày
    const groupClassesByDate = (classes) => {
        return classes.reduce((acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = [];
            }
            acc[item.date].push(item);
            return acc;
        }, {});
    };

    // Render classes with group by date
    const renderClasses = (classes) => {
        const groupedClasses = groupClassesByDate(classes);
        return Object.keys(groupedClasses).map((date) => (
            <div key={date}>
                <Title level={4}>{date}</Title>
                {groupedClasses[date].length === 0 ? (
                    <Empty description="Không có lớp học" />
                ) : (
                    <List
                        dataSource={groupedClasses[date]}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={item.class_name}
                                    description={`Thời gian: ${item.start_time} - ${item.end_time}`}
                                />
                                <List.Item><div>
                                    <Text><strong>Giảng viên:</strong> {item.teacher_name}</Text><br />
                                    <Text><strong>Phòng học:</strong> {item.classroom}</Text><br />
                                    <Text><strong>Môn học:</strong> {item.subject}</Text><br />
                                    <Text><strong>Số học sinh:</strong> {item.total_students}</Text><br />
                                    <Text><strong>Chủ đề:</strong> {item.topic}</Text>
                                </div></List.Item>
                            </List.Item>
                        )}
                    />
                )}
                <Divider />
            </div>
        ));
    };

    // Xử lý sự thay đổi trang
    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    // Paginated news
    const paginatedNews = news.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ padding: 20 }}>
            <h2>Xin chào,</h2>
            {/* Banner */}
            <Card style={{ marginBottom: 20, textAlign: "center" }}>
                <Title level={2}>Chào mừng đến với hệ thống giảng dạy</Title>
                <p>Hệ thống hỗ trợ giảng viên quản lý lớp học hiệu quả.</p>
            </Card>

            <Row gutter={16}>
                <Col span={16}>
                    {/* Danh sách lớp dạy với các tab */}
                    <Card title="Lịch giảng dạy" style={{ marginBottom: 20 }}>
                        {loading ? (
                            <Skeleton active />
                        ) : (
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Hôm nay" key="1">
                                    {todayClasses.length === 0 ? (
                                        <Empty description="Không có lớp dạy hôm nay, thầy / cô hãy nghỉ ngơi chút nhé!" />
                                    ) : (
                                        renderClasses(todayClasses)
                                    )}
                                </TabPane>

                                <TabPane tab="Sắp tới" key="2">
                                    {upcomingClasses.length === 0 ? (
                                        <Empty description="Không có lớp dạy sắp tới" />
                                    ) : (
                                        renderClasses(upcomingClasses)
                                    )}
                                </TabPane>

                                <TabPane tab="Đã qua" key="3">
                                    {pastClasses.length === 0 ? (
                                        <Empty description="Không có lớp dạy đã qua" />
                                    ) : (
                                        renderClasses(pastClasses)
                                    )}
                                </TabPane>
                            </Tabs>
                        )}
                    </Card>
                </Col>

                <Col span={8}>
                    {/* Thống kê */}
                    <Card title="Tổng quan" style={{ marginBottom: 20 }}>
                        <Row>
                            <Col span={24}>
                                <Text strong>Số lớp học hôm nay:</Text>
                                <Text>{todayClasses.length}</Text>
                            </Col>
                            <Divider />
                            <Col span={24}>
                                <Text strong>Số lớp học sắp tới:</Text>
                                <Text>{upcomingClasses.length}</Text>
                            </Col>
                        </Row>
                    </Card>

                    {/* Khu vực tin tức */}
                    <Card title="Tin tức & Thông báo" style={{ marginBottom: 20 }}>
                        <List
                            dataSource={paginatedNews}
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
                                            <Text strong>{item.title}</Text>
                                            <p>{item.content.slice(0, 100)}...</p>
                                            <Text type="secondary">{new Date(item.created_at).toLocaleDateString()}</Text>
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />
                        {/* Pagination */}
                        <Pagination
                            current={currentPage}
                            total={news.length}
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

export default TeacherDashboard;
