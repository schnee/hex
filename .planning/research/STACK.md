# Technology Stack

**Project:** Hex Layout Toolkit frontend migration (Streamlit → React + FastAPI)
**Researched:** 2026-03-31

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 19.2.x | Primary frontend UI runtime | Current mainstream React baseline for production SPAs; aligns with modern Suspense/concurrent patterns and ecosystem tooling. |
| Vite + `@vitejs/plugin-react` | 8.0.x | Frontend dev server + production bundling | Fast dev feedback and optimized build pipeline; React ecosystem has standardized on Vite post-CRA sunsetting. |
| React Router | 7.13.x | URL-based app routing | Official React docs now point to router-based architecture for production navigation/data loading patterns. |
| TanStack Query | 5.96.x | Server-state caching + request lifecycle | Removes ad-hoc fetch/state bugs (dedupe, retries, stale cache handling) and is the de facto React API-integration pattern for non-fullstack frameworks. |
| FastAPI | 0.135.x | Backend HTTP contract boundary | Keeps existing validated algorithm services intact while exposing typed OpenAPI contracts for React integration. |
| Pydantic | 2.12.x | Request/response validation and schema generation | Strong runtime validation + schema generation; best fit with FastAPI contract-first API layer. |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Redis (`redis` Python client) | 7.4.x | Replace in-memory runtime state for generated patterns/images/overlay sessions | Current backend stores are process-local in memory; Redis is the standard low-latency store to make FastAPI horizontally scalable without rewriting core math services. |
| PostgreSQL | 16+ (recommended target) | Durable persistence for saved projects/assets/history (when enabled) | Not required for parity migration, but standard production default once persistence is needed; avoid locking product into ephemeral-only sessions. |

### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Uvicorn (`uvicorn[standard]`) | 0.42.x | ASGI app server for FastAPI | FastAPI’s primary recommended server path; supports worker scaling model for production. |
| `pydantic-settings` | 2.13.x | Typed environment configuration | Replaces implicit/no-env config with explicit, validated deployment configuration. |
| `prometheus-fastapi-instrumentator` | 7.1.x | API metrics for latency/error visibility | Needed for production SLOs and regression detection during migration. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-konva` | 19.2.x | High-performance 2D canvas interactions (drag/resize/transform overlays) | Use for the overlay editor surface; this is more robust than composing low-level draggable/resizable primitives. |
| `zustand` | 5.0.x | Lightweight client state store | Use for cross-component UI state (selected pattern, active tool, overlay transform state); keep server data in TanStack Query. |
| `zod` + `react-hook-form` | 4.3.x + 7.72.x | Type-safe form validation and performant form state | Use for generator/overlay controls to unify UX validation with API constraints. |
| `openapi-typescript` | 7.13.x | Generate TypeScript types from FastAPI OpenAPI schema | Use to eliminate backend/frontend contract drift and reduce manual type maintenance. |
| `vitest` + `@testing-library/react` | 4.1.x + 13/14+ | Unit/component testing | Keep fast test loop for form logic, API state components, and rendering behavior. |
| `@playwright/test` | 1.58.x | End-to-end testing for interactive overlay workflow | Use for drag/resize/regression checks that unit tests cannot fully validate. |

## Prescriptive Architecture Notes (Stack Dimension)

1. **Keep FastAPI as the only backend entrypoint** and call existing algorithm services from route/service layers (no rewrite of hex math engine).
2. **Adopt React Router + TanStack Query together**: Router owns navigation boundaries; Query owns API cache/retry/state.
3. **Move overlay interactions to canvas-native components (`react-konva`)** for smoother UX and predictable transform math.
4. **Eliminate process-local state** by introducing Redis-backed ephemeral objects for pattern/image session data.
5. **Generate frontend API types from FastAPI OpenAPI** to enforce contract parity continuously.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Frontend scaffold | Vite 8 | Create React App | CRA has been sunset; not a future-facing production baseline. |
| API state | TanStack Query | Hand-rolled `fetch` + component state | Produces cache/retry/loading inconsistency and harder-to-test edge cases at scale. |
| Overlay interaction layer | `react-konva` | `react-draggable` + `react-resizable` composition | Works for basic transforms but becomes brittle for multi-object canvas behaviors and complex hit-testing. |
| Backend runtime state | Redis | In-memory Python dict/session objects | Breaks across multiple workers/instances and risks data loss on process restart. |
| Contract typing | OpenAPI-generated TS types | Manually mirrored TS interfaces | High drift risk during iterative API changes. |

## Installation

```bash
# Frontend core
npm install react@^19.2 react-dom@^19.2 vite@^8 @vitejs/plugin-react@^5 react-router@^7 @tanstack/react-query@^5

# Frontend interactive/design + quality
npm install react-konva@^19 zustand@^5 zod@^4 react-hook-form@^7
npm install -D openapi-typescript@^7 vitest@^4 @testing-library/react @playwright/test

# Backend core/infrastructure
python3 -m pip install "fastapi>=0.135,<0.136" "pydantic>=2.12,<2.13" "uvicorn[standard]>=0.42,<0.43"
python3 -m pip install "redis>=7.4,<7.5" "pydantic-settings>=2.13,<2.14" "prometheus-fastapi-instrumentator>=7.1,<7.2"
```

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| React + FastAPI core stack | HIGH | Backed by official React/FastAPI docs + current package registries. |
| Vite as build baseline | HIGH | Official Vite docs + post-CRA ecosystem direction. |
| Supporting libraries (`react-konva`, Zustand, TanStack Query) | MEDIUM | TanStack Query pattern is directly referenced by React docs; canvas/state library choice is ecosystem-standard but less directly specified by official React docs. |
| Redis/PostgreSQL production persistence recommendation | MEDIUM | Strong production pattern fit for this architecture; PostgreSQL version target is a pragmatic baseline and should be confirmed against deployment platform constraints. |

## Sources

- React docs (official): https://react.dev/learn/build-a-react-app-from-scratch
- React data-fetching guidance (official): https://react.dev/learn/synchronizing-with-effects
- React blog (CRA sunset, routing direction): https://react.dev/blog/2025/02/14/sunsetting-create-react-app
- FastAPI docs (official): https://fastapi.tiangolo.com/deployment/server-workers/
- FastAPI CLI production run: https://fastapi.tiangolo.com/fastapi-cli/
- Vite docs (official): https://vite.dev/guide/static-deploy.html
- Vite env/mode docs: https://vite.dev/guide/env-and-mode.html
- NPM registry version checks (2026-03-31): React, Vite, React Router, TanStack Query, Zustand, react-konva, zod, react-hook-form, openapi-typescript, vitest, Playwright
- PyPI version checks via `python3 -m pip index versions` (2026-03-31): FastAPI, Pydantic, Uvicorn, Redis client, pydantic-settings, prometheus-fastapi-instrumentator
