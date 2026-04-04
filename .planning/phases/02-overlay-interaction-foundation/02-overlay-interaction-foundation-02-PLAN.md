---
phase: 02-overlay-interaction-foundation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/OverlayCanvas.tsx
  - frontend/tests/components/test_OverlayCanvas.test.tsx
autonomous: true
requirements:
  - OVR-02
  - OVR-05
must_haves:
  truths:
    - "User can drag the active overlay directly on the wall image."
    - "User can resize the active overlay with visible handles."
    - "User can clearly tell when overlay is selected and can deselect/reselect predictably."
  artifacts:
    - path: "frontend/src/components/OverlayCanvas.tsx"
      provides: "Overlay drag/resize/select interaction surface"
      contains: "onSelectionChange"
    - path: "frontend/tests/components/test_OverlayCanvas.test.tsx"
      provides: "Behavior tests for drag, resize, select, and deselect"
      contains: "OverlayCanvas"
  key_links:
    - from: "frontend/src/components/OverlayCanvas.tsx"
      to: "react-draggable"
      via: "Draggable wrapper with drag callbacks"
      pattern: "from 'react-draggable'"
    - from: "frontend/src/components/OverlayCanvas.tsx"
      to: "react-resizable"
      via: "Resizable wrapper and resize callbacks"
      pattern: "from 'react-resizable'"
---

<objective>
Implement the direct-manipulation overlay interaction surface with explicit selection semantics.

Purpose: OVR-02 and OVR-05 require concrete drag/resize mechanics and unambiguous selected-state behavior.
Output: A tested `OverlayCanvas` component that supports drag, resize, select, deselect, and selected-handle visibility.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-overlay-interaction-foundation/02-RESEARCH.md
@frontend/src/types/api.ts
@frontend/package.json

<interfaces>
From frontend/src/types/api.ts:
```typescript
export interface OverlayState {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  rotation?: number;
}
```

From frontend/package.json dependencies:
```json
"react-draggable": "^4.4.5",
"react-resizable": "^3.0.5"
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Define OverlayCanvas interaction tests for drag/resize/select flows</name>
  <files>frontend/tests/components/test_OverlayCanvas.test.tsx</files>
  <read_first>
    - frontend/tests/components/test_PatternDisplay.test.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
    - frontend/src/types/api.ts
  </read_first>
  <behavior>
    - Test 1: Overlay drag emits updated `{ left, top }` state through callback.
    - Test 2: Overlay resize emits updated `{ scaleX, scaleY }` state through callback.
    - Test 3: Selected overlay shows handles/border class; blank-canvas click clears selection.
  </behavior>
  <action>Create deterministic component tests for `OverlayCanvas` that mock `react-draggable` and `react-resizable` similarly to existing test style. Use callback assertions on `onOverlayStateChange` and `onSelectionChange`. Include explicit expected class names `overlay-selected` and `overlay-unselected` so OVR-05 visual-state semantics are test-locked.</action>
  <acceptance_criteria>
    - `frontend/tests/components/test_OverlayCanvas.test.tsx` contains `overlay-selected` and `overlay-unselected` assertions.
    - Test file contains callbacks `onOverlayStateChange` and `onSelectionChange`.
    - Test file asserts deselection path on container/background click.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx</automated>
  </verify>
  <done>OVR-02 and OVR-05 behavior is explicitly encoded in executable tests.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement OverlayCanvas with visible handles and predictable selection semantics</name>
  <files>frontend/src/components/OverlayCanvas.tsx</files>
  <read_first>
    - frontend/src/types/api.ts
    - frontend/tests/components/test_OverlayCanvas.test.tsx
    - frontend/tests/components/test_PatternDisplay.test.tsx
  </read_first>
  <behavior>
    - Test 1: Drag updates state via callback while preserving current scale values.
    - Test 2: Resize updates scale values while preserving current position.
    - Test 3: User can select, deselect, then reselect overlay with clear visual state changes.
  </behavior>
  <action>Implement `OverlayCanvas` with props for wall image source, pattern image source, `overlayState`, `isSelected`, `onOverlayStateChange`, and `onSelectionChange`. Render wall background image plus draggable/resizable overlay image. Apply `overlay-selected` class when selected and render resize handle elements only in selected state. Trigger `onSelectionChange(false)` on background click and `onSelectionChange(true)` on overlay click (per OVR-05). Use current installed `react-draggable` and `react-resizable` only; do not add new dependencies.</action>
  <acceptance_criteria>
    - `frontend/src/components/OverlayCanvas.tsx` imports from both `react-draggable` and `react-resizable`.
    - File contains class strings `overlay-selected` and `overlay-unselected`.
    - File contains both `onSelectionChange(true)` and `onSelectionChange(false)` call paths.
    - File exposes `onOverlayStateChange` callback usage for drag and resize events.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx</automated>
  </verify>
  <done>Overlay object supports direct drag/resize with visible selection affordances and predictable deselect/reselect behavior (OVR-02, OVR-05).</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx`
</verification>

<success_criteria>
- Overlay manipulation is directly interactive via drag and resize handles.
- Selected-state visibility and deselect/reselect behavior are deterministic and test-verified.
</success_criteria>

<output>
After completion, create `.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-02-SUMMARY.md`
</output>
