# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Multi-surface architecture with an active API + React split (`backend/` + `frontend/`) and a legacy Streamlit UI path (`streamlit_app.py` + `app/`).

**Key Characteristics:**
- API-first backend organization: HTTP routes in `backend/src/api/*.py` delegate to service modules in `backend/src/services/*.py`.
- Shared domain model around hex pattern generation in `backend/src/services/pattern_service.py` and mirrored legacy logic in `app/hex_tile_layouts_core.py`.
- Frontend separation between transport (`frontend/src/services/api.ts`), typed contracts (`frontend/src/types/api.ts`), and UI components (`frontend/src/components/*.tsx`).

## Layers

**Backend API Layer:**
- Purpose: Expose HTTP endpoints and map transport errors/status codes.
- Location: `backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`.
- Contains: `APIRouter` handlers, response metadata, and request-to-service mapping.
- Depends on: `backend/src/models/api_models.py`, `backend/src/services/*.py`.
- Used by: `backend/src/main.py` via `app.include_router(...)`.

**Backend Service Layer:**
- Purpose: Execute image processing, overlay math, and hex layout generation.
- Location: `backend/src/services/pattern_service.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`.
- Contains: core algorithms, transformation helpers, in-memory runtime stores (`_stored_patterns` in `backend/src/api/patterns.py`, `self._images` in `image_service.py`, `self._patterns` in `overlay_service.py`).
- Depends on: `numpy`, `matplotlib`, `Pillow`, and request models where needed.
- Used by: API route functions in `backend/src/api/*.py`.

**Backend Model/Schema Layer:**
- Purpose: Define request/response contracts and validation rules.
- Location: `backend/src/models/api_models.py`.
- Contains: Pydantic models (`GenerateRequest`, `Pattern`, `UploadResponse`, `OverlayRequest`, `OverlayResponse`).
- Depends on: `pydantic` and Python typing.
- Used by: API handlers and service function signatures.

**Frontend UI Layer:**
- Purpose: Render form and result UIs for generation/display flows.
- Location: `frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`, `frontend/src/App.tsx`.
- Contains: React functional components, local component state, validation and rendering logic.
- Depends on: `frontend/src/services/api.ts`, `frontend/src/types/api.ts`.
- Used by: `frontend/src/main.tsx` entrypoint.

**Frontend Transport Layer:**
- Purpose: Centralize backend communication and response normalization.
- Location: `frontend/src/services/api.ts`.
- Contains: `APIClient` class and exported singleton methods for `/api/*` routes.
- Depends on: fetch API + TypeScript contracts in `frontend/src/types/api.ts`.
- Used by: frontend components (`PatternGenerator`, `PatternDisplay`) and tests under `frontend/tests/`.

**Legacy Streamlit Layer:**
- Purpose: Maintain the prior server-rendered UI and direct-session workflow.
- Location: `streamlit_app.py`, `app/tabs/generator.py`, `app/tabs/overlay.py`, `app/tabs/about.py`.
- Contains: Streamlit navigation, sidebar controls, and `st.session_state`-driven state.
- Depends on: `app/hex_tile_layouts_core.py`.
- Used by: Streamlit runtime when executing `streamlit run streamlit_app.py`.

## Data Flow

**React Pattern Generation Flow:**

1. User edits and submits the form in `frontend/src/components/PatternGenerator.tsx`.
2. Component builds `GenerateRequest` (from `frontend/src/types/api.ts`) and calls `apiClient.generatePatterns(...)` in `frontend/src/services/api.ts`.
3. `POST /api/patterns/generate` handler in `backend/src/api/patterns.py` builds `LayoutParams` and calls `generate_layout(...)` + `transparent_png_bytes(...)` from `backend/src/services/pattern_service.py`.
4. Handler stores generated pattern metadata in memory (`_stored_patterns` and `overlay_service.store_pattern(...)`) and returns `GenerateResponse`.
5. Frontend receives pattern payload and renders cards via `frontend/src/components/PatternDisplay.tsx`.

**Overlay Dimension Flow (Backend API):**

