import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Table, Tabs, message } from "antd";
import axios from "axios";
import moment from "moment";

const { TabPane } = Tabs;

const ClassDetail = () => {
    const { id } = useParams(); // Lấy ID lớp học từ URL
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    // Fetch dữ liệu lớp học, buổi học và danh sách học sinh từ API
    useEffect(() => {
        fetchClassDetail();
        fetchSessions();
        fetchStudents();
    }, [id]);

    const fetchClassDetail = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/classes/${id}`, {
                headers: getAuthHeaders(),
            });
            setClassInfo(response.data);
        } catch (error) {
            message.error("Lỗi khi tải thông tin lớp học.");
        }
        setLoading(false);
    };

    const fetchSessions = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/classes/${id}/sessions`, {
                headers: getAuthHeaders(),
            });
            setSessions(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách buổi học.");
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/classes/${id}/students`, {
                headers: getAuthHeaders(),
            });
            setStudents(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách học sinh.");
        }
    };

    if (loading) return <p>Đang tải thông tin lớp học...</p>;

    return (
        <div style={{ padding: 20 }}>
            {classInfo ? (
                <>
                    <Card title={`Lớp: ${classInfo.name}`} style={{ marginBottom: 20 }}>
                        <p><strong>Giảng viên:</strong> {classInfo.teacher_name || "Chưa phân công"}</p>
                        <p><strong>Số học sinh:</strong> {students.length}</p>
                        <p><strong>Mô tả:</strong> {classInfo.description || "Chưa có mô tả"}</p>
                    </Card>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Danh sách buổi học" key="1">
                            <Table
                                columns={[
                                    { title: "Ngày học", dataIndex: "date", key: "date", render: (date) => moment(date).format("DD-MM-YYYY") },
                                    { title: "Nội dung", dataIndex: "topic", key: "topic" },
                                    { title: "Trạng thái điểm danh", dataIndex: "attendance", key: "attendance" },
                                ]}
                                dataSource={sessions}
                                rowKey="id"
                            />
                        </TabPane>
                        <TabPane tab="Danh sách học sinh" key="2">
                            <Table
                                columns={[
                                    { title: "Mã học sinh", dataIndex: "id", key: "id" },
                                    { title: "Họ và Tên", dataIndex: "name", key: "name", render: (text, record) => <Link to={`/students/${record.id}`}>{text}</Link> },
                                    { title: "Ngày sinh", dataIndex: "dob", key: "dob", render: (dob) => moment(dob).format("DD-MM-YYYY") },
                                    { title: "Email", dataIndex: "email", key: "email" },
                                    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
                                ]}
                                dataSource={students}
                                rowKey="id"
                            />
                        </TabPane>
                    </Tabs>
                </>
            ) : (
                <p>Không tìm thấy lớp học.</p>
            )}
        </div>
    );
};

export default ClassDetail;
