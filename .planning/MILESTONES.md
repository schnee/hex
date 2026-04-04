# Milestones

## v1.0 MVP (Shipped: 2026-04-03)

**Delivered:** React-first generation and overlay workflows with backend contract-parity hardening and full milestone evidence closure.

**Phases completed:** 8 phases, 19 plans, 41 tasks

**Stats:**

- 109 files changed
- 11,564 insertions / 2,132 deletions
- 2 days from first milestone commit to ship
- Git range: `41de32f` → `709f257`

**Key accomplishments:**

- React pattern workspace now uses a typed context provider to carry generated variants and active card selection between generator and display components.
- Pattern generator behavior is now test-locked around immediate validation, wrapper-based API submission, and multi-variant callback delivery with strictly composed request payloads.
- React pattern results now support clear active-card selection and keyboard-accessible PNG export, with component and integration tests proving the full generation-to-download journey.
- Wall image upload now validates file type and size client-side, calls the API wrapper for valid files, and returns typed upload payloads to parent state.
- OverlayCanvas now supports direct drag and resize manipulation with deterministic select/deselect behavior and visible selected-state semantics.
- App now delivers a complete overlay workflow by combining pattern selection, wall upload, and direct overlay manipulation with deterministic selection behavior.
- React overlay workspace now requests `/api/overlay/calculate` on upload and drag/resize updates and renders backend-returned physical/visual dimensions in a dedicated panel.
- Overlay workspace now supports bounded zoom/pan navigation while keeping drag/resize interactions and backend dimension updates stable.
- React Router-based generator/overlay workspace navigation now redirects from `/` to `/generator` and keeps selected pattern context across route changes.
- Full routed React workflow now has end-to-end integration coverage with contract-shaped API assertions and actionable overlay error detail messaging.
- Generation and upload UI now expose deterministic async lifecycle feedback with actionable recovery text and retry-safe component tests.
- Overlay calculations now use latest-request-wins sequencing with explicit recovery messaging, and integration tests prove stale responses cannot overwrite newer results.
- Generated pattern payloads now keep raw backend base64 on the wire while frontend `generatePatterns` always returns browser-renderable `data:image/png;base64,...` sources.
- Routed integration coverage now proves backend-shaped raw `png_data` is normalized and rendered correctly across both generator preview cards and overlay canvas flows.
- Backfilled goal-backward verification evidence for phases 1-3 so GEN/OVR requirements now have explicit verification-source artifacts with normalized audit status semantics.
- Backfilled phase 4-6 verification artifacts with evidence-backed MIGR/UX requirement coverage and explicit png_data contract-parity wiring for milestone audit traceability.
- Reconciled requirement traceability and refreshed the v1.0 milestone audit so completion status now matches post-backfill verification-source evidence.
- Backend generation contract tests now run from `backend/` with shared fixtures and verify live FastAPI validation semantics, including raw-base64 PNG payload behavior.
- Upload, overlay, and download backend contract suites now assert live FastAPI status/detail semantics with deterministic API-seeded preconditions and pass as a complete regression guardrail.

---
