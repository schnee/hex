---
phase: 2
slug: overlay-interaction-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 2 — Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Testing Library |
| **Config file** | `frontend/vite.config.ts` |
| **Quick run command** | `cd frontend && npm run test:run -- <target-test-file>` |
| **Full suite command** | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` |
| **Estimated runtime** | ~20-45 seconds |

## Sampling Rate

- **After every task commit:** run that task's `<verify><automated>` command
- **After every plan wave:** run `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
- **Before `/gsd-verify-work`:** rerun all phase-scoped overlay tests
- **Max feedback latency:** 60 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | OVR-01 | component | `cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx` | ✅ | ⬜ |
| 02-01-02 | 01 | 1 | OVR-01 | component | `cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx` | ✅ | ⬜ |
| 02-02-01 | 02 | 1 | OVR-02, OVR-05 | component | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` | ✅ | ⬜ |
| 02-02-02 | 02 | 1 | OVR-02, OVR-05 | component | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` | ✅ | ⬜ |
| 02-03-01 | 03 | 2 | OVR-01, OVR-02, OVR-05 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ |
| 02-03-02 | 03 | 2 | OVR-01, OVR-02, OVR-05 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ |

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual clarity of selection handles on real browser drag/resize | OVR-05 | Pixel-level affordance quality is visual | Run app, select overlay, verify visible handles and selected state ring remain obvious during drag/resize |

## Validation Sign-Off

- [x] All tasks include `<automated>` verify commands
- [x] Sampling continuity defined
- [x] No watch-mode commands in verify gates
- [x] Feedback latency < 60s target

**Approval:** pending
