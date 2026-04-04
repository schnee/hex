---
phase: 01-react-pattern-generation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/context/PatternContext.tsx
  - frontend/src/App.tsx
  - frontend/src/main.tsx
  - frontend/tests/components/test_AppPatternWorkspace.test.tsx
autonomous: true
requirements:
  - GEN-02
  - GEN-03
must_haves:
  truths:
    - "User can generate a batch of pattern variants in one submit action."
    - "User can choose one returned variant and keep it as the active pattern in React state."
  artifacts:
    - path: "frontend/src/context/PatternContext.tsx"
      provides: "Shared typed state for generated patterns and active pattern selection"
      contains: "PatternContextProvider"
    - path: "frontend/src/App.tsx"
      provides: "Generator + results composition wired through context"
      contains: "PatternGenerator"
    - path: "frontend/src/main.tsx"
      provides: "App mounted with provider wrapper"
      contains: "PatternContextProvider"
  key_links:
    - from: "frontend/src/components/PatternGenerator.tsx"
      to: "frontend/src/context/PatternContext.tsx"
      via: "onPatternsGenerated callback updates provider state"
      pattern: "onPatternsGenerated"
    - from: "frontend/src/components/PatternDisplay.tsx"
      to: "frontend/src/context/PatternContext.tsx"
      via: "onPatternSelect sets selectedPatternId"
      pattern: "selectedPatternId"
---

<objective>
Establish the React workspace composition for Phase 1 so generation results and selected-pattern state flow through a single typed source of truth.

Purpose: This creates the base wiring required for GEN-02/GEN-03 without coupling logic into a single component.
Output: A provider-backed App that renders generator + display and tracks active selection.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@frontend/src/types/api.ts
@frontend/src/components/PatternGenerator.tsx
@frontend/src/components/PatternDisplay.tsx

<interfaces>
From frontend/src/types/api.ts:
```typescript
export interface Pattern {
  id: string;
  seed: number;
  width_inches: number;
  height_inches: number;
  aspect_ratio: number;
  aspect_deviation: number;
  png_data: string;
  hexes: Hex[];
  colors: string[];
}
```

From frontend/src/components/PatternGenerator.tsx:
```typescript
interface PatternGeneratorProps {
  onPatternsGenerated: (patterns: Pattern[]) => void;
}
```

From frontend/src/components/PatternDisplay.tsx:
```typescript
interface PatternDisplayProps {
  patterns: Pattern[] | null;
  onPatternSelect: (pattern: Pattern) => void;
  selectedPatternId?: string;
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create typed pattern workspace context contract</name>
  <files>frontend/src/context/PatternContext.tsx</files>
  <action>Create a new provider module exporting context state and setters for `patterns`, `selectedPattern`, and `selectedPatternId` using `Pattern` from `frontend/src/types/api.ts`. Keep context focused on Phase 1 needs only (do not add overlay state yet). Expose a typed hook for consumers and ensure default guards throw clear errors if used outside provider.</action>
  <verify>
    <automated>cd frontend && npm run type-check</automated>
  </verify>
  <done>`PatternContextProvider` and a typed consumer hook exist, compile cleanly, and model only generation/selection state needed for GEN-02 and GEN-03.</done>
</task>

<task type="auto">
  <name>Task 2: Wire App composition to provider-backed generation and selection flow</name>
  <files>frontend/src/App.tsx, frontend/src/main.tsx</files>
  <action>Refactor `App.tsx` from placeholder content into a Phase 1 workspace that renders `PatternGenerator` and `PatternDisplay` together. On generation success, store returned variants and clear stale selected pattern; on card select, set active pattern id. Wrap app root in `PatternContextProvider` in `main.tsx`. Keep wiring aligned with GEN-02/GEN-03 and avoid adding router/overlay concerns in this plan.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_AppPatternWorkspace.test.tsx</automated>
  </verify>
  <done>App shows generator and display in one flow, generated variants appear in display state, and active selection changes when user clicks a result card.</done>
</task>

<task type="auto">
  <name>Task 3: Add workspace wiring test to lock generation-to-selection behavior</name>
  <files>frontend/tests/components/test_AppPatternWorkspace.test.tsx</files>
  <action>Add a focused component test that mounts the App/provider stack, mocks generation response, verifies generated variants render, and asserts selection transitions update `selected` styling on cards. Keep this test independent of download/export assertions (those are covered in plan 03).</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_AppPatternWorkspace.test.tsx</automated>
  </verify>
  <done>Test fails before wiring, passes after wiring, and protects GEN-02/GEN-03 state transitions.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_AppPatternWorkspace.test.tsx`
- `cd frontend && npm run type-check`
</verification>

<success_criteria>
- Generated pattern batches appear in App-level state after one submit action.
- Active pattern selection is stored and reflected visually in result cards.
- Workspace composition is test-covered and type-safe.
</success_criteria>

<output>
After completion, create `.planning/phases/01-react-pattern-generation/01-react-pattern-generation-01-SUMMARY.md`
</output>
