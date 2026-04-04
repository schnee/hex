"""
Overlay API endpoints
Handles overlay calculation functionality
"""

from fastapi import APIRouter, HTTPException, status
from src.models.api_models import OverlayRequest, OverlayResponse
from src.services.overlay_service import overlay_service
from src.services.image_service import image_service

router = APIRouter()


@router.post(
    "/calculate", 
    response_model=OverlayResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Image or pattern not found",
            "content": {
                "application/json": {
                    "example": {"detail": "Image not found: img_123"}
                }
            },
        },
        422: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "overlay_state", "scaleX"],
                                "msg": "ensure this value is greater than 0.1",
                                "type": "value_error.number.not_gt"
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
                    "example": {"detail": "Overlay calculation failed"}
                }
            },
        },
    },
)
async def calculate_overlay(request: OverlayRequest):
    """Calculate physical and visual dimensions for pattern overlay
    
    Computes how a pattern will appear when overlaid on an uploaded image,
    including both physical dimensions (in inches) and visual dimensions (in pixels).
    """
    try:
        # Validate image exists
        try:
            image_data = image_service.get_image(request.image_id)
        except HTTPException as e:
            if e.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Image not found: {request.image_id}"
                )
            raise e
        
        # Calculate dimensions using overlay service
        result = overlay_service.calculate_dimensions(request, image_data)
        
        return OverlayResponse(
            physical_dimensions=result["physical_dimensions"],
            visual_dimensions=result["visual_dimensions"]
        )
        
    except HTTPException as e:
        # Re-raise existing HTTP exceptions
        raise e
    except Exception as e:
        # Unexpected processing errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Overlay calculation failed: {str(e)}"
        )
