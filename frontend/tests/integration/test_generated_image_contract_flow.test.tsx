import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import { WORKSPACE_ROUTES } from '../../src/routes/workspaceRoutes';

interface ChildrenOnlyProps {
  children: ReactNode;
}

vi.mock('react-draggable', () => ({
  default: ({ children }: ChildrenOnlyProps) => <div>{children}</div>,
}));

vi.mock('react-resizable', () => ({
  ResizableBox: ({ children }: ChildrenOnlyProps) => <div>{children}</div>,
}));

const RAW_BASE64_PNG = 'cmF3LWJhc2U2NC1wYXR0ZXJu';

const renderApp = () =>
  render(
    <PatternContextProvider>
      <App />
    </PatternContextProvider>
  );

describe('Generated image contract routed flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.pushState({}, '', WORKSPACE_ROUTES.generator);
  });

  it('normalizes backend raw png_data and preserves selected pattern across overlay route', async () => {
    const user = userEvent.setup();
    const overlayRequests: Array<{ pattern_id?: string }> = [];

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith('/api/patterns/generate')) {
        return new Response(
          JSON.stringify({
            patterns: [
              {
                id: 'pattern-raw-1',
                seed: 42,
                width_inches: 10.5,
                height_inches: 5.9,
                aspect_ratio: 1.78,
                aspect_deviation: 2.1,
                png_data: RAW_BASE64_PNG,
                hexes: [{ q: 0, r: 0 }],
                colors: ['#273c6b'],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/api/images/upload')) {
        return new Response(
          JSON.stringify({
            image_id: 'image-1',
            width: 1200,
            height: 800,
            processed_data: 'data:image/jpeg;base64,d2FsbA==',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/api/overlay/calculate')) {
        const requestBody = JSON.parse((init?.body as string) ?? '{}');
        overlayRequests.push(requestBody);

        return new Response(
          JSON.stringify({
            physical_dimensions: { width_inches: 10.5, height_inches: 5.9 },
            visual_dimensions: { width_px: 260, height_px: 180 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response('Not Found', { status: 404 });
    });

    renderApp();

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));
    const patternCard = await screen.findByTestId('pattern-card-pattern-raw-1');
    const previewImage = screen.getByRole('img', {
      name: /pattern preview for pattern-raw-1/i,
    });

    await waitFor(() => {
      expect(previewImage).toHaveAttribute(
        'src',
        expect.stringMatching(/^data:image\/png;base64,/) as unknown as string
      );
    });

    await user.click(patternCard);
    await user.click(screen.getByRole('link', { name: /overlay/i }));

    const file = new File(['wall image'], 'wall.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload wall image/i), file);

    const overlayImage = await screen.findByTestId('overlay-image');
    expect(overlayImage).toHaveAttribute(
      'src',
      expect.stringMatching(/^data:image\/png;base64,/) as unknown as string
    );

    await waitFor(() => {
      expect(overlayRequests).toHaveLength(1);
      expect(overlayRequests[0]?.pattern_id).toBe('pattern-raw-1');
    });
  });
});