1. Image upload request enters `POST /api/images/upload` in `backend/src/api/images.py`.
2. `image_service.process_upload(...)` in `backend/src/services/image_service.py` validates MIME type, resizes with Pillow, and stores metadata in memory.
3. Overlay request enters `POST /api/overlay/calculate` in `backend/src/api/overlay.py` with `OverlayRequest`.
4. API resolves image from `image_service.get_image(...)` and pattern from `overlay_service` storage.
5. `overlay_service.calculate_dimensions(...)` in `backend/src/services/overlay_service.py` returns physical and visual dimensions.

**Legacy Streamlit Flow:**

1. `streamlit_app.py` initializes `st.session_state` keys and routes to tabs.
2. `app/tabs/generator.py` computes layouts directly using `app.hex_tile_layouts_core` and stores PNG + dimensions in `st.session_state.pattern_objects`.
3. `app/tabs/overlay.py` uploads wall image, mutates `st.session_state.overlay_state`, and recalculates display with `streamlit_drawable_canvas`.

**State Management:**
- Backend runtime state is process-local and in-memory (`backend/src/api/patterns.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`).
- React frontend currently uses component-local state in `frontend/src/components/*.tsx`; `frontend/src/context/` exists but is empty.
- Streamlit flow uses `st.session_state` in `streamlit_app.py` and `app/tabs/*.py`.

## Key Abstractions

**Hex Geometry Model:**
- Purpose: Represent hex grid coordinates and transformations.
- Examples: `Hex` dataclass and helpers in `backend/src/services/pattern_service.py`, mirrored in `app/hex_tile_layouts_core.py` and `app/hexgrid.py`.
- Pattern: Pure function geometry/math helpers with immutable coordinate objects.

**LayoutParams Configuration Object:**
- Purpose: Bundle all generation controls into one algorithm input.
- Examples: `LayoutParams` in `backend/src/services/pattern_service.py` and `app/hex_tile_layouts_core.py`.
- Pattern: Dataclass-based parameter object passed through generation and rendering helpers.

**API Contract Model:**
- Purpose: Enforce request/response schema boundaries.
- Examples: `GenerateRequest`, `OverlayState`, `OverlayResponse` in `backend/src/models/api_models.py`; mirrored TypeScript interfaces in `frontend/src/types/api.ts`.
- Pattern: Pydantic + TS interface mirror for backend/frontend contract alignment.

## Entry Points

**Backend API Application:**
- Location: `backend/src/main.py`
- Triggers: `uvicorn src.main:app --reload --port 8000` (from `backend/README.md`).
- Responsibilities: Initialize FastAPI app, configure CORS, register routers, provide root and health endpoints.

**Frontend SPA Application:**
- Location: `frontend/src/main.tsx`
- Triggers: `npm run dev` (Vite) from `frontend/package.json`.
- Responsibilities: Mount `<App />` and bootstrap client runtime.

**Legacy Streamlit Application:**
- Location: `streamlit_app.py`
- Triggers: `streamlit run streamlit_app.py` (root `README.md`).
- Responsibilities: Streamlit page setup, tab routing, and session initialization.

## Error Handling

**Strategy:** HTTP boundary handling in route modules plus typed validation in Pydantic models.

**Patterns:**
- Route functions catch exceptions and raise `HTTPException` with endpoint-specific detail text (`backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`).
- Validation constraints are encoded at schema level (`Field(..., ge=..., le=..., pattern=...)` and `@field_validator` in `backend/src/models/api_models.py`).

## Cross-Cutting Concerns

**Logging:** No centralized logging module detected; failures are surfaced as `HTTPException` messages (`backend/src/api/*.py`) and occasional `console.error` in `frontend/src/services/api.ts`.
**Validation:** Primary validation is in `backend/src/models/api_models.py`; frontend adds additional form checks in `frontend/src/components/PatternGenerator.tsx`.
**Authentication:** Not detected in `backend/src/main.py` or any `backend/src/api/*.py` route; endpoints are open within CORS policy.

---

*Architecture analysis: 2026-03-31*
