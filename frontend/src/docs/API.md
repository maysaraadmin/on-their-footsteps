# API Documentation

## Overview

This document provides comprehensive documentation for the Islamic Characters application API. The API follows RESTful principles and provides endpoints for managing Islamic educational content.

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.on-their-footsteps.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  cached?: boolean;
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes and detailed error messages:

```typescript
interface ApiError {
  status: number;
  message: string;
  details?: any;
  code?: string;
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Search endpoints: 10 requests per minute
- Content endpoints: 60 requests per minute
- Admin endpoints: 30 requests per minute

## Endpoints

### Characters

#### Get All Characters
```http
GET /characters
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category
- `era` (string): Filter by era
- `sort` (string): Sort field (name, birth_year, views_count)
- `order` (string): Sort order (asc, desc)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Prophet Muhammad",
      "arabic_name": "محمد بن عبد الله",
      "category": "الأنبياء",
      "birth_year": 570,
      "death_year": 632,
      "description": "The final prophet of Islam",
      "profile_image": "/images/prophet_muhammad.jpg",
      "views_count": 1250,
      "likes_count": 89,
      "is_featured": true,
      "is_verified": true
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 20
}
```

#### Get Character by ID
```http
GET /characters/{id}
```

**Path Parameters:**
- `id` (number): Character ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Prophet Muhammad",
    "arabic_name": "محمد بن عبد الله",
    "title": "The Messenger of Allah",
    "category": "الأنبياء",
    "era": "7th Century",
    "description": "The final prophet of Islam...",
    "full_story": "Prophet Muhammad (peace be upon him) was born...",
    "birth_year": 570,
    "death_year": 632,
    "birth_place": "Mecca",
    "death_place": "Medina",
    "key_achievements": [
      "Received the first revelation",
      "Established the first Muslim community",
      "Compiled the Quran"
    ],
    "lessons": [
      "Patience in adversity",
      "Trust in Allah",
    ],
    "quotes": [
      "Seek knowledge from the cradle to the grave",
      "The best among you are those who learn the Quran and teach it"
    ],
    "timeline_events": [
      {
        "year": 570,
        "title": "Birth",
        "description": "Born in Mecca",
        "type": "birth"
      },
      {
        "year": 610,
        "title": "First Revelation",
        "description": "Received first revelation from Allah",
        "type": "achievement"
      }
    ],
    "profile_image": "/images/prophet_muhammad.jpg",
    "gallery": [
      "/images/prophet_muhammad_1.jpg",
      "/images/prophet_muhammad_2.jpg"
    ],
    "views_count": 1250,
    "likes_count": 89,
    "shares_count": 23,
    "is_featured": true,
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

#### Search Characters
```http
GET /content/search
```

**Query Parameters:**
- `q` (string, required): Search query (min 2 characters)
- `category` (string): Filter by category
- `era` (string): Filter by era
- `limit` (number): Maximum results (default: 20, max: 100)
- `offset` (number): Results offset (default: 0)

**Response:**
```json
{
  "data": {
    "results": [
      {
        "id": 1,
        "name": "Prophet Muhammad",
        "arabic_name": "محمد بن عبد الله",
        "category": "الأنبياء",
        "description": "The final prophet of Islam",
        "relevance_score": 0.95
      }
    ],
    "total": 1,
    "query": "Muhammad",
    "took": 45
  }
}
```

### Categories

#### Get All Categories
```http
GET /content/categories
```

**Response:**
```json
{
  "data": [
    "الأنبياء",
    "الصحابة",
    "التابعون",
    "العلماء",
    "الخلفاء",
    "القادة",
    "الفقهاء",
    "المحدثون",
    "المفكرون"
  ]
}
```

#### Get Categories by Type
```http
GET /content/subcategories/{category}
```

**Path Parameters:**
- `category` (string): Category name

**Response:**
```json
{
  "data": [
    "الخلفاء الراشدون",
    "الخلفاء الأمويون",
    "الخلفاء العباسيون"
  ]
}
```

### Featured Content

#### Get Featured Characters
```http
GET /content/featured/general
```

**Query Parameters:**
- `limit` (number): Number of characters (default: 6)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Prophet Muhammad",
      "arabic_name": "محمد بن عبد الله",
      "category": "الأنبياء",
      "title": "The Messenger of Allah",
      "description": "The final prophet of Islam",
      "profile_image": "/images/prophet_muhammad.jpg",
      "views_count": 1250,
      "likes_count": 89,
      "is_featured": true
    }
  ]
}
```

#### Get Featured by Category
```http
GET /content/featured/{category}
```

**Path Parameters:**
- `category` (string): Category name

### Authentication

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "user123",
      "full_name": "John Doe",
      "preferred_language": "en",
      "level_id": 1,
      "total_xp": 150,
      "is_verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 1800
  }
}
```

#### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "user123",
  "password": "password123",
  "confirm_password": "password123",
  "full_name": "John Doe",
  "preferred_language": "en"
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <refresh-token>
```

#### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### User Progress

#### Get User Progress
```http
GET /progress/summary
```

