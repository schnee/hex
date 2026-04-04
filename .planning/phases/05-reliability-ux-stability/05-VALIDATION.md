---
phase: 5
slug: reliability-ux-stability
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `frontend/vite.config.ts` |
| **Quick run command** | `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx` |
| **Full suite command** | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx`
- **After every plan wave:** Run `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | UX-01 | component integration | `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | UX-01 | component integration | `cd frontend && npm run test:run -- tests/components/test_WallImageUploader.test.tsx` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | UX-01 | component integration | `cd frontend && npm run test:run -- tests/components/test_PatternGenerator.test.tsx tests/components/test_WallImageUploader.test.tsx` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | UX-01, UX-02 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | UX-02 | integration | `cd frontend && npm run test:run -- tests/integration/test_overlay_flow.test.tsx tests/integration/test_pattern_flow.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Recovery messaging readability in browser layout | UX-01 | Copy clarity and visual prominence are subjective | Run `cd frontend && npm run dev`, perform generate/upload/calculate failures and verify guidance is readable without clipping at 1280px width |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
