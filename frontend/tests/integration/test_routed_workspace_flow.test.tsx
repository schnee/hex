import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import type { Pattern, UploadResponse } from '../../src/types/api';

const { mockGeneratePatterns, mockUploadImage, mockCalculateOverlay } = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
  mockUploadImage: vi.fn(),
  mockCalculateOverlay: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    generatePatterns: mockGeneratePatterns,
    calculateOverlay: mockCalculateOverlay,
    uploadImage: mockUploadImage,
  },
  downloadPattern: vi.fn(),
}));

const generatedPatterns: Pattern[] = [
  {
    id: 'pattern-route-1',
    seed: 77,
    width_inches: 10,
    height_inches: 6,
    aspect_ratio: 1.66,
    aspect_deviation: 1.2,
    png_data: 'data:image/png;base64,mock-pattern',
    hexes: [{ q: 0, r: 0 }],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
  },
];

const uploadedImage: UploadResponse = {
  image_id: 'img-routed-1',
  width: 1920,
  height: 1080,
  processed_data: 'data:image/jpeg;base64,mock-wall',
};

const renderApp = () =>
  render(
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  );

describe('Single-Screen Workspace Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePatterns.mockResolvedValue({
      success: true,
      data: { patterns: generatedPatterns },
    });
    mockUploadImage.mockResolvedValue({
      success: true,
      data: uploadedImage,
    });
    mockCalculateOverlay.mockResolvedValue({
      success: true,
      data: {
        physical_dimensions: {
          width_inches: 10,
          height_inches: 6,
        },
        visual_dimensions: {
          width_px: 240,
          height_px: 140,
        },
      },
    });
  });

  it('keeps generation disabled until upload succeeds in single workspace', async () => {
    const user = userEvent.setup();
    renderApp();

    const generateButton = screen.getByRole('button', {
      name: /upload wall image first/i,
    });

    expect(screen.getByTestId('workspace-shell')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();
    expect(screen.queryByRole('link', { name: /overlay/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /generator/i })).not.toBeInTheDocument();

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
      expect(
        screen.getByRole('button', { name: /generate patterns/i })
      ).toBeEnabled();
    });
  });

  it('supports upload -> generate -> select flow without route switching', async () => {
    const user = userEvent.setup();
    renderApp();

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    await user.click(await screen.findByRole('button', { name: /generate patterns/i }));
    const patternCard = await screen.findByTestId('pattern-card-pattern-route-1');
    await user.click(patternCard);

    await waitFor(() => {
      expect(patternCard).toHaveClass('selected');
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(1);
      expect(mockCalculateOverlay).toHaveBeenCalledWith({
        image_id: uploadedImage.image_id,
        pattern_id: generatedPatterns[0]?.id,
        overlay_state: {
          left: 80,
          top: 80,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      });
      expect(screen.getByTestId('overlay-canvas')).toBeInTheDocument();
    });
  });
});
