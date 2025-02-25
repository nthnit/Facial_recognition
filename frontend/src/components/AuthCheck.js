import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import jwtDecode from "jwt-decode";

const AuthCheck = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.warning("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
            navigate("/login");
            return;
        }

        // Giải mã token để kiểm tra thời gian hết hạn
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Thời gian hiện tại (tính bằng giây)
            if (decoded.exp < currentTime) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } catch (error) {
            console.error("Lỗi khi giải mã token:", error);
            message.error("Phiên đăng nhập không hợp lệ!");
            localStorage.removeItem("token");
            navigate("/login");
        }
    }, [navigate]);

    return null;
};

export default AuthCheck;
