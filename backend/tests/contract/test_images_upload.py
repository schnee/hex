"""Contract tests for POST /api/images/upload endpoint."""

import io

from PIL import Image


def create_test_image(
    width: int = 800, height: int = 600, format: str = "PNG"
) -> bytes:
    """Create a test image in memory."""
    image = Image.new("RGB", (width, height), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)
    return buffer.getvalue()


def test_upload_image_valid_png(client):
    """Test successful image upload with valid PNG."""
    image_data = create_test_image(1200, 900, "PNG")

    files = {"file": ("test.png", image_data, "image/png")}
    data = {"max_dimension": 800}

    response = client.post("/api/images/upload", files=files, data=data)

    # Contract: Should return 200 with image metadata
    assert response.status_code == 200
    response_data = response.json()

    # Validate response structure
    assert "image_id" in response_data
    assert "width" in response_data
    assert "height" in response_data
    assert "processed_data" in response_data

    # Validate response data types and values
    assert isinstance(response_data["image_id"], str)
    assert isinstance(response_data["width"], int)
    assert isinstance(response_data["height"], int)
    assert isinstance(response_data["processed_data"], str)

    # Should be resized to max_dimension
    assert max(response_data["width"], response_data["height"]) <= 800


def test_upload_image_valid_jpeg(client):
    """Test successful image upload with valid JPEG."""
    image_data = create_test_image(600, 400, "JPEG")

    files = {"file": ("test.jpg", image_data, "image/jpeg")}

    response = client.post("/api/images/upload", files=files)

    # Contract: Should return 200 with image metadata
    assert response.status_code == 200
    response_data = response.json()

    # Validate required fields
    assert "image_id" in response_data
    assert "width" in response_data
    assert "height" in response_data
    assert "processed_data" in response_data


def test_upload_image_unsupported_format(client):
    """Test 415 error for unsupported file format."""
    fake_file = b"This is not an image"
    files = {"file": ("test.txt", fake_file, "text/plain")}

    response = client.post("/api/images/upload", files=files)

    # Contract: Should return 415 for unsupported media type
    assert response.status_code == 415
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], str)


def test_upload_image_no_file(client):
    """Test 422 validation error when no file is provided."""
    response = client.post("/api/images/upload")

    # Contract: Request validation handles missing required file field.
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], list)
    assert len(data["detail"]) > 0


def test_upload_image_large_file_current_behavior(client):
    """Current implementation accepts larger images and processes them."""
    large_image_data = create_test_image(2500, 2500, "PNG")

    files = {"file": ("large.png", large_image_data, "image/png")}

    response = client.post("/api/images/upload", files=files)

    # Contract: No endpoint-level size rejection path currently implemented.
    assert response.status_code == 200
    payload = response.json()
    assert "image_id" in payload
    assert "processed_data" in payload


def test_upload_image_invalid_max_dimension(client):
    """Test 422 validation error for invalid max_dimension parameter."""
    image_data = create_test_image(800, 600, "PNG")

    files = {"file": ("test.png", image_data, "image/png")}
    data = {"max_dimension": -100}  # Invalid negative value

    response = client.post("/api/images/upload", files=files, data=data)

    assert response.status_code == 422
    payload = response.json()
    assert "detail" in payload
    assert isinstance(payload["detail"], list)
    assert len(payload["detail"]) > 0
