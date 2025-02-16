import React, { useState } from "react";
import { Card, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);

    const handleUpload = ({ file }) => {
        setBanners([...banners, URL.createObjectURL(file)]);
        message.success("Banner đã được tải lên!");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý Banner</h2>
            <Upload customRequest={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Tải lên Banner mới</Button>
            </Upload>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                {banners.map((src, index) => (
                    <Card key={index} style={{ width: 300 }}>
                        <img src={src} alt="Banner" style={{ width: "100%" }} />
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BannerManagement;
