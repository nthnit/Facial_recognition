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

// Fetch manager dashboard statistics
export const fetchManagerStats = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/manager/stats`, { headers });
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
