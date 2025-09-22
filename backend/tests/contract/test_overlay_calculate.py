"""
Contract tests for POST /api/overlay/calculate endpoint
Tests overlay dimension calculation functionality
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_overlay_calculate_valid_request():
    """Test successful overlay calculation with valid parameters"""
    request_data = {
        "image_id": "img_uuid_123",
        "pattern_id": "pattern_123_0",
        "overlay_state": {
            "left": 100,
            "top": 100,
            "scaleX": 1.5,
            "scaleY": 1.5
        }
    }
    
    response = client.post("/api/overlay/calculate", json=request_data)
    
    # Contract: Should return 200 with dimension calculations
    assert response.status_code == 200
    data = response.json()
    
    # Validate response structure
    assert "physical_dimensions" in data
    assert "visual_dimensions" in data
    
    physical = data["physical_dimensions"]
    visual = data["visual_dimensions"]
    
    # Validate physical dimensions
    assert "width_inches" in physical
    assert "height_inches" in physical
    assert isinstance(physical["width_inches"], (int, float))
    assert isinstance(physical["height_inches"], (int, float))
    assert physical["width_inches"] > 0
    assert physical["height_inches"] > 0
    
    # Validate visual dimensions
    assert "width_px" in visual
    assert "height_px" in visual
    assert isinstance(visual["width_px"], (int, float))
    assert isinstance(visual["height_px"], (int, float))
    assert visual["width_px"] > 0
    assert visual["height_px"] > 0

def test_overlay_calculate_invalid_image_id():
    """Test 400 error for non-existent image ID"""
    request_data = {
        "image_id": "nonexistent_image",
        "pattern_id": "pattern_123_0",
        "overlay_state": {
            "left": 100,
            "top": 100,
            "scaleX": 1.0,
            "scaleY": 1.0
        }
    }
    
    response = client.post("/api/overlay/calculate", json=request_data)
    
    # Contract: Should return 400 for invalid image ID
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "message" in data

def test_overlay_calculate_invalid_pattern_id():
    """Test 400 error for non-existent pattern ID"""
    request_data = {
        "image_id": "img_uuid_123", 
        "pattern_id": "nonexistent_pattern",
        "overlay_state": {
            "left": 100,
            "top": 100,
            "scaleX": 1.0,
            "scaleY": 1.0
        }
    }
    
    response = client.post("/api/overlay/calculate", json=request_data)
    
    # Contract: Should return 400 for invalid pattern ID
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "message" in data

def test_overlay_calculate_invalid_scale_values():
    """Test validation error for invalid scale values"""
    request_data = {
        "image_id": "img_uuid_123",
        "pattern_id": "pattern_123_0", 
        "overlay_state": {
            "left": 100,
            "top": 100,
            "scaleX": -1.0,  # Invalid negative scale
            "scaleY": 0.0    # Invalid zero scale
        }
    }
    
    response = client.post("/api/overlay/calculate", json=request_data)
    
    # Contract: Should return 400 for validation error
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "message" in data

def test_overlay_calculate_missing_required_fields():
    """Test validation error for missing required fields"""
    request_data = {
        "image_id": "img_uuid_123",
        # Missing pattern_id and overlay_state
    }
    
    response = client.post("/api/overlay/calculate", json=request_data)
    
    # Contract: Should return 400 for validation error
    assert response.status_code == 400
    data = response.json()
    assert "error" in data
    assert "message" in data