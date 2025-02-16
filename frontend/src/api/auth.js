import axios from "axios";

const API_URL = "http://127.0.0.1:8000/auth/login";

export const login = async (username, password) => {
    try {
        const response = await axios.post(API_URL, { username, password });
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response.data);
        throw error;
    }
};
