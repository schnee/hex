"""Shared fixtures for backend contract tests."""

import io
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure backend root is importable for `from src...` imports.
BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from src.main import app


def create_test_png_bytes(width: int = 800, height: int = 600) -> bytes:
    """Create a PNG image payload in memory for upload tests."""
    image = Image.new("RGB", (width, height), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()


@pytest.fixture
def client() -> TestClient:
    """Return an API test client for contract tests."""
    return TestClient(app)


@pytest.fixture
def pattern_id(client: TestClient) -> str:
    """Generate and return a valid pattern id via API."""
    request_data = {
        "aspect_w": 16,
        "aspect_h": 9,
        "aspect_adherence": 0.75,
        "total_tiles": 12,
        "colors": ["#273c6b", "#92323d"],
        "counts": [6, 6],
        "color_mode": "random",
        "seed": 123,
        "num_layouts": 1,
    }

    response = client.post("/api/patterns/generate", json=request_data)
    assert response.status_code == 200

    patterns = response.json()["patterns"]
    assert len(patterns) == 1
    return patterns[0]["id"]


@pytest.fixture
def image_id(client: TestClient) -> str:
    """Upload and return a valid image id via API."""
    png_bytes = create_test_png_bytes()
    files = {"file": ("test.png", png_bytes, "image/png")}

    response = client.post("/api/images/upload", files=files)
    assert response.status_code == 200

    return response.json()["image_id"]
