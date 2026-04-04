"""
Integration tests for image upload and processing workflow
Tests image resizing, format conversion, and storage
"""

import pytest
import io
from PIL import Image
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def create_test_image(width: int, height: int, format: str = "PNG") -> bytes:
    """Create a test image in memory"""
    image = Image.new("RGB", (width, height), color=(255, 0, 0))
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)
    return buffer.getvalue()

def test_image_upload_and_resize_workflow():
    """Test complete image upload and processing workflow"""
    # Create large test image
    large_image = create_test_image(1600, 1200, "PNG")
    
    files = {"file": ("large_image.png", large_image, "image/png")}
    data = {"max_dimension": 800}
    
    response = client.post("/api/images/upload", files=files, data=data)
    assert response.status_code == 200
    
    result = response.json()
    
    # Verify image was resized properly
    assert result["width"] <= 800
    assert result["height"] <= 800
    assert max(result["width"], result["height"]) == 800
    
    # Verify aspect ratio preserved (1600:1200 = 4:3)
    aspect_ratio = result["width"] / result["height"]
    expected_ratio = 1600 / 1200
    assert abs(aspect_ratio - expected_ratio) < 0.01
    
    # Verify processed image data exists
    assert result["processed_data"].startswith("data:image/")
    assert result["image_id"] is not None

def test_image_processing_different_formats():
    """Test image processing for different input formats"""
    test_cases = [
        {"format": "PNG", "width": 400, "height": 300},
        {"format": "JPEG", "width": 600, "height": 400},
    ]
    
    for case in test_cases:
        image_data = create_test_image(case["width"], case["height"], case["format"])
        files = {"file": (f"test.{case['format'].lower()}", image_data, f"image/{case['format'].lower()}")}
        
        response = client.post("/api/images/upload", files=files)
        assert response.status_code == 200
        
        result = response.json()
        assert result["width"] == case["width"]
        assert result["height"] == case["height"]
        assert len(result["processed_data"]) > 0

def test_image_overlay_calculation_integration():
    """Test integration between image upload and overlay calculation"""
    # Step 1: Upload an image
    image_data = create_test_image(800, 600, "PNG")
    files = {"file": ("wall.png", image_data, "image/png")}
    
    upload_response = client.post("/api/images/upload", files=files)
    assert upload_response.status_code == 200
    
    image_result = upload_response.json()
    image_id = image_result["image_id"]
    
    # Step 2: Generate a pattern (this will fail until implemented)
    pattern_request = {
        "aspect_w": 16,
        "aspect_h": 9,
        "total_tiles": 24,
        "colors": ["#FF0000", "#00FF00"],
        "counts": [12, 12],
        "color_mode": "random",
        "seed": 123,
        "num_layouts": 1
    }
    
    pattern_response = client.post("/api/patterns/generate", json=pattern_request)
    assert pattern_response.status_code == 200
    
    pattern_id = pattern_response.json()["patterns"][0]["id"]
    
    # Step 3: Calculate overlay dimensions
    overlay_request = {
        "image_id": image_id,
        "pattern_id": pattern_id,
        "overlay_state": {
            "left": 100,
            "top": 50,
            "scaleX": 1.2,
            "scaleY": 1.2
        }
    }
    
    overlay_response = client.post("/api/overlay/calculate", json=overlay_request)
    assert overlay_response.status_code == 200
    
    overlay_result = overlay_response.json()
    assert "physical_dimensions" in overlay_result
    assert "visual_dimensions" in overlay_result
    
    # Verify dimensions make sense
    physical = overlay_result["physical_dimensions"]
    visual = overlay_result["visual_dimensions"]
    
    assert physical["width_inches"] > 0
    assert physical["height_inches"] > 0
    assert visual["width_px"] > 0
    assert visual["height_px"] > 0