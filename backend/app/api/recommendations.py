from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models import IslamicCharacter

router = APIRouter()

@router.get("/for-user/{user_id}")
async def get_user_recommendations(
    user_id: int,
    limit: int = Query(10, le=50),
    algorithm: str = Query("collaborative", regex="^(collaborative|content|hybrid)$"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get personalized recommendations for a user"""
    return {
        "user_id": user_id,
        "algorithm_used": algorithm,
        "recommendations": [
            {
                "character_id": 4,
                "name": "عثمان بن عفان",
                "arabic_name": "عثمان بن عفان رضي الله عنه",
                "title": "ذو النورين",
                "category": "الصحابة",
                "similarity_score": 0.92,
                "reason": "بناءً على اهتمامك بالخلفاء الراشدين",
                "confidence": 0.88,
                "estimated_reading_time": 15,
                "preview": "ثالث الخلفاء الراشدين وأحد العشرة المبشرين بالجنة..."
            },
            {
                "character_id": 5,
                "name": "علي بن أبي طالب",
                "arabic_name": "علي بن أبي طالب رضي الله عنه",
                "title": "أبو الحسن",
                "category": "الصحابة",
                "similarity_score": 0.87,
                "reason": "شخصيات مرتبطة بالصحابة الذين استمتع بقراءتهم",
                "confidence": 0.82,
                "estimated_reading_time": 18,
                "preview": "ابن عم النبي صلى الله عليه وسلم ورابع الخلفاء الراشدين..."
            }
        ]
    }

@router.get("/similar/{character_id}")
async def get_similar_characters(
    character_id: int,
    limit: int = Query(5, le=20),
    similarity_type: str = Query("content", regex="^(content|category|era|relationships)$"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get characters similar to a specific character"""
    return {
        "character_id": character_id,
        "similarity_type": similarity_type,
        "similar_characters": [
            {
                "character_id": 3,
                "name": "عمر بن الخطاب",
                "arabic_name": "عمر بن الخطاب رضي الله عنه",
                "title": "الفاروق",
                "category": "الصحابة",
                "similarity_score": 0.89,
                "similar_aspects": ["category", "era", "role"],
                "common_traits": ["justice", "leadership", "courage"]
            },
            {
                "character_id": 4,
                "name": "عثمان بن عفان",
                "arabic_name": "عثمان بن عفان رضي الله عنه",
                "title": "ذو النورين",
                "category": "الصحابة",
                "similarity_score": 0.85,
                "similar_aspects": ["category", "era", "role"],
                "common_traits": ["generosity", "piety", "wisdom"]
            }
        ]
    }

@router.get("/trending")
async def get_trending_characters(
    time_period: str = Query("week", regex="^(day|week|month|year)$"),
    category: Optional[str] = Query(None),
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get trending characters based on recent activity"""
    return [
        {
            "character_id": 1,
            "name": "محمد صلى الله عليه وسلم",
            "title": "خاتم الأنبياء والمرسلين",
            "category": "الأنبياء",
            "trend_score": 0.95,
            "views_change": "+25%",
            "engagement_change": "+18%",
            "recent_views": 2340,
            "total_views": 45600
        },
        {
            "character_id": 2,
            "name": "أبو بكر الصديق",
            "title": "الصديق والخليفة الأول",
            "category": "الصحابة",
            "trend_score": 0.87,
            "views_change": "+15%",
            "engagement_change": "+12%",
            "recent_views": 1890,
            "total_views": 28900
        }
    ]

@router.get("/collections")
async def get_recommended_collections(
    user_id: int,
    collection_type: str = Query("themed", regex="^(themed|era|category|difficulty)$"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get recommended character collections"""
    return {
        "user_id": user_id,
        "collection_type": collection_type,
        "collections": [
            {
                "id": 1,
                "name": "الخلفاء الراشدون",
                "description": "مجموعة شاملة عن الخلفاء الأربعة الراشدين",
                "type": "themed",
                "characters": [2, 3, 4, 5],
                "estimated_reading_time": 60,
                "difficulty": "intermediate",
                "completion_rate": 0.0,
                "cover_image": "/static/collections/rashidun.jpg"
            },
            {
                "id": 2,
                "name": "أصحاب بدر",
                "description": "الشخصيات التي شاركت في غزوة بدر الكبرى",
                "type": "historical",
                "characters": [1, 2, 3, 6, 7, 8],
                "estimated_reading_time": 90,
                "difficulty": "advanced",
                "completion_rate": 0.0,
                "cover_image": "/static/collections/badr.jpg"
            }
        ]
    }

@router.get("/learning-path")
async def get_learning_path_recommendations(
    user_id: int,
    goal: str = Query("comprehensive", regex="^(comprehensive|scholar|spiritual|historical)$"),
    current_level: str = Query("beginner", regex="^(beginner|intermediate|advanced)$"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get recommended learning paths"""
    return {
        "user_id": user_id,
        "goal": goal,
        "current_level": current_level,
        "recommended_path": [
            {
                "step": 1,
                "character_id": 1,
                "name": "محمد صلى الله عليه وسلم",
                "reason": "أساس كل المعرفة الإسلامية",
                "prerequisites": [],
                "estimated_time": 30,
                "difficulty": "beginner"
            },
            {
                "step": 2,
                "character_id": 2,
                "name": "أبو بكر الصديق",
                "reason": "أقرب الناس إلى النبي وأول الخلفاء",
                "prerequisites": [1],
                "estimated_time": 25,
                "difficulty": "beginner"
            },
            {
                "step": 3,
                "character_id": 3,
                "name": "عمر بن الخطاب",
                "reason": "ثاني الخلفاء وأحد العشرة المبشرين",
                "prerequisites": [1, 2],
                "estimated_time": 28,
                "difficulty": "intermediate"
            }
        ],
        "total_estimated_time": 83,
        "milestones": [
            {"step": 3, "achievement": "إكمال دراسة الخلفاء الراشدين"},
            {"step": 5, "achievement": "فهم العصر الراشدي بشكل شامل"}
        ]
    }

@router.post("/feedback")
async def submit_recommendation_feedback(
    user_id: int,
    character_id: int,
    feedback: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Submit feedback on recommendations to improve algorithm"""
    return {
        "message": "Feedback submitted successfully",
        "user_id": user_id,
        "character_id": character_id,
        "feedback": {
            "rating": feedback.get("rating"),
            "relevant": feedback.get("relevant"),
            "helpful": feedback.get("helpful"),
            "comment": feedback.get("comment")
        },
        "used_for_improvement": True
    }
