from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os

app = FastAPI()

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "message": "Augentik API is running",
        "version": "1.0.0"
    })

@app.get("/api/auth-status")
async def auth_status():
    return JSONResponse({
        "auth_configured": False,
        "access_token": "demo-token",
        "auth_mode": "disabled",
        "message": "Demo mode - no authentication required",
        "webui_title": "Augentik Dashboard",
        "webui_description": "Audit Intelligence Platform"
    })

# Vercel serverless function handler
def handler(request):
    return app(request)
