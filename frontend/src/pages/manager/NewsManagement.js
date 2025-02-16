import React from "react";
import { List, Input, Button } from "antd";

const NewsManagement = () => {
    return (
        <div style={{ padding: 20 }}>
            <h2>Quản lý Tin tức</h2>
            <Input.TextArea rows={4} placeholder="Nhập nội dung tin tức..." style={{ marginBottom: 10 }} />
            <Button type="primary">Đăng tin</Button>
            <List
                style={{ marginTop: 20 }}
                header={<h3>Danh sách tin tức</h3>}
                bordered
                dataSource={["Tin tức 1", "Tin tức 2"]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />
        </div>
    );
};

export default NewsManagement;
