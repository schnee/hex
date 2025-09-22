"""
Overlay calculation service for the Hex Layout Toolkit
Handles overlay dimension calculations and positioning
"""

from typing import Dict
from fastapi import HTTPException
from src.models.api_models import OverlayRequest, PhysicalDimensions, VisualDimensions


class OverlayService:
    """Service for calculating overlay dimensions"""
    
    def __init__(self):
        # In-memory storage for patterns and images (references to other services)
        self._patterns: Dict[str, Dict] = {}
    
    def store_pattern(self, pattern_id: str, pattern_data: Dict):
        """Store pattern data for overlay calculations"""
        self._patterns[pattern_id] = pattern_data
    
    def calculate_dimensions(self, request: OverlayRequest, image_data: Dict) -> Dict:
        """
        Calculate physical and visual dimensions for overlay positioning
        
        Args:
            request: Overlay calculation request
            image_data: Image metadata from image service
            
        Returns:
            Dict containing physical and visual dimensions
        """
        # Get pattern data
        if request.pattern_id not in self._patterns:
            raise HTTPException(status_code=400, detail=f"Pattern not found: {request.pattern_id}")
        
        pattern = self._patterns[request.pattern_id]
        
        # Calculate physical dimensions (these don't change with overlay transforms)
        physical_width = pattern["width_inches"]
        physical_height = pattern["height_inches"]
        
        # Calculate visual dimensions based on overlay transform
        # Base visual size (before scaling)
        base_visual_width = 200.0  # Default visual size in pixels
        base_visual_height = base_visual_width * (physical_height / physical_width)
        
        # Apply scaling from overlay state
        visual_width = base_visual_width * request.overlay_state.scaleX
        visual_height = base_visual_height * request.overlay_state.scaleY
        
        return {
            "physical_dimensions": {
                "width_inches": physical_width,
                "height_inches": physical_height
            },
            "visual_dimensions": {
                "width_px": visual_width,
                "height_px": visual_height
            }
        }


# Global instance
overlay_service = OverlayService()