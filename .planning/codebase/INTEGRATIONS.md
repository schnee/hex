# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Internal HTTP API (frontend ↔ backend):**
- FastAPI service - Primary integration target for the React client.
  - SDK/Client: Browser `fetch` wrapper in `frontend/src/services/api.ts`.
  - Auth: Not detected (no token/header auth in `frontend/src/services/api.ts` or `backend/src/main.py`).
  - Endpoints consumed by frontend: `/api/patterns/generate`, `/api/patterns/{id}/download`, `/api/images/upload`, `/api/overlay/calculate`, `/api/health` in `frontend/src/services/api.ts`.

**Third-party SaaS APIs:**
- Not detected in application source (`backend/src/**/*.py`, `frontend/src/**/*.{ts,tsx}`, `app/**/*.py`).

## Data Storage

**Databases:**
- Not detected.
  - Connection: Not applicable (no DB connection strings or ORM setup in `backend/src/**/*.py`).
  - Client: Not applicable.

**File Storage:**
- Local in-memory payload storage only.
  - Uploaded images stored in process memory dict `ImageService._images` in `backend/src/services/image_service.py`.
  - Generated patterns stored in process memory dict `_stored_patterns` in `backend/src/api/patterns.py` and `OverlayService._patterns` in `backend/src/services/overlay_service.py`.
  - Streamlit mode also stores active assets in `st.session_state` in `streamlit_app.py` and `app/tabs/overlay.py`.

**Caching:**
- None detected (no Redis/Memcached/local cache library imports in `backend/src/**/*.py` or `frontend/src/**/*.ts*`).

## Authentication & Identity

**Auth Provider:**
- Custom/None - No authentication layer is implemented.
  - Implementation: Public API endpoints mounted directly in `backend/src/main.py` via `app.include_router(...)` without auth middleware/dependencies.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/Rollbar integration in `backend/src/**/*.py` or `frontend/src/**/*.ts*`).

**Logs:**
- Minimal runtime logging.
  - Backend relies on default Uvicorn/FastAPI runtime output via `uvicorn.run(...)` in `backend/src/main.py`.
  - Frontend uses occasional console logging for client failures (e.g., `console.error` in `frontend/src/services/api.ts`).

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in repository (no platform manifests detected: `.github/workflows/*`, `Dockerfile`, `docker-compose*.yml`, `vercel.json`, `netlify.toml`).

**CI Pipeline:**
- None detected in repo configuration.

## Environment Configuration

**Required env vars:**
- `VITE_API_BASE_URL` (optional override) used in `frontend/src/services/api.ts`, typed in `frontend/src/vite-env.d.ts`, and documented in `frontend/README.md`.
- No required backend env vars detected in `backend/src/**/*.py`.

**Secrets location:**
- `.env*` files were not detected in the repository root or subdirectories at analysis time.
- Expected local developer config location is `.env.local` for frontend per `frontend/README.md` (values not committed).

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receiver endpoints outside standard REST routes in `backend/src/api/*.py`).

**Outgoing:**
- None detected (backend does not call external HTTP services; frontend only calls local API base URL in `frontend/src/services/api.ts`).

---

*Integration audit: 2026-03-31*
