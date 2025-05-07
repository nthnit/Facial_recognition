import React, { useState, useEffect } from "react";
import { Card, Upload, Button, message, Modal, Form, Space, Popconfirm, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import usePageTitle from "../common/usePageTitle";
import {
    fetchBanners,
    uploadBannerImage,
    createBanner,
    changeBannerStatus,
    deleteBanner
} from "../../api/banners";

const { Text } = Typography;

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    usePageTitle("Quản lý Banner");

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            const data = await fetchBanners();
            setBanners(data);
        } catch (error) {
            message.error("Chưa có banner nào! Hãy đăng tải nha.");
        }
    };

    const handleUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { image_url } = await uploadBannerImage(formData);
            await createBanner(image_url);
            await loadBanners();
            message.success("Banner uploaded and saved successfully!");
        } catch (error) {
            message.error("Error uploading banner.");
        }
    };

    const handleStatusChange = async (bannerId, currentStatus) => {
        try {
            const newStatus = currentStatus === "Active" ? "Deactivate" : "Active";
            await changeBannerStatus(bannerId, newStatus);
            await loadBanners();
            message.success(`Banner status updated to ${newStatus}`);
        } catch (error) {
            message.error("Error changing banner status.");
        }
    };

    const handleDelete = async (bannerId) => {
        try {
            await deleteBanner(bannerId);
            await loadBanners();
            message.success("Banner deleted successfully!");
        } catch (error) {
            message.error("Error deleting banner.");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Banner Management</h2>
            
            <Upload customRequest={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload New Banner</Button>
            </Upload>

            {banners.length === 0 ? (
                <div style={{ marginTop: 20 }}>
                    <Text>No banners available. Please upload a banner.</Text>
                </div>
            ) : (
                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                    {banners.map((banner) => (
                        <Card key={banner.id} style={{ width: 300 }}>
                            <img src={banner.image_url} alt="Banner" style={{ width: "100%" }} />
                            <Space style={{ marginTop: 10 }}>
                                <Button 
                                    icon={<PoweroffOutlined />}
                                    onClick={() => handleStatusChange(banner.id, banner.status)}
                                    style={{
                                        backgroundColor: banner.status === "Active" ? "green" : "gray",
                                        color: "white",
                                    }}
                                >
                                    {banner.status === "Active" ? "Deactivate" : "Activate"}
                                </Button>

                                <Popconfirm
                                    title="Are you sure you want to delete this banner?"
                                    onConfirm={() => handleDelete(banner.id)}
                                    okText="Delete"
                                    cancelText="Cancel"
                                >
                                    <Button icon={<DeleteOutlined />} danger />
                                </Popconfirm>
                            </Space>
                        </Card>
                    ))}
                </div>
            )}
            
            <Modal
                title="Upload Banner"
                visible={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Banner Image" name="image_url" rules={[{ required: true, message: "Please upload the banner image!" }]}>
                        <Upload.Dragger name="file" customRequest={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Click or Drag to upload</Button>
                        </Upload.Dragger>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BannerManagement;
