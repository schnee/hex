# Phase 2 Research: Overlay Interaction Foundation

**Phase:** 2 (Overlay Interaction Foundation)  
**Date:** 2026-04-01  
**Scope:** OVR-01, OVR-02, OVR-05

## Research Inputs

- `.planning/ROADMAP.md` (Phase 2 goals + success criteria)
- `.planning/REQUIREMENTS.md` (OVR-01, OVR-02, OVR-05 definitions)
- `app/tabs/overlay.py` (legacy interaction behavior to preserve)
- `backend/src/api/images.py` and `backend/src/api/overlay.py` (contract behavior)
- `frontend/src/services/api.ts`, `frontend/src/types/api.ts`, `frontend/src/context/PatternContext.tsx`
- `frontend/tests/integration/test_overlay_flow.test.tsx` (current failing/legacy expectations)

## Standard Stack (Use, don’t replace)

- **Upload + transport:** Existing `apiClient.uploadImage` wrapper in `frontend/src/services/api.ts`
- **Overlay interaction libs:** Existing installed dependencies `react-draggable` and `react-resizable`
- **Shared contracts:** `OverlayState`, `OverlayRequest`, `OverlayResponse`, `UploadResponse` in `frontend/src/types/api.ts`
- **State ownership baseline:** Keep pattern generation selection in `PatternContext`; add overlay UI state at component/app level for now

## Architecture Patterns for This Phase

1. **Component split by concern**
   - `WallImageUploader` handles file validation + upload states.
   - `OverlayCanvas` handles drag/resize/select interactions.
   - `App` orchestrates selected pattern + uploaded image + overlay state.

2. **API wrapper contract discipline**
   - Frontend consumes `{ success: true, data } | { success: false, error }` from `apiClient` methods.
   - No direct assumptions about raw fetch response shape.

3. **Selection clarity as first-class behavior**
   - Visible active overlay state
   - Predictable deselect/reselect via explicit interactions

## Don’t Hand-Roll

- Do not reimplement drag physics/resize handles manually in DOM when `react-draggable` + `react-resizable` are already installed.
- Do not duplicate backend dimension math in frontend; Phase 2 should only manage visual transform interactions and call existing overlay API where needed.
- Do not introduce new upload libraries; existing native input + API wrapper is sufficient for this scope.

## Common Pitfalls to Avoid

- Mocking API methods with legacy non-wrapper return shapes (causes false positives).
- Blending upload validation, overlay transforms, and app orchestration in one mega-component.
- Missing explicit selected/deselected UI markers, which weakens OVR-05 acceptance.
- Writing integration tests that depend on removed App exports or stale tab structure assumptions.

## Recommended Plan Shape

- Plan A (OVR-01): Upload component + validation messaging + tests
- Plan B (OVR-02/OVR-05): Overlay interaction component + selection semantics + tests
- Plan C (wiring): App composition + integration test proving upload + manipulate + selection predictability

## Validation Architecture

Use fast, task-level Vitest sampling:

- After each task: run the task-scoped test file (`npm run test:run -- <file>`)
- After each plan: run overlay-focused integration (`npm run test:run -- tests/integration/test_overlay_flow.test.tsx`)
- Keep runtime under ~60 seconds per command

This phase can be validated without adding new infrastructure.
