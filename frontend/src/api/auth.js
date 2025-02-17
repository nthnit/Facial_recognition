import axios from "axios";

const API_URL = "http://127.0.0.1:8000/auth/login";

export const login = async (email, password) => {
    console.log("Đang gửi:", { email, password });  // Log dữ liệu gửi lên backend
    try {
        const response = await axios.post(API_URL, { email, password });

        console.log("Phản hồi từ backend:", response.data);  // Log phản hồi từ backend

        return response.data;
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.response?.data || error.message);
        throw error;
    }
};
