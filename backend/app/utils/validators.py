"""Input validation and sanitization utilities for the Islamic Characters application."""

import re
import html
import bleach
from typing import Optional, List, Dict, Any
from datetime import datetime
from urllib.parse import urlparse

class ValidationError(Exception):
    """Custom validation error."""
    pass

class InputValidator:
    """Comprehensive input validation and sanitization."""
    
    # Allowed HTML tags for rich text content
    ALLOWED_HTML_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
        'a', 'span', 'div'
    ]
    
    # Allowed HTML attributes
    ALLOWED_HTML_ATTRIBUTES = {
        'a': ['href', 'title'],
        'span': ['class'],
        'div': ['class'],
        '*': ['class']
    }
    
    # Arabic text validation patterns
    ARABIC_TEXT_PATTERN = re.compile(r'^[\u0600-\u06FF\s\-\.\,\:\;\!\?\(\)\[\]\"\'\/\\]+$')
    ARABIC_NAME_PATTERN = re.compile(r'^[\u0600-\u06FF\s]+$')
    
    # English text validation patterns
    ENGLISH_TEXT_PATTERN = re.compile(r'^[a-zA-Z\s\-\.\,\:\;\!\?\(\)\[\]\"\'\/\\]+$')
    ENGLISH_NAME_PATTERN = re.compile(r'^[a-zA-Z\s]+$')
    
    # Islamic historical context patterns
    ISLAMIC_CATEGORIES = [
        "الأنبياء", "الصحابة", "التابعون", "العلماء", 
        "الخلفاء", "القادة", "الفقهاء", "المحدثون", "المفكرون"
    ]
    
    VALID_ERAS = [
        "Pre-Islamic", "Early Islam", "Rashidun Caliphate", "Umayyad Caliphate",
        "Abbasid Caliphate", "Ottoman Empire", "Modern Era", "7th Century",
        "8th Century", "9th Century", "10th Century", "11th Century",
        "12th Century", "13th Century", "14th Century", "15th Century"
    ]
    
    @classmethod
    def sanitize_text(cls, text: str, allow_html: bool = False) -> str:
        """
        Sanitize text input to prevent XSS and injection attacks.
        
        Args:
            text: Input text to sanitize
            allow_html: Whether to allow certain HTML tags
            
        Returns:
            Sanitized text
        """
        if not text:
            return ""
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        if allow_html:
            # Allow certain HTML tags but sanitize them
            text = bleach.clean(
                text,
                tags=cls.ALLOWED_HTML_TAGS,
                attributes=cls.ALLOWED_HTML_ATTRIBUTES,
                strip=True
            )
        else:
            # Escape all HTML
            text = html.escape(text)
        
        return text
    
    @classmethod
    def validate_name(cls, name: str, field_name: str = "Name") -> str:
        """
        Validate a name field (English or Arabic).
        
        Args:
            name: Name to validate
            field_name: Name of the field for error messages
            
        Returns:
            Sanitized name
            
        Raises:
            ValidationError: If validation fails
        """
        if not name:
            raise ValidationError(f"{field_name} is required")
        
        name = name.strip()
        
        if len(name) < 2:
            raise ValidationError(f"{field_name} must be at least 2 characters long")
        
        if len(name) > 200:
            raise ValidationError(f"{field_name} must be less than 200 characters")
        
        # Check if it's Arabic or English
        if cls.ARABIC_NAME_PATTERN.fullmatch(name):
            # Arabic name validation
            pass  # Already matched pattern
        elif cls.ENGLISH_NAME_PATTERN.fullmatch(name):
            # English name validation
            pass  # Already matched pattern
        else:
            # Mixed or invalid characters
            if any('\u0600' <= char <= '\u06FF' for char in name):
                # Contains Arabic characters, use Arabic pattern
                if not cls.ARABIC_TEXT_PATTERN.fullmatch(name):
                    raise ValidationError(f"{field_name} contains invalid characters for Arabic text")
            else:
                # Should be English
                if not cls.ENGLISH_TEXT_PATTERN.fullmatch(name):
                    raise ValidationError(f"{field_name} contains invalid characters")
        
        return cls.sanitize_text(name)
    
    @classmethod
    def validate_arabic_name(cls, arabic_name: str) -> str:
        """Validate Arabic name specifically."""
        return cls.validate_name(arabic_name, "Arabic name")
    
    @classmethod
    def validate_year(cls, year: Optional[int], field_name: str = "Year") -> Optional[int]:
        """
        Validate a year field within Islamic historical context.
        
        Args:
            year: Year to validate
            field_name: Name of the field for error messages
            
        Returns:
            Validated year or None
            
        Raises:
            ValidationError: If validation fails
        """
        if year is None:
            return None
        
        if not isinstance(year, int):
            raise ValidationError(f"{field_name} must be a valid number")
        
        # Islamic history range (500 CE to 1500 CE)
        if year < 500 or year > 1500:
            raise ValidationError(f"{field_name} must be between 500 and 1500 CE (Islamic history range)")
        
        return year
    
    @classmethod
    def validate_birth_death_years(cls, birth_year: Optional[int], death_year: Optional[int]) -> tuple:
        """
        Validate birth and death years together.
        
        Args:
            birth_year: Birth year
            death_year: Death year
            
        Returns:
            Tuple of validated (birth_year, death_year)
            
        Raises:
            ValidationError: If validation fails
        """
        birth_year = cls.validate_year(birth_year, "Birth year")
        death_year = cls.validate_year(death_year, "Death year")
        
        if birth_year and death_year and birth_year >= death_year:
            raise ValidationError("Death year must be after birth year")
        
        return birth_year, death_year
    
    @classmethod
    def validate_category(cls, category: str) -> str:
        """
        Validate character category.
        
        Args:
            category: Category to validate
            
        Returns:
            Validated category
            
        Raises:
            ValidationError: If validation fails
        """
        if not category:
            raise ValidationError("Category is required")
        
        category = category.strip()
        
        if category not in cls.ISLAMIC_CATEGORIES:
            raise ValidationError(f"Category must be one of: {', '.join(cls.ISLAMIC_CATEGORIES)}")
        
        return category
    
    @classmethod
    def validate_era(cls, era: Optional[str]) -> Optional[str]:
        """
        Validate historical era.
        
        Args:
            era: Era to validate
            
        Returns:
            Validated era or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not era:
            return None
        
        era = era.strip()
        
        if era not in cls.VALID_ERAS:
            raise ValidationError(f"Era must be one of: {', '.join(cls.VALID_ERAS)}")
        
        return era
    
    @classmethod
    def validate_slug(cls, slug: Optional[str]) -> Optional[str]:
        """
        Validate URL slug.
        
        Args:
            slug: Slug to validate
            
        Returns:
            Validated slug or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not slug:
            return None
        
        slug = slug.strip().lower()
        
        if len(slug) < 2:
            raise ValidationError("Slug must be at least 2 characters long")
        
        if len(slug) > 200:
            raise ValidationError("Slug must be less than 200 characters")
        
        # Check slug format (lowercase letters, numbers, and hyphens only)
        if not re.match(r'^[a-z0-9-]+$', slug):
            raise ValidationError("Slug must contain only lowercase letters, numbers, and hyphens")
        
        # Check for consecutive hyphens or leading/trailing hyphens
        if '--' in slug or slug.startswith('-') or slug.endswith('-'):
            raise ValidationError("Slug cannot have consecutive hyphens or start/end with hyphens")
        
        return slug
    
    @classmethod
    def generate_slug(cls, name: str) -> str:
        """
        Generate a URL-friendly slug from a name.
        
        Args:
            name: Name to generate slug from
            
        Returns:
            Generated slug
        """
        # Convert to lowercase and replace spaces with hyphens
        slug = name.lower().replace(' ', '-')
        
        # Remove invalid characters
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        
        # Remove consecutive hyphens
        slug = re.sub(r'-+', '-', slug)
        
        # Remove leading/trailing hyphens
        slug = slug.strip('-')
        
        # Ensure minimum length
        if len(slug) < 2:
            raise ValueError("Generated slug is too short")
        
        return slug
    
    @classmethod
    def validate_url(cls, url: Optional[str], field_name: str = "URL") -> Optional[str]:
        """
        Validate URL format.
        
        Args:
            url: URL to validate
            field_name: Name of the field for error messages
            
        Returns:
            Validated URL or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not url:
            return None
        
        url = url.strip()
        
        try:
            parsed = urlparse(url)
            
            if not parsed.scheme or not parsed.netloc:
                raise ValidationError(f"{field_name} must be a valid URL")
            
            # Only allow http and https schemes
            if parsed.scheme not in ['http', 'https']:
                raise ValidationError(f"{field_name} must use HTTP or HTTPS protocol")
            
            return url
            
        except Exception as e:
            raise ValidationError(f"{field_name} is not a valid URL")
    
    @classmethod
    def validate_image_url(cls, url: Optional[str]) -> Optional[str]:
        """
        Validate image URL specifically.
        
        Args:
            url: Image URL to validate
            
        Returns:
            Validated image URL or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not url:
            return None
        
        url = cls.validate_url(url, "Image URL")
        
        # Check for common image file extensions
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        parsed = urlparse(url)
        
        if not any(parsed.path.lower().endswith(ext) for ext in image_extensions):
            raise ValidationError("Image URL must end with a valid image extension (.jpg, .png, .gif, .webp, .svg)")
        
        return url
    
    @classmethod
    def validate_json_list(cls, data: Any, field_name: str = "JSON list") -> List[str]:
        """
        Validate and sanitize JSON list data.
        
        Args:
            data: Data to validate
            field_name: Name of the field for error messages
            
        Returns:
            Validated list of strings
            
        Raises:
            ValidationError: If validation fails
        """
        if data is None:
            return []
        
        if not isinstance(data, list):
            raise ValidationError(f"{field_name} must be a list")
        
        validated_list = []
        for i, item in enumerate(data):
            if not isinstance(item, str):
                raise ValidationError(f"{field_name} item {i+1} must be a string")
            
            # Sanitize each item
            sanitized_item = cls.sanitize_text(item)
            if sanitized_item:  # Only add non-empty items
                validated_list.append(sanitized_item)
        
        return validated_list
    
    @classmethod
    def validate_description(cls, description: Optional[str], allow_html: bool = False) -> Optional[str]:
        """
        Validate description text.
        
        Args:
            description: Description to validate
            allow_html: Whether to allow HTML tags
            
        Returns:
            Validated description or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not description:
            return None
        
        description = description.strip()
        
        if len(description) < 10:
            raise ValidationError("Description must be at least 10 characters long")
        
        if len(description) > 5000:
            raise ValidationError("Description must be less than 5000 characters")
        
        return cls.sanitize_text(description, allow_html)
    
    @classmethod
    def validate_full_story(cls, story: Optional[str], allow_html: bool = True) -> Optional[str]:
        """
        Validate full story text.
        
        Args:
            story: Story to validate
            allow_html: Whether to allow HTML tags
            
        Returns:
            Validated story or None
            
        Raises:
            ValidationError: If validation fails
        """
        if not story:
            return None
        
        story = story.strip()
        
        if len(story) < 50:
            raise ValidationError("Full story must be at least 50 characters long")
        
        if len(story) > 50000:
            raise ValidationError("Full story must be less than 50000 characters")
        
        return cls.sanitize_text(story, allow_html)
    
    @classmethod
    def validate_character_data(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive character data validation.
        
        Args:
            data: Character data dictionary
            
        Returns:
            Validated and sanitized character data
            
        Raises:
            ValidationError: If validation fails
        """
        validated_data = {}
        
        # Required fields
        validated_data['name'] = cls.validate_name(data.get('name', ''))
        validated_data['arabic_name'] = cls.validate_arabic_name(data.get('arabic_name', ''))
        validated_data['category'] = cls.validate_category(data.get('category', ''))
        
        # Optional fields
        validated_data['english_name'] = cls.validate_name(data.get('english_name', ''), "English name") if data.get('english_name') else None
        validated_data['title'] = cls.sanitize_text(data.get('title', '')) if data.get('title') else None
        validated_data['description'] = cls.validate_description(data.get('description')) if data.get('description') else None
        validated_data['full_story'] = cls.validate_full_story(data.get('full_story')) if data.get('full_story') else None
        
        # Birth and death years
        birth_year = data.get('birth_year')
        death_year = data.get('death_year')
        validated_data['birth_year'], validated_data['death_year'] = cls.validate_birth_death_years(
            birth_year, death_year
        )
        
        # Other fields
        validated_data['era'] = cls.validate_era(data.get('era')) if data.get('era') else None
        validated_data['sub_category'] = cls.sanitize_text(data.get('sub_category', '')) if data.get('sub_category') else None
        validated_data['slug'] = cls.validate_slug(data.get('slug')) if data.get('slug') else cls.generate_slug(validated_data['name'])
        validated_data['birth_place'] = cls.sanitize_text(data.get('birth_place', '')) if data.get('birth_place') else None
        validated_data['death_place'] = cls.sanitize_text(data.get('death_place', '')) if data.get('death_place') else None
        
        # Media URLs
        validated_data['profile_image'] = cls.validate_image_url(data.get('profile_image')) if data.get('profile_image') else None
        
        # JSON lists
        validated_data['key_achievements'] = cls.validate_json_list(data.get('key_achievements', []), "Key achievements")
        validated_data['lessons'] = cls.validate_json_list(data.get('lessons', []), "Lessons")
        validated_data['quotes'] = cls.validate_json_list(data.get('quotes', []), "Quotes")
        validated_data['gallery'] = [cls.validate_image_url(url) for url in cls.validate_json_list(data.get('gallery', []), "Gallery")]
        validated_data['locations'] = cls.validate_json_list(data.get('locations', []), "Locations")
        
        # Boolean fields
        validated_data['is_featured'] = bool(data.get('is_featured', False))
        validated_data['is_verified'] = bool(data.get('is_verified', False))
        
        # Verification fields
        validated_data['verification_source'] = cls.sanitize_text(data.get('verification_source', '')) if data.get('verification_source') else None
        validated_data['verification_notes'] = cls.validate_description(data.get('verification_notes')) if data.get('verification_notes') else None
        
        return validated_data

