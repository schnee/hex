---
phase: 02-overlay-interaction-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/WallImageUploader.tsx
  - frontend/tests/components/test_WallImageUploader.test.tsx
autonomous: true
requirements:
  - OVR-01
must_haves:
  truths:
    - "User can upload a wall image using file picker and see a processed preview state."
    - "User receives explicit rejection messaging for unsupported file types or oversized files."
  artifacts:
    - path: "frontend/src/components/WallImageUploader.tsx"
      provides: "Upload UI, client-side validation, API upload wiring"
      contains: "handleFileChange"
    - path: "frontend/tests/components/test_WallImageUploader.test.tsx"
      provides: "OVR-01 contract tests for accept/reject/upload states"
      contains: "WallImageUploader"
  key_links:
    - from: "frontend/src/components/WallImageUploader.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.uploadImage(file)"
      pattern: "uploadImage"
---

<objective>
Create the upload interaction slice so users can add a wall image and receive clear, actionable rejection messages when files are invalid.

Purpose: OVR-01 is the prerequisite input step for all overlay interaction work.
Output: A tested wall-image upload component that validates and uploads via the current API wrapper contract.
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
@frontend/src/services/api.ts
@frontend/src/types/api.ts

<interfaces>
From frontend/src/services/api.ts:
```typescript
async uploadImage(file: File, maxDimension?: number): Promise<APIResponse<UploadResponse>>;
```

From frontend/src/types/api.ts:
```typescript
export interface UploadResponse {
  image_id: string;
  width: number;
  height: number;
  processed_data: string;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write upload acceptance/rejection tests for OVR-01</name>
  <files>frontend/tests/components/test_WallImageUploader.test.tsx</files>
  <read_first>
    - frontend/tests/components/test_PatternGenerator.test.tsx
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
  </read_first>
  <behavior>
    - Test 1: Selecting a valid JPEG/PNG invokes upload API and surfaces success state.
    - Test 2: Unsupported MIME type shows a deterministic error message including allowed types.
    - Test 3: Files over 10MB show deterministic size rejection and do not call upload API.
  </behavior>
  <action>Author a focused component test suite for `WallImageUploader` (per OVR-01) using `vi.mock('../../src/services/api')` wrapper semantics that return `{ success: true, data }` or `{ success: false, error }`. Assert exact messages: `Invalid file type. Use JPG, PNG, or GIF.` and `File size too large. Maximum 10MB.` Add one success assertion checking callback receives `{ image_id, processed_data, width, height }` from upload response.</action>
  <acceptance_criteria>
    - `frontend/tests/components/test_WallImageUploader.test.tsx` contains `describe('WallImageUploader'`.
    - Test file contains the exact strings `Invalid file type. Use JPG, PNG, or GIF.` and `File size too large. Maximum 10MB.`.
    - Test file asserts `uploadImage` is not called for invalid file paths.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx</automated>
  </verify>
  <done>OVR-01 behaviors are locked in failing/then-passing tests before component implementation.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement WallImageUploader with strict validation and API wrapper handling</name>
  <files>frontend/src/components/WallImageUploader.tsx</files>
  <read_first>
    - frontend/src/services/api.ts
    - frontend/src/types/api.ts
    - frontend/src/components/PatternGenerator.tsx
    - frontend/tests/components/test_WallImageUploader.test.tsx
  </read_first>
  <behavior>
    - Test 1: Valid image upload emits processed image payload to parent callback.
    - Test 2: Invalid file type/size paths show exact rejection text without API call.
    - Test 3: Upload API failure surfaces actionable error text from `error.detail`.
  </behavior>
  <action>Create `WallImageUploader` with a labeled file input (`Upload wall image`), accepted types `.jpg,.jpeg,.png,.gif`, and max size `10 * 1024 * 1024`. Implement state for `isUploading`, `errorMessage`, and `uploadedImage`. On valid select, call `apiClient.uploadImage(file)`; if `success: true`, pass `data` through `onUploadComplete`; if `success: false`, render `error.detail` fallback `Upload failed`. Keep this component self-contained and do not mutate PatternContext here.</action>
  <acceptance_criteria>
    - `frontend/src/components/WallImageUploader.tsx` contains `accept='.jpg,.jpeg,.png,.gif'`.
    - File contains `10 * 1024 * 1024` (10MB limit).
    - File contains both `isUploading` and `onUploadComplete`.
    - Component calls `apiClient.uploadImage` (not raw `fetch`).
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx</automated>
  </verify>
  <done>User can upload valid images and gets clear rejection messaging for unsupported inputs (OVR-01, per roadmap).</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx`
</verification>

<success_criteria>
- Upload component enforces file type and size constraints before API calls.
- Upload success and failure states are user-visible and deterministic.
</success_criteria>

<output>
After completion, create `.planning/phases/02-overlay-interaction-foundation/02-overlay-interaction-foundation-01-SUMMARY.md`
</output>
