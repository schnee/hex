import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import { WORKSPACE_ROUTES } from '../../src/routes/workspaceRoutes';
import { normalizeGeneratedPatternPngData as toPngDataUrl } from '../../src/services/api';
import type { Pattern } from '../../src/types/api';

const RAW_BASE64_PATTERN_1 = 'bW9jay0x';
const RAW_BASE64_PATTERN_2 = 'bW9jay0y';

const { mockGeneratePatterns, mockDownloadPattern } = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
  mockDownloadPattern: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    generatePatterns: mockGeneratePatterns,
  },
  downloadPattern: mockDownloadPattern,
  normalizeGeneratedPatternPngData: (value: string) =>
    value.startsWith('data:image/') ? value : `data:image/png;base64,${value}`,
}));

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

describe('Pattern Generation Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', WORKSPACE_ROUTES.generator);
    mockGeneratePatterns.mockResolvedValue({
      success: true,
      data: { patterns: generatedPatterns },
    });
    mockDownloadPattern.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders generated variants after one generate action', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.generator);

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

  it('keeps generator route operable after navigation to overlay route', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    await screen.findByTestId('pattern-card-generated-pattern-1');

    await user.click(screen.getByRole('link', { name: /overlay/i }));
    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.overlay);

    await user.click(screen.getByRole('link', { name: /generator/i }));
    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.generator);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    await waitFor(() => {
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('pattern-card-generated-pattern-2')).toBeInTheDocument();
    });
  });
});
