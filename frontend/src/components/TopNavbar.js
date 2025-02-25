import React, { useEffect, useState } from "react";
import { Layout, Input, Avatar, Dropdown, Menu, Button, message, Select } from "antd";
import { SearchOutlined, UserOutlined, ExpandOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const TopNavbar = ({ collapsed }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [searchType, setSearchType] = useState("students"); // Thêm biến state để lưu loại tìm kiếm (học sinh hoặc lớp học)
    const [searchQuery, setSearchQuery] = useState("");

    // 🔹 Gọi API để lấy thông tin user
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    message.error("Bạn chưa đăng nhập!");
                    navigate("/login");
                    return;
                }

                const response = await axios.get("http://127.0.0.1:8000/users/user/info", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(response.data);
            } catch (error) {
                message.error("Lỗi khi lấy thông tin người dùng.");
            }
        };

        fetchUserInfo();
    }, [navigate]);

    // 🔹 Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        message.success("Đăng xuất thành công!");
        navigate("/login"); // Chuyển về trang login
    };

    // 🔹 Menu dropdown user
    const userMenu = (
        <Menu>
            <Menu.Item key="1">
                <a href="/profile">Hồ sơ cá nhân</a>
            </Menu.Item>
            <Menu.Item key="2" onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    // 🔹 Chế độ fullscreen
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // 🔹 Hàm xử lý tìm kiếm
    const handleSearch = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                return;
            }

            let apiUrl = "";
            if (searchType === "students") {
                apiUrl = `http://127.0.0.1:8000/students/search?query=${searchQuery}`;
            } else if (searchType === "classes") {
                apiUrl = `http://127.0.0.1:8000/classes/search?query=${searchQuery}`;
            }

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Hiển thị kết quả tìm kiếm hoặc thực hiện điều hướng tới trang kết quả
            console.log("Kết quả tìm kiếm:", response.data);
            message.success(`Tìm thấy ${response.data.length} kết quả`);

        } catch (error) {
            message.error("Lỗi khi tìm kiếm.");
        }
    };

    return (
        <Header
            style={{
                background: "#00aeef",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                height: "64px",
                position: "fixed",
                top: 0,
                left: collapsed ? "80px" : "200px", // Khớp với sidebar
                right: 0,
                zIndex: 1000,
            }}
        >
            {/* 🔹 Phần bên trái: Fullscreen + Tên hệ thống */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <Button
                    type="text"
                    icon={<ExpandOutlined style={{ fontSize: "18px", color: "white" }} />}
                    onClick={toggleFullScreen}
                />
                <h2 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                    WeLearn Hub
                </h2>
            </div>

            {/* 🔹 Phần bên phải: Tìm kiếm + Dropdown User */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Dropdown chọn tìm kiếm học sinh hoặc lớp học */}
                    <Select
                        defaultValue="students"
                        style={{ width: "120px" }}
                        onChange={setSearchType}
                    >
                        <Select.Option value="students">Học sinh</Select.Option>
                        <Select.Option value="classes">Lớp học</Select.Option>
                    </Select>
                    {/* Input tìm kiếm */}
                    <Input
                        placeholder="Tìm kiếm học sinh, mã lớp..."
                        prefix={<SearchOutlined />}
                        style={{ width: "280px", borderRadius: "20px" }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onPressEnter={handleSearch} // Tìm kiếm khi nhấn Enter
                    />
                </div>

                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "white" }}>
                        <Avatar icon={<UserOutlined />} />
                        <span style={{ fontWeight: "bold" }}>{user ? user.full_name : "Người dùng"}</span>
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default TopNavbar;
