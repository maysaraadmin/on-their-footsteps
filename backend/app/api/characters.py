"""Characters API module for managing Islamic character data.

This module provides endpoints for CRUD operations on Islamic characters,
including pagination, filtering, search, and caching. It handles character
retrieval with both ID and slug support, and includes comprehensive error
handling and logging.

Endpoints:
    GET /characters: List characters with pagination and filtering
    GET /characters/{id}: Get specific character by ID or slug
    POST /characters: Create new character
    PUT /characters/{id}: Update existing character
    DELETE /characters/{id}: Delete character

Attributes:
    router (APIRouter): FastAPI router for character endpoints
    logger: Structured logger for character operations
    CHARACTER_SLUGS (dict): Mapping of character slugs to IDs for backward compatibility

Example:
    >>> from app.api.characters import router
    >>> router.prefix
    '/api/characters'
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import datetime
from ..database import get_db
from ..models import IslamicCharacter
from ..schemas import CharacterResponse, CharacterCreate
from ..logging_config import get_logger, log_database_operation, log_error
from ..cache import cache_result, CharacterCache, invalidate_character_cache
from ..utils.rate_limiter import rate_limit
from ..utils.query_optimizer import QueryOptimizer
import json

router = APIRouter()
logger = get_logger(__name__)

@router.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "test working"}

# Character slug mapping for backward compatibility
CHARACTER_SLUGS = {
    "muhammad": 1,
    "abu-bakr": 2,
    "umar": 3,
    "uthman": 4,
    "ali": 5
}

@router.get("/", response_model=List[CharacterResponse])
# @rate_limit(key='default')  # Temporarily disabled for debugging
async def get_characters(
    page: int = Query(1, ge=1, description="Page number for pagination (starts from 1)"),
    limit: int = Query(12, ge=1, le=100, description="Number of items per page (max 100)"),
    category: Optional[str] = Query(None, description="Filter characters by category (e.g., 'الصحابة', 'الأنبياء')"),
    era: Optional[str] = Query(None, description="Filter characters by historical era (e.g., 'عصر النبوة', 'الخلافة الراشدة')"),
    sort: str = Query("name", regex="^(name|views|likes|created|updated)$", description="Sort field: name (alphabetical), views (most viewed), likes (most liked), created (newest), updated (recently modified)"),
    db: Session = Depends(get_db)
) -> List[CharacterResponse]:
    """Retrieve paginated list of Islamic characters with optional filtering and sorting.
    
    This endpoint supports comprehensive filtering by category and era, multiple
    sorting options, and pagination for efficient data retrieval. Results are
    returned as CharacterResponse objects with all character metadata.
    
    Args:
        page: Page number for pagination (1-based)
        limit: Number of characters per page
        category: Optional category filter
        era: Optional historical era filter  
        sort: Sort field and direction
        db: Database session dependency
        
    Returns:
        List of CharacterResponse objects containing character data
        
    Raises:
        HTTPException: If database error occurs (500)
        
    Example:
        >>> GET /api/characters?page=1&limit=10&category=الصحابة&sort=views
        Returns first 10 companions sorted by view count
    """
    try:
        logger.info(f"Fetching characters with filters: category={category}, era={era}, page={page}, limit={limit}")
        
        # Use optimized query
        characters = QueryOptimizer.get_characters_with_relations(
            db=db,
            page=page,
            limit=limit,
            category=category,
            era=era,
            sort=sort
        )
        
        logger.info(f"Retrieved {len(characters)} characters")
        
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
    """Get specific character by ID or slug with caching.
    
    Retrieves detailed character information supporting both numeric IDs and string
    slugs for backward compatibility. Results are cached for 10 minutes to improve
    performance. Includes comprehensive character data with achievements, lessons,
    quotes, and timeline events.
    
    Args:
        character_id: Character identifier (numeric ID or string slug)
        db: Database session dependency
        
    Returns:
        CharacterResponse: Detailed character data with all metadata
        
    Raises:
        HTTPException: If character not found (404)
        HTTPException: If database error occurs (500)
        
    Example:
        >>> GET /api/characters/abu-bakr
        Returns Abu Bakr character data using slug
        
        >>> GET /api/characters/2
        Returns Abu Bakr character data using ID
    """
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
            english_name=getattr(character, 'english_name', None),
            title=character.title,
            description=character.description,
            category=character.category,
            era=character.era,
            sub_category=getattr(character, 'sub_category', None),
            slug=getattr(character, 'slug', f"character-{character.id}"),
            profile_image=character.profile_image,
            views_count=character.views_count,
            likes_count=character.likes_count,
            shares_count=getattr(character, 'shares_count', 0),
            is_featured=getattr(character, 'is_featured', False),
            is_verified=getattr(character, 'is_verified', False),
            verification_source=getattr(character, 'verification_source', None),
            verification_notes=getattr(character, 'verification_notes', None),
            created_at=getattr(character, 'created_at', datetime.now()),
            birth_year=character.birth_year,
            death_year=character.death_year,
            birth_place=character.birth_place,
            death_place=character.death_place,
            full_story=character.full_story,
            key_achievements=character.key_achievements or [],
            lessons=character.lessons or [],
            quotes=character.quotes or [],
            timeline_events=character.timeline_events or [],
            related_characters=character.related_characters or []
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {"action": "get_character", "character_id": character_id})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{character_id}/view")
async def increment_views(
    character_id: Union[str, int],
    db: Session = Depends(get_db)
):
    """Increment character view count.
    
    Args:
        character_id: Character identifier (numeric ID or string slug)
        db: Database session dependency
        
    Returns:
        dict: Updated character data
        
    Raises:
        HTTPException: If character not found (404)
        HTTPException: If database error occurs (500)
    """
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
        
        # Increment view count
        character.views_count += 1
        db.commit()
        
        # Invalidate cache
        invalidate_character_cache(character_id)
        
        return {
            "id": character.id,
            "views_count": character.views_count,
            "message": "View count incremented"
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {"action": "increment_views", "character_id": character_id})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.patch("/{character_id}/like")
async def toggle_like(
    character_id: Union[str, int],
    liked: bool,
    db: Session = Depends(get_db)
):
    """Toggle character like status.
    
    Args:
        character_id: Character identifier (numeric ID or string slug)
        liked: Like status
        db: Database session dependency
        
    Returns:
        dict: Updated character data
        
    Raises:
        HTTPException: If character not found (404)
        HTTPException: If database error occurs (500)
    """
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
        
        # Update like count
        if liked:
            character.likes_count += 1
        else:
            character.likes_count = max(0, character.likes_count - 1)
        
        db.commit()
        
        # Invalidate cache
        invalidate_character_cache(character_id)
        
        return {
            "id": character.id,
            "likes_count": character.likes_count,
            "liked": liked,
            "message": "Like status updated"
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {"action": "toggle_like", "character_id": character_id})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{character_id}/share")
async def share_character(
    character_id: Union[str, int],
    db: Session = Depends(get_db)
):
    """Record character share.
    
    Args:
        character_id: Character identifier (numeric ID or string slug)
        db: Database session dependency
        
    Returns:
        dict: Share result
        
    Raises:
        HTTPException: If character not found (404)
        HTTPException: If database error occurs (500)
    """
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
        
        # Increment share count if field exists
        if hasattr(character, 'shares_count'):
            character.shares_count += 1
            db.commit()
        
        # Invalidate cache
        invalidate_character_cache(character_id)
        
        return {
            "id": character.id,
            "shares_count": getattr(character, 'shares_count', 0),
            "message": "Character shared successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, e, {"action": "share_character", "character_id": character_id})
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
