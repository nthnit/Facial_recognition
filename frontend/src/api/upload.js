import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(`${API_BASE_URL}/upload-image/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.image_url;
    } catch (error) {
        console.error("Lỗi khi tải ảnh lên Cloudinary", error);
        return null;
    }
};
