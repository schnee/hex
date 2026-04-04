"""Contract tests for GET /api/patterns/{pattern_id}/download endpoint."""


def test_download_pattern_valid_id(client, pattern_id):
    """Test successful pattern download with generated valid pattern ID."""
    response = client.get(f"/api/patterns/{pattern_id}/download")

    # Contract: Should return 200 with PNG binary data
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"

    # Validate PNG binary data (starts with PNG signature)
    content = response.content
    assert content.startswith(b"\x89PNG\r\n\x1a\n")
    assert len(content) > 0


def test_download_pattern_invalid_id(client):
    """Test 404 error for non-existent pattern ID."""
    pattern_id = "nonexistent_pattern"

    response = client.get(f"/api/patterns/{pattern_id}/download")

    # Contract: Should return 404 for non-existent pattern
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], str)
    assert "Pattern not found" in data["detail"]


def test_download_pattern_empty_id(client):
    """Test error handling for empty pattern ID."""
    response = client.get("/api/patterns//download")

    # Contract: Should return 404 for invalid route
    assert response.status_code == 404
