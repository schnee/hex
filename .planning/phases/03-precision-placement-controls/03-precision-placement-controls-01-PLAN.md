---
phase: 03-precision-placement-controls
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/App.tsx
  - frontend/src/App.css
  - frontend/tests/integration/test_overlay_flow.test.tsx
autonomous: true
requirements:
  - OVR-03
must_haves:
  truths:
    - "User sees live overlay dimensions while moving/resizing in Overlay workspace."
    - "Displayed dimensions reflect backend `/api/overlay/calculate` responses, not ad-hoc frontend math."
    - "Dimension feedback remains visible after upload and across subsequent drag/resize changes."
  artifacts:
    - path: "frontend/src/App.tsx"
      provides: "Overlay calculation orchestration and live dimension display wiring"
      contains: "calculateOverlay"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "OVR-03 workflow assertions for backend-authoritative dimension feedback"
      contains: "physical_dimensions"
    - path: "frontend/src/App.css"
      provides: "Dimension panel styles for readable precision feedback"
      contains: "overlay-dimensions"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.calculateOverlay"
      pattern: "calculateOverlay\("
    - from: "frontend/src/App.tsx"
      to: "frontend/src/components/OverlayCanvas.tsx"
      via: "overlay state change callback"
      pattern: "onOverlayStateChange"
---

<objective>
Add backend-authoritative live dimension feedback to the React overlay workflow.

Purpose: OVR-03 requires precision confidence from real API-calculated dimensions during manipulation, not static values.
Output: App-level overlay calculation wiring plus integration tests proving live physical/visual dimension updates.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-03-SUMMARY.md
@.planning/phases/03-precision-placement-controls/03-RESEARCH.md
@frontend/src/App.tsx
@frontend/src/services/api.ts
@frontend/src/types/api.ts
@frontend/tests/integration/test_overlay_flow.test.tsx

<interfaces>
From frontend/src/types/api.ts:
```typescript
export interface OverlayRequest {
  image_id: string;
  pattern_id: string;
  overlay_state: OverlayState;
}

export interface OverlayResponse {
  physical_dimensions: { width_inches: number; height_inches: number };
  visual_dimensions: { width_px: number; height_px: number };
}
```

From frontend/src/components/OverlayCanvas.tsx:
```typescript
interface OverlayCanvasProps {
  overlayState: OverlayState;
  onOverlayStateChange: (state: OverlayState) => void;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add OVR-03 integration tests for live dimension feedback</name>
  <files>frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <read_first>
    - frontend/tests/integration/test_overlay_flow.test.tsx
    - frontend/src/App.tsx
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
  </read_first>
  <behavior>
    - Test 1: After generate + select + upload, app requests overlay dimensions from `apiClient.calculateOverlay`.
    - Test 2: Drag and resize actions trigger follow-up calculation calls with updated `overlay_state`.
    - Test 3: UI renders backend-returned physical and visual dimensions in a dedicated panel.
  </behavior>
  <action>Extend `test_overlay_flow` mocks to include `apiClient.calculateOverlay` wrapper responses (`{ success: true, data: { physical_dimensions, visual_dimensions } }`). Add assertions that initial overlay render and each drag/resize action trigger `calculateOverlay` with `{ image_id: uploadedImage.image_id, pattern_id: generatedPattern.id, overlay_state: ... }`. Assert explicit dimension text exists (e.g., `Physical Layout Dimensions`, `Visual Overlay Size`) and includes backend values, not hardcoded placeholders.</action>
  <acceptance_criteria>
    - `frontend/tests/integration/test_overlay_flow.test.tsx` contains `mockCalculateOverlay` in API mock setup.
    - File asserts `mockCalculateOverlay` call payload includes `image_id`, `pattern_id`, and `overlay_state`.
    - File asserts rendered dimension values from mocked response (e.g., `10.5 in`, `260 px`).
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Integration tests fail on current code until backend-authoritative live dimension wiring is implemented.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement App overlay calculation orchestration and dimensions panel</name>
  <files>frontend/src/App.tsx, frontend/src/App.css</files>
  <read_first>
    - frontend/src/App.tsx
    - frontend/src/App.css
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
    - frontend/src/components/OverlayCanvas.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
  </read_first>
  <behavior>
    - Test 1: Uploading image with selected pattern triggers first overlay calculation request.
    - Test 2: Drag/resize updates still mutate overlay state and also refresh dimension panel values.
    - Test 3: Calculation failures show deterministic error text without breaking overlay interactions.
  </behavior>
  <action>In `App.tsx`, add `overlayDimensions`, `isCalculatingOverlay`, and `overlayCalcError` state. Implement a guarded async helper `requestOverlayDimensions(nextState: OverlayState)` that exits early unless both `selectedPattern` and `uploadedImage` exist, then calls `apiClient.calculateOverlay({ image_id: uploadedImage.image_id, pattern_id: selectedPattern.id, overlay_state: nextState })`. Replace direct `setOverlayState` callback passed to `OverlayCanvas` with wrapper handler that updates state and then requests dimensions. Also request dimensions once immediately after successful upload/reset with initial overlay state. Render a dimensions panel beneath canvas with fixed labels `Physical Layout Dimensions` and `Visual Overlay Size`, plus loading/error rows. Style panel in `App.css` using `.overlay-dimensions`, `.overlay-dimensions-grid`, and `.overlay-dimensions-error` selectors for consistent readability.</action>
  <acceptance_criteria>
    - `frontend/src/App.tsx` contains `requestOverlayDimensions` calling `apiClient.calculateOverlay`.
    - `frontend/src/App.tsx` passes a wrapper function (not raw `setOverlayState`) to `OverlayCanvas` `onOverlayStateChange`.
    - `frontend/src/App.tsx` renders labels `Physical Layout Dimensions` and `Visual Overlay Size`.
    - `frontend/src/App.css` contains selectors `.overlay-dimensions` and `.overlay-dimensions-error`.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>OVR-03 is met: users receive live backend-authoritative dimension feedback while moving/resizing overlays.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
</verification>

<success_criteria>
- Overlay workspace displays physical + visual dimensions sourced from `/api/overlay/calculate`.
- Drag/resize interactions refresh displayed values and preserve prior Phase 2 selection behavior.
</success_criteria>

<output>
After completion, create `.planning/phases/03-precision-placement-controls/03-precision-placement-controls-01-SUMMARY.md`
</output>
