# Tasks: UI/UX Refresh (Single-Screen Upload-First Workflow)

**Spec**: `specs/002-ui-ux-refresh/SPEC.md`  
**Plan**: `specs/002-ui-ux-refresh/plan.md`

## Execution Order

Phase order is strict: **3.1 Setup/Scaffold -> 3.2 Tests First -> 3.3 Core Refactor -> 3.4 UX Stabilization -> 3.5 Validation**.

## Immediate Execution Checklist (Start Here)

- [x] T001 Remove workspace route split and render one-screen container in `frontend/src/App.tsx`.
- [x] T004 Add upload-first generation gating state wiring in `frontend/src/App.tsx`.
- [x] T006 Add collapsible generator drawer shell and toggle behavior in `frontend/src/App.tsx`.
- [x] T010 Move generated pattern results below image/overlay region and outside drawer in `frontend/src/App.tsx`.
- [x] T013 Keep single-active-overlay replacement behavior when selecting a new card.
- [x] T017 Rewrite routed integration test to single-screen journey in `frontend/tests/integration/test_routed_workspace_flow.test.tsx`.

## Phase 3.1: Setup and Scaffolding

- [x] T001 Refactor `frontend/src/App.tsx` layout to a single unified workspace shell.
- [x] T002 Remove `BrowserRouter`/`Routes`/`NavLink` dependencies from `frontend/src/App.tsx`.
- [x] T003 Deprecate route constants usage in `frontend/src/routes/workspaceRoutes.ts` (delete or stop importing in app flow).

## Phase 3.2: Tests First (Required Before Final UI Polish)

- [x] T004 Update app workspace behavior tests for upload-first gating in `frontend/tests/components/test_AppPatternWorkspace.test.tsx`.
- [x] T005 Add assertion coverage for generation disabled before upload and enabled after upload in `frontend/tests/components/test_AppPatternWorkspace.test.tsx`.
- [x] T006 Add drawer collapse/expand behavior assertions and layout invariants in `frontend/tests/components/test_AppPatternWorkspace.test.tsx`.
- [x] T007 Update pattern card placement assertions to ensure cards remain outside drawer and below image area in `frontend/tests/components/test_AppPatternWorkspace.test.tsx`.
- [x] T008 Rewrite routed flow test into single-screen flow test in `frontend/tests/integration/test_routed_workspace_flow.test.tsx`.
- [x] T009 Add integration test for selecting second pattern replacing active overlay in `frontend/tests/integration/test_overlay_flow.test.tsx`.

## Phase 3.3: Core Refactor

- [x] T010 Implement upload-first primary CTA and generator gating UI state in `frontend/src/App.tsx`.
- [x] T011 Implement collapsible generator drawer container in `frontend/src/App.tsx`.
- [x] T012 Keep `PatternGenerator` mounted in drawer while rendering `PatternDisplay` outside drawer in `frontend/src/App.tsx`.
- [x] T013 Ensure `handlePatternSelect` always sets one active overlay and clears prior selection state in `frontend/src/App.tsx`.
- [x] T014 Preserve overlay move/resize and dimension-refresh behavior after refactor in `frontend/src/App.tsx`.
- [x] T015 Remove generator/overlay guidance copy tied to old two-workspace flow in `frontend/src/App.tsx`.

## Phase 3.4: UX and Responsive Stabilization

- [x] T016 Update layout styles for stable drawer toggle behavior in `frontend/src/App.css`.
- [x] T017 Ensure generated card section remains vertically stable when drawer expands/collapses in `frontend/src/App.css`.
- [x] T018 Ensure generate action remains visible on common desktop viewport heights in `frontend/src/App.css`.
- [ ] T019 Tune mobile stacking and spacing for upload -> generate -> select sequence in `frontend/src/App.css`.
- [ ] T020 Strengthen selected-card visual state styling in `frontend/src/App.css` and/or `frontend/src/components/PatternDisplay.tsx`.

## Phase 3.5: Feedback and Validation

- [ ] T021 Confirm upload/generation/overlay loading and error feedback copy is clear and actionable in `frontend/src/App.tsx` and `frontend/src/components/PatternGenerator.tsx`.
- [ ] T022 Verify no API contract changes in `frontend/src/types/api.ts` against `backend/src/models/api_models.py`.
- [ ] T023 Run frontend test suite (`npm test`) and fix regressions.
- [ ] T024 Run frontend lint/type checks (`npm run lint`, `npm run build` or `npm run type-check` if available).
- [ ] T025 Perform manual acceptance walkthrough for desktop and mobile viewport scenarios and record outcomes in this file.

## Dependency Notes

- T001-T003 should land before deep test rewrites to avoid dual-flow complexity.
- T004-T009 should be updated before final polish tasks to lock behavior.
- T016-T020 depend on structure from T010-T015.
- T023-T025 are final gates.
