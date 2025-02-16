import React from "react";
import { Table } from "antd";

const columns = [
    { title: "Lớp học", dataIndex: "class", key: "class" },
    { title: "Giáo viên", dataIndex: "teacher", key: "teacher" },
    { title: "Thời gian", dataIndex: "time", key: "time" },
];

const data = [
    { key: "1", class: "Toán", teacher: "Nguyễn Văn A", time: "9:00 - 10:30" },
    { key: "2", class: "Vật lý", teacher: "Trần Thị B", time: "11:00 - 12:30" },
];

const ClassList = () => {
    return (
        <div style={{ padding: 20 }}>
            <h2>Danh sách lớp học</h2>
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default ClassList;
