# REST API Design for Hex Layout Toolkit

## Overview
Convert the Streamlit session-based application to a stateless REST API with React frontend.

## Core Endpoints

### Pattern Generation
```
POST /api/patterns/generate
Content-Type: application/json

Body: {
  "aspect_w": 16,
  "aspect_h": 9,
  "aspect_adherence": 0.75,
  "total_tiles": 36,
  "colors": ["#273c6b", "#92323d", "#D8C03F"],
  "counts": [12, 12, 12],
  "color_mode": "random|gradient|scheme60",
  "gradient_axis": "auto|x|y|principal",  // for gradient mode
  "gradient_order": [0, 1, 2],            // for gradient mode
  "roles": {                              // for scheme60 mode
    "dominant": 0,
    "secondary": 1,
    "accent": 2
  },
  "tendrils": 3,
  "tendril_len_min": 2,
  "tendril_len_max": 4,
  "radius": 1.0,
  "seed": 123,
  "num_layouts": 4
}

Response: {
  "patterns": [
    {
      "id": "pattern_123_0",
      "seed": 123,
      "width_inches": 24.5,
      "height_inches": 13.8,
      "aspect_ratio": 1.777,
      "aspect_deviation": 1.2,
      "png_data": "base64_encoded_png...",
      "hexes": [{"q": 0, "r": 0}, {"q": 1, "r": 0}, ...],
      "colors": ["#273c6b", "#92323d", ...]
    },
    ...
  ]
}
```

### File Upload & Processing
```
POST /api/images/upload
Content-Type: multipart/form-data

Form Data:
  file: <image file>
  max_dimension: 800 (optional)

Response: {
  "image_id": "img_uuid_123",
  "width": 1200,
  "height": 800,
  "processed_data": "base64_encoded_resized_image..."
}
```

### Overlay State Management
```
POST /api/overlay/calculate
Content-Type: application/json

Body: {
  "image_id": "img_uuid_123",
  "pattern_id": "pattern_123_0",
  "overlay_state": {
    "left": 100,
    "top": 100,
    "scaleX": 1.5,
    "scaleY": 1.5
  }
}

Response: {
  "physical_dimensions": {
    "width_inches": 24.5,
    "height_inches": 13.8
  },
  "visual_dimensions": {
    "width_px": 300,
    "height_px": 169
  }
}
```

### Pattern Download
```
GET /api/patterns/{pattern_id}/download
Accept: image/png

Response: PNG file (Content-Type: image/png)
```

## Data Models

### LayoutParams
- Maps directly from current LayoutParams dataclass
- Validation for ranges and constraints

### PatternResponse
- Contains generated layout metadata
- Includes base64 PNG data for immediate display
- Physical dimensions for overlay calculations

### ImageUpload
- Handles file processing and resizing
- Returns processed image data and metadata

## State Management Strategy
- Frontend maintains current patterns in React state
- No server-side session storage required
- Pattern IDs used for download/reference
- Images processed on upload, not stored server-side