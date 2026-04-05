# Phase 4.1 Baseline: Mobile Overflow Repro Notes

## T001: Reproducible Mobile Overflow Defects

### Defect 1: Overlay stage can exceed viewport width after upload

- **Viewport:** `320x568` and `375x812`
- **Flow:** upload image -> generate patterns -> select pattern (overlay canvas visible)
- **Impacted selectors/components:**
  - `frontend/src/components/OverlayCanvas.tsx` (`.overlay-stage-viewport`, `.overlay-stage`, stage `<img>`)
  - `frontend/src/App.css` (`.overlay-canvas`, `.overlay-stage-viewport`, `.overlay-stage`)
- **Why it overflows:** overlay stage uses inline-block/intrinsic image sizing with no explicit `max-width`/`width: 100%` bounds on the stage image container chain.
- **Expected:** overlay surface fits within available mobile content width.
- **Actual:** stage width can track image intrinsic width and push content wider than the viewport.

### Defect 2: Overlay viewport status row can force horizontal spill on narrow widths

- **Viewport:** `320x568`
- **Flow:** reach overlay canvas and use pan/zoom controls
- **Impacted selectors/components:**
  - `frontend/src/components/OverlayCanvas.tsx` (`.overlay-viewport-status` text row)
  - `frontend/src/App.css` (`.overlay-viewport-status`)
- **Why it overflows:** status row is `inline-flex` with no wrapping behavior and fixed-gap tokens (`scale`, `offsetX`, `offsetY`).
- **Expected:** status metadata wraps or compresses without forcing page width expansion.
- **Actual:** status text can remain on one line and contribute to horizontal spill risk at phone widths.

### Defect 3: Pattern grid default 3-up inline style is a mobile overflow risk before CSS override

- **Viewport:** narrow mobile (`320x568`)
- **Flow:** upload -> generate patterns
- **Impacted selectors/components:**
  - `frontend/src/components/PatternDisplay.tsx` (`patterns-grid` inline `gridTemplateColumns: repeat(3, minmax(220px, 1fr))`)
  - `frontend/src/App.css` (`.patterns-grid-three-up` media override)
- **Why it overflows:** component sets a desktop-oriented 3-column inline style by default; mobile behavior relies on downstream media-query correction.
- **Expected:** mobile-safe column definition should be guaranteed for narrow viewports.
- **Actual:** layout correctness depends on override order, creating fragile overflow behavior.

## T002: Affected File Inventory

Primary files to update in Phase 4.2/4.3 based on current overflow vectors:

1. `frontend/src/App.tsx`
   - Workspace shell structure (`workspace-shell`, overlay section, generator/results panels) that determines overflow containment hierarchy.
2. `frontend/src/App.css`
   - App shell spacing, grid/flex constraints, overlay wrapper styles, and responsive breakpoint overrides.
3. `frontend/src/components/OverlayCanvas.tsx`
   - Overlay stage/viewport markup where wall image and transform surface width constraints need to be enforced.
4. `frontend/src/components/WallImageUploader.tsx`
   - Upload control wrapper that participates in narrow-width layout behavior at the top of the flow.
5. `frontend/src/components/PatternDisplay.tsx`
   - Pattern card grid inline column configuration that currently defaults to a 3-up desktop footprint.

## T003: Viewport Validation Checkpoints

Use these checkpoints for automated and manual verification in later tasks:

| Checkpoint | Resolution | Orientation | Purpose |
| --- | --- | --- | --- |
| VP-320 | `320x568` | Phone narrow portrait | Stress test for shell, upload controls, overlay bounds, and no horizontal scrolling. |
| VP-375 | `375x812` | Phone standard portrait | Primary acceptance path for upload -> generate -> select -> overlay adjust. |
| VP-768 | `768x1024` | Small tablet portrait | Validate tablet responsive reflow and ensure no regression in control readability. |

Verification gates for each checkpoint:

- No page-level horizontal scroll during upload -> generate -> select flow.
- Uploaded image preview and overlay canvas stay width-bounded with aspect preserved.
- Pattern cards remain readable and selectable without overlap/clipping.
