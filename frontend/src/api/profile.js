import axios from "axios";
import API_BASE_URL from "./config";

// Get auth headers with token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Unauthorized");
    }
    return { Authorization: `Bearer ${token}` };
};

// Fetch user info
export const fetchUserInfo = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/user/info`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update user info
export const updateUserInfo = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upload user avatar
export const uploadUserAvatar = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const response = await axios.post(`${API_BASE_URL}/uploads/upload-image/`, formData, {
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Change user password
export const changeUserPassword = async (userId, passwordData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/users/${userId}/change-password`,
            passwordData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
