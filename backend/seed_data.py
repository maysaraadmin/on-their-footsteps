#!/usr/bin/env python3
"""
Seed data script for the Islamic Characters application
Run this script to populate the database with sample characters
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db, engine
from app.models import IslamicCharacter
from sqlalchemy.orm import Session
import json

def seed_characters():
    """Seed the database with sample Islamic characters"""
    
    # Sample character data
    characters_data = [
        {
            "name": "Prophet Muhammad",
            "arabic_name": "محمد بن عبد الله",
            "title": "The Messenger of Allah",
            "category": "الأنبياء",
            "era": "7th Century",
            "description": "The final prophet of Islam, born in Mecca in 570 CE.",
            "full_story": "Prophet Muhammad (peace be upon him) was born in Mecca in the year 570 CE. He received his first revelation from Allah at the age of 40 through the angel Gabriel. He spent the rest of his life preaching the message of Islam and establishing the first Muslim community in Medina.",
            "birth_year": 570,
            "death_year": 632,
            "birth_place": "Mecca",
            "slug": "prophet-muhammad",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/prophet_muhammad.jpg"
        },
        {
            "name": "Abu Bakr",
            "arabic_name": "أبو بكر الصديق",
            "title": "First Caliph",
            "category": "الصحابة",
            "era": "7th Century",
            "description": "The first Caliph and closest companion of Prophet Muhammad.",
            "full_story": "Abu Bakr (may Allah be pleased with him) was the closest companion of Prophet Muhammad and the first Caliph of Islam. He was known for his wisdom, piety, and unwavering faith. He played a crucial role in the early spread of Islam and compiled the Quran into a single volume.",
            "birth_year": 573,
            "death_year": 634,
            "birth_place": "Mecca",
            "slug": "abu-bakr",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/abu_bakr.jpg"
        },
        {
            "name": "Umar ibn Khattab",
            "arabic_name": "عمر بن الخطاب",
            "title": "Second Caliph",
            "category": "الصحابة",
            "era": "7th Century",
            "description": "The second Caliph known for his justice and administrative skills.",
            "full_story": "Umar ibn Khattab (may Allah be pleased with him) was the second Caliph of Islam. He was known for his strong character, justice, and brilliant administrative skills. During his caliphate, the Islamic empire expanded significantly, and he established many institutions that served as foundations for Islamic governance.",
            "birth_year": 584,
            "death_year": 644,
            "birth_place": "Mecca",
            "slug": "umar-ibn-khattab",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/umar_ibn_khattab.jpg"
        },
        {
            "name": "Uthman ibn Affan",
            "arabic_name": "عثمان بن عفان",
            "title": "Third Caliph",
            "category": "الصحابة",
            "era": "7th Century",
            "description": "The third Caliph known for his generosity and compiling the Quran.",
            "full_story": "Uthman ibn Affan (may Allah be pleased with him) was the third Caliph of Islam. He was known for his exceptional generosity and was called 'Ghani' (the generous one). He played a crucial role in standardizing the written text of the Quran and distributing copies throughout the Islamic world.",
            "birth_year": 579,
            "death_year": 656,
            "birth_place": "Mecca",
            "slug": "uthman-ibn-affan",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/uthman_ibn_affan.jpg"
        },
        {
            "name": "Ali ibn Abi Talib",
            "arabic_name": "علي بن أبي طالب",
            "title": "Fourth Caliph",
            "category": "الصحابة",
            "era": "7th Century",
            "description": "The fourth Caliph and cousin of Prophet Muhammad.",
            "full_story": "Ali ibn Abi Talib (may Allah be pleased with him) was the cousin and son-in-law of Prophet Muhammad. He was the fourth Caliph and is known for his profound knowledge, bravery, and piety. He was also the first male to accept Islam and compiled the Quran during his caliphate.",
            "birth_year": 600,
            "death_year": 661,
            "birth_place": "Mecca",
            "slug": "ali-ibn-abi-talib",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/ali_ibn_abi_talib.jpg"
        },
        {
            "name": "Aisha bint Abu Bakr",
            "arabic_name": "عائشة بنت أبي بكر",
            "title": "Mother of the Believers",
            "category": "الصحابة",
            "era": "7th Century",
            "description": "Wife of Prophet Muhammad and renowned scholar of Islam.",
            "full_story": "Aisha bint Abu Bakr (may Allah be pleased with her) was one of the wives of Prophet Muhammad and was known as 'Mother of the Believers'. She was a renowned scholar of Islam who transmitted over 2,000 hadiths and played a significant role in preserving Islamic knowledge.",
            "birth_year": 613,
            "death_year": 678,
            "birth_place": "Mecca",
            "slug": "aisha-bint-abu-bakr",
            "is_featured": True,
            "is_verified": True,
            "views_count": 0,
            "likes_count": 0,
            "profile_image": "/images/aisha.jpg"
        }
    ]
    
    # Create database session
    db: Session = next(get_db())
    
    try:
        # Clear existing characters (optional)
        print("Clearing existing characters...")
        db.query(IslamicCharacter).delete()
        db.commit()
        
        # Add new characters
        print("Adding sample characters...")
        for char_data in characters_data:
            character = IslamicCharacter(**char_data)
            db.add(character)
            print(f"Added: {character.name}")
        
        db.commit()
        print(f"\nSuccessfully added {len(characters_data)} characters to the database!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Seeding Islamic characters data...")
    seed_characters()
    print("Done!")
