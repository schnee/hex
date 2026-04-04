import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import type { OverlayState, Pattern, UploadResponse } from '../types/api';

interface OverlayViewerProps {
  wallImage: UploadResponse | null;
  pattern: Pattern | null;
  overlayState: OverlayState;
  onOverlayChange: (state: OverlayState) => void;
  enableDrag?: boolean;
  constrainToBounds?: boolean;
  lockAspectRatio?: boolean;
  minScale?: number;
  maxScale?: number;
  enableRotation?: boolean;
  showDimensions?: boolean;
  dimensionUnit?: 'inches' | 'cm';
}

const KEYBOARD_MOVE_STEP = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeRotation = (degrees: number): number => {
  let value = degrees % 360;
  if (value > 180) {
    value -= 360;
  }
  if (value < -180) {
    value += 360;
  }
  return value;
};

const asMouseEvent = (event: unknown): MouseEvent | null => {
  if (
    event !== null &&
    typeof event === 'object' &&
    'clientX' in event &&
    'clientY' in event
  ) {
    return event as MouseEvent;
  }
  return null;
};

export const OverlayViewer: React.FC<OverlayViewerProps> = ({
  wallImage,
  pattern,
  overlayState,
  onOverlayChange,
  enableDrag = true,
  constrainToBounds = false,
  lockAspectRatio = false,
  minScale = 0.1,
  maxScale = 10,
  enableRotation = true,
  showDimensions = true,
  dimensionUnit = 'inches',
}) => {
  const [patternLoadError, setPatternLoadError] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const rotationOrigin = useRef({ x: 0, y: 0 });

  const rotation = overlayState.rotation ?? 0;

  const commitOverlay = useCallback(
    (nextState: Partial<OverlayState>) => {
      onOverlayChange({
        ...overlayState,
        ...nextState,
      });
    },
    [onOverlayChange, overlayState]
  );

  const formattedDimensions = useMemo(() => {
    const width = (pattern?.width_inches ?? 0) * overlayState.scaleX;
    const height = (pattern?.height_inches ?? 0) * overlayState.scaleY;

    if (dimensionUnit === 'cm') {
      return {
        label: `${(width * 2.54).toFixed(1)} x ${(height * 2.54).toFixed(1)} cm`,
      };
    }

    return {
      label: `${width.toFixed(2)} x ${height.toFixed(2)} inches`,
    };
  }, [
    dimensionUnit,
    overlayState.scaleX,
    overlayState.scaleY,
    pattern?.height_inches,
    pattern?.width_inches,
  ]);

  const handleDrag = useCallback(
    (...args: unknown[]) => {
      const pointerEvent = asMouseEvent(args[0]);
      if (!pointerEvent) {
        return;
      }

      if (
        pointerEvent.target instanceof HTMLElement &&
        pointerEvent.target.dataset.testid === 'resizable-wrapper'
      ) {
        return;
      }

      let left = pointerEvent.clientX;
      let top = pointerEvent.clientY;

      if (constrainToBounds && wallImage) {
        left = clamp(left, 0, wallImage.width);
        top = clamp(top, 0, wallImage.height);
      }

      commitOverlay({ left, top });
    },
    [commitOverlay, constrainToBounds, wallImage]
  );

  const handleResize = useCallback(() => {
    const nextScaleY = clamp(overlayState.scaleY + 0.1, minScale, maxScale);

    if (lockAspectRatio && pattern) {
      const patternRatio = pattern.width_inches / pattern.height_inches;
      const ratioLockedScaleX = clamp(
        nextScaleY * patternRatio,
        minScale,
        maxScale
      );
      commitOverlay({
        scaleX: ratioLockedScaleX,
        scaleY: nextScaleY,
      });
      return;
    }

    const nextScaleX = clamp(overlayState.scaleX + 0.1, minScale, maxScale);
    commitOverlay({
      scaleX: nextScaleX,
      scaleY: nextScaleY,
    });
  }, [
    commitOverlay,
    lockAspectRatio,
    maxScale,
    minScale,
    overlayState.scaleX,
    overlayState.scaleY,
    pattern,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          commitOverlay({ left: overlayState.left + KEYBOARD_MOVE_STEP });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          commitOverlay({ left: overlayState.left - KEYBOARD_MOVE_STEP });
          break;
        case 'ArrowUp':
          event.preventDefault();
          commitOverlay({ top: overlayState.top - KEYBOARD_MOVE_STEP });
          break;
        case 'ArrowDown':
          event.preventDefault();
          commitOverlay({ top: overlayState.top + KEYBOARD_MOVE_STEP });
          break;
        default:
          break;
      }
    },
    [commitOverlay, overlayState.left, overlayState.top]
  );

  const handleRotationStart = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      rotationOrigin.current = { x: event.clientX, y: event.clientY };
      setIsRotating(true);
    },
    []
  );

  useEffect(() => {
    if (!isRotating) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - rotationOrigin.current.x;
      const deltaY = event.clientY - rotationOrigin.current.y;
      const nextRotation = normalizeRotation(
        Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI)
      );
      commitOverlay({ rotation: nextRotation });
    };

    const handleMouseUp = () => {
      setIsRotating(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [commitOverlay, isRotating]);

  if (!pattern) {
    return <p>Loading pattern...</p>;
  }

  if (!wallImage) {
    return <p>Loading wall image...</p>;
  }

  const overlayElement = (
    <Resizable onResize={handleResize}>
      <div style={{ position: 'absolute' }}>
        <img
          data-testid="pattern-overlay"
          src={pattern.png_data}
          alt="Pattern overlay"
          draggable={false}
          role="img"
          aria-label="pattern overlay"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onError={() => setPatternLoadError(true)}
          style={{
            transform: `translate(${overlayState.left}px, ${overlayState.top}px) scale(${overlayState.scaleX}, ${overlayState.scaleY}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            position: 'absolute',
          }}
        />
        {enableRotation && (
          <button
            type="button"
            data-testid="rotation-handle"
            aria-label="rotate pattern overlay"
            onMouseDown={handleRotationStart}
          >
            Rotate
          </button>
        )}
      </div>
    </Resizable>
  );

  return (
    <div>
      <img src={wallImage.processed_data} alt="Wall background" />

      {enableDrag ? (
        <Draggable onDrag={handleDrag}>{overlayElement}</Draggable>
      ) : (
        overlayElement
      )}

      {patternLoadError && <p>Failed to load pattern image</p>}

      {showDimensions && (
        <p>{formattedDimensions.label.replace(' x ', ' × ')}</p>
      )}
    </div>
  );
};
