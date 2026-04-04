# Feature Landscape

**Domain:** Interactive layout generation + wall overlay visualization (React migration)
**Researched:** 2026-03-31

## Table Stakes

Features users now expect in modern browser-based layout/overlay tools. Missing these will make the React migration feel like a regression vs contemporary UX.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Parametric generator controls with guardrails | Users expect direct control over aspect ratio, tile counts, tendrils, and color strategy with instant validation | Medium | Must preserve current backend-valid behavior from existing generation flow (HIGH confidence) |
| Multi-variant generation results (compare/select) | Generation tools are expected to return several viable options, not a single result | Medium | Keep card/grid comparison and clear "use this pattern" action (HIGH) |
| Upload wall photo with drag/drop + click-to-upload | File-drop upload and immediate feedback are baseline UX for image workflows | Low | Use file type/size limits + explicit rejection errors (HIGH; React Dropzone docs) |
| Interactive overlay transform (drag + resize handles) | Direct manipulation is core to wall-visualization tools | Medium | React canvas interaction should replace Streamlit canvas limitations (HIGH; project docs + React Konva Transformer) |
| Live dimension feedback while transforming overlay | Users expect dimension readouts to update as they move/scale | Medium | Existing backend dimension API behavior should remain source of truth (HIGH) |
| Selection model + clear active state | Canvas editors require obvious "selected object" affordances | Medium | Selection, deselection on blank canvas, and visible handles are baseline (HIGH; React Konva examples) |
| Zoom/pan for precise placement | Fine placement requires zoom in/out and pan; especially on high-res wall images | Medium | Pointer-relative zoom gives expected modern behavior (HIGH; Konva docs) |
| Export final pattern/preview image | Users expect downloadable output for install planning and sharing | Low | Maintain PNG export parity; optionally export composed preview later (HIGH for pattern export, MEDIUM for composed export) |
| Fast, stable interactions (no flicker/jump) | Editor-like tools are expected to feel smooth and predictable | High | Treat interaction smoothness as a requirement, not polish (MEDIUM; inferred from modern UI norms + migration goals) |

## Differentiators

Features that can make the React experience materially better than both Streamlit and "basic" overlay tools.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart snapping + alignment guides | Faster, more professional placement near wall center/edges and other anchors | High | Konva has guide/snap patterns to implement this cleanly (HIGH) |
| Undo/redo interaction history | Encourages experimentation without fear of losing good placements | Medium | State-history pattern is documented in Konva best practices (HIGH) |
| One-click “best fit” auto placement | Reduces manual trial/error by proposing an initial placement/scale | Medium | Use existing dimensions + wall bounds heuristics (MEDIUM) |
| Before/after comparison mode (toggle or split) | Increases user confidence before physical install | Medium | Significant UX value with moderate implementation effort (MEDIUM) |
| Saved design sessions (generator params + overlay state) | Lets users return to prior experiments and compare candidates over time | Medium | Mentioned as future direction in README; high practical value (HIGH for demand, MEDIUM for implementation shape) |
| Preset recipe library (e.g., TV wall, acoustic panel band, hallway runner) | Helps non-expert users get good results quickly | Medium | Maps existing controls into opinionated starter templates (MEDIUM) |

## Anti-Features

Explicitly avoid in this milestone to prevent scope explosion and migration risk.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full 3D room modeling / photoreal rendering | High complexity and unrelated to parity-first migration objective | Keep 2D photo overlay workflow fast and accurate |
| Multi-user collaboration/accounts | Out of scope per project constraints; adds auth/state complexity | Maintain single-user/local workflow |
| CAD/BIM import pipeline | Large integration surface; low value for current core user flow | Focus on image upload + simple reference dimensions |
| AI “generate whole room design” feature set | Distracts from validated hex layout core; hard to evaluate quality | Invest in better deterministic presets + interaction UX |

## Feature Dependencies

```text
Generator controls + validation → Pattern generation API call → Pattern variant selection → Overlay placement

Wall image upload/validation → Image metadata persistence → Overlay transform interactions → Live dimension updates

Selection model → Resize/transform handles → Undo/redo history

Zoom/pan foundation → Precision placement → Snapping/alignment guides

Pattern selection + overlay state model → Save/load sessions
```

## MVP Recommendation

Prioritize:
1. Parametric generator controls with strict validation parity
2. Multi-variant generation + clear pattern selection
3. Wall upload with robust file validation/error UX
4. Drag/resize overlay with live dimensions and stable state updates
5. Zoom/pan for precision placement

Include one differentiator in MVP: **Undo/redo history** (high UX leverage for moderate cost).

Defer:
- Smart snapping guides: valuable, but depends on stable transform/zoom foundations first.
- Save/load sessions: valuable but can follow once core state model hardens.
- Before/after split mode: UX polish after parity + reliability goals are met.

## Sources

- `.planning/PROJECT.md` (project requirements/constraints; HIGH)
- `.planning/codebase/ARCHITECTURE.md` (current flow/state boundaries; HIGH)
- `README.md` (current feature baseline and migration intent; HIGH)
- Context7: React Konva `/konvajs/react-konva` (Transformer, selection, drag/touch events; HIGH)
- Context7: Konva docs `/konvajs/site` (pointer-relative zoom, snapping, undo/redo pattern, export APIs; HIGH)
- Context7: React Dropzone `/react-dropzone/react-dropzone` (file acceptance/rejection, size limits, previews; HIGH)
