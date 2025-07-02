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
        <div style={{ padding: "30px 10vw", background: "#f4f8fb", minHeight: "100vh" }}>
            <Title level={2} style={{ marginBottom: "30px", textAlign: "center", color: "#1890ff", letterSpacing: 1 }}>
                Quản lý Tin tức
            </Title>

            {/* Search and Add New News */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <Input
                    placeholder="Tìm kiếm tin tức..."
                    prefix={<SearchOutlined />}
                    onChange={handleSearch}
                    allowClear
                    style={{ width: 350, borderRadius: 8, boxShadow: "0 2px 8px #e6e6e6" }}
                />
                <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }} onClick={() => setIsModalOpen(true)}>
                    Đăng tin
                </Button>
            </div>

            {/* News List */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 24,
                marginTop: 10,
            }}>
                {paginatedNews.length > 0 ? paginatedNews.map((item) => (
                    <Card
                        key={item.id}
                        hoverable
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                            minHeight: 320,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                        actions={[
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingNews(item);
                                    form.setFieldsValue(item);
                                    setIsModalOpen(true);
                                }}
                                style={{ color: "#1890ff" }}
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
                            title={<Link to={`/news/${item.id}`} style={{ color: "#1890ff", fontWeight: 600 }}>{item.title}</Link>}
                            description={
                                <>
                                    <div style={{ minHeight: 60, marginBottom: 8, color: "#444" }}>{item.content}</div>
                                    {item.image_url && (
                                        <img
                                            src={item.image_url}
                                            alt="News"
                                            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, margin: "10px 0" }}
                                        />
                                    )}
                                    <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
                                        Ngày đăng: {moment(item.created_at).format("DD/MM/YYYY")}
                                    </div>
                                </>
                            }
                        />
                    </Card>
                )) : (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#aaa", fontSize: 18 }}>
                        Không có tin tức nào để hiển thị.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredNews.length}
                    onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                    showSizeChanger
                    pageSizeOptions={["5", "10", "15", "20"]}
                    style={{ borderRadius: 8 }}
                />
            </div>

            {/* Modal for Adding and Editing News */}
            <Modal
                title={editingNews ? "Chỉnh sửa Tin tức" : "Đăng Tin tức"}
                open={isModalOpen}
                onOk={editingNews ? () => handleEditNews(editingNews.id) : handleAddNews}
                onCancel={() => setIsModalOpen(false)}
                width={600}
                style={{ top: 60 }}
                bodyStyle={{ padding: 24 }}
            >
                <Form form={form} layout="vertical" initialValues={editingNews}>
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                    >
                        <Input style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
                    >
                        <Input.TextArea rows={4} style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item label="Tải ảnh lên">
                        <Upload customRequest={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />} loading={uploading} style={{ borderRadius: 8 }}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Ảnh đã tải lên" name="image_url">
                        <Input placeholder="Đường dẫn ảnh" readOnly style={{ borderRadius: 8 }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NewsManagement;
