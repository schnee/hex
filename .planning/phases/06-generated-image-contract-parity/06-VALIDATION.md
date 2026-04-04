---
phase: 6
slug: generated-image-contract-parity
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Pytest |
| **Config file** | `frontend/vite.config.ts`, `backend/pytest.ini` |
| **Quick run command** | `cd frontend && npm run test:run -- tests/services/test_apiClientGeneratedImageContract.test.ts` |
| **Full suite command** | `cd frontend && npm run test:run -- tests/services/test_apiClientGeneratedImageContract.test.ts tests/integration/test_generated_image_contract_flow.test.tsx && cd ../backend && pytest tests/contract/test_patterns_generate.py -k png_data -x` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MIGR-03 | unit/contract | `cd backend && pytest tests/contract/test_patterns_generate.py -k png_data -x` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | GEN-02 | unit | `cd frontend && npm run test:run -- tests/services/test_apiClientGeneratedImageContract.test.ts` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | MIGR-01 | integration | `cd frontend && npm run test:run -- tests/integration/test_generated_image_contract_flow.test.tsx` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | GEN-03 | integration | `cd frontend && npm run test:run -- tests/integration/test_generated_image_contract_flow.test.tsx` | ✅ | ⬜ pending |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Routed generate → overlay visual sanity check with running backend | MIGR-01, MIGR-03 | Optional visual confidence pass after automated tests | Run backend + frontend dev servers, generate pattern, open overlay route, verify both preview and overlay image render without broken image icons |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
