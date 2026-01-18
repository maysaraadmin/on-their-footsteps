from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from ..database import get_db
from ..models import IslamicCharacter
from ..schemas import CharacterResponse, CharacterCreate
from ..logging_config import get_logger, log_database_operation, log_error
from ..cache import cache_result, CharacterCache, invalidate_character_cache
import json

router = APIRouter()
logger = get_logger(__name__)

# Character slug mapping for backward compatibility
CHARACTER_SLUGS = {
    "muhammad": 1,
    "abu-bakr": 2,
    "umar": 3,
    "uthman": 4,
    "ali": 5
}

@router.get("/", response_model=List[CharacterResponse])
async def get_characters(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    era: Optional[str] = Query(None, description="Filter by era"),
    sort: str = Query("name", regex="^(name|views|likes|created|updated)$", description="Sort field"),
    db: Session = Depends(get_db)
):
    """Get all characters with pagination and filtering"""
    try:
        logger.info(f"Fetching characters with filters: category={category}, era={era}, page={page}, limit={limit}")
        query = db.query(IslamicCharacter)
        
        # Apply filters
        if category:
            query = query.filter(IslamicCharacter.category == category)
        if era:
            query = query.filter(IslamicCharacter.era == era)
        
        # Apply sorting
        if sort == "name":
            query = query.order_by(IslamicCharacter.name)
        elif sort == "views":
            query = query.order_by(IslamicCharacter.views_count.desc())
        elif sort == "likes":
            query = query.order_by(IslamicCharacter.likes_count.desc())
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        characters = query.offset(offset).limit(limit).all()
        
        logger.info(f"Retrieved {len(characters)} characters (total: {total})")
        
        # Convert to response models
        return [CharacterResponse.model_validate(char) for char in characters]
    except Exception as e:
        log_error(logger, e, {"action": "get_characters", "category": category, "era": era})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{character_id}", response_model=CharacterResponse)
@cache_result(expire=600, key_prefix="character_detail")
async def get_character(
    character_id: Union[str, int],
    db: Session = Depends(get_db)
):
    """Get specific character by ID or slug"""
    try:
        # Handle both numeric IDs and string slugs
        if isinstance(character_id, str) and character_id.isdigit():
            character_id_int = int(character_id)
            character = db.query(IslamicCharacter).filter(
                IslamicCharacter.id == character_id_int
            ).first()
        elif isinstance(character_id, int):
            character = db.query(IslamicCharacter).filter(
                IslamicCharacter.id == character_id
            ).first()
        else:
            # Try to find by slug field if it exists
            character = db.query(IslamicCharacter).filter(
                IslamicCharacter.slug == character_id
            ).first()
        
        if not character:
            raise HTTPException(status_code=404, detail="Character not found")
        
        # Increment view count (this will invalidate cache)
        character.views_count += 1
        db.commit()
        
        # Invalidate related cache entries
        invalidate_character_cache(character_id)
        
        return CharacterResponse(
            id=character.id,
            name=character.name,
            arabic_name=character.arabic_name,
            title=character.title,
            description=character.description,
            category=character.category,
            era=character.era,
            profile_image=character.profile_image,
            views_count=character.views_count,
            likes_count=character.likes_count,
            birth_year=character.birth_year,
            death_year=character.death_year,
            birth_place=character.birth_place,
            death_place=character.death_place,
            full_story=character.full_story,
            key_achievements=character.key_achievements or [],
            lessons=character.lessons or [],
            quotes=character.quotes or [],
            timeline_events=character.timeline_events or [],
            related_characters=character.related_characters or [],
            is_verified=getattr(character, 'is_verified', False)
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {"action": "get_character", "character_id": character_id})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
