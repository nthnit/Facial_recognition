import base64
import cv2
import numpy as np
import requests
import json
from facenet_pytorch import MTCNN
from deepface import DeepFace

# Khởi tạo MTCNN, bạn có thể cấu hình device là "cuda" nếu có GPU
mtcnn_detector = MTCNN(keep_all=False, device="cpu")

def load_image_from_url(image_url: str):
    response = requests.get(image_url, stream=True)
    if response.status_code != 200:
        raise Exception("Không thể tải ảnh từ URL")
    img_data = response.content
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def load_image_from_base64(image_base64: str):
    img_data = base64.b64decode(image_base64)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def detect_and_crop_face(img):
    # Sử dụng MTCNN để phát hiện khuôn mặt
    boxes, probs = mtcnn_detector.detect(img)
    if boxes is None or len(boxes) == 0:
        raise Exception("Không phát hiện được khuôn mặt trong ảnh")
    # Lấy hộp giới hạn của khuôn mặt với xác suất cao nhất
    face_box = boxes[0]
    x1, y1, x2, y2 = face_box.astype(int)
    face_img = img[y1:y2, x1:x2]
    return face_img

def extract_face_embedding(face_img):
    # Resize ảnh khuôn mặt về kích thước chuẩn (ví dụ: 160x160 đối với Facenet)
    face_img_resized = cv2.resize(face_img, (160, 160))
    # Trích xuất vector embedding sử dụng DeepFace với model Facenet
    result = DeepFace.represent(face_img_resized, model_name="Facenet")
    if not result or len(result) == 0:
        raise Exception("Không thể trích xuất embedding từ khuôn mặt")
    embedding = result[0]["embedding"]
    return embedding

def normalize_embedding(embedding):
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding
    return embedding / norm

def cosine_similarity(a, b):
    a_norm = a / np.linalg.norm(a)
    b_norm = b / np.linalg.norm(b)
    return np.dot(a_norm, b_norm)