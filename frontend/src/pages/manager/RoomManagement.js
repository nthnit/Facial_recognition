import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Typography, message, Popconfirm, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../common/usePageTitle";
import { Link } from "react-router-dom";
import { fetchRooms, createRoom, updateRoom, deleteRoom, changeRoomStatus } from "../../api/rooms";

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

  useEffect(() => {
    fetchRoomsData();
  }, []);

  const fetchRoomsData = async () => {
    setLoading(true);
    try {
      const data = await fetchRooms();
      setRooms(data);
      setFilteredRooms(data);
    } catch (error) {
      handleRequestError(error, "Lỗi khi tải danh sách phòng học.");
    }
    setLoading(false);
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

    const filtered = rooms.filter(
      (room) =>
        room.room_name.toLowerCase().includes(value) ||
        room.room_code.toLowerCase().includes(value)
    );

    setFilteredRooms(filtered);
  };

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
            status: "Active",
          }
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };

      if (editingRoom) {
        await updateRoom(editingRoom.id, payload);
        message.success("Cập nhật thông tin phòng thành công!");
      } else {
        await createRoom(payload);
        message.success("Thêm phòng học mới thành công!");
      }
      fetchRoomsData();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      handleRequestError(error, "Lỗi khi lưu thông tin phòng học.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id);
      message.success("Xóa phòng học thành công!");
      fetchRoomsData();
    } catch (error) {
      handleRequestError(error, "Lỗi khi xóa phòng học.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await changeRoomStatus(id, status === "Active" ? "Deactive" : "Active");
      message.success(`Cập nhật trạng thái phòng thành công!`);
      fetchRoomsData();
    } catch (error) {
      handleRequestError(error, "Lỗi khi thay đổi trạng thái phòng học.");
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
