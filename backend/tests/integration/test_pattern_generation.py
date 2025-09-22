"""
Integration tests for pattern generation workflow
Tests end-to-end pattern generation and mathematical accuracy
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_pattern_generation_workflow_complete():
    """Test complete pattern generation workflow from request to download"""
    # Step 1: Generate patterns
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
        "num_layouts": 2
    }
    
    generate_response = client.post("/api/patterns/generate", json=request_data)
    assert generate_response.status_code == 200
    
    patterns = generate_response.json()["patterns"]
    assert len(patterns) == 2
    
    # Step 2: Verify pattern metadata
    for i, pattern in enumerate(patterns):
        assert pattern["seed"] == 123 + i
        assert len(pattern["hexes"]) == 36
        assert len(pattern["colors"]) == 36
        assert pattern["width_inches"] > 0
        assert pattern["height_inches"] > 0
        
        # Test download each pattern
        pattern_id = pattern["id"]
        download_response = client.get(f"/api/patterns/{pattern_id}/download")
        assert download_response.status_code == 200
        assert download_response.headers["content-type"] == "image/png"
        assert len(download_response.content) > 0

def test_pattern_generation_different_color_strategies():
    """Test pattern generation with different color assignment strategies"""
    base_request = {
        "aspect_w": 4,
        "aspect_h": 3,
        "total_tiles": 24,
        "colors": ["#FF0000", "#00FF00", "#0000FF"],
        "counts": [8, 8, 8],
        "tendrils": 2,
        "radius": 1.0,
        "seed": 456,
        "num_layouts": 1
    }
    
    # Test each color strategy
    color_modes = ["random", "gradient", "scheme60"]
    
    for color_mode in color_modes:
        request_data = {**base_request, "color_mode": color_mode}
        
        if color_mode == "gradient":
            request_data["gradient_axis"] = "x"
            request_data["gradient_order"] = [0, 1, 2]
        elif color_mode == "scheme60":
            request_data["roles"] = {"dominant": 0, "secondary": 1, "accent": 2}
        
        response = client.post("/api/patterns/generate", json=request_data)
        assert response.status_code == 200, f"Failed for color_mode: {color_mode}"
        
        patterns = response.json()["patterns"]
        assert len(patterns) == 1
        
        pattern = patterns[0]
        assert len(pattern["colors"]) == 24
        # Verify all requested colors are used
        used_colors = set(pattern["colors"])
        expected_colors = set(["#FF0000", "#00FF00", "#0000FF"])
        assert used_colors == expected_colors

def test_pattern_generation_aspect_ratio_adherence():
    """Test that generated patterns respect aspect ratio constraints"""
    test_cases = [
        {"aspect_w": 1, "aspect_h": 1, "adherence": 0.9, "tolerance": 0.25},  # Square, strict
        {"aspect_w": 16, "aspect_h": 9, "adherence": 0.5, "tolerance": 0.4},  # Widescreen, loose
        {"aspect_w": 2, "aspect_h": 3, "adherence": 0.8, "tolerance": 0.25}, # Portrait, medium
    ]
    
    for case in test_cases:
        request_data = {
            "aspect_w": case["aspect_w"],
            "aspect_h": case["aspect_h"],
            "aspect_adherence": case["adherence"],
            "total_tiles": 40,  # More tiles for better ratio control
            "colors": ["#123456"],
            "counts": [40],
            "color_mode": "random",
            "seed": 789,
            "num_layouts": 5  # More layouts for statistical validation
        }
        
        response = client.post("/api/patterns/generate", json=request_data)
        assert response.status_code == 200
        
        patterns = response.json()["patterns"]
        target_ratio = case["aspect_w"] / case["aspect_h"]
        
        # Calculate statistics for all patterns instead of requiring each to pass
        deviations = []
        for pattern in patterns:
            actual_ratio = pattern["aspect_ratio"]
            deviation = abs(actual_ratio - target_ratio) / target_ratio
            deviations.append(deviation)
            assert pattern["aspect_deviation"] >= 0
        
        # At least 60% of patterns should meet the tolerance
        good_patterns = [d for d in deviations if d <= case["tolerance"]]
        success_rate = len(good_patterns) / len(patterns)
        assert success_rate >= 0.6, f"Only {success_rate:.1%} of patterns met tolerance {case['tolerance']} for {case['aspect_w']}:{case['aspect_h']}"
        
        # The median deviation should be reasonable
        import statistics
        median_dev = statistics.median(deviations)
        assert median_dev <= case["tolerance"] * 1.2, f"Median deviation {median_dev:.3f} too high for tolerance {case['tolerance']}"

def test_pattern_generation_reproducibility():
    """Test that identical parameters produce identical results"""
    request_data = {
        "aspect_w": 3,
        "aspect_h": 2,
        "total_tiles": 18,
        "colors": ["#AA0000", "#00AA00"],
        "counts": [9, 9],
        "color_mode": "random",
        "seed": 999,
        "radius": 1.0,
        "num_layouts": 1
    }
    
    # Generate same pattern twice
    response1 = client.post("/api/patterns/generate", json=request_data)
    response2 = client.post("/api/patterns/generate", json=request_data)
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    pattern1 = response1.json()["patterns"][0]
    pattern2 = response2.json()["patterns"][0]
    
    # Should have identical hex positions and colors
    assert pattern1["hexes"] == pattern2["hexes"]
    assert pattern1["colors"] == pattern2["colors"]
    assert pattern1["aspect_ratio"] == pattern2["aspect_ratio"]
    assert pattern1["width_inches"] == pattern2["width_inches"]
    assert pattern1["height_inches"] == pattern2["height_inches"]

def test_pattern_generation_tile_count_validation():
    """Test validation of tile counts and color constraints"""
    # Test valid tile count distribution
    valid_request = {
        "aspect_w": 2,
        "aspect_h": 1, 
        "total_tiles": 20,
        "colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
        "counts": [5, 5, 5, 5],
        "color_mode": "random",
        "seed": 111,
        "num_layouts": 1
    }
    
    response = client.post("/api/patterns/generate", json=valid_request)
    assert response.status_code == 200
    
    # Test invalid tile count (sum != total_tiles)
    invalid_request = {**valid_request}
    invalid_request["counts"] = [5, 5, 5, 4]  # Sum = 19, not 20
    
    response = client.post("/api/patterns/generate", json=invalid_request)
    # FastAPI returns 422 for validation errors (Unprocessable Entity)
    assert response.status_code == 422
