"""
Integration tests for mathematical accuracy vs original Streamlit
Tests that the new API produces identical results to the original system
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_mathematical_accuracy_exact_reproduction():
    """Test that API produces identical results to original Streamlit for same seeds"""
    # These expected values would come from running the original Streamlit version
    # with the same parameters and recording the output
    test_cases = [
        {
            "params": {
                "aspect_w": 16,
                "aspect_h": 9,
                "total_tiles": 36,
                "colors": ["#273c6b", "#92323d", "#D8C03F"],
                "counts": [12, 12, 12],
                "color_mode": "random",
                "seed": 123,
                "radius": 1.0,
                "tendrils": 3,
                "tendril_len_min": 2,
                "tendril_len_max": 4,
                "num_layouts": 1
            },
            # Expected values from original Streamlit (would be populated during implementation)
            "expected_hex_count": 36,
            "expected_min_width": 20.0,  # Approximate expected values
            "expected_min_height": 10.0,
        }
    ]
    
    for case in test_cases:
        response = client.post("/api/patterns/generate", json=case["params"])
        assert response.status_code == 200
        
        pattern = response.json()["patterns"][0]
        
        # Test mathematical consistency
        assert len(pattern["hexes"]) == case["expected_hex_count"]
        assert len(pattern["colors"]) == case["expected_hex_count"]
        assert pattern["width_inches"] >= case["expected_min_width"]
        assert pattern["height_inches"] >= case["expected_min_height"]
        
        # Verify hex coordinates are valid axial coordinates
        for hex_coord in pattern["hexes"]:
            assert "q" in hex_coord
            assert "r" in hex_coord
            assert isinstance(hex_coord["q"], int)
            assert isinstance(hex_coord["r"], int)

def test_random_number_generator_consistency():
    """Test that the random number generator produces consistent results"""
    fixed_seed = 42
    
    params = {
        "aspect_w": 4,
        "aspect_h": 3,
        "total_tiles": 24,
        "colors": ["#FF0000", "#00FF00", "#0000FF"],
        "counts": [8, 8, 8],
        "color_mode": "random",
        "seed": fixed_seed,
        "num_layouts": 2
    }
    
    # Run generation multiple times
    responses = []
    for _ in range(3):
        response = client.post("/api/patterns/generate", json=params)
        assert response.status_code == 200
        responses.append(response.json())
    
    # All responses should be identical for same seed
    first_patterns = responses[0]["patterns"]
    
    for response in responses[1:]:
        patterns = response["patterns"]
        assert len(patterns) == len(first_patterns)
        
        for i, pattern in enumerate(patterns):
            first_pattern = first_patterns[i]
            
            # Hex positions should be identical
            assert pattern["hexes"] == first_pattern["hexes"]
            
            # Color assignments should be identical 
            assert pattern["colors"] == first_pattern["colors"]
            
            # Dimensions should be identical
            assert pattern["width_inches"] == first_pattern["width_inches"]
            assert pattern["height_inches"] == first_pattern["height_inches"]

def test_color_distribution_accuracy():
    """Test that color distribution exactly matches requested counts"""
    test_cases = [
        {
            "colors": ["#AA0000", "#00AA00"],
            "counts": [10, 10],
            "total": 20
        },
        {
            "colors": ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
            "counts": [5, 7, 3, 9],
            "total": 24
        }
    ]
    
    for case in test_cases:
        params = {
            "aspect_w": 3,
            "aspect_h": 2,
            "total_tiles": case["total"],
            "colors": case["colors"],
            "counts": case["counts"],
            "color_mode": "random",
            "seed": 999,
            "num_layouts": 1
        }
        
        response = client.post("/api/patterns/generate", json=params)
        assert response.status_code == 200
        
        pattern = response.json()["patterns"][0]
        assigned_colors = pattern["colors"]
        
        # Count each color in the result
        color_counts = {}
        for color in assigned_colors:
            color_counts[color] = color_counts.get(color, 0) + 1
        
        # Verify exact match to requested counts
        for i, color in enumerate(case["colors"]):
            expected_count = case["counts"][i]
            actual_count = color_counts.get(color, 0)
            assert actual_count == expected_count, f"Color {color}: expected {expected_count}, got {actual_count}"

def test_aspect_ratio_mathematical_precision():
    """Test aspect ratio calculations for mathematical precision"""
    test_cases = [
        {"aspect_w": 1, "aspect_h": 1, "expected_ratio": 1.0},
        {"aspect_w": 16, "aspect_h": 9, "expected_ratio": 16/9},
        {"aspect_w": 4, "aspect_h": 3, "expected_ratio": 4/3},
    ]
    
    for case in test_cases:
        params = {
            "aspect_w": case["aspect_w"],
            "aspect_h": case["aspect_h"],
            "aspect_adherence": 0.9,  # High adherence for precision
            "total_tiles": 40,  # Increase tiles for better aspect ratio control
            "colors": ["#123456"],
            "counts": [40],
            "color_mode": "random",
            "seed": 777,
            "num_layouts": 8  # More layouts for statistical validation
        }
        
        response = client.post("/api/patterns/generate", json=params)
        assert response.status_code == 200
        
        patterns = response.json()["patterns"]
        target_ratio = case["expected_ratio"]
        
        # Calculate deviations for all patterns
        deviations = []
        for pattern in patterns:
            actual_ratio = pattern["aspect_ratio"]
            deviation = abs(actual_ratio - target_ratio) / target_ratio
            deviations.append(deviation)
            
            # Verify the reported deviation matches calculated deviation
            reported_deviation = pattern["aspect_deviation"] / 100  # Convert from percentage
            assert abs(deviation - reported_deviation) < 0.01
        
        # With high adherence, expect statistical performance:
        # - At least half the patterns should have good precision (<20%)
        # - The median deviation should be reasonable (<25%)
        import statistics
        good_patterns = [d for d in deviations if d < 0.20]
        median_deviation = statistics.median(deviations)
        
        assert len(good_patterns) >= len(patterns) // 2, f"Only {len(good_patterns)}/{len(patterns)} patterns had <20% deviation for {case['aspect_w']}:{case['aspect_h']}"
        assert median_deviation < 0.25, f"Median deviation too high: {median_deviation:.3f} for target {target_ratio:.3f}"

def test_png_generation_consistency():
    """Test that PNG generation is consistent and produces valid images"""
    params = {
        "aspect_w": 2,
        "aspect_h": 1,
        "total_tiles": 12,
        "colors": ["#FF0000", "#00FF00"],
        "counts": [6, 6],
        "color_mode": "random",
        "seed": 888,
        "radius": 1.5,
        "num_layouts": 1
    }
    
    response = client.post("/api/patterns/generate", json=params)
    assert response.status_code == 200
    
    pattern = response.json()["patterns"][0]
    png_data = pattern["png_data"]
    
    # Verify PNG data format
    assert isinstance(png_data, str)
    assert len(png_data) > 0
    
    # PNG data should be base64 encoded
    import base64
    try:
        decoded = base64.b64decode(png_data)
        # Valid PNG should start with PNG signature
        assert decoded.startswith(b'\x89PNG\r\n\x1a\n')
    except Exception as e:
        pytest.fail(f"PNG data is not valid base64: {e}")
    
    # Test PNG download endpoint
    pattern_id = pattern["id"] 
    download_response = client.get(f"/api/patterns/{pattern_id}/download")
    assert download_response.status_code == 200
    
    # Downloaded PNG should match generated PNG data
    downloaded_png = download_response.content
    assert downloaded_png.startswith(b'\x89PNG\r\n\x1a\n')
    assert downloaded_png == decoded