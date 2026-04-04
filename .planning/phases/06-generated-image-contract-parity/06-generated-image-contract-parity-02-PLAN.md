---
phase: 06-generated-image-contract-parity
plan: 02
type: execute
wave: 2
depends_on: [06-generated-image-contract-parity-01]
files_modified:
  - frontend/tests/integration/test_generated_image_contract_flow.test.tsx
  - frontend/tests/integration/test_pattern_flow.test.tsx
  - frontend/tests/integration/test_overlay_flow.test.tsx
autonomous: true
requirements: [GEN-03, MIGR-01, MIGR-03]
must_haves:
  truths:
    - "Routed generate → overlay workflow renders generated images correctly when backend returns raw base64 `png_data`."
    - "Integration coverage verifies the real frontend boundary path, not only pre-normalized fixture assumptions."
  artifacts:
    - path: "frontend/tests/integration/test_generated_image_contract_flow.test.tsx"
      provides: "End-to-end routed contract parity test with backend-shaped payloads"
      contains: "raw base64"
    - path: "frontend/tests/integration/test_pattern_flow.test.tsx"
      provides: "Generator flow fixtures aligned to contract helper"
      contains: "toPngDataUrl"
    - path: "frontend/tests/integration/test_overlay_flow.test.tsx"
      provides: "Overlay flow fixtures aligned to contract helper"
      contains: "toPngDataUrl"
  key_links:
    - from: "frontend/src/services/api.ts"
      to: "frontend/src/App.tsx"
      via: "`apiClient.generatePatterns` normalized response"
      pattern: "generatePatterns"
    - from: "frontend/src/App.tsx"
      to: "frontend/src/components/OverlayCanvas.tsx"
      via: "`patternImageSrc={selectedPattern.png_data}`"
      pattern: "patternImageSrc"
---

<objective>
Prove routed workflow contract parity with backend-shaped generated-image payloads so pattern previews and overlay rendering remain reliable in real usage.

Purpose: Close the audit integration/flow gap by asserting image rendering against raw-backend payload shapes through automated routed tests.
Output: A dedicated routed contract integration test and updated integration fixtures that no longer hardcode data URL assumptions.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/06-generated-image-contract-parity/06-RESEARCH.md
@frontend/src/App.tsx
@frontend/src/services/api.ts
@frontend/tests/integration/test_pattern_flow.test.tsx
@frontend/tests/integration/test_overlay_flow.test.tsx

<interfaces>
From frontend/src/App.tsx:
```tsx
<OverlayCanvas
  wallImageSrc={uploadedImage.processed_data}
  patternImageSrc={selectedPattern.png_data}
/>
```

From frontend/src/services/api.ts (Plan 01 output):
```ts
export const toPngDataUrl: (value: string) => string;
apiClient.generatePatterns(...): Promise<APIResponse<GenerateResponse>>
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add routed integration parity test with backend-shaped image payloads</name>
  <files>frontend/tests/integration/test_generated_image_contract_flow.test.tsx</files>
  <read_first>frontend/tests/integration/test_overlay_flow.test.tsx, frontend/tests/integration/test_pattern_flow.test.tsx, frontend/src/App.tsx, frontend/src/services/api.ts</read_first>
  <behavior>
    - Test 1: backend raw `png_data` response is normalized through API boundary during generate flow.
    - Test 2: generated card preview image renders with data URL `src`.
    - Test 3: overlay route reuses selected pattern and renders overlay image without broken-src contract mismatch.
  </behavior>
  <action>Create `test_generated_image_contract_flow.test.tsx` that renders routed App with real `apiClient` behavior (mock/stub `fetch`, not `apiClient.generatePatterns`) and backend-shaped `/api/patterns/generate` JSON containing raw base64 `png_data`. Drive user flow: generate -> select -> navigate overlay -> upload image -> assert preview and overlay `<img>` elements have `src` values beginning with `data:image/png;base64,` and calculate overlay request still uses selected `pattern_id` per MIGR-01/MIGR-03.</action>
  <acceptance_criteria>
    - New integration test file exists and uses backend-shaped raw base64 fixture.
    - Test includes assertions for both generator preview and overlay image `src` values.
    - Test command exits 0.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_generated_image_contract_flow.test.tsx</automated>
  </verify>
  <done>Automated routed flow proves real contract parity for generated-image rendering across generator and overlay routes.</done>
</task>

<task type="auto">
  <name>Task 2: Replace hardcoded data URL fixtures with shared contract helper</name>
  <files>frontend/tests/integration/test_pattern_flow.test.tsx, frontend/tests/integration/test_overlay_flow.test.tsx</files>
  <read_first>frontend/tests/integration/test_pattern_flow.test.tsx, frontend/tests/integration/test_overlay_flow.test.tsx, frontend/src/services/api.ts</read_first>
  <action>Update integration fixtures to remove inline `data:image/png;base64,...` literals and build fixture `png_data` via exported boundary helper from `frontend/src/services/api.ts` (e.g., `toPngDataUrl(RAW_BASE64_PNG)`), so tests encode contract intent explicitly and stop depending on ad-hoc data URL assumptions per audit gap.</action>
  <acceptance_criteria>
    - No inline `data:image/png;base64,mock` literals remain in the two targeted integration files.
    - Both integration suites still pass and preserve existing behavior assertions.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx tests/integration/test_generated_image_contract_flow.test.tsx</automated>
  </verify>
  <done>Integration tests document and enforce generated-image contract handling through shared boundary normalization semantics.</done>
</task>

</tasks>

<verification>
- Run focused routed integration suite for generated-image contract parity.
- Ensure no test path relies on backend-incompatible image fixture assumptions.
</verification>

<success_criteria>
- Routed end-to-end integration coverage validates generated-image contract shape with backend-like responses.
- Pattern preview and overlay rendering assertions pass with normalized data URLs produced by boundary logic.
</success_criteria>

<output>
After completion, create `.planning/phases/06-generated-image-contract-parity/06-generated-image-contract-parity-02-SUMMARY.md`
</output>
