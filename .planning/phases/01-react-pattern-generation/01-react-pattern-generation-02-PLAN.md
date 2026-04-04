---
phase: 01-react-pattern-generation
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/PatternGenerator.tsx
  - frontend/tests/components/test_PatternGenerator.test.tsx
autonomous: true
requirements:
  - GEN-01
  - GEN-02
must_haves:
  truths:
    - "User gets immediate validation feedback for invalid generator values before submit."
    - "User can submit valid generator inputs and receive multiple variants from one request."
  artifacts:
    - path: "frontend/src/components/PatternGenerator.tsx"
      provides: "Phase 1 generator form validation and request payload composition"
      contains: "handleSubmit"
    - path: "frontend/tests/components/test_PatternGenerator.test.tsx"
      provides: "Validation and submit behavior assertions for generator UX"
      contains: "PatternGenerator Component"
  key_links:
    - from: "frontend/src/components/PatternGenerator.tsx"
      to: "frontend/src/services/api.ts"
      via: "apiClient.generatePatterns(request)"
      pattern: "generatePatterns"
    - from: "frontend/src/components/PatternGenerator.tsx"
      to: "frontend/src/types/api.ts"
      via: "GenerateRequest payload mapping"
      pattern: "GenerateRequest"
---

<objective>
Harden generator form behavior so parameter entry, validation, and generation submission match Phase 1 requirement semantics.

Purpose: GEN-01/GEN-02 depend on trustworthy input validation and API payload parity.
Output: A robust PatternGenerator component with passing component tests for form and submit behaviors.
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
@frontend/src/services/api.ts
@frontend/src/components/PatternGenerator.tsx
@frontend/tests/components/test_PatternGenerator.test.tsx

<interfaces>
From frontend/src/types/api.ts:
```typescript
export interface GenerateRequest {
  aspect_w: number;
  aspect_h: number;
  aspect_adherence?: number;
  total_tiles: number;
  colors: string[];
  counts: number[];
  color_mode: 'random' | 'gradient' | 'scheme60';
  seed: number;
  num_layouts: number;
}
```

From frontend/src/services/api.ts:
```typescript
async generatePatterns(
  request: GenerateRequest
): Promise<APIResponse<GenerateResponse>>;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Align generator tests with API result wrapper and validation contract</name>
  <files>frontend/tests/components/test_PatternGenerator.test.tsx</files>
  <behavior>
    - Test 1: Invalid values (aspect bounds, tile count, seed, tendril bounds, color format) show field-level errors without API calls.
    - Test 2: Valid submit sends `GenerateRequest` with `num_layouts`, color/count arrays, and mode-specific options.
    - Test 3: API failure paths display actionable submit error text.
  </behavior>
  <action>Update mocks and assertions to the current API wrapper shape (`{ success, data | error }`) and remove assumptions that bypass `apiClient`. Keep tests focused on GEN-01/GEN-02 and avoid introducing selection/download assertions in this file.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx</automated>
  </verify>
  <done>Generator component test suite accurately describes validation and request behavior against current API abstractions.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement generator validation and request composition to satisfy tests</name>
  <files>frontend/src/components/PatternGenerator.tsx</files>
  <behavior>
    - Test 1: Blur and submit both surface immediate validation feedback for invalid inputs.
    - Test 2: Successful submit calls `apiClient.generatePatterns` once and forwards returned variants via callback.
    - Test 3: Failed responses show backend detail or network fallback message.
  </behavior>
  <action>Adjust `PatternGenerator` as needed to pass updated tests: keep existing field set (aspect ratio, tile counts, tendril settings, color strategy, layout count), preserve strict request typing, and maintain immediate validation feedback per GEN-01. Ensure submit flow supports multi-variant generation in one action per GEN-02.</action>
  <verify>
    <automated>cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx</automated>
  </verify>
  <done>PatternGenerator provides immediate validation UX and emits correct generation requests/responses for multiple variants.</done>
</task>

</tasks>

<verification>
- `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx`
- `cd frontend && npm run type-check`
</verification>

<success_criteria>
- Invalid generator input is blocked with immediate, specific error feedback.
- Valid submit triggers one generation API request and returns variant list via callback.
- Component tests pass and lock validation + payload behaviors.
</success_criteria>

<output>
After completion, create `.planning/phases/01-react-pattern-generation/01-react-pattern-generation-02-SUMMARY.md`
</output>
