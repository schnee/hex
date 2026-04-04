import React from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom';
import './App.css';
import { OverlayCanvas } from './components/OverlayCanvas';
import { PatternDisplay } from './components/PatternDisplay';
import { PatternGenerator } from './components/PatternGenerator';
import { WallImageUploader } from './components/WallImageUploader';
import { usePatternContext } from './context/PatternContext';
import { WORKSPACE_ROUTES } from './routes/workspaceRoutes';
import { apiClient } from './services/api';
import type {
  OverlayResponse,
  OverlayState,
  Pattern,
  UploadResponse,
} from './types/api';

const INITIAL_OVERLAY_STATE: OverlayState = {
  left: 80,
  top: 80,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

const BASE_OVERLAY_SIZE_PX = 100;

const getBoundedInitialOverlayState = (
  image: UploadResponse
): OverlayState => ({
  ...INITIAL_OVERLAY_STATE,
  left: Math.max(
    0,
    Math.min(INITIAL_OVERLAY_STATE.left, image.width - BASE_OVERLAY_SIZE_PX)
  ),
  top: Math.max(
    0,
    Math.min(INITIAL_OVERLAY_STATE.top, image.height - BASE_OVERLAY_SIZE_PX)
  ),
});

const INITIAL_VIEWPORT_STATE = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const App: React.FC = () => {
  const {
    patterns,
    selectedPattern,
    setPatterns,
    setSelectedPattern,
    selectedPatternId,
    setSelectedPatternId,
  } = usePatternContext();
  const [uploadedImage, setUploadedImage] =
    React.useState<UploadResponse | null>(null);
  const [overlayState, setOverlayState] = React.useState<OverlayState>(
    INITIAL_OVERLAY_STATE
  );
  const [viewportScale, setViewportScale] = React.useState(
    INITIAL_VIEWPORT_STATE.scale
  );
  const [viewportOffsetX, setViewportOffsetX] = React.useState(
    INITIAL_VIEWPORT_STATE.offsetX
  );
  const [viewportOffsetY, setViewportOffsetY] = React.useState(
    INITIAL_VIEWPORT_STATE.offsetY
  );
  const [isOverlaySelected, setIsOverlaySelected] = React.useState(true);
  const [overlayDimensions, setOverlayDimensions] =
    React.useState<OverlayResponse | null>(null);
  const [isCalculatingOverlay, setIsCalculatingOverlay] = React.useState(false);
  const [overlayCalcError, setOverlayCalcError] = React.useState<string | null>(
    null
  );
  const [overlayCalcStatus, setOverlayCalcStatus] = React.useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const latestOverlayRequestId = React.useRef(0);

  const requestOverlayDimensions = React.useCallback(
    async (
      nextState: OverlayState,
      options?: {
        image?: UploadResponse | null;
        pattern?: Pattern | null;
      }
    ) => {
      const activeImage = options?.image ?? uploadedImage;
      const activePattern = options?.pattern ?? selectedPattern;

      if (!activeImage || !activePattern) {
        return;
      }

      const requestId = latestOverlayRequestId.current + 1;
      latestOverlayRequestId.current = requestId;

      setIsCalculatingOverlay(true);
      setOverlayCalcError(null);
      setOverlayCalcStatus('loading');

      const result = await apiClient.calculateOverlay({
        image_id: activeImage.image_id,
        pattern_id: activePattern.id,
        overlay_state: nextState,
      });

      if (requestId !== latestOverlayRequestId.current) {
        return;
      }

      if (result.success) {
        setOverlayDimensions(result.data);
        setOverlayCalcStatus('success');
      } else {
        setOverlayCalcError(
          result.error.detail || 'Unable to refresh overlay dimensions.'
        );
        setOverlayCalcStatus('error');
      }

      setIsCalculatingOverlay(false);
    },
    [selectedPattern, uploadedImage]
  );

  const handleOverlayStateChange = React.useCallback(
    (nextState: OverlayState) => {
      setOverlayState(nextState);
      void requestOverlayDimensions(nextState);
    },
    [requestOverlayDimensions]
  );

  const handleOverlayStatePreview = React.useCallback(
    (nextState: OverlayState) => {
      setOverlayState(nextState);
    },
    []
  );

  const handlePatternsGenerated = (generatedPatterns: Pattern[]) => {
    setPatterns(generatedPatterns);
    setSelectedPattern(null);
    setSelectedPatternId(undefined);
    setOverlayState(INITIAL_OVERLAY_STATE);
    setViewportScale(INITIAL_VIEWPORT_STATE.scale);
    setViewportOffsetX(INITIAL_VIEWPORT_STATE.offsetX);
    setViewportOffsetY(INITIAL_VIEWPORT_STATE.offsetY);
    setIsOverlaySelected(true);
    setOverlayDimensions(null);
    setOverlayCalcError(null);
    setOverlayCalcStatus('idle');
  };

  const handlePatternSelect = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setSelectedPatternId(pattern.id);
    setIsOverlaySelected(true);
  };

  const handleUploadComplete = (image: UploadResponse) => {
    const boundedInitialState = getBoundedInitialOverlayState(image);

    setUploadedImage(image);
    setOverlayState(boundedInitialState);
    setViewportScale(INITIAL_VIEWPORT_STATE.scale);
    setViewportOffsetX(INITIAL_VIEWPORT_STATE.offsetX);
    setViewportOffsetY(INITIAL_VIEWPORT_STATE.offsetY);
    setIsOverlaySelected(true);
    setOverlayCalcError(null);
    setOverlayCalcStatus('idle');
    void requestOverlayDimensions(boundedInitialState, {
      image,
      pattern: selectedPattern,
    });
  };

  const generatorWorkspace = (
    <div className="workspace-layout workspace-layout-generator">
      <section className="generator-controls-panel">
        <PatternGenerator onPatternsGenerated={handlePatternsGenerated} />
      </section>
      <section className="generator-results-panel">
        <h2>Generated Patterns</h2>
        <PatternDisplay
          patterns={patterns ?? []}
          onPatternSelect={handlePatternSelect}
          layout="three-up"
          {...(selectedPatternId ? { selectedPatternId } : {})}
        />
      </section>
    </div>
  );

  const overlayWorkspace = (
    <div className="workspace-layout workspace-layout-single-column">
      <section className="overlay-workspace">
        <h2>Overlay Workspace</h2>
        <WallImageUploader onUploadComplete={handleUploadComplete} />

        {!selectedPattern && (
          <p className="overlay-guidance">
            Select a generated pattern in the Generator route to enable overlay
            manipulation.
          </p>
        )}

        {!uploadedImage && (
          <p className="overlay-guidance">
            Upload a wall image to start direct overlay interactions.
          </p>
        )}

        {selectedPattern && uploadedImage && (
          <>
            <OverlayCanvas
              wallImageSrc={uploadedImage.processed_data}
              patternImageSrc={selectedPattern.png_data}
              overlayState={overlayState}
              viewportScale={viewportScale}
              viewportOffsetX={viewportOffsetX}
              viewportOffsetY={viewportOffsetY}
              isSelected={isOverlaySelected}
              onOverlayStateChange={handleOverlayStateChange}
              onOverlayStatePreview={handleOverlayStatePreview}
              onViewportScaleChange={setViewportScale}
              onViewportOffsetChange={(x, y) => {
                setViewportOffsetX(x);
                setViewportOffsetY(y);
              }}
              onSelectionChange={setIsOverlaySelected}
            />

            <section className="overlay-dimensions" aria-live="polite">
              <div className="overlay-dimensions-grid">
                <div>
                  <h3>Physical Layout Dimensions</h3>
                  <p>
                    {overlayDimensions
                      ? `${overlayDimensions.physical_dimensions.width_inches.toFixed(1)} in × ${overlayDimensions.physical_dimensions.height_inches.toFixed(1)} in`
                      : '—'}
                  </p>
                </div>

                <div>
                  <h3>Visual Overlay Size</h3>
                  <p>
                    {overlayDimensions
                      ? `${Math.round(overlayDimensions.visual_dimensions.width_px)} px × ${Math.round(overlayDimensions.visual_dimensions.height_px)} px`
                      : '—'}
                  </p>
                </div>
              </div>

              {isCalculatingOverlay && <p>Refreshing overlay dimensions...</p>}

              {overlayCalcStatus === 'success' && !isCalculatingOverlay && (
                <p>Overlay dimensions updated.</p>
              )}

              {overlayCalcStatus === 'error' && !isCalculatingOverlay && (
                <p>
                  Overlay update failed. Adjust placement or re-upload image and
                  retry.
                </p>
              )}

              {overlayCalcError && (
                <p className="overlay-dimensions-error">{overlayCalcError}</p>
              )}
            </section>
          </>
        )}
      </section>
    </div>
  );

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <header className="app-header">
          <h1>Hex Layout Toolkit</h1>
          <p>Pattern + Overlay Workspace</p>
        </header>
        <main className="app-main">
          <nav className="workspace-nav" aria-label="Workspace sections">
            <NavLink
              className={({ isActive }) =>
                `workspace-link ${isActive ? 'workspace-link-active' : ''}`
              }
              to={WORKSPACE_ROUTES.generator}
            >
              Generator
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `workspace-link ${isActive ? 'workspace-link-active' : ''}`
              }
              to={WORKSPACE_ROUTES.overlay}
            >
              Overlay
            </NavLink>
          </nav>

          <Routes>
            <Route
              path={WORKSPACE_ROUTES.base}
              element={<Navigate to={WORKSPACE_ROUTES.generator} replace />}
            />
            <Route
              path={WORKSPACE_ROUTES.generator}
              element={generatorWorkspace}
            />
            <Route path={WORKSPACE_ROUTES.overlay} element={overlayWorkspace} />
            <Route
              path="*"
              element={<Navigate to={WORKSPACE_ROUTES.generator} replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
