import os
import sys
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# Ensure api, parent, and local backend are on sys.path
for p in [parent_dir, current_dir, os.path.join(current_dir, "backend"), os.getcwd()]:
    if p and p not in sys.path:
        sys.path.insert(0, p)

try:
    try:
        from backend.app.main import app
    except ImportError:
        from api.backend.app.main import app
except Exception as e:
    err_tb = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    def fallback_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Vercel Python backend initialization error",
                "details": str(e),
                "traceback": err_tb,
                "current_dir": current_dir,
                "files_in_api": os.listdir(current_dir) if os.path.exists(current_dir) else []
            }
        )
