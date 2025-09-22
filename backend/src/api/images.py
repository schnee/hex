"""
Images API endpoints
Handles image upload and processing functionality
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from src.models.api_models import UploadResponse
from src.services.image_service import image_service
from typing import Optional

router = APIRouter()


@router.post(
    "/upload", 
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {
            "description": "Unsupported file type",
            "content": {
                "application/json": {
                    "example": {"detail": "Unsupported file type. Must be an image."}
                }
            },
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Bad request or file processing error",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid max_dimension parameter"}
                }
            },
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "Image processing failed"}
                }
            },
        },
    },
)
async def upload_image(
    file: UploadFile = File(..., description="Image file to upload (PNG, JPEG, etc.)"),
    max_dimension: Optional[int] = Form(default=800, description="Maximum dimension for resizing (pixels)", ge=1, le=10000)
):
    """Upload and process an image file
    
    Accepts common image formats (PNG, JPEG, etc.) and optionally resizes them.
    Returns processed image data and metadata.
    """
    # Validate file is provided
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    try:
        result = await image_service.process_upload(file, max_dimension)
        
        return UploadResponse(
            image_id=result["image_id"],
            width=result["width"],
            height=result["height"],
            processed_data=result["processed_data"],
            format=result.get("format"),
            original_size=result.get("original_size")
        )
        
    except ValueError as e:
        # Validation errors (unsupported format, invalid parameters)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(e)
        )
    except HTTPException as e:
        # Re-raise existing HTTP exceptions
        raise e
    except Exception as e:
        # Unexpected processing errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image processing failed: {str(e)}"
        )
