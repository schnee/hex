---
phase: 05-reliability-ux-stability
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/PatternGenerator.tsx
  - frontend/src/components/WallImageUploader.tsx
  - frontend/tests/components/test_PatternGenerator.test.tsx
  - frontend/tests/components/test_WallImageUploader.test.tsx
autonomous: true
requirements: [UX-01]
must_haves:
  truths:
    - "User sees loading text while generation request is in progress."
    - "User sees explicit success text after a wall image uploads."
    - "User sees actionable error text for generation/upload failures."
  artifacts:
    - path: "frontend/src/components/PatternGenerator.tsx"
      provides: "Deterministic loading/success/error messaging for generate action"
      contains: "operation status state and user guidance"
    - path: "frontend/src/components/WallImageUploader.tsx"
      provides: "Deterministic loading/success/error messaging for upload action"
      contains: "explicit retry guidance after failure"
    - path: "frontend/tests/components/test_PatternGenerator.test.tsx"
      provides: "Automated assertions for generate-state transitions"
    - path: "frontend/tests/components/test_WallImageUploader.test.tsx"
      provides: "Automated assertions for upload-state transitions"
  key_links:
    - from: "frontend/src/components/PatternGenerator.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.generatePatterns(request)"
      pattern: "generatePatterns\(request\)"
    - from: "frontend/src/components/WallImageUploader.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.uploadImage(file)"
      pattern: "uploadImage\(file\)"
---

<objective>
Add explicit operation feedback for generator and upload flows so users always know when work is running, succeeded, or needs a corrective action.

Purpose: Satisfy UX-01 for generation/upload interactions with deterministic, test-verified messaging.
Output: Updated generation/upload components plus component tests covering loading/success/error/retry paths.
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
@frontend/src/components/PatternGenerator.tsx
@frontend/src/components/WallImageUploader.tsx
@frontend/tests/components/test_PatternGenerator.test.tsx
@frontend/tests/components/test_WallImageUploader.test.tsx

<interfaces>
From `frontend/src/services/api.ts`:
```typescript
async generatePatterns(request: GenerateRequest): Promise<APIResponse<GenerateResponse>>;
async uploadImage(file: File, maxDimension?: number): Promise<APIResponse<UploadResponse>>;
```

From `frontend/src/types/api.ts`:
```typescript
export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: APIError };

export interface APIError {
  detail: string;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add deterministic generator operation-status lifecycle</name>
  <read_first>
    - frontend/src/components/PatternGenerator.tsx
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
  </read_first>
  <files>frontend/src/components/PatternGenerator.tsx</files>
  <behavior>
    - Test 1: submit sets a visible loading status until API resolves.
    - Test 2: successful response shows success confirmation that generation completed.
    - Test 3: failed response shows actionable error text that tells user to adjust inputs or retry.
  </behavior>
  <action>Introduce explicit operation status state in PatternGenerator with values `idle | loading | success | error`. On submit start, set loading and clear prior status/error. On success, set status to success and render `Patterns generated. Select a variant to continue.` in a persistent status element. On API or network failure, set status to error and render actionable guidance: `Generation failed. Review inputs and try again.` while preserving backend detail text below it. Keep existing validation behavior intact, and ensure stale prior success text is cleared when a new submit starts.</action>
  <acceptance_criteria>
    - `frontend/src/components/PatternGenerator.tsx` contains the string `Patterns generated. Select a variant to continue.`
    - `frontend/src/components/PatternGenerator.tsx` contains the string `Generation failed. Review inputs and try again.`
    - `frontend/src/components/PatternGenerator.tsx` contains status state with `idle`, `loading`, `success`, and `error`
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx</automated>
  </verify>
  <done>Generator flow shows explicit loading/success/actionable-error feedback without regressing existing validation rules.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add deterministic upload operation-status lifecycle</name>
  <read_first>
    - frontend/src/components/WallImageUploader.tsx
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
  </read_first>
  <files>frontend/src/components/WallImageUploader.tsx</files>
  <behavior>
    - Test 1: selecting a valid file shows upload loading status.
    - Test 2: successful upload shows explicit success status.
    - Test 3: failed upload shows actionable retry guidance plus backend detail when provided.
  </behavior>
  <action>Add explicit operation status state (`idle | loading | success | error`) in WallImageUploader. Preserve file-type/size prechecks, but normalize all failure paths to include actionable guidance text: `Upload failed. Choose a supported image and try again.` Keep backend detail text appended when available. Ensure successful upload shows `Image uploaded successfully. You can now position the overlay.` and clears any previous error state.</action>
  <acceptance_criteria>
    - `frontend/src/components/WallImageUploader.tsx` contains `Upload failed. Choose a supported image and try again.`
    - `frontend/src/components/WallImageUploader.tsx` contains `Image uploaded successfully. You can now position the overlay.`
    - `frontend/src/components/WallImageUploader.tsx` includes operation status values `idle`, `loading`, `success`, `error`
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx</automated>
  </verify>
  <done>Upload flow surfaces explicit loading/success/actionable-error states for valid and invalid uploads.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Expand component tests for operation-state transitions</name>
  <read_first>
    - frontend/tests/components/test_PatternGenerator.test.tsx
    - frontend/tests/components/test_WallImageUploader.test.tsx
    - frontend/src/components/PatternGenerator.tsx
    - frontend/src/components/WallImageUploader.tsx
  </read_first>
  <files>frontend/tests/components/test_PatternGenerator.test.tsx, frontend/tests/components/test_WallImageUploader.test.tsx</files>
  <behavior>
    - Test 1: generator test asserts loading then success status transition.
    - Test 2: generator test asserts actionable error guidance on failure.
    - Test 3: uploader test asserts loading then success status transition and retry guidance on failure.
  </behavior>
  <action>Update both component suites to assert the new explicit status strings and recovery behavior. Keep existing coverage and add assertions that previous errors clear when a new attempt starts. Avoid brittle timing assumptions by using `findBy*`/`waitFor` for async state transitions.</action>
  <acceptance_criteria>
    - `frontend/tests/components/test_PatternGenerator.test.tsx` asserts loading and success status text
    - `frontend/tests/components/test_PatternGenerator.test.tsx` asserts `Generation failed. Review inputs and try again.`
    - `frontend/tests/components/test_WallImageUploader.test.tsx` asserts `Image uploaded successfully. You can now position the overlay.`
    - `frontend/tests/components/test_WallImageUploader.test.tsx` asserts `Upload failed. Choose a supported image and try again.`
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx</automated>
  </verify>
  <done>Component tests prove deterministic loading/success/error transitions for generation and upload operations.</done>
</task>

</tasks>

<verification>
Run `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx` and confirm all new UX-01 feedback assertions pass.
</verification>

<success_criteria>
- Generation and upload operations each show explicit loading, success, and actionable error messaging.
- Retry attempts clear stale status/error state before new responses render.
- Component tests guard all new status transitions.
</success_criteria>

<output>
After completion, create `.planning/phases/05-reliability-ux-stability/05-reliability-ux-stability-01-SUMMARY.md`
</output>
