from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import time
import uuid

from .database import init_db, get_db
from .api import characters, progress, stats, auth, content, users, media, analytics, recommendations
from .config import settings
from .logging_config import get_logger, log_api_request, log_api_response, log_security_event

# Import monitoring modules with error handling
try:
    from .monitoring import metrics_middleware, get_metrics, get_prometheus_metrics
    MONITORING_AVAILABLE = True
except ImportError as e:
    logger = get_logger(__name__)
    logger.warning(f"Monitoring modules not available: {e}")
    MONITORING_AVAILABLE = False

try:
    from .cache import cache
    CACHE_AVAILABLE = True
except ImportError as e:
    logger = get_logger(__name__)
    logger.warning(f"Cache module not available: {e}")
    CACHE_AVAILABLE = False

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Application starting up...")
    logger.info(f"Database initialized: {settings.DATABASE_URL}")
    
    try:
        # Initialize database and create tables
        init_db()
        logger.info("Database initialization successful")
        
        # Test database connection
        db = next(get_db())
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection test successful")
        
        # Test Redis connection
        if CACHE_AVAILABLE and cache.is_available():
            cache.redis_client.ping()
            logger.info("Redis connection test successful")
        else:
            logger.warning("Redis not available - caching disabled")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    # Ensure upload directory exists
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    logger.info(f"Upload directory: {upload_dir}")
    
    logger.info("Application startup complete")
    yield
    
    # Shutdown
    logger.info("Application shutting down...")

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
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    
    # Log request
    log_api_request(
        logger,
        request.method,
        str(request.url),
        ip_address=client_ip
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    process_time = time.time() - start_time
    
    # Log response
    log_api_response(
        logger,
        request.method,
        str(request.url),
        response.status_code,
        duration=process_time
    )
    
    # Add headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Health check endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy", 
        "service": "على خطاهم API",
        "version": "2.0.0",
        "timestamp": time.time()
    }

# Metrics endpoints
if MONITORING_AVAILABLE:
    @app.get("/api/metrics", tags=["Monitoring"])
    async def metrics_endpoint():
        """Get application metrics"""
        return await get_metrics()

    @app.get("/api/metrics/prometheus", tags=["Monitoring"])
    async def prometheus_metrics():
        """Get metrics in Prometheus format"""
        return get_prometheus_metrics()
else:
    @app.get("/api/metrics", tags=["Monitoring"])
    async def metrics_endpoint():
        """Get application metrics - monitoring disabled"""
        return {"message": "Monitoring not available"}

    @app.get("/api/metrics/prometheus", tags=["Monitoring"])
    async def prometheus_metrics():
        """Get metrics in Prometheus format - monitoring disabled"""
        return {"message": "Monitoring not available"}

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