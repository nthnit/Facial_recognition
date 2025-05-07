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

// Fetch all students
export const fetchStudents = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/students`, { headers });
    return response.data;
};

// Create new student
export const createStudent = async (studentData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.post(`${API_BASE_URL}/students`, studentData, { headers });
    return response.data;
};

// Fetch student details
export const fetchStudentDetail = async (studentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch student's classes
export const fetchStudentClasses = async (studentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students/${studentId}/classes`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch student's sessions
export const fetchStudentSessions = async (studentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students/${studentId}/sessions`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update student information
export const updateStudent = async (studentId, studentData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/students/${studentId}`, studentData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete student
export const deleteStudent = async (studentId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/students/${studentId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upload student image
export const uploadStudentImage = async (imageFile) => {
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