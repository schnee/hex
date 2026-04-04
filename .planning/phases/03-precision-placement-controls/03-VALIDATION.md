---
phase: 3
slug: precision-placement-controls
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `frontend/vite.config.ts` |
| **Quick run command** | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` |
| **Full suite command** | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npm run test:run -- <task-specific test file>`
- **After every plan wave:** Run `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | OVR-03 | component | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` | ✅ | ⬜ pending |
| 3-01-02 | 01 | 1 | OVR-03 | component | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 2 | OVR-04 | component | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx` | ✅ | ⬜ pending |
| 3-02-02 | 02 | 2 | OVR-04 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 3 | OVR-03, OVR-04 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ pending |
| 3-03-02 | 03 | 3 | OVR-03, OVR-04 | regression | `cd frontend && npm run test:run -- tests/components/test_OverlayCanvas.test.tsx tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Overlay placement confidence under different zoom levels | OVR-04 | Human visual confidence check | Run app locally, upload wall image, zoom in/out and pan, confirm overlay remains placeable and selected-state visuals remain clear |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
