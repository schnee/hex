---
phase: 4
slug: end-to-end-react-workflow-cutover
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `frontend/vite.config.ts` |
| **Quick run command** | `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx` |
| **Full suite command** | `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npm run test:run -- <task-specific test file>`
- **After every plan wave:** Run `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | MIGR-02 | integration | `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | MIGR-02 | integration | `cd frontend && npm run test:run -- tests/integration/test_routed_workspace_flow.test.tsx` | ✅ | ✅ green |
| 04-02-01 | 02 | 2 | MIGR-01, MIGR-03 | integration | `cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx` | ✅ | ✅ green |
| 04-02-02 | 02 | 2 | MIGR-01, MIGR-03 | integration | `cd frontend && npm run test:run -- tests/integration/test_pattern_flow.test.tsx tests/integration/test_overlay_flow.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
