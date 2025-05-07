import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Modal, Button, Table, Form, Input, Select, Switch, Progress, Typography, Row, Col, Card, Tabs, message, Breadcrumb } from "antd";
import { SyncOutlined, UserOutlined } from "@ant-design/icons";
import usePageTitle from "./common/usePageTitle";
import {
    fetchSessionInfo,
    fetchSessionStudents,
    fetchSessionGrades,
    fetchSessionAttendance,
    submitAttendance,
    submitGrades,
    createGrades,
    deleteGrade
} from "../api/sessions";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SessionDetail = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const currentUserRole = localStorage.getItem("role");
    const [sessionInfo, setSessionInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [studentsWithGrades, setStudentsWithGrades] = useState([]);
    const [form] = Form.useForm();

    usePageTitle("Session Detail");

    useEffect(() => {
        loadSessionData();
    }, [sessionId]);

    useEffect(() => {
        loadGrades();
    }, []);

    const loadSessionData = async () => {
        try {
            const [sessionData, studentsData, attendanceData] = await Promise.all([
                fetchSessionInfo(sessionId),
                fetchSessionStudents(sessionId),
                fetchSessionAttendance(sessionId)
            ]);

            setSessionInfo(sessionData);
            setStudents(studentsData);

            const attendance = attendanceData.reduce((acc, item) => {
                acc[item.student_id] = item.status;
                return acc;
            }, {});
            setAttendanceData(attendance);
        } catch (error) {
            if (error.message === "Unauthorized") {
                message.error("Bạn chưa đăng nhập!");
                navigate("/login");
            } else {
                message.error("Lỗi khi tải dữ liệu tiết học.");
            }
        }
    };

    const loadGrades = async () => {
        try {
            const gradesData = await fetchSessionGrades(sessionId);
            setStudentsWithGrades(gradesData);
        } catch (error) {
            message.warning("Buổi học này chưa có học sinh nào được nhập điểm");
        }
    };

    const handleAttendanceChange = (studentId, checked) => {
        setAttendanceData((prevData) => ({
            ...prevData,
            [studentId]: checked ? "Present" : "Absent",
        }));
    };

    const handleSubmitAttendance = async () => {
        try {
            const attendancePayload = Object.entries(attendanceData).map(([studentId, status]) => ({
                class_id: sessionInfo.class_id,
                session_id: sessionId,
                student_id: Number(studentId),
                status: status === "Present" ? "Present" : "Absent",
            }));

            await submitAttendance(sessionInfo.class_id, sessionInfo.date, attendancePayload);
            message.success("Điểm danh thành công!");
        } catch (error) {
            message.error("Lỗi khi gửi điểm danh.");
        }
    };

    const handleGradeSubmit = async () => {
        try {
            const gradesPayload = studentsWithGrades.map((student) => ({
                session_id: sessionId,
                student_id: student.student_id,
                grade: student?.grade || 0,
                status: student?.status || "Not Done",
            }));

            await submitGrades(sessionId, gradesPayload);
            message.success("Điểm đã được cập nhật!");
        } catch (error) {
            message.error("Lỗi khi lưu điểm.");
        }
    };

    const handleStatusChange = (studentId, value) => {
        const updatedStudents = [...studentsWithGrades];
        const studentIndex = updatedStudents.findIndex(student => student.id === studentId);
        
        if (studentIndex !== -1) {
            updatedStudents[studentIndex].status = value;
            if (value === "Not Done") {
                updatedStudents[studentIndex].grade = 0;
            }
        }
        
        setStudentsWithGrades(updatedStudents);
    };

    const handleGradeChange = (studentId, value) => {
        const updatedStudents = studentsWithGrades.map(student => 
            student.id === studentId ? { ...student, grade: value } : student
        );
        setStudentsWithGrades(updatedStudents);
    };

    const calculateAttendanceProgress = () => {
        const totalStudents = students.length;
        const presentStudents = Object.values(attendanceData).filter((status) => status === "Present").length;
        return Math.floor((presentStudents / totalStudents) * 100);
    };

    const calculateHomeworkProgress = () => {
        const completedHomework = studentsWithGrades.filter((student) => student.status === "Complete").length;
        return Math.floor((completedHomework / studentsWithGrades.length) * 100);
    };

    const handleCreateGrades = async () => {
        try {
            const gradePayload = students.map(student => ({
                student_id: student.id,
                grade: 0,
                status: "Not Done",
            }));
            
            const response = await createGrades(sessionId, gradePayload);
            setStudentsWithGrades(response);
            message.success("Tạo điểm cho học sinh thành công!");
        } catch (error) {
            message.error("Lỗi khi tạo điểm cho học sinh.");
        }
    };

    const handleDeleteGrade = async (studentId) => {
        try {
            await deleteGrade(sessionId, studentId);
            message.success("Điểm đã được huỷ!");
            loadGrades();
        } catch (error) {
            message.error("Lỗi khi huỷ điểm.");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            {sessionInfo ? (
                <>
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>
                            <Link to={currentUserRole === "teacher" ? "/teacher/classes" : "/manager/classes"}>
                                {currentUserRole === "teacher" ? "Lớp học của tôi" : "Quản lý lớp học"}
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to={currentUserRole === "teacher" ? `/teacher/classes/${sessionInfo.class_id}` : `/manager/classes/${sessionInfo.class_id}`}>
                                {sessionInfo.class_code}
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Mã Tiết học: {sessionId}</Breadcrumb.Item>
                    </Breadcrumb>

                    <Card title="Thông tin tiết học" style={{ marginBottom: 20 }}>
                        <p><strong>Mã tiết học:</strong> {sessionInfo.session_id}</p>
                        <p><strong>Ngày học:</strong> {sessionInfo.date}</p>
                        <p><strong>Giờ học:</strong> {sessionInfo.start_time} - {sessionInfo.end_time}</p>
                        <p><strong>Phòng học:</strong> {sessionInfo.room_name}</p>
                    </Card>

                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col span={12}>
                            <Card style={{display:"flex",}}>
                                <Title level={4}>Tỉ lệ điểm danh</Title>
                                <Progress
                                    type="circle"
                                    percent={calculateAttendanceProgress()}
                                    width={175}
                                    format={(percent) => `${percent}%`}
                                    strokeColor={{
                                        '0%': 'rgb(155,254,254)',
                                        '25%': 'rgb(104,209,253)',
                                        '50%': 'rgb(69,140,252)',
                                        '75%': 'rgb(68,27,251)',
                                        '100%': 'rgb(68,19,137)',
                                    }}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <Title level={4}>Tỉ lệ hoàn thành bài tập</Title>
                                <Progress
                                    type="circle"
                                    percent={calculateHomeworkProgress()}
                                    width={175}
                                    format={(percent) => `${percent}%`}
                                    strokeColor={{
                                        '0%': 'rgb(155,254,254)',
                                        '25%': 'rgb(104,209,253)',
                                        '50%': 'rgb(69,140,252)',
                                        '75%': 'rgb(68,27,251)',
                                        '100%': 'rgb(68,19,137)',
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Điểm danh" key="1">
                            <Button type="primary" onClick={handleSubmitAttendance} style={{ marginBottom: 16, marginRight: 10 }}>
                                Điểm danh học sinh
                            </Button>
                            <Button key="faceid" type="primary" onClick={() => navigate(`/face-attendance?classId=${sessionInfo.class_id}&sessionDate=${sessionInfo.date}`)}>
                                <UserOutlined />Điểm danh FaceID
                            </Button>
                            <Table
                                columns={[
                                    { title: "Mã học sinh", dataIndex: "student_id", key: "student_id" },
                                    { title: "Họ và Tên", dataIndex: "student_full_name", key: "student_full_name" },
                                    { title: "Email", dataIndex: "student_email", key: "student_email" },
                                    { title: "Status", dataIndex: "status", key: "status" },
                                    {
                                        title: "Điểm danh",
                                        render: (_, record) => (
                                            <>
                                                <Text style={{ color: "red" }}>Absent</Text>
                                                <Switch
                                                    checked={attendanceData[record.student_id] === "Present"}
                                                    onChange={(checked) => handleAttendanceChange(record.student_id, checked)}
                                                    style={{ marginLeft: "20px", marginRight: "20px" }}
                                                />
                                                <Text style={{ color: "green" }}>Present</Text>
                                            </>
                                        ),
                                    },
                                ]}
                                dataSource={Object.keys(attendanceData).map(studentId => {
                                    const student = students.find(student => student.id === parseInt(studentId));
                                    return {
                                        student_id: studentId,
                                        student_full_name: student ? student.full_name : "Unknown",
                                        student_email: student ? student.email : "Unknown",
                                        status: attendanceData[studentId],
                                    };
                                })}
                                rowKey="student_id"
                                pagination={false}
                            />
                        </TabPane>

                        <TabPane tab="Nhập điểm" key="2">
                            <Button type="primary" onClick={handleCreateGrades} style={{ marginBottom: 16, marginRight: 10 }}>
                                Tạo nhập điểm
                            </Button>
                            <Button type="primary" onClick={handleGradeSubmit} style={{ marginBottom: 16 }}>
                                <SyncOutlined />Lưu điểm cho học sinh
                            </Button>
                            <Table
                                columns={[
                                    { title: "Mã học sinh", dataIndex: "student_id", key: "student_id" },
                                    { title: "Họ và Tên", dataIndex: "student_full_name", key: "student_full_name" },
                                    { title: "Email", dataIndex: "student_email", key: "student_email" },
                                    {
                                        title: "Trạng thái bài về nhà",
                                        render: (_, record) => (
                                            <Select
                                                value={record.status}
                                                onChange={(value) => {
                                                    handleStatusChange(record.id, value);
                                                    if (value === "Not Done") {
                                                        form.setFieldsValue({
                                                            [record.id]: { grade: 0 },
                                                        });
                                                    }
                                                }}
                                            >
                                                <Option value="Complete">Complete</Option>
                                                <Option value="Incomplete">Incomplete</Option>
                                                <Option value="Not Done">Not Done</Option>
                                            </Select>
                                        ),
                                    },
                                    {
                                        title: "Điểm",
                                        render: (_, record) => (
                                            <Form.Item
                                                name={[record.id, 'grade']}
                                                initialValue={record.grade}
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Input
                                                    value={record.grade}
                                                    disabled={record.status === "Not Done"}
                                                    onChange={(e) => handleGradeChange(record.id, e.target.value)}
                                                />
                                            </Form.Item>
                                        ),
                                    },
                                    {
                                        title: "Hành động",
                                        render: (_, record) => (
                                            <Button
                                                type="primary"
                                                onClick={() => handleDeleteGrade(record.student_id)}
                                                style={{ marginLeft: 8 }}
                                                danger
                                            >
                                                Huỷ điểm
                                            </Button>
                                        ),
                                    },
                                ]}
                                dataSource={studentsWithGrades}
                                rowKey="id"
                                pagination={false}
                            />
                        </TabPane>
                    </Tabs>
                </>
            ) : (
                <p>Không tìm thấy thông tin tiết học.</p>
            )}
        </div>
    );
};

export default SessionDetail;
