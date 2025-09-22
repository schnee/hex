"""
Image processing service for the Hex Layout Toolkit
Handles image upload, resizing, and format conversion
"""

import io
import base64
import uuid
from typing import Tuple, Dict
from PIL import Image
from fastapi import UploadFile, HTTPException


class ImageService:
    """Service for processing uploaded images"""
    
    def __init__(self):
        # In-memory storage for uploaded images (in production, use proper storage)
        self._images: Dict[str, Dict] = {}
    
    async def process_upload(self, file: UploadFile, max_dimension: int = 800) -> Dict:
        """
        Process an uploaded image file
        
        Args:
            file: The uploaded file
            max_dimension: Maximum dimension for resizing
            
        Returns:
            Dict containing image metadata and processed data
        """
        if not file.content_type or not file.content_type.startswith('image/'):
            raise ValueError("Unsupported file type. Must be an image.")
        
        try:
            # Read the uploaded file
            contents = await file.read()
            if len(contents) == 0:
                raise ValueError("Empty file uploaded")
            
            # Open the image with PIL
            image = Image.open(io.BytesIO(contents))
            original_width, original_height = image.size
            original_format = image.format or 'PNG'
            
            # Resize if necessary
            processed_image = self._resize_image(image, max_dimension)
            
            # Convert to base64 for storage/transmission
            processed_data = self._image_to_base64(processed_image)
            
            # Generate unique ID
            image_id = str(uuid.uuid4())
            
            # Store image metadata
            image_metadata = {
                'id': image_id,
                'width': processed_image.width,
                'height': processed_image.height,
                'format': processed_image.format or 'PNG',
                'processed_data': processed_data,
                'original_size': {
                    'width': original_width,
                    'height': original_height
                }
            }
            
            self._images[image_id] = image_metadata
            
            return {
                'image_id': image_id,
                'width': processed_image.width,
                'height': processed_image.height,
                'processed_data': processed_data,
                'format': processed_image.format or 'PNG',
                'original_size': {
                    'width': original_width,
                    'height': original_height
                }
            }
            
        except ValueError:
            # Re-raise validation errors as-is
            raise
        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise
        except Exception as e:
            # Convert other exceptions to ValueError for proper API error handling
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def get_image(self, image_id: str) -> Dict:
        """Get image metadata by ID"""
        if image_id not in self._images:
            raise HTTPException(status_code=404, detail="Image not found")
        return self._images[image_id]
    
    def _resize_image(self, image: Image.Image, max_dimension: int) -> Image.Image:
        """Resize image while preserving aspect ratio"""
        width, height = image.size
        
        if max(width, height) <= max_dimension:
            return image
        
        # Calculate new dimensions while preserving aspect ratio
        if width > height:
            new_width = max_dimension
            new_height = int(height * (max_dimension / width))
        else:
            new_height = max_dimension
            new_width = int(width * (max_dimension / height))
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    def _image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 data URL"""
        buffer = io.BytesIO()
        format = image.format or 'PNG'
        image.save(buffer, format=format)
        buffer.seek(0)
        
        image_data = buffer.getvalue()
        base64_data = base64.b64encode(image_data).decode('utf-8')
        
        # Create data URL
        mime_type = f"image/{format.lower()}"
        return f"data:{mime_type};base64,{base64_data}"


# Global instance
image_service = ImageService()