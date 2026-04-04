<!-- GSD:project-start source:PROJECT.md -->
## Project

**Hex Layout Toolkit**

Hex Layout Toolkit is an interactive design application for creating and previewing custom hexagonal tile layouts for acoustic panels and decorative wall installs. It lets users generate layout variants, apply curated color strategies, and visualize placements against real wall photos. This milestone centers on moving the user-facing experience from Streamlit to a React frontend while preserving proven generation and overlay behavior.

**Core Value:** A user can quickly generate a high-quality hex layout and confidently preview how it will look on their real wall before building.

### Constraints

- **Tech stack**: Keep Python/FastAPI backend and existing algorithmic services — preserves validated generation behavior
- **Compatibility**: Maintain API contract stability for frontend integration (`backend/src/models/api_models.py`, `frontend/src/types/api.ts`) — reduces migration risk
- **Quality**: Preserve and expand automated test coverage in `backend/tests/` and `frontend/tests/` — ensures parity through migration
- **Migration strategy**: Incremental replacement of Streamlit UX, not a rewrite of math engine — controls scope and delivery risk
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- Python 3.12+ - Core app logic and backend API in `streamlit_app.py`, `app/*.py`, and `backend/src/**/*.py`.
- TypeScript 5.x - Frontend SPA and API client in `frontend/src/**/*.ts` and `frontend/src/**/*.tsx`.
- JavaScript/Node config syntax - Tooling config in `frontend/vite.config.ts` and `frontend/.eslintrc.cjs`.
- HTML/CSS - Frontend shell and styling in `frontend/index.html`, `frontend/src/App.css`, and `frontend/src/index.css`.
## Runtime
- Python runtime pinned to 3.12 via `.python-version` and `requires-python = ">=3.12"` in `pyproject.toml` and `backend/pyproject.toml`.
- Node.js runtime required for frontend scripts in `frontend/package.json` (exact Node version not pinned; `.nvmrc` not detected).
- Python: `uv`/`pip` workflow documented in `README.md` and `backend/README.md`.
- Node: `npm` scripts in `frontend/package.json`.
- Lockfiles: present in `uv.lock`, `backend/uv.lock`, and `frontend/package-lock.json`.
## Frameworks
- Streamlit - Legacy/standalone UI entry point in `streamlit_app.py` and tab modules in `app/tabs/*.py`.
- FastAPI 0.104+ - REST backend in `backend/src/main.py` and routers in `backend/src/api/*.py`.
- React 18 - Frontend component runtime in `frontend/src/main.tsx` and `frontend/src/App.tsx`.
- Pytest - Backend tests configured by `backend/pytest.ini` and implemented in `backend/tests/**/*.py`.
- Vitest 0.34+ with Testing Library - Frontend tests via scripts in `frontend/package.json`, config in `frontend/vite.config.ts`, and setup in `frontend/tests/setup.ts`.
- Vite 4.5+ - Frontend dev server/build in `frontend/package.json` and `frontend/vite.config.ts`.
- TypeScript compiler (`tsc`) - Type checking/build step in `frontend/package.json` and strict config in `frontend/tsconfig.json`.
- Uvicorn - ASGI server execution in `backend/src/main.py` and `backend/README.md`.
## Key Dependencies
- `fastapi`, `pydantic` - API contract and validation in `backend/src/main.py` and `backend/src/models/api_models.py`.
- `numpy`, `matplotlib`, `Pillow` - Hex math/render/image processing in `backend/src/services/pattern_service.py` and `backend/src/services/image_service.py`.
- `react`, `react-dom` - Frontend runtime in `frontend/package.json`.
- `streamlit` and `streamlit-drawable-canvas` - Interactive legacy UI in `streamlit_app.py` and `app/tabs/overlay.py`.
- `python-multipart` - Multipart upload handling for image endpoint in `backend/src/api/images.py`.
- `@vitejs/plugin-react`, `eslint`, `prettier`, `typescript` - Frontend development quality toolchain in `frontend/package.json`, `frontend/.eslintrc.cjs`, and `frontend/.prettierrc`.
## Configuration
- Frontend API base URL uses `VITE_API_BASE_URL` in `frontend/src/services/api.ts` and is typed in `frontend/src/vite-env.d.ts`.
- If unset, frontend defaults to `http://localhost:8000` in `frontend/src/services/api.ts`.
- No backend environment-variable configuration source is detected in `backend/src/**/*.py` (no `os.environ`/`getenv` usage).
- Frontend build and dev config in `frontend/vite.config.ts` (React plugin, alias `@`, dev proxy to backend).
- TypeScript strictness and path mapping in `frontend/tsconfig.json`.
- Python package/build metadata in `pyproject.toml` and `backend/pyproject.toml`.
## Platform Requirements
- Python 3.12 environment with `uv`/`pip` for backend and Streamlit workflows from `README.md` and `backend/README.md`.
- Node/npm for frontend lifecycle scripts in `frontend/package.json`.
- Local split-runtime development: frontend on `localhost:3000` and backend on `localhost:8000` per `frontend/vite.config.ts` and `backend/src/main.py`.
- No deployment manifest or CI pipeline config detected (`.github/workflows/*`, `Dockerfile`, and `docker-compose*.yml` not detected).
- Current codebase evidence supports local/self-hosted process deployment for FastAPI (`uvicorn`) and static frontend artifact (`vite build`) from `backend/README.md` and `frontend/package.json`.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Use PascalCase for React component modules in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/components/PatternDisplay.tsx`.
- Use camelCase/snake hybrid for API and type modules in `frontend/src/services/api.ts` and `frontend/src/types/api.ts`.
- Use snake_case for Python modules in `backend/src/api/patterns.py`, `backend/src/services/image_service.py`, and `backend/src/models/api_models.py`.
- Use `test_*.test.tsx` naming for frontend tests in `frontend/tests/components/test_PatternGenerator.test.tsx` and `frontend/tests/integration/test_pattern_flow.test.tsx`.
- Use `test_*.py` naming for backend tests in `backend/tests/contract/test_patterns_generate.py` and `backend/tests/integration/test_image_processing.py`.
- Use camelCase for TypeScript functions/handlers such as `handleSubmit`, `handleFieldBlur`, and `calculateOverlay` in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/services/api.ts`.
- Use snake_case for Python functions such as `generate_patterns`, `upload_image`, and `calculate_dimensions` in `backend/src/api/patterns.py`, `backend/src/api/images.py`, and `backend/src/services/overlay_service.py`.
- Use descriptive local names (`formData`, `validationErrors`, `downloadStates`) in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/components/PatternDisplay.tsx`.
- Use typed dict/list names (`request_data`, `response_data`, `test_cases`) in backend tests like `backend/tests/contract/test_images_upload.py` and `backend/tests/integration/test_pattern_generation.py`.
- Use `interface` and union types for frontend contracts in `frontend/src/types/api.ts`.
- Use Pydantic `BaseModel` classes for backend API contracts in `backend/src/models/api_models.py`.
## Code Style
- Frontend formatting uses Prettier from `frontend/.prettierrc` (single quotes, semicolons, trailing commas `es5`, print width 80).
- Backend formatting uses Black configured in `backend/pyproject.toml` (`line-length = 88`, `target-version = py312`).
- Frontend linting uses ESLint from `frontend/.eslintrc.cjs` with `@typescript-eslint` parser and `react-hooks` rules.
- Frontend quality rules include `prefer-const`, `no-var`, warn-on `no-console`, and warn-on `@typescript-eslint/no-explicit-any` in `frontend/.eslintrc.cjs`.
- Backend linting uses Ruff in `backend/pyproject.toml` (`E,F,I,N,W,UP` rule families).
## Import Organization
- `@/*` and scoped aliases (`@/components/*`, `@/services/*`, etc.) are configured in `frontend/tsconfig.json` and Vite alias `@` is configured in `frontend/vite.config.ts`.
- Current implemented source files mostly use relative imports (`../services/api`) in `frontend/src/components/PatternGenerator.tsx`.
## Error Handling
- Frontend API calls return discriminated result objects (`{ success: true, data } | { success: false, error }`) in `frontend/src/services/api.ts`.
- Frontend component submit handlers guard invalid state early and set user-facing error text in `frontend/src/components/PatternGenerator.tsx`.
- Backend endpoints wrap logic in `try/except` and normalize failures to `HTTPException` in `backend/src/api/patterns.py`, `backend/src/api/images.py`, and `backend/src/api/overlay.py`.
- Backend model-level validation is centralized in Pydantic validators in `backend/src/models/api_models.py`.
## Logging
- Avoid console logging in frontend by default (`no-console` warning), with isolated exception for download failures in `frontend/src/services/api.ts`.
- Backend source does not define structured logging in `backend/src/main.py` or `backend/src/api/*.py`; rely on FastAPI/Uvicorn defaults.
## Comments
- Use module docstrings and section comments for intent in backend files such as `backend/src/services/pattern_service.py`.
- Use header block comments for component/test purpose in frontend files such as `frontend/src/components/PatternDisplay.tsx` and `frontend/tests/components/test_PatternDisplay.test.tsx`.
- Formal TSDoc is limited; lightweight block comments are used in `frontend/src/services/api.ts` and `frontend/src/types/api.ts`.
- Python docstrings are used consistently for modules, classes, and many functions in `backend/src/models/api_models.py` and `backend/src/services/image_service.py`.
## Function Design
- Frontend components can be large, stateful modules (for example `frontend/src/components/PatternGenerator.tsx` >500 lines). Keep helper callbacks memoized (`useCallback`, `useMemo`) to reduce rerender churn.
- Backend service functions are split by concern (`generate_layout`, `assign_colors_*`, `calculate_dimensions`) in `backend/src/services/pattern_service.py` and `backend/src/services/overlay_service.py`.
- Prefer strongly typed request objects in frontend (`GenerateRequest`, `OverlayRequest`) from `frontend/src/types/api.ts`.
- Prefer explicit keyword-style payload dictionaries in backend tests (`request_data`) from `backend/tests/contract/test_overlay_calculate.py`.
- Frontend API helpers return typed result wrappers and nullable blobs for downloads in `frontend/src/services/api.ts`.
- Backend endpoints return Pydantic response models (`GenerateResponse`, `UploadResponse`, `OverlayResponse`) declared in `backend/src/models/api_models.py`.
## Module Design
- Frontend uses named exports for components (`export const PatternDisplay`) and default export for `App` in `frontend/src/components/PatternDisplay.tsx` and `frontend/src/App.tsx`.
- Backend exposes routers and singleton service instances (`router`, `image_service`, `overlay_service`) in `backend/src/api/*.py` and `backend/src/services/*.py`.
- Minimal barrel usage: package markers exist in `backend/src/api/__init__.py`, `backend/src/models/__init__.py`, and `backend/src/services/__init__.py`.
- No frontend barrel index files detected under `frontend/src/components/`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- API-first backend organization: HTTP routes in `backend/src/api/*.py` delegate to service modules in `backend/src/services/*.py`.
- Shared domain model around hex pattern generation in `backend/src/services/pattern_service.py` and mirrored legacy logic in `app/hex_tile_layouts_core.py`.
- Frontend separation between transport (`frontend/src/services/api.ts`), typed contracts (`frontend/src/types/api.ts`), and UI components (`frontend/src/components/*.tsx`).
## Layers
- Purpose: Expose HTTP endpoints and map transport errors/status codes.
- Location: `backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`.
- Contains: `APIRouter` handlers, response metadata, and request-to-service mapping.
- Depends on: `backend/src/models/api_models.py`, `backend/src/services/*.py`.
- Used by: `backend/src/main.py` via `app.include_router(...)`.
- Purpose: Execute image processing, overlay math, and hex layout generation.
- Location: `backend/src/services/pattern_service.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`.
- Contains: core algorithms, transformation helpers, in-memory runtime stores (`_stored_patterns` in `backend/src/api/patterns.py`, `self._images` in `image_service.py`, `self._patterns` in `overlay_service.py`).
- Depends on: `numpy`, `matplotlib`, `Pillow`, and request models where needed.
- Used by: API route functions in `backend/src/api/*.py`.
- Purpose: Define request/response contracts and validation rules.
- Location: `backend/src/models/api_models.py`.
- Contains: Pydantic models (`GenerateRequest`, `Pattern`, `UploadResponse`, `OverlayRequest`, `OverlayResponse`).
- Depends on: `pydantic` and Python typing.
- Used by: API handlers and service function signatures.
- Purpose: Render form and result UIs for generation/display flows.
- Location: `frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`, `frontend/src/App.tsx`.
- Contains: React functional components, local component state, validation and rendering logic.
- Depends on: `frontend/src/services/api.ts`, `frontend/src/types/api.ts`.
- Used by: `frontend/src/main.tsx` entrypoint.
- Purpose: Centralize backend communication and response normalization.
- Location: `frontend/src/services/api.ts`.
- Contains: `APIClient` class and exported singleton methods for `/api/*` routes.
- Depends on: fetch API + TypeScript contracts in `frontend/src/types/api.ts`.
- Used by: frontend components (`PatternGenerator`, `PatternDisplay`) and tests under `frontend/tests/`.
- Purpose: Maintain the prior server-rendered UI and direct-session workflow.
- Location: `streamlit_app.py`, `app/tabs/generator.py`, `app/tabs/overlay.py`, `app/tabs/about.py`.
- Contains: Streamlit navigation, sidebar controls, and `st.session_state`-driven state.
- Depends on: `app/hex_tile_layouts_core.py`.
- Used by: Streamlit runtime when executing `streamlit run streamlit_app.py`.
## Data Flow
- Backend runtime state is process-local and in-memory (`backend/src/api/patterns.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`).
- React frontend currently uses component-local state in `frontend/src/components/*.tsx`; `frontend/src/context/` exists but is empty.
- Streamlit flow uses `st.session_state` in `streamlit_app.py` and `app/tabs/*.py`.
## Key Abstractions
- Purpose: Represent hex grid coordinates and transformations.
- Examples: `Hex` dataclass and helpers in `backend/src/services/pattern_service.py`, mirrored in `app/hex_tile_layouts_core.py` and `app/hexgrid.py`.
- Pattern: Pure function geometry/math helpers with immutable coordinate objects.
- Purpose: Bundle all generation controls into one algorithm input.
- Examples: `LayoutParams` in `backend/src/services/pattern_service.py` and `app/hex_tile_layouts_core.py`.
- Pattern: Dataclass-based parameter object passed through generation and rendering helpers.
- Purpose: Enforce request/response schema boundaries.
- Examples: `GenerateRequest`, `OverlayState`, `OverlayResponse` in `backend/src/models/api_models.py`; mirrored TypeScript interfaces in `frontend/src/types/api.ts`.
- Pattern: Pydantic + TS interface mirror for backend/frontend contract alignment.
## Entry Points
- Location: `backend/src/main.py`
- Triggers: `uvicorn src.main:app --reload --port 8000` (from `backend/README.md`).
- Responsibilities: Initialize FastAPI app, configure CORS, register routers, provide root and health endpoints.
- Location: `frontend/src/main.tsx`
- Triggers: `npm run dev` (Vite) from `frontend/package.json`.
- Responsibilities: Mount `<App />` and bootstrap client runtime.
- Location: `streamlit_app.py`
- Triggers: `streamlit run streamlit_app.py` (root `README.md`).
- Responsibilities: Streamlit page setup, tab routing, and session initialization.
## Error Handling
- Route functions catch exceptions and raise `HTTPException` with endpoint-specific detail text (`backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`).
- Validation constraints are encoded at schema level (`Field(..., ge=..., le=..., pattern=...)` and `@field_validator` in `backend/src/models/api_models.py`).
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
