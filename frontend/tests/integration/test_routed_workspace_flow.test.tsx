import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import { WORKSPACE_ROUTES } from '../../src/routes/workspaceRoutes';
import type { Pattern } from '../../src/types/api';

const { mockGeneratePatterns } = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    generatePatterns: mockGeneratePatterns,
    calculateOverlay: vi.fn(),
    uploadImage: vi.fn(),
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

const renderApp = () =>
  render(
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  );

describe('Routed Workspace Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePatterns.mockResolvedValue({
      success: true,
      data: { patterns: generatedPatterns },
    });
    window.history.pushState({}, '', WORKSPACE_ROUTES.base);
  });

  it('redirects base route to generator route', async () => {
    renderApp();

    await waitFor(() => {
      expect(window.location.pathname).toBe(WORKSPACE_ROUTES.generator);
    });
  });

  it('keeps selected pattern after navigating to overlay and back', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', WORKSPACE_ROUTES.generator);
    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    const patternCard = await screen.findByTestId('pattern-card-pattern-route-1');
    await user.click(patternCard);

    expect(patternCard).toHaveClass('selected');

    await user.click(screen.getByRole('link', { name: /overlay/i }));
    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.overlay);

    await user.click(screen.getByRole('link', { name: /generator/i }));
    expect(window.location.pathname).toBe(WORKSPACE_ROUTES.generator);

    expect(await screen.findByTestId('pattern-card-pattern-route-1')).toHaveClass(
      'selected'
    );
  });

  it('uses route links instead of tab-role controls for workspace navigation', () => {
    renderApp();

    expect(screen.getByRole('link', { name: /generator/i })).toHaveAttribute(
      'href',
      WORKSPACE_ROUTES.generator
    );
    expect(screen.getByRole('link', { name: /overlay/i })).toHaveAttribute(
      'href',
      WORKSPACE_ROUTES.overlay
    );
    expect(screen.queryByRole('tab', { name: /overlay/i })).not.toBeInTheDocument();
  });
});
