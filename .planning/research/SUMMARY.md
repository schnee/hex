# Project Research Summary

**Project:** Hex Layout Toolkit frontend migration (Streamlit → React + FastAPI)
**Domain:** Interactive layout generation + wall-overlay visualization
**Researched:** 2026-03-31
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a parity-first migration from a Streamlit workflow to a production-grade React + FastAPI application for generating hex-based panel layouts and previewing them on uploaded wall photos. The research is consistent across stack, features, architecture, and pitfalls: experts keep domain geometry/rendering logic in the backend, use React for responsive interaction UX, and enforce strict API contracts to avoid drift while migrating incrementally.

Recommended implementation is a modular monolith with clear boundaries: React (Vite, React Router, TanStack Query) for feature-first UI modules, FastAPI + Pydantic for contract-first APIs, and a repository seam behind artifact storage so the app can move from in-memory stores to Redis/object storage without route rewrites. MVP should prioritize generator validation parity, multi-variant selection, upload + overlay manipulation, live dimensions, and zoom/pan—plus undo/redo as the highest-value early differentiator.

Primary risks are parity drift (duplicate frontend geometry logic), contract mismatch between frontend/backend models, and shipping visually rich overlay controls before geometry semantics are truly authoritative. Mitigation is explicit: golden parity suites, OpenAPI-generated frontend types in CI, state-ownership discipline in React, transform-sensitivity tests for overlay math, and phased cutover with Streamlit fallback until parity is proven.

## Key Findings

### Recommended Stack

The stack recommendation is modern, mainstream, and migration-safe: React 19 + Vite 8 + React Router 7 + TanStack Query 5 on the frontend, with FastAPI 0.135 + Pydantic 2.12 on the backend. The architecture explicitly separates server state from UI/editor state, and contract generation from OpenAPI is treated as a non-optional guardrail.

**Core technologies:**
- **React 19.2 + Vite 8:** Primary SPA runtime and fast build/dev loop — current ecosystem baseline post-CRA.
- **React Router 7 + TanStack Query 5:** Route boundaries + robust API lifecycle/caching — avoids ad-hoc fetch/state bugs.
- **FastAPI 0.135 + Pydantic 2.12:** Typed API boundary and validation — keeps backend logic canonical and testable.
- **Redis 7.4 (near-term scale path):** Replaces process-local runtime artifact/session state — required for multi-worker reliability.
- **react-konva 19:** Canvas-native drag/resize/transform/selection patterns — stronger fit than primitive DOM composition.

Critical version/coupling notes: keep React/react-konva major compatibility aligned; keep FastAPI/Pydantic minor ranges pinned during migration; generate TypeScript types from FastAPI OpenAPI on every API change.

### Expected Features

**Must have (table stakes):**
- Parametric generator controls with strict validation guardrails.
- Multi-variant generation results with clear selection action.
- Wall photo upload (drag/drop + click), with file acceptance/rejection UX.
- Interactive overlay transform (drag/resize + visible selection handles).
- Live dimensions during transform, backed by authoritative API calculation.
- Zoom/pan for precise placement.
- Pattern/export workflow parity.

**Should have (competitive):**
- Undo/redo history (recommended MVP differentiator).
- Smart snapping + alignment guides.
- One-click best-fit auto placement.
- Before/after comparison mode.
- Saved sessions and preset recipe library.

**Defer (v2+):**
- Full 3D/photoreal room modeling.
- Multi-user collaboration/accounts.
- CAD/BIM import pipeline.
- AI full-room design generation.

### Architecture Approach

Use a strangler-style migration under a modular monolith: preserve FastAPI services as domain authority while migrating React workflows by slice (generator first, overlay second). Frontend is organized by feature modules with strict split between server-state and UI/editor-state. Backend introduces repository interfaces (`PatternRepository`, `ImageRepository`) to decouple storage policy from route logic and enable phased evolution from in-memory to Redis/object storage.

**Major components:**
1. **React app shell + feature modules** — canonical workflow composition, route-level cutover, UX interactions.
2. **Server-state and UI-state layers** — API lifecycle/resilience vs local editor transforms/selections.
3. **FastAPI API + service layer + repository boundary** — validation, stable contracts, deterministic generation/overlay math, storage abstraction.

### Critical Pitfalls

1. **Geometry logic duplication across frontend/backend** — keep backend services canonical; enforce golden parity tests.
2. **Streamlit mental-model carryover into React** — define state ownership map, ban hook-deps suppression, test mount/unmount lifecycle.
3. **Contract drift between TS models and Pydantic schemas** — OpenAPI-generated types + CI schema diff/contract tests.
4. **“Pretty” overlay interactions without true geometry semantics** — define coordinate/transform contract first; test sensitivity to rotation/position/scale.
5. **Hardening debt (memory, security, false-positive tests)** — enforce upload limits/TTL, add auth and safe error envelopes, test real App-mounted path with E2E smoke.

