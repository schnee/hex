---
phase: 06-generated-image-contract-parity
date: 2026-04-01
status: complete
scope: generated-image-contract-parity
---

# Phase 06 Research — Generated Image Contract Parity

## Problem

`/api/patterns/generate` returns `pattern.png_data` as raw base64 bytes (no `data:image/...` prefix), while React rendering paths (`PatternDisplay`, `OverlayCanvas`) consume `png_data` as browser-ready image `src` values. Existing frontend tests mostly use `data:image/png;base64,...` fixtures and can hide the mismatch.

## Evidence

- Backend response shape emits raw base64: `backend/src/api/patterns.py`
- Backend model describes base64 PNG payload: `backend/src/models/api_models.py`
- Frontend render consumers use `png_data` directly as `<img src>`: `frontend/src/components/PatternDisplay.tsx`, `frontend/src/App.tsx` → `OverlayCanvas`
- Milestone audit flags this as a critical integration risk: `.planning/v1.0-MILESTONE-AUDIT.md`

## Options Considered

1. **Change backend contract to always return data URLs**
   - Pros: frontend consumers remain simple
   - Cons: changes backend contract semantics and could break downstream consumers expecting base64-only

2. **Normalize at frontend API boundary (recommended)**
   - Pros: preserves backend contract stability, centralizes conversion in one boundary layer, minimizes migration risk
   - Cons: requires tests to explicitly cover normalization path so mocks do not bypass it

## Recommendation

Use **frontend API-boundary normalization** in `frontend/src/services/api.ts` for generated patterns:

- Treat backend `png_data` as canonical raw base64 contract
- Convert to browser-ready `data:image/png;base64,...` values before UI consumers receive data
- Add tests that prove:
  - backend contract remains base64-valid
  - frontend boundary normalizes raw payloads
  - routed integration flow renders with backend-shaped payloads

## Validation Architecture

### Fast feedback commands

- Frontend contract/boundary tests:
  - `npm run test:run -- frontend/tests/services/test_apiClientGeneratedImageContract.test.ts`
- Frontend routed integration parity test:
  - `npm run test:run -- frontend/tests/integration/test_generated_image_contract_flow.test.tsx`
- Backend contract guard:
  - `pytest backend/tests/contract/test_patterns_generate.py -k png_data -x`

### Full phase confidence command

- `cd frontend && npm run test:run -- tests/services/test_apiClientGeneratedImageContract.test.ts tests/integration/test_generated_image_contract_flow.test.tsx && cd ../backend && pytest tests/contract/test_patterns_generate.py -k png_data -x`

### Risks to guard

- Module-level API mocks bypassing boundary normalization
- Silent regressions where payload is rendered as non-data URL
- Regressions that accidentally alter backend `png_data` format expectations
