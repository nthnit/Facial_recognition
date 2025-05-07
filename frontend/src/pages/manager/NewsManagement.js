import React, { useEffect, useState } from "react";
import { List, Input, Button, message, Modal, Form, Space, Pagination, Upload, Card, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import moment from "moment";
import usePageTitle from "../common/usePageTitle";
import { fetchAllNews, createNews, updateNews, deleteNews, uploadNewsImage } from "../../api/news";

const { Title, Text } = Typography;

const NewsManagement = () => {
    usePageTitle("News Management");
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

    useEffect(() => {
        fetchAllNewsData();
    }, []);

    const fetchAllNewsData = async () => {
        setLoading(true);
        try {
            const data = await fetchAllNews();
            setNewsList(data);
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải danh sách tin tức.");
        }
        setLoading(false);
    };

    const handleAddNews = async () => {
        try {
            const values = await form.validateFields();
    
            const requestData = {
                title: values.title,
                content: values.content,
                image_url: values.image_url || null,
                status: "active",
            };
    
            await createNews(requestData);
            message.success("Đăng tin thành công!");
            setIsModalOpen(false);
            fetchAllNewsData();
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi đăng tin.");
        }
    };

    const handleEditNews = async (id) => {
        try {
            const values = await form.validateFields();
    
            const requestData = {
                title: values.title,
                content: values.content,
                image_url: values.image_url || null,
                status: "active",
            };
    
            await updateNews(id, requestData);
            message.success("Cập nhật tin tức thành công!");
            setIsModalOpen(false);
            fetchAllNewsData();
            form.resetFields();
        } catch (error) {
            handleRequestError(error, "Lỗi khi cập nhật tin tức.");
        }
    };

    const handleDeleteNews = async (id) => {
        Modal.confirm({
            title: "Xác nhận xoá tin tức?",
            content: "Bạn có chắc chắn muốn xoá tin tức này không?",
            onOk: async () => {
                try {
                    await deleteNews(id);
                    message.success("Xóa tin tức thành công!");
                    fetchAllNewsData();
                } catch (error) {
                    handleRequestError(error, "Lỗi khi xóa tin tức.");
                }
            },
        });
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
        setSearchText(e.target.value.toLowerCase());
    };

    const handleUpload = async ({ file }) => {
        setUploading(true);
        try {
            const response = await uploadNewsImage(file);
            form.setFieldsValue({ image_url: response.image_url });
            message.success("Ảnh đã tải lên Cloudinary!");
        } catch (error) {
            handleRequestError(error, "Lỗi khi tải ảnh lên Cloudinary.");
        }
        setUploading(false);
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
        <div style={{ padding: "20px" }}>
            <Title level={2} style={{ marginBottom: "20px", textAlign: "center" }}>
                Quản lý Tin tức
            </Title>

            {/* Search and Add New News */}
            <Space style={{ marginBottom: 10, width: "100%", justifyContent: "space-between" }}>
                <Input
                    placeholder="Tìm kiếm tin tức..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    style={{ width: "100%" }}
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
                                type="dashed"
                                ghost
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDeleteNews(item.id)}
                            >
                                Xóa
                            </Button>,
                        ]}
                    >
                        <Card.Meta
                            title={<Link to={`/news/${item.id}`}>{item.title}</Link>}
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
