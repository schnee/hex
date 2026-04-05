# Implementation Plan: UI/UX Refresh (Single-Screen Upload-First Workflow)

**Branch**: `feature/ui-ux-refresh`  
**Date**: 2026-04-05  
**Spec**: `specs/002-ui-ux-refresh/SPEC.md`

## Objective

Refactor the current routed generator/overlay experience into one unified workspace where wall image upload is the first required step, generation controls live in a collapsible drawer, generated pattern cards render below the image area, and selecting a card always applies a single active overlay.

## Scope Anchors

- Preserve backend API contracts and payload types (`backend/src/models/api_models.py`, `frontend/src/types/api.ts`).
- Keep existing overlay move/resize behavior and feedback loop (`frontend/src/components/OverlayCanvas.tsx`, overlay calculation API).
- Replace route-based workspace switching with one-screen orchestration in frontend.
- Maintain desktop and mobile usability with stable layout during drawer toggles and control height changes.

## Phased Implementation Order

### Phase 1 - App Flow Restructure (Single Workspace)

- Remove generator/overlay route split from `frontend/src/App.tsx` and `frontend/src/routes/workspaceRoutes.ts` usage.
- Establish one page-level layout containing: upload area, drawer controls, generated cards area, overlay canvas.
- Keep context state wiring for generated patterns and selected pattern.

**Exit criteria**: App renders as one workspace with no route navigation dependency.

### Phase 2 - Upload-First Gating + Drawer Behavior

- Gate generator actions until upload success state exists (FR-002).
- Add collapsible drawer wrapper for generator controls with explicit expanded/collapsed states.
- Ensure generate CTA is visible on common desktop viewport heights.

**Exit criteria**: Upload is required before generation and drawer collapse does not hide/relocate results.

### Phase 3 - Pattern Results Placement + Overlay Selection

- Render pattern cards below image/overlay region and outside drawer (FR-004, FR-005).
- Clicking a card applies selected pattern to overlay and replaces prior active overlay (FR-006, FR-007).
- Keep selection state visually obvious (UX-004).

**Exit criteria**: Exactly one active overlay at a time; card click swaps overlay reliably.

### Phase 4 - Layout Stability + Responsive Refinement

- Prevent vertical jump when drawer toggles or color control section expands/collapses (FR-010, UX-003).
- Validate mobile arrangement for upload, generate, and pattern selection touch usability (UX-005).
- Tune spacing and panel sizing in `frontend/src/App.css` (and related component styles if needed).

**Exit criteria**: Stable card section positioning and usable mobile flow.

### Phase 5 - Feedback States + Regression Validation

- Ensure clear loading/success/error UI for upload, generation, and overlay calculation (FR-009).
- Update/replace routed workflow tests with single-screen flow tests.
- Run frontend test suite and targeted backend contract checks for no API drift.

**Exit criteria**: Acceptance scenarios in spec pass via automated tests + manual walkthrough.

## Risks and Mitigations

- Hidden state coupling between generator and overlay can regress selection/apply behavior.
  - Mitigation: convert tests first for upload -> generate -> select -> overlay flow.
- Drawer/layout changes can create responsive regressions.
  - Mitigation: explicit desktop/mobile checkpoints in Phase 4 plus CSS stability assertions.
- Overlay refresh race conditions during rapid pattern switching.
  - Mitigation: retain latest-request guard pattern already present in `App.tsx`.

## Immediate Execution Checklist

- [ ] Replace route-driven workspace shell in `frontend/src/App.tsx` with one unified layout scaffold.
- [ ] Introduce local `isGeneratorDrawerOpen` UI state and drawer toggle control.
- [ ] Gate `PatternGenerator` interaction until `uploadedImage` exists.
- [ ] Move `PatternDisplay` section below image/overlay panel and keep it outside drawer markup.
- [ ] Confirm pattern click updates selected state and triggers overlay replacement path.
- [ ] Update `frontend/src/App.css` for non-jumping layout (fixed regions/consistent flow blocks).
- [ ] Rewrite routed integration coverage to single-screen journey assertions.
- [ ] Run `npm test` (frontend) and capture pass/fail notes against spec acceptance criteria.
