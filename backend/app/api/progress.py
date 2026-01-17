from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

router = APIRouter()

# Mock data - replace with actual database operations
user_progress = {}

@router.get("/{user_id}")
async def get_user_progress(user_id: int):
    """Get progress for a specific user"""
    if user_id not in user_progress:
        return {"user_id": user_id, "completed_lessons": [], "current_character": None}
    return user_progress[user_id]

@router.post("/{user_id}/complete-lesson/{lesson_id}")
async def complete_lesson(user_id: int, lesson_id: int):
    """Mark a lesson as completed for a user"""
    if user_id not in user_progress:
        user_progress[user_id] = {"user_id": user_id, "completed_lessons": [], "current_character": None}
    
    if lesson_id not in user_progress[user_id]["completed_lessons"]:
        user_progress[user_id]["completed_lessons"].append(lesson_id)
    
    return {"message": "Lesson marked as completed"}

@router.post("/{character_id}")
async def update_progress(character_id: int, data: dict):
    """Update progress for a character"""
    return {"message": "Progress updated", "character_id": character_id, "data": data}

@router.put("/{character_id}")
async def update_bookmark(character_id: int, data: dict):
    """Update bookmark status for a character"""
    return {"message": "Bookmark updated", "character_id": character_id, "bookmarked": data.get("bookmarked", False)}

@router.get("/summary")
async def get_progress_summary():
    """Get overall progress summary"""
    return {
        "total_characters": 3,
        "completed_characters": 1,
        "total_lessons": 50,
        "completed_lessons": 15,
        "progress_percentage": 30
    }

@router.get("/stats")
async def get_progress_stats():
    """Get progress statistics"""
    return {
        "daily_active_users": 25,
        "weekly_active_users": 120,
        "monthly_active_users": 450,
        "total_completed_lessons": 1250,
        "average_completion_time": 45
    }
