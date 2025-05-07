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

// Fetch all users
export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: getAuthHeaders(),
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new user
export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/create`, userData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create multiple users from Excel file
export const createUsersFromExcel = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/bulk-create`, formData, {
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

// Update user
export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete user
export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Reset user password
export const resetUserPassword = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/users/${userId}/reset-password`, {}, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}; 