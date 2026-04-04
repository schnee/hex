# Codebase Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```text
hex/
├── app/                      # Legacy Streamlit domain + tab modules
├── backend/                  # FastAPI service (v2 API)
│   ├── src/                  # API, model, and service code
│   └── tests/                # Contract and integration backend tests
├── frontend/                 # React + TypeScript client
│   ├── src/                  # App, components, API client, shared types
│   └── tests/                # Component/integration frontend tests
├── specs/                    # Feature specs and contracts (`001-streamlit-to-react`)
├── scripts/                  # Repo utility shell scripts
├── streamlit_app.py          # Legacy Streamlit entrypoint
├── pyproject.toml            # Root Python project metadata (legacy app)
└── requirements.txt          # Root Streamlit dependency list
```

## Directory Purposes

**`app/`:**
- Purpose: Legacy Streamlit implementation and direct algorithm access.
- Contains: `app/tabs/*.py` view modules, algorithm files (`app/hex_tile_layouts_core.py`, `app/hexgrid.py`, `app/generators.py`).
- Key files: `app/tabs/generator.py`, `app/tabs/overlay.py`, `app/hex_tile_layouts_core.py`.

**`backend/src/`:**
- Purpose: FastAPI application source.
- Contains: transport routes in `backend/src/api/`, schemas in `backend/src/models/`, domain/service logic in `backend/src/services/`.
- Key files: `backend/src/main.py`, `backend/src/api/patterns.py`, `backend/src/models/api_models.py`, `backend/src/services/pattern_service.py`.

**`backend/tests/`:**
- Purpose: API-facing validation and workflow tests.
- Contains: `contract/` and `integration/` tests; `performance/` and `unit/` directories currently empty.
- Key files: `backend/tests/contract/test_patterns_generate.py`, `backend/tests/integration/test_pattern_generation.py`.

**`frontend/src/`:**
- Purpose: React client application source.
- Contains: top-level app shell (`App.tsx`, `main.tsx`), components (`components/`), API adapter (`services/api.ts`), shared contracts (`types/api.ts`).
- Key files: `frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`, `frontend/src/services/api.ts`.

**`frontend/tests/`:**
- Purpose: Frontend component and integration test suites.
- Contains: `components/`, `integration/`, and setup file `frontend/tests/setup.ts`; `performance/` and `unit/` are present but empty.
- Key files: `frontend/tests/components/test_PatternGenerator.test.tsx`, `frontend/tests/integration/test_pattern_flow.test.tsx`.

**`specs/001-streamlit-to-react/`:**
- Purpose: Migration planning artifacts, contracts, and task docs.
- Contains: `spec.md`, `plan.md`, `tasks.md`, `contracts/*.yaml`, and supporting docs.
- Key files: `specs/001-streamlit-to-react/spec.md`, `specs/001-streamlit-to-react/contracts/patterns.yaml`.

## Key File Locations

**Entry Points:**
- `streamlit_app.py`: Legacy Streamlit UI runtime entrypoint.
- `backend/src/main.py`: FastAPI ASGI app bootstrap and router registration.
- `frontend/src/main.tsx`: React DOM bootstrap.

**Configuration:**
- `pyproject.toml`: Root Python metadata for legacy Streamlit stack.
- `backend/pyproject.toml`: Backend dependency + lint config (`black`, `ruff`).
- `backend/pytest.ini`: Backend pytest discovery/options.
- `frontend/package.json`: Frontend scripts and dependency graph.
- `frontend/vite.config.ts`: Vite dev server, proxy, test config.
- `frontend/tsconfig.json`: TypeScript strictness and path aliases.

**Core Logic:**
- `backend/src/services/pattern_service.py`: Hex generation, color strategies, PNG rendering.
- `backend/src/services/image_service.py`: Upload validation, resize, base64 encoding, image memory store.
- `backend/src/services/overlay_service.py`: Overlay physical/visual dimension calculations.
- `app/hex_tile_layouts_core.py`: Streamlit-era algorithm module mirrored from backend service logic.

**Testing:**
- `backend/tests/contract/*.py`: Endpoint contract behavior tests.
- `backend/tests/integration/*.py`: End-to-end backend workflows and math validations.
- `frontend/tests/components/*.test.tsx`: Component behavior tests.
- `frontend/tests/integration/*.test.tsx`: Multi-step frontend flow tests.

## Naming Conventions

**Files:**
- Python backend modules use `snake_case.py` (examples: `backend/src/api/patterns.py`, `backend/src/services/image_service.py`).
- React component files use `PascalCase.tsx` (examples: `frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`).
- Test files use `test_*.py` in backend and `*.test.tsx` in frontend (examples: `backend/tests/contract/test_images_upload.py`, `frontend/tests/components/test_PatternDisplay.test.tsx`).

**Directories:**
- Layer-oriented lowercase names (`api`, `models`, `services`) under `backend/src/`.
- Concern-oriented lowercase names (`components`, `services`, `types`) under `frontend/src/`.

## Where to Add New Code

**New Backend Feature:**
- Primary code: add route in `backend/src/api/`, schema in `backend/src/models/api_models.py` (or split model module), and business logic in `backend/src/services/`.
- Tests: add contract checks in `backend/tests/contract/` and workflow checks in `backend/tests/integration/`.

**New Frontend Feature:**
- Primary code: add UI component under `frontend/src/components/` and integrate API calls through `frontend/src/services/api.ts`.
- Type contracts: extend `frontend/src/types/api.ts` to mirror backend payload changes.
- Tests: add component specs in `frontend/tests/components/` and journey tests in `frontend/tests/integration/`.

**New Component/Module:**
- Implementation: place reusable display or form modules in `frontend/src/components/`.
- Wiring: compose through `frontend/src/App.tsx` and app bootstrap in `frontend/src/main.tsx`.

**Utilities:**
- Backend shared helpers: `backend/src/utils/` (directory exists and is currently empty).
- Frontend shared helpers: `frontend/src/utils/` (directory exists and is currently empty).

## Special Directories

**`frontend/dist/`:**
- Purpose: Vite production build output.
- Generated: Yes.
- Committed: Yes (directory exists in repository).

**`frontend/node_modules/`:**
- Purpose: Installed frontend dependencies.
- Generated: Yes.
- Committed: Yes (directory exists in repository snapshot).

**`backend/.venv/` and root `.venv/`:**
- Purpose: Python virtual environments.
- Generated: Yes.
- Committed: Not intended for source history; present in working tree.

**`backend/src/middleware/`, `backend/src/utils/`, `frontend/src/context/`, `frontend/src/hooks/`, `frontend/src/pages/`:**
- Purpose: Reserved extension points for layered growth.
- Generated: No.
- Committed: Yes; currently empty.

---

*Structure analysis: 2026-03-31*
