import axios from "axios";
import API_BASE_URL from "./config";

// Get auth headers with token
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }
    return { Authorization: `Bearer ${token}` };
};

// Fetch user information
export const fetchUserInfo = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/users/user/info`, { headers });
    return response.data;
};

// Fetch news
export const fetchNews = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/news/`, { headers });
    return response.data;
};

// Fetch active banners
export const fetchActiveBanners = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/banners?status=active`, { headers });
    return response.data;
}; 