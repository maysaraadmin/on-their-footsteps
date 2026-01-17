from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter()

# Mock data - replace with actual database queries
characters = [
    {
        "id": 1, 
        "name": "محمد صلى الله عليه وسلم", 
        "arabic_name": "محمد بن عبد الله",
        "era": "العصر النبوي",
        "category": "نبي",
        "title": "رسول الله وخاتم النبيين",
        "description": "رسول الله وخاتم النبيين",
        "views_count": 15000, 
        "likes_count": 8500,
        "birth_year": 570,
        "death_year": 632,
        "birth_place": "مكة المكرمة",
        "death_place": "المدينة المنورة",
        "timeline_events": [
            {"year": 610, "title": "بداية الوحي", "description": "نزول الوحي على النبي في غار حراء"},
            {"year": 622, "title": "الهجرة النبوية", "description": "هجرة النبي من مكة إلى المدينة"},
            {"year": 624, "title": "غزوة بدر", "description": "أول معركة كبرى في الإسلام"}
        ]
    },
    {
        "id": 2, 
        "name": "أبو بكر الصديق", 
        "arabic_name": "عبد الله بن عثمان",
        "era": "العصر الراشدي",
        "category": "صحابي",
        "title": "أول الخلفاء الراشدين",
        "description": "أول الخلفاء الراشدين وصاحب رسول الله",
        "views_count": 12000, 
        "likes_count": 6200,
        "birth_year": 573,
        "death_year": 634,
        "birth_place": "مكة المكرمة",
        "death_place": "المدينة المنورة",
        "timeline_events": [
            {"year": 632, "title": "تولي الخلافة", "description": "تولي الخلافة بعد وفاة النبي"},
            {"year": 633, "title": "حروب الردة", "description": "قيادة الجيوش في حروب الردة"}
        ]
    },
    {
        "id": 3, 
        "name": "عمر بن الخطاب", 
        "arabic_name": "عمر بن الخطاب",
        "era": "العصر الراشدي",
        "category": "صحابي",
        "title": "ثاني الخلفاء الراشدين",
        "description": "ثاني الخلفاء الراشدين وأمير المؤمنين",
        "views_count": 10000, 
        "likes_count": 5800,
        "birth_year": 584,
        "death_year": 644,
        "birth_place": "مكة المكرمة",
        "death_place": "المدينة المنورة",
        "timeline_events": [
            {"year": 634, "title": "تولي الخلافة", "description": "تولي الخلافة بعد وفاة أبي بكر"},
            {"year": 637, "title": "فتح القدس", "description": "فتح مدينة القدس"},
            {"year": 638, "title": "تأسيس التقويم الهجري", "description": "إنشاء التقويم الإسلامي"}
        ]
    }
]

categories = [
    {"id": 1, "name": "الخلفاء الراشدون", "description": "خلفاء رسول الله الأربعة", "count": 4, "icon": "👑"},
    {"id": 2, "name": "العشرة المبشرون بالجنة", "description": "الصحابة الذين بشرهم النبي بالجنة", "count": 10, "icon": "🏆"},
    {"id": 3, "name": "أمهات المؤمنين", "description": "زوجات رسول الله الطاهرات", "count": 11, "icon": "🌹"},
    {"id": 4, "name": "الصحابة", "description": "companions of the Prophet", "count": 100, "icon": "👥"},
    {"id": 5, "name": "التابعون", "description": "الذين لقوا الصحابة", "count": 200, "icon": "📚"}
]

@router.get("/")
async def get_characters():
    return characters

@router.get("/categories")
async def get_categories():
    return categories

@router.get("/{character_id}")
async def get_character(character_id: int):
    if character_id < 1 or character_id > len(characters):
        raise HTTPException(status_code=404, detail="Character not found")
    return characters[character_id - 1]
