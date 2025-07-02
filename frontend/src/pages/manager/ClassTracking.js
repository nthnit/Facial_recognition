import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Modal, Form, message} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import moment from "moment";
import usePageTitle from "../common/usePageTitle";
import { fetchClasses, fetchTeachers, fetchRooms, createClass, updateClass, deleteClass } from "../../api/classes";
import ClassForm from "../../components/ClassForm";


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
    const [classTimes, setClassTimes] = useState({});
    const [rooms, setRooms] = useState([]);
    const [roomSelection, setRoomSelection] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassesData();
        fetchTeachersData();
        fetchRoomsData();
    }, []);

    const fetchRoomsData = async () => {
        try {
            const data = await fetchRooms();
            setRooms(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách phòng học.");
        }
    };

    const handleRoomChange = (day, roomId) => {
        setRoomSelection((prev) => ({
            ...prev,
            [day]: roomId,
        }));
    };

    const fetchClassesData = async () => {
        setLoading(true);
        try {
            const data = await fetchClasses();
            setClasses(data);
            setFilteredClasses(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách lớp học.");
        }
        setLoading(false);
    };

    const fetchTeachersData = async () => {
        try {
            const data = await fetchTeachers();
            setTeachers(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách giáo viên.");
        }
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.message === "Unauthorized") {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
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
                roomSelection: classData.room_selection || {},
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
            
            const start_time = [];
            const end_time = [];
            const room_ids = [];
    
            weeklySchedule.forEach(day => {
                if (classTimes[day]) {
                    start_time.push(classTimes[day].start_time);
                    end_time.push(classTimes[day].end_time);
                    room_ids.push(values[`room_id_${day}`]);
                }
            });
    
            const payload = {
                ...values,
                start_date: values.start_date ? values.start_date.format("YYYY-MM-DD") : null,
                total_sessions: Number(values.total_sessions),
                teacher_id: values.teacher_id,
                weekly_schedule: weeklySchedule.map(Number),
                start_time: start_time,
                end_time: end_time,
                room_ids: room_ids
            };
    
            if (editingClass) {
                await updateClass(editingClass.id, payload);
                message.success("Cập nhật lớp học thành công!");
            } else {
                await createClass(payload);
                message.success("Thêm lớp học thành công!");
            }
    
            fetchClassesData();
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi lưu lớp học.");
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá lớp học?",
            content: "Bạn có chắc chắn muốn xoá lớp học này không?",
            onOk: async () => {
                try {
                    await deleteClass(id);
                    message.success("Xóa lớp học thành công!");
                    fetchClassesData();
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
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "#1890ff";
                let borderColor = "#1890ff";
                if (status === "Active") {
                    color = "#52c41a";
                    borderColor = "#52c41a";
                } else if (status === "Planning") {
                    color = "#faad14";
                    borderColor = "#faad14";
                } else if (status === "Finish") {
                    color = "#1890ff";
                    borderColor = "#1890ff";
                }
                return (
                    <span style={{
                        color,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 8,
                        padding: "2px 12px",
                        fontWeight: 600,
                        background: "#fff",
                        display: "inline-block",
                        minWidth: 70,
                        textAlign: "center"
                    }}>
                        {status}
                    </span>
                );
            },
        },
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
                <ClassForm
                    form={form}
                    teachers={teachers}
                    rooms={rooms}
                    weeklySchedule={weeklySchedule}
                    setWeeklySchedule={setWeeklySchedule}
                    classTimes={classTimes}
                    handleClassTimeChange={handleClassTimeChange}
                    roomSelection={roomSelection}
                    handleRoomChange={handleRoomChange}
                />
            </Modal>
        </div>
    );
};

export default ClassTracking;
