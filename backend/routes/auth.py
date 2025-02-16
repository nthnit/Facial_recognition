from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.mysql import get_db
from models.user import User
from utils.security import verify_password, create_access_token
import datetime

router = APIRouter()

@router.post("/login/")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    token = create_access_token({"user_id": user.id, "role": user.role}, expires_delta=datetime.timedelta(hours=1))
    return {"token": token, "role": user.role}