**Response:**
```json
{
  "data": {
    "total_characters": 156,
    "completed_characters": 23,
    "total_time_spent": 1250,
    "current_streak": 7,
    "achievements": [
      {
        "id": 1,
        "name": "First Steps",
        "description": "Complete your first character",
        "icon": "/icons/first-steps.png",
        "unlocked_at": "2024-01-15T10:30:00Z"
      }
    ],
    "level": {
      "id": 2,
      "name": "Seeker",
      "xp_required": 500,
      "current_xp": 150,
      "next_level_xp": 350
    }
  }
}
```

#### Get Character Progress
```http
GET /progress/{character_id}
```

**Path Parameters:**
- `character_id` (number): Character ID

**Response:**
```json
{
  "data": {
    "character_id": 1,
    "completion_percentage": 75,
    "time_spent_minutes": 45,
    "is_bookmarked": true,
    "is_favorite": false,
    "last_position": {
      "chapter": 3,
      "section": "Early Life",
      "progress": 0.75
    },
    "achievements_unlocked": [1, 2, 3],
    "started_at": "2024-01-15T10:30:00Z",
    "last_accessed_at": "2024-01-20T14:45:00Z"
  }
}
```

#### Update Progress
```http
PUT /progress/{character_id}
```

**Request Body:**
```json
{
  "completion_percentage": 80,
  "time_spent_minutes": 50,
  "last_position": {
    "chapter": 4,
    "section": "Migration",
    "progress": 0.80
  },
  "is_bookmarked": true
}
```

### Admin Endpoints

#### Create Character
```http
POST /admin/characters
```

**Request Body:**
```json
{
  "name": "New Character",
  "arabic_name": "شخصية جديدة",
  "title": "Title",
  "category": "الصحابة",
  "era": "7th Century",
  "description": "Brief description",
  "full_story": "Complete story...",
  "birth_year": 600,
  "death_year": 700,
  "birth_place": "Mecca",
  "death_place": "Medina",
  "key_achievements": ["Achievement 1", "Achievement 2"],
  "lessons": ["Lesson 1", "Lesson 2"],
  "quotes": ["Quote 1", "Quote 2"],
  "profile_image": "/images/character.jpg",
  "is_featured": false,
  "is_verified": true
}
```

#### Update Character
```http
PUT /admin/characters/{id}
```

#### Delete Character
```http
DELETE /admin/characters/{id}
```

### Media

#### Upload Image
```http
POST /media/upload
```

**Request Body (multipart/form-data):**
- `file` (file): Image file
- `type` (string): Image type ('character', 'gallery', 'avatar')

**Response:**
```json
{
  "data": {
    "url": "/uploads/images/character_123.jpg",
    "filename": "character_123.jpg",
    "size": 1024000,
    "content_type": "image/jpeg"
  }
}
```

## Caching

The API implements intelligent caching with different TTL values:

- **Featured content**: 10 minutes
- **Categories**: 30 minutes
- **Character details**: 15 minutes
- **Search results**: 2 minutes
- **User profile**: 5 minutes

Cache headers are included in responses:
```
Cache-Control: public, max-age=600
ETag: "abc123"
Last-Modified: "Wed, 21 Oct 2015 07:28:00 GMT"
```

## WebSocket Events

Real-time events are available via WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

// Events:
// - character_updated
// - new_character_added
// - user_progress_updated
// - achievement_unlocked
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { characters, auth, progress } from '@/services/api';

// Get featured characters
const featured = await characters.getFeatured(6);

// Search characters
const results = await characters.search('Muhammad', {
  category: 'الأنبياء',
  limit: 10
});

// Login
const loginResult = await auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get progress
const progressData = await progress.getSummary();
```

### Python

```python
import requests

# Get featured characters
response = requests.get('http://localhost:8000/api/content/featured/general')
data = response.json()

# Search characters
params = {'q': 'Muhammad', 'category': 'الأنبياء'}
response = requests.get('http://localhost:8000/api/content/search', params=params)

# Login
login_data = {
    'email': 'user@example.com',
    'password': 'password'
}
response = requests.post('http://localhost:8000/api/auth/login', json=login_data)
```

## Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Validation Error | Invalid input data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server error |

## Testing

### Example Test Cases

```typescript
// Test character retrieval
describe('Character API', () => {
  it('should get featured characters', async () => {
    const response = await characters.getFeatured(6);
    expect(response.data).toHaveLength(6);
    expect(response.data[0]).toHaveProperty('id');
    expect(response.data[0]).toHaveProperty('name');
    expect(response.data[0]).toHaveProperty('arabic_name');
  });

  it('should search characters', async () => {
    const response = await characters.search('Muhammad');
    expect(response.data.results).toHaveLength.greaterThan(0);
    expect(response.data.results[0].name).toContain('Muhammad');
  });
});
```

## Best Practices

1. **Use appropriate HTTP methods**: GET for retrieval, POST for creation, PUT for updates, DELETE for removal
2. **Handle errors gracefully**: Always check response status and handle errors appropriately
3. **Implement retry logic**: Use exponential backoff for failed requests
4. **Cache responses**: Respect cache headers to reduce server load
5. **Validate input**: Always validate user input before sending to API
6. **Use pagination**: For large datasets, use pagination to limit response size
7. **Monitor rate limits**: Track API usage to avoid hitting rate limits
8. **Secure tokens**: Store JWT tokens securely and refresh them when needed

## Support

For API support and questions:
- Email: api-support@on-their-footsteps.com
- Documentation: https://docs.on-their-footsteps.com/api
- Status Page: https://status.on-their-footsteps.com
