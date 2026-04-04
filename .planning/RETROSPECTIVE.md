# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 - MVP

**Shipped:** 2026-04-03
**Phases:** 8 | **Plans:** 19 | **Sessions:** 1

### What Was Built
- Migrated core user experience from Streamlit to routed React generator and overlay workspaces.
- Added stable overlay interaction stack: upload, drag/resize/select, zoom/pan, and live backend-authoritative dimensions.
- Closed API contract confidence gaps with generated-image boundary normalization and backend contract-suite reconciliation.

### What Worked
- Phase-by-phase requirement mapping kept migration scope controlled and traceable.
- Contract tests + routed integration tests caught boundary issues early and enabled targeted fixes.

### What Was Inefficient
- Verification and audit artifacts required a dedicated backfill phase instead of being produced consistently during earlier execution.
- Repeated frontend warning debt (React act/router warnings) remained open through multiple phases.

### Patterns Established
- Treat API boundary normalization as an explicit, testable contract layer instead of UI-side ad hoc handling.
- Use requirement-evidence reconciliation (requirements + summaries + verification + UAT) before milestone closeout.

### Key Lessons
1. Long migration efforts benefit from explicit contract-focused phases to prevent confidence gaps at the end.
2. Milestone close should include automated checks that verification artifacts are present before audit to avoid rework.

### Cost Observations
- Model mix: not tracked in artifacts
- Sessions: 1 milestone cycle
- Notable: parallel subagent execution kept planning/execution turnaround fast despite 8-phase scope.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 8 | Introduced verification-artifact backfill + contract-suite reconciliation gates before milestone completion |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | Backend contract suite + frontend integration/UAT | Requirement-level audit coverage for all v1 items | 0 |

### Top Lessons (Verified Across Milestones)

1. Keep API contract assertions aligned to runtime FastAPI semantics (`detail`/422 behavior).
2. Archive and reconciliation workflows must be part of delivery definition-of-done, not post-hoc cleanup.
