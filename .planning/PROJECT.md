# Hex Layout Toolkit

## What This Is

Hex Layout Toolkit is an interactive design application for creating and previewing custom hexagonal tile layouts for acoustic panels and decorative wall installs. The product now ships a React-first routed workspace for generation and overlay workflows while preserving the validated FastAPI/Python geometry and rendering engine.

## Core Value

A user can quickly generate a high-quality hex layout and confidently preview how it will look on their real wall before building.

## Current State

- **Shipped milestone:** v1.0 MVP (2026-04-03)
- **Frontend:** React routed workflow (`/generator` and `/overlay`) is productionized for core user journeys
- **Backend:** FastAPI contract surface for generate/upload/overlay/download is stabilized and covered by contract suites
- **Evidence:** Milestone archive and audit at `.planning/milestones/v1.0-ROADMAP.md`, `.planning/milestones/v1.0-REQUIREMENTS.md`, `.planning/milestones/v1.0-MILESTONE-AUDIT.md`

## Requirements

### Validated

- ✓ Users can generate aspect-aware hex tile layouts with configurable tendrils and color strategies (`streamlit_app.py`, `app/tabs/generator.py`, `backend/src/api/patterns.py`) — pre-existing
- ✓ Users can upload wall photos and compute overlay dimensions for real-world fit checks (`app/tabs/overlay.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`) — pre-existing
- ✓ Users can export generated patterns as PNG assets (`backend/src/api/patterns.py`) — pre-existing
- ✓ Core hex math and rendering services are available in reusable Python modules (`app/hex_tile_layouts_core.py`, `backend/src/services/pattern_service.py`) — pre-existing
- ✓ Full primary UX migrated from Streamlit to React with routed generation + overlay workflows — v1.0
- ✓ API-first contract parity maintained between React and FastAPI, including generated image payload normalization semantics — v1.0
- ✓ Direct overlay interactions (drag/resize/select/zoom/pan) and backend-authoritative dimensions are stable in the React workspace — v1.0

### Active

- [ ] Add undo/redo overlay editing (`ENH-01`)
- [ ] Add snapping/alignment guides for precision placement (`ENH-02`)
- [ ] Add preset-based startup and saved-session restoration (`PERS-01`, `PERS-02`)

### Out of Scope

- Native mobile apps (iOS/Android) — web product remains primary
- Multi-tenant auth/accounts and collaboration — not part of current milestone scope
- Full 3D room modeling and photoreal rendering — not required for core layout + wall preview value

## Context

The codebase now operates as a React + FastAPI system with tested end-to-end user flows and reconciled milestone verification artifacts. Milestone v1.0 closed migration, parity, and contract-confidence gaps and archived all planning artifacts for historical reference.

## Constraints

- **Tech stack:** Keep Python/FastAPI backend and existing algorithmic services
- **Compatibility:** Maintain API contract stability for frontend integration (`backend/src/models/api_models.py`, `frontend/src/types/api.ts`)
- **Quality:** Preserve and extend automated test coverage in `backend/tests/` and `frontend/tests/`
- **Migration strategy:** Continue incremental milestone delivery; avoid rewriting validated math/rendering engine

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React becomes the primary frontend experience | Streamlit limits interactive UX for overlay workflows and fine-grained client interactions | ✓ Good (v1.0) |
| FastAPI remains the system boundary for frontend/backend communication | Existing endpoints and typed contracts support migration path and testability | ✓ Good (v1.0) |
| Reuse existing pattern/overlay domain logic instead of rewriting algorithms | Core behavior is validated and already encoded in backend services | ✓ Good (v1.0) |
| Normalize generated `png_data` at frontend API boundary while preserving backend raw-base64 wire contract | Preserves API compatibility and ensures browser-safe image rendering | ✓ Good (v1.0) |

## Next Milestone Goals

1. Expand editing productivity (undo/redo, snapping, guides)
2. Add persistence workflows for repeat users (save/load + presets)
3. Address remaining frontend warning debt and type-check quality debt

---
*Last updated: 2026-04-03 after v1.0 milestone completion*
