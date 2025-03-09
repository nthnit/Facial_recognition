import React, { useState, useEffect } from "react";
import { Card, Upload, Button, message, Modal, Form, Space, Popconfirm, Typography } from "antd";
import { UploadOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import axios from "axios";
import usePageTitle from "../common/usePageTitle";

const { Text } = Typography;

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  usePageTitle("Quản lý Banner");
  // Fetch banners from the backend
  useEffect(() => {
    fetchBanners();
  }, []);

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/banners", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setBanners(response.data);
    } catch (error) {
      message.error("Chưa có banner nào! Hãy đăng tải nha.");
    }
  };

  // Handle banner upload
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload image to Cloudinary
      const response = await axios.post('http://127.0.0.1:8000/uploads/upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      const imageUrl = response.data.image_url;

      // Save the image URL in the database
      await axios.post('http://127.0.0.1:8000/banners/', { image_url: imageUrl }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Fetch the banners again
      fetchBanners();
      message.success("Banner uploaded and saved successfully!");
    } catch (error) {
      message.error("Error uploading banner.");
    }
  };

  // Handle banner status change
  const handleStatusChange = async (bannerId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Deactivate" : "Active";
      await axios.put(`http://127.0.0.1:8000/banners/${bannerId}/change-status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      fetchBanners();
      message.success(`Banner status updated to ${newStatus}`);
    } catch (error) {
      message.error("Error changing banner status.");
    }
  };

  // Handle banner deletion
  const handleDelete = async (bannerId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/banners/${bannerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      fetchBanners();
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

      {/* Display message when no banners are available */}
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
                {/* Change Status Button */}
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

                {/* Delete Button */}
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
      
      {/* Modal to upload banner */}
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
