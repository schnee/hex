# Phase 5 Research: Reliability & UX Stability

**Phase:** 5 (Reliability & UX Stability)  
**Date:** 2026-04-01  
**Scope:** UX-01, UX-02

## Research Inputs

- `.planning/ROADMAP.md` (Phase 5 goal + success criteria)
- `.planning/REQUIREMENTS.md` (UX-01/UX-02 definitions)
- `.planning/STATE.md` (decisions from Phases 1-4)
- `.planning/phases/04-end-to-end-react-workflow-cutover/*-SUMMARY.md` (routed workflow and API-detail feedback pattern)
- `frontend/src/App.tsx` (overlay calculation lifecycle + error handling)
- `frontend/src/components/PatternGenerator.tsx` (generation loading/error lifecycle)
- `frontend/src/components/WallImageUploader.tsx` (upload loading/error lifecycle)
- `frontend/tests/components/test_PatternGenerator.test.tsx`, `frontend/tests/components/test_WallImageUploader.test.tsx`, `frontend/tests/integration/test_overlay_flow.test.tsx` (existing behavior coverage)

## Standard Stack (Use, don’t replace)

- Keep React 18 + TypeScript + Vitest stack.
- Keep `apiClient` wrapper result contract (`{ success: true, data } | { success: false, error }`) as the only UI transport boundary.
- Keep App-level ownership for overlay interaction/calculation state introduced in Phases 2-4.
- Keep route-first integration test style (`WORKSPACE_ROUTES`, link-driven transitions).

## Architecture Patterns for This Phase

1. **Explicit operation state surfaces per workflow step**
   - Generation, upload, and overlay calculation should each present deterministic status text for loading/success/error.
   - Error text should include actionable next steps (retry/regenerate/re-upload) rather than only failure wording.

2. **Stale async result protection for repeated actions**
   - Overlay calculation requests can overlap during drag/resize; only the latest request should update dimensions/status.
   - Guard async state updates with latest-request identifiers to prevent stale response flicker.

3. **Recovery-first interaction design**
   - After an error, the next valid action should clear stale error banners and show progress/result transitions.
   - Tests should verify error-to-success recovery for each core operation.

## Don’t Hand-Roll

- Do not add external state management libraries (Redux/Zustand) for this phase.
- Do not bypass `apiClient` with direct `fetch` in components.
- Do not introduce timers/animations to “hide” instability; fix state sequencing directly.

## Common Pitfalls to Avoid

- Leaving success state implicit (only inferred by UI side-effects) instead of explicit messaging.
- Keeping previous error text visible after a user retries and succeeds.
- Applying late async overlay responses after newer drag/resize events, causing dimensions/status to jump backward.
- Adding non-deterministic UI messaging that is difficult to assert in tests.

## Recommended Plan Shape

- **Plan A (UX-01):** Add explicit loading/success/actionable-error feedback for generation and upload operations with component-level tests.
- **Plan B (UX-01, UX-02):** Harden overlay calculation state transitions against stale async updates and validate repeat-action stability in integration tests.

## Validation Architecture

Use fast frontend-focused checks:

- `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx`
- `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx`

Target feedback latency: under 60 seconds per command.
