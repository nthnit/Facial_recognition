import React from "react";
import { Card, List, Typography, Row, Col } from "antd";
import usePageTitle from "../common/usePageTitle";


const { Title } = Typography;

const TeacherDashboard = () => {
    usePageTitle("Teacher Dashboard");
    // Dữ liệu mẫu (có thể thay thế bằng API)
    const todayClasses = [
        { id: 1, name: "Toán - Lớp 10A1", time: "08:00 - 10:00" },
        { id: 2, name: "Vật lý - Lớp 11B2", time: "10:30 - 12:00" }
    ];
    
    const news = [
        { id: 1, title: "Hướng dẫn cập nhật tài liệu giảng dạy mới" },
        { id: 2, title: "Lịch họp giáo viên tháng này" }
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Banner */}
            <Card style={{ marginBottom: 20, textAlign: "center" }}>
                <Title level={2}>Chào mừng đến với hệ thống giảng dạy</Title>
                <p>Hệ thống hỗ trợ giảng viên quản lý lớp học hiệu quả.</p>
            </Card>
            
            <Row gutter={16}>
                <Col span={16}>
                    {/* Danh sách lớp dạy hôm nay */}
                    <Card title="Lớp học hôm nay" style={{ marginBottom: 20 }}>
                        <List
                            dataSource={todayClasses}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.name}
                                        description={`Thời gian: ${item.time}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    {/* Khu vực tin tức */}
                    <Card title="Tin tức & Thông báo">
                        <List
                            dataSource={news}
                            renderItem={(item) => (
                                <List.Item>
                                    <Typography.Text>{item.title}</Typography.Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TeacherDashboard;