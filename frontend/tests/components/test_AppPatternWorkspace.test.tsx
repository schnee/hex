import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { PatternContextProvider } from '../../src/context/PatternContext';
import type { Pattern, UploadResponse } from '../../src/types/api';

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

  it('enables generation after upload and keeps single selected pattern state', async () => {
    const user = userEvent.setup();

    render(
      <PatternContextProvider>
        <App />
      </PatternContextProvider>
    );

    expect(screen.getByText('No patterns available')).toBeInTheDocument();

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

});
