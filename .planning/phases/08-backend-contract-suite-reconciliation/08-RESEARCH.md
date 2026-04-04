---
phase: 08-backend-contract-suite-reconciliation
date: 2026-04-02
status: complete
scope: backend-contract-suite-reconciliation
---

# Phase 08 Research — Backend Contract Suite Reconciliation

## Problem

The backend contract suites for generation, upload, and overlay are currently not reliable guardrails for MIGR-03 confidence. They fail for setup reasons (import path and missing AsyncClient symbol), stale assertion contracts (expecting `error/message` instead of FastAPI `detail`), and invalid preconditions (overlay/download tests assuming image/pattern IDs exist without seeding them).

## Evidence

- Current milestone audit calls this out as the remaining integration-quality gap for MIGR-03: `.planning/v1.0-MILESTONE-AUDIT.md`
- Contract test setup/expectation drift exists in:
  - `backend/tests/contract/test_patterns_generate.py`
  - `backend/tests/contract/test_images_upload.py`
  - `backend/tests/contract/test_overlay_calculate.py`
  - `backend/tests/contract/test_patterns_download.py`
- FastAPI endpoints and models define current behavior/validation semantics:
  - `backend/src/api/patterns.py`
  - `backend/src/api/images.py`
  - `backend/src/api/overlay.py`
  - `backend/src/models/api_models.py`

Observed run evidence (backend dir):

- `pytest tests/contract -q` fails at collection with `ModuleNotFoundError: No module named 'src'`
- `PYTHONPATH=. pytest tests/contract -q` runs but reports `14 failed, 6 passed`
- Failure classes:
  - `AsyncClient` NameError in `test_patterns_generate.py`
  - stale status/error-shape assertions (expecting `400` and `error/message` where API returns `422` and `detail`)
  - invalid overlay/download preconditions (non-existent IDs used in “valid” tests)

## Options Considered

1. **Change backend API error contract to match stale tests**
   - Pros: less test churn
   - Cons: breaks existing frontend wrappers and diverges from FastAPI defaults; unnecessary API behavior churn

2. **Reconcile tests to actual FastAPI contract and deterministic setup (recommended)**
   - Pros: preserves API stability, restores guardrail value, aligns with current typed frontend `APIError { detail: string }`
   - Cons: requires fixture refactor and assertion updates across multiple contract suites

## Recommendation

Use **test-suite reconciliation** (not API rewrite):

- Make contract suite runnable by default from `backend/` (no ad-hoc `PYTHONPATH=. ...` requirement)
- Centralize reusable setup fixtures in `backend/tests/contract/conftest.py`
- Update contract assertions to current behavior:
  - validation failures use `422` with FastAPI `detail` payloads
  - endpoint-raised HTTPException uses endpoint-specific status with `detail` string
- Seed valid preconditions for overlay/download contract tests by creating real image/pattern IDs through API flows before asserting success paths

## Validation Architecture

### Fast feedback commands

- `cd backend && pytest tests/contract/test_patterns_generate.py -q`
- `cd backend && pytest tests/contract/test_images_upload.py -q`
- `cd backend && pytest tests/contract/test_overlay_calculate.py -q`
- `cd backend && pytest tests/contract/test_patterns_download.py -q`

### Full phase confidence command

- `cd backend && pytest tests/contract -q`

### Risks to guard

- Reintroducing fixture assumptions that depend on mutable in-memory order
- Asserting exact validation error text rather than stable status/shape/field-location semantics
- Passing suite only under special environment flags instead of default backend test invocation
