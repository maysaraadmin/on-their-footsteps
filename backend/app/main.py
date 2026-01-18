from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .database import init_db, get_db
from .api import characters, progress, stats, auth, content, users, media, analytics, recommendations
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up...")
    # Initialize database and create tables
    init_db()
    print(f"Database initialized at: {settings.DATABASE_URL}")
    
    # Ensure upload directory exists
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="على خطاهم API",
    description="API لتطبيق قصص الشخصيات الإسلامية",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Health check endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy", 
        "service": "على خطاهم API",
        "version": "2.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(characters.router, prefix="/api/characters", tags=["Characters"])
app.include_router(progress.router, prefix="/api/progress", tags=["User Progress"])
app.include_router(stats.router, prefix="/api/stats", tags=["Statistics"])
app.include_router(content.router, prefix="/api/content", tags=["Content Management"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(media.router, prefix="/api/media", tags=["Media Management"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

@app.get("/")
async def root():
    return {
        "message": "مرحباً بك في تطبيق 'على خُطاهم'",
        "version": "2.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }