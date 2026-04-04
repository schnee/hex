---
phase: 05-reliability-ux-stability
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/App.tsx
  - frontend/tests/integration/test_overlay_flow.test.tsx
  - frontend/tests/integration/test_pattern_flow.test.tsx
autonomous: true
requirements: [UX-01, UX-02]
must_haves:
  truths:
    - "User sees overlay calculation status transitions (loading, success, error) while manipulating overlay."
    - "Repeated overlay actions do not show stale dimension values from older requests."
    - "User can recover from overlay calculation errors by continuing interactions and receiving updated success feedback."
  artifacts:
    - path: "frontend/src/App.tsx"
      provides: "Latest-request-wins overlay calculation state handling and explicit status messaging"
      contains: "request sequencing guard for calculateOverlay"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "Integration assertions for stale-response protection and recovery flow"
    - path: "frontend/tests/integration/test_pattern_flow.test.tsx"
      provides: "Regression guard for routed generator flow stability while status updates are present"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.calculateOverlay(request)"
      pattern: "calculateOverlay\(\{"
    - from: "frontend/src/App.tsx"
      to: "overlay dimensions panel"
      via: "state updates gated by latest request id"
      pattern: "latestOverlayRequestId"
---

<objective>
Harden overlay interaction reliability by preventing stale async updates and exposing explicit recovery-oriented feedback during repeated calculations.

Purpose: Complete UX-01 for overlay operations and satisfy UX-02 stability expectations during rapid drag/resize/retry usage.
Output: App-level overlay lifecycle guards plus integration tests proving latest-request behavior and error recovery.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-reliability-ux-stability/05-RESEARCH.md
@frontend/src/App.tsx
@frontend/tests/integration/test_overlay_flow.test.tsx
@frontend/tests/integration/test_pattern_flow.test.tsx
@frontend/src/services/api.ts

<interfaces>
From `frontend/src/types/api.ts`:
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

From `frontend/src/services/api.ts`:
```typescript
async calculateOverlay(request: OverlayRequest): Promise<APIResponse<OverlayResponse>>;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Implement latest-request-wins overlay calculation state management</name>
  <read_first>
    - frontend/src/App.tsx
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
  </read_first>
  <files>frontend/src/App.tsx</files>
  <behavior>
    - Test 1: when two calculateOverlay requests overlap, only the latest response updates dimensions and status.
    - Test 2: a stale failed response cannot overwrite a newer successful response.
    - Test 3: missing prerequisites still short-circuit without entering loading state.
  </behavior>
  <action>Add a monotonic request-sequence guard in App (`latestOverlayRequestId` ref). Increment before each `apiClient.calculateOverlay` call, capture the id in local scope, and only commit `overlayDimensions`, `overlayCalcError`, and `isCalculatingOverlay` updates if the response id matches the latest id. Add explicit overlay status text in the dimensions panel: `Refreshing overlay dimensions...`, `Overlay dimensions updated.`, and `Overlay update failed. Adjust placement or re-upload image and retry.`. Ensure a new request clears stale error/success text before awaiting response.</action>
  <acceptance_criteria>
    - `frontend/src/App.tsx` contains a latest-request identifier ref named `latestOverlayRequestId`
    - `frontend/src/App.tsx` contains `Refreshing overlay dimensions...`
    - `frontend/src/App.tsx` contains `Overlay dimensions updated.`
    - `frontend/src/App.tsx` contains `Overlay update failed. Adjust placement or re-upload image and retry.`
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Overlay calculation UI reports explicit status and ignores stale async responses.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Extend routed integration tests for repeat-action stability and recovery</name>
  <read_first>
    - frontend/tests/integration/test_overlay_flow.test.tsx
    - frontend/tests/integration/test_pattern_flow.test.tsx
    - frontend/src/App.tsx
  </read_first>
  <files>frontend/tests/integration/test_overlay_flow.test.tsx, frontend/tests/integration/test_pattern_flow.test.tsx</files>
  <behavior>
    - Test 1: overlapping mocked calculateOverlay promises resolve out of order and UI reflects only latest response.
    - Test 2: overlay error status is replaced by success status after the next successful interaction.
    - Test 3: pattern flow remains stable (no regression from new status messaging).
  </behavior>
  <action>Update `test_overlay_flow.test.tsx` with a deterministic out-of-order response case (use deferred promises) to prove stale-response protection and status transitions. Add assertions for error→success recovery messaging after subsequent drag/resize interactions. Keep `test_pattern_flow.test.tsx` route/generation assertions intact and add one regression assertion that generator route remains operable after status-message changes in App.</action>
  <acceptance_criteria>
    - `frontend/tests/integration/test_overlay_flow.test.tsx` contains a test covering out-of-order calculateOverlay responses
    - `frontend/tests/integration/test_overlay_flow.test.tsx` asserts both failure and subsequent success status texts
    - `frontend/tests/integration/test_pattern_flow.test.tsx` still asserts routed generation behavior
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx</automated>
  </verify>
  <done>Integration coverage proves overlay reliability under repeated actions and guards route-level generation regressions.</done>
</task>

</tasks>

<verification>
Run `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx` and confirm stale-response and recovery assertions pass.
</verification>

<success_criteria>
- Overlay calculation always presents explicit loading/success/error status.
- Older async responses cannot override newer overlay state.
- Integration tests prove repeated overlay interactions remain stable and recoverable.
</success_criteria>

<output>
After completion, create `.planning/phases/05-reliability-ux-stability/05-reliability-ux-stability-02-SUMMARY.md`
</output>
