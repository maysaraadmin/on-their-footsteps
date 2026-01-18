import json
import pickle
from typing import Any, Optional, Union
from functools import wraps
import redis
from datetime import timedelta

from .config import settings
from .logging_config import get_logger

logger = get_logger(__name__)

class CacheManager:
    """Redis-based caching manager with serialization support"""
    
    def __init__(self):
        self.redis_client = None
        self._initialized = False
    
    def _initialize(self):
        """Lazy initialization of Redis connection"""
        if self._initialized:
            return
        
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=False,  # Handle binary data
                socket_connect_timeout=2,  # Reduced timeout
                socket_timeout=2,
                retry_on_timeout=True
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
        finally:
            self._initialized = True
    
    def is_available(self) -> bool:
        """Check if Redis is available"""
        self._initialize()
        return self.redis_client is not None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_available():
            return None
        
        try:
            cached_data = self.redis_client.get(key)
            if cached_data:
                return pickle.loads(cached_data)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set value in cache with optional expiration"""
        if not self.is_available():
            return False
        
        try:
            serialized_data = pickle.dumps(value)
            if expire is None:
                expire = 300  # Default 5 minutes
            return self.redis_client.setex(key, expire, serialized_data)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        if not self.is_available():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False

# Global cache instance
cache = CacheManager()

def cache_key(*parts: str) -> str:
    """Generate consistent cache key from parts"""
    return ":".join(str(part) for part in parts)

def cache_result(expire: int = 300, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix, func.__name__]
            
            # Add relevant args to key
            if args:
                key_parts.extend(str(arg) for arg in args)
            if kwargs:
                for k, v in sorted(kwargs.items()):
                    key_parts.append(f"{k}:{v}")
            
            cache_key_value = cache_key(*key_parts)
            
            # Try to get from cache
            cached_result = cache.get(cache_key_value)
            if cached_result is not None:
                logger.debug(f"Cache hit for {cache_key_value}")
                return cached_result
            
            # Execute function and cache result
            try:
                result = await func(*args, **kwargs)
                cache.set(cache_key_value, result, expire)
                logger.debug(f"Cache set for {cache_key_value}")
                return result
            except Exception as e:
                logger.error(f"Error in cached function {func.__name__}: {e}")
                raise
        
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str) -> bool:
    """Invalidate cache entries matching pattern"""
    try:
        deleted_count = cache.clear_pattern(pattern)
        logger.info(f"Invalidated {deleted_count} cache entries matching {pattern}")
        return deleted_count > 0
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")
        return False

# Specific cache utilities for different data types
class CharacterCache:
    """Character-specific caching utilities"""
    
    @staticmethod
    def get_character_list_key(category: str = None, era: str = None, page: int = 1, limit: int = 12) -> str:
        """Generate cache key for character list"""
        parts = ["characters", "list"]
        if category:
            parts.append(f"cat:{category}")
        if era:
            parts.append(f"era:{era}")
        parts.extend([f"page:{page}", f"limit:{limit}"])
        return cache_key(*parts)
    
    @staticmethod
    def get_character_detail_key(character_id: Union[str, int]) -> str:
        """Generate cache key for character detail"""
        return cache_key("character", "detail", str(character_id))
    
    @staticmethod
    def get_search_key(query: str, category: str = None) -> str:
        """Generate cache key for search results"""
        parts = ["characters", "search", query]
        if category:
            parts.append(f"cat:{category}")
        return cache_key(*parts)
    
    @staticmethod
    def get_stats_key(character_id: Union[str, int] = None) -> str:
        """Generate cache key for statistics"""
        if character_id:
            return cache_key("stats", "character", str(character_id))
        return cache_key("stats", "overall")

class ProgressCache:
    """Progress-specific caching utilities"""
    
    @staticmethod
    def get_user_progress_key(user_id: int) -> str:
        """Generate cache key for user progress"""
        return cache_key("progress", "user", str(user_id))
    
    @staticmethod
    def get_character_progress_key(character_id: Union[str, int], user_id: int) -> str:
        """Generate cache key for character progress"""
        return cache_key("progress", "character", str(character_id), "user", str(user_id))

# Cache invalidation utilities
def invalidate_character_cache(character_id: Union[str, int] = None):
    """Invalidate character-related cache entries"""
    patterns = ["character:*"]
    if character_id:
        patterns.append(f"character:{character_id}:*")
    
    for pattern in patterns:
        invalidate_cache_pattern(pattern)

def invalidate_progress_cache(user_id: int = None, character_id: Union[str, int] = None):
    """Invalidate progress-related cache entries"""
    patterns = ["progress:*"]
    if user_id:
        patterns.append(f"progress:user:{user_id}:*")
    if character_id:
        patterns.append(f"progress:character:{character_id}:*")
    
    for pattern in patterns:
        invalidate_cache_pattern(pattern)
