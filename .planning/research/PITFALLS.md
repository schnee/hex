# Domain Pitfalls

**Domain:** Streamlit-to-React SPA migration for interactive visual/image geometry tools (Hex Layout Toolkit)
**Researched:** 2026-03-31

## Critical Pitfalls

### Pitfall 1: Re-implementing validated geometry/rendering logic in React (parity drift)
**What goes wrong:** Teams port tile math, layout rules, or overlay calculations into frontend code “for responsiveness,” creating a second logic engine.
**Why it happens:** Streamlit hid computation behind one Python runtime; during SPA migration, teams over-correct and move domain logic to JS instead of keeping FastAPI as source of truth.
**Consequences:** Silent output divergence, hard-to-debug “same inputs, different layout” defects, and expensive reconciliation work.
**Warning signs:**
- Frontend starts owning layout math beyond view transforms.
- Snapshot differences between Streamlit/FastAPI and React outputs grow over time.
- Bug reports include “works in backend script but not in UI.”
**Prevention strategy:**
- Treat backend `pattern_service` + overlay math as canonical.
- Create golden parity tests (fixed seeds/configs/images) that assert identical API outputs across migration.
- Allow frontend-only math only for transient viewport interaction (drag ghosting), never final dimensions.
**Detection:** Weekly parity suite that compares generated pattern metadata and overlay dimensions for a fixed test matrix.

### Pitfall 2: Carrying Streamlit mental model into React (state/event bugs)
**What goes wrong:** Teams assume “single script rerun” behavior and under-design client state flow; React effects then capture stale values or leak listeners.
**Why it happens:** Streamlit reruns top-to-bottom per widget interaction and relies on `st.session_state`; React requires explicit state ownership and effect dependency correctness.
**Consequences:** Janky drag/resize interactions, stale overlay controls, memory leaks, and nondeterministic UI behavior.
**Warning signs:**
- `eslint-disable react-hooks/exhaustive-deps` appears in interaction code.
- Pointer/resize listeners are attached in effects without dependable cleanup.
- UI state resets unexpectedly when navigating tabs/routes.
**Prevention strategy:**
- Define a state ownership map early (generator form state, overlay transform state, API cache state).
- Ban suppressed hook-dependency warnings in migrated feature code.
- Require effect cleanup + integration tests for drag/resize lifecycle.
**Detection:** Lint gate for hooks + interaction test that repeatedly mounts/unmounts overlay components while monitoring listener count.

### Pitfall 3: Contract drift between frontend types and FastAPI models
**What goes wrong:** Frontend request keys/types diverge from backend expectations during iterative migration (example already present: role-key mismatch in Scheme60).
**Why it happens:** Parallel UI/API changes without enforced schema sync and contract tests.
**Consequences:** Runtime 4xx/5xx in core flows, brittle compatibility, and blocked releases.
**Warning signs:**
- Frequent “works locally with mocked API” but fails against real backend.
- Type aliases/adapters proliferate in frontend API client.
- Backend accepts payloads only when optional fields are omitted (workaround behavior).
**Prevention strategy:**
- Generate frontend API types from OpenAPI as single source.
- Add contract tests for all migration-critical payloads (patterns generate, image upload, overlay calculate).
- Introduce compatibility checks in CI: fail on breaking schema diffs unless versioned.
**Detection:** CI contract suite against running FastAPI service + schema diff check per PR.

### Pitfall 4: Releasing “rich overlay UX” without authoritative geometry semantics
**What goes wrong:** UI supports drag/rotate/resize affordances, but backend calculations still ignore key transform fields (left/top/rotation/image dimensions), so output is only approximate.
**Why it happens:** Visual interaction is implemented before measurement semantics are finalized end-to-end.
**Consequences:** False confidence in fit previews, user trust loss, and post-install mismatch risk.
**Warning signs:**
- Overlay API outputs barely change for position/rotation changes.
- Product copy implies precision while service returns scale-only approximations.
- Users manually “nudge until it looks right” due inconsistent reported dimensions.
**Prevention strategy:**
- Define geometry contract first: coordinate system, origin, rotation direction, units, image-space vs world-space transforms.
- Add invariants in tests (changing rotation/position must change expected metrics where mathematically required).
- Gate “precision” UI labels behind validated geometry capabilities.
**Detection:** Contract tests with synthetic fixtures that assert sensitivity to each transform axis.

## Moderate Pitfalls

