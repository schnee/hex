import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import { WORKSPACE_ROUTES } from '../../src/routes/workspaceRoutes';
import { normalizeGeneratedPatternPngData as toPngDataUrl } from '../../src/services/api';
import type { Pattern, UploadResponse } from '../../src/types/api';

interface DraggableMockProps {
  children: ReactNode;
  position?: { x?: number; y?: number };
  onStop?: (_event: unknown, data: { x: number; y: number }) => void;
}

interface ResizableMockProps {
  children: ReactNode;
  width?: number;
  height?: number;
  onResizeStop?: (
    _event: unknown,
    data: { size: { width: number; height: number } }
  ) => void;
}

const RAW_BASE64_PATTERN = 'bW9jay1wYXR0ZXJu';

const {
  mockGeneratePatterns,
  mockUploadImage,
  mockDownloadPattern,
  mockCalculateOverlay,
} = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
  mockUploadImage: vi.fn(),
  mockDownloadPattern: vi.fn(),
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

vi.mock('react-draggable', () => ({
  default: ({ children, position, onStop }: DraggableMockProps) => (
    <div
      data-testid="draggable-overlay"
      data-x={position?.x}
      data-y={position?.y}
    >
      <button
        type="button"
        aria-label="mock drag overlay"
        onClick={() => onStop?.({}, { x: 160, y: 120 })}
      >
        Drag overlay
      </button>
      {children}
    </div>
  ),
}));

vi.mock('react-resizable', () => ({
  ResizableBox: ({ children, width, height, onResizeStop }: ResizableMockProps) => (
    <div
      data-testid="resizable-overlay"
      data-width={width}
      data-height={height}
    >
      <button
        type="button"
        aria-label="mock resize overlay"
        onClick={() => onResizeStop?.({}, { size: { width: 260, height: 180 } })}
      >
        Resize overlay
      </button>
      {children}
    </div>
  ),
}));

const generatedPattern: Pattern = {
  id: 'pattern-ovr',
  seed: 42,
  width_inches: 10.5,
  height_inches: 5.9,
  aspect_ratio: 1.78,
  aspect_deviation: 2.1,
  png_data: toPngDataUrl(RAW_BASE64_PATTERN),
  hexes: [{ q: 0, r: 0 }],
  colors: ['#ff0000', '#00ff00', '#0000ff'],
};

