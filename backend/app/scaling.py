"""
Horizontal scaling utilities and configurations for the Islamic Characters application
Provides comprehensive scaling strategies for high-availability deployments
"""

import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import redis
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
from fastapi import FastAPI, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
import aioredis
import aiofiles
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ScalingMode(Enum):
    """Scaling modes for different deployment scenarios"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    HIGH_TRAFFIC = "high_traffic"

@dataclass
class ScalingConfig:
    """Configuration for horizontal scaling"""
    mode: ScalingMode
    max_workers: int
    connection_pool_size: int
    redis_connections: int
    cache_ttl: int
    enable_load_balancing: bool
    enable_circuit_breaker: bool
    enable_rate_limiting: bool
    enable_session_affinity: bool
    health_check_interval: int
    graceful_shutdown_timeout: int

class LoadBalancer:
    """Load balancer for distributing requests across multiple instances"""
    
    def __init__(self, config: ScalingConfig):
        self.config = config
        self.instances: List[Dict[str, Any]] = []
        self.current_index = 0
        self.health_status: Dict[str, bool] = {}
        
    async def register_instance(self, instance_id: str, host: str, port: int, weight: int = 1):
        """Register a new instance"""
        instance = {
            "id": instance_id,
            "host": host,
            "port": port,
            "weight": weight,
            "url": f"http://{host}:{port}",
            "registered_at": datetime.utcnow(),
            "last_health_check": None,
            "healthy": True
        }
        
        self.instances.append(instance)
        self.health_status[instance_id] = True
        
        logger.info(f"Registered instance {instance_id} at {host}:{port}")
        
    async def deregister_instance(self, instance_id: str):
        """Deregister an instance"""
        self.instances = [inst for inst in self.instances if inst["id"] != instance_id]
        self.health_status.pop(instance_id, None)
        
        logger.info(f"Deregistered instance {instance_id}")
        
    async def get_healthy_instances(self) -> List[Dict[str, Any]]:
        """Get list of healthy instances"""
        return [inst for inst in self.instances if self.health_status.get(inst["id"], False)]
        
    async def select_instance(self, algorithm: str = "round_robin") -> Optional[Dict[str, Any]]:
        """Select an instance based on the specified algorithm"""
        healthy_instances = await self.get_healthy_instances()
        
        if not healthy_instances:
            return None
            
        if algorithm == "round_robin":
            instance = healthy_instances[self.current_index % len(healthy_instances)]
            self.current_index += 1
            return instance
            
        elif algorithm == "weighted":
            total_weight = sum(inst["weight"] for inst in healthy_instances)
            import random
            rand = random.uniform(0, total_weight)
            
            current_weight = 0
            for instance in healthy_instances:
                current_weight += instance["weight"]
                if rand <= current_weight:
                    return instance
                    
        elif algorithm == "least_connections":
            # This would require tracking active connections per instance
            return min(healthy_instances, key=lambda x: x.get("active_connections", 0))
            
        return healthy_instances[0]
        
    async def health_check(self):
        """Perform health checks on all instances"""
        import aiohttp
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
            for instance in self.instances:
                try:
                    async with session.get(f"{instance['url']}/health") as response:
                        self.health_status[instance["id"]] = response.status == 200
                        instance["last_health_check"] = datetime.utcnow()
                        
                except Exception as e:
                    logger.warning(f"Health check failed for instance {instance['id']}: {e}")
                    self.health_status[instance["id"]] = False

class CircuitBreaker:
    """Circuit breaker pattern for fault tolerance"""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60, expected_exception: Exception = Exception):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        
    async def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if datetime.utcnow().timestamp() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")
                
        try:
            result = await func(*args, **kwargs)
            
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
                
            return result
            
        except self.expected_exception as e:
            self.failure_count += 1
            self.last_failure_time = datetime.utcnow().timestamp()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                
            raise e

class RateLimiter:
    """Rate limiter for API endpoints"""
    
    def __init__(self, redis_client: aioredis.Redis, window_size: int = 60, max_requests: int = 100):
        self.redis = redis_client
        self.window_size = window_size
        self.max_requests = max_requests
        
    async def is_allowed(self, key: str) -> bool:
        """Check if request is allowed based on rate limit"""
        current_time = datetime.utcnow().timestamp()
        window_start = current_time - self.window_size
        
        # Remove old entries
        await self.redis.zremrangebyscore(key, 0, window_start)
        
        # Count current requests
        current_requests = await self.redis.zcard(key)
        
        if current_requests >= self.max_requests:
            return False
            
        # Add current request
        await self.redis.zadd(key, {str(current_time): current_time})
        await self.redis.expire(key, self.window_size)
        
        return True

class SessionManager:
    """Session manager for distributed environments"""
    
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        
    async def create_session(self, session_id: str, data: Dict[str, Any], ttl: int = 3600):
        """Create a new session"""
        await self.redis.setex(f"session:{session_id}", ttl, json.dumps(data))
        
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        data = await self.redis.get(f"session:{session_id}")
        return json.loads(data) if data else None
        
    async def update_session(self, session_id: str, data: Dict[str, Any], ttl: int = 3600):
        """Update session data"""
        await self.redis.setex(f"session:{session_id}", ttl, json.dumps(data))
        
    async def delete_session(self, session_id: str):
        """Delete session"""
        await self.redis.delete(f"session:{session_id}")

class CacheManager:
    """Distributed cache manager"""
    
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        
    async def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        data = await self.redis.get(key)
        return json.loads(data) if data else None
        
    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set cached value"""
        await self.redis.setex(key, ttl, json.dumps(value))
        
    async def delete(self, key: str):
        """Delete cached value"""
        await self.redis.delete(key)
        
    async def clear_pattern(self, pattern: str):
        """Clear cache keys matching pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

class DatabasePool:
    """Database connection pool for scaling"""
    
    def __init__(self, database_url: str, config: ScalingConfig):
        self.config = config
        self.engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=config.connection_pool_size,
            max_overflow=config.connection_pool_size * 2,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False
        )
        
    async def health_check(self) -> bool:
        """Check database health"""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False

class ScalingMiddleware:
    """Middleware for scaling features"""
    
    def __init__(self, app: FastAPI, config: ScalingConfig):
        self.app = app
        self.config = config
        self.redis_client: Optional[aioredis.Redis] = None
        self.rate_limiter: Optional[RateLimiter] = None
        self.session_manager: Optional[SessionManager] = None
        self.cache_manager: Optional[CacheManager] = None
        self.circuit_breaker: Optional[CircuitBreaker] = None
        
    async def initialize(self):
        """Initialize scaling components"""
        # Initialize Redis
        self.redis_client = aioredis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            max_connections=self.config.redis_connections
        )
        
        # Initialize components
        self.rate_limiter = RateLimiter(self.redis_client)
        self.session_manager = SessionManager(self.redis_client)
        self.cache_manager = CacheManager(self.redis_client)
        self.circuit_breaker = CircuitBreaker()
        
        # Add middleware
        self.app.add_middleware(GZipMiddleware, minimum_size=1000)
        
        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"]
        )
        
        logger.info("Scaling middleware initialized")
        
    async def cleanup(self):
        """Cleanup resources"""
        if self.redis_client:
            await self.redis_client.close()
            
    async def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

def create_scaling_config(mode: ScalingMode) -> ScalingConfig:
    """Create scaling configuration based on mode"""
    configs = {
        ScalingMode.DEVELOPMENT: ScalingConfig(
            mode=ScalingMode.DEVELOPMENT,
            max_workers=1,
            connection_pool_size=5,
            redis_connections=5,
            cache_ttl=300,
            enable_load_balancing=False,
            enable_circuit_breaker=False,
            enable_rate_limiting=False,
            enable_session_affinity=False,
            health_check_interval=30,
            graceful_shutdown_timeout=10
        ),
        ScalingMode.STAGING: ScalingConfig(
            mode=ScalingMode.STAGING,
            max_workers=2,
            connection_pool_size=10,
            redis_connections=10,
            cache_ttl=600,
            enable_load_balancing=True,
            enable_circuit_breaker=True,
            enable_rate_limiting=True,
            enable_session_affinity=True,
            health_check_interval=20,
            graceful_shutdown_timeout=15
        ),
        ScalingMode.PRODUCTION: ScalingConfig(
            mode=ScalingMode.PRODUCTION,
            max_workers=4,
            connection_pool_size=20,
            redis_connections=20,
            cache_ttl=1800,
            enable_load_balancing=True,
            enable_circuit_breaker=True,
            enable_rate_limiting=True,
            enable_session_affinity=True,
            health_check_interval=10,
            graceful_shutdown_timeout=30
        ),
        ScalingMode.HIGH_TRAFFIC: ScalingConfig(
            mode=ScalingMode.HIGH_TRAFFIC,
            max_workers=8,
            connection_pool_size=50,
            redis_connections=50,
            cache_ttl=3600,
            enable_load_balancing=True,
            enable_circuit_breaker=True,
            enable_rate_limiting=True,
            enable_session_affinity=True,
            health_check_interval=5,
            graceful_shutdown_timeout=60
        )
    }
    
    return configs.get(mode, configs[ScalingMode.PRODUCTION])

# Scaling utilities
async def setup_scaling(app: FastAPI, mode: ScalingMode = ScalingMode.PRODUCTION):
    """Setup scaling for the application"""
    config = create_scaling_config(mode)
    middleware = ScalingMiddleware(app, config)
    await middleware.initialize()
    
    # Store middleware in app state for access in routes
    app.state.scaling_middleware = middleware
    app.state.scaling_config = config
    
    return middleware

# Health check endpoint
async def health_check(request: Request) -> Dict[str, Any]:
    """Comprehensive health check"""
    middleware = request.app.state.scaling_middleware
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "checks": {}
    }
    
    # Database health check
    try:
        db_pool = DatabasePool(os.getenv("DATABASE_URL"), request.app.state.scaling_config)
        health_status["checks"]["database"] = await db_pool.health_check()
    except Exception as e:
        health_status["checks"]["database"] = False
        health_status["status"] = "unhealthy"
        
    # Redis health check
    try:
        if middleware.redis_client:
            await middleware.redis_client.ping()
            health_status["checks"]["redis"] = True
        else:
            health_status["checks"]["redis"] = False
            health_status["status"] = "unhealthy"
    except Exception as e:
        health_status["checks"]["redis"] = False
        health_status["status"] = "unhealthy"
        
    # Memory usage check
    try:
        import psutil
        memory = psutil.virtual_memory()
        health_status["checks"]["memory"] = {
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent
        }
        
        if memory.percent > 90:
            health_status["status"] = "degraded"
            
    except ImportError:
        health_status["checks"]["memory"] = {"status": "not_available"}
        
    return health_status

# Graceful shutdown handler
async def graceful_shutdown(app: FastAPI):
    """Graceful shutdown handler"""
    logger.info("Starting graceful shutdown...")
    
    # Get scaling middleware
    middleware = getattr(app.state, 'scaling_middleware', None)
    if middleware:
        config = app.state.scaling_config
        await asyncio.sleep(config.graceful_shutdown_timeout)
        await middleware.cleanup()
        
    logger.info("Graceful shutdown completed")

# Export classes and functions
__all__ = [
    'ScalingMode',
    'ScalingConfig',
    'LoadBalancer',
    'CircuitBreaker',
    'RateLimiter',
    'SessionManager',
    'CacheManager',
    'DatabasePool',
    'ScalingMiddleware',
    'create_scaling_config',
    'setup_scaling',
    'health_check',
    'graceful_shutdown'
]
