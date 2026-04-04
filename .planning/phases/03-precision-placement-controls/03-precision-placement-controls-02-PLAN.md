---
phase: 03-precision-placement-controls
plan: 02
type: execute
wave: 2
depends_on:
  - 03-precision-placement-controls-01
files_modified:
  - frontend/src/components/OverlayCanvas.tsx
  - frontend/src/App.tsx
  - frontend/src/App.css
  - frontend/tests/components/test_OverlayCanvas.test.tsx
  - frontend/tests/integration/test_overlay_flow.test.tsx
autonomous: true
requirements:
  - OVR-04
  - OVR-03
must_haves:
  truths:
    - "User can zoom in/out and reset viewport while keeping overlay placement workflow active."
    - "User can pan canvas viewport to inspect different wall regions for precise placement."
    - "Overlay drag/resize remains accurate at non-1x zoom and still updates live dimensions."
  artifacts:
    - path: "frontend/src/components/OverlayCanvas.tsx"
      provides: "Viewport zoom/pan controls plus zoom-aware drag behavior"
      contains: "viewport"
    - path: "frontend/tests/components/test_OverlayCanvas.test.tsx"
      provides: "Component coverage for zoom/pan controls and interaction stability"
      contains: "zoom"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "End-to-end precision placement assertions"
      contains: "pan"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/components/OverlayCanvas.tsx"
      via: "viewport state props + callbacks"
      pattern: "viewportScale"
    - from: "frontend/src/components/OverlayCanvas.tsx"
      to: "react-draggable"
      via: "scale-aware drag behavior"
      pattern: "scale={"
    - from: "frontend/src/components/OverlayCanvas.tsx"
      to: "frontend/src/App.tsx"
      via: "pan/zoom callback events"
      pattern: "onViewport"
---

<objective>
Implement zoom and pan controls for precision placement without regressing live dimensions.

Purpose: OVR-04 requires canvas navigation for fine adjustments; this plan adds viewport controls while preserving OVR-03 and OVR-05 behavior.
Output: Zoom/pan-capable OverlayCanvas, App wiring for viewport state, and passing component/integration tests.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-precision-placement-controls/03-RESEARCH.md
@.planning/phases/03-precision-placement-controls/03-precision-placement-controls-01-PLAN.md
@frontend/src/components/OverlayCanvas.tsx
@frontend/src/App.tsx
@frontend/tests/components/test_OverlayCanvas.test.tsx
@frontend/tests/integration/test_overlay_flow.test.tsx

<interfaces>
From react-draggable docs (Context7):
```tsx
<Draggable
  position={{ x, y }}
  onStop={handleStop}
  scale={zoomScale}
/>
```

From frontend/src/components/OverlayCanvas.tsx current contract:
```typescript
interface OverlayCanvasProps {
  overlayState: OverlayState;
  onOverlayStateChange: (state: OverlayState) => void;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add zoom/pan precision tests for OverlayCanvas and workflow integration</name>
  <files>frontend/tests/components/test_OverlayCanvas.test.tsx, frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <read_first>
    - frontend/tests/components/test_OverlayCanvas.test.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
    - frontend/src/components/OverlayCanvas.tsx
    - frontend/src/App.tsx
  </read_first>
  <behavior>
    - Test 1: User can click zoom in/out controls and see deterministic zoom value updates.
    - Test 2: User can pan viewport using explicit controls (left/right/up/down) and reset viewport.
    - Test 3: At zoom levels != 1, drag/resize + live dimensions still function in integration flow.
  </behavior>
  <action>Extend `test_OverlayCanvas` with assertions for viewport controls labeled `Zoom In`, `Zoom Out`, `Reset View`, `Pan Left`, `Pan Right`, `Pan Up`, `Pan Down`, including deterministic `data-testid` output for zoom and pan values. Update `test_overlay_flow` to perform a zoom/pan action before drag/resize and assert overlay still moves/resizes and OVR-03 dimension calls still occur. Keep API mocks wrapper-shaped and include `mockCalculateOverlay` assertions introduced in Plan 01.</action>
  <acceptance_criteria>
    - `frontend/tests/components/test_OverlayCanvas.test.tsx` contains assertions for all seven viewport controls.
    - Component test file asserts zoom value and pan offsets via dedicated test IDs.
    - `frontend/tests/integration/test_overlay_flow.test.tsx` includes a zoom/pan step before drag/resize assertions.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Precision viewport behavior is test-defined and failing until implementation is completed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement zoom/pan viewport controls with zoom-aware overlay interactions</name>
  <files>frontend/src/components/OverlayCanvas.tsx, frontend/src/App.tsx, frontend/src/App.css</files>
  <read_first>
    - frontend/src/components/OverlayCanvas.tsx
    - frontend/src/App.tsx
    - frontend/src/App.css
    - frontend/tests/components/test_OverlayCanvas.test.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
  </read_first>
  <behavior>
    - Test 1: Zoom controls clamp between minimum and maximum values and can reset to default.
    - Test 2: Pan controls shift viewport offsets independently of overlay object state.
    - Test 3: Drag math remains accurate under zoom and still triggers dimension recalculation through App callback wiring.
  </behavior>
  <action>In `App.tsx`, add viewport state (`viewportScale`, `viewportOffsetX`, `viewportOffsetY`) with defaults `1`, `0`, `0`; pass values plus setter callbacks into `OverlayCanvas`, and reset viewport to defaults whenever new image upload occurs. In `OverlayCanvas.tsx`, render a viewport toolbar with seven buttons (`Zoom In`, `Zoom Out`, `Reset View`, `Pan Left`, `Pan Right`, `Pan Up`, `Pan Down`), plus numeric display test IDs for current zoom and offsets. Apply viewport transforms to wall+overlay stage container (translate by offsets, scale by zoom) and set `Draggable` `scale={viewportScale}` so drag deltas remain correct under zoom. Keep existing selection semantics and resize behavior intact. Update `App.css` with selectors for `.overlay-viewport-controls`, `.overlay-viewport-button`, `.overlay-viewport-status`, and transformed stage wrapper styles to maintain readability and spacing.</action>
  <acceptance_criteria>
    - `frontend/src/App.tsx` defines `viewportScale`, `viewportOffsetX`, and `viewportOffsetY` state.
    - `frontend/src/components/OverlayCanvas.tsx` renders buttons with labels: `Zoom In`, `Zoom Out`, `Reset View`, `Pan Left`, `Pan Right`, `Pan Up`, `Pan Down`.
    - `frontend/src/components/OverlayCanvas.tsx` passes `scale={viewportScale}` to `Draggable`.
    - `frontend/src/App.css` contains `.overlay-viewport-controls` and `.overlay-viewport-status` selectors.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>OVR-04 is met: users can zoom and pan the overlay canvas while preserving stable drag/resize and live dimensions.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx`
- `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
</verification>

<success_criteria>
- Overlay workspace exposes deterministic zoom/pan controls with bounded viewport state.
- User can continue placement adjustments at different zoom levels without losing dimension feedback fidelity.
</success_criteria>

<output>
After completion, create `.planning/phases/03-precision-placement-controls/03-precision-placement-controls-02-SUMMARY.md`
</output>
