---
type: quick
date: 2026-04-06
owner: opencode
status: completed
scope: frontend
---

<objective>
Convert newly added inline help copy to hover-only help affordances with touch-friendly tap/focus behavior.
</objective>

<execution_context>
- Command: `/gsd:quick Convert newly added inline help copy to hover-only help affordances with mobile-aware behavior (tap/focus support), primarily frontend changes.`
- Focus: `frontend/src/components/*.tsx` and shared styles in `frontend/src/App.css`.
- Constraints: preserve existing generation/overlay interactions and keep help text available on keyboard and touch devices.
</execution_context>

<implementation_plan>
1. Introduce a reusable tooltip affordance component for hover/focus/tap help behavior.
2. Replace inline helper paragraphs across the generator, uploader, overlay controls, and pattern gallery.
3. Update shared CSS for icon trigger + tooltip presentation and responsive behavior.
4. Re-run impacted frontend component/integration tests.
</implementation_plan>

<acceptance_checks>
- Helper copy no longer occupies inline layout space by default.
- Help can be revealed by hover/focus on pointer+keyboard and by tap on touch devices.
- Existing form input and overlay interaction tests remain green.
</acceptance_checks>

<artifacts>
- frontend/src/components/HelpHint.tsx
- frontend/src/components/PatternGenerator.tsx
- frontend/src/components/WallImageUploader.tsx
- frontend/src/components/OverlayCanvas.tsx
- frontend/src/components/OverlayViewer.tsx
- frontend/src/components/PatternDisplay.tsx
- frontend/src/App.tsx
- frontend/src/App.css
</artifacts>

<verification>
- `npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_PatternDisplay.test.tsx tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx`
- Result: 5 test files passed, 25 tests passed.
</verification>
