import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { OverlayState } from '../../src/types/api';
import { OverlayCanvas } from '../../src/components/OverlayCanvas';

interface DraggableMockProps {
  children: ReactNode;
  onStop?: (_event: unknown, data: { x: number; y: number }) => void;
}

interface ResizableMockProps {
  children: ReactNode;
  resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
  onResizeStop?: (
    _event: unknown,
    data: { size: { width: number; height: number } }
  ) => void;
}

vi.mock('react-draggable', () => ({
  default: ({ children, onStop }: DraggableMockProps) => (
    <div data-testid="draggable-mock">
      <button
        type="button"
        onClick={() => onStop?.({}, { x: 120, y: 80 })}
        aria-label="mock drag"
      >
        Drag
      </button>
      {children}
    </div>
  ),
}));

vi.mock('react-resizable', () => ({
  ResizableBox: ({ children, onResizeStop, resizeHandles }: ResizableMockProps) => (
    <div data-testid="resizable-mock">
      <button
        type="button"
        onClick={() =>
          onResizeStop?.({}, { size: { width: 300, height: 225 } })
        }
        aria-label="mock resize"
      >
        Resize
      </button>
      {resizeHandles?.includes('se') ? (
        <span data-testid="overlay-resize-handle" />
      ) : null}
      {children}
    </div>
  ),
}));

const baseOverlayState: OverlayState = {
  left: 20,
  top: 30,
  scaleX: 1,
  scaleY: 1,
};

describe('OverlayCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits updated left/top through onOverlayStateChange during drag', async () => {
    const user = userEvent.setup();
    const onOverlayStateChange = vi.fn();

    render(
      <OverlayCanvas
        wallImageSrc="data:image/jpeg;base64,wall"
        patternImageSrc="data:image/png;base64,pattern"
        overlayState={baseOverlayState}
        viewportScale={1}
        viewportOffsetX={0}
        viewportOffsetY={0}
        isSelected={true}
        onOverlayStateChange={onOverlayStateChange}
        onViewportScaleChange={vi.fn()}
        onViewportOffsetChange={vi.fn()}
        onSelectionChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /mock drag/i }));

    expect(onOverlayStateChange).toHaveBeenCalledWith({
      left: 120,
      top: 80,
      scaleX: 1,
      scaleY: 1,
    });
  });

  it('emits updated scaleX/scaleY through onOverlayStateChange during resize', async () => {
    const user = userEvent.setup();
    const onOverlayStateChange = vi.fn();

    render(
      <OverlayCanvas
        wallImageSrc="data:image/jpeg;base64,wall"
        patternImageSrc="data:image/png;base64,pattern"
        overlayState={baseOverlayState}
        viewportScale={1}
        viewportOffsetX={0}
        viewportOffsetY={0}
        isSelected={true}
        onOverlayStateChange={onOverlayStateChange}
        onViewportScaleChange={vi.fn()}
        onViewportOffsetChange={vi.fn()}
        onSelectionChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /mock resize/i }));

    expect(onOverlayStateChange).toHaveBeenCalledWith({
      left: 20,
      top: 30,
      scaleX: 3,
      scaleY: 2.25,
    });
  });

  it('shows selected state class and supports deselect/reselect interactions', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();

    const { rerender } = render(
      <OverlayCanvas
        wallImageSrc="data:image/jpeg;base64,wall"
        patternImageSrc="data:image/png;base64,pattern"
        overlayState={baseOverlayState}
        viewportScale={1}
        viewportOffsetX={0}
        viewportOffsetY={0}
        isSelected={true}
        onOverlayStateChange={vi.fn()}
        onViewportScaleChange={vi.fn()}
        onViewportOffsetChange={vi.fn()}
        onSelectionChange={onSelectionChange}
      />
    );

    const overlay = screen.getByTestId('overlay-image');
    expect(overlay).toHaveClass('overlay-selected');
    expect(screen.getByTestId('overlay-resize-handle')).toBeInTheDocument();

    await user.click(screen.getByTestId('overlay-canvas'));
    expect(onSelectionChange).toHaveBeenCalledWith(false);

    rerender(
      <OverlayCanvas
        wallImageSrc="data:image/jpeg;base64,wall"
        patternImageSrc="data:image/png;base64,pattern"
        overlayState={baseOverlayState}
        viewportScale={1}
        viewportOffsetX={0}
        viewportOffsetY={0}
        isSelected={false}
        onOverlayStateChange={vi.fn()}
        onViewportScaleChange={vi.fn()}
        onViewportOffsetChange={vi.fn()}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByTestId('overlay-image')).toHaveClass('overlay-unselected');
    expect(screen.queryByTestId('overlay-resize-handle')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('overlay-image'));
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it('emits deterministic zoom and pan control updates', async () => {
    const user = userEvent.setup();
    const onViewportScaleChange = vi.fn();
    const onViewportOffsetChange = vi.fn();

    render(
      <OverlayCanvas
        wallImageSrc="data:image/jpeg;base64,wall"
        patternImageSrc="data:image/png;base64,pattern"
        overlayState={baseOverlayState}
        viewportScale={1}
        viewportOffsetX={0}
        viewportOffsetY={0}
        isSelected={true}
        onOverlayStateChange={vi.fn()}
        onViewportScaleChange={onViewportScaleChange}
        onViewportOffsetChange={onViewportOffsetChange}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Zoom In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom Out' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pan Left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pan Right' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pan Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pan Down' })).toBeInTheDocument();

    expect(screen.getByTestId('viewport-scale-value')).toHaveTextContent('1.00x');
    expect(screen.getByTestId('viewport-offset-x-value')).toHaveTextContent('0');
    expect(screen.getByTestId('viewport-offset-y-value')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Zoom In' }));
    await user.click(screen.getByRole('button', { name: 'Zoom Out' }));
    await user.click(screen.getByRole('button', { name: 'Pan Left' }));
    await user.click(screen.getByRole('button', { name: 'Pan Right' }));
    await user.click(screen.getByRole('button', { name: 'Pan Up' }));
    await user.click(screen.getByRole('button', { name: 'Pan Down' }));
    await user.click(screen.getByRole('button', { name: 'Reset View' }));

    expect(onViewportScaleChange).toHaveBeenCalled();
    expect(onViewportOffsetChange).toHaveBeenCalled();
  });
});
