import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Modal, Form, message, DatePicker, Select, TimePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import moment from "moment";
import usePageTitle from "../common/usePageTitle";

const { Option } = Select;

const ClassTracking = () => {
    usePageTitle("Class Tracking");
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [classTimes, setClassTimes] = useState({}); // Track selected times for each weekday
    const [rooms, setRooms] = useState([]); // Danh sách phòng học
    const [roomSelection, setRoomSelection] = useState({}); // Track selected rooms for each weekday

    const navigate = useNavigate();

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    // Fetch danh sách lớp học từ API
    useEffect(() => {
        fetchClasses();
        fetchTeachers();
        fetchRooms(); 
    }, []);

    const fetchRooms = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/rooms", {
            headers: getAuthHeaders(),
          });
          setRooms(response.data);
        } catch (error) {
          handleRequestError(error, "Lỗi khi tải danh sách phòng học.");
        }
    };
    
    const handleRoomChange = (day, roomId) => {
        setRoomSelection((prev) => ({
          ...prev,
          [day]: roomId, // Update room selection for the specific day
        }));
      };
      
      

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/classes", {
                headers: getAuthHeaders(),
            });
            setClasses(response.data);
            setFilteredClasses(response.data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách lớp học.");
        }
        setLoading(false);
    };

    // ✅ API lấy danh sách giáo viên
    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/teachers", {
                headers: getAuthHeaders(),
            });
            setTeachers(response.data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách giáo viên.");
        }
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.response?.status === 401) {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        } else if (error.response?.status === 403) {
            message.error("Bạn không có quyền thực hiện thao tác này!");
        } else {
            message.error(defaultMessage);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);

        const filtered = classes.filter(
            (cls) =>
                cls.class_code.toLowerCase().includes(value) ||
                cls.name.toLowerCase().includes(value) ||
                cls.teacher_id.toString().includes(value)
        );

        setFilteredClasses(filtered);
    };

    const exportToExcel = () => {
        if (classes.length === 0) {
            message.warning("Không có dữ liệu để xuất.");
            return;
        }

        const dataToExport = classes.map((cls) => ({
            "Mã lớp": cls.class_code,
            "Tên lớp": cls.name,
            "Giáo viên": cls.teacher_id,
            "Ngày bắt đầu": moment(cls.start_date).format("DD-MM-YYYY"),
            "Ngày kết thúc": moment(cls.end_date).format("DD-MM-YYYY"),
            "Số buổi học": cls.total_sessions,
            "Môn học": cls.subject,
            "Trạng thái": cls.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách lớp");

        XLSX.writeFile(workbook, "DanhSachLop.xlsx");
        message.success("Xuất danh sách lớp học thành công!");
    };

    const showModal = (classData = null) => {
        setEditingClass(classData);
        setIsModalOpen(true);
        form.setFieldsValue(
          classData
            ? {
                ...classData,
                start_date: classData.start_date ? moment(classData.start_date) : null,
                end_date: classData.end_date ? moment(classData.end_date) : null,
                // Giới thiệu logic phòng học cho từng ngày
                roomSelection: classData.room_selection || {},  // Gán room_selection vào form
              }
            : { class_code: "", name: "", teacher_id: "", start_date: null, end_date: null, total_sessions: "", subject: "", status: "" }
        );
      };
      

    const handleClassTimeChange = (day, timeType, timeValue) => {
        console.log(`Day: ${day}, TimeType: ${timeType}, TimeValue: ${timeValue}`);  // Log giá trị time
        
        // Kiểm tra nếu timeValue là một đối tượng moment
        if (timeValue && timeValue.isValid()) {
            const hours = timeValue.hour();  // Lấy giờ
            console.log('Hours:', hours);
    
            const minutes = timeValue.minute();  // Lấy phút
            const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;  // Định dạng HH:mm
            console.log(`Formatted Time: ${formattedTime}`);  // Kiểm tra giá trị đã được định dạng
    
            setClassTimes((prev) => ({
                ...prev,
                [day]: {
                    ...prev[day],
                    [timeType]: formattedTime,  // Lưu đúng giá trị giờ đã được định dạng
                },
            }));
        } else {
            console.log('Invalid time value');
        }
    };
    

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            
            // Tạo mảng start_time, end_time và room_ids từ classTimes
            const start_time = [];
            const end_time = [];
            const room_ids = []; // Mảng lưu room_ids cho mỗi ngày trong lịch
    
            weeklySchedule.forEach(day => {
                if (classTimes[day]) {
                    start_time.push(classTimes[day].start_time);
                    end_time.push(classTimes[day].end_time);
                    room_ids.push(values[`room_id_${day}`]);  // Lưu room_id cho mỗi ngày
                }
            });
    
            const payload = {
                ...values,
                start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
                total_sessions: Number(values.total_sessions),
                teacher_id: values.teacher_id,
                weekly_schedule: weeklySchedule.map(Number), // Dữ liệu lịch học
                start_time: start_time,  // Gửi mảng start_time
                end_time: end_time,      // Gửi mảng end_time
                room_ids: room_ids      // Gửi mảng room_ids cho từng buổi học
            };
    
            console.log("Sending payload:", payload); // Kiểm tra dữ liệu trước khi gửi
    
            if (editingClass) {
                await axios.put(`http://127.0.0.1:8000/classes/${editingClass.id}`, payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Cập nhật lớp học thành công!");
            } else {
                await axios.post("http://127.0.0.1:8000/classes", payload, {
                    headers: getAuthHeaders(),
                });
                message.success("Thêm lớp học thành công!");
            }
    
            fetchClasses();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error("Error response:", error.response?.data); // Kiểm tra lỗi
            handleRequestError(error, "Lỗi khi lưu lớp học.");
        }
    };
    
    
    
    
    

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá lớp học?",
            content: "Bạn có chắc chắn muốn xoá lớp học này không?",
            onOk: async () => {
                try {
                    await axios.delete(`http://127.0.0.1:8000/classes/${id}`, {
                        headers: getAuthHeaders(),
                    });
                    message.success("Xóa lớp học thành công!");
                    fetchClasses();
                } catch (error) {
                    handleRequestError(error, "Lỗi khi xóa lớp học.");
                }
            },
        });
    };

    const columns = [
        {
            title: "Mã lớp",
            dataIndex: "class_code",
            key: "class_code",
            render: (text, record) => <Link to={`/manager/classes/${record.id}`}>{text}</Link>,
        },
        { title: "Tên lớp", dataIndex: "name", key: "name" },
        { title: "Giảng viên", dataIndex: "teacher_name", key: "teacher_id" },
        { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date", render: (date) => moment(date).format("DD-MM-YYYY") },
        { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date", render: (date) => moment(date).format("DD-MM-YYYY") },
        { title: "Số buổi học", dataIndex: "total_sessions", key: "total_sessions" },
        { title: "Môn học", dataIndex: "subject", key: "subject" },
        { title: "Trạng thái", dataIndex: "status", key: "status" },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Danh sách Lớp học</h2>
            <Space style={{ marginBottom: 16 }}>
                <Input placeholder="Tìm kiếm lớp học..." prefix={<SearchOutlined />} onChange={handleSearch} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm lớp học
                </Button>
                <Button type="default" icon={<FileExcelOutlined />} onClick={exportToExcel}>
                    Xuất Excel
                </Button>
            </Space>
            <Table columns={columns} dataSource={filteredClasses} loading={loading} rowKey="id" />

            <Modal title={editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học"} open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giáo viên"
                        name="teacher_id"
                        rules={[{ required: true, message: "Vui lòng chọn giáo viên!" }]}
                    >
                        <Select placeholder="Chọn giáo viên">
                            {teachers.map((teacher) => (
                                <Select.Option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Môn học" name="subject" rules={[{ required: true, message: "Vui lòng nhập môn học!" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Ngày bắt đầu" name="start_date" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}>
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Số buổi học" name="total_sessions" rules={[{ required: true, message: "Vui lòng nhập tổng số buổi học!" }]}>
                        <Input type="number" min={1} />
                    </Form.Item>

                    <Form.Item label="Lịch học hàng tuần">
                        <Select
                            mode="multiple"
                            placeholder="Chọn ngày học trong tuần"
                            value={weeklySchedule}
                            onChange={(value) => setWeeklySchedule(value)}
                            style={{ width: "100%" }}
                        >
                            <Option value={0}>Thứ Hai</Option>
                            <Option value={1}>Thứ Ba</Option>
                            <Option value={2}>Thứ Tư</Option>
                            <Option value={3}>Thứ Năm</Option>
                            <Option value={4}>Thứ Sáu</Option>
                            <Option value={5}>Thứ Bảy</Option>
                            <Option value={6}>Chủ Nhật</Option>
                        </Select>
                    </Form.Item>

                    {/* Time picker cho mỗi ngày học */}
                    {weeklySchedule.map((day) => (
                        <div key={day}>
                            <h4>{`Thứ ${day + 2}`}</h4>
                            <Form.Item label="Giờ bắt đầu" name={`start_time_${day}`}>
                                <TimePicker
                                    format="HH:mm"
                                    value={classTimes[day]?.start_time ? moment(classTimes[day]?.start_time, "HH:mm") : null}
                                    onChange={(time) => handleClassTimeChange(day, "start_time", time)}
                                />
                            </Form.Item>

                            <Form.Item label="Giờ kết thúc" name={`end_time_${day}`}>
                                <TimePicker
                                    format="HH:mm"
                                    value={classTimes[day]?.end_time ? moment(classTimes[day]?.end_time, "HH:mm") : null}
                                    onChange={(time) => handleClassTimeChange(day, "end_time", time)}
                                />
                            </Form.Item>
                            <Form.Item label="Phòng học" name={`room_id_${day}`}>
                            <Select
                                value={roomSelection[day]}
                                onChange={(value) => handleRoomChange(day, value)}
                                placeholder="Chọn phòng học"
                            >
                                {rooms.map((room) => (
                                <Select.Option key={room.id} value={room.id}>
                                    {room.room_name}
                                </Select.Option>
                                ))}
                            </Select>
                            </Form.Item>


                        </div>
                    ))}
                    
                </Form>
            </Modal>
        </div>
    );
};

export default ClassTracking;
