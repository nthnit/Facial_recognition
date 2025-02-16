from fastapi import FastAPI
from routes.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def home():
    return {"message": "Welcome to the School Management API"}
