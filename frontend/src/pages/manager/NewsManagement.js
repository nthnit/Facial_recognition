import React, { useEffect, useState } from "react";
import { List, Input, Button, message, Modal, Form, Space, Pagination } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { TextArea } = Input;

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
            const response = await axios.get("http://127.0.0.1:8000/news", {
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
            await axios.post("http://127.0.0.1:8000/news", values, {
                headers: getAuthHeaders(),
            });
            message.success("Đăng tin thành công!");
            setIsModalOpen(false);
            fetchNews();
            form.resetFields();
        } catch (error) {
            message.error("Lỗi khi đăng tin.");
        }
    };

    const handleEditNews = async (id) => {
        try {
            const values = await form.validateFields();
            await axios.put(`http://127.0.0.1:8000/news/${id}`, values, {
                headers: getAuthHeaders(),
            });
            message.success("Cập nhật tin tức thành công!");
            setIsModalOpen(false);
            fetchNews();
            form.resetFields();
        } catch (error) {
            message.error("Lỗi khi cập nhật tin tức.");
        }
    };

    const handleDeleteNews = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá tin tức?",
            content: "Bạn có chắc chắn muốn xoá tin tức này không?",
            onOk: async () => {
                try {
                    await axios.delete(`http://127.0.0.1:8000/news/${id}`, {
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

    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý Tin tức</h2>
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Tìm kiếm tin tức..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Đăng tin
                </Button>
            </Space>
            <List
                style={{ marginTop: 20 }}
                loading={loading}
                header={<h3>Danh sách tin tức</h3>}
                bordered
                dataSource={paginatedNews}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button icon={<EditOutlined />} onClick={() => showModal(item)}>Sửa</Button>,
                            <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteNews(item.id)}>Xóa</Button>
                        ]}
                    >
                        <List.Item.Meta
                            title={item.title}
                            description={
                                <>
                                    <p>{item.content}</p>
                                    {item.image_url && (
                                        <img
                                            src={item.image_url}
                                            alt="Hình ảnh"
                                            style={{ width: "100px", height: "auto", marginTop: 10 }}
                                        />
                                    )}
                                    <p style={{ fontSize: "12px", color: "gray" }}>
                                        Ngày đăng: {moment(item.created_at).format("DD/MM/YYYY")}
                                    </p>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredNews.length}
                onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                }}
                showSizeChanger
                pageSizeOptions={["5", "10", "15", "20"]} // ✅ Chỉ cho phép chọn 5, 10, 15, 20 tin tức trên mỗi trang
                style={{ marginTop: 20, textAlign: "center" }}
            />

            <Modal
                title={editingNews ? "Chỉnh sửa Tin tức" : "Đăng Tin tức"}
                open={isModalOpen}
                onOk={editingNews ? () => handleEditNews(editingNews.id) : handleAddNews}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
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
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label="Hình ảnh (URL)" name="image_url">
                        <Input placeholder="Nhập đường dẫn hình ảnh..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsManagement;
