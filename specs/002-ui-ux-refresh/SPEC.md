# Feature Specification: Single-Screen Upload-First Workflow

**Feature Branch**: `feature/ui-ux-refresh`  
**Created**: 2026-04-05  
**Status**: Draft

## Goal

Move the app to a single-screen workflow that starts with wall image upload, then pattern generation, then pattern selection/overlay - with less layout jumping and lower interaction friction.

## Scope

- Replace the current two-workspace flow with one unified screen.
- Make wall image upload the first required step.
- Keep generator controls in a collapsible drawer.
- Render generated pattern cards below the image area (outside the drawer).
- Clicking a pattern applies it as the active overlay, replacing the previous overlay.

## User Flow

1. User lands on single-screen workspace.
2. Primary call-to-action prompts for wall image upload.
3. After successful upload, generator controls become available.
4. User generates pattern options.
5. Generated pattern cards appear below the image.
6. Clicking a card overlays that pattern on the uploaded image.
7. Clicking a different card replaces the existing overlay.
8. User repositions/resizes overlay as needed.

## Functional Requirements

- **FR-001**: System MUST provide one unified workspace (no separate generator/overlay tabs).
- **FR-002**: System MUST gate pattern generation until a wall image upload succeeds.
- **FR-003**: System MUST present generator configuration in a drawer that can be collapsed and expanded.
- **FR-004**: System MUST keep generated pattern cards outside the configuration drawer.
- **FR-005**: System MUST place generated pattern cards below the image preview area.
- **FR-006**: System MUST apply a clicked pattern as the active overlay on the uploaded image.
- **FR-007**: System MUST replace any existing overlay when a new pattern is clicked (single active overlay only).
- **FR-008**: System MUST preserve current overlay move/resize behavior and feedback once a pattern is applied.
- **FR-009**: System MUST show clear loading/success/error feedback for upload, generation, and overlay calculation.
- **FR-010**: System MUST keep layout stable when drawer state or color configuration height changes.

## UX and Layout Requirements

- **UX-001**: Initial screen emphasis MUST be on "Upload wall image".
- **UX-002**: Generate action MUST be visible without requiring long vertical scroll on common desktop sizes.
- **UX-003**: Expanding/collapsing generator controls MUST NOT move the generated pattern card section.
- **UX-004**: Pattern selection state MUST be visually obvious.
- **UX-005**: Mobile layout MUST remain usable with clear access to upload, generate, and pattern selection.

## Acceptance Scenarios (Given/When/Then)

1. **Given** a first-time user opens the app, **When** no wall image is uploaded, **Then** upload is the primary action and generation is unavailable.
2. **Given** a user uploads a valid wall image, **When** upload completes, **Then** generator controls and generate action become available on the same screen.
3. **Given** patterns are generated, **When** results render, **Then** cards appear below the image area and remain visible even if the config drawer is collapsed.
4. **Given** a pattern is already overlaid, **When** user clicks another generated pattern, **Then** the new pattern replaces the old overlay.
5. **Given** a selected overlay exists, **When** user drags/resizes it, **Then** overlay dimensions/position feedback updates correctly.
6. **Given** an operation fails, **When** the error is shown, **Then** the user sees an actionable message and can retry in-place.

## Clear Acceptance Criteria

1. User can complete upload -> generate -> select -> overlay-adjust without switching routes/workspaces.
2. Generate action is blocked before upload, and enabled after upload.
3. Generator controls are in a collapsible drawer.
4. Pattern results render below image and outside the drawer.
5. Exactly one overlay is active at a time; selecting a new pattern replaces it.
6. Existing backend API contracts remain unchanged.
7. Desktop and mobile layouts both pass manual usability check for the new flow.

## Non-Goals

- No backend algorithm/math rewrites for generation or overlay calculations.
- No API contract changes unless strictly required for parity bug fixes.
- No multi-overlay support.
- No account system, saved projects, or cross-session persistence in this phase.
- No redesign of color strategy logic beyond existing controls.

## Assumptions

- Existing upload, generation, and overlay endpoints remain the same.
- Existing context/state model is sufficient to support one-screen orchestration with incremental UI refactor.

## Risks

- Reordering flow may expose hidden state coupling between existing generator and overlay components.
- Drawer and result layout changes can introduce responsive regressions if not validated on narrow screens.
