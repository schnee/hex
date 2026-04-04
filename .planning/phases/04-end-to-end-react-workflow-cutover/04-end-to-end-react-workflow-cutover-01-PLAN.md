---
phase: 04-end-to-end-react-workflow-cutover
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/package.json
  - frontend/src/App.tsx
  - frontend/src/App.css
  - frontend/src/routes/workspaceRoutes.ts
  - frontend/tests/integration/test_routed_workspace_flow.test.tsx
autonomous: true
requirements:
  - MIGR-02
must_haves:
  truths:
    - "User can navigate between generator and overlay using URL routes instead of in-component tabs."
    - "Selected pattern remains available after switching routes in either direction."
    - "Direct navigation to base app path lands user in the generator route."
  artifacts:
    - path: "frontend/src/routes/workspaceRoutes.ts"
      provides: "Shared route constants for workspace navigation"
      contains: "WORKSPACE_ROUTES"
    - path: "frontend/src/App.tsx"
      provides: "Routed shell using generator and overlay route elements"
      contains: "Routes"
    - path: "frontend/tests/integration/test_routed_workspace_flow.test.tsx"
      provides: "Route navigation and context persistence coverage"
      contains: "selected pattern"
  key_links:
    - from: "frontend/src/App.tsx"
      to: "frontend/src/routes/workspaceRoutes.ts"
      via: "route path constants"
      pattern: "WORKSPACE_ROUTES"
    - from: "frontend/src/App.tsx"
      to: "frontend/src/context/PatternContext.tsx"
      via: "selected pattern state read/write"
      pattern: "selectedPattern"
    - from: "frontend/tests/integration/test_routed_workspace_flow.test.tsx"
      to: "frontend/src/App.tsx"
      via: "user navigation assertions"
      pattern: "navigate"
---

<objective>
Introduce route-based workspace navigation with preserved pattern-selection context.

Purpose: MIGR-02 requires URL-routed movement between generator and overlay views while keeping user selection state stable.
Output: React Router dependency + route constants + routed App shell + integration proof of context persistence across routes.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-RESEARCH.md
@frontend/src/App.tsx
@frontend/src/context/PatternContext.tsx
@frontend/src/main.tsx

<interfaces>
From frontend/src/context/PatternContext.tsx:
```typescript
interface PatternContextValue {
  patterns: Pattern[] | null;
  selectedPattern: Pattern | null;
  selectedPatternId: string | undefined;
  setPatterns: Dispatch<SetStateAction<Pattern[] | null>>;
  setSelectedPattern: Dispatch<SetStateAction<Pattern | null>>;
  setSelectedPatternId: Dispatch<SetStateAction<string | undefined>>;
}
```

From React Router v6 (Context7):
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/generator" replace />} />
    <Route path="/generator" element={<GeneratorRoute />} />
    <Route path="/overlay" element={<OverlayRoute />} />
  </Routes>
</BrowserRouter>
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Define route contracts and failing navigation persistence test</name>
  <files>frontend/src/routes/workspaceRoutes.ts, frontend/tests/integration/test_routed_workspace_flow.test.tsx</files>
  <behavior>
    - Test 1: Base app route redirects to generator route.
    - Test 2: After selecting a generated pattern, navigating to overlay and back keeps selected pattern state.
    - Test 3: Overlay route navigation is available through route links (not tab role controls).
  </behavior>
  <action>Create `workspaceRoutes.ts` exporting route constants (`/`, `/generator`, `/overlay`) for shared use. Add `test_routed_workspace_flow.test.tsx` that mocks API wrapper calls, drives generate/select/navigation behavior, and fails until routed App wiring exists. Assert route-driven controls and selected pattern persistence per MIGR-02.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx</automated>
  </verify>
  <done>Route contracts exist and the new routed workflow expectations are executable and initially failing against current tab-based App.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement routed App shell with generator/overlay route composition</name>
  <files>frontend/package.json, frontend/src/App.tsx, frontend/src/App.css, frontend/src/routes/workspaceRoutes.ts, frontend/tests/integration/test_routed_workspace_flow.test.tsx</files>
  <behavior>
    - Test 1: Generator and Overlay views render through route elements.
    - Test 2: Selected pattern state remains intact when moving between routes.
    - Test 3: Default route (`/`) navigates to generator without user intervention.
  </behavior>
  <action>Add `react-router-dom` dependency and refactor `App.tsx` from tab switching to route navigation using constants from `workspaceRoutes.ts`. Keep all existing generator/overlay callbacks and state ownership patterns intact, preserving selected pattern context across route transitions. Update `App.css` for route navigation control styling (active link state) while removing tab-role-specific assumptions. Ensure `test_routed_workspace_flow` passes with no regressions to existing API wrapper usage.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx</automated>
  </verify>
  <done>MIGR-02 is satisfied: route-based generator/overlay transitions work and selected pattern persists across navigation.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx`
</verification>

<success_criteria>
- Workspace navigation is route-based (`/generator`, `/overlay`) with deterministic default redirect.
- Pattern selection context survives route changes without resets.
</success_criteria>

<output>
After completion, create `.planning/phases/04-end-to-end-react-workflow-cutover/04-end-to-end-react-workflow-cutover-01-SUMMARY.md`
</output>
