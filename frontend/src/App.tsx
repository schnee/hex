import React from 'react';
import './App.css';
import { OverlayCanvas } from './components/OverlayCanvas';
import { PatternDisplay } from './components/PatternDisplay';
import { PatternGenerator } from './components/PatternGenerator';
import { WallImageUploader } from './components/WallImageUploader';
import { usePatternContext } from './context/PatternContext';
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
  const [isGeneratorDrawerOpen, setIsGeneratorDrawerOpen] =
    React.useState(true);
  const latestOverlayRequestId = React.useRef(0);
  const generatorDrawerContentId = 'generator-drawer-content-panel';
  const hasGeneratedPatterns = (patterns?.length ?? 0) > 0;

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
    const nextOverlayState = uploadedImage
      ? getBoundedInitialOverlayState(uploadedImage)
      : INITIAL_OVERLAY_STATE;

    setSelectedPattern(pattern);
    setSelectedPatternId(pattern.id);
    setOverlayState(nextOverlayState);
    setViewportScale(INITIAL_VIEWPORT_STATE.scale);
    setViewportOffsetX(INITIAL_VIEWPORT_STATE.offsetX);
    setViewportOffsetY(INITIAL_VIEWPORT_STATE.offsetY);
    setIsOverlaySelected(true);
    setOverlayDimensions(null);
    setOverlayCalcError(null);
    setOverlayCalcStatus('idle');

    if (uploadedImage) {
      void requestOverlayDimensions(nextOverlayState, {
        image: uploadedImage,
        pattern,
      });
    }
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hex Layout Toolkit</h1>
        <p>Upload + Generate + Overlay Workspace</p>
      </header>
      <main className="app-main">
        <div
          className={`workspace-layout workspace-layout-generator${hasGeneratedPatterns ? ' workspace-layout-has-patterns' : ''}`}
          data-testid="workspace-shell"
        >
          <section
            className="overlay-workspace"
            data-testid="image-overlay-section"
          >
            <h2>Upload and Overlay</h2>
            <WallImageUploader onUploadComplete={handleUploadComplete} />

            {!uploadedImage && (
              <div
                className="upload-primary-cta"
                data-testid="upload-primary-cta"
              >
                <p className="overlay-guidance">
                  Start by uploading a wall image. Once upload finishes, pattern
                  generation will unlock below.
                </p>
              </div>
            )}

            {uploadedImage && !selectedPattern && (
              <>
                <div
                  className="uploaded-wall-preview"
                  data-testid="uploaded-wall-preview"
                >
                  <img
                    src={uploadedImage.processed_data}
                    alt="Uploaded wall image preview"
                  />
                </div>

                <p className="overlay-guidance">
                  Generate patterns below, then choose one card to place it on
                  your wall.
                </p>
              </>
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

                  {isCalculatingOverlay && (
                    <p>
                      Refreshing overlay dimensions after your latest placement
                      change...
                    </p>
                  )}

                  {overlayCalcStatus === 'success' && !isCalculatingOverlay && (
                    <p>Overlay dimensions are up to date.</p>
                  )}

                  {overlayCalcStatus === 'error' && !isCalculatingOverlay && (
                    <p>
                      Could not refresh dimensions. Move or resize again, or
                      re-upload the wall image and retry.
                    </p>
                  )}

                  {overlayCalcError && (
                    <p className="overlay-dimensions-error">
                      {overlayCalcError}
                    </p>
                  )}
                </section>
              </>
            )}
          </section>

          <section
            className="generator-controls-panel"
            data-testid="generator-drawer"
            aria-label="Generator controls drawer"
          >
            <div className="generator-drawer-toggle-row">
              <button
                className="workspace-link"
                type="button"
                aria-expanded={isGeneratorDrawerOpen}
                aria-controls={generatorDrawerContentId}
                onClick={() => setIsGeneratorDrawerOpen(open => !open)}
              >
                {isGeneratorDrawerOpen
                  ? 'Collapse generator drawer'
                  : 'Expand generator drawer'}
              </button>
            </div>

            <div
              className="generator-drawer-content"
              id={generatorDrawerContentId}
              data-testid="generator-drawer-content"
              hidden={!isGeneratorDrawerOpen}
            >
              <PatternGenerator
                onPatternsGenerated={handlePatternsGenerated}
                disabled={!uploadedImage}
              />
            </div>
          </section>

          {hasGeneratedPatterns && (
            <section
              className="generator-results-panel"
              data-testid="generated-patterns-section"
            >
              <h2>Generated Patterns</h2>
              <PatternDisplay
                patterns={patterns ?? []}
                onPatternSelect={handlePatternSelect}
                layout="three-up"
                {...(selectedPatternId ? { selectedPatternId } : {})}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
