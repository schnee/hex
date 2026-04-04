# Architecture Patterns

**Domain:** Interactive design tooling (React + FastAPI, compute-heavy generation)
**Project:** Hex Layout Toolkit frontend migration
**Researched:** 2026-03-31
**Overall confidence:** MEDIUM-HIGH

## Recommended Architecture

Use a **modular monolith with clear frontend/backend boundaries** and a **strangler-style UI migration**:

- Keep FastAPI as the stable domain/API boundary (generation, upload, overlay math).
- Make React the primary UX shell, migrating one workflow at a time from Streamlit.
- Separate frontend state into:
  - **Server state** (API data, async lifecycle, retries/caching)
  - **UI/editor state** (canvas transforms, selections, panel visibility)
- Move backend process-local runtime stores (patterns/images) behind a repository boundary so storage can evolve from in-memory to Redis/object storage without route rewrites.

### Logical Diagram

```text
React App Shell
  ├─ Feature: Pattern Generation (form + results)
  ├─ Feature: Overlay Editor (upload + canvas interactions)
  ├─ Server State Layer (query/mutation client)
  └─ UI State Layer (context/reducer for editor state)
           │
           ▼
FastAPI API Layer (routes + validation + error mapping)
  ├─ Pattern Service (CPU-heavy generation/render)
  ├─ Image Service (upload/normalize/metadata)
  ├─ Overlay Service (dimension/transform math)
  └─ Artifact Repository (pattern/image metadata + payload refs)
           │
           ▼
Storage/Execution Infra
  ├─ Local phase: in-memory + filesystem temp
  ├─ Scale phase: Redis (metadata/session) + object store (PNGs/images)
  └─ Optional worker queue for long renders
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `frontend/App shell + routes` | Canonical composition; navigation between generator and overlay flows; feature flags for migration cutover | Feature modules |
| `frontend/features/patterns` | Pattern form, submit lifecycle, results rendering/download trigger | API client + server-state layer |
| `frontend/features/overlay` | Image upload, canvas interactions (drag/resize/rotate), overlay preview state | API client + UI state layer |
| `frontend/server-state layer` | Fetch/mutation orchestration, retry policy, invalidation, loading/error states | FastAPI endpoints |
| `frontend/ui-state layer` | Editor-local interaction state (selected pattern, transform handles, viewport) | Overlay feature components |
| `backend/api/*` | HTTP contracts, Pydantic validation, status/error mapping | Service layer + repository |
| `backend/services/pattern_service` | Deterministic layout generation and rendering | API routes + artifact repository |
| `backend/services/image_service` | Upload validation, resize, image metadata extraction | API routes + artifact repository |
| `backend/services/overlay_service` | Physical/visual dimension calculations using image + pattern metadata | API routes + repository |
| `backend/repository` (new boundary) | CRUD + TTL policy for pattern/image artifacts independent of route logic | Services + storage backends |
| Legacy Streamlit (`streamlit_app.py`) | Temporary fallback surface during migration only | Shared backend domain logic (indirectly) |

## Data Flow

### 1) Pattern generation flow (target)

1. User submits form in React Pattern feature.
2. Frontend mutation sends `GenerateRequest` to `POST /api/patterns/generate`.
3. FastAPI validates request via Pydantic model.
4. Pattern service generates layouts and renders PNG payloads.
5. Service writes artifact metadata through repository boundary.
6. API returns `GenerateResponse` with IDs + dimensions + preview payload.
7. Frontend cache/server-state stores response; UI renders cards and enables download/overlay selection.

### 2) Overlay flow (target)

1. User uploads wall photo from Overlay feature.
2. Frontend mutation posts multipart form to `POST /api/images/upload`.
3. Image service normalizes and stores image metadata/payload reference.
4. UI interaction (drag/resize/rotate) updates local editor state immediately.
5. Frontend sends debounced `POST /api/overlay/calculate` for authoritative dimensions.
6. Overlay service reads image + pattern artifacts and computes dimensions.
7. API returns dimension model; frontend reconciles server-calculated values with canvas display.

### 3) Reliability/error flow

1. FastAPI route converts internal exceptions to stable API errors (no raw internals).
2. Frontend server-state layer applies retry policy only for transient failures (network/5xx), not validation (4xx).
3. UI shows actionable error states per feature module (form-level vs overlay-level), preserving user-entered state.

## Patterns to Follow

### Pattern 1: Feature-first React modules + centralized server-state
**What:** Organize frontend by feature (`features/patterns`, `features/overlay`) and keep API lifecycle in one async state layer.
**When:** Immediately; this prevents current disconnected component wiring from growing worse.
**Why:** Current `App.tsx` is not the real workflow entrypoint; feature-first composition creates one canonical runtime path.

### Pattern 2: Contract-first API integration
**What:** Generate/maintain strict parity between backend Pydantic models and frontend TypeScript contracts.
**When:** Every API change.
**Why:** Existing bug (`scheme60` role naming mismatch) demonstrates contract drift risk.

### Pattern 3: Repository seam for artifact lifecycle
**What:** Introduce a `PatternRepository` / `ImageRepository` interface; keep in-memory adapter first, then swap backend.
**When:** Before scaling or multi-process deployment.
**Why:** Today’s `_stored_patterns`, `_images`, `_patterns` are process-local and unbounded.

### Pattern 4: Progressive migration via route-level cutover
**What:** Keep Streamlit alive only as fallback while React workflows are promoted one-by-one.
**When:** During migration phases.
**Why:** Reduces rewrite risk and allows parity checks against validated behavior.

### Pattern 5: Separate immediate UI transforms from authoritative backend calculations
**What:** Apply drag/resize/rotate instantly in client state; sync with backend-calculated dimensions on debounce/commit.
**When:** Overlay editor interactions.
**Why:** Preserves responsiveness while keeping dimension logic authoritative server-side.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Route handlers owning storage policy
**What:** API files directly managing mutable stores and retention policy.
**Why bad:** Prevents stateless API scale, complicates testing, causes memory leaks.
**Instead:** Repository abstraction + explicit TTL/eviction policy.

### Anti-Pattern 2: Duplicated geometry engines
**What:** Maintaining both legacy and backend pattern algorithms independently.
**Why bad:** Output drift and difficult parity guarantees.
**Instead:** Single shared engine imported by both migration surfaces until Streamlit is retired.

### Anti-Pattern 3: Single mega-component React forms/editors
**What:** Keeping generation and overlay behavior in giant local-state components.
**Why bad:** Hard to test, reason about, and migrate incrementally.
**Instead:** Feature container + smaller presentational/editor primitives + typed hooks.

### Anti-Pattern 4: Treating FastAPI `BackgroundTasks` as a compute queue
**What:** Using background tasks for heavy CPU rendering expecting horizontal scale.
**Why bad:** Background tasks are attached to app process lifecycle, not a durable distributed queue.
**Instead:** Use background tasks only for short post-response work; use worker queue for heavy renders when needed.

## Suggested Build Order (Migration-Safe)

1. **Establish canonical React app composition (no new features yet)**
   - Wire `App.tsx` to real generator/overlay routes/components.
   - Add feature flags (`react_generator`, `react_overlay`) for controlled cutover.
   - Outcome: one runtime path for real testing.

2. **Contract hardening + parity tests at API boundary**
   - Fix known request/response mismatches (e.g., `roles` key naming).
   - Add backend contract tests and frontend type tests around shared models.
   - Outcome: migration can proceed without silent drift.

3. **Introduce repository seam behind existing in-memory stores**
   - Keep behavior identical, but move storage calls out of route modules.
   - Add TTL + max-entry policy in in-memory adapter.
   - Outcome: reliability improvement without infrastructure jump.

4. **Complete React pattern generation workflow with server-state layer**
   - Form submit, loading, retry/error UX, results grid, download action.
   - Keep Streamlit generator available as fallback for parity checks.
   - Outcome: first user-visible migration slice complete.

5. **Complete React overlay workflow with split UI/server state**
   - Upload image, interactive canvas transforms, debounced dimension sync.
   - Correct overlay math to include relevant transform/image factors.
   - Outcome: primary differentiating workflow migrated.

6. **Operational hardening pass**
   - Standardized error envelopes, structured logs, request size limits.
   - Optional: add queue/offload path for heavy generation under load.
   - Outcome: reliable baseline for broader usage.

7. **Retire Streamlit path**
   - Only after parity checklist passes (generation + overlay behavior + exports).
   - Outcome: single frontend surface, lower maintenance overhead.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Pattern/image artifact storage | In-memory acceptable with TTL caps | Move metadata to Redis + payloads to object storage | Multi-region object storage + lifecycle policies |
| Compute-heavy rendering | Inline request processing acceptable | Offload long renders to worker queue; keep quick requests inline | Dedicated render workers + autoscaling + prioritized queues |
| API statelessness | Single instance okay | Multiple API replicas require externalized stores | Full stateless API tier behind load balancer |
| Frontend async reliability | Basic retry/loading states | Centralized query/mutation policies + cancellation | Fine-grained cache strategy + resilience telemetry |
| Migration risk | Dual surface (React + Streamlit) manageable | Enforce feature-flagged cutovers and parity tests | Streamlit removed; strict contract versioning |

## Confidence Notes

- **HIGH:** Current-state boundaries, risks, and migration blockers tied to repository files (`.planning/codebase/*`, `frontend/src/*`, `backend/src/*`).
- **MEDIUM:** Recommended async/server-state patterns and scaling path, validated with official FastAPI/React Query/React docs but still requiring project-specific load testing.
- **LOW:** None.

## Sources

1. Project context and constraints: `.planning/PROJECT.md`.
2. Current architecture map: `.planning/codebase/ARCHITECTURE.md`.
3. Known debt/bugs/performance concerns: `.planning/codebase/CONCERNS.md`.
4. FastAPI official docs via Context7 (`/fastapi/fastapi`): background tasks, file uploads (`UploadFile` spooled behavior).
5. TanStack Query official docs via Context7 (`/tanstack/query/v5.90.3`): query/mutation lifecycle, invalidation, retries.
6. React official docs via Context7 (`/reactjs/react.dev`): lifting state, reducer+context for scalable state boundaries.
