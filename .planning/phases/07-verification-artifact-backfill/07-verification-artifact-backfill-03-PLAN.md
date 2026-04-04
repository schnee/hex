---
phase: 07-verification-artifact-backfill
plan: 03
type: execute
wave: 2
depends_on:
  - 07-verification-artifact-backfill-01
  - 07-verification-artifact-backfill-02
files_modified:
  - .planning/REQUIREMENTS.md
  - .planning/v1.0-MILESTONE-AUDIT.md
autonomous: true
requirements: [MIGR-02, UX-01, UX-02]
must_haves:
  truths:
    - "Requirements targeted by Phase 7 (GEN-01, GEN-04, OVR-01..OVR-05, MIGR-02, UX-01, UX-02) reconcile across requirements, summaries, and verification artifacts."
    - "Milestone audit no longer reports missing `*-VERIFICATION.md` blocker for executed phases."
    - "Audit conclusion is derived from current artifact evidence, not stale pre-backfill text."
  artifacts:
    - path: ".planning/REQUIREMENTS.md"
      provides: "Updated requirement completion state for Phase 7 requirement IDs"
      contains: "**MIGR-02**"
    - path: ".planning/v1.0-MILESTONE-AUDIT.md"
      provides: "Updated audit report referencing newly created verification artifacts"
      contains: "VERIFICATION.md"
  key_links:
    - from: ".planning/phases/*/*-VERIFICATION.md"
      to: ".planning/REQUIREMENTS.md"
      via: "requirement coverage reconciliation"
      pattern: "\| (GEN-01|GEN-04|OVR-01|OVR-02|OVR-03|OVR-04|OVR-05|MIGR-02|UX-01|UX-02)"
    - from: ".planning/REQUIREMENTS.md"
      to: ".planning/v1.0-MILESTONE-AUDIT.md"
      via: "final status narrative and coverage table"
      pattern: "missing verification|Verification Coverage Gate"
---

<objective>
Reconcile requirement and milestone audit artifacts after verification backfill so phase verification evidence, requirement status, and audit conclusions all align.

Purpose: Complete the audit recovery loop by converting new verification reports into updated requirement/audit truth.
Output: Updated `REQUIREMENTS.md` and refreshed `v1.0-MILESTONE-AUDIT.md` reflecting verification-source parity.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/v1.0-MILESTONE-AUDIT.md
@.planning/phases/01-react-pattern-generation/01-VERIFICATION.md
@.planning/phases/02-overlay-interaction-foundation/02-VERIFICATION.md
@.planning/phases/03-precision-placement-controls/03-VERIFICATION.md
@.planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md
@.planning/phases/05-reliability-ux-stability/05-VERIFICATION.md
@.planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reconcile Phase 7 requirement statuses using verification-source evidence</name>
  <files>.planning/REQUIREMENTS.md</files>
  <read_first>.planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/phases/01-react-pattern-generation/01-VERIFICATION.md, .planning/phases/02-overlay-interaction-foundation/02-VERIFICATION.md, .planning/phases/03-precision-placement-controls/03-VERIFICATION.md, .planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md, .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md, .planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md</read_first>
  <action>Update `REQUIREMENTS.md` checkboxes for Phase 7 requirement IDs (`GEN-01`, `GEN-04`, `OVR-01`, `OVR-02`, `OVR-03`, `OVR-04`, `OVR-05`, `MIGR-02`, `UX-01`, `UX-02`) from pending to complete only when corresponding verification rows show satisfied/passed evidence. Keep requirement wording unchanged; only update completion state and traceability status text so it reflects the new verification-source layer.</action>
  <acceptance_criteria>
    - All ten Phase 7 requirement IDs are marked complete in the v1 checklist when verification evidence exists.
    - Traceability table status for those IDs is updated from Pending to Complete.
    - No v2 or out-of-scope requirements are modified.
  </acceptance_criteria>
  <verify>
    <automated>rg "- \[x\] \*\*(GEN-01|GEN-04|OVR-01|OVR-02|OVR-03|OVR-04|OVR-05|MIGR-02|UX-01|UX-02)\*\*" .planning/REQUIREMENTS.md && rg "\| (GEN-01|GEN-04|OVR-01|OVR-02|OVR-03|OVR-04|OVR-05|MIGR-02|UX-01|UX-02) \| Phase 7 \| Complete \|" .planning/REQUIREMENTS.md</automated>
  </verify>
  <done>Phase 7 requirement IDs are fully reconciled in REQUIREMENTS.md with verification-backed completion status.</done>
</task>

<task type="auto">
  <name>Task 2: Refresh milestone audit report to remove missing-verification blocker</name>
  <files>.planning/v1.0-MILESTONE-AUDIT.md</files>
  <read_first>.planning/v1.0-MILESTONE-AUDIT.md, .planning/REQUIREMENTS.md, .planning/phases/01-react-pattern-generation/01-VERIFICATION.md, .planning/phases/02-overlay-interaction-foundation/02-VERIFICATION.md, .planning/phases/03-precision-placement-controls/03-VERIFICATION.md, .planning/phases/04-end-to-end-react-workflow-cutover/04-VERIFICATION.md, .planning/phases/05-reliability-ux-stability/05-VERIFICATION.md, .planning/phases/06-generated-image-contract-parity/06-VERIFICATION.md</read_first>
  <action>Update `.planning/v1.0-MILESTONE-AUDIT.md` so verification coverage sections and final status reflect new phase verification artifacts. Remove stale statements like "No *-VERIFICATION.md file exists" where now false, update requirements score/status matrix based on current verification reports, and keep any still-open non-verification integration issues explicitly documented rather than silently dropped.</action>
  <acceptance_criteria>
    - Audit report no longer claims missing verification docs for phases that now have `*-VERIFICATION.md`.
    - Verification Coverage Gate section references current artifact counts and statuses.
    - Final status rationale matches updated evidence (including any remaining non-verification gaps).
  </acceptance_criteria>
  <verify>
    <automated>rg "No \*-VERIFICATION\.md file exists" .planning/v1.0-MILESTONE-AUDIT.md && exit 1 || true; rg "## Verification Coverage Gate|## Final Status" .planning/v1.0-MILESTONE-AUDIT.md</automated>
  </verify>
  <done>Milestone audit reflects post-backfill truth and no longer fails due to missing verification-source artifacts.</done>
</task>

</tasks>

<verification>
- Confirm requirements and audit files agree with newly created verification artifacts.
- Confirm no stale missing-verification statements remain in audit output.
</verification>

<success_criteria>
- Phase 7 requirement IDs are marked complete with verification-backed evidence.
- Milestone audit no longer reports missing phase verification artifacts as the blocker.
</success_criteria>

<output>
After completion, create `.planning/phases/07-verification-artifact-backfill/07-verification-artifact-backfill-03-SUMMARY.md`
</output>
