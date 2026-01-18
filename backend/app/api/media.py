from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import os
import uuid
from ..database import get_db
from ..models import IslamicCharacter

router = APIRouter()

# Media upload configuration
UPLOAD_DIR = "static/uploads"
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"]
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    character_id: Optional[int] = Form(None),
    image_type: str = Form("profile"),  # profile, gallery
    db: Session = Depends(get_db)
):
    """Upload image for character"""
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, "images", unique_filename)
    
    # Save file
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update database if character_id provided
    if character_id:
        character = db.query(IslamicCharacter).filter(IslamicCharacter.id == character_id).first()
        if character:
            if image_type == "profile":
                character.profile_image = f"/static/uploads/images/{unique_filename}"
            elif image_type == "gallery":
                if not character.gallery:
                    character.gallery = []
                character.gallery.append(f"/static/uploads/images/{unique_filename}")
            db.commit()
    
    return {
        "message": "Image uploaded successfully",
        "file_path": f"/static/uploads/images/{unique_filename}",
        "character_id": character_id,
        "image_type": image_type
    }

@router.post("/upload/audio")
async def upload_audio(
    file: UploadFile = File(...),
    character_id: Optional[int] = Form(None),
    audio_type: str = Form("story"),  # story, quote
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload audio file for character"""
    # Validate file type
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="Invalid audio type")
    
    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, "audio", unique_filename)
    
    # Save file
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Update database if character_id provided
    if character_id:
        character = db.query(IslamicCharacter).filter(IslamicCharacter.id == character_id).first()
        if character:
            if not character.audio_stories:
                character.audio_stories = []
            
            audio_info = {
                "url": f"/static/uploads/audio/{unique_filename}",
                "title": title or f"Audio {len(character.audio_stories) + 1}",
                "type": audio_type,
                "duration": None,  # TODO: Extract audio duration
                "file_size": len(content)
            }
            character.audio_stories.append(audio_info)
            db.commit()
    
    return {
        "message": "Audio uploaded successfully",
        "file_path": f"/static/uploads/audio/{unique_filename}",
        "character_id": character_id,
        "audio_info": audio_info if character_id else None
    }

@router.get("/images/{character_id}")
async def get_character_images(character_id: int, db: Session = Depends(get_db)):
    """Get all images for a character"""
    character = db.query(IslamicCharacter).filter(IslamicCharacter.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    images = []
    
    # Profile image
    if character.profile_image:
        images.append({
            "type": "profile",
            "url": character.profile_image,
            "is_primary": True
        })
    
    # Gallery images
    if character.gallery:
        for idx, img_url in enumerate(character.gallery):
            images.append({
                "type": "gallery",
                "url": img_url,
                "order": idx + 1,
                "is_primary": False
            })
    
    return {"character_id": character_id, "images": images}

@router.get("/audio/{character_id}")
async def get_character_audio(character_id: int, db: Session = Depends(get_db)):
    """Get all audio files for a character"""
    character = db.query(IslamicCharacter).filter(IslamicCharacter.id == character_id).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    return {
        "character_id": character_id,
        "audio_stories": character.audio_stories or [],
        "total_duration": sum(audio.get("duration", 0) for audio in (character.audio_stories or []))
    }

@router.delete("/image/{image_id}")
async def delete_image(image_id: str, db: Session = Depends(get_db)):
    """Delete an image"""
    # TODO: Implement image deletion
    return {"message": "Image deleted successfully"}

@router.delete("/audio/{audio_id}")
async def delete_audio(audio_id: str, db: Session = Depends(get_db)):
    """Delete an audio file"""
    # TODO: Implement audio deletion
    return {"message": "Audio deleted successfully"}

@router.post("/optimize")
async def optimize_media(
    file_paths: List[str],
    db: Session = Depends(get_db)
):
    """Optimize media files (compress images, normalize audio)"""
    # TODO: Implement media optimization
    return {
        "message": "Media optimization started",
        "files_processed": len(file_paths),
        "estimated_time": "2-5 minutes"
    }
