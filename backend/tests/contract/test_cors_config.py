"""Tests for CORS environment configuration helpers."""

import pytest

from src.main import (
    DEFAULT_ALLOWED_ORIGINS,
    _get_allowed_origin_regex,
    _get_allowed_origins,
)


def test_get_allowed_origins_returns_defaults_when_env_missing(monkeypatch):
    """Falls back to localhost defaults when env var is missing."""
    monkeypatch.delenv("CORS_ALLOW_ORIGINS", raising=False)

    assert _get_allowed_origins() == DEFAULT_ALLOWED_ORIGINS


def test_get_allowed_origins_parses_comma_separated_values(monkeypatch):
    """Parses and trims configured origins."""
    monkeypatch.setenv(
        "CORS_ALLOW_ORIGINS",
        " https://hex-layout.pages.dev ,https://hex.example.com,, ",
    )

    assert _get_allowed_origins() == [
        "https://hex-layout.pages.dev",
        "https://hex.example.com",
    ]


def test_get_allowed_origin_regex_returns_none_when_unset(monkeypatch):
    """No regex is configured by default."""
    monkeypatch.delenv("CORS_ALLOW_ORIGIN_REGEX", raising=False)

    assert _get_allowed_origin_regex() is None


def test_get_allowed_origin_regex_returns_configured_pattern(monkeypatch):
    """Returns valid configured regex."""
    regex_pattern = r"^https://[a-z0-9-]+\.hex-layout-frontend\.pages\.dev$"
    monkeypatch.setenv("CORS_ALLOW_ORIGIN_REGEX", f"  {regex_pattern}  ")

    assert _get_allowed_origin_regex() == regex_pattern


def test_get_allowed_origin_regex_raises_for_invalid_regex(monkeypatch):
    """Invalid regex values raise an explicit error."""
    monkeypatch.setenv("CORS_ALLOW_ORIGIN_REGEX", "[")

    with pytest.raises(ValueError, match="Invalid CORS_ALLOW_ORIGIN_REGEX"):
        _get_allowed_origin_regex()
