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

// Fetch all classes
export const fetchClasses = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/classes`, { headers });
    return response.data;
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

// Assign teacher to a class
export const assignTeacherToClass = async (classId, teacherId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.put(
        `${API_BASE_URL}/classes/${classId}/assign`,
        { teacher_id: teacherId },
        { headers }
    );
    return response.data;
};

// Fetch all active rooms
export const fetchRooms = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.get(`${API_BASE_URL}/rooms?status=active`, { headers });
    return response.data;
};

// Create a new class
export const createClass = async (classData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.post(`${API_BASE_URL}/classes`, classData, { headers });
    return response.data;
};

// Update an existing class
export const updateClass = async (classId, classData) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.put(`${API_BASE_URL}/classes/${classId}`, classData, { headers });
    return response.data;
};

// Delete a class
export const deleteClass = async (classId) => {
    const headers = getAuthHeaders();
    if (!headers) {
        throw new Error("Unauthorized");
    }
    const response = await axios.delete(`${API_BASE_URL}/classes/${classId}`, { headers });
    return response.data;
};

// Fetch class details
export const fetchClassDetail = async (classId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/classes/${classId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch class sessions
export const fetchClassSessions = async (classId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/classes/${classId}/sessions`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch class students
export const fetchClassStudents = async (classId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/classes/${classId}/students`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch all students
export const fetchAllStudents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/students`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch latest schedule
export const fetchLatestSchedule = async (classId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/schedules/${classId}/latest`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch session attendance
export const fetchSessionAttendance = async (classId, sessionDate) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/classes/${classId}/sessions/${sessionDate}/attendance`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Submit attendance
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

// Enroll student
export const enrollStudent = async (classId, studentId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/classes/${classId}/enroll/${studentId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unenroll student
export const unenrollStudent = async (classId, studentId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/classes/${classId}/unenroll/${studentId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch class attendance
export const fetchClassAttendance = async (classId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/classes/${classId}/attendance`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch session grades
export const fetchSessionGrades = async (sessionId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/grades/sessions/${sessionId}/grades`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Submit grades
export const submitGrades = async (sessionId, grades) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/grades/sessions/${sessionId}/grades`,
            grades,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
