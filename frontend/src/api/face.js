import API_BASE_URL from "./config";
// Gọi API backend phát hiện khuôn mặt
export async function detectFaceAPI(file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/face/detect`, {
        method: "POST",
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined
        },
        body: formData,
    });
    return response.json();
}
