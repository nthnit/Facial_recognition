import axios from "axios";
import API_BASE_URL from "./config";

// Lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Unauthorized");
  return { Authorization: `Bearer ${token}` };
};

// Gửi ảnh nhận diện khuôn mặt (có xác thực)
export const sendFaceAttendance = async ({ image, classId, sessionDate }) => {
  const response = await axios.post(
    `${API_BASE_URL}/attendance/face-attendance`,
    {
      image,
      class_id: parseInt(classId, 10),
      session_date: sessionDate,
    },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Gửi ảnh nhận diện khuôn mặt (public, không xác thực)
export const sendFaceAttendancePublic = async ({ image, classId, sessionDate }) => {
  const response = await axios.post(
    `${API_BASE_URL}/attendance/face-attendance/public`,
    {
      image,
      class_id: parseInt(classId, 10),
      session_date: sessionDate,
    }
  );
  return response.data;
};

// Lấy danh sách học sinh của lớp
export const fetchClassStudents = async (classId) => {
  const response = await axios.get(
    `${API_BASE_URL}/classes/${classId}/students`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Lấy trạng thái điểm danh của buổi học
export const fetchSessionAttendance = async (classId, sessionDate) => {
  const response = await axios.get(
    `${API_BASE_URL}/classes/${classId}/sessions/${sessionDate}/attendance`,
    { headers: getAuthHeaders() }
  );
  return response.data;
}; 