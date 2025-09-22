#!/usr/bin/env python3
"""
FastAPI backend for Hex Layout Toolkit
Provides REST API endpoints for pattern generation and overlay visualization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.api import patterns, images, overlay

app = FastAPI(
    title="Hex Layout Toolkit API",
    description="REST API for generating hexagonal tile layouts with interactive visualization",
    version="2.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
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
    return {
        "message": "Hex Layout Toolkit API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)