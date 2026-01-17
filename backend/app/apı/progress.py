from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..utils.helpers import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.ProgressResponse])
def get_user_progress_list(
    skip: int = 0,
    limit: int = 50,
    completed: Optional[bool] = None,
    bookmarked: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Get progress records for the current user
    """
    query = db.query(models.UserProgress).filter(
        models.UserProgress.user_id == current_user.id
    )
    
    if completed is not None:
        query = query.filter(models.UserProgress.is_completed == completed)
    if bookmarked is not None:
        query = query.filter(models.UserProgress.bookmarked == bookmarked)
    
    progress_records = query.offset(skip).limit(limit).all()
    return progress_records

@router.get("/{character_id}", response_model=schemas.ProgressResponse)
def get_character_progress(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Get progress for a specific character
    """
    progress = crud.get_user_progress(db, current_user.id, character_id)
    if progress is None:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress

@router.post("/", response_model=schemas.ProgressResponse)
def update_progress(
    progress: schemas.ProgressCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Update or create progress for a character
    """
    db_progress = crud.create_or_update_progress(
        db=db, user_id=current_user.id, progress=progress
    )
    return db_progress

@router.put("/{character_id}", response_model=schemas.ProgressResponse)
def update_progress_details(
    character_id: int,
    progress_update: schemas.ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Update progress details (bookmark, notes, rating)
    """
    progress = crud.get_user_progress(db, current_user.id, character_id)
    if progress is None:
        raise HTTPException(status_code=404, detail="Progress not found")
    
    update_data = progress_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(progress, field, value)
    
    db.commit()
    db.refresh(progress)
    return progress

@router.get("/summary/")
def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(get_current_user)
):
    """
    Get summary of user's progress
    """
    summary = crud.get_user_progress_summary(db, current_user.id)
    return summary