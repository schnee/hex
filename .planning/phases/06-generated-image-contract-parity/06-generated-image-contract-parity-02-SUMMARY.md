---
phase: 06-generated-image-contract-parity
plan: 02
subsystem: testing
tags: [react, vitest, integration-tests, contract-parity, image-data]
requires:
  - phase: 06-generated-image-contract-parity
    provides: frontend API boundary normalization for generated png_data
provides:
  - Routed integration test proving raw backend `png_data` is normalized for generator and overlay rendering
  - Contract-focused fixture strategy using shared png_data boundary helper in integration suites
affects: [generator-workflow, overlay-workflow, api-contract-tests]
tech-stack:
  added: []
  patterns: [fetch-level integration stubbing, shared boundary-helper fixtures]
key-files:
  created:
    - frontend/tests/integration/test_generated_image_contract_flow.test.tsx
  modified:
    - frontend/tests/integration/test_pattern_flow.test.tsx
    - frontend/tests/integration/test_overlay_flow.test.tsx
key-decisions:
  - "Validate generated-image contract parity by mocking fetch responses instead of mocking apiClient.generatePatterns."
  - "Replace hardcoded data URL fixtures with helper-based fixture construction to encode boundary intent."
patterns-established:
  - "Integration tests that validate boundary behavior should stub network responses in backend wire shape."
  - "png_data fixtures should be built through shared service helper aliases (`toPngDataUrl`) rather than inline literals."
requirements-completed: [GEN-03, MIGR-01, MIGR-03]
duration: 2m
completed: 2026-04-01
---

# Phase 6 Plan 2: Generated Image Contract Parity Summary

**Routed integration coverage now proves backend-shaped raw `png_data` is normalized and rendered correctly across both generator preview cards and overlay canvas flows.**

## Performance

- **Duration:** 2m
- **Started:** 2026-04-01T19:32:05Z
- **Completed:** 2026-04-01T19:34:18Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added a dedicated routed contract integration test that stubs backend responses via `fetch` with raw base64 `png_data`.
- Asserted data URL rendering parity in both generator card previews and overlay image rendering.
- Updated existing integration fixtures to use shared helper-driven `png_data` construction (`toPngDataUrl` alias) instead of inline data URL literals.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add routed integration parity test with backend-shaped image payloads** - `9ff7dc1` (test)
2. **Task 2: Replace hardcoded data URL fixtures with shared contract helper** - `13df6e2` (test)

## Files Created/Modified
- `frontend/tests/integration/test_generated_image_contract_flow.test.tsx` - Adds routed generate→select→overlay contract parity test using raw backend-shaped payloads.
- `frontend/tests/integration/test_pattern_flow.test.tsx` - Uses helper-based `png_data` fixtures (`toPngDataUrl`) in generator integration scenarios.
- `frontend/tests/integration/test_overlay_flow.test.tsx` - Uses helper-based `png_data` fixtures (`toPngDataUrl`) in overlay integration scenarios.

## Decisions Made
- Used real service boundary behavior in the new parity test by mocking `fetch`, ensuring normalization is exercised through production API client code.
- Kept existing service export name intact and used a local alias (`toPngDataUrl`) in tests to express contract intent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Integration module mocks needed helper export for new fixture strategy**
- **Found during:** Task 2 verification
- **Issue:** `vi.mock('../../src/services/api')` in existing suites did not provide `normalizeGeneratedPatternPngData`, causing test module load failure after helper import.
- **Fix:** Added `normalizeGeneratedPatternPngData` to both mocked modules using the same normalization semantics.
- **Files modified:** `frontend/tests/integration/test_pattern_flow.test.tsx`, `frontend/tests/integration/test_overlay_flow.test.tsx`
- **Verification:** `npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx tests/integration/test_generated_image_contract_flow.test.tsx`
- **Committed in:** `13df6e2`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for tests to execute with new helper-based fixtures; no scope expansion.

## Issues Encountered
- Task 1 TDD RED step was pre-satisfied by prior Plan 01 normalization implementation; new integration test passed immediately and served as contract lock-in coverage.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 06 now has both service-level and routed integration contract coverage for generated-image payload parity.
- Milestone migration contract parity requirements are test-guarded and ready for verification.

## Known Stubs
None.

---
*Phase: 06-generated-image-contract-parity*
*Completed: 2026-04-01*

## Self-Check: PASSED

- FOUND: .planning/phases/06-generated-image-contract-parity/06-generated-image-contract-parity-02-SUMMARY.md
- FOUND: 9ff7dc1
- FOUND: 13df6e2
