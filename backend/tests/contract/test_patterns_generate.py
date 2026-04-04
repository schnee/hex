"""Contract tests for POST /api/patterns/generate endpoint."""

import base64
import binascii

import pytest


def assert_fastapi_validation_error(response) -> None:
    """Assert FastAPI/Pydantic validation response structure."""
    assert response.status_code == 422
    payload = response.json()
    assert "detail" in payload
    assert isinstance(payload["detail"], list)
    assert len(payload["detail"]) > 0


def test_generate_patterns_valid_request(client):
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
        "num_layouts": 4,
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


def test_generate_patterns_png_data_contract_is_raw_base64_and_decodable(client):
    """Generated png_data must be raw base64 PNG bytes without data URL prefix."""
    request_data = {
        "aspect_w": 4,
        "aspect_h": 3,
        "aspect_adherence": 0.75,
        "total_tiles": 12,
        "colors": ["#273c6b", "#92323d"],
        "counts": [6, 6],
        "color_mode": "random",
        "seed": 42,
        "num_layouts": 2,
    }

    response = client.post("/api/patterns/generate", json=request_data)

    assert response.status_code == 200
    payload = response.json()
    patterns = payload["patterns"]
    assert len(patterns) == 2

    for pattern in patterns:
        png_data = pattern["png_data"]

        # Contract: string is present and non-empty.
        assert isinstance(png_data, str)
        assert png_data.strip() != ""

        # Contract: backend returns raw base64, not data URL wrapper.
        assert not png_data.startswith("data:image/")

        # Contract: value decodes as base64 binary content.
        try:
            decoded = base64.b64decode(png_data, validate=True)
        except binascii.Error as exc:
            pytest.fail(f"png_data was not valid base64: {exc}")

        assert isinstance(decoded, bytes)
        assert len(decoded) > 0


def test_generate_patterns_invalid_colors_count_mismatch(client):
    """Test validation error when color counts don't sum to total_tiles"""
    request_data = {
        "aspect_w": 16,
        "aspect_h": 9,
        "total_tiles": 36,
        "colors": ["#273c6b", "#92323d"],
        "counts": [10, 10],  # Sum = 20, not 36
        "color_mode": "random",
        "seed": 123,
        "num_layouts": 1,
    }

    response = client.post("/api/patterns/generate", json=request_data)
    assert_fastapi_validation_error(response)


def test_generate_patterns_invalid_hex_colors(client):
    """Test validation error for invalid hex color format"""
    request_data = {
        "aspect_w": 16,
        "aspect_h": 9,
        "total_tiles": 12,
        "colors": ["#ZZZ", "not-hex"],  # Invalid hex colors
        "counts": [6, 6],
        "color_mode": "random",
        "seed": 123,
        "num_layouts": 1,
    }

    response = client.post("/api/patterns/generate", json=request_data)
    assert_fastapi_validation_error(response)


def test_generate_patterns_missing_required_fields(client):
    """Test validation error for missing required fields"""
    request_data = {
        "aspect_w": 16,
        # Missing aspect_h, total_tiles, colors, etc.
    }

    response = client.post("/api/patterns/generate", json=request_data)
    assert_fastapi_validation_error(response)


def test_generate_patterns_out_of_range_values(client):
    """Test validation error for values outside allowed ranges"""
    request_data = {
        "aspect_w": 16,
        "aspect_h": 9,
        "total_tiles": 2000,  # Above maximum of 1000
        "colors": ["#273c6b"],
        "counts": [2000],
        "color_mode": "random",
        "radius": 5.0,  # Above maximum of 2.0
        "seed": 123,
        "num_layouts": 1,
    }

    response = client.post("/api/patterns/generate", json=request_data)
    assert_fastapi_validation_error(response)
