# Coding Conventions

**Analysis Date:** 2026-03-31

## Naming Patterns

**Files:**
- Use PascalCase for React component modules in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/components/PatternDisplay.tsx`.
- Use camelCase/snake hybrid for API and type modules in `frontend/src/services/api.ts` and `frontend/src/types/api.ts`.
- Use snake_case for Python modules in `backend/src/api/patterns.py`, `backend/src/services/image_service.py`, and `backend/src/models/api_models.py`.
- Use `test_*.test.tsx` naming for frontend tests in `frontend/tests/components/test_PatternGenerator.test.tsx` and `frontend/tests/integration/test_pattern_flow.test.tsx`.
- Use `test_*.py` naming for backend tests in `backend/tests/contract/test_patterns_generate.py` and `backend/tests/integration/test_image_processing.py`.

**Functions:**
- Use camelCase for TypeScript functions/handlers such as `handleSubmit`, `handleFieldBlur`, and `calculateOverlay` in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/services/api.ts`.
- Use snake_case for Python functions such as `generate_patterns`, `upload_image`, and `calculate_dimensions` in `backend/src/api/patterns.py`, `backend/src/api/images.py`, and `backend/src/services/overlay_service.py`.

**Variables:**
- Use descriptive local names (`formData`, `validationErrors`, `downloadStates`) in `frontend/src/components/PatternGenerator.tsx` and `frontend/src/components/PatternDisplay.tsx`.
- Use typed dict/list names (`request_data`, `response_data`, `test_cases`) in backend tests like `backend/tests/contract/test_images_upload.py` and `backend/tests/integration/test_pattern_generation.py`.

**Types:**
- Use `interface` and union types for frontend contracts in `frontend/src/types/api.ts`.
- Use Pydantic `BaseModel` classes for backend API contracts in `backend/src/models/api_models.py`.

## Code Style

**Formatting:**
- Frontend formatting uses Prettier from `frontend/.prettierrc` (single quotes, semicolons, trailing commas `es5`, print width 80).
- Backend formatting uses Black configured in `backend/pyproject.toml` (`line-length = 88`, `target-version = py312`).

**Linting:**
- Frontend linting uses ESLint from `frontend/.eslintrc.cjs` with `@typescript-eslint` parser and `react-hooks` rules.
- Frontend quality rules include `prefer-const`, `no-var`, warn-on `no-console`, and warn-on `@typescript-eslint/no-explicit-any` in `frontend/.eslintrc.cjs`.
- Backend linting uses Ruff in `backend/pyproject.toml` (`E,F,I,N,W,UP` rule families).

## Import Organization

**Order:**
1. Framework/library imports first (`react`, `fastapi`) in `frontend/src/main.tsx` and `backend/src/api/patterns.py`.
2. Internal app imports second (`../services/api`, `src.models.api_models`) in `frontend/src/components/PatternDisplay.tsx` and `backend/src/api/images.py`.
3. Type-only imports are explicitly marked in frontend (`import type`) as shown in `frontend/src/services/api.ts`.

**Path Aliases:**
- `@/*` and scoped aliases (`@/components/*`, `@/services/*`, etc.) are configured in `frontend/tsconfig.json` and Vite alias `@` is configured in `frontend/vite.config.ts`.
- Current implemented source files mostly use relative imports (`../services/api`) in `frontend/src/components/PatternGenerator.tsx`.

## Error Handling

**Patterns:**
- Frontend API calls return discriminated result objects (`{ success: true, data } | { success: false, error }`) in `frontend/src/services/api.ts`.
- Frontend component submit handlers guard invalid state early and set user-facing error text in `frontend/src/components/PatternGenerator.tsx`.
- Backend endpoints wrap logic in `try/except` and normalize failures to `HTTPException` in `backend/src/api/patterns.py`, `backend/src/api/images.py`, and `backend/src/api/overlay.py`.
- Backend model-level validation is centralized in Pydantic validators in `backend/src/models/api_models.py`.

## Logging

**Framework:** console

**Patterns:**
- Avoid console logging in frontend by default (`no-console` warning), with isolated exception for download failures in `frontend/src/services/api.ts`.
- Backend source does not define structured logging in `backend/src/main.py` or `backend/src/api/*.py`; rely on FastAPI/Uvicorn defaults.

## Comments

**When to Comment:**
- Use module docstrings and section comments for intent in backend files such as `backend/src/services/pattern_service.py`.
- Use header block comments for component/test purpose in frontend files such as `frontend/src/components/PatternDisplay.tsx` and `frontend/tests/components/test_PatternDisplay.test.tsx`.

**JSDoc/TSDoc:**
- Formal TSDoc is limited; lightweight block comments are used in `frontend/src/services/api.ts` and `frontend/src/types/api.ts`.
- Python docstrings are used consistently for modules, classes, and many functions in `backend/src/models/api_models.py` and `backend/src/services/image_service.py`.

## Function Design

**Size:**
- Frontend components can be large, stateful modules (for example `frontend/src/components/PatternGenerator.tsx` >500 lines). Keep helper callbacks memoized (`useCallback`, `useMemo`) to reduce rerender churn.
- Backend service functions are split by concern (`generate_layout`, `assign_colors_*`, `calculate_dimensions`) in `backend/src/services/pattern_service.py` and `backend/src/services/overlay_service.py`.

**Parameters:**
- Prefer strongly typed request objects in frontend (`GenerateRequest`, `OverlayRequest`) from `frontend/src/types/api.ts`.
- Prefer explicit keyword-style payload dictionaries in backend tests (`request_data`) from `backend/tests/contract/test_overlay_calculate.py`.

**Return Values:**
- Frontend API helpers return typed result wrappers and nullable blobs for downloads in `frontend/src/services/api.ts`.
- Backend endpoints return Pydantic response models (`GenerateResponse`, `UploadResponse`, `OverlayResponse`) declared in `backend/src/models/api_models.py`.

## Module Design

**Exports:**
- Frontend uses named exports for components (`export const PatternDisplay`) and default export for `App` in `frontend/src/components/PatternDisplay.tsx` and `frontend/src/App.tsx`.
- Backend exposes routers and singleton service instances (`router`, `image_service`, `overlay_service`) in `backend/src/api/*.py` and `backend/src/services/*.py`.

**Barrel Files:**
- Minimal barrel usage: package markers exist in `backend/src/api/__init__.py`, `backend/src/models/__init__.py`, and `backend/src/services/__init__.py`.
- No frontend barrel index files detected under `frontend/src/components/`.

---

*Convention analysis: 2026-03-31*
