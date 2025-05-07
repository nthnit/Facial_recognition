import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Modal, Form, Input, Select, Space, message, DatePicker, Upload, Card } from "antd";
import { EditOutlined, PlusOutlined, LockOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    createUsersFromExcel
} from "../../api/users";

const { Option } = Select;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách người dùng");
        }
    };

    const handleRequestError = (error, defaultMessage) => {
        if (error.message === "Unauthorized") {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem("token");
            navigate("/login");
        } else if (error.response?.status === 403) {
            message.error("Bạn không có quyền thực hiện thao tác này!");
        } else {
            message.error(defaultMessage);
        }
    };

    const showModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
        form.setFieldsValue(user || { full_name: "", email: "", phone_number: "", role: "", date_of_birth: null });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const dateOfBirth = values.date_of_birth ? values.date_of_birth.format("YYYY-MM-DD") : null;
            const payload = { ...values, date_of_birth: dateOfBirth };

            if (!payload.date_of_birth) {
                message.error("Vui lòng chọn ngày sinh");
                return;
            }

            if (editingUser) {
                const updatedUser = await updateUser(editingUser.id, payload);
                setUsers(users.map((user) => user.id === editingUser.id ? updatedUser : user));
                message.success("Cập nhật người dùng thành công!");
            } else {
                const newUser = await createUser(payload);
                setUsers([...users, newUser]);
                message.success("Thêm người dùng thành công!");
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            handleRequestError(error, editingUser ? "Lỗi khi cập nhật người dùng" : "Lỗi khi thêm người dùng");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
            message.success("Xóa người dùng thành công");
        } catch (error) {
            handleRequestError(error, "Lỗi khi xóa người dùng");
        }
    };

    const handleResetPassword = async (id) => {
        try {
            await resetUserPassword(id);
            message.success("Mật khẩu đã được reset thành công!");
        } catch (error) {
            handleRequestError(error, "Lỗi khi reset mật khẩu");
        }
    };

    const handleBulkUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await createUsersFromExcel(formData);
            message.success(`Đã thêm thành công ${result.success_count} người dùng. ${result.error_count > 0 ? `Có ${result.error_count} người dùng bị lỗi.` : ''}`);
            loadUsers();
        } catch (error) {
            handleRequestError(error, "Lỗi khi thêm người dùng hàng loạt");
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                full_name: "Nguyễn Văn A",
                email: "nguyenvana@example.com",
                phone_number: "0123456789",
                role: "teacher",
                date_of_birth: "1990-01-01"
            }
        ];

        // Tạo worksheet từ template
        const ws = XLSX.utils.json_to_sheet(template);

        // Tạo workbook và thêm worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");

        // Tạo file Excel và tải xuống
        XLSX.writeFile(wb, "user_template.xlsx");
    };

    const columns = [
        { title: "Họ và Tên", dataIndex: "full_name", key: "full_name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
        { 
            title: "Vai trò", 
            dataIndex: "role", 
            key: "role", 
            render: (role) => {
                if (role === "teacher") return "Giáo viên";
                if (role === "manager") return "Quản lý giảng dạy";
                if (role === "admin") return "Quản trị viên";
                return role;
            } 
        },
        { 
            title: "Hành động", 
            key: "action", 
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc chắn muốn reset mật khẩu?" onConfirm={() => handleResetPassword(record.id)} okText="Reset" cancelText="Hủy">
                        <Button type="primary" danger ghost>Reset PW</Button>
                    </Popconfirm>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button type="dashed" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý Người dùng</h2>
            
            <Card style={{ marginBottom: 20 }}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        Thêm Người Dùng
                    </Button>
                    
                    <Upload
                        accept=".xlsx,.xls,.csv"
                        showUploadList={false}
                        customRequest={handleBulkUpload}
                    >
                        <Button icon={<UploadOutlined />}>
                            Thêm Hàng Loạt
                        </Button>
                    </Upload>

                    <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
                        Tải Mẫu File
                    </Button>
                </Space>
            </Card>

            <Table columns={columns} dataSource={users} rowKey="id" />
            
            <Modal 
                title={editingUser ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng"} 
                open={isModalOpen} 
                onOk={handleOk} 
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}> 
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}> 
                        <Select>
                            <Option value="teacher">Giáo viên</Option>
                            <Option value="manager">Quản lý giảng dạy</Option>
                            <Option value="admin">Quản trị viên</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày sinh" name="date_of_birth" rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;