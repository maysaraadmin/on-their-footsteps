"""
Script to add sample character data for testing
"""

from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.models import IslamicCharacter

def add_sample_characters():
    """Add sample Islamic characters to the database"""
    db = next(get_db())
    
    sample_characters = [
        {
            "name": "Prophet Muhammad",
            "arabic_name": "محمد بن عبد الله",
            "title": "The Final Prophet",
            "description": "The final prophet and messenger of Islam",
            "birth_year": 570,
            "death_year": 632,
            "era": "عصر النبوة",
            "category": "الأنبياء",
            "sub_category": "نبي",
            "slug": "muhammad",
            "full_story": "The story of Prophet Muhammad (peace be upon him) is the story of the final messenger of Allah...",
            "key_achievements": ["Received the final revelation", "Established the first Islamic state", "United the Arabian tribes"],
            "lessons": ["Patience in adversity", "Trust in Allah", "Importance of community"],
            "quotes": ["The best among you are those who learn the Quran and teach it"],
            "profile_image": "/images/prophet_muhammad.jpg",
            "views_count": 1000,
            "likes_count": 500,
            "is_featured": True,
            "is_verified": True
        },
        {
            "name": "Abu Bakr",
            "arabic_name": "أبو بكر الصديق",
            "title": "The First Caliph",
            "description": "The first caliph and closest companion of Prophet Muhammad",
            "birth_year": 573,
            "death_year": 634,
            "era": "الخلافة الراشدة",
            "category": "الصحابة",
            "sub_category": "خليفة",
            "slug": "abu-bakr",
            "full_story": "Abu Bakr was the first male to accept Islam and was the closest companion to the Prophet...",
            "key_achievements": ["First Caliph of Islam", "Preserved the Quran", "Conquered Persia"],
            "lessons": ["Loyalty to the truth", "Sacrifice for the community", "Wisdom in leadership"],
            "quotes": ["I have not given up any good thing except that I have replaced it with something better"],
            "profile_image": "/images/abu_bakr.jpg",
            "views_count": 800,
            "likes_count": 400,
            "is_featured": True,
            "is_verified": True
        },
        {
            "name": "Umar ibn al-Khattab",
            "arabic_name": "عمر بن الخطاب",
            "title": "The Second Caliph",
            "description": "The second caliph known for his justice and administrative reforms",
            "birth_year": 584,
            "death_year": 644,
            "era": "الخلافة الراشدة",
            "category": "الصحابة",
            "sub_category": "خليفة",
            "slug": "umar",
            "full_story": "Umar ibn al-Khattab was known for his strong character and justice...",
            "key_achievements": ["Established Islamic calendar", "Expanded Islamic empire", "Created administrative system"],
            "lessons": ["Justice for all", "Accountability in leadership", "Mercy with the weak"],
            "quotes": ["If a mule stumbles in Iraq, I fear Allah will ask me why I didn't pave the road for it"],
            "profile_image": "/images/umar.jpg",
            "views_count": 900,
            "likes_count": 450,
            "is_featured": True,
            "is_verified": True
        }
    ]
    
    try:
        for char_data in sample_characters:
            # Check if character already exists
            existing = db.query(IslamicCharacter).filter(
                IslamicCharacter.slug == char_data["slug"]
            ).first()
            
            if not existing:
                character = IslamicCharacter(**char_data)
                db.add(character)
                print(f"Added character: {char_data['name']}")
            else:
                print(f"Character already exists: {char_data['name']}")
        
        db.commit()
        print("Sample data added successfully!")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_characters()
