---
phase: 08
slug: backend-contract-suite-reconciliation
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-02
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for backend contract-suite reconciliation.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x |
| **Config file** | `backend/pytest.ini` |
| **Quick run command** | `cd backend && pytest tests/contract/test_patterns_generate.py -q` |
| **Full suite command** | `cd backend && pytest tests/contract -q` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for touched suite(s)
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | MIGR-03 | test-infra | `cd backend && pytest tests/contract/test_patterns_generate.py -q` | ✅ | ⬜ pending |
| 08-01-02 | 01 | 1 | MIGR-03 | contract | `cd backend && pytest tests/contract/test_patterns_generate.py -q -k "invalid or png_data"` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 2 | MIGR-03 | contract | `cd backend && pytest tests/contract/test_images_upload.py -q` | ✅ | ⬜ pending |
| 08-02-02 | 02 | 2 | MIGR-03 | contract | `cd backend && pytest tests/contract/test_overlay_calculate.py tests/contract/test_patterns_download.py -q` | ✅ | ⬜ pending |

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
- [x] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
