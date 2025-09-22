/**
 * API Client for communicating with FastAPI backend
 * Base URL configured for development environment
 */

import type {
  GenerateRequest,
  GenerateResponse,
  UploadResponse,
  OverlayRequest,
  OverlayResponse,
  APIResponse,
  APIError as APIErrorType,
} from '../types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class APIError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data as APIErrorType,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          detail: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Pattern Generation API
  async generatePatterns(
    request: GenerateRequest
  ): Promise<APIResponse<GenerateResponse>> {
    return this.request<GenerateResponse>('/api/patterns/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async downloadPattern(patternId: string): Promise<Blob | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/patterns/${patternId}/download`
      );
      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to download pattern:', error);
      return null;
    }
  }

  // Image Upload API
  async uploadImage(
    file: File,
    maxDimension?: number
  ): Promise<APIResponse<UploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (maxDimension) {
        formData.append('max_dimension', maxDimension.toString());
      }

      const response = await fetch(`${this.baseUrl}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data as APIErrorType,
        };
      }

      return {
        success: true,
        data: data as UploadResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          detail: error instanceof Error ? error.message : 'Upload failed',
        },
      };
    }
  }

  // Overlay Calculation API
  async calculateOverlay(
    request: OverlayRequest
  ): Promise<APIResponse<OverlayResponse>> {
    return this.request<OverlayResponse>('/api/overlay/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health Check
  async healthCheck(): Promise<APIResponse<{ status: string }>> {
    return this.request<{ status: string }>('/api/health');
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export { APIError };
