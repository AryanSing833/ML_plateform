import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from src.api.routes import upload, chat

app = FastAPI(title="MLOps AI RAG Platform", version="1.0.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(upload.router)
app.include_router(chat.router)

# Mount Next.js static files if they exist
STATIC_DIR = os.path.join(os.getcwd(), "frontend", "out")
if os.path.exists(STATIC_DIR):
    app.mount("/_next", StaticFiles(directory=os.path.join(STATIC_DIR, "_next")), name="next")
    
    # Mount specific assets if needed
    for folder in ["images", "assets", "fonts"]:
        if os.path.exists(os.path.join(STATIC_DIR, folder)):
            app.mount(f"/{folder}", StaticFiles(directory=os.path.join(STATIC_DIR, folder)), name=folder)

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(path):
            return FileResponse(path)
        elif os.path.isfile(path + ".html"):
            return FileResponse(path + ".html")
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
