import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PatternDisplay } from '../../src/components/PatternDisplay';
import type { Pattern } from '../../src/types/api';
import { downloadPattern } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  downloadPattern: vi.fn(),
}));

const mockPatterns: Pattern[] = [
  {
    id: 'pattern-1',
    seed: 42,
    width_inches: 10.5,
    height_inches: 5.9,
    aspect_ratio: 1.78,
    aspect_deviation: 2.1,
    png_data: 'data:image/png;base64,mock-1',
    hexes: [{ q: 0, r: 0 }],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
  },
  {
    id: 'pattern-2',
    seed: 123,
    width_inches: 8,
    height_inches: 6,
    aspect_ratio: 1.33,
    aspect_deviation: 5.2,
    png_data: 'data:image/png;base64,mock-2',
    hexes: [{ q: 1, r: 0 }],
    colors: ['#ffff00', '#ff00ff'],
  },
];

describe('PatternDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks only one card selected for click and keyboard selection', async () => {
    const user = userEvent.setup();

    const SelectionHarness = () => {
      const [selectedId, setSelectedId] = React.useState<string | undefined>(
        undefined
      );

      return (
        <PatternDisplay
          patterns={mockPatterns}
          onPatternSelect={pattern => setSelectedId(pattern.id)}
          {...(selectedId ? { selectedPatternId: selectedId } : {})}
        />
      );
    };

    render(<SelectionHarness />);

    const cardOne = screen.getByTestId('pattern-card-pattern-1');
    const cardTwo = screen.getByTestId('pattern-card-pattern-2');

    await user.click(cardOne);
    expect(cardOne).toHaveClass('selected');
    expect(cardTwo).not.toHaveClass('selected');

    fireEvent.keyDown(cardTwo, { key: 'Enter' });

    expect(cardTwo).toHaveClass('selected');
    expect(cardOne).not.toHaveClass('selected');
  });

  it('downloads PNGs with loading/error feedback and keyboard-reachable controls', async () => {
    const user = userEvent.setup();

    vi.mocked(downloadPattern).mockResolvedValueOnce(
      new Blob(['png'], { type: 'image/png' })
    );

    render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />);

    const firstCard = screen.getByTestId('pattern-card-pattern-1');
    firstCard.focus();

    // Download control must be reachable for keyboard users.
    const keyboardDownloadButton = await screen.findByRole('button', {
      name: /download pattern pattern-1/i,
    });

    await user.click(keyboardDownloadButton);

    await waitFor(() => {
      expect(downloadPattern).toHaveBeenCalledWith('pattern-1');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    vi.mocked(downloadPattern).mockRejectedValueOnce(new Error('download failed'));

    const secondCard = screen.getByTestId('pattern-card-pattern-2');
    await user.click(secondCard);

    const secondDownloadButton = await screen.findByRole('button', {
      name: /download pattern pattern-2/i,
    });

    await user.click(secondDownloadButton);

    expect(await screen.findByText(/download failed/i)).toBeInTheDocument();
  });

  it('renders variant metadata and accessibility labels for every card', () => {
    render(<PatternDisplay patterns={mockPatterns} onPatternSelect={() => {}} />);

    expect(screen.getByText(/10\.5 × 5\.9 inches/i)).toBeInTheDocument();
    expect(screen.getByText(/8\.0 × 6\.0 inches/i)).toBeInTheDocument();
    expect(screen.getByText(/seed: 42/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.1% deviation/i)).toHaveClass('deviation-good');

    expect(screen.getByTestId('pattern-card-pattern-1')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('aspect ratio 1.78')
    );
    expect(screen.getByTestId('pattern-card-pattern-2')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('seed 123')
    );
  });
});
