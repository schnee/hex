# Codebase Concerns

**Analysis Date:** 2026-03-31

## Tech Debt

**Duplicated pattern-generation engine (legacy + backend copy):**
- Issue: Core layout/rendering logic is duplicated in both `app/hex_tile_layouts_core.py` and `backend/src/services/pattern_service.py`, creating drift risk whenever algorithm changes happen in only one location.
- Files: `app/hex_tile_layouts_core.py`, `backend/src/services/pattern_service.py`
- Impact: Behavior divergence across Streamlit and FastAPI paths, higher bug-fix cost, and inconsistent outputs for the same input over time.
- Fix approach: Consolidate to one shared module and import it from both runtimes, then add contract tests that assert identical outputs for fixed seeds.

**Runtime split with partially disconnected frontend implementation:**
- Issue: Current UI entry point is a static status page in `frontend/src/App.tsx`, while functional components live separately and are not mounted (`frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`).
- Files: `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/components/PatternGenerator.tsx`, `frontend/src/components/PatternDisplay.tsx`
- Impact: Main app path does not expose generation/overlay workflows, and integration tests target an application shape that is not currently wired.
- Fix approach: Define a single canonical app composition in `frontend/src/App.tsx` and route all feature components through it.

## Known Bugs

**Scheme60 role-key mismatch between frontend request and backend parser:**
- Symptoms: Requests in `scheme60` mode can fail with server-side errors when role overrides are provided.
- Files: `frontend/src/components/PatternGenerator.tsx`, `backend/src/services/pattern_service.py`, `backend/src/api/patterns.py`
- Trigger: Frontend sends `roles` keys as `primary/secondary/accent` (`frontend/src/components/PatternGenerator.tsx`), but backend indexing expects `dominant/secondary/accent` (`roles['dominant']` in `backend/src/services/pattern_service.py`).
- Workaround: Omit explicit role overrides from requests so backend fallback role assignment is used.

**Overlay calculation ignores positional/rotational state and uploaded image dimensions:**
- Symptoms: `/api/overlay/calculate` output changes only with scale values and not with `left`, `top`, `rotation`, or actual image size.
- Files: `backend/src/models/api_models.py`, `backend/src/services/overlay_service.py`
- Trigger: `OverlayState` includes `left`, `top`, and `rotation`, but `calculate_dimensions` only uses `scaleX/scaleY` and a fixed `base_visual_width = 200.0`.
- Workaround: Treat current response as approximate scaling metadata only, not accurate overlay geometry.

## Security Considerations

**Unauthenticated public mutation endpoints:**
- Risk: Any caller can generate patterns, upload images, and request overlay calculations if service is exposed.
- Files: `backend/src/main.py`, `backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`
- Current mitigation: CORS in `backend/src/main.py` limits browser origins during local development.
- Recommendations: Add API authentication/authorization middleware (token or session) and apply per-endpoint access controls.

**Error-detail leakage to clients:**
- Risk: Internal exception text is returned directly to API consumers.
- Files: `backend/src/api/patterns.py`, `backend/src/api/images.py`, `backend/src/api/overlay.py`
- Current mitigation: Exceptions are wrapped in `HTTPException` with standardized status codes.
- Recommendations: Return stable generic error messages to clients and log detailed traces server-side only.

## Performance Bottlenecks

**Unbounded in-memory object retention for patterns/images:**
- Problem: Generated artifacts are stored indefinitely in process memory.
- Files: `backend/src/api/patterns.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`
- Cause: `_stored_patterns`, `ImageService._images`, and `OverlayService._patterns` have no TTL, size cap, or cleanup path.
- Improvement path: Move to bounded external storage (Redis/object store), add TTL eviction and max-entry limits.

