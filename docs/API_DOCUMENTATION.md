# 📚 على خطاهم - Comprehensive API Documentation

## Overview
The API provides comprehensive endpoints for managing Islamic characters, user progress, content, analytics, and recommendations.

## Base URL
```
http://localhost:8000/api
```

## Authentication
Most endpoints require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/token
Login user and receive access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### GET /auth/me
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "full_name": "Test User",
  "preferred_language": "ar"
}
```

---

## 👥 User Management Endpoints

### POST /users/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "full_name": "string",
  "preferred_language": "ar"
}
```

### GET /users/{user_id}/profile
Get public user profile.

**Response:**
```json
{
  "user_id": 1,
  "username": "testuser",
  "characters_completed": 5,
  "achievements": [...],
  "favorite_characters": [1, 2, 3]
}
```

### GET /users/{user_id}/achievements
Get user achievements and badges.

**Response:**
```json
{
  "total_achievements": 12,
  "unlocked_achievements": 8,
  "achievements": [
    {
      "id": 1,
      "name": "أول الخطوات",
      "description": "أكمل قراءة أول شخصية",
      "icon": "👣",
      "unlocked_at": "2024-01-01T10:00:00Z",
      "points": 10
    }
  ]
}
```

### GET /users/{user_id}/recommendations
Get personalized character recommendations.

**Query Parameters:**
- `limit` (optional): Maximum recommendations (default: 5, max: 20)

**Response:**
```json
{
  "recommendations": [
    {
      "character_id": 4,
      "name": "عثمان بن عفان",
      "reason": "بناءً على اهتمامك بالخلفاء الراشدين",
      "similarity_score": 0.9
    }
  ]
}
```

---

## 📖 Characters Endpoints

### GET /characters
Get all characters with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)
- `category` (optional): Filter by category
- `era` (optional): Filter by era
- `sort` (optional): Sort field (name, views, likes)

**Response:**
```json
{
  "characters": [...],
  "total": 25,
  "page": 1,
  "limit": 12,
  "total_pages": 3
}
```

### GET /characters/{character_id}
Get specific character by ID or slug.

**Path Parameters:**
- `character_id`: Character ID or slug (e.g., "abu-bakr")

**Response:**
```json
{
  "id": 2,
  "name": "أبو بكر الصديق",
  "arabic_name": "أَبُو بَكْرٍ الصِّدِّيق",
  "title": "الصديق والخليفة الأول",
  "description": "...",
  "birth_year": 573,
  "death_year": 634,
  "category": "الصحابة",
  "era": "الخلافة الراشدة",
  "full_story": "...",
  "key_achievements": [...],
  "lessons": [...],
  "timeline_events": [...],
  "profile_image": "/static/images/characters/abu_bakr_profile.jpg",
  "views_count": 12500,
  "likes_count": 9800
}
```

### GET /characters/featured
Get featured characters.

**Query Parameters:**
- `limit` (optional): Maximum results (default: 6, max: 20)

### GET /characters/search
Search characters by name, description, or content.

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category
- `limit` (optional): Maximum results (default: 20)

---

## 📚 Content Management Endpoints

### GET /content/categories
Get all character categories.

**Response:**
```json
["الأنبياء", "الصحابة", "التابعون", "العلماء"]
```

### GET /content/eras
Get all historical eras.

**Response:**
```json
["العصر النبوي", "الخلافة الراشدة", "العصر الأموي", "العصر العباسي"]
```

### GET /content/search
Advanced search across characters.

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category
- `era` (optional): Filter by era
- `limit` (optional): Maximum results (default: 20)
- `offset` (optional): Results offset (default: 0)

**Response:**
```json
{
  "results": [...],
  "total": 15,
  "offset": 0,
  "limit": 20
}
```

### GET /content/timeline/all
Get timeline events from all characters.

**Query Parameters:**
- `limit` (optional): Maximum events (default: 50, max: 200)

**Response:**
```json
[
  {
    "year": 610,
    "title": "الإسلام",
    "content": "أول من آمن برسول الله ﷺ من الرجال",
    "character_name": "أبو بكر الصديق",
    "character_id": 2
  }
]
```

### GET /content/quotes/random
Get random quotes from characters.

**Query Parameters:**
- `category` (optional): Filter by category
- `limit` (optional): Maximum quotes (default: 5, max: 20)

**Response:**
```json
[
  {
    "quote": "الضعيف فيكم قوي عندي حتى آخذ له حقه...",
    "character_name": "أبو بكر الصديق",
    "character_id": 2,
    "character_title": "الصديق والخليفة الأول"
  }
]
```

---

## 📊 User Progress Endpoints

### GET /progress/user/{user_id}
Get user's overall progress.

**Response:**
```json
{
  "user_id": 1,
  "total_characters_read": 8,
  "completion_rate": 0.75,
  "total_reading_time": 240,
  "current_streak": 5,
  "achievements_unlocked": 12
}
```

### GET /progress/character/{character_id}
Get progress for a specific character.

**Response:**
```json
{
  "character_id": "abu-bakr",
  "bookmarked": false,
  "completed_sections": [],
  "progress_percentage": 0,
  "last_accessed": null
}
```

### PUT /progress/character/{character_id}
Update character progress.

**Request Body:**
```json
{
  "bookmarked": true,
  "completed_sections": ["story", "timeline"],
  "progress_percentage": 50,
  "notes": "Interesting character..."
}
```

---

## 📈 Statistics Endpoints

### GET /stats/overall
Get overall application statistics.

**Response:**
```json
{
  "total_characters": 25,
  "total_users": 1250,
  "total_views": 37000,
  "total_likes": 20500,
  "total_bookmarks": 145
}
```

