import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
import json

from .config import settings

class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'ip_address'):
            log_entry['ip_address'] = record.ip_address
        if hasattr(record, 'character_id'):
            log_entry['character_id'] = record.character_id
        if hasattr(record, 'action'):
            log_entry['action'] = record.action
        if hasattr(record, 'duration'):
            log_entry['duration'] = record.duration
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry, ensure_ascii=False)

class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output in development"""
    
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)

def setup_logging():
    """Setup application logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), "INFO"))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler for development
    if settings.DEBUG:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        # Use colored formatter in development
        console_formatter = ColoredFormatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
    
    # File handler for structured logs
    file_handler = logging.FileHandler(
        log_dir / "app.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    
    # Use structured JSON formatter for files
    structured_formatter = StructuredFormatter()
    file_handler.setFormatter(structured_formatter)
    root_logger.addHandler(file_handler)
    
    # Separate error log file
    error_handler = logging.FileHandler(
        log_dir / "errors.log",
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(structured_formatter)
    root_logger.addHandler(error_handler)
    
    # Suppress noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    return root_logger

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name)

# Log context manager for request tracking
class LogContext:
    """Context manager for adding structured logging context"""
    
    def __init__(self, logger: logging.Logger, **context):
        self.logger = logger
        self.context = context
        self.old_adapter = None
    
    def __enter__(self):
        self.old_adapter = logging.getLoggerAdapter(self.logger, self.context)
        return self.old_adapter
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.logger.error(
                "Exception in context",
                exc_info=(exc_type, exc_val, exc_tb),
                extra=self.context
            )

# Utility functions for common logging patterns
def log_api_request(logger: logging.Logger, method: str, path: str, 
                   user_id: str = None, ip_address: str = None):
    """Log API request"""
    logger.info(
        f"API {method} {path}",
        extra={
            "action": "api_request",
            "method": method,
            "path": path,
            "user_id": user_id,
            "ip_address": ip_address
        }
    )

def log_api_response(logger: logging.Logger, method: str, path: str, 
                   status_code: int, duration: float = None):
    """Log API response"""
    logger.info(
        f"API {method} {path} - {status_code}",
        extra={
            "action": "api_response",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration": duration
        }
    )

def log_database_operation(logger: logging.Logger, operation: str, table: str, 
                       record_id: int = None, user_id: str = None):
    """Log database operation"""
    logger.info(
        f"DB {operation} on {table}",
        extra={
            "action": "database_operation",
            "operation": operation,
            "table": table,
            "record_id": record_id,
            "user_id": user_id
        }
    )

def log_error(logger: logging.Logger, error: Exception, context: Dict[str, Any] = None):
    """Log error with context"""
    logger.error(
        f"Error: {str(error)}",
        exc_info=True,
        extra={
            "action": "error",
            "error_type": type(error).__name__,
            "error_message": str(error),
            **(context or {})
        }
    )

def log_security_event(logger: logging.Logger, event_type: str, 
                     details: Dict[str, Any] = None):
    """Log security-related events"""
    logger.warning(
        f"Security event: {event_type}",
        extra={
            "action": "security_event",
            "event_type": event_type,
            **(details or {})
        }
    )

# Initialize logging when module is imported
setup_logging()