**Per-request image/base64/matplotlib heavy processing:**
- Problem: Upload and generation paths perform full in-memory decoding/encoding and image rendering per request.
- Files: `backend/src/services/image_service.py`, `backend/src/services/pattern_service.py`, `backend/src/api/patterns.py`
- Cause: `await file.read()` loads entire uploads, `base64.b64encode` stores expanded payloads, and `plt.subplots()`/PNG rendering executes for each generated layout.
- Improvement path: Enforce upload size limits, stream where possible, and offload rendering to worker queues with cached results.

## Fragile Areas

**Frontend test suite targets modules that are missing or differently exported:**
- Files: `frontend/tests/components/test_OverlayViewer.test.tsx`, `frontend/tests/integration/test_overlay_flow.test.tsx`, `frontend/tests/integration/test_pattern_flow.test.tsx`, `frontend/src/components/OverlayViewer.tsx`, `frontend/src/App.tsx`
- Why fragile: Tests import `OverlayViewer`, `PatternContext`, and named `{ App }` exports, but `OverlayViewer`/context paths are absent and `App` is default-export only.
- Safe modification: Align test imports/expectations to current module boundaries before relying on CI test signal.
- Test coverage: Existing frontend tests are extensive in count, but currently not aligned to source entry points.

**Backend test execution depends on working directory/PYTHONPATH assumptions:**
- Files: `backend/tests/contract/test_patterns_generate.py`, `backend/pytest.ini`
- Why fragile: Running tests from repository root can fail module resolution (`from src.main import app`), and async tests reference `AsyncClient` without import in `backend/tests/contract/test_patterns_generate.py`.
- Safe modification: Standardize test invocation from `backend/` and fix import setup (`PYTHONPATH`/package layout + explicit `AsyncClient` import).
- Test coverage: Contract and integration suites exist, but collection/runtime reliability is inconsistent.

## Scaling Limits

**Single-process memory and request throughput constraints:**
- Current capacity: API validation caps individual requests to `total_tiles <= 1000` and `num_layouts <= 12` in `backend/src/models/api_models.py`.
- Limit: Stateful in-memory stores and CPU-bound rendering in `backend/src/services/pattern_service.py` constrain horizontal scale and restart resilience.
- Scaling path: Externalize state, introduce background jobs for render-intensive operations, and make API layer stateless.

## Dependencies at Risk

**Divergent dependency manifests across root and backend/frontend runtimes:**
- Risk: Multiple manifests (`pyproject.toml`, root `requirements.txt`, `backend/requirements.txt`, `frontend/package.json`) define overlapping but different stacks.
- Impact: Environment drift and non-reproducible behavior between local setups and CI.
- Migration plan: Declare one authoritative dependency source per runtime and enforce lockfile usage in CI.

## Missing Critical Features

**Missing production-grade persistence and lifecycle management:**
- Problem: Pattern/image lifecycle is process-local only and reset on restart.
- Blocks: Durable sessions, multi-instance deployment, and reliable user workflows across restarts.

**Missing implemented overlay UI module expected by tests/specs:**
- Problem: `OverlayViewer` and related hook/context paths referenced by tests are not present in `frontend/src/`.
- Blocks: Completing interactive overlay feature path in the React application runtime.

## Test Coverage Gaps

**No reliable end-to-end coverage of the currently mounted frontend app path:**
- What's not tested: The actual rendered `App` entrypoint behavior in `frontend/src/App.tsx` relative to intended generator/overlay workflows.
- Files: `frontend/src/App.tsx`, `frontend/tests/integration/test_pattern_flow.test.tsx`, `frontend/tests/integration/test_overlay_flow.test.tsx`
- Risk: Regressions in real user flows can pass unnoticed because tests target a different app composition.
- Priority: High

**Operational safeguards are untested (memory growth, eviction, and abuse cases):**
- What's not tested: Long-running retention behavior and upload abuse scenarios for in-memory stores and full-buffer reads.
- Files: `backend/src/api/patterns.py`, `backend/src/services/image_service.py`, `backend/src/services/overlay_service.py`
- Risk: Performance degradation and instability under sustained usage are detected late.
- Priority: High

---

*Concerns audit: 2026-03-31*
