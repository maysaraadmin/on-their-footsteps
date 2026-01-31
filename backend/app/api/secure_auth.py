"""
Secure authentication endpoints for httpOnly cookie management
Provides secure token handling with XSS protection
"""

from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from ..config import settings
from ..database import get_db
from ..utils.validators import InputValidator
from sqlalchemy.orm import Session
import logging

router = APIRouter(prefix="/auth", tags=["secure-auth"])
security = HTTPBearer()
validator = InputValidator()
logger = logging.getLogger(__name__)

@router.post("/set-token")
async def set_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Set authentication token in httpOnly cookie
    """
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No token provided")
        
        token = auth_header.split(" ")[1]
        
        # Validate token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Validate user ID
        id_validation = validator.validateID(user_id)
        if not id_validation.isValid:
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Set httpOnly cookie
        response.set_cookie(
            key="auth_token",
            value=token,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            path="/",
            domain=None,
            secure=not settings.DEBUG,
            httponly=True,
            samesite="lax"
        )
        
        logger.info(f"Secure token set for user {user_id}")
        return {"message": "Token set successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting secure token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set token")

@router.post("/clear-token")
async def clear_token(response: Response):
    """
    Clear authentication token from httpOnly cookie
    """
    try:
        response.delete_cookie(
            key="auth_token",
            path="/",
            domain=None,
            secure=not settings.DEBUG,
            httponly=True,
            samesite="lax"
        )
        
        logger.info("Secure token cleared")
        return {"message": "Token cleared successfully"}
        
    except Exception as e:
        logger.error(f"Error clearing secure token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to clear token")

@router.get("/check-auth")
async def check_auth(request: Request, db: Session = Depends(get_db)):
    """
    Check if user is authenticated via httpOnly cookie
    """
    try:
        # Get token from cookie
        token = request.cookies.get("auth_token")
        if not token:
            return {"authenticated": False}
        
        # Validate token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                return {"authenticated": False}
        except JWTError:
            return {"authenticated": False}
        
        # Check if user exists in database
        from ..models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return {"authenticated": False}
        
        return {"authenticated": True, "user_id": user_id}
        
    except Exception as e:
        logger.error(f"Error checking authentication: {str(e)}")
        return {"authenticated": False}

@router.post("/set-user-data")
async def set_user_data(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Set user data in secure cookie
    """
    try:
        # Get user data from request
        user_data = await request.json()
        
        # Validate user data
        required_fields = ["id", "email", "username"]
        for field in required_fields:
            if field not in user_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate user ID
        id_validation = validator.validateID(user_data["id"])
        if not id_validation.isValid:
            raise HTTPException(status_code=400, detail="Invalid user ID")
        
        # Validate email
        email_validation = validator.validateEmail(user_data["email"])
        if not email_validation.isValid:
            raise HTTPException(status_code=400, detail="Invalid email")
        
        # Set user data cookie (non-sensitive data only)
        user_data_json = {
            "id": user_data["id"],
            "email": user_data["email"],
            "username": user_data["username"],
            "full_name": user_data.get("full_name", ""),
            "arabic_name": user_data.get("arabic_name", ""),
            "level_id": user_data.get("level_id", 1),
            "total_xp": user_data.get("total_xp", 0),
            "preferred_language": user_data.get("preferred_language", "en")
        }
        
        import json
        response.set_cookie(
            key="user_data",
            value=json.dumps(user_data_json),
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            path="/",
            domain=None,
            secure=not settings.DEBUG,
            httponly=True,
            samesite="lax"
        )
        
        logger.info(f"User data set for user {user_data['id']}")
        return {"message": "User data set successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to set user data")

@router.get("/get-user-data")
async def get_user_data(request: Request, db: Session = Depends(get_db)):
    """
    Get user data from secure cookie
    """
    try:
        # Get user data from cookie
        user_data_cookie = request.cookies.get("user_data")
        if not user_data_cookie:
            return {"user_data": None}
        
        import json
        try:
            user_data = json.loads(user_data_cookie)
            return {"user_data": user_data}
        except json.JSONDecodeError:
            return {"user_data": None}
        
    except Exception as e:
        logger.error(f"Error getting user data: {str(e)}")
        return {"user_data": None}

@router.post("/refresh")
async def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Refresh authentication token
    """
    try:
        # Get current token from cookie
        token = request.cookies.get("auth_token")
        if not token:
            raise HTTPException(status_code=401, detail="No token provided")
        
        # Validate current token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Check if user exists and is active
        from ..models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        
        # Generate new token
        from datetime import datetime, timedelta
        new_payload = {
            "sub": str(user.id),
            "email": user.email,
            "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.utcnow()
        }
        
        new_token = jwt.encode(new_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        # Set new token in cookie
        response.set_cookie(
            key="auth_token",
            value=new_token,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            expires=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            path="/",
            domain=None,
            secure=not settings.DEBUG,
            httponly=True,
            samesite="lax"
        )
        
        logger.info(f"Token refreshed for user {user_id}")
        return {"token": new_token, "message": "Token refreshed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refresh token")
