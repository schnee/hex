# Tasks: Mobile Readiness and Overflow Stability

**Spec**: `specs/003-mobile-readiness/SPEC.md`  
**Plan**: `specs/003-mobile-readiness/plan.md`

## Execution Order

Phase order is strict: **4.1 Baseline -> 4.2 Overflow Fixes -> 4.3 Responsive Reflow -> 4.4 Validation**.

## Immediate Execution Checklist (Start Here)

- [x] T001 Capture and list reproducible mobile overflow issues in app shell/upload/overlay areas.
- [x] T004 Add viewport-oriented test scaffolding for overflow invariants.
- [x] T008 Apply upload and overlay container width/overflow fixes.
- [x] T011 Reflow pattern cards and control layout for narrow screens.
- [ ] T014 Validate overlay interaction parity on mobile breakpoints.
- [ ] T017 Run full frontend validation and record outcomes.

## Phase 4.1: Baseline and Scaffolding

- [x] T001 Document current mobile overflow defects with impacted selectors/components.
- [x] T002 Identify affected files (`frontend/src/App.tsx`, `frontend/src/App.css`, overlay/image components).
- [x] T003 Define viewport checkpoints for validation (`320x568`, `375x812`, `768x1024`).

## Phase 4.2: Tests First (Mobile Overflow Invariants)

- [x] T004 Add/extend component tests for no horizontal overflow shell assumptions in `frontend/tests/components/test_AppPatternWorkspace.test.tsx`.
- [x] T005 Add assertions for upload preview/canvas container bounds in relevant component tests.
- [x] T006 Add integration coverage for upload -> generate -> select flow under mobile viewport mocks.
- [x] T007 Ensure tests cover pattern-card reflow behavior at narrow widths.

## Phase 4.3: Overflow Fixes and Responsive Reflow

- [x] T008 Implement app-level overflow guards and width constraints in `frontend/src/App.css`.
- [x] T009 Implement upload preview and overlay wrapper sizing constraints in `frontend/src/App.css` and/or component styles.
- [x] T010 Ensure nested layout containers do not force overflow (`min-width` and flex/grid constraint updates).
- [x] T011 Reflow pattern cards for touch-friendly stacking on mobile widths.
- [ ] T012 Tune generator panel layout and control spacing for `<= 768px`.
- [ ] T013 Verify primary actions remain discoverable without horizontal scrolling.

## Phase 4.4: Interaction Validation and Sign-off

- [ ] T014 Verify overlay drag/resize behavior remains functional post-layout changes.
- [ ] T015 Run `npm test` and fix regressions.
- [ ] T016 Run `npm run lint` and `npm run build` (or type-check equivalent).
- [ ] T017 Perform manual acceptance walkthrough at required breakpoints and log pass/fail results.
- [ ] T018 Confirm no API contract changes required (`frontend/src/types/api.ts` vs `backend/src/models/api_models.py`).

## Validation Log

- 2026-04-05: Completed Phase 4.1 baseline documentation tasks (T001-T003) in `specs/003-mobile-readiness/phase-4.1-baseline.md`.

## Dependency Notes

- T004-T007 should land before final CSS hardening so regressions are caught early.
- T008-T013 depend on baseline issue mapping from T001-T003.
- T014 depends on completed overflow and reflow changes.
- T015-T018 are final quality gates.
