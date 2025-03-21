import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Modal, Button, Table, Form, Input, Select, Switch, Progress, Typography, Row, Col, Card, Tabs, message, Breadcrumb } from "antd";
import { SyncOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import API_BASE_URL from "../api/config";
import usePageTitle from "./common/usePageTitle";
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

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Bạn chưa đăng nhập!");
      navigate("/login");
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch session details
  const fetchSessionInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/info`, {
        headers: getAuthHeaders(),
      });
      setSessionInfo(response.data);
    } catch (error) {
      message.error("Lỗi khi tải thông tin tiết học.");
    }
  };

  // Fetch students for the session
  const fetchSessionStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/students`, {
        headers: getAuthHeaders(),
      });
      setStudents(response.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách học sinh.");
    }
  };

  // Fetch grades for students in this session
  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grades/sessions/${sessionId}/grades`, {
        headers: getAuthHeaders(),
      });
      setStudentsWithGrades(response.data);
    } catch (error) {
      message.error("Buổi học này chưa có học sinh nào được nhập điểm");
    }
  };
  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/attendance`, {
        headers: getAuthHeaders(),
      });

      const attendance = response.data.reduce((acc, item) => {
        acc[item.student_id] = item.status; // Tạo một đối tượng với `student_id` là key và `status` là giá trị
        return acc;
      }, {});
      
      // Cập nhật dữ liệu điểm danh vào state
      setAttendanceData(attendance);
    } catch (error) {
      message.error("Lỗi khi tải điểm danh.");
    }
};


  useEffect(() => {
    fetchSessionInfo();
    fetchSessionStudents();
    fetchAttendanceData();
  }, [sessionId]);

  useEffect(() => {
    fetchGrades();
  }, []);

  // Handle attendance changes
  const handleAttendanceChange = (studentId, checked) => {
    setAttendanceData((prevData) => ({
      ...prevData,
      [studentId]: checked ? "Present" : "Absent",
    }));
  };

  // Submit attendance data
  const submitAttendance = async () => {
    try {
      const attendancePayload = Object.entries(attendanceData).map(([studentId, status]) => ({
        class_id: sessionInfo.class_id,
        session_id: sessionId,
        student_id: Number(studentId),
        status: status === "Present" ? "Present" : "Absent",
      }));
      console.log(attendancePayload);
      

      await axios.post(`${API_BASE_URL}/classes/${sessionInfo.class_id}/sessions/${sessionInfo.date}/attendance`, attendancePayload, {
        headers: getAuthHeaders(),
      });

      message.success("Điểm danh thành công!");
    } catch (error) {
      message.error("Lỗi khi gửi điểm danh.");
    }
  };

  // Submit grades for students
  const handleGradeSubmit = async () => {
    try {
      const gradesPayload = studentsWithGrades.map((student) => ({
        session_id: sessionId,
        student_id: student.student_id,
        grade: student?.grade || 0,
        status: student?.status || "Not Done",
      }));
      await axios.post(`${API_BASE_URL}/grades/sessions/${sessionId}/grades`, gradesPayload, {
        headers: getAuthHeaders(),
      });

      message.success("Điểm đã được cập nhật!");
    } catch (error) {
      message.error("Lỗi khi lưu điểm.");
    }
  };

  // Handle status change
  const handleStatusChange = (studentId, value) => {
    const updatedStudents = [...studentsWithGrades];
    const studentIndex = updatedStudents.findIndex(student => student.id === studentId);
    
    if (studentIndex !== -1) {
      updatedStudents[studentIndex].status = value;
  
      // Nếu trạng thái là "Not Done", điểm sẽ tự động được set là 0 và trường nhập điểm sẽ bị disable
      if (value === "Not Done") {
        updatedStudents[studentIndex].grade = 0;
      }
    }
    
    setStudentsWithGrades(updatedStudents);
  };
  

  const handleGradeChange = (studentId, value) => {
    // Cập nhật trạng thái điểm của học sinh
    const updatedStudents = studentsWithGrades.map(student => 
      student.id === studentId ? { ...student, grade: value } : student
    );
    setStudentsWithGrades(updatedStudents);
  };
  

  
  // Calculate attendance progress
  const calculateAttendanceProgress = () => {
    const totalStudents = students.length;
    const presentStudents = Object.values(attendanceData).filter((status) => status === "Present").length;
    return Math.floor((presentStudents / totalStudents) * 100);
  };

  // Calculate homework completion progress
  const calculateHomeworkProgress = () => {
    const completedHomework = studentsWithGrades.filter((student) => student.status === "Complete").length;
    return Math.floor((completedHomework / studentsWithGrades.length) * 100);
  };

  // Create grade records for students if they don't exist
  const handleCreateGrades = async () => {
    try {
      // Create payload with default values for each student
      const gradePayload = students.map(student => ({
        student_id: student.id,
        grade: 0,  // default grade
        status: "Not Done",  // default status
      }));
      
      // Make POST request to create grades for all students
      const response = await axios.post(`${API_BASE_URL}/grades/sessions/${sessionId}/grades`, gradePayload, {
        headers: getAuthHeaders(),
      });

      // Update the grades list after creation
      setStudentsWithGrades(response.data);
      message.success("Tạo điểm cho học sinh thành công!");
    } catch (error) {
      message.error("Lỗi khi tạo điểm cho học sinh.");
    }
  };

  // Delete grade for a student
  const handleDeleteGrade = async (studentId) => {
    try {
      // Gọi API để huỷ điểm cho học sinh
      await axios.delete(`${API_BASE_URL}/grades/sessions/${sessionId}/grades/${studentId}`, {
        headers: getAuthHeaders(),
      });
      message.success("Điểm đã được huỷ!");
      
      // Lấy lại danh sách điểm sau khi huỷ
      fetchGrades();
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
          {/* Basic Info */}
          <Card title="Thông tin tiết học" style={{ marginBottom: 20 }}>
            <p><strong>Mã tiết học:</strong> {sessionInfo.session_id}</p>
            <p><strong>Ngày học:</strong> {sessionInfo.date}</p>
            <p><strong>Giờ học:</strong> {sessionInfo.start_time} - {sessionInfo.end_time}</p>
            <p><strong>Phòng học:</strong> {sessionInfo.room_name}</p>
          </Card>

          {/* Statistics */}
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

          {/* Tabs for Attendance and Grades */}
          <Tabs defaultActiveKey="1">
            <TabPane tab="Điểm danh" key="1">
              <Button type="primary" onClick={submitAttendance} style={{ marginBottom: 16, marginRight: 10 }}>
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
                            // Nếu chọn "Not Done", set điểm bằng 0 và disable trường nhập điểm
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
                            disabled={record.status === "Not Done"} // Disable trường điểm khi trạng thái là "Not Done"
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
