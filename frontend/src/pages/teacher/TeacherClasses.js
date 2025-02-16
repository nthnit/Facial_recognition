import React from "react";
import { Table } from "antd";
import { Link } from "react-router-dom";

const columns = [
    {
        title: "Lớp học",
        dataIndex: "class",
        key: "class",
        render: (text, record) => <Link to={`/class/${record.key}`}>{text}</Link>, // Điều hướng đến trang chi tiết
    },
    { title: "Giảng viên", dataIndex: "teacher", key: "teacher" },
    { title: "Số học sinh", dataIndex: "students", key: "students" },
];

const data = [
    { key: "1", class: "Toán", teacher: "Nguyễn Văn A", students: 30 },
    { key: "2", class: "Vật lý", teacher: "Trần Thị B", students: 28 },
];

const ClassList = () => {
    return (
        <div style={{ padding: 20 }}>
            <h2>Danh sách Lớp học</h2>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default ClassList;
