---
phase: 04-end-to-end-react-workflow-cutover
plan: 02
type: execute
wave: 2
depends_on:
  - 04-end-to-end-react-workflow-cutover-01
files_modified:
  - frontend/src/App.tsx
  - frontend/src/App.css
  - frontend/tests/integration/test_pattern_flow.test.tsx
  - frontend/tests/integration/test_overlay_flow.test.tsx
autonomous: true
requirements:
  - MIGR-01
  - MIGR-03
must_haves:
  truths:
    - "User can complete generate → select → navigate → upload → manipulate flow entirely in React routes."
    - "Generator, upload, and overlay calculation interactions remain aligned with typed API wrapper contracts."
    - "Contract-shaped API failures surface actionable detail in the routed UI flow."
  artifacts:
    - path: "frontend/tests/integration/test_pattern_flow.test.tsx"
      provides: "Generator route contract assertions"
      contains: "generatePatterns"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "Overlay route contract assertions for upload and calculate"
      contains: "calculateOverlay"
    - path: "frontend/src/App.tsx"
      provides: "Routed workflow continuity and user-facing error messaging"
      contains: "overlay"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.generatePatterns/uploadImage/calculateOverlay wrapper calls"
      pattern: "apiClient"
    - from: "frontend/tests/integration/test_overlay_flow.test.tsx"
      to: "frontend/src/App.tsx"
      via: "full routed workflow assertions"
      pattern: "overlay"
    - from: "frontend/src/App.tsx"
      to: "frontend/src/types/api.ts"
      via: "typed overlay request/response handling"
      pattern: "OverlayResponse"
---

<objective>
Finalize React-only end-to-end cutover and lock API-contract parity through routed integration coverage.

Purpose: MIGR-01 and MIGR-03 require proving users can complete the full workflow in React while preserving request/response behavior expected by backend contracts.
Output: Updated integration tests for routed workflows plus App/UI hardening where parity gaps appear.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-RESEARCH.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-end-to-end-react-workflow-cutover-01-PLAN.md
@frontend/src/App.tsx
@frontend/src/services/api.ts
@frontend/src/types/api.ts
@frontend/tests/integration/test_pattern_flow.test.tsx
@frontend/tests/integration/test_overlay_flow.test.tsx

<interfaces>
From frontend/src/services/api.ts:
```typescript
type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: APIError };

apiClient.generatePatterns(request: GenerateRequest): Promise<APIResponse<GenerateResponse>>
apiClient.uploadImage(file: File): Promise<APIResponse<UploadResponse>>
apiClient.calculateOverlay(request: OverlayRequest): Promise<APIResponse<OverlayResponse>>
```

From frontend/src/types/api.ts:
```typescript
export interface OverlayRequest {
  image_id: string;
  pattern_id: string;
  overlay_state: OverlayState;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Update integration tests to assert routed full-flow contract parity</name>
  <files>frontend/tests/integration/test_pattern_flow.test.tsx, frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <behavior>
    - Test 1: Pattern flow executes from routed generator view and keeps wrapper-shaped `generatePatterns` expectations.
    - Test 2: Overlay flow enters via routed navigation and asserts `uploadImage` and `calculateOverlay` payload shapes.
    - Test 3: Contract failures expose API `detail` text in user-visible UI feedback.
  </behavior>
  <action>Refactor existing integration suites to route-first behavior introduced in Plan 01 (use route links/path expectations rather than tab role assertions). Keep API mocks wrapper-shaped (`{ success, data|error }`) and add explicit assertions for error-detail propagation in at least one generation or overlay failure path to satisfy MIGR-03.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>Integration tests define full React-only journey and enforce contract-aligned request/response behavior.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Harden routed workflow messaging and API-detail handling in App shell</name>
  <files>frontend/src/App.tsx, frontend/src/App.css, frontend/tests/integration/test_pattern_flow.test.tsx, frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <behavior>
    - Test 1: User completes full routed journey without any tab-based fallback paths.
    - Test 2: Overlay/generation API failures surface deterministic, actionable message text from API `detail` when available.
    - Test 3: Existing selection and precision behaviors remain intact after route cutover.
  </behavior>
  <action>Implement any App/CSS adjustments required by Task 1 failures to keep the routed experience fully React-native (MIGR-01), including clear route navigation affordances and contract-aligned error messaging for generation/upload/overlay interactions (MIGR-03). Preserve Phase 2/3 overlay interaction semantics and avoid introducing direct `fetch` calls in components.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx</automated>
  </verify>
  <done>MIGR-01 and MIGR-03 are met with passing routed integration coverage and contract-consistent user-visible behavior.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx`
</verification>

<success_criteria>
- User can run full generation-to-overlay workflow entirely in routed React screens.
- API wrapper contracts for generation, upload, and overlay calculation are validated by integration tests and reflected in UI feedback.
</success_criteria>

<output>
After completion, create `.planning/phases/04-end-to-end-react-workflow-cutover/04-end-to-end-react-workflow-cutover-02-SUMMARY.md`
</output>
