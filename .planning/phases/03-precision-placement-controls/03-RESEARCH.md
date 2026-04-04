# Phase 3 Research: Precision Placement Controls

**Phase:** 3 (Precision Placement Controls)  
**Date:** 2026-04-01  
**Scope:** OVR-03, OVR-04

## Research Inputs

- `.planning/ROADMAP.md` (Phase 3 goal + success criteria)
- `.planning/REQUIREMENTS.md` (OVR-03 and OVR-04 definitions)
- `.planning/phases/02-overlay-interaction-foundation/*-SUMMARY.md` (existing overlay wiring + interaction decisions)
- `frontend/src/App.tsx` and `frontend/src/components/OverlayCanvas.tsx` (current overlay composition and transform handling)
- `frontend/src/services/api.ts` and `frontend/src/types/api.ts` (overlay calculation contract)
- `backend/src/api/overlay.py` and `backend/src/services/overlay_service.py` (authoritative dimension endpoint)
- Context7 docs for `react-draggable` and `react-resizable` (controlled drag + scale/bounds/resize behavior)

## Standard Stack (Use, don’t replace)

- **Overlay interaction libraries:** keep `react-draggable` + `react-resizable` (already installed)
- **Dimension source of truth:** call existing `apiClient.calculateOverlay` (`POST /api/overlay/calculate`) for OVR-03
- **Contracts:** reuse `OverlayState`, `OverlayRequest`, `OverlayResponse`, `UploadResponse`, `Pattern` from `frontend/src/types/api.ts`
- **State ownership:** keep overlay state controlled in `App` (Phase 2 established pattern), pass callbacks to `OverlayCanvas`

## Architecture Patterns for This Phase

1. **Live dimensions as derived state from backend API**
   - Trigger overlay calculation when drag/resize ends and when transform-affecting controls change.
   - Render a dedicated dimensions panel in overlay workspace showing physical and visual dimensions.
   - Preserve backend authority: no independent physical-dimension math in frontend.

2. **Viewport controls separate from overlay transform**
   - Keep `overlayState` for object placement.
   - Introduce independent viewport state (`zoom`, `panX`, `panY`) for canvas navigation.
   - Ensure drag math remains correct under zoom using `Draggable` `scale` prop.

3. **Precision UX with explicit controls**
   - Add zoom in/out and reset viewport controls with deterministic bounds.
   - Add pan interaction for canvas navigation that does not mutate overlay object position.
   - Keep selected/unselected overlay semantics from Phase 2 unchanged.

## Don’t Hand-Roll

- Do not replace `react-draggable` / `react-resizable` with custom pointer engines.
- Do not compute “authoritative” physical dimensions in frontend; always use `calculateOverlay` response.
- Do not merge viewport pan/zoom state into backend `overlay_state` payload; backend contract currently expects overlay transforms only.

## Common Pitfalls to Avoid

- Calling `calculateOverlay` without prerequisites (`selectedPattern`, `uploadedImage`) causing noisy API errors.
- Forgetting `Draggable` `scale` when parent canvas is zoomed, which causes incorrect movement deltas.
- Conflating canvas pan with overlay drag state updates.
- Regressing OVR-05 selection semantics while adding new controls.

## Recommended Plan Shape

- **Plan A (OVR-03):** Add live dimensions panel and backend-coupled calculation flow with component tests.
- **Plan B (OVR-04):** Add zoom + pan viewport controls in overlay canvas with interaction tests.
- **Plan C (integration):** Verify complete precision-placement workflow in integration tests and App wiring.

## Validation Architecture

Use fast Vitest slices with explicit phase-focused commands:

- After each task: `cd frontend && npm run test:run -- <task-scoped test file>`
- After each plan: `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
- Before phase verification: run all precision files together:
  - `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx`

Target max feedback latency: < 60 seconds per command.
