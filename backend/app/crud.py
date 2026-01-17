from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List, Dict, Any
from . import models, schemas
from .utils.validators import validate_character_data

# Character CRUD Operations
def get_characters(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    era: Optional[str] = None,
    featured: Optional[bool] = None
) -> List[models.IslamicCharacter]:
    query = db.query(models.IslamicCharacter)
    
    if category:
        query = query.filter(models.IslamicCharacter.category == category)
    if era:
        query = query.filter(models.IslamicCharacter.era == era)
    if featured is not None:
        query = query.filter(models.IslamicCharacter.is_featured == featured)
    
    return query.order_by(models.IslamicCharacter.name).offset(skip).limit(limit).all()

def get_character(db: Session, character_id: int) -> Optional[models.IslamicCharacter]:
    character = db.query(models.IslamicCharacter).filter(
        models.IslamicCharacter.id == character_id
    ).first()
    
    if character:
        # Increment view count
        character.views_count += 1
        db.commit()
        db.refresh(character)
    
    return character

def create_character(db: Session, character: schemas.CharacterCreate) -> models.IslamicCharacter:
    # Validate data
    validate_character_data(character.dict())
    
    db_character = models.IslamicCharacter(**character.dict())
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character

def update_character(
    db: Session,
    character_id: int,
    character_update: schemas.CharacterUpdate
) -> Optional[models.IslamicCharacter]:
    db_character = get_character(db, character_id)
    if not db_character:
        return None
    
    update_data = character_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_character, field, value)
    
    db.commit()
    db.refresh(db_character)
    return db_character

def delete_character(db: Session, character_id: int) -> bool:
    db_character = get_character(db, character_id)
    if not db_character:
        return False
    
    db.delete(db_character)
    db.commit()
    return True

def search_characters(db: Session, query: str, limit: int = 20) -> List[models.IslamicCharacter]:
    return db.query(models.IslamicCharacter).filter(
        models.IslamicCharacter.name.ilike(f"%{query}%") |
        models.IslamicCharacter.arabic_name.ilike(f"%{query}%") |
        models.IslamicCharacter.description.ilike(f"%{query}%")
    ).limit(limit).all()

# User Progress CRUD
def get_user_progress(db: Session, user_id: int, character_id: int) -> Optional[models.UserProgress]:
    return db.query(models.UserProgress).filter(
        models.UserProgress.user_id == user_id,
        models.UserProgress.character_id == character_id
    ).first()

def create_or_update_progress(
    db: Session,
    user_id: int,
    progress: schemas.ProgressCreate
) -> models.UserProgress:
    db_progress = get_user_progress(db, user_id, progress.character_id)
    
    if db_progress:
        # Update existing progress
        db_progress.current_chapter = progress.current_chapter
        db_progress.completion_percentage = progress.completion_percentage
        
        # Check if completed
        if progress.completion_percentage >= 100 and not db_progress.is_completed:
            db_progress.is_completed = True
            db_progress.completed_at = func.now()
    else:
        # Create new progress
        db_progress = models.UserProgress(
            user_id=user_id,
            **progress.dict()
        )
        db.add(db_progress)
    
    db.commit()
    db.refresh(db_progress)
    return db_progress

def get_user_progress_summary(db: Session, user_id: int) -> Dict[str, Any]:
    progress = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == user_id
    ).all()
    
    total_completed = sum(1 for p in progress if p.is_completed)
    total_time = sum(p.time_spent for p in progress)
    total_bookmarks = sum(1 for p in progress if p.bookmarked)
    
    return {
        "total_stories_started": len(progress),
        "total_stories_completed": total_completed,
        "total_time_spent_minutes": total_time // 60,
        "total_bookmarks": total_bookmarks,
        "completion_rate": (total_completed / len(progress) * 100) if progress else 0
    }

# Statistics
def get_application_stats(db: Session) -> Dict[str, Any]:
    total_characters = db.query(func.count(models.IslamicCharacter.id)).scalar()
    total_users = db.query(func.count(models.User.id)).scalar()
    total_progress = db.query(func.count(models.UserProgress.id)).scalar()
    
    most_viewed = db.query(models.IslamicCharacter).order_by(
        desc(models.IslamicCharacter.views_count)
    ).limit(5).all()
    
    return {
        "total_characters": total_characters or 0,
        "total_users": total_users or 0,
        "total_stories_started": total_progress or 0,
        "most_viewed_characters": [
            {
                "id": char.id,
                "name": char.name,
                "views_count": char.views_count
            }
            for char in most_viewed
        ]
    }

# Categories
def get_categories(db: Session) -> List[models.ContentCategory]:
    return db.query(models.ContentCategory).filter(
        models.ContentCategory.is_active == True
    ).order_by(models.ContentCategory.sort_order).all()