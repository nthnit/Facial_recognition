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

// Fetch teacher's classes
export const fetchTeacherClasses = async (teacherId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/classes`, { headers });
    return response.data;
};

// Fetch teacher's schedule
export const fetchTeacherSchedule = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/classes/teacher/schedule`, { headers });
    return response.data;
}; 