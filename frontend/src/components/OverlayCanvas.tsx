import React from 'react';
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from 'react-draggable';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';
import type { OverlayState } from '../types/api';

interface OverlayCanvasProps {
  wallImageSrc: string;
  patternImageSrc: string;
  overlayState: OverlayState;
  viewportScale: number;
  viewportOffsetX: number;
  viewportOffsetY: number;
  isSelected: boolean;
  onOverlayStateChange: (state: OverlayState) => void;
  onOverlayStatePreview?: (state: OverlayState) => void;
  onViewportScaleChange: (scale: number) => void;
  onViewportOffsetChange: (x: number, y: number) => void;
  onSelectionChange: (selected: boolean) => void;
}

const BASE_OVERLAY_WIDTH = 100;
const BASE_OVERLAY_HEIGHT = 100;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;
const PAN_STEP = 20;

export const OverlayCanvas: React.FC<OverlayCanvasProps> = ({
  wallImageSrc,
  patternImageSrc,
  overlayState,
  viewportScale,
  viewportOffsetX,
  viewportOffsetY,
  isSelected,
  onOverlayStateChange,
  onOverlayStatePreview,
  onViewportScaleChange,
  onViewportOffsetChange,
  onSelectionChange,
}) => {
  const [patternLoadError, setPatternLoadError] = React.useState(false);

  React.useEffect(() => {
    setPatternLoadError(false);
  }, [patternImageSrc]);

  const updateZoom = (delta: number) => {
    const nextScale = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, viewportScale + delta)
    );
    onViewportScaleChange(Number(nextScale.toFixed(2)));
  };

  const updatePan = (xDelta: number, yDelta: number) => {
    onViewportOffsetChange(viewportOffsetX + xDelta, viewportOffsetY + yDelta);
  };

  const handleResetView = () => {
    onViewportScaleChange(1);
    onViewportOffsetChange(0, 0);
  };

  const handleDragStop = (_event: DraggableEvent, data: DraggableData) => {
    onOverlayStateChange({
      ...overlayState,
      left: data.x,
      top: data.y,
    });
  };

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    onOverlayStatePreview?.({
      ...overlayState,
      left: data.x,
      top: data.y,
    });
  };

  const handleResizeStop = (
    _event: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => {
    onOverlayStateChange({
      ...overlayState,
      scaleX: data.size.width / BASE_OVERLAY_WIDTH,
      scaleY: data.size.height / BASE_OVERLAY_HEIGHT,
    });
  };

  return (
    <div
      data-testid="overlay-canvas"
      onClick={() => onSelectionChange(false)}
      className="overlay-canvas"
    >
      <div
        className="overlay-viewport-controls"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updateZoom(ZOOM_STEP)}
        >
          Zoom In
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updateZoom(-ZOOM_STEP)}
        >
          Zoom Out
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={handleResetView}
        >
          Reset View
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updatePan(-PAN_STEP, 0)}
        >
          Pan Left
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updatePan(PAN_STEP, 0)}
        >
          Pan Right
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updatePan(0, -PAN_STEP)}
        >
          Pan Up
        </button>
        <button
          type="button"
          className="overlay-viewport-button"
          onClick={() => updatePan(0, PAN_STEP)}
        >
          Pan Down
        </button>
      </div>

      <div
        className="overlay-viewport-status"
        onClick={event => event.stopPropagation()}
      >
        <span data-testid="viewport-scale-value">
          {viewportScale.toFixed(2)}x
        </span>
        <span data-testid="viewport-offset-x-value">{viewportOffsetX}</span>
        <span data-testid="viewport-offset-y-value">{viewportOffsetY}</span>
      </div>

      <div className="overlay-stage-viewport">
        <div
          className="overlay-stage"
          style={{
            transform: `translate(${viewportOffsetX}px, ${viewportOffsetY}px) scale(${viewportScale})`,
            transformOrigin: 'top left',
          }}
        >
          <img src={wallImageSrc} alt="Wall background" />

          <Draggable
            position={{ x: overlayState.left, y: overlayState.top }}
            onDrag={handleDrag}
            onStop={handleDragStop}
            scale={viewportScale}
            cancel=".react-resizable-handle"
            onStart={() => {
              if (!isSelected) {
                onSelectionChange(true);
              }
            }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={event => {
                event.stopPropagation();
                onSelectionChange(true);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectionChange(true);
                }
              }}
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
            >
              <ResizableBox
                width={Math.round(BASE_OVERLAY_WIDTH * overlayState.scaleX)}
                height={Math.round(BASE_OVERLAY_HEIGHT * overlayState.scaleY)}
                resizeHandles={isSelected ? ['se'] : []}
                onResizeStop={handleResizeStop}
                axis={isSelected ? 'both' : 'none'}
                minConstraints={[20, 20]}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <img
                    data-testid="overlay-image"
                    src={patternImageSrc}
                    alt="Pattern overlay"
                    draggable={false}
                    className={
                      isSelected ? 'overlay-selected' : 'overlay-unselected'
                    }
                    onError={() => setPatternLoadError(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

              </ResizableBox>
            </div>
          </Draggable>
        </div>
      </div>

      {patternLoadError && (
        <p role="alert">Pattern image failed to load. Re-select a pattern.</p>
      )}
    </div>
  );
};
