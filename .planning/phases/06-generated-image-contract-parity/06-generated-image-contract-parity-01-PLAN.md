---
phase: 06-generated-image-contract-parity
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/tests/contract/test_patterns_generate.py
  - frontend/src/services/api.ts
  - frontend/src/types/api.ts
  - frontend/tests/services/test_apiClientGeneratedImageContract.test.ts
autonomous: true
requirements: [GEN-02, MIGR-03]
must_haves:
  truths:
    - "Generated pattern payload contract is explicit: backend returns raw base64 PNG bytes in `png_data`."
    - "Frontend API boundary converts backend raw base64 into browser-ready `data:image/png;base64,...` before UI consumption."
  artifacts:
    - path: "backend/tests/contract/test_patterns_generate.py"
      provides: "Contract guard for `png_data` shape and validity"
      contains: "png_data"
    - path: "frontend/src/services/api.ts"
      provides: "Generated image payload normalizer used by `generatePatterns`"
      contains: "generatePatterns"
    - path: "frontend/tests/services/test_apiClientGeneratedImageContract.test.ts"
      provides: "Unit tests for frontend boundary normalization"
      contains: "raw base64"
  key_links:
    - from: "backend/src/api/patterns.py"
      to: "frontend/src/services/api.ts"
      via: "`png_data` contract and normalization"
      pattern: "png_data"
---

<objective>
Lock the generated-image contract and normalize it at the API boundary so React consumers always receive browser-renderable image src values.

Purpose: Eliminate the audit-flagged mismatch between backend raw base64 payloads and frontend rendering expectations.
Output: Backend contract guard tests + frontend normalization implementation with dedicated unit coverage.
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
@.planning/v1.0-MILESTONE-AUDIT.md
@backend/src/api/patterns.py
@backend/src/models/api_models.py
@frontend/src/services/api.ts
@frontend/src/types/api.ts

<interfaces>
From backend/src/models/api_models.py:
```python
class Pattern(BaseModel):
    png_data: str = Field(..., description="Base64-encoded PNG image")

class GenerateResponse(BaseModel):
    patterns: List[Pattern]
```

From frontend/src/services/api.ts:
```ts
async generatePatterns(request: GenerateRequest): Promise<APIResponse<GenerateResponse>>
```

From frontend/src/types/api.ts:
```ts
export interface Pattern {
  id: string;
  png_data: string;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add backend contract guard for `png_data` shape</name>
  <files>backend/tests/contract/test_patterns_generate.py</files>
  <read_first>backend/tests/contract/test_patterns_generate.py, backend/src/api/patterns.py, backend/src/models/api_models.py</read_first>
  <behavior>
    - Test 1: `POST /api/patterns/generate` returns non-empty `png_data` strings for each generated pattern.
    - Test 2: `png_data` values are base64-decodable binary content.
    - Test 3: `png_data` does not include a `data:image/` prefix (raw base64 contract remains explicit).
  </behavior>
  <action>Refactor `backend/tests/contract/test_patterns_generate.py` to add deterministic assertions for `png_data` contract semantics (raw base64, decodable, non-empty) per D-audit-gap in `.planning/v1.0-MILESTONE-AUDIT.md`. Keep backend API behavior unchanged (do not switch backend response to data URL format in this task).</action>
  <acceptance_criteria>
    - `test_patterns_generate.py` contains assertions for both `base64.b64decode(...)` success and absence of `data:image/` prefix.
    - `pytest` run passes for the contract test subset.
  </acceptance_criteria>
  <verify>
    <automated>cd backend && pytest tests/contract/test_patterns_generate.py -k png_data -x</automated>
  </verify>
  <done>Backend contract tests fail if `png_data` contract silently drifts away from raw-base64 semantics.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Normalize generated image payloads in frontend API boundary</name>
  <files>frontend/src/services/api.ts, frontend/src/types/api.ts, frontend/tests/services/test_apiClientGeneratedImageContract.test.ts</files>
  <read_first>frontend/src/services/api.ts, frontend/src/types/api.ts, frontend/tests/integration/test_pattern_flow.test.tsx</read_first>
  <behavior>
    - Test 1: `generatePatterns` converts backend raw `png_data` to `data:image/png;base64,...`.
    - Test 2: Existing already-prefixed values are preserved idempotently.
    - Test 3: Non-success API responses keep current wrapper error behavior.
  </behavior>
  <action>Implement an explicit generated-image normalization helper in `frontend/src/services/api.ts` (and export it for reuse in tests) that converts raw base64 payloads into browser-ready PNG data URLs. Apply this helper inside `generatePatterns` success-path mapping so every returned pattern is normalized per MIGR-03. Add/update type comments in `frontend/src/types/api.ts` to document boundary behavior (backend raw -> frontend normalized), and create `frontend/tests/services/test_apiClientGeneratedImageContract.test.ts` to lock behavior with mocked `fetch` responses.</action>
  <acceptance_criteria>
    - `api.ts` contains a dedicated helper used by `generatePatterns` to normalize `pattern.png_data`.
    - Service test file verifies raw and already-prefixed inputs.
    - Service test exits 0 under `npm run test:run`.
  </acceptance_criteria>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/services/test_apiClientGeneratedImageContract.test.ts</automated>
  </verify>
  <done>Frontend boundary contract guarantees UI receives browser-renderable generated-image `src` values without changing backend wire format.</done>
</task>

</tasks>

<verification>
- Run backend contract subset and frontend service subset; both must pass.
- Confirm no production code path now relies on hardcoded `data:image/...` test fixtures only.
</verification>

<success_criteria>
- Raw `png_data` backend contract is explicit and test-guarded.
- Frontend `generatePatterns` boundary normalization is implemented and unit-tested.
</success_criteria>

<output>
After completion, create `.planning/phases/06-generated-image-contract-parity/06-generated-image-contract-parity-01-SUMMARY.md`
</output>
