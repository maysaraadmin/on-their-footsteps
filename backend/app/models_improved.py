from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey, Float, CheckConstraint, Index, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, and_
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, validator
from .database import Base

# Association table for many-to-many relationship between characters
character_relationships = Table(
    'character_relationships',
    Base.metadata,
    Column('character_id', Integer, ForeignKey('islamic_characters.id'), primary_key=True),
    Column('related_character_id', Integer, ForeignKey('islamic_characters.id'), primary_key=True),
    Column('relationship_type', String(50), default='related'),  # family, companion, successor, etc.
    Index('idx_character_relationships', 'character_id', 'related_character_id')
)

class IslamicCharacter(Base):
    __tablename__ = "islamic_characters"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    arabic_name = Column(String(200), nullable=False)
    english_name = Column(String(200))
    
    # Basic Info with constraints
    title = Column(String(300))
    description = Column(Text)
    birth_year = Column(Integer)
    death_year = Column(Integer)
    era = Column(String(100), index=True)
    category = Column(String(100), index=True)  # نبي، صحابي، تابعي، عالم
    sub_category = Column(String(100))  # خليفة، قائد، فقيه
    slug = Column(String(200), unique=True, index=True, nullable=False)  # URL-friendly identifier
    
    # Content
    full_story = Column(Text)
    key_achievements = Column(JSON)  # Should be validated JSON
    lessons = Column(JSON)  # Should be validated JSON
    quotes = Column(JSON)  # Should be validated JSON
    
    # Media
    profile_image = Column(String(500))
    gallery = Column(JSON)  # List of image URLs - should be validated
    audio_stories = Column(JSON)  # List of audio URLs - should be validated
    animations = Column(JSON)  # List of animation data - should be validated
    
    # Timeline
    timeline_events = Column(JSON)  # Should be validated JSON
    
    # Location
    birth_place = Column(String(200))
    death_place = Column(String(200))
    locations = Column(JSON)  # Important locations - should be validated JSON
    
    # Relationships - now using proper relationships
    related_characters = relationship(
        "IslamicCharacter",
        secondary=character_relationships,
        primaryjoin="IslamicCharacter.id==character_relationships.c.character_id",
        secondaryjoin="IslamicCharacter.id==character_relationships.c.related_character_id",
        backref="related_by"
    )
    
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
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('length(name) >= 2', name='check_name_length'),
        CheckConstraint('length(arabic_name) >= 2', name='check_arabic_name_length'),
        CheckConstraint('birth_year IS NULL OR (birth_year >= 500 AND birth_year <= 1500)', name='check_birth_year_range'),
        CheckConstraint('death_year IS NULL OR (death_year >= 500 AND death_year <= 1500)', name='check_death_year_range'),
        CheckConstraint('birth_year IS NULL OR death_year IS NULL OR birth_year < death_year', name='check_birth_before_death'),
        CheckConstraint('category IN ("الأنبياء", "الصحابة", "التابعون", "العلماء", "الخلفاء", "القادة", "الفقهاء", "المحدثون", "المفكرون")', name='check_valid_category'),
        CheckConstraint('views_count >= 0', name='check_views_non_negative'),
        CheckConstraint('likes_count >= 0', name='check_likes_non_negative'),
        CheckConstraint('shares_count >= 0', name='check_shares_non_negative'),
        Index('idx_category_era', 'category', 'era'),
        Index('idx_featured_verified', 'is_featured', 'is_verified'),
        Index('idx_birth_death_year', 'birth_year', 'death_year'),
        UniqueConstraint('name', 'category', name='uq_name_category'),
    )

    def __repr__(self):
        return f"<IslamicCharacter(id={self.id}, name='{self.name}', category='{self.category}')>"

    def to_dict(self):
        """Convert character to dictionary with proper JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'arabic_name': self.arabic_name,
            'english_name': self.english_name,
            'title': self.title,
            'description': self.description,
            'birth_year': self.birth_year,
            'death_year': self.death_year,
            'era': self.era,
            'category': self.category,
            'sub_category': self.sub_category,
            'slug': self.slug,
            'full_story': self.full_story,
            'key_achievements': self.key_achievements,
            'lessons': self.lessons,
            'quotes': self.quotes,
            'profile_image': self.profile_image,
            'gallery': self.gallery,
            'audio_stories': self.audio_stories,
            'animations': self.animations,
            'timeline_events': self.timeline_events,
            'birth_place': self.birth_place,
            'death_place': self.death_place,
            'locations': self.locations,
            'views_count': self.views_count,
            'likes_count': self.likes_count,
            'shares_count': self.shares_count,
            'is_featured': self.is_featured,
            'is_verified': self.is_verified,
            'verification_source': self.verification_source,
            'verification_notes': self.verification_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

# Association table for many-to-many relationship between users and completed quizzes
user_quiz_association = Table(
    'user_quiz_association',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('quiz_id', Integer, ForeignKey('quizzes.id'), primary_key=True),
    Column('completed_at', DateTime(timezone=True), server_default=func.now()),
    Column('score', Float),
    Column('passed', Boolean),
    Index('idx_user_quiz', 'user_id', 'quiz_id')
)

class Level(Base):
    __tablename__ = "levels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    xp_required = Column(Integer, nullable=False, default=0)
    badge_icon = Column(String(200))
    color = Column(String(20))
    sort_order = Column(Integer, default=0)
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('xp_required >= 0', name='check_xp_non_negative'),
        CheckConstraint('sort_order >= 0', name='check_sort_order_non_negative'),
        UniqueConstraint('name', name='uq_level_name'),
    )
    
    # Relationships
    users = relationship("User", back_populates="level")
    quizzes = relationship("Quiz", back_populates="level")

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    questions = Column(JSON, nullable=False)  # List of question objects
    time_limit = Column(Integer, default=0)  # 0 = no time limit
    passing_score = Column(Float, default=70.0)  # Percentage
    max_attempts = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('time_limit >= 0', name='check_time_limit_non_negative'),
        CheckConstraint('passing_score >= 0 AND passing_score <= 100', name='check_passing_score_range'),
        CheckConstraint('max_attempts > 0', name='check_max_attempts_positive'),
        UniqueConstraint('title', name='uq_quiz_title'),
    )
    
    # Relationships
    level = relationship("Level", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200))
    arabic_name = Column(String(200))
    
    # Profile
    bio = Column(Text)
    avatar_url = Column(String(500))
    date_of_birth = Column(DateTime)
    country = Column(String(100))
    preferred_language = Column(String(10), default='en')
    
    # Gamification
    level_id = Column(Integer, ForeignKey("levels.id"), default=1)
    total_xp = Column(Integer, default=0)
    current_xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_login_date = Column(DateTime(timezone=True))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_guest = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('length(email) >= 5', name='check_email_length'),
        CheckConstraint('email LIKE "%@%"', name='check_email_format'),
        CheckConstraint('length(username) >= 3', name='check_username_length'),
        CheckConstraint('total_xp >= 0', name='check_total_xp_non_negative'),
        CheckConstraint('current_xp >= 0', name='check_current_xp_non_negative'),
        CheckConstraint('streak_days >= 0', name='check_streak_days_non_negative'),
        UniqueConstraint('email', name='uq_user_email'),
        UniqueConstraint('username', name='uq_user_username'),
    )
    
    # Relationships
    level = relationship("Level", back_populates="users")
    progress_records = relationship("UserProgress", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    character_id = Column(Integer, ForeignKey("islamic_characters.id"), nullable=False)
    
    # Progress tracking
    completion_percentage = Column(Float, default=0.0)
    last_position = Column(JSON)  # Store last reading position
    time_spent_minutes = Column(Integer, default=0)
    
    # Bookmarks and favorites
    is_bookmarked = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    
    # Achievement tracking
    achievements_unlocked = Column(JSON)  # List of achievement IDs
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    last_accessed_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('completion_percentage >= 0 AND completion_percentage <= 100', name='check_completion_percentage_range'),
        CheckConstraint('time_spent_minutes >= 0', name='check_time_spent_non_negative'),
        UniqueConstraint('user_id', 'character_id', name='uq_user_character_progress'),
        Index('idx_user_progress', 'user_id', 'character_id'),
        Index('idx_user_bookmarks', 'user_id', 'is_bookmarked'),
        Index('idx_user_favorites', 'user_id', 'is_favorite'),
    )
    
    # Relationships
    user = relationship("User", back_populates="progress_records")
    character = relationship("IslamicCharacter", back_populates="progress_records")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    
    # Attempt details
    attempt_number = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    
    # Timing
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    time_taken_seconds = Column(Integer)
    
    # Answers
    answers = Column(JSON)  # Store user's answers
    
    # Add constraints
    __table_args__ = (
        CheckConstraint('attempt_number > 0', name='check_attempt_number_positive'),
        CheckConstraint('score >= 0', name='check_score_non_negative'),
        CheckConstraint('max_score >= 0', name='check_max_score_non_negative'),
        CheckConstraint('percentage >= 0 AND percentage <= 100', name='check_percentage_range'),
        CheckConstraint('time_taken_seconds >= 0', name='check_time_taken_non_negative'),
        UniqueConstraint('user_id', 'quiz_id', 'attempt_number', name='uq_user_quiz_attempt'),
        Index('idx_user_quiz_attempts', 'user_id', 'quiz_id'),
    )
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")

# Pydantic schemas for validation
class CharacterCreate(BaseModel):
    name: str
    arabic_name: str
    english_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    era: Optional[str] = None
    category: str
    sub_category: Optional[str] = None
    slug: Optional[str] = None
    full_story: Optional[str] = None
    key_achievements: Optional[List[str]] = []
    lessons: Optional[List[str]] = []
    quotes: Optional[List[str]] = []
    profile_image: Optional[str] = None
    gallery: Optional[List[str]] = []
    audio_stories: Optional[List[str]] = []
    animations: Optional[List[dict]] = []
    timeline_events: Optional[List[dict]] = []
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    locations: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    is_verified: Optional[bool] = False
    verification_source: Optional[str] = None
    verification_notes: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(v) > 200:
            raise ValueError('Name must be less than 200 characters')
        return v.strip()
    
    @validator('arabic_name')
    def validate_arabic_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Arabic name must be at least 2 characters long')
        if len(v) > 200:
            raise ValueError('Arabic name must be less than 200 characters')
        return v.strip()
    
    @validator('birth_year', 'death_year')
    def validate_years(cls, v):
        if v is not None and (v < 500 or v > 1500):
            raise ValueError('Year must be between 500 and 1500 CE (Islamic history range)')
        return v
    
    @validator('death_year')
    def validate_death_after_birth(cls, v, values):
        if v is not None and 'birth_year' in values and values['birth_year'] is not None:
            if v <= values['birth_year']:
                raise ValueError('Death year must be after birth year')
        return v
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ["الأنبياء", "الصحابة", "التابعون", "العلماء", "الخلفاء", "القادة", "الفقهاء", "المحدثون", "المفكرون"]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v
    
    @validator('slug')
    def validate_slug(cls, v):
        if v is not None:
            if len(v) < 2:
                raise ValueError('Slug must be at least 2 characters long')
            if len(v) > 200:
                raise ValueError('Slug must be less than 200 characters')
            # Check slug format
            import re
            if not re.match(r'^[a-z0-9-]+$', v):
                raise ValueError('Slug must contain only lowercase letters, numbers, and hyphens')
        return v
    
    class Config:
        extra = "forbid"  # Prevent extra fields

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    arabic_name: Optional[str] = None
    english_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    era: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    slug: Optional[str] = None
    full_story: Optional[str] = None
    key_achievements: Optional[List[str]] = None
    lessons: Optional[List[str]] = None
    quotes: Optional[List[str]] = None
    profile_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    audio_stories: Optional[List[str]] = None
    animations: Optional[List[dict]] = None
    timeline_events: Optional[List[dict]] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    locations: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_verified: Optional[bool] = None
    verification_source: Optional[str] = None
    verification_notes: Optional[str] = None
    
    # Reuse validators from CharacterCreate
    _validate_name = validator('name', allow_reuse=True)(CharacterCreate.validate_name.__func__)
    _validate_arabic_name = validator('arabic_name', allow_reuse=True)(CharacterCreate.validate_arabic_name.__func__)
    _validate_years = validator('birth_year', 'death_year', allow_reuse=True)(CharacterCreate.validate_years.__func__)
    _validate_death_after_birth = validator('death_year', allow_reuse=True)(CharacterCreate.validate_death_after_birth.__func__)
    _validate_category = validator('category', allow_reuse=True)(CharacterCreate.validate_category.__func__)
    _validate_slug = validator('slug', allow_reuse=True)(CharacterCreate.validate_slug.__func__)
    
    class Config:
        extra = "forbid"

class CharacterResponse(BaseModel):
    id: int
    name: str
    arabic_name: str
    english_name: Optional[str]
    title: Optional[str]
    description: Optional[str]
    birth_year: Optional[int]
    death_year: Optional[int]
    era: Optional[str]
    category: str
    sub_category: Optional[str]
    slug: str
    full_story: Optional[str]
    key_achievements: Optional[List[str]]
    lessons: Optional[List[str]]
    quotes: Optional[List[str]]
    profile_image: Optional[str]
    gallery: Optional[List[str]]
    audio_stories: Optional[List[str]]
    animations: Optional[List[dict]]
    timeline_events: Optional[List[dict]]
    birth_place: Optional[str]
    death_place: Optional[str]
    locations: Optional[List[str]]
    views_count: int
    likes_count: int
    shares_count: int
    is_featured: bool
    is_verified: bool
    verification_source: Optional[str]
    verification_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