### GET /stats/character/{character_id}
Get statistics for a specific character.

**Response:**
```json
{
  "character_id": 2,
  "views": 15000,
  "likes": 8500,
  "completions": 120,
  "bookmarks": 45,
  "average_rating": 4.8
}
```

### GET /stats/user/{user_id}
Get statistics for a specific user.

**Response:**
```json
{
  "user_id": 1,
  "lessons_completed": 5,
  "characters_explored": 8,
  "current_streak": 3,
  "total_xp": 150
}
```

---

## 📸 Media Management Endpoints

### POST /media/upload/image
Upload image for character.

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP)
- `character_id` (optional): Character ID
- `image_type`: "profile" or "gallery"

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "file_path": "/static/uploads/images/uuid.jpg",
  "character_id": 2,
  "image_type": "profile"
}
```

### POST /media/upload/audio
Upload audio file for character.

**Request:** `multipart/form-data`
- `file`: Audio file (MP3, WAV, OGG)
- `character_id` (optional): Character ID
- `audio_type`: "story" or "quote"
- `title` (optional): Audio title

### GET /media/images/{character_id}
Get all images for a character.

**Response:**
```json
{
  "character_id": 2,
  "images": [
    {
      "type": "profile",
      "url": "/static/images/characters/abu_bakr_profile.jpg",
      "is_primary": true
    }
  ]
}
```

---

## 📊 Analytics Endpoints

### GET /analytics/dashboard
Get comprehensive analytics dashboard.

**Query Parameters:**
- `days` (optional): Time period in days (default: 30, max: 365)

**Response:**
```json
{
  "overview": {
    "total_users": 1250,
    "active_users": 890,
    "new_users": 45,
    "average_session_duration": 12.5
  },
  "content_metrics": {
    "total_characters_viewed": 156,
    "completion_rate": 0.68,
    "most_viewed_characters": [...]
  },
  "user_engagement": {
    "bookmarks_created": 234,
    "notes_added": 89,
    "achievements_unlocked": 156
  }
}
```

### GET /analytics/user-behavior
Get user behavior analytics.

**Query Parameters:**
- `days` (optional): Analysis period (default: 7, max: 90)

**Response:**
```json
{
  "reading_patterns": {
    "peak_reading_hours": [19, 20, 21, 14, 15],
    "average_session_length": 12.5,
    "device_distribution": {
      "mobile": 0.65,
      "desktop": 0.30,
      "tablet": 0.05
    }
  },
  "content_preferences": {
    "preferred_categories": [...],
    "content_format_preference": {...}
  }
}
```

### GET /analytics/real-time
Get real-time analytics.

**Response:**
```json
{
  "current_stats": {
    "active_users": 45,
    "online_users": 12,
    "pages_being_read": [...]
  },
  "recent_activity": [...],
  "system_health": {...}
}
```

---

## 🎯 Recommendations Endpoints

### GET /recommendations/for-user/{user_id}
Get personalized recommendations for a user.

**Query Parameters:**
- `limit` (optional): Maximum recommendations (default: 10, max: 50)
- `algorithm` (optional): "collaborative", "content", or "hybrid" (default: "collaborative")

**Response:**
```json
{
  "user_id": 1,
  "algorithm_used": "collaborative",
  "recommendations": [
    {
      "character_id": 4,
      "name": "عثمان بن عفان",
      "similarity_score": 0.92,
      "reason": "بناءً على اهتمامك بالخلفاء الراشدين",
      "confidence": 0.88,
      "estimated_reading_time": 15
    }
  ]
}
```

### GET /recommendations/similar/{character_id}
Get characters similar to a specific character.

**Query Parameters:**
- `limit` (optional): Maximum results (default: 5, max: 20)
- `similarity_type` (optional): "content", "category", "era", or "relationships" (default: "content")

### GET /recommendations/trending
Get trending characters based on recent activity.

**Query Parameters:**
- `time_period` (optional): "day", "week", "month", or "year" (default: "week")
- `category` (optional): Filter by category
- `limit` (optional): Maximum results (default: 10, max: 50)

### GET /recommendations/learning-path
Get recommended learning paths.

**Query Parameters:**
- `user_id` (required): User ID
- `goal` (optional): "comprehensive", "scholar", "spiritual", or "historical" (default: "comprehensive")
- `current_level` (optional): "beginner", "intermediate", or "advanced" (default: "beginner")

---

## 🔍 Search and Filtering

### Advanced Search
Use the `/content/search` endpoint for comprehensive search with multiple filters.

### Pagination
Most list endpoints support pagination with `page`, `limit`, and `offset` parameters.

### Sorting
Available sort options include:
- `name`: Alphabetical by name
- `views`: Most viewed
- `likes`: Most liked
- `created`: Recently added
- `updated`: Recently updated

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "detail": "Error message description",
  "status_code": 400,
  "error_type": "validation_error"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## 📝 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

---

## 🌐 Internationalization

The API supports multiple languages. Use the `Accept-Language` header:
```
Accept-Language: ar, en, fr
```

Responses will be localized based on user preferences when available.

---

## 📖 Interactive Documentation

Visit `/api/docs` for interactive Swagger documentation.
Visit `/api/redoc` for ReDoc documentation.

---

## 🔧 Development

### Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=your-secret-key
UPLOAD_DIR=static/uploads
CORS_ORIGINS=http://localhost:3000
```

### Running Locally
```bash
# Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm run dev
```

---

## 📞 Support

For API support and questions:
- Documentation: `/api/docs`
- Health Check: `/api/health`
- Email: support@on-their-footsteps.com
