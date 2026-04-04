import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WallImageUploader } from '../../src/components/WallImageUploader';
import type { UploadResponse } from '../../src/types/api';

const { mockUploadImage } = vi.hoisted(() => ({
  mockUploadImage: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    uploadImage: mockUploadImage,
  },
}));

const mockUploadResponse: UploadResponse = {
  image_id: 'img-123',
  processed_data: 'data:image/png;base64,abc123',
  width: 1920,
  height: 1080,
};

describe('WallImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadImage.mockReset();
  });

  it('uploads a valid image and reports success payload', async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();

    let resolveUpload: ((value: unknown) => void) | undefined;
    const pendingUpload = new Promise(resolve => {
      resolveUpload = resolve;
    });

    mockUploadImage.mockReturnValue(pendingUpload);

    render(<WallImageUploader onUploadComplete={onUploadComplete} />);

    const input = screen.getByLabelText(/upload wall image/i);
    const file = new File(['valid-image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    expect(screen.getByText(/uploading image\.\.\./i)).toBeInTheDocument();

    resolveUpload?.({
      success: true,
      data: mockUploadResponse,
    });

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith({
        image_id: 'img-123',
        processed_data: 'data:image/png;base64,abc123',
        width: 1920,
        height: 1080,
      });
    });

    expect(
      await screen.findByText(
        /image uploaded successfully\. you can now position the overlay\./i
      )
    ).toBeInTheDocument();
  });

  it('shows actionable upload retry guidance and backend detail on API failure', async () => {
    const user = userEvent.setup();

    mockUploadImage.mockResolvedValue({
      success: false,
      error: { detail: 'Storage service unavailable' },
    });

    render(<WallImageUploader onUploadComplete={vi.fn()} />);

    const input = screen.getByLabelText(/upload wall image/i);
    const file = new File(['valid-image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    expect(
      await screen.findByText(
        /upload failed\. choose a supported image and try again\./i
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/storage service unavailable/i)
    ).toBeInTheDocument();
  });

  it('clears stale upload errors after a successful retry', async () => {
    const user = userEvent.setup();
    const onUploadComplete = vi.fn();

    mockUploadImage
      .mockResolvedValueOnce({
        success: false,
        error: { detail: 'Temporary upload outage' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockUploadResponse,
      });

    render(<WallImageUploader onUploadComplete={onUploadComplete} />);

    const input = screen.getByLabelText(/upload wall image/i);
    const firstFile = new File(['first'], 'wall-1.jpg', { type: 'image/jpeg' });
    await user.upload(input, firstFile);

    expect(
      await screen.findByText(
        /upload failed\. choose a supported image and try again\./i
      )
    ).toBeInTheDocument();
    expect(await screen.findByText(/temporary upload outage/i)).toBeInTheDocument();

    const secondFile = new File(['second'], 'wall-2.jpg', { type: 'image/jpeg' });
    await user.upload(input, secondFile);

    expect(
      await screen.findByText(
        /image uploaded successfully\. you can now position the overlay\./i
      )
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText(/upload failed\. choose a supported image and try again\./i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/temporary upload outage/i)).not.toBeInTheDocument();
    });
    expect(onUploadComplete).toHaveBeenCalledWith(mockUploadResponse);
  });

  it('rejects unsupported file types with deterministic message', async () => {
    const user = userEvent.setup({ applyAccept: false });

    render(<WallImageUploader onUploadComplete={vi.fn()} />);

    const input = screen.getByLabelText(/upload wall image/i);
    const file = new File(['invalid'], 'wall.bmp', { type: 'image/bmp' });
    await user.upload(input, file);

    expect(
      await screen.findByText('Invalid file type. Use JPG, PNG, or GIF.')
    ).toBeInTheDocument();
    expect(mockUploadImage).not.toHaveBeenCalled();
  });

  it('rejects oversized files and avoids upload API call', async () => {
    const user = userEvent.setup();

    render(<WallImageUploader onUploadComplete={vi.fn()} />);

    const input = screen.getByLabelText(/upload wall image/i);
    const file = new File(['oversized-image'], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', {
      value: 10 * 1024 * 1024 + 1,
    });

    await user.upload(input, file);

    expect(
      screen.getByText('File size too large. Maximum 10MB.')
    ).toBeInTheDocument();
    expect(mockUploadImage).not.toHaveBeenCalled();
  });
});
