---
phase: 08-backend-contract-suite-reconciliation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/pytest.ini
  - backend/tests/contract/conftest.py
  - backend/tests/contract/test_patterns_generate.py
autonomous: true
requirements: [MIGR-03]
must_haves:
  truths:
    - "Backend contract suites can be executed from backend/ without ad-hoc PYTHONPATH overrides."
    - "Generation contract tests run without setup/runtime defects (no missing imports, no client harness mismatch)."
    - "Generation validation-path assertions reflect FastAPI validation semantics, not stale custom error shapes."
  artifacts:
    - path: "backend/pytest.ini"
      provides: "Backend pytest configuration that resolves src package imports during test runs"
      contains: "pythonpath = ."
    - path: "backend/tests/contract/conftest.py"
      provides: "Shared contract fixtures for deterministic API preconditions"
      contains: "def client("
    - path: "backend/tests/contract/test_patterns_generate.py"
      provides: "Generate endpoint contract coverage with runnable validation assertions"
      contains: "def test_generate_patterns_invalid_colors_count_mismatch"
  key_links:
    - from: "backend/pytest.ini"
      to: "backend/tests/contract/*.py"
      via: "pytest import resolution"
      pattern: "pythonpath\s*=\s*\."
    - from: "backend/tests/contract/conftest.py"
      to: "backend/tests/contract/test_patterns_generate.py"
      via: "shared TestClient/fixture reuse"
      pattern: "client"
---

<objective>
Stabilize backend contract test infrastructure and generation-suite setup so contract checks run cleanly and represent actual endpoint behavior.

Purpose: Remove non-product defects (import path issues and test harness defects) that currently block MIGR-03 confidence.
Output: Runnable pytest configuration, reusable contract fixtures, and corrected generation contract tests.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/08-backend-contract-suite-reconciliation/08-RESEARCH.md
@backend/src/api/patterns.py
@backend/src/models/api_models.py
@backend/pytest.ini
@backend/tests/contract/test_patterns_generate.py

<interfaces>
From `backend/src/models/api_models.py`:

```python
class GenerateRequest(BaseModel):
    total_tiles: int = Field(..., ge=1, le=1000)
    colors: List[str]
    counts: List[int]
    radius: float = Field(default=1.0, ge=0.6, le=2.0)
```

```python
class GenerateResponse(BaseModel):
    patterns: List[Pattern]
```

From `backend/src/api/patterns.py`:

```python
@router.post("/generate", response_model=GenerateResponse)
async def generate_patterns(request: GenerateRequest): ...
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Make backend contract suite runnable from default pytest invocation</name>
  <files>backend/pytest.ini, backend/tests/contract/conftest.py</files>
  <read_first>backend/pytest.ini, backend/tests/contract/test_patterns_generate.py, backend/tests/contract/test_images_upload.py, backend/tests/contract/test_overlay_calculate.py, backend/tests/contract/test_patterns_download.py</read_first>
  <action>Update `backend/pytest.ini` to include `pythonpath = .` under `[tool:pytest]` so `from src.main import app` resolves when running `pytest` from `backend/`. Create `backend/tests/contract/conftest.py` with shared fixtures/helpers: a `TestClient(app)` fixture, an in-memory PNG bytes helper using Pillow, and reusable setup helpers that can generate a valid pattern ID and upload a valid image ID through API calls. Keep helper outputs concrete (`pattern_id`, `image_id`) and avoid global mutable state assumptions.</action>
  <acceptance_criteria>
    - `backend/pytest.ini` contains `pythonpath = .`.
    - `backend/tests/contract/conftest.py` exports a `client` fixture returning `TestClient(app)`.
    - `conftest.py` includes at least one helper/fixture that returns a valid `pattern_id` and one that returns a valid `image_id`.
  </acceptance_criteria>
  <verify>
    <automated>cd backend && pytest tests/contract/test_patterns_generate.py -q --collect-only</automated>
  </verify>
  <done>Pytest can collect contract tests without module import errors, and reusable contract fixtures are available for downstream suites.</done>
</task>

<task type="auto">
  <name>Task 2: Reconcile generate contract tests with current validation semantics</name>
  <files>backend/tests/contract/test_patterns_generate.py</files>
  <read_first>backend/tests/contract/test_patterns_generate.py, backend/tests/contract/conftest.py, backend/src/api/patterns.py, backend/src/models/api_models.py, frontend/src/types/api.ts</read_first>
  <action>Replace the async `AsyncClient` blocks with the shared sync `client` fixture usage so validation-path tests no longer fail with `NameError`. Keep success-path coverage for `png_data` raw base64 behavior. For invalid payload scenarios (counts mismatch, invalid hex colors, missing required fields, out-of-range values), assert FastAPI/Pydantic behavior explicitly: status `422` and response payload contains `detail` (list structure for field validation). Do not assert legacy `error/message` keys that are not part of current contract.</action>
  <acceptance_criteria>
    - `test_patterns_generate.py` no longer references `AsyncClient`.
    - Invalid generate-request tests assert `422` and check `detail` exists.
    - PNG contract test still verifies `png_data` is raw base64 (no data URL prefix) and decodable.
  </acceptance_criteria>
  <verify>
    <automated>cd backend && pytest tests/contract/test_patterns_generate.py -q</automated>
  </verify>
  <done>Generate endpoint contract tests execute cleanly and validate the live backend request/response semantics.</done>
</task>

</tasks>

<verification>
- Confirm contract suite collection succeeds from `backend/` with no import-path overrides.
- Confirm generate contract tests pass and still enforce raw-base64 PNG wire behavior.
</verification>

<success_criteria>
- Setup defects no longer block contract suite execution.
- Generate endpoint contract checks are aligned with current FastAPI validation and error semantics.
</success_criteria>

<output>
After completion, create `.planning/phases/08-backend-contract-suite-reconciliation/08-backend-contract-suite-reconciliation-01-SUMMARY.md`
</output>
