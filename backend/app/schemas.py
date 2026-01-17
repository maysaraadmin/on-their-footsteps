from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class CategoryEnum(str, Enum):
    PROPHETS = "الأنبياء"
    COMPANIONS = "الصحابة"
    FOLLOWERS = "التابعون"
    SCHOLARS = "العلماء"
    WOMEN = "النساء الصالحات"
    LEADERS = "القادة"

class EraEnum(str, Enum):
    PRE_ISLAM = "ما قبل الإسلام"
    PROPHET_ERA = "عصر النبوة"
    RIGHTLY_GUIDED = "الخلافة الراشدة"
    UMAYYAD = "الدولة الأموية"
    ABBASID = "الدولة العباسية"
    OTTOMAN = "الدولة العثمانية"

# Character Schemas
class CharacterBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    arabic_name: str = Field(..., min_length=2, max_length=200)
    title: Optional[str] = None
    description: Optional[str] = None
    category: CategoryEnum
    era: EraEnum

class CharacterCreate(CharacterBase):
    full_story: str
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    key_achievements: List[str] = []
    lessons: List[str] = []
    quotes: List[str] = []
    timeline_events: List[Dict[str, Any]] = []

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    arabic_name: Optional[str] = None
    description: Optional[str] = None
    is_featured: Optional[bool] = None

class CharacterResponse(CharacterBase):
    id: int
    profile_image: Optional[str] = None
    views_count: int
    likes_count: int
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class CharacterDetailResponse(CharacterResponse):
    full_story: str
    key_achievements: List[str]
    lessons: List[str]
    quotes: List[str]
    timeline_events: List[Dict[str, Any]]
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    related_characters: List[int] = []
    gallery: List[str] = []
    audio_stories: List[str] = []
    animations: List[Dict[str, Any]] = []
    is_verified: bool
    verification_source: Optional[str] = None

# User Progress Schemas
class ProgressBase(BaseModel):
    character_id: int
    current_chapter: int = 0
    completion_percentage: float = Field(0.0, ge=0.0, le=100.0)

class ProgressCreate(ProgressBase):
    pass

class ProgressUpdate(BaseModel):
    current_chapter: Optional[int] = None
    completion_percentage: Optional[float] = None
    bookmarked: Optional[bool] = None
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)

class ProgressResponse(ProgressBase):
    id: int
    user_id: int
    is_completed: bool
    bookmarked: bool
    started_at: datetime
    time_spent: int
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    total_stories_completed: int
    streak_days: int
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

# Statistics Schemas
class StatsResponse(BaseModel):
    total_characters: int
    total_users: int
    total_stories_completed: int
    most_viewed_characters: List[Dict[str, Any]]
    daily_active_users: int
    weekly_lessons_completed: int