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

// Fetch all teachers
export const fetchTeachers = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/teachers`, { headers });
    return response.data;
};

// Create new teacher
export const createTeacher = async (teacherData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.post(`${API_BASE_URL}/teachers/create`, teacherData, { headers });
    return response.data;
};

// Fetch teacher details
export const fetchTeacherDetail = async (teacherId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch teacher's assigned classes
export const fetchTeacherClasses = async (teacherId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/classes`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch teacher's schedules
export const fetchTeacherSchedules = async (teacherId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/teachers/${teacherId}/schedules`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update teacher information
export const updateTeacher = async (teacherId, teacherData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/teachers/${teacherId}`, teacherData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete teacher
export const deleteTeacher = async (teacherId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.delete(`${API_BASE_URL}/teachers/${teacherId}`, { headers });
    return response.data;
}; 