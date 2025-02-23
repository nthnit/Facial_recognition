import React, { useState, useEffect } from "react";
import { Table, Select, Button, Space, message, Input } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Thêm dòng import này để sửa lỗi

const { Option } = Select;

const AssignTeaching = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate(); // ✅ Định nghĩa navigate

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    // API lấy danh sách lớp học
    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/classes", {
                headers: getAuthHeaders(),
            });
            setClasses(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách lớp học.");
        }
        setLoading(false);
    };

    // API lấy danh sách giảng viên
    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/teachers", {
                headers: getAuthHeaders(),
            });
            setTeachers(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách giảng viên.");
        }
    };

    // Xử lý khi thay đổi giảng viên
    const handleTeacherChange = (classId, teacherId) => {
        setClasses((prevClasses) =>
            prevClasses.map((cls) =>
                cls.id === classId ? { ...cls, teacher_id: teacherId } : cls
            )
        );
    };

    // Gửi API để cập nhật giảng viên cho lớp
    const handleAssign = async (classId, teacherId) => {
        try {
            await axios.put(
                `http://127.0.0.1:8000/classes/${classId}`,
                { teacher_id: teacherId },
                { headers: getAuthHeaders() }
            );
            message.success("Phân công giảng viên thành công!");
        } catch (error) {
            message.error("Lỗi khi phân công giảng viên.");
        }
    };

    // Xử lý tìm kiếm lớp học
    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    // Lọc lớp học dựa trên tìm kiếm
    const filteredClasses = classes.filter(
        (cls) =>
            cls.name.toLowerCase().includes(searchText) ||
            cls.class_code.toLowerCase().includes(searchText)
    );

    const columns = [
        {
            title: "Mã lớp",
            dataIndex: "class_code",
            key: "class_code",
        },
        {
            title: "Tên lớp",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Giảng viên",
            dataIndex: "teacher_id",
            key: "teacher_id",
            render: (_, record) => (
                <Select
                    value={record.teacher_id || "Chưa phân công"}
                    style={{ width: 200 }}
                    onChange={(value) => handleTeacherChange(record.id, value)}
                >
                    <Option value={null}>Chưa phân công</Option>
                    {teachers.map((teacher) => (
                        <Option key={teacher.id} value={teacher.id}>
                            {teacher.full_name}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => handleAssign(record.id, record.teacher_id)}
                    disabled={!record.teacher_id}
                >
                    Lưu
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Phân công Giảng viên</h2>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm lớp học..."
                    onChange={handleSearch}
                    allowClear
                />
            </Space>
            <Table
                columns={columns}
                dataSource={filteredClasses}
                loading={loading}
                rowKey="id"
            />
        </div>
    );
};

export default AssignTeaching;
