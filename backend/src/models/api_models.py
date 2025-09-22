"""
Pydantic models for API requests and responses
Defines the data structures for the Hex Layout Toolkit API
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator
import re


class Hex(BaseModel):
    """Hexagonal grid coordinate in axial coordinate system"""
    q: int = Field(..., description="Horizontal axis coordinate")
    r: int = Field(..., description="Diagonal axis coordinate")


class OverlayState(BaseModel):
    """Transform data for pattern positioning"""
    left: float = Field(..., description="X position offset in pixels")
    top: float = Field(..., description="Y position offset in pixels")
    scaleX: float = Field(..., ge=0.1, le=10.0, description="Horizontal scale factor")
    scaleY: float = Field(..., ge=0.1, le=10.0, description="Vertical scale factor")
    rotation: float = Field(default=0, ge=-180, le=180, description="Rotation angle in degrees")


class GenerateRequest(BaseModel):
    """Pattern generation API input"""
    aspect_w: float = Field(..., ge=0.1, le=100, description="Width component of target aspect ratio")
    aspect_h: float = Field(..., ge=0.1, le=100, description="Height component of target aspect ratio")
    aspect_adherence: float = Field(default=0.75, ge=0.0, le=1.0, description="Strictness of aspect ratio conformance")
    total_tiles: int = Field(..., ge=1, le=1000, description="Total number of hexagonal tiles")
    colors: List[str] = Field(..., min_length=1, max_length=5, description="Hex color codes")
    counts: List[int] = Field(..., description="Number of tiles per color (must sum to total_tiles)")
    color_mode: str = Field(..., pattern="^(random|gradient|scheme60)$", description="Color assignment strategy")
    gradient_axis: Optional[str] = Field(default="auto", pattern="^(auto|x|y|principal)$", description="Gradient direction")
    gradient_order: Optional[List[int]] = Field(default=None, description="Color sequence indices for gradient mode")
    roles: Optional[Dict[str, int]] = Field(default=None, description="Color role assignments for scheme60 mode")
    tendrils: int = Field(default=3, ge=0, le=8, description="Number of organic extensions")
    tendril_len_min: int = Field(default=2, ge=1, le=8, description="Minimum tendril length")
    tendril_len_max: int = Field(default=4, ge=1, le=8, description="Maximum tendril length")
    radius: float = Field(default=1.0, ge=0.6, le=2.0, description="Hexagon visual radius")
    seed: int = Field(..., ge=0, le=1000000000, description="Random number seed for reproducibility")
    num_layouts: int = Field(..., ge=1, le=12, description="Number of pattern variations to generate")

    @field_validator('colors')
    @classmethod
    def validate_hex_colors(cls, v):
        hex_pattern = re.compile(r'^#[0-9A-Fa-f]{6}$')
        for color in v:
            if not hex_pattern.match(color):
                raise ValueError(f'Invalid hex color: {color}. Must be in format #RRGGBB')
        return v

    @field_validator('counts')
    @classmethod
    def validate_counts_length(cls, v, info):
        if info.data.get('colors') and len(v) != len(info.data['colors']):
            raise ValueError('counts and colors arrays must have the same length')
        return v

    @field_validator('tendril_len_max')
    @classmethod
    def validate_tendril_length_range(cls, v, info):
        if info.data.get('tendril_len_min') and v < info.data['tendril_len_min']:
            raise ValueError('tendril_len_max must be >= tendril_len_min')
        return v

    def __init__(self, **data):
        super().__init__(**data)
        # Validate that counts sum to total_tiles
        if sum(self.counts) != self.total_tiles:
            raise ValueError(f'Sum of counts ({sum(self.counts)}) must equal total_tiles ({self.total_tiles})')


class Pattern(BaseModel):
    """Generated hexagonal layout result"""
    id: str = Field(..., description="Unique pattern identifier")
    seed: int = Field(..., description="Seed used for generation")
    width_inches: float = Field(..., description="Physical width in inches")
    height_inches: float = Field(..., description="Physical height in inches")
    aspect_ratio: float = Field(..., description="Actual achieved aspect ratio")
    aspect_deviation: float = Field(..., description="Percentage deviation from target ratio")
    png_data: str = Field(..., description="Base64-encoded PNG image")
    hexes: List[Hex] = Field(..., description="Hexagon coordinate positions")
    colors: List[str] = Field(..., description="Color assignment per hexagon")


class GenerateResponse(BaseModel):
    """Pattern generation API output"""
    patterns: List[Pattern] = Field(..., description="Generated patterns")


class UploadResponse(BaseModel):
    """Image upload API output"""
    image_id: str = Field(..., description="Unique identifier for uploaded image")
    width: int = Field(..., description="Processed image width in pixels")
    height: int = Field(..., description="Processed image height in pixels")
    processed_data: str = Field(..., description="Base64-encoded processed image data")
    format: Optional[str] = Field(default=None, description="Image format after processing")
    original_size: Optional[Dict[str, int]] = Field(default=None, description="Original image dimensions")


class OverlayRequest(BaseModel):
    """Overlay calculation API input"""
    image_id: str = Field(..., description="Uploaded image identifier")
    pattern_id: str = Field(..., description="Generated pattern identifier")
    overlay_state: OverlayState = Field(..., description="Transform parameters")


class PhysicalDimensions(BaseModel):
    """Physical dimensions in inches"""
    width_inches: float = Field(..., description="Physical width in inches")
    height_inches: float = Field(..., description="Physical height in inches")


class VisualDimensions(BaseModel):
    """Visual dimensions in pixels"""
    width_px: float = Field(..., description="Visual width in pixels on screen")
    height_px: float = Field(..., description="Visual height in pixels on screen")


class OverlayResponse(BaseModel):
    """Overlay calculation API output"""
    physical_dimensions: PhysicalDimensions = Field(..., description="Physical dimensions")
    visual_dimensions: VisualDimensions = Field(..., description="Visual dimensions")


# Note: FastAPI automatically generates error responses using HTTPException
# Error responses follow the format: {"detail": "error message"}
# For validation errors, FastAPI returns 422 with detailed field-level errors
