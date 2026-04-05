# Implementation Plan: Mobile Readiness and Overflow Stability

**Branch**: `feature/mobile-readiness`  
**Date**: 2026-04-05  
**Spec**: `specs/003-mobile-readiness/SPEC.md`

## Objective

Deliver a reliable "works on mobile" experience for the upload-first single-screen flow by eliminating upload/overlay overflow issues, strengthening responsive layout behavior, and validating touch-first usability across key breakpoints.

## Scope Anchors

- Keep backend contracts unchanged (`backend/src/models/api_models.py`, `frontend/src/types/api.ts`).
- Prioritize frontend app shell, upload preview, overlay canvas, and pattern result containers.
- Preserve existing generation and overlay interaction behavior while improving layout constraints.
- Validate against explicit viewport checkpoints: `320px`, `375px`, `768px` widths.

## Phased Implementation Order

### Phase 4.1 - Baseline Repro and Test Gaps

- Document current mobile overflow and clipping defects in app shell and overlay regions.
- Add failing or pending test coverage for mobile overflow invariants.

**Exit criteria**: Known issues are reproducible and represented in test scaffolding.

### Phase 4.2 - Upload/Overlay Overflow Fixes

- Apply container constraints and overflow rules in `frontend/src/App.css` and relevant component styles.
- Ensure upload preview and overlay canvas wrappers are width-bounded and aspect-safe.
- Prevent page-level horizontal scroll during core flow.

**Exit criteria**: No horizontal overflow in primary mobile viewport checks.

### Phase 4.3 - Responsive Reflow and Interaction Stability

- Refine generator controls and pattern card layout for narrow widths.
- Validate one-direction scroll behavior and avoid nested scroll traps in primary user path.
- Confirm overlay move/resize remains stable after layout updates.

**Exit criteria**: Upload -> generate -> select -> overlay-adjust remains usable on mobile/tablet widths.

### Phase 4.4 - Validation and Acceptance Sign-off

- Run frontend tests, lint, and build/type checks.
- Perform manual viewport walkthrough aligned to spec scenarios.
- Record acceptance outcomes and unresolved follow-ups in task log.

**Exit criteria**: Clear acceptance criteria met or documented with actionable gaps.

## Risks and Mitigations

- Canvas handle positioning may break under new constraints.
  - Mitigation: verify drag/resize interaction in both automated and manual checks.
- CSS min-width defaults in nested components may trigger hidden overflow.
  - Mitigation: audit container widths and use explicit `min-width: 0`/overflow rules where needed.
- Responsive fixes may regress desktop spacing.
  - Mitigation: include desktop smoke checks in final validation phase.

## Immediate Execution Checklist

- [ ] Add/adjust mobile overflow assertions in frontend tests.
- [ ] Constrain upload preview and overlay wrappers to viewport-safe sizing.
- [ ] Remove horizontal overflow at app shell and section container levels.
- [ ] Reflow pattern cards and generator controls for touch-first use.
- [ ] Verify overlay move/resize behavior at mobile and tablet widths.
- [ ] Run `npm test`, `npm run lint`, and `npm run build`.
- [ ] Record acceptance walkthrough notes in `specs/003-mobile-readiness/tasks.md`.
