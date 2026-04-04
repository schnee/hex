# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- Python 3.12+ - Core app logic and backend API in `streamlit_app.py`, `app/*.py`, and `backend/src/**/*.py`.
- TypeScript 5.x - Frontend SPA and API client in `frontend/src/**/*.ts` and `frontend/src/**/*.tsx`.

**Secondary:**
- JavaScript/Node config syntax - Tooling config in `frontend/vite.config.ts` and `frontend/.eslintrc.cjs`.
- HTML/CSS - Frontend shell and styling in `frontend/index.html`, `frontend/src/App.css`, and `frontend/src/index.css`.

## Runtime

**Environment:**
- Python runtime pinned to 3.12 via `.python-version` and `requires-python = ">=3.12"` in `pyproject.toml` and `backend/pyproject.toml`.
- Node.js runtime required for frontend scripts in `frontend/package.json` (exact Node version not pinned; `.nvmrc` not detected).

**Package Manager:**
- Python: `uv`/`pip` workflow documented in `README.md` and `backend/README.md`.
- Node: `npm` scripts in `frontend/package.json`.
- Lockfiles: present in `uv.lock`, `backend/uv.lock`, and `frontend/package-lock.json`.

## Frameworks

**Core:**
- Streamlit - Legacy/standalone UI entry point in `streamlit_app.py` and tab modules in `app/tabs/*.py`.
- FastAPI 0.104+ - REST backend in `backend/src/main.py` and routers in `backend/src/api/*.py`.
- React 18 - Frontend component runtime in `frontend/src/main.tsx` and `frontend/src/App.tsx`.

**Testing:**
- Pytest - Backend tests configured by `backend/pytest.ini` and implemented in `backend/tests/**/*.py`.
- Vitest 0.34+ with Testing Library - Frontend tests via scripts in `frontend/package.json`, config in `frontend/vite.config.ts`, and setup in `frontend/tests/setup.ts`.

**Build/Dev:**
- Vite 4.5+ - Frontend dev server/build in `frontend/package.json` and `frontend/vite.config.ts`.
- TypeScript compiler (`tsc`) - Type checking/build step in `frontend/package.json` and strict config in `frontend/tsconfig.json`.
- Uvicorn - ASGI server execution in `backend/src/main.py` and `backend/README.md`.

## Key Dependencies

**Critical:**
- `fastapi`, `pydantic` - API contract and validation in `backend/src/main.py` and `backend/src/models/api_models.py`.
- `numpy`, `matplotlib`, `Pillow` - Hex math/render/image processing in `backend/src/services/pattern_service.py` and `backend/src/services/image_service.py`.
- `react`, `react-dom` - Frontend runtime in `frontend/package.json`.
- `streamlit` and `streamlit-drawable-canvas` - Interactive legacy UI in `streamlit_app.py` and `app/tabs/overlay.py`.

**Infrastructure:**
- `python-multipart` - Multipart upload handling for image endpoint in `backend/src/api/images.py`.
- `@vitejs/plugin-react`, `eslint`, `prettier`, `typescript` - Frontend development quality toolchain in `frontend/package.json`, `frontend/.eslintrc.cjs`, and `frontend/.prettierrc`.

## Configuration

**Environment:**
- Frontend API base URL uses `VITE_API_BASE_URL` in `frontend/src/services/api.ts` and is typed in `frontend/src/vite-env.d.ts`.
- If unset, frontend defaults to `http://localhost:8000` in `frontend/src/services/api.ts`.
- No backend environment-variable configuration source is detected in `backend/src/**/*.py` (no `os.environ`/`getenv` usage).

**Build:**
- Frontend build and dev config in `frontend/vite.config.ts` (React plugin, alias `@`, dev proxy to backend).
- TypeScript strictness and path mapping in `frontend/tsconfig.json`.
- Python package/build metadata in `pyproject.toml` and `backend/pyproject.toml`.

## Platform Requirements

**Development:**
- Python 3.12 environment with `uv`/`pip` for backend and Streamlit workflows from `README.md` and `backend/README.md`.
- Node/npm for frontend lifecycle scripts in `frontend/package.json`.
- Local split-runtime development: frontend on `localhost:3000` and backend on `localhost:8000` per `frontend/vite.config.ts` and `backend/src/main.py`.

**Production:**
- No deployment manifest or CI pipeline config detected (`.github/workflows/*`, `Dockerfile`, and `docker-compose*.yml` not detected).
- Current codebase evidence supports local/self-hosted process deployment for FastAPI (`uvicorn`) and static frontend artifact (`vite build`) from `backend/README.md` and `frontend/package.json`.

---

*Stack analysis: 2026-03-31*
