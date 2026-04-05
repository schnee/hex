import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import { normalizeGeneratedPatternPngData as toPngDataUrl } from '../../src/services/api';
import type { Pattern, UploadResponse } from '../../src/types/api';

const RAW_BASE64_PATTERN_1 = 'bW9jay0x';
const RAW_BASE64_PATTERN_2 = 'bW9jay0y';

const {
  mockGeneratePatterns,
  mockDownloadPattern,
  mockUploadImage,
  mockCalculateOverlay,
} = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
  mockDownloadPattern: vi.fn(),
  mockUploadImage: vi.fn(),
  mockCalculateOverlay: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    generatePatterns: mockGeneratePatterns,
    uploadImage: mockUploadImage,
    calculateOverlay: mockCalculateOverlay,
  },
  downloadPattern: mockDownloadPattern,
  normalizeGeneratedPatternPngData: (value: string) =>
    value.startsWith('data:image/') ? value : `data:image/png;base64,${value}`,
}));

const uploadedImage: UploadResponse = {
  image_id: 'img-pattern-flow-1',
  width: 1920,
  height: 1080,
  processed_data: 'data:image/jpeg;base64,mock-wall',
};

const generatedPatterns: Pattern[] = [
  {
    id: 'generated-pattern-1',
    seed: 42,
    width_inches: 10.5,
    height_inches: 5.9,
    aspect_ratio: 1.78,
    aspect_deviation: 2.1,
    png_data: toPngDataUrl(RAW_BASE64_PATTERN_1),
    hexes: [{ q: 0, r: 0 }],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
  },
  {
    id: 'generated-pattern-2',
    seed: 42,
    width_inches: 9.8,
    height_inches: 6.2,
    aspect_ratio: 1.58,
    aspect_deviation: 3.2,
    png_data: toPngDataUrl(RAW_BASE64_PATTERN_2),
    hexes: [{ q: 1, r: -1 }],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
  },
];

const renderApp = () =>
  render(
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  );

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Pattern Generation Integration Flow', () => {
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
    mockDownloadPattern.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
  });

  const uploadWallImage = async (user: ReturnType<typeof userEvent.setup>) => {
    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
    });
  };

  it('renders generated variants after one generate action', async () => {
    const user = userEvent.setup();
    renderApp();

    await uploadWallImage(user);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    await waitFor(() => {
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(1);
      expect(mockGeneratePatterns).toHaveBeenCalledWith(
        expect.objectContaining({
          aspect_w: 16,
          aspect_h: 9,
          total_tiles: 50,
          num_layouts: 3,
        })
      );
      expect(screen.getByTestId('patterns-grid')).toBeInTheDocument();
      expect(screen.getByTestId('pattern-card-generated-pattern-1')).toBeInTheDocument();
      expect(screen.getByTestId('pattern-card-generated-pattern-2')).toBeInTheDocument();
    });
  });

  it('marks selected variant card as active', async () => {
    const user = userEvent.setup();
    renderApp();

    await uploadWallImage(user);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    const firstCard = await screen.findByTestId('pattern-card-generated-pattern-1');
    const secondCard = await screen.findByTestId('pattern-card-generated-pattern-2');

    await user.click(firstCard);
    expect(firstCard).toHaveClass('selected');
    expect(secondCard).not.toHaveClass('selected');

    await user.click(secondCard);
    expect(secondCard).toHaveClass('selected');
    expect(firstCard).not.toHaveClass('selected');
  });

  it('downloads a generated variant via API call', async () => {
    const user = userEvent.setup();
    renderApp();

    await uploadWallImage(user);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    const firstCard = await screen.findByTestId('pattern-card-generated-pattern-1');
    await user.hover(firstCard);

    const downloadButton = await screen.findByRole('button', {
      name: /download pattern generated-pattern-1/i,
    });

    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockDownloadPattern).toHaveBeenCalledWith('generated-pattern-1');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('supports repeat generation attempts in the same workspace', async () => {
    const user = userEvent.setup();
    renderApp();

    await uploadWallImage(user);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await screen.findByTestId('pattern-card-generated-pattern-1');

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    await waitFor(() => {
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('pattern-card-generated-pattern-2')).toBeInTheDocument();
    });
  });

  it('covers upload -> generate -> select flow at mobile viewport width', async () => {
    const user = userEvent.setup();
    setViewport(375, 812);
    renderApp();

    await uploadWallImage(user);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    const selectedCard = await screen.findByTestId(
      'pattern-card-generated-pattern-1'
    );
    await user.click(selectedCard);

    await waitFor(() => {
      expect(selectedCard).toHaveClass('selected');
      expect(mockCalculateOverlay).toHaveBeenCalledWith(
        expect.objectContaining({
          image_id: uploadedImage.image_id,
          pattern_id: 'generated-pattern-1',
        })
      );
      expect(screen.getByTestId('overlay-canvas')).toBeInTheDocument();
    });
  });
});
