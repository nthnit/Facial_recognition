from fastapi import APIRouter, File, UploadFile, HTTPException
import cloudinary.uploader

router = APIRouter()

@router.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Upload ảnh lên Cloudinary
        upload_result = cloudinary.uploader.upload(file.file)
        
        # Lấy đường dẫn URL của ảnh trên Cloudinary
        image_url = upload_result.get("secure_url")
        
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi upload ảnh: {str(e)}")
