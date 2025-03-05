import React, { useEffect, useState } from "react";
import { Layout, Input, Avatar, Dropdown, Menu, Button, message, Select, Space, Typography } from "antd";
import { SearchOutlined, UserOutlined, ExpandOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;
const { Header } = Layout;

const TopNavbar = ({ collapsed }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [searchType, setSearchType] = useState("students");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]); // State lưu trữ kết quả tìm kiếm
    const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Điều khiển việc hiển thị dropdown

    // Gọi API để lấy thông tin user
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

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        message.success("Đăng xuất thành công!");
        navigate("/login"); // Chuyển về trang login
    };

    // Menu dropdown user
    const userMenu = (
        <Menu>
            <Menu.Item key="1">
                <a href="/profile">Hồ sơ cá nhân</a>
            </Menu.Item>
            <Menu.Item key="2" onClick={handleLogout} danger >
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    // Chế độ fullscreen
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                return;
            }

            let apiUrl = "";
            if (searchType === "students") {
                apiUrl = `http://127.0.0.1:8000/students/studentlist/search?query=${searchQuery}`;
            } else if (searchType === "classes") {
                apiUrl = `http://127.0.0.1:8000/classes/classlist/search?query=${searchQuery}`;
            }

            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Lưu kết quả tìm kiếm vào state
            setSearchResults(response.data);

            // Hiển thị dropdown khi có kết quả
            setIsDropdownVisible(true);
        } catch (error) {
            message.error("Lỗi khi tìm kiếm.");
            setIsDropdownVisible(false); // Ẩn dropdown nếu có lỗi
        }
    };

    // Xử lý khi người dùng gõ vào ô tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim()) {
            handleSearch(); // Gọi hàm tìm kiếm khi người dùng gõ
        } else {
            setSearchResults([]); // Nếu không có từ khóa tìm kiếm, xóa kết quả
            setIsDropdownVisible(false); // Ẩn dropdown nếu không có tìm kiếm
        }
    };

    // Xử lý khi người dùng click vào kết quả tìm kiếm
    const handleMenuItemClick = (item) => {
        if (searchType === "students") {
            // Điều hướng tới trang chi tiết học sinh
            navigate(`${user.role}/students/${item.id}`);
        } else if (searchType === "classes") {
            // Điều hướng tới trang chi tiết lớp học
            navigate(`${user.role}/classes/${item.id}`);
        }
    };

    // Hiển thị kết quả tìm kiếm trong Dropdown
    const searchMenu = (
        <Menu>
            {searchResults.length > 0 ? (
                searchResults.map((item, index) => (
                    <Menu.Item key={index} onClick={() => handleMenuItemClick(item)}>
                        <Space direction="vertical" size="small">
                            <Text strong>{item.full_name || item.name}</Text>
                            <Text type="secondary">{item.email || item.class_code}</Text>
                        </Space>
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item key="noResults" disabled>
                    <Text type="secondary">Không có kết quả</Text>
                </Menu.Item>
            )}
        </Menu>
    );

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
                        onChange={handleSearchChange} // Tìm kiếm khi thay đổi
                        onPressEnter={handleSearch} // Tìm kiếm khi nhấn Enter
                    />
                </div>

                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "white" }}>
                        <Avatar size={35} src={user?.avatar_url || <UserOutlined />} style={{border:"5px solid rgb(0, 147, 239)"}} />
                        <span style={{ fontWeight: "bold" }}>{user ? user.full_name : "Người dùng"}</span>
                    </div>
                </Dropdown>

                {/* Dropdown hiển thị kết quả tìm kiếm dưới ô input */}
                <div
                style={{position:"relative", top:"4.25vh", right:"6.5vw"}}
                >
                    <Dropdown
                    overlay={searchMenu}
                    visible={isDropdownVisible}
                    onVisibleChange={setIsDropdownVisible} // Kiểm soát việc hiển thị của dropdown
                    placement="bottomRight"  // Đảm bảo dropdown xuất hiện dưới ô tìm kiếm
                    style={{margin:"60px"}}
                >
                    
                </Dropdown>
                </div>
                
            </div>
        </Header>
    );
};

export default TopNavbar;
