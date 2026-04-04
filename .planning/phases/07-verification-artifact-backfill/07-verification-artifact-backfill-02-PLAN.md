---
phase: 07-verification-artifact-backfill
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md
  - .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md
  - .planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md
autonomous: true
requirements: [MIGR-02, UX-01, UX-02]
must_haves:
  truths:
    - "Phase 4, 5, and 6 each have verification reports that reconcile route/workflow, reliability, and contract parity outcomes."
    - "MIGR-02 and UX-01/UX-02 are explicitly represented in requirements coverage tables with status + evidence."
    - "Cross-phase generated-image contract parity evidence (Phase 6) is represented in verification-source form, not only summary form."
  artifacts:
    - path: ".planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md"
      provides: "Phase 4 verification report with MIGR-02 evidence"
      contains: "| MIGR-02"
    - path: ".planning/phases/05-reliability-ux-stability/05-VERIFICATION.md"
      provides: "Phase 5 verification report with UX requirement coverage"
      contains: "| UX-01"
    - path: ".planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md"
      provides: "Phase 6 verification report confirming generated-image contract evidence"
      contains: "generated image"
  key_links:
    - from: ".planning/phases/04-end-to-end-react-workflow-cutover/*-SUMMARY.md"
      to: ".planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md"
      via: "requirements coverage table"
      pattern: "\| MIGR-02"
    - from: ".planning/phases/05-reliability-ux-stability/*-SUMMARY.md"
      to: ".planning/phases/05-reliability-ux-stability/05-VERIFICATION.md"
      via: "requirements coverage table"
      pattern: "\| UX-01|\| UX-02"
    - from: ".planning/phases/06-generated-image-contract-parity/*-SUMMARY.md"
      to: ".planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md"
      via: "goal achievement + key-link evidence"
      pattern: "png_data|generated image"
---

<objective>
Backfill verification artifacts for Phases 4–6 so routed workflow, reliability, and contract-parity outcomes are fully represented in milestone verification evidence.

Purpose: Close the remaining verification-source evidence gaps affecting MIGR-02 and UX requirements while preserving cross-phase contract traceability.
Output: `04-VERIFICATION.md`, `05-VERIFICATION.md`, and `06-VERIFICATION.md`.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/v1.0-MILESTONE-AUDIT.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-end-to-end-react-workflow-cutover-01-SUMMARY.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-end-to-end-react-workflow-cutover-02-SUMMARY.md
@.planning/phases/05-reliability-ux-stability/05-reliability-ux-stability-01-SUMMARY.md
@.planning/phases/05-reliability-ux-stability/05-reliability-ux-stability-02-SUMMARY.md
@.planning/phases/06-generated-image-contract-parity/06-generated-image-contract-parity-01-SUMMARY.md
@.planning/phases/06-generated-image-contract-parity/06-generated-image-contract-parity-02-SUMMARY.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-UAT.md
@.planning/phases/05-reliability-ux-stability/05-UAT.md
@.planning/phases/06-generated-image-contract-parity/06-UAT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Backfill verification reports for Phase 4 and Phase 5</name>
  <files>.planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md, .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md</files>
  <read_first>.planning/ROADMAP.md, .planning/REQUIREMENTS.md, .planning/phases/04-end-to-end-react-workflow-cutover/*-PLAN.md, .planning/phases/04-end-to-end-react-workflow-cutover/*-SUMMARY.md, .planning/phases/04-end-to-end-react-workflow-cutover/04-UAT.md, .planning/phases/05-reliability-ux-stability/*-PLAN.md, .planning/phases/05-reliability-ux-stability/*-SUMMARY.md, .planning/phases/05-reliability-ux-stability/05-UAT.md, $HOME/.config/opencode/get-shit-done/templates/verification-report.md</read_first>
  <action>Create `04-VERIFICATION.md` and `05-VERIFICATION.md` in full template format. In Phase 4 requirements coverage, include `MIGR-02` with evidence sourced from routed navigation and selected-pattern persistence summaries. In Phase 5 requirements coverage, include `UX-01` and `UX-02` with evidence from explicit loading/success/error lifecycle and latest-response-wins behavior. Include anti-pattern scans and status justification (no implied pass without evidence).</action>
  <acceptance_criteria>
    - `04-VERIFICATION.md` includes a requirement row for `MIGR-02`.
    - `05-VERIFICATION.md` includes requirement rows for `UX-01` and `UX-02`.
    - Both files include `## Key Link Verification` and `## Requirements Coverage` sections.
  </acceptance_criteria>
  <verify>
    <automated>test -f .planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md && test -f .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md && rg "\| MIGR-02|\| UX-01|\| UX-02|^status: (passed|gaps_found|human_needed)$" .planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md</automated>
  </verify>
  <done>Phase 4 and 5 verification artifacts exist with explicit requirement and wiring evidence needed for milestone traceability.</done>
</task>

<task type="auto">
  <name>Task 2: Backfill verification report for Phase 6 contract parity evidence</name>
  <files>.planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md</files>
  <read_first>.planning/ROADMAP.md, .planning/v1.0-MILESTONE-AUDIT.md, .planning/phases/06-generated-image-contract-parity/*-PLAN.md, .planning/phases/06-generated-image-contract-parity/*-SUMMARY.md, .planning/phases/06-generated-image-contract-parity/06-UAT.md, $HOME/.config/opencode/get-shit-done/templates/verification-report.md</read_first>
  <action>Create `06-VERIFICATION.md` capturing generated-image contract parity verification from both unit/integration and routed-flow evidence. Include the backend raw `png_data` to frontend normalization link in Key Link Verification so this phase has verification-source evidence, not summary-only evidence. Use the same frontmatter/status conventions as other backfilled reports.</action>
  <acceptance_criteria>
    - `06-VERIFICATION.md` exists with required frontmatter keys and allowed status values.
    - `06-VERIFICATION.md` includes a key-link row mentioning backend `png_data` to frontend rendering/normalization.
    - `06-VERIFICATION.md` includes a completed verification metadata section.
  </acceptance_criteria>
  <verify>
    <automated>test -f .planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md && rg "^status: (passed|gaps_found|human_needed)$|png_data|## Verification Metadata" .planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md</automated>
  </verify>
  <done>Phase 6 now has a formal verification artifact, closing verification-source gaps for contract-parity evidence.</done>
</task>

</tasks>

<verification>
- Confirm all three verification files for phases 4–6 exist and include required coverage tables.
- Confirm phase 6 includes explicit `png_data` normalization wiring evidence.
</verification>

<success_criteria>
- MIGR-02, UX-01, and UX-02 have verification-source evidence in phase artifacts.
- Phase 6 contract parity is represented in verification artifacts, enabling complete cross-phase evidence set.
</success_criteria>

<output>
After completion, create `.planning/phases/07-verification-artifact-backfill/07-verification-artifact-backfill-02-SUMMARY.md`
</output>
