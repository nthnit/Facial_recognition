from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from deepface import DeepFace

router = APIRouter()

@router.post("/detect")
async def detect_face(file: UploadFile = File(...)):
    try:
        # Đọc file ảnh từ UploadFile
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # Sử dụng DeepFace để phát hiện khuôn mặt
        detections = DeepFace.extract_faces(img_path = img, detector_backend = 'opencv', enforce_detection = False)
        if detections and len(detections) > 0:
            return {"success": True, "msg": "Phát hiện khuôn mặt"}
        else:
            return {"success": False, "msg": "Không phát hiện khuôn mặt"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "msg": str(e)})
