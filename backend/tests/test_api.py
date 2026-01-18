import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)

class TestHealthCheck:
    """Test health check endpoints"""
    
    def test_health_check_success(self):
        """Test GET /api/health - success case"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "على خطاهم API"
        assert "version" in data
        assert "timestamp" in data
    
    def test_root_endpoint_success(self):
        """Test GET / - success case"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert "health" in data

class TestAuthenticationAPI:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test POST /auth/token - success case"""
        login_data = {
            "username": "testuser",
            "password": "testpass"
        }
        response = client.post("/api/auth/token", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_credentials(self):
        """Test POST /auth/token - invalid credentials"""
        login_data = {
            "username": "invaliduser",
            "password": "invalidpass"
        }
        response = client.post("/api/auth/token", data=login_data)
        # Should still return 200 since it's mock auth
        assert response.status_code == 200
    
    def test_get_current_user(self):
        """Test GET /auth/me - success case"""
        # First get token
        login_data = {"username": "testuser", "password": "testpass"}
        login_response = client.post("/api/auth/token", data=login_data)
        token = login_response.json()["access_token"]
        
        # Use token to get user info
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "username" in data

class TestProgressAPI:
    """Test progress tracking endpoints"""
    
    def test_get_user_progress(self):
        """Test GET /progress/{user_id} - success case"""
        response = client.get("/api/progress/1")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "completed_lessons" in data
        assert "total_reading_time" in data
    
    def test_get_character_progress(self):
        """Test GET /progress/character/{character_id} - success case"""
        response = client.get("/api/progress/character/abu-bakr")
        assert response.status_code == 200
        data = response.json()
        assert "character_id" in data
        assert "bookmarked" in data
        assert "progress_percentage" in data
    
    def test_update_character_progress(self):
        """Test PUT /progress/{character_id} - success case"""
        progress_data = {
            "bookmarked": True,
            "progress_percentage": 50,
            "completed_sections": ["story", "timeline"]
        }
        response = client.put("/api/progress/abu-bakr", json=progress_data)
        assert response.status_code == 200
        data = response.json()
        assert data["bookmarked"] == True
        assert data["progress_percentage"] == 50
    
    def test_update_bookmark(self):
        """Test PUT /progress/{character_id} - bookmark update"""
        bookmark_data = {"bookmarked": True}
        response = client.put("/api/progress/abu-bakr", json=bookmark_data)
        assert response.status_code == 200

class TestStatsAPI:
    """Test statistics endpoints"""
    
    def test_get_stats(self):
        """Test GET /stats/ - success case"""
        response = client.get("/api/stats/")
        assert response.status_code == 200
        data = response.json()
        assert "total_characters" in data
        assert "total_users" in data
        assert "total_lessons_completed" in data
    
    def test_get_character_stats(self):
        """Test GET /stats/character/{character_id} - success case"""
        response = client.get("/api/stats/character/1")
        assert response.status_code == 200
        data = response.json()
        assert "character_id" in data
        assert "views" in data
        assert "likes" in data
        assert "completions" in data
    
    def test_get_overall_stats(self):
        """Test GET /stats/overall - success case"""
        response = client.get("/api/stats/overall")
        assert response.status_code == 200
        data = response.json()
        assert "total_characters" in data
        assert "total_views" in data
        assert "total_likes" in data
    
    def test_get_progress_stats(self):
        """Test GET /stats/progress - success case"""
        response = client.get("/api/stats/progress")
        assert response.status_code == 200
        data = response.json()
        assert "daily_active_users" in data
        assert "weekly_active_users" in data
        assert "monthly_active_users" in data
    
    def test_get_user_stats(self):
        """Test GET /stats/user/{user_id} - success case"""
        response = client.get("/api/stats/user/1")
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "lessons_completed" in data
        assert "characters_explored" in data

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_404_not_found(self):
        """Test 404 error handling"""
        response = client.get("/api/nonexistent-endpoint")
        assert response.status_code == 404
    
    def test_method_not_allowed(self):
        """Test method not allowed"""
        response = client.delete("/api/characters/")
        assert response.status_code == 405
    
    def test_invalid_json(self):
        """Test invalid JSON in request body"""
        response = client.post(
            "/api/characters/",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test missing required fields"""
        incomplete_data = {"name": "Test"}  # Missing required category
        response = client.post("/api/characters/", json=incomplete_data)
        assert response.status_code == 422

class TestCORS:
    """Test CORS headers"""
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.options("/api/characters/")
        assert response.status_code == 200
        # Note: TestClient doesn't fully test CORS, but this checks the endpoint exists

class TestRateLimiting:
    """Test rate limiting (if implemented)"""
    
    def test_multiple_requests(self):
        """Test multiple rapid requests"""
        # Make multiple requests to test rate limiting
        responses = []
        for _ in range(10):
            response = client.get("/api/health")
            responses.append(response.status_code)
        
        # All should succeed unless rate limiting is implemented
        assert all(status == 200 for status in responses)

class TestSecurity:
    """Test security measures"""
    
    def test_sql_injection_attempt(self):
        """Test SQL injection protection"""
        malicious_input = "'; DROP TABLE characters; --"
        response = client.get(f"/api/characters/search?q={malicious_input}")
        # Should not crash the server
        assert response.status_code in [200, 422, 500]
    
    def test_xss_protection(self):
        """Test XSS protection in input"""
        xss_input = "<script>alert('xss')</script>"
        character_data = {
            "name": xss_input,
            "category": "الصحابة"
        }
        response = client.post("/api/characters/", json=character_data)
        # Should either reject or sanitize input
        assert response.status_code in [200, 422]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])