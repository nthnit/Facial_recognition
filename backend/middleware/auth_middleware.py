from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from utils.security import decode_access_token

EXCLUDED_PATHS = ["/auth/login", "/register", "/docs", "/openapi.json"]

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # ✅ Nếu request là OPTIONS, bỏ qua AuthMiddleware
        if request.method == "OPTIONS":
            return await call_next(request)

        # ✅ Bỏ qua các route không yêu cầu xác thực
        if any(path.startswith(ep) for ep in EXCLUDED_PATHS):
            return await call_next(request)

        # ✅ Kiểm tra Authorization Header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse({"detail": "Thiếu token hoặc token không hợp lệ"}, status_code=401)

        # ✅ Lấy token từ header
        token = auth_header.split(" ")[1]
        payload = decode_access_token(token)

        if not payload:
            return JSONResponse({"detail": "Token không hợp lệ hoặc đã hết hạn"}, status_code=401)

        # ✅ Lưu thông tin user vào request.state để sử dụng trong route
        request.state.user = payload
        return await call_next(request)
