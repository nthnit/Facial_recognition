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

// Fetch all rooms
export const fetchRooms = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/rooms`, { headers });
    return response.data;
};

// Create new room
export const createRoom = async (roomData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.post(`${API_BASE_URL}/rooms`, roomData, { headers });
    return response.data;
};

// Update existing room
export const updateRoom = async (roomId, roomData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.put(`${API_BASE_URL}/rooms/${roomId}`, roomData, { headers });
    return response.data;
};

// Delete room
export const deleteRoom = async (roomId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.delete(`${API_BASE_URL}/rooms/${roomId}`, { headers });
    return response.data;
};

// Change room status
export const changeRoomStatus = async (roomId, status) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.put(
        `${API_BASE_URL}/rooms/${roomId}/change-status`,
        { status },
        { headers }
    );
    return response.data;
}; 