class SearchValidator:
    """Search query validation."""
    
    @classmethod
    def validate_search_query(cls, query: str) -> str:
        """
        Validate and sanitize search query.
        
        Args:
            query: Search query to validate
            
        Returns:
            Sanitized search query
            
        Raises:
            ValidationError: If validation fails
        """
        if not query:
            raise ValidationError("Search query is required")
        
        query = query.strip()
        
        if len(query) < 2:
            raise ValidationError("Search query must be at least 2 characters long")
        
        if len(query) > 100:
            raise ValidationError("Search query must be less than 100 characters")
        
        # Remove potentially dangerous characters
        query = re.sub(r'[<>"\'&]', '', query)
        
        return query
    
    @classmethod
    def validate_pagination(cls, limit: int, offset: int) -> tuple:
        """
        Validate pagination parameters.
        
        Args:
            limit: Number of results per page
            offset: Number of results to skip
            
        Returns:
            Tuple of validated (limit, offset)
            
        Raises:
            ValidationError: If validation fails
        """
        if not isinstance(limit, int) or limit < 1:
            raise ValidationError("Limit must be a positive integer")
        
        if limit > 100:
            raise ValidationError("Limit cannot exceed 100")
        
        if not isinstance(offset, int) or offset < 0:
            raise ValidationError("Offset must be a non-negative integer")
        
        return limit, offset