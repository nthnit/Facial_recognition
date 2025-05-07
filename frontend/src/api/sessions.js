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

// Fetch session details
export const fetchSessionInfo = async (sessionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/info`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch students for the session
export const fetchSessionStudents = async (sessionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/students`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch grades for students in this session
export const fetchSessionGrades = async (sessionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/grades/sessions/${sessionId}/grades`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch attendance data for the session
export const fetchSessionAttendance = async (sessionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}/attendance`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Submit attendance data
export const submitAttendance = async (classId, sessionDate, attendanceData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/classes/${classId}/sessions/${sessionDate}/attendance`,
            attendanceData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Submit grades for students
export const submitGrades = async (sessionId, gradesData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/grades/sessions/${sessionId}/grades`,
            gradesData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create grade records for students
export const createGrades = async (sessionId, gradeData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/grades/sessions/${sessionId}/grades`,
            gradeData,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete grade for a student
export const deleteGrade = async (sessionId, studentId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/grades/sessions/${sessionId}/grades/${studentId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}; 