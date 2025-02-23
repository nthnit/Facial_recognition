import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

# Load biến môi trường từ .env
load_dotenv()

# Cấu hình Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "djlyqcbjt"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "566599374368736"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "Dp_vonlQ_41ws2R9PrXMGbyX1JM"),
)
