"""
Contract tests for POST /api/patterns/generate endpoint
Tests request/response schemas and validation rules
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_generate_patterns_valid_request():
    """Test successful pattern generation with valid parameters"""
    request_data = {
            "aspect_w": 16,
            "aspect_h": 9,
            "aspect_adherence": 0.75,
            "total_tiles": 36,
            "colors": ["#273c6b", "#92323d", "#D8C03F"],
            "counts": [12, 12, 12],
            "color_mode": "random",
            "tendrils": 3,
            "tendril_len_min": 2,
            "tendril_len_max": 4,
            "radius": 1.0,
            "seed": 123,
            "num_layouts": 4
        }

    response = client.post("/api/patterns/generate", json=request_data)
    
    # Contract: Should return 200 with patterns array
    assert response.status_code == 200
    data = response.json()
    
    # Validate response structure
    assert "patterns" in data
    assert isinstance(data["patterns"], list)
    assert len(data["patterns"]) == 4
    
    # Validate each pattern structure
    for pattern in data["patterns"]:
        assert "id" in pattern
        assert "seed" in pattern
        assert "width_inches" in pattern
        assert "height_inches" in pattern
        assert "aspect_ratio" in pattern
        assert "aspect_deviation" in pattern
        assert "png_data" in pattern
        assert "hexes" in pattern
        assert "colors" in pattern
        
        # Validate pattern data types
        assert isinstance(pattern["id"], str)
        assert isinstance(pattern["seed"], int)
        assert isinstance(pattern["width_inches"], float)
        assert isinstance(pattern["height_inches"], float)
        assert isinstance(pattern["aspect_ratio"], float)
        assert isinstance(pattern["aspect_deviation"], float)
        assert isinstance(pattern["png_data"], str)
        assert isinstance(pattern["hexes"], list)
        assert isinstance(pattern["colors"], list)

@pytest.mark.asyncio
async def test_generate_patterns_invalid_colors_count_mismatch():
    """Test validation error when color counts don't sum to total_tiles"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        request_data = {
            "aspect_w": 16,
            "aspect_h": 9,
            "total_tiles": 36,
            "colors": ["#273c6b", "#92323d"],
            "counts": [10, 10],  # Sum = 20, not 36
            "color_mode": "random",
            "seed": 123,
            "num_layouts": 1
        }
        
        response = await ac.post("/api/patterns/generate", json=request_data)
        
        # Contract: Should return 400 for validation error
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "message" in data

@pytest.mark.asyncio
async def test_generate_patterns_invalid_hex_colors():
    """Test validation error for invalid hex color format"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        request_data = {
            "aspect_w": 16,
            "aspect_h": 9,
            "total_tiles": 12,
            "colors": ["#ZZZ", "not-hex"],  # Invalid hex colors
            "counts": [6, 6],
            "color_mode": "random",
            "seed": 123,
            "num_layouts": 1
        }
        
        response = await ac.post("/api/patterns/generate", json=request_data)
        
        # Contract: Should return 400 for validation error
        assert response.status_code == 400

@pytest.mark.asyncio
async def test_generate_patterns_missing_required_fields():
    """Test validation error for missing required fields"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        request_data = {
            "aspect_w": 16,
            # Missing aspect_h, total_tiles, colors, etc.
        }
        
        response = await ac.post("/api/patterns/generate", json=request_data)
        
        # Contract: Should return 400 for validation error
        assert response.status_code == 400

@pytest.mark.asyncio
async def test_generate_patterns_out_of_range_values():
    """Test validation error for values outside allowed ranges"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        request_data = {
            "aspect_w": 16,
            "aspect_h": 9,
            "total_tiles": 2000,  # Above maximum of 1000
            "colors": ["#273c6b"],
            "counts": [2000],
            "color_mode": "random",
            "radius": 5.0,  # Above maximum of 2.0
            "seed": 123,
            "num_layouts": 1
        }
        
        response = await ac.post("/api/patterns/generate", json=request_data)
        
        # Contract: Should return 400 for validation error
        assert response.status_code == 400