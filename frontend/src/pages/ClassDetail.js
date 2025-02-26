import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Card, Table, Tabs, message, Button, Modal, Form, Input, Select, Switch } from "antd";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
const { TabPane } = Tabs;
const { Option } = Select;

const ClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [form] = Form.useForm();

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

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

    const fetchAllStudents = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/students", {
                headers: getAuthHeaders(),
            });
            const enrolledStudentIds = new Set(students.map((s) => s.id));
            setAllStudents(response.data.filter((s) => !enrolledStudentIds.has(s.id)));
        } catch (error) {
            message.error("Lỗi khi tải danh sách học sinh.");
        }
    };

    const handleUpdateClass = async () => {
        try {
            const values = await form.validateFields();
            await axios.put(`http://127.0.0.1:8000/classes/${id}`, values, {
                headers: getAuthHeaders(),
            });
            message.success("Cập nhật thông tin lớp học thành công!");
            setIsUpdateModalOpen(false);
            fetchClassDetail();
        } catch (error) {
            message.error("Lỗi khi cập nhật lớp học.");
        }
    };

    const formatWeeklySchedule = (schedule) => {
        const daysMap = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];
        return schedule ? schedule.map(day => daysMap[day]).join(", ") : "Không có lịch học";
    };


    const openAttendanceModal = async (session) => {
        console.log("Opening attendance modal for session:", session); 
        setCurrentSession(session);
        
        try {
            // 🔹 Gọi API để lấy trạng thái điểm danh hiện tại của session này
            const response = await axios.get(
                `http://127.0.0.1:8000/classes/${id}/sessions/${session.date}/attendance`,
                { headers: getAuthHeaders() }
            );
    
            if (response.data.length > 0) {
                // 🔹 Nếu có dữ liệu điểm danh trước đó, sử dụng dữ liệu này
                const studentAttendance = {};
                session.students.forEach((student) => {
                    const attendanceRecord = response.data.find((att) => att.student_id === student.id);
                    studentAttendance[student.id] = attendanceRecord ? attendanceRecord.status : "Absent";
                });
                setAttendanceData(studentAttendance);
            } else {
                // 🔹 Nếu không có dữ liệu điểm danh, mặc định tất cả học sinh vắng mặt
                const studentAttendance = {};
                students.forEach((student) => {
                    studentAttendance[student.id] = "Absent";
                });
                setAttendanceData(studentAttendance);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu điểm danh:", error.response?.data || error);
            message.warning("Chưa có dữ liệu điểm danh. Hãy thực hiện điểm danh lần đầu.");
            
            // 🔹 Nếu API thất bại, hiển thị danh sách học sinh để điểm danh lần đầu
            const studentAttendance = {};
            students.forEach((student) => {
                studentAttendance[student.id] = "Absent";
            });
            setAttendanceData(studentAttendance);
        }
    
        setIsAttendanceModalOpen(true);
    };
    
    

    const handleAttendanceChange = (studentId, checked) => {
        setAttendanceData((prevData) => ({
            ...prevData,
            [studentId]: checked ? "Present" : "Absent",
        }));
    };

    const submitAttendance = async () => {
        try {
            const attendancePayload = Object.entries(attendanceData).map(([studentId, status]) => ({
                class_id: Number(id),  // Đảm bảo class_id là số
                session_id: currentSession.session_id,
                student_id: Number(studentId),  // Đảm bảo student_id là số
                status: status === "Present" ? "Present" : "Absent" ,
            }));
    
            console.log("Sending attendance payload:", attendancePayload);  // Kiểm tra dữ liệu
    
            await axios.post(
                `http://127.0.0.1:8000/classes/${id}/sessions/${currentSession.date}/attendance`,
                attendancePayload,
                { headers: getAuthHeaders() }
            );
    
            message.success("Điểm danh thành công!");
            setIsAttendanceModalOpen(false);
            fetchSessions();
        } catch (error) {
            console.error("Lỗi khi gửi điểm danh:", error.response?.data || error);
            message.error("Lỗi khi gửi điểm danh.");
        }
    };
    


    const handleEnrollStudent = async (studentId) => {
        try {
            await axios.post(`http://127.0.0.1:8000/classes/${id}/enroll/${studentId}`, {}, {
                headers: getAuthHeaders(),
            });
            message.success("Học sinh đã được thêm vào lớp!");
            fetchStudents();
            setIsEnrollModalOpen(false);
        } catch (error) {
            message.error("Lỗi khi thêm học sinh vào lớp.");
        }
    };

    const exportAttendanceToExcel = async () => {
        try {
            const attendanceResponse = await axios.get(
                `http://127.0.0.1:8000/classes/${id}/attendance`,
                { headers: getAuthHeaders() }
            );

            const attendanceRecords = attendanceResponse.data;
            if (!attendanceRecords.length) {
                message.warning("Không có dữ liệu điểm danh để xuất.");
                return;
            }

            // ✅ Tiêu đề file
            const title = [["Attendance Register"]];
            const classInfoHeader = [
                ["Class Code:", classInfo.class_code],
                ["Teacher:", classInfo.teacher_name],
                ["From:", moment(classInfo.start_date).format("DD-MM-YYYY")],
                ["To:", moment(classInfo.end_date).format("DD-MM-YYYY")],
                ["Schedule:", classInfo.weekly_schedule.join(", ")],
                ["Total Sessions:", classInfo.total_sessions]
            ];

            // ✅ Tiêu đề cột chính
            const mainHeader = ["No", "Student Name", "Date of Birth", "Gender", "Join Date"];

            // ✅ Tiêu đề các cột ngày học (Buổi số - Ngày)
            const sessionHeaders = sessions.map((session, index) => ({
                header: `S${index + 1} - ${moment(session.date).format("DD-MM-YYYY")}`,
                date: session.date
            }));

            // ✅ Hoàn thiện hàng tiêu đề
            const fullHeader = [...mainHeader, ...sessionHeaders.map(s => s.header), "Note"];

            // ✅ Xây dựng dữ liệu học sinh
            const studentRows = students.map((student, idx) => {
                const row = [
                    idx + 1, // STT
                    student.full_name,
                    moment(student.dob).format("DD-MM-YYYY"),
                    student.gender,
                    moment(student.join_date).format("DD-MM-YYYY") // Ngày vào lớp
                ];

                // ✅ Gán trạng thái điểm danh cho mỗi ngày học
                sessionHeaders.forEach(session => {
                    const attendance = attendanceRecords.find(
                        att => att.student_id === student.id && att.session_date === session.date
                    );
                    row.push(attendance ? attendance.status : ""); // Present, Absent, Late, Excused
                });

                row.push(""); // Cột Note
                return row;
            });

            // ✅ Gộp tất cả dữ liệu vào sheet
            const worksheetData = [...title, [], ...classInfoHeader, [], fullHeader, ...studentRows];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

            // ✅ Xuất file Excel
            XLSX.writeFile(workbook, `Attendance_Class_${classInfo.class_code}.xlsx`);
            message.success("Xuất file điểm danh thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất file điểm danh:", error.response?.data || error);
            message.error("Lỗi khi xuất file điểm danh.");
        }
    };

    

    if (loading) return <p>Đang tải thông tin lớp học...</p>;

    return (
        <div style={{ padding: 20 }}>

            {/* 🔹 Breadcrumb hoặc nút Back */}
            <div style={{ marginBottom: 16 }}>
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/manager/classes">Quản lý lớp học</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{classInfo.class_code}</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {classInfo ? (
                <>
                    {/* Basic Info */}
                    <Card title="Basic Info" style={{ marginBottom: 20 }} extra={<Button onClick={() => setIsUpdateModalOpen(true)}>Cập nhật</Button>}>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                            <div style={{ flex: "1 1 45%" }}>
                                <p><strong>Mã lớp:</strong> {classInfo.class_code}</p>
                                <p><strong>Tên lớp:</strong> {classInfo.name}</p>
                                <p><strong>Môn học:</strong> {classInfo.subject}</p>
                                <p><strong>Giảng viên:</strong> {classInfo.teacher_name || "Chưa phân công"}</p>
                                
                            </div>
                            <div style={{ flex: "1 1 45%" }}>
                                <p><strong>Trạng thái:</strong> {classInfo.status}</p>
                                <p><strong>Số lượng học sinh:</strong> {students.length}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Calendar Info */}
                    <Card title="Calendar Info" style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
                            <div style={{ flex: "1 1 45%" }}>
                                <p><strong>Ngày bắt đầu:</strong> {moment(classInfo.start_date).format("DD-MM-YYYY")}</p>
                                <p><strong>Ngày kết thúc:</strong> {moment(classInfo.end_date).format("DD-MM-YYYY")}</p>
                                <p><strong>Số giờ học mỗi tuần:</strong> 4 giờ/tuần</p>
                            </div>
                            <div style={{ flex: "1 1 45%" }}>
                                <p><strong>Lịch học:</strong> {formatWeeklySchedule(classInfo.weekly_schedule)}</p>
                                <p><strong>Số buổi học:</strong> {classInfo.total_sessions}</p>
                            </div>
                        </div>
                    </Card>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Danh sách buổi học" key="1">
                            <Button type="primary" onClick={exportAttendanceToExcel} style={{ marginBottom: 16 }}>
                                Xuất file điểm danh
                            </Button>
                            <Table
                                columns={[
                                    { title: "Buổi số", dataIndex: "session_number", key: "session_number" },
                                    { title: "Mã buổi học", dataIndex: "session_id", key: "session_id" },
                                    { title: "Ngày học", dataIndex: "date", key: "date", render: (date) => moment(date).format("DD-MM-YYYY") },
                                    { title: "Thứ", dataIndex: "weekday", key: "weekday" },
                                    { title: "Giờ bắt đầu", dataIndex: "start_time", key: "start_time" },
                                    { title: "Giờ kết thúc", dataIndex: "end_time", key: "end_time" },
                                    { title: "Số học sinh", dataIndex: "total_students", key: "total_students" },
                                    { title: "Tỉ lệ điểm danh", dataIndex: "attendance_rate", key: "attendance_rate", render: (rate) => `${rate}%` },
                                    {
                                        title: "Hành động",
                                        render: (_, record) => (
                                            <Button type="primary" onClick={() => openAttendanceModal(record)}>
                                                Điểm danh
                                            </Button>
                                        ),
                                    },
                                ]}
                                dataSource={sessions}
                                rowKey="id"
                            />
                        </TabPane>
                        <TabPane tab="Danh sách học sinh" key="2">
                            <Button type="primary" onClick={() => { fetchAllStudents(); setIsEnrollModalOpen(true); }}>
                                Enroll học sinh
                            </Button>
                            <Table
                                columns={[
                                    { title: "Mã học sinh", dataIndex: "id", key: "id" },
                                    { title: "Họ và Tên", dataIndex: "full_name", key: "name", render: (text, record) => <Link to={`/manager/students/${record.id}`}>{text}</Link> },
                                    { title: "Ngày sinh", dataIndex: "dob", key: "dob", render: (dob) => moment(dob).format("DD-MM-YYYY") },
                                    { title: "Email", dataIndex: "email", key: "email" },
                                    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone" },
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

            {/* Modal cập nhật thông tin lớp */}
            <Modal title="Cập nhật thông tin lớp" open={isUpdateModalOpen} onOk={handleUpdateClass} onCancel={() => setIsUpdateModalOpen(false)}>
                <Form form={form} layout="vertical" initialValues={classInfo}>
                    <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Enroll học sinh */}
            <Modal title="Enroll học sinh vào lớp" open={isEnrollModalOpen} onCancel={() => setIsEnrollModalOpen(false)} footer={null}>
                <Input placeholder="Tìm kiếm học sinh..." onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} />
                <Table
                    columns={[
                        { title: "Tên học sinh", dataIndex: "full_name", key: "name" },
                        { title: "Email", dataIndex: "email", key: "email" },
                        { title: "Hành động", render: (_, record) => <Button onClick={() => handleEnrollStudent(record.id)}>Enroll</Button> },
                    ]}
                    dataSource={allStudents.filter((s) => s.full_name.toLowerCase().includes(searchTerm))}
                    rowKey="id"
                />
            </Modal>

            <Modal
                title="Điểm danh buổi học"
                open={isAttendanceModalOpen}
                onOk={submitAttendance}
                onCancel={() => setIsAttendanceModalOpen(false)}
                footer={[
                    <Button key="faceid" type="primary" onClick={() => navigate(`/face-attendance?classId=${id}&sessionDate=${currentSession?.date}`)}>
                      Điểm danh FaceID
                    </Button>,
                    <Button key="manual" type="primary" onClick={submitAttendance}>
                      Lưu điểm danh thủ công
                    </Button>,
                    <Button key="cancel" onClick={() => setIsAttendanceModalOpen(false)}>
                      Hủy
                    </Button>,
                  ]}
            >
                <Table
                    columns={[
                        { title: "Mã học sinh", dataIndex: "id", key: "id" },
                        { title: "Họ và Tên", dataIndex: "full_name", key: "name" },
                        {
                            title: "Điểm danh",
                            render: (_, record) => (
                                <Switch
                                    checked={attendanceData[record.id] === "Present"}
                                    onChange={(checked) => handleAttendanceChange(record.id, checked)}
                                />
                            ),
                        },
                    ]}
                    dataSource={currentSession?.students || students}
                    rowKey="id"
                />
            </Modal>
        </div>
    );
};

export default ClassDetail;
