import React, { useState } from "react";
import { Calendar, Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";

const TeachingSchedule = () => {
    const navigate = useNavigate();
    
    // Dữ liệu mẫu (có thể thay thế bằng API)
    const classSchedule = {
        "2025-03-01": [{ id: 1, name: "Toán", time: "08:00 - 10:00", topic: "Hàm số bậc hai" }],
        "2025-03-02": [
            { id: 2, name: "Vật lý", time: "10:00 - 12:00", topic: "Định luật Newton" },
            { id: 3, name: "Hóa học", time: "13:00 - 15:00", topic: "Cân bằng hóa học" }
        ],
        "2025-03-03": [{ id: 4, name: "Sinh học", time: "08:00 - 10:00", topic: "Cấu trúc tế bào" }],
    };

    // Hàm lấy danh sách lớp cho từng ngày
    const dateCellRender = (value) => {
        const dateStr = value.format("YYYY-MM-DD");
        const classes = classSchedule[dateStr] || [];

        return (
            <ul style={{ padding: 0, listStyle: "none" }}>
                {classes.map((item) => (
                    <li key={item.id} style={{ marginBottom: 5 }}>
                        <Button 
                            type="primary" 
                            block 
                            onClick={() => navigate(`/class/${item.id}`)}
                            style={{ textAlign: "left", backgroundColor: "#1890ff", borderColor: "#1890ff", cursor: "pointer" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#40a9ff"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1890ff"}
                        >
                            {`${item.name} (${item.time})\n${item.topic}`}
                        </Button>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Lịch giảng dạy</h2>
            <Calendar dateCellRender={dateCellRender} />
        </div>
    );
};

export default TeachingSchedule;