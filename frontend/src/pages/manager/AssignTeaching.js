import React from "react";
import { Table, Select, Button } from "antd";

const { Option } = Select;

const AssignTeaching = () => {
    const data = [
        { key: "1", course: "Toán", teacher: "Chưa phân công" },
        { key: "2", course: "Lý", teacher: "Chưa phân công" },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Phân công Giảng viên</h2>
            <Table dataSource={data} columns={[
                { title: "Môn học", dataIndex: "course", key: "course" },
                { 
                    title: "Giảng viên", 
                    dataIndex: "teacher", 
                    key: "teacher",
                    render: (_, record) => (
                        <Select defaultValue={record.teacher} style={{ width: 200 }}>
                            <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
                            <Option value="Trần Thị B">Trần Thị B</Option>
                        </Select>
                    )
                },
                { title: "Hành động", key: "action", render: () => <Button type="primary">Lưu</Button> },
            ]} />
        </div>
    );
};

export default AssignTeaching;
