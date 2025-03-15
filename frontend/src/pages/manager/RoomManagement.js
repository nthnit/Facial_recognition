import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PoweroffOutlined } from "@ant-design/icons";
import axios from "axios";
import API_BASE_URL from "../../api/config"
import { useNavigate } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;


const RoomManagement = () => {
  usePageTitle("Room Management");

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
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

  // Fetch danh sách phòng học từ API
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: getAuthHeaders(),
      });
      setRooms(response.data);
      setFilteredRooms(response.data); // Cập nhật danh sách đã lọc
    } catch (error) {
      message.error("Lỗi khi tải danh sách phòng học.");
    }
    setLoading(false);
  };

  // Tìm kiếm phòng học
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = rooms.filter(
      (room) =>
        room.room_name.toLowerCase().includes(value) ||
        room.room_code.toLowerCase().includes(value)
    );

    setFilteredRooms(filtered);
  };

  // Thêm phòng mới hoặc chỉnh sửa phòng
  const showModal = (room = null) => {
    setEditingRoom(room);
    setIsModalOpen(true);
    form.setFieldsValue(
      room
        ? {
            ...room,
            status: room.status,
          }
        : {
            room_code: "",
            room_name: "",
            capacity: 0,
            location: "",
            status: "Active", // mặc định trạng thái là Active
          }
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };

      if (editingRoom) {
        // Cập nhật phòng
        await axios.put(`${API_BASE_URL}/rooms/${editingRoom.id}`, payload, {
          headers: getAuthHeaders(),
        });
        message.success("Cập nhật thông tin phòng thành công!");
      } else {
        // Thêm phòng mới
        await axios.post(`${API_BASE_URL}/rooms`, payload, {
          headers: getAuthHeaders(),
        });
        message.success("Thêm phòng học mới thành công!");
      }
      fetchRooms();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Lỗi khi lưu thông tin phòng học.");
    }
  };

  // Xóa phòng
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/rooms/${id}`, {
        headers: getAuthHeaders(),
      });
      message.success("Xóa phòng học thành công!");
      fetchRooms();
    } catch (error) {
      message.error("Lỗi khi xóa phòng học.");
    }
  };

  // Thay đổi trạng thái phòng (Active/Deactive)
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/rooms/${id}/change-status`,
        { status: status === "Active" ? "Deactive" : "Active" },
        {
          headers: getAuthHeaders(),
        }
      );
      message.success(`Cập nhật trạng thái phòng thành công!`);
      fetchRooms();
    } catch (error) {
      message.error("Lỗi khi thay đổi trạng thái phòng học.");
    }
  };

  const columns = [
    { title: "Mã phòng", dataIndex: "room_code", key: "room_code" },
    { title: "Tên phòng", dataIndex: "room_name", key: "room_name" },
    { title: "Sức chứa", dataIndex: "capacity", key: "capacity" },
    { title: "Địa chỉ", dataIndex: "location", key: "location" },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status) => <Text>{status}</Text> },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* Nút Cập nhật */}
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}  // Hàm mở modal cập nhật phòng
          />
          
          {/* Nút Xoá */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phòng học này?"
            onConfirm={() => handleDelete(record.id)} // Hàm xử lý xoá phòng
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>

          {/* Nút Đổi Trạng Thái */}
          <Button
            icon={<PoweroffOutlined />}
            onClick={() => handleStatusChange(record.id, record.status)} // Hàm xử lý đổi trạng thái
            style={{ backgroundColor: record.status === "Active" ? "red" : "gray", color: "white" }}
          >
            {record.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </Space>
      ),
    },
];

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>Quản lý Phòng học</Title>
      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="Tìm kiếm phòng học..."
          prefix={<SearchOutlined />}
          onChange={handleSearch}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm Phòng học
        </Button>
      </Space>
      <Table columns={columns} dataSource={filteredRooms} loading={loading} rowKey="id" />

      {/* Modal sửa thông tin phòng học */}
      <Modal
        title={editingRoom ? "Chỉnh sửa Phòng học" : "Thêm Phòng học"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên phòng" name="room_name" rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Sức chứa" name="capacity" rules={[{ required: true, message: "Vui lòng nhập sức chứa!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="location">
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Deactive">Deactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
