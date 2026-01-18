from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import IslamicCharacter

router = APIRouter()

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)) -> List[str]:
    """Get all character categories"""
    categories = db.query(IslamicCharacter.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/eras")
async def get_eras(db: Session = Depends(get_db)) -> List[str]:
    """Get all historical eras"""
    eras = db.query(IslamicCharacter.era).distinct().all()
    return [era[0] for era in eras if era[0]]

@router.get("/subcategories/{category}")
async def get_subcategories(category: str, db: Session = Depends(get_db)) -> List[str]:
    """Get subcategories for a specific category"""
    subcategories = db.query(IslamicCharacter.sub_category).filter(
        IslamicCharacter.category == category
    ).distinct().all()
    return [sub[0] for sub in subcategories if sub[0]]

@router.get("/search")
async def search_content(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    era: Optional[str] = Query(None, description="Filter by era"),
    limit: int = Query(20, le=100, description="Maximum results"),
    offset: int = Query(0, ge=0, description="Results offset"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Advanced search across characters"""
    query = db.query(IslamicCharacter)
    
    if q:
        query = query.filter(
            IslamicCharacter.name.contains(q) |
            IslamicCharacter.arabic_name.contains(q) |
            IslamicCharacter.description.contains(q) |
            IslamicCharacter.full_story.contains(q)
        )
    
    if category:
        query = query.filter(IslamicCharacter.category == category)
    
    if era:
        query = query.filter(IslamicCharacter.era == era)
    
    total = query.count()
    results = query.offset(offset).limit(limit).all()
    
    return {
        "results": results,
        "total": total,
        "offset": offset,
        "limit": limit
    }

@router.get("/featured/{category}")
async def get_featured_by_category(
    category: str,
    limit: int = Query(5, le=10),
    db: Session = Depends(get_db)
) -> List[IslamicCharacter]:
    """Get featured characters by category"""
    return db.query(IslamicCharacter).filter(
        IslamicCharacter.category == category,
        IslamicCharacter.is_featured == True
    ).order_by(IslamicCharacter.sort_order).limit(limit).all()

@router.get("/timeline/all")
async def get_global_timeline(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get timeline events from all characters"""
    characters = db.query(IslamicCharacter).all()
    timeline_events = []
    
    for character in characters:
        if character.timeline_events:
            for event in character.timeline_events:
                event['character_name'] = character.name
                event['character_id'] = character.id
                timeline_events.append(event)
    
    # Sort by year
    timeline_events.sort(key=lambda x: x.get('year', 0))
    return timeline_events[:limit]

@router.get("/quotes/random")
async def get_random_quotes(
    category: Optional[str] = Query(None),
    limit: int = Query(5, le=20),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get random quotes from characters"""
    query = db.query(IslamicCharacter).filter(IslamicCharacter.quques.isnot(None))
    
    if category:
        query = query.filter(IslamicCharacter.category == category)
    
    characters = query.all()
    quotes = []
    
    for character in characters:
        if character.quotes:
            for quote in character.quotes[:2]:  # Max 2 quotes per character
                quotes.append({
                    "quote": quote,
                    "character_name": character.name,
                    "character_id": character.id,
                    "character_title": character.title
                })
                if len(quotes) >= limit:
                    break
        if len(quotes) >= limit:
            break
    
    return quotes

@router.get("/locations")
async def get_important_locations(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get all important historical locations"""
    characters = db.query(IslamicCharacter).all()
    locations = {}
    
    for character in characters:
        if character.birth_place:
            locations[character.birth_place] = {
                "type": "birth_place",
                "characters": locations.get(character.birth_place, {}).get("characters", []) + [character.name]
            }
        if character.death_place:
            locations[character.death_place] = {
                "type": "death_place", 
                "characters": locations.get(character.death_place, {}).get("characters", []) + [character.name]
            }
        if character.locations:
            for location in character.locations:
                if location not in locations:
                    locations[location] = {
                        "type": "historical_site",
                        "characters": []
                    }
                locations[location]["characters"].append(character.name)
    
    return [{"name": k, **v} for k, v in locations.items()]
