---
phase: 01-react-pattern-generation
plan: 03
type: execute
wave: 2
depends_on:
  - 01-react-pattern-generation-01
  - 01-react-pattern-generation-02
files_modified:
  - frontend/src/components/PatternDisplay.tsx
  - frontend/tests/components/test_PatternDisplay.test.tsx
  - frontend/tests/integration/test_pattern_flow.test.tsx
autonomous: true
requirements:
  - GEN-03
  - GEN-04
must_haves:
  truths:
    - "User can select any generated variant and clearly see which one is active."
    - "User can export the selected/generated pattern as a PNG from the React UI."
  artifacts:
    - path: "frontend/src/components/PatternDisplay.tsx"
      provides: "Selectable pattern cards and download interactions"
      contains: "handleDownload"
    - path: "frontend/tests/components/test_PatternDisplay.test.tsx"
      provides: "Selection, keyboard nav, and download behavior checks"
      contains: "PatternDisplay Component"
    - path: "frontend/tests/integration/test_pattern_flow.test.tsx"
      provides: "End-to-end generation→selection→download workflow verification"
      contains: "Pattern Generation Integration Flow"
  key_links:
    - from: "frontend/src/components/PatternDisplay.tsx"
      to: "frontend/src/services/api.ts"
      via: "downloadPattern(pattern.id)"
      pattern: "downloadPattern"
    - from: "frontend/tests/integration/test_pattern_flow.test.tsx"
      to: "frontend/src/App.tsx"
      via: "render(<App />) workflow assertions"
      pattern: "generate patterns"
---

<objective>
Complete variant-selection and PNG export behavior, then verify the full Phase 1 user flow through integration tests.

Purpose: GEN-03/GEN-04 are only complete when selection and download are both user-visible and test-verified.
Output: A PatternDisplay + integration suite that proves generation, selection, and export behavior end to end.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-react-pattern-generation/01-react-pattern-generation-01-PLAN.md
@frontend/src/components/PatternDisplay.tsx
@frontend/src/services/api.ts
@frontend/tests/components/test_PatternDisplay.test.tsx
@frontend/tests/integration/test_pattern_flow.test.tsx

<interfaces>
From frontend/src/components/PatternDisplay.tsx:
```typescript
interface PatternDisplayProps {
  patterns: Pattern[] | null;
  onPatternSelect: (pattern: Pattern) => void;
  selectedPatternId?: string;
}
```

From frontend/src/services/api.ts:
```typescript
async downloadPattern(patternId: string): Promise<Blob | null>;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Update PatternDisplay tests for active-selection and export expectations</name>
  <files>frontend/tests/components/test_PatternDisplay.test.tsx</files>
  <behavior>
    - Test 1: Clicking or keyboard-selecting a card marks only that card as selected.
    - Test 2: Download action invokes `downloadPattern`, creates blob URL, and handles loading/error state.
    - Test 3: Display metadata and accessibility labels remain visible for each variant card.
  </behavior>
  <action>Refine test assertions to match actual component contracts and class names (`selected`, deviation classes, hover/download states). Keep tests deterministic by mocking blob APIs and API module methods only.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternDisplay.test.tsx</automated>
  </verify>
  <done>Component tests clearly define GEN-03/GEN-04 behavior and fail before implementation fixes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement PatternDisplay selection/download behavior to pass component tests</name>
  <files>frontend/src/components/PatternDisplay.tsx</files>
  <behavior>
    - Test 1: Selected card state is visually distinct and updates on user interaction.
    - Test 2: Download button triggers PNG retrieval and user feedback on success/failure.
    - Test 3: Keyboard interaction remains functional for selection and navigation.
  </behavior>
  <action>Adjust selection classes, download trigger visibility, and API integration details to satisfy tests while keeping component props stable for `App` wiring from plan 01. Do not move download logic into unrelated modules; keep it in PatternDisplay for Phase 1 scope.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternDisplay.test.tsx</automated>
  </verify>
  <done>PatternDisplay reliably supports selection and PNG export workflows with accessible interaction paths.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Reconcile integration flow test with final App/generator/display contracts</name>
  <files>frontend/tests/integration/test_pattern_flow.test.tsx</files>
  <behavior>
    - Test 1: End-to-end generate action renders returned variants in the results grid.
    - Test 2: User can select a variant and observe active card state.
    - Test 3: User can trigger download from generated results and API call is made.
  </behavior>
  <action>Update integration test imports/mocks to current exported app/API shapes, then assert complete GEN-01→GEN-04 flow without relying on internal implementation details. Keep this file focused on cross-component behavior, not low-level field validation already covered in component tests.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx</automated>
  </verify>
  <done>Integration test proves the full Phase 1 journey from generation submit through selection and PNG export.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_PatternDisplay.test.tsx`
- `cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx`
- `cd frontend && npm run type-check`
</verification>

<success_criteria>
- Variant selection state is clear and consistent across card interactions.
- PNG export works from generated results with observable loading/error handling.
- Integration test passes for generation → selection → export path.
</success_criteria>

<output>
After completion, create `.planning/phases/01-react-pattern-generation/01-react-pattern-generation-03-SUMMARY.md`
</output>
