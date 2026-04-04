---
phase: 02-overlay-interaction-foundation
plan: 03
type: execute
wave: 2
depends_on:
  - 02-overlay-interaction-foundation-01
  - 02-overlay-interaction-foundation-02
files_modified:
  - frontend/src/App.tsx
  - frontend/src/App.css
  - frontend/tests/integration/test_overlay_flow.test.tsx
autonomous: true
requirements:
  - OVR-01
  - OVR-02
  - OVR-05
must_haves:
  truths:
    - "User can move from generated pattern selection into overlay workspace and upload a wall image."
    - "User can manipulate selected overlay in app context and keep selection behavior predictable."
    - "End-to-end overlay workflow is test-verified against current API wrapper contracts."
  artifacts:
    - path: "frontend/src/App.tsx"
      provides: "Composition/wiring between generation results and overlay workspace"
      contains: "Overlay"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "Cross-component overlay workflow verification"
      contains: "Overlay Positioning Integration Flow"
    - path: "frontend/src/App.css"
      provides: "Selected-state/overlay workspace styles"
      contains: "overlay-selected"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/components/WallImageUploader.tsx"
      via: "upload completion callback wiring"
      pattern: "onUploadComplete"
    - from: "frontend/src/App.tsx"
      to: "frontend/src/components/OverlayCanvas.tsx"
      via: "overlay state and selection callbacks"
      pattern: "onOverlayStateChange"
---

<objective>
Wire upload and overlay interaction slices into the app workspace and verify the full Phase 2 behavior end-to-end.

Purpose: Phase 2 only ships when OVR-01/02/05 work together in the user journey, not as isolated components.
Output: App-level overlay workspace composition plus an integration test proving upload + drag/resize + clear selection semantics.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-react-pattern-generation/01-react-pattern-generation-01-SUMMARY.md
@.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-01-PLAN.md
@.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-02-PLAN.md
@frontend/src/App.tsx
@frontend/src/context/PatternContext.tsx
@frontend/tests/integration/test_overlay_flow.test.tsx

<interfaces>
From frontend/src/context/PatternContext.tsx:
```typescript
interface PatternContextValue {
  patterns: Pattern[] | null;
  selectedPattern: Pattern | null;
  selectedPatternId: string | undefined;
}
```

From frontend/src/App.tsx current contract:
```typescript
<PatternGenerator onPatternsGenerated={handlePatternsGenerated} />
<PatternDisplay onPatternSelect={handlePatternSelect} />
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Rewrite overlay integration test for current App/API contracts</name>
  <files>frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <read_first>
    - frontend/tests/integration/test_pattern_flow.test.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
    - frontend/src/App.tsx
    - frontend/src/services/api.ts
  </read_first>
  <behavior>
    - Test 1: Generate + select pattern, upload wall image, and render overlay workspace.
    - Test 2: Drag and resize interactions update overlay state and maintain selected visual state.
    - Test 3: Background click deselects overlay; overlay click reselects overlay predictably.
  </behavior>
  <action>Replace stale integration assumptions (`{ App }` named export, non-wrapper API mocks) with current default `App` import and wrapper-shaped API mocks. Keep integration assertions user-facing: upload prompt visibility, overlay canvas presence, selected-state classes, and drag/resize interaction callbacks observable through DOM/test IDs. Include OVR-05 deselect/reselect assertions explicitly (per roadmap requirement).</action>
  <acceptance_criteria>
    - `frontend/tests/integration/test_overlay_flow.test.tsx` imports `App` as default.
    - API mocks in file use `{ success: true, data: ... }` / `{ success: false, error: ... }` shapes.
    - File contains assertions for deselect and reselect interaction paths.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Integration test captures complete Phase 2 journey and fails until app wiring is implemented.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Compose overlay workspace in App with tab switch, upload, and interaction wiring</name>
  <files>frontend/src/App.tsx, frontend/src/App.css</files>
  <read_first>
    - frontend/src/App.tsx
    - frontend/src/App.css
    - frontend/src/context/PatternContext.tsx
    - frontend/src/components/WallImageUploader.tsx
    - frontend/src/components/OverlayCanvas.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
  </read_first>
  <behavior>
    - Test 1: User can switch between Generator and Overlay workspace sections.
    - Test 2: Overlay section blocks manipulation until both selected pattern and uploaded wall image exist.
    - Test 3: Once ready, drag/resize + deselect/reselect behavior remains stable in app composition.
  </behavior>
  <action>Update `App.tsx` to add two workspace tabs (`Generator`, `Overlay`) while preserving existing generation-selection callbacks from Phase 1. In Overlay tab: show `WallImageUploader`; when upload succeeds and `selectedPattern` exists, render `OverlayCanvas` with default initial overlay state (`left: 80`, `top: 80`, `scaleX: 1`, `scaleY: 1`, `rotation: 0`) and controlled `isSelected` boolean. Add user-facing guidance text when pattern is not selected or image not uploaded. Update `App.css` with classes for tab controls and overlay selected/unselected visuals required by test assertions.</action>
  <acceptance_criteria>
    - `frontend/src/App.tsx` contains both `Generator` and `Overlay` tab controls.
    - `frontend/src/App.tsx` renders `WallImageUploader` and `OverlayCanvas` in overlay mode.
    - `frontend/src/App.tsx` contains initial state literal `left: 80`, `top: 80`, `scaleX: 1`, `scaleY: 1`.
    - `frontend/src/App.css` contains selectors for `.overlay-selected` and `.overlay-unselected`.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Phase 2 workflow is fully wired in App: upload, drag/resize, and clear selection behavior operate together (OVR-01/02/05).</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
- `cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx tests/components/test_OverlayCanvas.test.tsx`
</verification>

<success_criteria>
- User can complete upload and direct overlay manipulation from the app workspace.
- Selected-state behavior (select, deselect, reselect) is consistent and integration-tested.
</success_criteria>

<output>
After completion, create `.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-03-SUMMARY.md`
</output>