## Implications for Roadmap

Based on dependencies and migration risk, suggested phase structure:

### Phase 1: Contract & Parity Baseline
**Rationale:** Everything else depends on trusted API semantics and schema alignment.
**Delivers:** Fixed contract mismatches, OpenAPI→TS generation pipeline, golden parity suite for generation + overlay fixtures.
**Addresses:** Table-stakes generator correctness and live-dimension trust.
**Avoids:** Contract drift, hidden logic duplication.

### Phase 2: React App Composition & State Foundations
**Rationale:** Canonical app wiring/state boundaries must exist before complex UX features.
**Delivers:** Real route composition, feature-first module structure, server-state/UI-state split, basic error/loading handling.
**Addresses:** Stable base for generator/upload/overlay experiences.
**Avoids:** Streamlit mental-model bugs, mega-component entropy.

### Phase 3: Pattern Generation Workflow Migration
**Rationale:** Lower interaction complexity than overlay; fastest path to visible parity value.
**Delivers:** Parametric controls, validation, generation mutation lifecycle, multi-variant results, selection + export.
**Addresses:** Core table-stakes generation experience.
**Avoids:** API/retry inconsistency, broken validation UX.

### Phase 4: Overlay Workflow & Precision Interaction
**Rationale:** Most differentiating and highest-risk UX should follow stable contracts/state foundations.
**Delivers:** Upload UX, canvas transform interactions, selection model, zoom/pan, debounced authoritative dimension sync, undo/redo.
**Addresses:** Core placement workflow + MVP differentiator.
**Avoids:** False precision claims, interaction jank, stale effect/listener bugs.

### Phase 5: Hardening, Scale Path, and Streamlit Retirement
**Rationale:** Cut over only after parity and reliability are proven.
**Delivers:** Standardized errors/logging, upload/size limits, TTL eviction, Redis/object-store readiness, smoke E2E path, Streamlit decommission checklist.
**Addresses:** Operational readiness and maintenance simplification.
**Avoids:** Big-bang cutover failure, memory/performance/security regressions.

### Phase Ordering Rationale

- Contract/parity and state boundaries are hard prerequisites for safe migration.
- Generator-before-overlay sequencing reduces early complexity while proving integration patterns.
- Overlay semantics are intentionally delayed until transform contracts are testable end-to-end.
- Hardening and cutover are last to preserve rollback safety during migration.

### Research Flags

Phases likely needing deeper `/gsd-research-phase` during planning:
- **Phase 4 (Overlay Workflow & Precision Interaction):** Geometry semantics, transform invariants, and Konva interaction edge cases are high impact.
- **Phase 5 (Hardening/Scale):** Storage transition (Redis/object refs), queue/offload strategy, and auth model need deployment-specific decisions.

Phases with standard patterns (can likely skip extra research):
- **Phase 1 (Contract & Parity Baseline):** OpenAPI type generation + contract testing are well-established.
- **Phase 2 (Composition/State Foundations):** Feature-first React modules + server-state/UI-state split are mature patterns.
- **Phase 3 (Pattern Workflow Migration):** Conventional form/mutation/results flow with known tooling.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Built from official React/FastAPI/Vite guidance plus current package-version checks. |
| Features | HIGH | Strongly grounded in existing product baseline and well-documented React Konva/Dropzone UX patterns. |
| Architecture | MEDIUM-HIGH | Excellent fit to current repo constraints; scale-path details still require environment-specific validation. |
| Pitfalls | HIGH | Directly tied to observed codebase concerns and common migration failures documented in official docs. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Auth/deployment model:** Security hardening guidance is clear, but concrete authn/authz requirements are not yet specified.
- **Storage scaling trigger points:** Redis/object-store shift is recommended, but thresholds (traffic/memory/SLO triggers) need explicit planning criteria.
- **Overlay precision scope:** Coordinate/rotation semantics are flagged, but product-level “precision guarantees” and tolerances need formal definition.
- **Composed export scope:** Pattern export is clear; combined wall+overlay export behavior should be explicitly accepted/deferred in requirements.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — versioned stack recommendations and rationale.
- `.planning/research/FEATURES.md` — table stakes, differentiators, anti-features, dependency graph.
- `.planning/research/ARCHITECTURE.md` — target architecture, migration-safe build order, component boundaries.
- `.planning/research/PITFALLS.md` — critical/moderate/minor migration pitfalls and phase warnings.
- React official docs + blog (incl. CRA sunset), FastAPI official docs, Vite official docs, Streamlit official docs.

### Secondary (MEDIUM confidence)
- Konva/React Konva implementation patterns (selection, transformer, zoom, snapping, undo/redo).
- Ecosystem best-practice choices for client/editor state and artifact storage evolution.

### Tertiary (LOW confidence)
- None identified as primary decision drivers.

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
