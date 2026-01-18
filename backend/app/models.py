from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base

class IslamicCharacter(Base):
    __tablename__ = "islamic_characters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    arabic_name = Column(String(200), nullable=False)
    english_name = Column(String(200))
    
    # Basic Info
    title = Column(String(300))
    description = Column(Text)
    birth_year = Column(Integer)
    death_year = Column(Integer)
    era = Column(String(100), index=True)
    category = Column(String(100), index=True)  # نبي، صحابي، تابعي، عالم
    sub_category = Column(String(100))  # خليفة، قائد، فقيه
    slug = Column(String(200), unique=True, index=True)  # URL-friendly identifier
    
    # Content
    full_story = Column(Text)
    key_achievements = Column(JSON)
    lessons = Column(JSON)
    quotes = Column(JSON)
    
    # Media
    profile_image = Column(String(500))
    gallery = Column(JSON)  # List of image URLs
    audio_stories = Column(JSON)  # List of audio URLs
    animations = Column(JSON)  # List of animation data
    
    # Timeline
    timeline_events = Column(JSON)
    
    # Location
    birth_place = Column(String(200))
    death_place = Column(String(200))
    locations = Column(JSON)  # Important locations
    
    # Relationships
    related_characters = Column(JSON)  # IDs of related characters
    
    # Statistics
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    
    # Metadata
    is_featured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_source = Column(String(500))
    verification_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    progress_records = relationship("UserProgress", back_populates="character")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(200))
    
    # Authentication
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Preferences
    language = Column(String(10), default="ar")
    theme = Column(String(20), default="light")
    notification_settings = Column(JSON)
    
    # Progress tracking
    total_stories_completed = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # in minutes
    streak_days = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    progress_records = relationship("UserProgress", back_populates="user")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    character_id = Column(Integer, ForeignKey("islamic_characters.id"), index=True)
    
    # Progress tracking
    current_chapter = Column(Integer, default=0)
    total_chapters = Column(Integer)
    completion_percentage = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    
    # Interaction
    bookmarked = Column(Boolean, default=False)
    notes = Column(Text)
    rating = Column(Integer)  # 1-5 stars
    last_position = Column(Integer)  # For audio/video
    
    # Time tracking
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    time_spent = Column(Integer, default=0)  # in seconds
    
    # Relationships
    user = relationship("User", back_populates="progress_records")
    character = relationship("IslamicCharacter", back_populates="progress_records")

class ContentCategory(Base):
    __tablename__ = "content_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    arabic_name = Column(String(100))
    description = Column(Text)
    icon = Column(String(100))
    color = Column(String(20))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class DailyLesson(Base):
    __tablename__ = "daily_lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), unique=True, index=True)  # YYYY-MM-DD
    character_id = Column(Integer, ForeignKey("islamic_characters.id"))
    title = Column(String(200))
    content = Column(Text)
    verse = Column(JSON)  # {surah: "البقرة", ayah: 255, text: "..."}
    hadith = Column(JSON)  # {source: "صحيح البخاري", text: "..."}
    reflection_question = Column(String(500))
    
    character = relationship("IslamicCharacter")