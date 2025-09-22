"""
Contract tests for GET /api/patterns/{pattern_id}/download endpoint
Tests PNG file download functionality
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_download_pattern_valid_id():
    """Test successful pattern download with valid pattern ID"""
    pattern_id = "pattern_123_0"
    
    response = client.get(f"/api/patterns/{pattern_id}/download")
    
    # Contract: Should return 200 with PNG binary data
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    
    # Validate PNG binary data (starts with PNG signature)
    content = response.content
    assert content.startswith(b'\x89PNG\r\n\x1a\n')
    assert len(content) > 0

def test_download_pattern_invalid_id():
    """Test 404 error for non-existent pattern ID"""
    pattern_id = "nonexistent_pattern"
    
    response = client.get(f"/api/patterns/{pattern_id}/download")
    
    # Contract: Should return 404 for non-existent pattern
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "message" in data
    assert data["error"] == "pattern_not_found"

def test_download_pattern_empty_id():
    """Test error handling for empty pattern ID"""
    response = client.get("/api/patterns//download")
    
    # Contract: Should return 404 for invalid route
    assert response.status_code == 404
