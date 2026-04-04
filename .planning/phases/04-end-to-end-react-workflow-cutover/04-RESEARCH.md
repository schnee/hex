# Phase 4 Research: End-to-End React Workflow Cutover

**Phase:** 4 (End-to-End React Workflow Cutover)  
**Date:** 2026-04-01  
**Scope:** MIGR-01, MIGR-02, MIGR-03

## Research Inputs

- `.planning/ROADMAP.md` (Phase 4 goal + success criteria)
- `.planning/REQUIREMENTS.md` (MIGR-01/02/03 definitions)
- `.planning/STATE.md` (prior implementation decisions and constraints)
- `.planning/phases/01-react-pattern-generation/*-SUMMARY.md` (generation flow patterns)
- `.planning/phases/02-overlay-interaction-foundation/*-SUMMARY.md` (overlay workflow composition)
- `.planning/phases/03-precision-placement-controls/*-SUMMARY.md` (overlay calculation + viewport behavior)
- `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/context/PatternContext.tsx` (current UI shell and shared state)
- `frontend/src/services/api.ts`, `frontend/src/types/api.ts` (contract wrappers and typed models)
- Context7 docs for React Router v6 (`/remix-run/react-router/v6.3.0`) for BrowserRouter/Routes/useNavigate patterns

## Standard Stack (Use, don’t replace)

- Keep React 18 + Vite app structure; add `react-router-dom` for route-based workspace navigation.
- Keep `PatternContextProvider` as source of truth for generated patterns and selected pattern.
- Keep `apiClient` wrapper semantics (`{ success, data | error }`) and typed payload contracts from `frontend/src/types/api.ts`.
- Keep FastAPI backend contract unchanged (`backend/src/models/api_models.py` remains canonical).

## Architecture Patterns for This Phase

1. **Route-based workspace shell**
   - Replace tab-driven workspace switching with URL routes (`/generator`, `/overlay`).
   - Keep one top-level app shell and navigation controls that are route-aware.

2. **Shared selection context across routes**
   - Preserve selected pattern state while user navigates between generator and overlay routes.
   - Keep overlay prerequisites deterministic: selected pattern + uploaded image required for manipulation.

3. **Contract parity verified at workflow level**
   - Assert generation, upload, and overlay calculation interactions through API wrapper calls in integration tests.
   - Validate user-visible success/error handling remains aligned to API `detail` contract.

## Don’t Hand-Roll

- Do not build custom routing state machinery when React Router already solves route transitions.
- Do not duplicate API contracts in ad-hoc local types; continue using `frontend/src/types/api.ts`.
- Do not regress overlay behavior built in Phases 2-3 while introducing routing.

## Common Pitfalls to Avoid

- Routing migration that accidentally remounts/clears context and loses selected pattern state.
- Keeping hidden tab logic in parallel with routes (split sources of truth).
- Introducing route changes without integration tests proving generation→overlay continuity.
- Replacing API wrapper behavior with direct fetch in components (breaks contract consistency).

## Recommended Plan Shape

- **Plan A (MIGR-02):** Add route contracts and routed workspace shell preserving shared pattern selection state.
- **Plan B (MIGR-01, MIGR-03):** Validate full React-only journey with route-first integration coverage and contract-parity assertions.

## Validation Architecture

Use fast frontend-focused checks with route-oriented integration commands:

- `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx`
- `cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx`

Target feedback latency: under 60 seconds per command.
