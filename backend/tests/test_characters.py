import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.models import IslamicCharacter

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestCharactersAPI:
    """Test suite for Characters API endpoints"""
    
    def setup_method(self):
        """Setup test data before each test"""
        db = TestingSessionLocal()
        # Create test character
        test_character = IslamicCharacter(
            name="Test Character",
            arabic_name="شخصية اختبار",
            title="Test Title",
            description="Test description",
            category="الصحابة",
            era="العصر الراشدي",
            birth_year=600,
            death_year=650,
            birth_place="Test City",
            death_place="Test City",
            views_count=100,
            likes_count=50
        )
        db.add(test_character)
        db.commit()
        db.refresh(test_character)
        self.test_character_id = test_character.id
        db.close()
    
    def teardown_method(self):
        """Clean up test data after each test"""
        db = TestingSessionLocal()
        db.query(IslamicCharacter).delete()
        db.commit()
        db.close()
    
    def test_get_characters_success(self):
        """Test GET /characters/ - success case"""
        response = client.get("/api/characters/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == "Test Character"
    
    def test_get_characters_with_pagination(self):
        """Test GET /characters/ with pagination"""
        response = client.get("/api/characters/?page=1&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_characters_with_filters(self):
        """Test GET /characters/ with category and era filters"""
        response = client.get("/api/characters/?category=الصحابة&era=العصر الراشدي")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:  # If any results returned
            assert data[0]["category"] == "الصحابة"
            assert data[0]["era"] == "العصر الراشدي"
    
    def test_get_character_by_id_success(self):
        """Test GET /characters/{id} - success case"""
        response = client.get(f"/api/characters/{self.test_character_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Character"
        assert data["id"] == self.test_character_id
    
    def test_get_character_by_slug_success(self):
        """Test GET /characters/{slug} - success case"""
        # This would require slug mapping in the database
        response = client.get("/api/characters/test-character")
        # Should return 404 since test-character slug doesn't exist
        assert response.status_code in [200, 404]
    
    def test_get_character_not_found(self):
        """Test GET /characters/{id} - not found case"""
        response = client.get("/api/characters/99999")
        assert response.status_code == 404
        assert "Character not found" in response.json()["detail"]
    
    def test_get_character_invalid_id(self):
        """Test GET /characters/{id} - invalid ID"""
        response = client.get("/api/characters/invalid")
        assert response.status_code == 500  # Will try to convert to int and fail
    
    def test_search_characters_success(self):
        """Test GET /characters/search - success case"""
        response = client.get("/api/characters/search?q=Test")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_characters_short_query(self):
        """Test GET /characters/search - query too short"""
        response = client.get("/api/characters/search?q=a")
        assert response.status_code == 422  # Validation error
    
    def test_search_characters_with_category_filter(self):
        """Test GET /characters/search with category filter"""
        response = client.get("/api/characters/search?q=Test&category=الصحابة")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_character_success(self):
        """Test POST /characters/ - success case"""
        character_data = {
            "name": "New Character",
            "arabic_name": "شخصية جديدة",
            "title": "New Title",
            "description": "New description",
            "category": "الأنبياء",
            "era": "العصر النبوي",
            "full_story": "Full story here...",
            "key_achievements": ["Achievement 1"],
            "lessons": ["Lesson 1"],
            "quotes": ["Quote 1"],
            "timeline_events": [{"year": 600, "title": "Event", "description": "Description"}]
        }
        response = client.post("/api/characters/", json=character_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Character"
        assert data["id"] is not None
    
    def test_create_character_validation_error(self):
        """Test POST /characters/ - validation error"""
        invalid_data = {
            "name": "",  # Empty name should fail validation
            "category": "الصحابة"
        }
        response = client.post("/api/characters/", json=invalid_data)
        assert response.status_code == 422
    
    def test_update_character_success(self):
        """Test PUT /characters/{id} - success case"""
        update_data = {
            "name": "Updated Character",
            "arabic_name": "شخصية محدثة",
            "title": "Updated Title",
            "description": "Updated description",
            "category": "الصحابة",
            "era": "العصر الراشدي",
            "full_story": "Updated full story..."
        }
        response = client.put(f"/api/characters/{self.test_character_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Character"
    
    def test_update_character_not_found(self):
        """Test PUT /characters/{id} - not found case"""
        update_data = {
            "name": "Updated Character",
            "category": "الصحابة"
        }
        response = client.put("/api/characters/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_character_success(self):
        """Test DELETE /characters/{id} - success case"""
        response = client.delete(f"/api/characters/{self.test_character_id}")
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
        
        # Verify deletion
        response = client.get(f"/api/characters/{self.test_character_id}")
        assert response.status_code == 404
    
    def test_delete_character_not_found(self):
        """Test DELETE /characters/{id} - not found case"""
        response = client.delete("/api/characters/99999")
        assert response.status_code == 404

class TestCharacterDataValidation:
    """Test data validation and edge cases"""
    
    def test_character_name_max_length(self):
        """Test character name length validation"""
        long_name = "a" * 201  # Exceeds max length of 200
        character_data = {
            "name": long_name,
            "category": "الصحابة"
        }
        response = client.post("/api/characters/", json=character_data)
        assert response.status_code == 422
    
    def test_character_valid_categories(self):
        """Test only valid categories are accepted"""
        invalid_data = {
            "name": "Test",
            "category": "Invalid Category"
        }
        response = client.post("/api/characters/", json=invalid_data)
        assert response.status_code == 422
    
    def test_character_valid_eras(self):
        """Test only valid eras are accepted"""
        invalid_data = {
            "name": "Test",
            "category": "الصحابة",
            "era": "Invalid Era"
        }
        response = client.post("/api/characters/", json=invalid_data)
        assert response.status_code == 422

class TestCharacterPerformance:
    """Test performance and load handling"""
    
    def test_pagination_performance(self):
        """Test pagination doesn't load all records"""
        # This would require creating many test records
        # For now, just test the pagination parameters work
        response = client.get("/api/characters/?page=1&limit=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 1
    
    def test_search_performance(self):
        """Test search with limit works"""
        response = client.get("/api/characters/search?q=Test&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

if __name__ == "__main__":
    pytest.main([__file__, "-v"])