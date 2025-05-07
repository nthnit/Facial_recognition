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

// Fetch all banners
export const fetchBanners = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/banners`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upload banner image
export const uploadBannerImage = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/uploads/upload-image/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthHeaders(),
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new banner
export const createBanner = async (imageUrl) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/banners/`, { image_url: imageUrl }, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Change banner status
export const changeBannerStatus = async (bannerId, newStatus) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/banners/${bannerId}/change-status`,
            { status: newStatus },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete banner
export const deleteBanner = async (bannerId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/banners/${bannerId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}; 