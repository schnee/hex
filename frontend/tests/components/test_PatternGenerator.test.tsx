import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatternGenerator } from '../../src/components/PatternGenerator';
import type { Pattern } from '../../src/types/api';

const { mockGeneratePatterns } = vi.hoisted(() => ({
  mockGeneratePatterns: vi.fn(),
}));

vi.mock('../../src/services/api', () => ({
  apiClient: {
    generatePatterns: mockGeneratePatterns,
  },
}));

const mockPatterns: Pattern[] = [
  {
    id: 'pattern-1',
    seed: 42,
    width_inches: 10.5,
    height_inches: 5.9,
    aspect_ratio: 1.78,
    aspect_deviation: 2.1,
    png_data: 'data:image/png;base64,mock',
    hexes: [{ q: 0, r: 0 }],
    colors: ['#ff0000', '#00ff00', '#0000ff'],
  },
];

describe('PatternGenerator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePatterns.mockReset();
  });

  it('renders computed total tiles as a display output', () => {
    render(<PatternGenerator onPatternsGenerated={() => {}} />);

    const totalTilesDisplay = screen.getByTestId('computed-total-tiles');
    expect(totalTilesDisplay.tagName).toBe('OUTPUT');
    expect(totalTilesDisplay).toHaveTextContent('50');
  });

  it('shows field-level validation errors for invalid values and blocks submit', async () => {
    const user = userEvent.setup();
    render(<PatternGenerator onPatternsGenerated={() => {}} />);

    const aspectWidthInput = screen.getByLabelText(/aspect width/i);
    const colorsInput = screen.getByLabelText(/colors/i);
    const color1CountInput = screen.getByLabelText(/color 1 count/i);
    const color2CountInput = screen.getByLabelText(/color 2 count/i);
    const color3CountInput = screen.getByLabelText(/color 3 count/i);
    const minLengthInput = screen.getByLabelText(/minimum tendril length/i);
    const maxLengthInput = screen.getByLabelText(/maximum tendril length/i);
    const seedInput = screen.getByLabelText(/seed/i);

    await user.clear(aspectWidthInput);
    await user.type(aspectWidthInput, '0.05');
    fireEvent.blur(aspectWidthInput);

    await user.clear(color1CountInput);
    await user.type(color1CountInput, '0');
    await user.clear(color2CountInput);
    await user.type(color2CountInput, '0');
    await user.clear(color3CountInput);
    await user.type(color3CountInput, '0');
    fireEvent.blur(color3CountInput);

    await user.clear(colorsInput);
    await user.type(colorsInput, 'red,#ff0000');
    fireEvent.blur(colorsInput);

    await user.clear(minLengthInput);
    await user.type(minLengthInput, '6');
    await user.clear(maxLengthInput);
    await user.type(maxLengthInput, '3');
    fireEvent.blur(maxLengthInput);

    await user.clear(seedInput);
    await user.type(seedInput, '1000000001');
    fireEvent.blur(seedInput);

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    expect(
      screen.getByText(/aspect width must be between 0.1 and 100/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/total tiles must be between 1 and 1000/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid hex color format/i)).toBeInTheDocument();
    expect(
      screen.getByText(/maximum length must be greater than or equal to minimum/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/seed must be between 0 and 1000000000/i)).toBeInTheDocument();

    expect(mockGeneratePatterns).not.toHaveBeenCalled();
  });

  it('submits a valid GenerateRequest and returns multiple variants', async () => {
    const user = userEvent.setup();
    const onPatternsGenerated = vi.fn();

    let resolveRequest: ((value: unknown) => void) | undefined;
    const pendingRequest = new Promise(resolve => {
      resolveRequest = resolve;
    });

    mockGeneratePatterns.mockReturnValue(pendingRequest);

    render(<PatternGenerator onPatternsGenerated={onPatternsGenerated} />);

    await user.selectOptions(screen.getByLabelText(/color mode/i), 'gradient');

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    expect(screen.getAllByText(/generating patterns\.\.\./i).length).toBeGreaterThan(0);

    resolveRequest?.({
      success: true,
      data: { patterns: mockPatterns },
    });

    await waitFor(() => {
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(1);
    });

    expect(mockGeneratePatterns).toHaveBeenCalledWith(
      expect.objectContaining({
        num_layouts: 3,
        total_tiles: 50,
        color_mode: 'gradient',
        gradient_axis: 'auto',
        colors: ['#273c6b', '#92323d', '#D8C03F'],
        counts: [17, 17, 16],
      })
    );

    await waitFor(() => {
      expect(onPatternsGenerated).toHaveBeenCalledWith(mockPatterns);
    });
    expect(
      await screen.findByText(
        /patterns generated\. pick a card below to overlay on your wall\./i
      )
    ).toBeInTheDocument();
  });

  it('maps scheme60 color selectors to backend role indices', async () => {
    const user = userEvent.setup();

    mockGeneratePatterns.mockResolvedValueOnce({
      success: true,
      data: { patterns: mockPatterns },
    });

    render(<PatternGenerator onPatternsGenerated={() => {}} />);

    await user.selectOptions(screen.getByLabelText(/color mode/i), 'scheme60');
    await user.selectOptions(screen.getByLabelText(/primary role/i), '2');
    await user.selectOptions(screen.getByLabelText(/secondary role/i), '0');
    await user.selectOptions(screen.getByLabelText(/accent role/i), '1');

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    await waitFor(() => {
      expect(mockGeneratePatterns).toHaveBeenCalledTimes(1);
    });

    expect(mockGeneratePatterns).toHaveBeenCalledWith(
      expect.objectContaining({
        color_mode: 'scheme60',
        roles: {
          dominant: 2,
          secondary: 0,
          accent: 1,
        },
      })
    );
  });

  it('shows backend and network error messages on failed submit', async () => {
    const user = userEvent.setup();
    const onPatternsGenerated = vi.fn();

    render(<PatternGenerator onPatternsGenerated={onPatternsGenerated} />);

    mockGeneratePatterns.mockResolvedValueOnce({
      success: false,
      error: { detail: 'Backend validation failed' },
    });

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    expect(
      await screen.findByText(
        /generation failed\. check highlighted inputs and try again\./i
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /generation request failed: backend validation failed/i
      )
    ).toBeInTheDocument();
    expect(onPatternsGenerated).not.toHaveBeenCalled();

    mockGeneratePatterns.mockRejectedValueOnce(new Error('Network down'));

    await user.click(screen.getByRole('button', { name: /generate patterns/i }));

    expect(
      await screen.findByText(
        /generation failed\. check highlighted inputs and try again\./i
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/generation request failed: network down/i)
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByText(/generation request failed: backend validation failed/i)
      ).not.toBeInTheDocument();
    });
    expect(onPatternsGenerated).not.toHaveBeenCalled();
  });
});