### Pitfall 1: Image handling architecture that collapses under real usage
**What goes wrong:** Full-buffer reads + base64-heavy responses + per-request rendering create high memory/CPU pressure.
**Warning signs:**
- Rising memory footprint during repeated uploads/generations.
- Slow API latency spikes when generating multiple layouts.
- Browser stutter when large base64 payloads are returned repeatedly.
**Prevention strategy:**
- Enforce upload size/type limits.
- Prefer file/object references over repeated large base64 payload transport where possible.
- Add TTL/eviction for stored patterns/images and plan external storage for scale.

### Pitfall 2: False confidence from misaligned tests during migration
**What goes wrong:** Tests pass while real app path is broken because suites target missing components/exports or mock wrong API boundaries.
**Warning signs:**
- Integration tests import components not mounted by `App`.
- Mock signatures differ from production API client shape.
- Frequent test fixes after simple refactors indicate weak test coupling to runtime reality.
**Prevention strategy:**
- Make mounted `App` flow the primary integration target.
- Remove/repair tests referencing non-existent modules before using them as release criteria.
- Add smoke E2E for generate→overlay→export happy path.

### Pitfall 3: Security assumptions carried from local Streamlit workflows
**What goes wrong:** Public mutation endpoints remain unauthenticated and verbose internal errors leak details when exposed beyond local/dev.
**Warning signs:**
- No auth checks on generate/upload/overlay endpoints.
- API responses include raw exception text.
- CORS policy is the only boundary relied on.
**Prevention strategy:**
- Add authn/authz before broader deployment.
- Standardize safe client-facing errors, detailed server-side logs only.
- Add abuse tests for upload and generation endpoints.

## Minor Pitfalls

### Pitfall 1: Big-bang cutover instead of phased migration
**What goes wrong:** Teams switch everything at once, mixing UX changes with backend refactors and losing rollback safety.
**Warning signs:**
- Single milestone includes routing, state model, API changes, and algorithm updates.
- No feature flags or parallel-run comparison period.
**Prevention strategy:**
- Migrate by workflow slice (pattern generation first, overlay second).
- Keep Streamlit fallback until parity metrics are green.

### Pitfall 2: Dependency/manifests drift across runtimes
**What goes wrong:** Root/backend/frontend manifests diverge and produce non-reproducible local/CI behavior.
**Warning signs:**
- “Works on my machine” dependency differences.
- Different lock states across contributors/CI jobs.
**Prevention strategy:**
- Define one authoritative manifest+lock per runtime.
- Validate install reproducibility in CI.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Warning Signs | Mitigation |
|-------------|---------------|---------------|------------|
| Phase 1 — Contract & Parity Baseline | Contract drift; hidden logic duplication | Frontend adapters grow; parity diffs appear | OpenAPI-generated types, golden parity suite, no frontend domain-math duplication |
| Phase 2 — React App Composition & State Model | Streamlit mental-model carryover | Hook dependency suppressions, state resets on route/tab changes | State ownership map, hook lint as error, lifecycle integration tests |
| Phase 3 — Interactive Overlay Semantics | Pretty interactions without accurate geometry | Rotation/position do not affect backend outputs | Geometry contract first, transform sensitivity tests, precision claims gated |
| Phase 4 — Hardening (Perf/Security/Testing) | Memory bloat, unauth endpoints, false-positive tests | Rising memory, verbose errors, tests passing despite broken app path | Upload limits + eviction, auth/error hardening, App-path integration + E2E smoke |

## Sources

- `.planning/PROJECT.md` (migration goals/constraints) — **HIGH**
- `.planning/codebase/CONCERNS.md` (existing bugs, perf/security fragility) — **HIGH**
- `.planning/codebase/TESTING.md` (test reliability gaps) — **HIGH**
- Streamlit docs: app rerun model and Session State behavior — **HIGH**  
  - https://github.com/streamlit/docs/blob/main/content/get-started/fundamentals/summary.md  
  - https://github.com/streamlit/docs/blob/main/content/develop/concepts/architecture/session-state.md
- React official docs: Effect lifecycle, stale closure/dependency pitfalls — **HIGH**  
  - https://github.com/reactjs/react.dev/blob/main/src/content/learn/lifecycle-of-reactive-effects.md  
  - https://github.com/reactjs/react.dev/blob/main/src/content/learn/separating-events-from-effects.md
- FastAPI docs: background tasks and file handling async/threadpool cautions — **HIGH**  
  - https://github.com/fastapi/fastapi/blob/master/docs/en/docs/tutorial/background-tasks.md  
  - https://github.com/fastapi/fastapi/blob/master/docs/en/docs/tutorial/request-files.md  
  - https://github.com/fastapi/fastapi/blob/master/docs/en/docs/advanced/stream-data.md
