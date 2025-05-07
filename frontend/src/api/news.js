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

// Fetch all news
export const fetchAllNews = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/news`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch news detail by ID
export const fetchNewsDetail = async (newsId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/news/${newsId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new news
export const createNews = async (newsData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/news`, newsData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update news
export const updateNews = async (newsId, newsData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/news/${newsId}`, newsData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete news
export const deleteNews = async (newsId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/news/${newsId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upload news image
export const uploadNewsImage = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await axios.post(`${API_BASE_URL}/news/upload-image`, formData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}; 