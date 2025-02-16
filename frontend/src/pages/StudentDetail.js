import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "antd";

const StudentDetail = () => {
    const { id } = useParams(); // Lấy ID sinh viên từ URL
    const [studentInfo, setStudentInfo] = useState(null);

    // Dữ liệu mẫu (có thể thay bằng API)
    useEffect(() => {
        const studentData = {
            101: { name: "Nguyễn Văn C", email: "nguyenvanc@example.com", class: "Toán", attendance: "85%" },
            102: { name: "Trần Thị D", email: "tranthid@example.com", class: "Toán", attendance: "90%" },
            201: { name: "Phạm Văn E", email: "phamvane@example.com", class: "Vật lý", attendance: "80%" },
            202: { name: "Lê Thị F", email: "lethif@example.com", class: "Vật lý", attendance: "88%" },
        };
        setStudentInfo(studentData[id]);
    }, [id]);

    return (
        <div style={{ padding: 20 }}>
            {studentInfo ? (
                <Card title={`Thông tin sinh viên: ${studentInfo.name}`}>
                    <p><strong>Email:</strong> {studentInfo.email}</p>
                    <p><strong>Lớp học:</strong> {studentInfo.class}</p>
                    <p><strong>Tỷ lệ điểm danh:</strong> {studentInfo.attendance}</p>
                </Card>
            ) : (
                <p>Đang tải thông tin sinh viên...</p>
            )}
        </div>
    );
};

export default StudentDetail;
