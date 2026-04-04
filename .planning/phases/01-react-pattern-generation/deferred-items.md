# Deferred Items

- 2026-03-31 — `npm run type-check` fails due to extensive pre-existing frontend typing/test-contract issues unrelated to Plan 01 workspace wiring. Key examples: `src/components/PatternDisplay.tsx` unused/mismatched types and multiple failing test files under `frontend/tests/integration/` and `frontend/tests/components/` referencing outdated API response shapes.
- 2026-03-31 — Plan 02 verification re-confirmed unresolved out-of-scope type-check failures in Overlay/integration suites (missing `OverlayViewer` module references and legacy `APIResponse` mock shapes).
- 2026-03-31 — Plan 03 verification confirms out-of-scope type-check debt remains isolated to overlay-related suites: missing `OverlayViewer`/`useOverlayDimensions` modules and legacy `test_overlay_flow.test.tsx` API wrapper mocks.
