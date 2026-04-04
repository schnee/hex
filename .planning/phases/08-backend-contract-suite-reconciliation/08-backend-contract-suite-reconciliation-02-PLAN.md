---
phase: 08-backend-contract-suite-reconciliation
plan: 02
type: execute
wave: 2
depends_on: [08-backend-contract-suite-reconciliation-01]
files_modified:
  - backend/tests/contract/test_images_upload.py
  - backend/tests/contract/test_overlay_calculate.py
  - backend/tests/contract/test_patterns_download.py
autonomous: true
requirements: [MIGR-03]
must_haves:
  truths:
    - "Upload, overlay, and download contract tests assert current FastAPI status/error semantics instead of stale legacy shapes."
    - "Overlay and download success-path tests use valid preconditions generated through the API (real image/pattern IDs)."
    - "Backend contract suites for generate/upload/overlay/download run green as reusable regression guardrails for MIGR-03."
  artifacts:
    - path: "backend/tests/contract/test_images_upload.py"
      provides: "Upload endpoint contract assertions aligned to current status and detail payloads"
      contains: "def test_upload_image_no_file"
    - path: "backend/tests/contract/test_overlay_calculate.py"
      provides: "Overlay endpoint contract assertions with deterministic valid/invalid preconditions"
      contains: "def test_overlay_calculate_valid_request"
    - path: "backend/tests/contract/test_patterns_download.py"
      provides: "Pattern download contract assertions using generated pattern IDs"
      contains: "def test_download_pattern_valid_id"
  key_links:
    - from: "backend/tests/contract/conftest.py"
      to: "test_overlay_calculate.py + test_patterns_download.py"
      via: "fixture-provided image_id/pattern_id preconditions"
      pattern: "valid_(image|pattern)_id"
    - from: "backend/src/api/images.py + backend/src/api/overlay.py + backend/src/api/patterns.py"
      to: "contract suite assertions"
      via: "status code + detail shape checks"
      pattern: "status_code == (200|400|404|415|422)"
---

<objective>
Reconcile stale upload/overlay/download contract assertions and validate full backend contract suite stability.

Purpose: Restore evidence-backed API contract confidence for MIGR-03 by making regression tests match live endpoint behavior.
Output: Updated contract suites for upload, overlay, and download plus a green full-suite run.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/v1.0-MILESTONE-AUDIT.md
@.planning/phases/08-backend-contract-suite-reconciliation/08-RESEARCH.md
@.planning/phases/08-backend-contract-suite-reconciliation/08-backend-contract-suite-reconciliation-01-SUMMARY.md
@backend/src/api/images.py
@backend/src/api/overlay.py
@backend/src/api/patterns.py
@backend/src/models/api_models.py
@backend/tests/contract/conftest.py
@backend/tests/contract/test_images_upload.py
@backend/tests/contract/test_overlay_calculate.py
@backend/tests/contract/test_patterns_download.py

<interfaces>
From `frontend/src/types/api.ts`:

```typescript
export interface APIError {
  detail: string;
}
```

From backend APIs:

```python
POST /api/images/upload -> 200 UploadResponse, 415 detail (unsupported type), 422 detail (missing/invalid form fields)
POST /api/overlay/calculate -> 200 OverlayResponse, 400 detail (missing image/pattern by endpoint logic), 422 detail (schema validation)
GET /api/patterns/{pattern_id}/download -> 200 image/png, 404 detail (pattern not found)
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Align image upload contract tests to current FastAPI semantics</name>
  <files>backend/tests/contract/test_images_upload.py</files>
  <read_first>backend/tests/contract/test_images_upload.py, backend/src/api/images.py, backend/src/models/api_models.py, frontend/src/types/api.ts</read_first>
  <action>Update upload tests so error assertions match live API contract: unsupported media type remains `415` and response uses `detail`; missing `file` and invalid `max_dimension` are request validation errors returning `422` with `detail` payload entries (do not expect `400` or `error/message`). Keep valid PNG/JPEG success-path metadata assertions. Replace flaky oversized-file expectation (`413 or 200`) with deterministic behavior aligned to current implementation (no explicit size-limit rejection in endpoint path).</action>
  <acceptance_criteria>
    - Upload error assertions use `detail` keys, not `error`/`message` keys.
    - `test_upload_image_no_file` expects `422`.
    - `test_upload_image_invalid_max_dimension` expects `422`.
    - File-too-large test has a deterministic single expected status for current behavior.
  </acceptance_criteria>
  <verify>
    <automated>cd backend && pytest tests/contract/test_images_upload.py -q</automated>
  </verify>
  <done>Upload contract tests now represent the actual endpoint contract and run without stale assertion failures.</done>
</task>

<task type="auto">
  <name>Task 2: Align overlay and pattern-download contract tests with deterministic preconditions</name>
  <files>backend/tests/contract/test_overlay_calculate.py, backend/tests/contract/test_patterns_download.py</files>
  <read_first>backend/tests/contract/conftest.py, backend/tests/contract/test_overlay_calculate.py, backend/tests/contract/test_patterns_download.py, backend/src/api/overlay.py, backend/src/api/patterns.py, backend/src/services/overlay_service.py</read_first>
  <action>Refactor overlay/download tests to use fixture-provided valid IDs created during test setup (generated pattern + uploaded image) before success-path calls. For invalid cases, keep one valid identifier and vary the target invalid field so each test isolates the intended failure reason. Assert current status semantics: overlay validation errors `422` with `detail`; missing image/pattern from endpoint logic `400` with `detail` string; download missing pattern `404` with `detail`. Keep PNG signature assertion for successful download response body.</action>
  <acceptance_criteria>
    - `test_overlay_calculate_valid_request` uses fixture-seeded valid `image_id` and `pattern_id` and expects `200`.
    - Overlay invalid-scale and missing-field tests assert `422` and inspect `detail`.
    - `test_download_pattern_valid_id` obtains a real generated `pattern_id` via fixture/setup and asserts `image/png` signature.
    - `test_download_pattern_invalid_id` asserts `404` with `detail` payload.
  </acceptance_criteria>
  <verify>
    <automated>cd backend && pytest tests/contract/test_overlay_calculate.py tests/contract/test_patterns_download.py -q && pytest tests/contract -q</automated>
  </verify>
  <done>Overlay and download contract suites are deterministic and full backend contract suite passes cleanly as a MIGR-03 guardrail.</done>
</task>

</tasks>

<verification>
- Run all backend contract tests from `backend/` and confirm green status.
- Confirm all contract error assertions use FastAPI `detail` semantics consistent with frontend API error typing.
</verification>

<success_criteria>
- Backend contract tests for generate/upload/overlay/download pass without setup defects.
- Assertions enforce real API behavior and validation semantics, not legacy assumptions.
</success_criteria>

<output>
After completion, create `.planning/phases/08-backend-contract-suite-reconciliation/08-backend-contract-suite-reconciliation-02-SUMMARY.md`
</output>
