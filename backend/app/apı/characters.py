from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import Optional, List

from .. import crud, schemas
from ..database import get_db
from ..utils.helpers import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.CharacterResponse])
def read_characters(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    era: Optional[str] = Query(None, description="Filter by era"),
    featured: Optional[bool] = Query(None, description="Filter featured characters"),
    db: Session = Depends(get_db)
):
    """
    Get list of Islamic characters with optional filters
    """
    characters = crud.get_characters(
        db, skip=skip, limit=limit,
        category=category, era=era, featured=featured
    )
    return characters

@router.get("/search/", response_model=List[schemas.CharacterResponse])
def search_characters(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search characters by name or description
    """
    characters = crud.search_characters(db, query=q, limit=limit)
    return characters

@router.get("/{character_id}", response_model=schemas.CharacterDetailResponse)
def read_character(
    character_id: int = Path(..., gt=0, description="Character ID"),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific character
    """
    character = crud.get_character(db, character_id=character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return character

@router.post("/", response_model=schemas.CharacterResponse)
def create_character(
    character: schemas.CharacterCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Create a new Islamic character (Admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_character = crud.create_character(db=db, character=character)
    return db_character

@router.put("/{character_id}", response_model=schemas.CharacterResponse)
def update_character(
    character_id: int,
    character_update: schemas.CharacterUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Update character information (Admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_character = crud.update_character(
        db=db, character_id=character_id, character_update=character_update
    )
    if db_character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return db_character

@router.delete("/{character_id}")
def delete_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Delete a character (Admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = crud.delete_character(db=db, character_id=character_id)
    if not success:
        raise HTTPException(status_code=404, detail="Character not found")
    return {"message": "Character deleted successfully"}

@router.get("/{character_id}/related", response_model=List[schemas.CharacterResponse])
def get_related_characters(
    character_id: int,
    db: Session = Depends(get_db)
):
    """
    Get characters related to the specified character
    """
    character = crud.get_character(db, character_id=character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    
    related_ids = character.related_characters or []
    if not related_ids:
        return []
    
    return db.query(models.IslamicCharacter).filter(
        models.IslamicCharacter.id.in_(related_ids)
    ).all()