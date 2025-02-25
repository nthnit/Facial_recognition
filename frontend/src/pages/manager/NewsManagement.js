import React, { useEffect, useState } from "react";
import { List, Input, Button, message, Modal, Form, Space, Pagination, Upload, Card, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { TextArea } = Input;
const { Title, Text } = Typography;

const API_BASE_URL = "http://127.0.0.1:8000";

const NewsManagement = () => {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [uploading, setUploading] = useState(false);

    // Lấy token từ localStorage để gửi trong request
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/news`, {
                headers: getAuthHeaders(),
            });
            setNewsList(response.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách tin tức.");
        }
        setLoading(false);
    };

    const handleAddNews = async () => {
        try {
            const values = await form.validateFields();
    
            const requestData = {
                title: values.title,
                content: values.content,
                image_url: values.image_url || null, // ✅ Đảm bảo giá trị null nếu không có ảnh
                status: "active", // ✅ Cần đảm bảo gửi đúng kiểu enum
            };
    
            await axios.post(`${API_BASE_URL}/news`, requestData, {
                headers: getAuthHeaders(),
            });
    
            message.success("Đăng tin thành công!");
            setIsModalOpen(false);
            fetchNews();
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi đăng tin.");
        }
    };

    const handleEditNews = async (id) => {
        try {
            const values = await form.validateFields();
    
            const requestData = {
                title: values.title,
                content: values.content,
                image_url: values.image_url || null, // ✅ Đảm bảo giá trị null nếu không có ảnh
                status: "active", // ✅ Kiểu enum
            };
    
            await axios.put(`${API_BASE_URL}/news/${id}`, requestData, {
                headers: getAuthHeaders(),
            });
    
            message.success("Cập nhật tin tức thành công!");
            setIsModalOpen(false);
            fetchNews();
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi cập nhật tin tức.");
        }
    };

    const handleDeleteNews = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá tin tức?",
            content: "Bạn có chắc chắn muốn xoá tin tức này không?",
            onOk: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/news/${id}`, {
                        headers: getAuthHeaders(),
                    });
                    message.success("Xóa tin tức thành công!");
                    fetchNews();
                } catch (error) {
                    message.error("Lỗi khi xóa tin tức.");
                }
            },
        });
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value.toLowerCase());
    };

    const filteredNews = newsList.filter(
        (news) =>
            news.title.toLowerCase().includes(searchText) ||
            news.content.toLowerCase().includes(searchText)
    );

    // Phân trang danh sách tin tức
    const paginatedNews = filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const showModal = (news = null) => {
        setEditingNews(news);
        setIsModalOpen(true);
        form.setFieldsValue(news || { title: "", content: "", image_url: "" });
    };

    // Xử lý upload ảnh lên Cloudinary
    const handleUpload = async ({ file }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                navigate("/login");
                return;
            }
    
            const response = await axios.post(`${API_BASE_URL}/uploads/upload-image/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`, // ✅ Gửi token khi upload ảnh
                },
            });
    
            // Lấy URL từ Cloudinary và set vào form
            form.setFieldsValue({ image_url: response.data.image_url });
            message.success("Ảnh đã tải lên Cloudinary!");
        } catch (error) {
            if (error.response?.status === 403) {
                message.error("Bạn không có quyền upload ảnh.");
            } else {
                message.error("Lỗi khi tải ảnh lên Cloudinary.");
            }
        }
        setUploading(false);
    };

    return (
        <div style={{ padding: "20px" }}>
            <Title level={2} style={{ marginBottom: "20px", textAlign: "center" }}>
                Quản lý Tin tức
            </Title>

            {/* Search and Add New News */}
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Input
                    placeholder="Tìm kiếm tin tức..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    style={{ width: "60%" }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Đăng tin
                </Button>
            </Space>

            {/* News List */}
            <List
                style={{ marginTop: "20px" }}
                loading={loading}
                dataSource={filteredNews}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredNews.length,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "15", "20"],
                    style: { marginBottom: "20px" },
                }}
                renderItem={(item) => (
                    <Card
                        style={{ marginBottom: "10px" }}
                        hoverable
                        actions={[
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingNews(item);
                                    form.setFieldsValue(item);
                                    setIsModalOpen(true);
                                }}
                            >
                                Sửa
                            </Button>,
                            <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDeleteNews(item.id)}
                            >
                                Xóa
                            </Button>,
                        ]}
                    >
                        <Card.Meta
                            title={item.title}
                            description={
                                <>
                                    <p>{item.content}</p>
                                    {item.image_url && (
                                        <img
                                            src={item.image_url}
                                            alt="News"
                                            style={{ width: "100px", height: "auto", marginTop: "10px" }}
                                        />
                                    )}
                                    <p style={{ fontSize: "12px", color: "gray" }}>
                                        Ngày đăng: {moment(item.created_at).format("DD/MM/YYYY")}
                                    </p>
                                </>
                            }
                        />
                    </Card>
                )}
            />

            {/* Modal for Adding and Editing News */}
            <Modal
                title={editingNews ? "Chỉnh sửa Tin tức" : "Đăng Tin tức"}
                open={isModalOpen}
                onOk={editingNews ? () => handleEditNews(editingNews.id) : handleAddNews}
                onCancel={() => setIsModalOpen(false)}
                width={600}
            >
                <Form form={form} layout="vertical" initialValues={editingNews}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item label="Tải ảnh lên">
                        <Upload customRequest={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Ảnh đã tải lên" name="image_url">
                        <Input placeholder="Đường dẫn ảnh" readOnly />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsManagement;
