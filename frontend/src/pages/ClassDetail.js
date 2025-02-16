import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Table, Tabs } from "antd";

const { TabPane } = Tabs;

const ClassDetail = () => {
    const { id } = useParams(); // Lấy ID lớp học từ URL
    const [classInfo, setClassInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);

    // Dữ liệu mẫu (có thể thay bằng API)
    useEffect(() => {
        const classData = {
            1: { name: "Toán", teacher: "Nguyễn Văn A", students: 30, description: "Lớp học toán nâng cao." },
            2: { name: "Vật lý", teacher: "Trần Thị B", students: 28, description: "Lớp học vật lý cơ bản." },
        };
        const sessionData = {
            1: [
                { key: "1", date: "01/03/2025", topic: "Số học", attendance: "Đã điểm danh" },
                { key: "2", date: "08/03/2025", topic: "Hình học", attendance: "Chưa điểm danh" },
            ],
            2: [
                { key: "1", date: "02/03/2025", topic: "Cơ học", attendance: "Đã điểm danh" },
                { key: "2", date: "09/03/2025", topic: "Điện học", attendance: "Chưa điểm danh" },
            ],
        };
        const studentData = {
            1: [
                { key: "1", id: "101", name: "Nguyễn Văn C", dob: "01/01/2000", email: "nguyenvanc@example.com", phone: "0123456789" },
                { key: "2", id: "102", name: "Trần Thị D", dob: "15/05/2001", email: "tranthid@example.com", phone: "0987654321" },
            ],
            2: [
                { key: "1", id: "201", name: "Phạm Văn E", dob: "22/08/1999", email: "phamvane@example.com", phone: "0112233445" },
                { key: "2", id: "202", name: "Lê Thị F", dob: "30/10/2000", email: "lethif@example.com", phone: "0556677889" },
            ],
        };
        setClassInfo(classData[id]);
        setSessions(sessionData[id]);
        setStudents(studentData[id]);
    }, [id]);

    return (
        <div style={{ padding: 20 }}>
            {classInfo ? (
                <>
                    <Card title={`Lớp: ${classInfo.name}`} style={{ marginBottom: 20 }}>
                        <p><strong>Giảng viên:</strong> {classInfo.teacher}</p>
                        <p><strong>Số học sinh:</strong> {classInfo.students}</p>
                        <p><strong>Mô tả:</strong> {classInfo.description}</p>
                    </Card>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Danh sách buổi học" key="1">
                            <Table
                                columns={[
                                    { title: "Ngày học", dataIndex: "date", key: "date" },
                                    { title: "Nội dung", dataIndex: "topic", key: "topic" },
                                    { title: "Trạng thái điểm danh", dataIndex: "attendance", key: "attendance" },
                                ]}
                                dataSource={sessions}
                            />
                        </TabPane>
                        <TabPane tab="Danh sách học sinh" key="2">
                            <Table
                                columns={[
                                    { title: "Mã học sinh", dataIndex: "id", key: "id" },
                                    { title: "Họ và Tên", dataIndex: "name", key: "name", render: (text, record) => <Link to={`/student/${record.id}`}>{text}</Link> },
                                    { title: "Ngày sinh", dataIndex: "dob", key: "dob" },
                                    { title: "Email", dataIndex: "email", key: "email" },
                                    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
                                ]}
                                dataSource={students}
                            />
                        </TabPane>
                    </Tabs>
                </>
            ) : (
                <p>Đang tải thông tin lớp học...</p>
            )}
        </div>
    );
};

export default ClassDetail;
