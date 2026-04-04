"""
Patterns API endpoints
Handles pattern generation and download functionality
"""

import base64
import uuid
from typing import Dict
from fastapi import APIRouter, HTTPException, Response, status
from src.models.api_models import GenerateRequest, GenerateResponse, Pattern, Hex
from src.services.pattern_service import generate_layout, LayoutParams, transparent_png_bytes
from src.services.overlay_service import overlay_service
import numpy as np

router = APIRouter()

# In-memory storage for generated patterns (in production, use proper storage)
_stored_patterns: Dict[str, Dict] = {}


@router.post(
    "/generate", 
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
    responses={
        422: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "colors"],
                                "msg": "Invalid hex color format",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            },
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "Pattern generation failed"}
                }
            },
        },
    },
)
async def generate_patterns(request: GenerateRequest):
    """Generate hexagonal tile patterns based on configuration parameters"""
    try:
        # Convert API request to LayoutParams
        params = LayoutParams(
            total_tiles=request.total_tiles,
            radius=request.radius,
            aspect_w=request.aspect_w,
            aspect_h=request.aspect_h,
            tendrils=request.tendrils,
            tendril_len_min=request.tendril_len_min,
            tendril_len_max=request.tendril_len_max,
            tendril_direction_variability=0.25,  # Default from original
            aspect_adherence=request.aspect_adherence,
            compactness_bias=0.35,  # Default from original
            color_mode=request.color_mode,
            colors=request.colors,
            counts=request.counts,
            gradient_order=request.gradient_order,
            gradient_axis=request.gradient_axis,
            roles=request.roles,
        )
        
        patterns = []
        
        # Generate requested number of layouts
        for i in range(request.num_layouts):
            rng = np.random.default_rng(request.seed + i)
            hexes, colors = generate_layout(rng, params)
            
            # Generate PNG data
            png_bytes = transparent_png_bytes(hexes, colors, params)
            png_base64 = base64.b64encode(png_bytes).decode('utf-8')
            
            # Calculate dimensions (simplified from original)
            from src.services.pattern_service import full_tile_bbox
            min_x, min_y, max_x, max_y = full_tile_bbox(hexes, params)
            real_R_in = 6.0  # From original code
            scale = real_R_in / params.radius
            width_inches = (max_x - min_x) * scale
            height_inches = (max_y - min_y) * scale
            
            # Calculate aspect ratio and deviation
            actual_ratio = width_inches / height_inches if height_inches > 0 else 1.0
            target_ratio = params.aspect()
            deviation = abs(actual_ratio - target_ratio) / target_ratio * 100.0
            
            # Create pattern ID and store pattern
            pattern_id = f"pattern_{request.seed + i}_{i}"
            
            pattern_data = {
                "id": pattern_id,
                "seed": request.seed + i,
                "width_inches": width_inches,
                "height_inches": height_inches,
                "aspect_ratio": actual_ratio,
                "aspect_deviation": deviation,
                "png_data": png_base64,
                "hexes": [{"q": h.q, "r": h.r} for h in hexes],
                "colors": colors,
                "png_bytes": png_bytes  # Store for download
            }
            
            # Store pattern for download and overlay calculations
            _stored_patterns[pattern_id] = pattern_data
            overlay_service.store_pattern(pattern_id, pattern_data)
            
            # Create API response pattern
            pattern = Pattern(
                id=pattern_id,
                seed=request.seed + i,
                width_inches=width_inches,
                height_inches=height_inches,
                aspect_ratio=actual_ratio,
                aspect_deviation=deviation,
                png_data=png_base64,
                hexes=[Hex(q=h.q, r=h.r) for h in hexes],
                colors=colors
            )
            patterns.append(pattern)
        
        return GenerateResponse(patterns=patterns)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Pattern generation failed: {str(e)}"
        )


@router.get(
    "/{pattern_id}/download",
    response_class=Response,
    responses={
        status.HTTP_200_OK: {
            "description": "Pattern PNG file",
            "content": {"image/png": {}},
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Pattern not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Pattern not found: pattern_123"}
                }
            },
        },
    },
)
async def download_pattern(pattern_id: str):
    """Download pattern as PNG file"""
    if pattern_id not in _stored_patterns:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Pattern not found: {pattern_id}"
        )
    
    pattern = _stored_patterns[pattern_id]
    png_bytes = pattern["png_bytes"]
    
    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={pattern_id}.png"}
    )