# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Runner:**
- Frontend: Vitest `^0.34.6` configured in `frontend/package.json` and `frontend/vite.config.ts`.
- Backend: Pytest `>=7.4.0` configured in `backend/pyproject.toml` and `backend/pytest.ini`.
- Config: `frontend/vite.config.ts`, `backend/pytest.ini`.

**Assertion Library:**
- Frontend: Vitest `expect` + `@testing-library/jest-dom` from `frontend/tests/setup.ts`.
- Backend: Pytest assertion introspection (`assert`) in `backend/tests/**/*.py`.

**Run Commands:**
```bash
cd frontend && npm test                 # Run frontend tests (watch)
cd frontend && npm run test:run         # Run frontend tests once
cd frontend && npm run test:coverage    # Frontend coverage report
cd backend && pytest tests/ -v          # Run backend tests
```

## Test File Organization

**Location:**
- Frontend tests are mostly separate from implementation under `frontend/tests/components/` and `frontend/tests/integration/`, with one co-located test `frontend/src/App.test.tsx`.
- Backend tests are separate under `backend/tests/contract/` and `backend/tests/integration/`.

**Naming:**
- Frontend pattern: `test_<Feature>.test.tsx` (for example `frontend/tests/components/test_PatternDisplay.test.tsx`).
- Backend pattern: `test_*.py` enforced by `backend/pytest.ini`.

**Structure:**
```
frontend/tests/
├── components/
├── integration/
└── setup.ts

backend/tests/
├── contract/
└── integration/
```

## Test Structure

**Suite Organization:**
```typescript
// frontend/tests/components/test_PatternDisplay.test.tsx
describe('PatternDisplay Component', () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe('Grid Layout', () => {
    it('renders patterns in a responsive grid', () => { ... })
  })
})
```

```python
# backend/tests/integration/test_pattern_generation.py
def test_pattern_generation_workflow_complete():
    request_data = {...}
    generate_response = client.post('/api/patterns/generate', json=request_data)
    assert generate_response.status_code == 200
```

**Patterns:**
- Setup pattern: frontend uses `beforeEach(vi.clearAllMocks)` and global URL stubs in files like `frontend/tests/integration/test_overlay_flow.test.tsx`.
- Teardown pattern: frontend integration suites call `afterEach(vi.restoreAllMocks)` in `frontend/tests/integration/test_pattern_flow.test.tsx`.
- Assertion pattern: frontend uses semantic DOM assertions (`toBeInTheDocument`, `toHaveClass`) from Testing Library; backend validates JSON schemas and status codes via raw `assert`.

## Mocking

**Framework:** Vitest mocks in frontend; minimal mocking in backend.

**Patterns:**
```typescript
// frontend/tests/components/test_OverlayViewer.test.tsx
vi.mock('react-draggable', () => ({
  default: ({ children, onDrag }: any) => <div onMouseMove={onDrag}>{children}</div>
}))

vi.mock('../../src/services/api', () => ({
  generatePatterns: vi.fn(),
  downloadPattern: vi.fn()
}))
```

```python
# backend uses real app instance
client = TestClient(app)
response = client.post('/api/images/upload', files=files)
```

**What to Mock:**
- Mock network/API boundaries in frontend (`../../src/services/api`) and browser APIs (`URL.createObjectURL`) in `frontend/tests/components/test_PatternDisplay.test.tsx`.
- Mock heavy UI interaction libraries (`react-draggable`, `react-resizable`) in `frontend/tests/components/test_OverlayViewer.test.tsx`.

**What NOT to Mock:**
- Backend contract and integration tests use the real FastAPI app via `TestClient` in `backend/tests/contract/*.py` and `backend/tests/integration/*.py`.

## Fixtures and Factories

**Test Data:**
```typescript
// frontend/tests/components/test_PatternDisplay.test.tsx
const mockPatterns = [{ id: 'pattern-1', seed: 42, ... }]
```

```python
# backend/tests/contract/test_images_upload.py
def create_test_image(width: int = 800, height: int = 600, format: str = 'PNG') -> bytes:
    image = Image.new('RGB', (width, height), color='red')
    ...
```

**Location:**
- Frontend fixtures are inline constants inside each suite file (`frontend/tests/components/*.test.tsx`).
- Backend fixtures are helper functions inline in test modules (`backend/tests/contract/test_images_upload.py`, `backend/tests/integration/test_image_processing.py`).
- Shared pytest fixtures in `conftest.py` are not detected.

## Coverage

**Requirements:** None enforced.
- Frontend has coverage command (`test:coverage`) in `frontend/package.json`.
- No minimum threshold settings detected in `frontend/vite.config.ts` or backend pytest config.

**View Coverage:**
```bash
cd frontend && npm run test:coverage
```

## Test Types

**Unit Tests:**
- Limited current usage: only `frontend/src/App.test.tsx` is clearly unit-scoped.
- `frontend/tests/unit/` and `backend/tests/unit/` directories exist but are empty.

**Integration Tests:**
- Frontend integration scenarios are defined in `frontend/tests/integration/test_pattern_flow.test.tsx` and `frontend/tests/integration/test_overlay_flow.test.tsx`.
- Backend integration scenarios are in `backend/tests/integration/test_pattern_generation.py`, `backend/tests/integration/test_image_processing.py`, and `backend/tests/integration/test_mathematical_accuracy.py`.

**E2E Tests:**
- Not detected (no Playwright/Cypress configuration files found in repository root or `frontend/`).

## Common Patterns

**Async Testing:**
```typescript
await user.click(screen.getByRole('button', { name: /generate patterns/i }))
await waitFor(() => {
  expect(generatePatterns).toHaveBeenCalled()
})
```

```python
response = client.post('/api/patterns/generate', json=request_data)
assert response.status_code == 200
```

**Error Testing:**
```typescript
vi.mocked(downloadPattern).mockRejectedValue(new Error('Network error'))
await waitFor(() => expect(screen.getByText(/download failed/i)).toBeInTheDocument())
```

```python
response = client.post('/api/images/upload', files=files)
assert response.status_code == 415
```

## Coverage and Reliability Gaps

- Frontend tests reference non-existent modules and exports (`frontend/tests/components/test_OverlayViewer.test.tsx` expects `frontend/src/components/OverlayViewer.tsx`; `frontend/tests/integration/test_pattern_flow.test.tsx` imports `{ App }` while `frontend/src/App.tsx` exports default).
- Frontend tests mock `generatePatterns` as a top-level export, but runtime code uses `apiClient.generatePatterns` in `frontend/src/services/api.ts` and `frontend/src/components/PatternGenerator.tsx`; this mismatch weakens test validity.
- Backend async tests in `backend/tests/contract/test_patterns_generate.py` use `AsyncClient` without an import, which makes those test cases non-runnable until corrected.
- Backend assertions expecting custom `{"error","message"}` payloads conflict with current FastAPI `{"detail": ...}` behavior in `backend/src/api/*.py` and `backend/src/models/api_models.py`.
- Empty `frontend/tests/performance/` and `backend/tests/performance/` indicate no active performance regression test coverage.

---

*Testing analysis: 2026-03-31*
