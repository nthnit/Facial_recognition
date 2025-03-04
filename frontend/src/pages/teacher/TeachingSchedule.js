import React, { useState, useEffect } from "react";
import { Calendar, Button, Modal, Row, Col, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import axios from "axios";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const API_BASE_URL = "http://127.0.0.1:8000";

const TeachingSchedule = () => {
    usePageTitle("Teaching Schedule");
    const navigate = useNavigate();
    const [classSchedule, setClassSchedule] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        fetchTeachingSchedule();
    }, []);

    // Hàm lấy lịch giảng dạy từ API
    const fetchTeachingSchedule = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/classes/teacher/schedule`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Chuyển đổi dữ liệu thành dạng object với key là ngày (YYYY-MM-DD)
            const schedule = response.data.reduce((acc, item) => {
                const dateStr = item.date;
                if (!acc[dateStr]) {
                    acc[dateStr] = [];
                }
                acc[dateStr].push(item);
                return acc;
            }, {});
            setClassSchedule(schedule);
        } catch (error) {
            console.error("Lỗi khi tải lịch giảng dạy:", error);
        }
    };

    // Hàm hiển thị lớp học trên lịch
    const dateCellRender = (value) => {
        const dateStr = value.format("YYYY-MM-DD");
        const classes = classSchedule[dateStr] || [];
    
        return (
            <ul style={{ padding: 0, listStyle: "none" }}>
                {classes.map((item) => (
                    <li key={item.session_id} style={{ marginBottom: 5 }}>
                        <Button
                            type="primary"
                            block
                            onClick={() => showClassDetails(item)}
                            style={{
                                textAlign: "left",
                                backgroundColor: "#1890ff",
                                borderColor: "#1890ff",
                                cursor: "pointer",
                                padding: "10px",
                                borderRadius: "8px",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#40a9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1890ff"}
                        >
                            <Text style={{ color: "white" }}>
                                {`${item.class_name} (${item.start_time} - ${item.end_time})`}
                            </Text>
                        </Button>
                    </li>
                ))}
            </ul>
        );
    };

    // Hiển thị chi tiết lớp học trong modal
    const showClassDetails = (item) => {
        setModalContent(item);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        setModalContent(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setModalContent(null);
    };

    return (
        <div style={{ padding: "20px" }}>
            <Title level={2} style={{ textAlign: "center" }}>
                Lịch Giảng Dạy
            </Title>
            <Card
                style={{ margin: "20px 0", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
            >
                <Calendar
                    dateCellRender={dateCellRender}
                    style={{ borderRadius: "10px", overflow: "hidden" }}
                />
            </Card>

            <Modal
                title="Chi tiết lớp học"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel} style={{ width: "100px" }}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk} style={{ width: "100px" }}>
                        Đóng
                    </Button>,
                ]}
                width={600}
                centered
            >
                {modalContent && (
                    <Row gutter={16}>
                        <Col span={24}>
                            <Text strong>Tên lớp:</Text>
                            <Text>{modalContent.class_name}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Giảng viên:</Text>
                            <Text>{modalContent.teacher_name}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Thời gian:</Text>
                            <Text>{modalContent.start_time} - {modalContent.end_time}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Chủ đề:</Text>
                            <Text>{modalContent.topic}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Ngày học:</Text>
                            <Text>{modalContent.date}</Text>
                        </Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default TeachingSchedule;
