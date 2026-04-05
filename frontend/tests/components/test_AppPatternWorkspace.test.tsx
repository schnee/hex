import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import type { Pattern, UploadResponse } from '../../src/types/api';

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
];

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

const setHorizontalBounds = (
  element: HTMLElement,
  { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number }
) => {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
  });
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    get: () => scrollWidth,
  });
};

const expectNoHorizontalOverflow = (element: HTMLElement) => {
  expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
};

const mockPatterns: Pattern[] = [
  {
    id: 'pattern-1',
    seed: 101,
    width_inches: 12,
    height_inches: 6,
    aspect_ratio: 2,
    aspect_deviation: 1.5,
    png_data: 'data:image/png;base64,mock-1',
    hexes: [{ q: 0, r: 0 }],
    colors: ['#ff0000', '#00ff00'],
  },
  {
    id: 'pattern-2',
    seed: 202,
    width_inches: 10,
    height_inches: 8,
    aspect_ratio: 1.25,
    aspect_deviation: 2.3,
    png_data: 'data:image/png;base64,mock-2',
    hexes: [{ q: 1, r: -1 }],
    colors: ['#0000ff', '#ffff00'],
  },
];

const mockUploadResponse: UploadResponse = {
  image_id: 'img-workspace-1',
  width: 1920,
  height: 1080,
  processed_data: 'data:image/jpeg;base64,mock-wall',
};

vi.mock('../../src/services/api', () => ({
  apiClient: {
    calculateOverlay: vi.fn().mockResolvedValue({
      success: true,
      data: {
        physical_dimensions: {
          width_inches: 10.5,
          height_inches: 6.0,
        },
        visual_dimensions: {
          width_px: 210,
          height_px: 120,
        },
      },
    }),
  },
}));

vi.mock('../../src/components/PatternGenerator', () => ({
  PatternGenerator: ({
    onPatternsGenerated,
    disabled,
  }: {
    onPatternsGenerated: (patterns: Pattern[]) => void;
    disabled?: boolean;
  }) => (
    <div>
      <button disabled={disabled} onClick={() => onPatternsGenerated(mockPatterns)}>
        Generate mocked patterns
      </button>
    </div>
  ),
}));

vi.mock('../../src/components/PatternDisplay', () => ({
  PatternDisplay: ({
    patterns,
    onPatternSelect,
    selectedPatternId,
  }: {
    patterns: Pattern[] | null;
    onPatternSelect: (pattern: Pattern) => void;
    selectedPatternId?: string;
  }) => (
    <div>
      {patterns && patterns.length > 0 ? (
        patterns.map(pattern => (
          <button
            key={pattern.id}
            data-testid={`pattern-card-${pattern.id}`}
            className={selectedPatternId === pattern.id ? 'selected' : ''}
            onClick={() => onPatternSelect(pattern)}
          >
            {pattern.id}
          </button>
        ))
      ) : (
        <p>No patterns available</p>
      )}
    </div>
  ),
}));

vi.mock('../../src/components/WallImageUploader', () => ({
  WallImageUploader: ({
    onUploadComplete,
  }: {
    onUploadComplete: (image: UploadResponse) => void;
  }) => (
    <button onClick={() => onUploadComplete(mockUploadResponse)}>
      Upload mocked wall image
    </button>
  ),
}));

vi.mock('../../src/components/OverlayCanvas', () => ({
  OverlayCanvas: () => <div data-testid="overlay-canvas" />,
}));

describe('App Pattern Workspace', () => {
  it('maintains no-horizontal-overflow workspace shell invariants at mobile checkpoints', () => {
    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    const workspaceShell = screen.getByTestId('workspace-shell');

    MOBILE_VIEWPORTS.forEach(({ width, height }) => {
      setViewport(width, height);
      setHorizontalBounds(workspaceShell, {
        clientWidth: width,
        scrollWidth: width,
      });

      expectNoHorizontalOverflow(workspaceShell);
    });
  });

  it('keeps generation gated until upload completes', async () => {
    const user = userEvent.setup();

    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    const generateButton = screen.getByRole('button', {
      name: /generate mocked patterns/i,
    });

    expect(generateButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /upload mocked wall image/i }));

    expect(generateButton).toBeEnabled();
  });

  it('shows uploaded wall preview before any pattern is selected', async () => {
    const user = userEvent.setup();

    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    expect(screen.queryByTestId('uploaded-wall-preview')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /upload mocked wall image/i }));

    const preview = screen.getByTestId('uploaded-wall-preview');
    const previewImage = screen.getByRole('img', {
      name: /uploaded wall image preview/i,
    });

    expect(preview).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', mockUploadResponse.processed_data);
    expect(screen.queryByTestId('overlay-canvas')).not.toBeInTheDocument();
  });

  it('enables generation after upload and keeps single selected pattern state', async () => {
    const user = userEvent.setup();

    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    expect(screen.queryByTestId('generated-patterns-section')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /upload mocked wall image/i }));
    await user.click(screen.getByRole('button', { name: /generate mocked patterns/i }));

    const patternOneCard = screen.getByTestId('pattern-card-pattern-1');
    const patternTwoCard = screen.getByTestId('pattern-card-pattern-2');

    expect(patternOneCard).toBeInTheDocument();
    expect(patternTwoCard).toBeInTheDocument();
    expect(patternOneCard).not.toHaveClass('selected');
    expect(patternTwoCard).not.toHaveClass('selected');

    await user.click(patternOneCard);
    expect(patternOneCard).toHaveClass('selected');
    expect(patternTwoCard).not.toHaveClass('selected');

    await user.click(patternTwoCard);
    expect(patternOneCard).not.toHaveClass('selected');
    expect(patternTwoCard).toHaveClass('selected');
  });

  it('supports collapsing and expanding generator drawer while keeping patterns outside drawer', async () => {
    const user = userEvent.setup();

    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    const drawer = screen.getByTestId('generator-drawer');
    const drawerContent = screen.getByTestId('generator-drawer-content');
    const imageOverlaySection = screen.getByTestId('image-overlay-section');
    const workspaceShell = screen.getByTestId('workspace-shell');
    const collapseButton = screen.getByRole('button', {
      name: /collapse generator drawer/i,
    });

    expect(drawerContent).not.toHaveAttribute('hidden');
    expect(drawer).toContainElement(drawerContent);
    expect(screen.queryByTestId('generated-patterns-section')).not.toBeInTheDocument();
    expect(workspaceShell).not.toHaveClass('workspace-layout-has-patterns');

    await user.click(screen.getByRole('button', { name: /upload mocked wall image/i }));
    await user.click(screen.getByRole('button', { name: /generate mocked patterns/i }));

    const generatedPatternsSection = screen.getByTestId('generated-patterns-section');
    const firstPatternCard = screen.getByTestId('pattern-card-pattern-1');
    expect(generatedPatternsSection).toContainElement(firstPatternCard);
    expect(drawer).not.toContainElement(firstPatternCard);
    expect(
      imageOverlaySection.compareDocumentPosition(generatedPatternsSection)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(workspaceShell).toHaveClass('workspace-layout-has-patterns');

    await user.click(collapseButton);
    expect(drawerContent).toHaveAttribute('hidden');
    expect(
      screen.getByRole('button', { name: /expand generator drawer/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /expand generator drawer/i }));
    expect(drawerContent).not.toHaveAttribute('hidden');
    expect(generatedPatternsSection).toContainElement(firstPatternCard);
  });

});
