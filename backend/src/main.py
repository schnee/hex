#!/usr/bin/env python3
"""
FastAPI backend for Hex Layout Toolkit
Provides REST API endpoints for pattern generation and overlay visualization
"""

import os
import re

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.api import images, overlay, patterns


DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]


def _get_allowed_origins() -> list[str]:
    configured_origins = os.getenv("CORS_ALLOW_ORIGINS", "")

    if configured_origins.strip():
        return [
            origin.strip() for origin in configured_origins.split(",") if origin.strip()
        ]

    return DEFAULT_ALLOWED_ORIGINS


def _get_allowed_origin_regex() -> str | None:
    configured_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip()

    if not configured_regex:
        return None

    try:
        re.compile(configured_regex)
    except re.error as exc:
        raise ValueError(
            f"Invalid CORS_ALLOW_ORIGIN_REGEX value. Could not compile regex: {exc}"
        ) from exc

    return configured_regex


app = FastAPI(
    title="Hex Layout Toolkit API",
    description="REST API for generating hexagonal tile layouts with interactive visualization",
    version="2.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_origin_regex=_get_allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(patterns.router, prefix="/api/patterns", tags=["patterns"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(overlay.router, prefix="/api/overlay", tags=["overlay"])


@app.get("/")
async def root():
    return {"message": "Hex Layout Toolkit API", "version": "2.0.0", "docs": "/docs"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
