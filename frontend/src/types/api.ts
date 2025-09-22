/**
 * TypeScript types matching the backend Pydantic models
 * These should be kept in sync with backend/src/models/api_models.py
 */

export interface Hex {
  q: number;
  r: number;
}

export interface OverlayState {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  rotation?: number;
}

export interface GenerateRequest {
  aspect_w: number;
  aspect_h: number;
  aspect_adherence?: number;
  total_tiles: number;
  colors: string[];
  counts: number[];
  color_mode: 'random' | 'gradient' | 'scheme60';
  gradient_axis?: 'auto' | 'x' | 'y' | 'principal';
  gradient_order?: number[];
  roles?: Record<string, number>;
  tendrils?: number;
  tendril_len_min?: number;
  tendril_len_max?: number;
  radius?: number;
  seed: number;
  num_layouts: number;
}

export interface Pattern {
  id: string;
  seed: number;
  width_inches: number;
  height_inches: number;
  aspect_ratio: number;
  aspect_deviation: number;
  png_data: string;
  hexes: Hex[];
  colors: string[];
}

export interface GenerateResponse {
  patterns: Pattern[];
}

export interface UploadResponse {
  image_id: string;
  width: number;
  height: number;
  processed_data: string;
  format?: string;
  original_size?: {
    width: number;
    height: number;
  };
}

export interface OverlayRequest {
  image_id: string;
  pattern_id: string;
  overlay_state: OverlayState;
}

export interface PhysicalDimensions {
  width_inches: number;
  height_inches: number;
}

export interface VisualDimensions {
  width_px: number;
  height_px: number;
}

export interface OverlayResponse {
  physical_dimensions: PhysicalDimensions;
  visual_dimensions: VisualDimensions;
}

// API Error response (FastAPI HTTPException format)
export interface APIError {
  detail: string;
}

// API Response wrapper for error handling
export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: APIError };