const uploadedImage: UploadResponse = {
  image_id: 'img-ovr-1',
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

describe('Overlay Positioning Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', WORKSPACE_ROUTES.generator);
    mockGeneratePatterns.mockResolvedValue({
      success: true,
      data: { patterns: [generatedPattern] },
    });
    mockUploadImage.mockResolvedValue({
      success: true,
      data: uploadedImage,
    });
    mockCalculateOverlay.mockResolvedValue({
      success: true,
      data: {
        physical_dimensions: {
          width_inches: 10.5,
          height_inches: 5.9,
        },
        visual_dimensions: {
          width_px: 260,
          height_px: 180,
        },
      },
    });
    mockDownloadPattern.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  });

  it('renders overlay workspace and backend-calculated dimensions after generate, select, and upload', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));

    await user.click(screen.getByRole('link', { name: /overlay/i }));
    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.overlay);
    expect(screen.getByLabelText(/upload wall image/i)).toBeInTheDocument();

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    await waitFor(() => {
      expect(mockUploadImage).toHaveBeenCalledWith(file);
      expect(mockCalculateOverlay).toHaveBeenCalledWith({
        image_id: uploadedImage.image_id,
        pattern_id: generatedPattern.id,
        overlay_state: {
          left: 80,
          top: 80,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      });
      expect(screen.getByTestId('overlay-canvas')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /wall background/i })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /pattern overlay/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Physical Layout Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Visual Overlay Size')).toBeInTheDocument();
    expect(screen.getByText('10.5 in × 5.9 in')).toBeInTheDocument();
    expect(screen.getByText('260 px × 180 px')).toBeInTheDocument();
  });

  it('applies drag and resize interactions while keeping selected visual state', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    await screen.findByTestId('overlay-canvas');

    await user.click(screen.getByRole('button', { name: 'Zoom In' }));
    await user.click(screen.getByRole('button', { name: 'Pan Right' }));

    expect(screen.getByTestId('viewport-scale-value')).toHaveTextContent('1.10x');
    expect(screen.getByTestId('viewport-offset-x-value')).toHaveTextContent('20');

    const draggable = screen.getByTestId('draggable-overlay');
    const resizable = screen.getByTestId('resizable-overlay');
    const overlayImage = screen.getByTestId('overlay-image');

    expect(draggable).toHaveAttribute('data-x', '80');
    expect(draggable).toHaveAttribute('data-y', '80');
    expect(resizable).toHaveAttribute('data-width', '100');
    expect(resizable).toHaveAttribute('data-height', '100');
    expect(overlayImage).toHaveClass('overlay-selected');

    await user.click(screen.getByRole('button', { name: /mock drag overlay/i }));
    await user.click(screen.getByRole('button', { name: /mock resize overlay/i }));

    await waitFor(() => {
      expect(mockCalculateOverlay).toHaveBeenNthCalledWith(2, {
        image_id: uploadedImage.image_id,
        pattern_id: generatedPattern.id,
        overlay_state: {
          left: 160,
          top: 120,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      });

      expect(mockCalculateOverlay).toHaveBeenNthCalledWith(3, {
        image_id: uploadedImage.image_id,
        pattern_id: generatedPattern.id,
        overlay_state: {
          left: 160,
          top: 120,
          scaleX: 2.6,
          scaleY: 1.8,
          rotation: 0,
        },
      });
    });

    expect(screen.getByTestId('draggable-overlay')).toHaveAttribute('data-x', '160');
    expect(screen.getByTestId('draggable-overlay')).toHaveAttribute('data-y', '120');
    expect(screen.getByTestId('resizable-overlay')).toHaveAttribute('data-width', '260');
    expect(screen.getByTestId('resizable-overlay')).toHaveAttribute('data-height', '180');
    expect(screen.getByTestId('overlay-image')).toHaveClass('overlay-selected');
  });

  it('supports deterministic deselect then reselect interactions', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    const canvas = await screen.findByTestId('overlay-canvas');
    const overlayImage = screen.getByTestId('overlay-image');
    expect(overlayImage).toHaveClass('overlay-selected');

    await user.click(canvas);
    expect(screen.getByTestId('overlay-image')).toHaveClass('overlay-unselected');

    await user.click(screen.getByTestId('overlay-image'));
    expect(screen.getByTestId('overlay-image')).toHaveClass('overlay-selected');
  });

  it('surfaces overlay API detail text when calculate request fails', async () => {
    const user = userEvent.setup();
    mockCalculateOverlay.mockResolvedValueOnce({
      success: false,
      error: { detail: 'Overlay dimensions unavailable for this image.' },
    });

    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    expect(
      await screen.findByText('Overlay dimensions unavailable for this image.')
    ).toBeInTheDocument();
  });

  it('keeps only latest overlay response and shows explicit status transitions', async () => {
    const user = userEvent.setup();

    const deferred: Array<{
      resolve: (value: unknown) => void;
    }> = [];

    mockCalculateOverlay.mockImplementation(() => {
      return new Promise(resolve => {
        deferred.push({ resolve });
      });
    });

    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    expect(
      await screen.findByText(/refreshing overlay dimensions\.\.\./i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mock drag overlay/i }));

    expect(deferred.length).toBe(2);

    const latestRequest = deferred[1];
    if (latestRequest) {
      latestRequest.resolve({
        success: true,
        data: {
          physical_dimensions: {
            width_inches: 12.4,
            height_inches: 7.1,
          },
          visual_dimensions: {
            width_px: 310,
            height_px: 200,
          },
        },
      });
    }

    expect(
      await screen.findByText(/overlay dimensions updated\./i)
    ).toBeInTheDocument();
    expect(screen.getByText('12.4 in × 7.1 in')).toBeInTheDocument();

    const staleRequest = deferred[0];
    if (staleRequest) {
      staleRequest.resolve({
        success: false,
        error: { detail: 'Stale overlay failure' },
      });
    }

    await waitFor(() => {
      expect(screen.queryByText(/stale overlay failure/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          /overlay update failed\. adjust placement or re-upload image and retry\./i
        )
      ).not.toBeInTheDocument();
    });
  });

  it('replaces overlay failure status with success after next interaction', async () => {
    const user = userEvent.setup();

    mockCalculateOverlay
      .mockResolvedValueOnce({
        success: false,
        error: { detail: 'Temporary overlay failure' },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          physical_dimensions: {
            width_inches: 11.8,
            height_inches: 6.4,
          },
          visual_dimensions: {
            width_px: 295,
            height_px: 190,
          },
        },
      });

    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await user.click(await screen.findByTestId('pattern-card-pattern-ovr'));
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    expect(
      await screen.findByText(
        /overlay update failed\. adjust placement or re-upload image and retry\./i
      )
    ).toBeInTheDocument();
    expect(await screen.findByText(/temporary overlay failure/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mock drag overlay/i }));

    expect(
      await screen.findByText(/overlay dimensions updated\./i)
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText(
          /overlay update failed\. adjust placement or re-upload image and retry\./i
        )
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/temporary overlay failure/i)).not.toBeInTheDocument();
    });
  });
});
