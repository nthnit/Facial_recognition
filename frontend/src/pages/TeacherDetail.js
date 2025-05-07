import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Table, Tabs, message, Button, Row, Col, Avatar, Select, Modal, Form, Input, DatePicker } from "antd";
import { EditOutlined } from "@ant-design/icons"
import moment from "moment";
import usePageTitle from "./common/usePageTitle";
import { Breadcrumb } from 'antd';
import {
    fetchTeacherDetail,
    fetchTeacherClasses,
    fetchTeacherSchedules,
    updateTeacher
} from "../api/teachers";

const { TabPane } = Tabs;

const TeacherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduleFilter, setScheduleFilter] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    usePageTitle("Teacher Detail");

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [teacherData, classesData, schedulesData] = await Promise.all([
                fetchTeacherDetail(id),
                fetchTeacherClasses(id),
                fetchTeacherSchedules(id)
            ]);
            setTeacherInfo(teacherData);
            setAssignedClasses(classesData);
            setSchedules(schedulesData);
        } catch (error) {
            if (error.message === "Unauthorized") {
                message.error("Bạn chưa đăng nhập!");
                navigate("/login");
            } else {
                message.error("Lỗi khi tải dữ liệu giáo viên.");
            }
        }
        setLoading(false);
    };

    // Lọc lịch dạy theo loại (hôm nay, sắp tới, đã qua)
    const filteredSchedules = schedules.filter(schedule => {
        const today = moment().startOf('day');
        const scheduleDate = moment(schedule.date);

        if (scheduleFilter === 'today') {
            return scheduleDate.isSame(today, 'day');
        } else if (scheduleFilter === 'upcoming') {
            return scheduleDate.isAfter(today, 'day');
        } else if (scheduleFilter === 'past') {
            return scheduleDate.isBefore(today, 'day');
        }
        return true; // all
    });

    // Xử lý form update teacher
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date_of_birth: values.dob ? values.dob.format("YYYY-MM-DD") : teacherInfo.date_of_birth,
            };

            await updateTeacher(id, payload);
            message.success("Cập nhật thông tin giáo viên thành công!");
            loadData();
            setIsModalVisible(false);
        } catch (error) {
            message.error("Lỗi khi cập nhật thông tin giáo viên.");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    if (loading) return <p>Đang tải thông tin giáo viên...</p>;

    return (
        <div style={{ padding: 20 }}>
            <Breadcrumb style={{ marginBottom: 20 }}>
                <Breadcrumb.Item>
                    <Link to="/manager/teachers">Danh sách giáo viên</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{teacherInfo.full_name}</Breadcrumb.Item>
            </Breadcrumb>

            <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Avatar size={120} src={teacherInfo.avatar_url || "/default-avatar.jpg"} style={{border: "5px solid rgb(104,209,253)", width:"10vw", height: "auto", aspectRatio: "1"}}/>
                    </Col>
                    <Col span={18}>
                        <p><strong>Tên giáo viên:</strong> {teacherInfo.full_name}</p>
                        <p><strong>Email:</strong> {teacherInfo.email}</p>
                        <p><strong>Số điện thoại:</strong> {teacherInfo.phone_number}</p>
                        <p><strong>Ngày sinh:</strong> {moment(teacherInfo.date_of_birth).format("DD-MM-YYYY")}</p>
                        <p><strong>Giới tính:</strong> {teacherInfo.gender === "male" ? "Nam" : teacherInfo.gender === "female" ? "Nữ" : "Khác"}</p>
                        <p><strong>Địa chỉ:</strong> {teacherInfo.address || "Chưa cập nhật"}</p>
                        
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            <EditOutlined /> Sửa thông tin
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Tabs defaultActiveKey="1">
                <TabPane tab="Các lớp giảng dạy" key="1">
                    <Table
                        dataSource={assignedClasses}
                        columns={[
                            { title: "Mã lớp", dataIndex: "class_code", key: "class_code", render: (text, record) => <Link to={`/manager/classes/${record.id}`}>{text}</Link> },
                            { title: "Tên lớp", dataIndex: "name", key: "name" },
                            { title: "Môn học", dataIndex: "subject", key: "subject" },
                            { title: "Trạng thái", dataIndex: "status", key: "status" },
                            { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date", render: date => moment(date).format("DD-MM-YYYY") },
                            { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date", render: date => moment(date).format("DD-MM-YYYY") },
                            { title: "Tổng số tiết", dataIndex: "total_sessions", key: "total_sessions" },
                            { title: "Sĩ số", dataIndex: "total_students", key: "total_students" }
                        ]}
                        rowKey="id"
                        pagination={false}
                        bordered
                    />
                </TabPane>

                <TabPane tab="Lịch dạy" key="2">
                    <Select 
                        value={scheduleFilter} 
                        onChange={setScheduleFilter} 
                        style={{ marginBottom: 20, width: "12vw" }}
                    >
                        <Select.Option value="all">Tất cả</Select.Option>
                        <Select.Option value="today">Hôm nay</Select.Option>
                        <Select.Option value="upcoming">Sắp tới</Select.Option>
                        <Select.Option value="past">Đã qua</Select.Option>
                    </Select>
                    <Table
                        dataSource={filteredSchedules}
                        columns={[
                            { title: "Mã tiết học", dataIndex: "session_id", key: "session_id", render: (text, record) => <Link to={`/sessions/${record.session_id}`}>{text}</Link> },
                            {
                                title: "Ngày",
                                dataIndex: "date",
                                key: "date",
                                render: (date) => moment(date).format("DD-MM-YYYY"),
                            },
                            { title: "Lớp", dataIndex: "class_name", key: "class_name" },
                            { title: "Giờ bắt đầu", dataIndex: "start_time", key: "start_time" },
                            { title: "Giờ kết thúc", dataIndex: "end_time", key: "end_time" },
                            { title: "Sĩ số", dataIndex: "student_count", key: "student_count" },
                        ]}
                        rowKey="id"
                        pagination={false}
                        bordered
                    />
                </TabPane>
            </Tabs>

            <Modal
                title="Cập nhật thông tin giáo viên"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={teacherInfo}
                >
                    <Form.Item label="Tên giáo viên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập tên giáo viên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender">
                        <Select defaultValue={teacherInfo.gender}>
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                            <Select.Option value="other">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="dob">
                        <DatePicker defaultValue={teacherInfo.dob ? moment(teacherInfo.dob) : null} format="DD-MM-YYYY" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherDetail;
