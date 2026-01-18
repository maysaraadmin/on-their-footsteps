from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime
from ..database import get_db
from ..models import IslamicCharacter

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    preferred_language: str = "ar"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    preferred_language: str
    created_at: datetime
    last_login: Optional[datetime]
    is_active: bool

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # TODO: Implement actual user registration
    # Hash password, create user record, send verification email
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "preferred_language": user.preferred_language,
        "created_at": datetime.now(),
        "last_login": None,
        "is_active": True
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current user profile"""
    # TODO: Get user from token
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "full_name": "Test User",
        "preferred_language": "ar",
        "created_at": datetime.now(),
        "last_login": datetime.now(),
        "is_active": True
    }

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate, 
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # TODO: Update user in database
    return {
        "id": 1,
        "username": "testuser",
        "email": user_update.email or "test@example.com",
        "full_name": user_update.full_name or "Test User",
        "preferred_language": user_update.preferred_language or "ar",
        "created_at": datetime.now(),
        "last_login": datetime.now(),
        "is_active": True
    }

@router.get("/{user_id}/profile")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get public user profile"""
    # TODO: Get user from database
    return {
        "user_id": user_id,
        "username": "testuser",
        "full_name": "Test User",
        "joined_date": "2024-01-01",
        "characters_completed": 5,
        "total_reading_time": 120,  # minutes
        "achievements": [
            {"name": "مستكشف أول شخصية", "date": "2024-01-01"},
            {"name": "قارئ نشيط", "date": "2024-01-05"}
        ],
        "favorite_characters": [1, 2, 3],
        "recent_activity": [
            {"type": "completed", "character": "أبو بكر الصديق", "date": "2024-01-10"},
            {"type": "bookmarked", "character": "عمر بن الخطاب", "date": "2024-01-09"}
        ]
    }

@router.get("/{user_id}/achievements")
async def get_user_achievements(user_id: int, db: Session = Depends(get_db)):
    """Get user achievements and badges"""
    return {
        "user_id": user_id,
        "total_achievements": 12,
        "unlocked_achievements": 8,
        "achievements": [
            {
                "id": 1,
                "name": "أول الخطوات",
                "description": "أكمل قراءة أول شخصية",
                "icon": "👣",
                "unlocked_at": "2024-01-01T10:00:00Z",
                "points": 10
            },
            {
                "id": 2,
                "name": "باحث عن العلم",
                "description": "اقرأ عن 5 صحابة",
                "icon": "📚",
                "unlocked_at": "2024-01-05T14:30:00Z",
                "points": 25
            },
            {
                "id": 3,
                "name": "حافظ القرآن",
                "description": "اقرأ 10 قصص تتعلق بالقرآن",
                "icon": "🕌",
                "locked": True,
                "required_progress": 10,
                "current_progress": 7,
                "points": 50
            }
        ]
    }

@router.get("/{user_id}/statistics")
async def get_user_statistics(user_id: int, db: Session = Depends(get_db)):
    """Get detailed user statistics"""
    return {
        "user_id": user_id,
        "reading_stats": {
            "total_characters_read": 8,
            "total_reading_time": 240,  # minutes
            "average_reading_time_per_character": 30,
            "pages_read": 156,
            "days_active": 15
        },
        "progress_stats": {
            "completion_rate": 0.75,  # 75%
            "bookmarks_count": 12,
            "notes_count": 5,
            "shares_count": 3
        },
        "category_stats": {
            "الأنبياء": {"read": 2, "total": 5},
            "الصحابة": {"read": 4, "total": 10},
            "التابعون": {"read": 1, "total": 8},
            "العلماء": {"read": 1, "total": 6}
        },
        "activity_timeline": [
            {"date": "2024-01-10", "activity": "completed_character", "count": 1},
            {"date": "2024-01-09", "activity": "bookmarked", "count": 2},
            {"date": "2024-01-08", "activity": "reading_time", "count": 45}
        ]
    }

@router.post("/{user_id}/preferences")
async def update_user_preferences(
    user_id: int,
    preferences: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    # TODO: Save preferences to database
    return {
        "user_id": user_id,
        "preferences_updated": True,
        "preferences": {
            "theme": preferences.get("theme", "light"),
            "language": preferences.get("language", "ar"),
            "notifications": preferences.get("notifications", True),
            "auto_play_audio": preferences.get("auto_play_audio", False),
            "reading_font_size": preferences.get("reading_font_size", "medium")
        }
    }

@router.get("/{user_id}/recommendations")
async def get_user_recommendations(
    user_id: int,
    limit: int = Query(5, le=20),
    db: Session = Depends(get_db)
):
    """Get personalized character recommendations"""
    # TODO: Implement recommendation algorithm based on user history
    return {
        "user_id": user_id,
        "recommendations": [
            {
                "character_id": 4,
                "name": "عثمان بن عفان",
                "reason": "بناءً على اهتمامك بالخلفاء الراشدين",
                "similarity_score": 0.9
            },
            {
                "character_id": 5,
                "name": "علي بن أبي طالب",
                "reason": "شخصية مرتبطة بالصحابة الذين قرأتهم",
                "similarity_score": 0.85
            }
        ]
    }
