---
phase: 8
slug: api-implementation
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 8 is **complete**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- --run api/` |
| **Full suite command** | `npm run test -- --run` |

---

## Sampling Rate

- **After every task commit:** `npm run test -- --run __tests__/api/ --reporter=verbose`
- **After every plan wave:** `npm run test -- --run`
- **Phase gate:** All tests green before `/gsd-verify-work`

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| B4.1 | POST /api/incidents returns 201 with valid body | integration | `npm run test -- --run __tests__/api/incidents.post.test.ts` | ✅ green |
| B4.2 | GET /api/incidents filters by type/severity | integration | `npm run test -- --run __tests__/api/incidents.get.test.ts` | ✅ green |
| B4.3 | GET /api/incidents/:id returns 200 | unit | `npm run test -- --run __tests__/api/incidents.get-by-id.test.ts` | ✅ green |
| B4.4 | PATCH /api/incidents/:id updates partial fields | integration | `npm run test -- --run __tests__/api/incidents.patch.test.ts` | ✅ green |
| B4.5 | DELETE /api/incidents/:id soft-deletes | integration | `npm run test -- --run __tests__/api/incidents.delete.test.ts` | ✅ green |
| B5.1 | POST /api/incidents/:id/export/json returns JSON | integration | `npm run test -- --run __tests__/api/export.json.test.ts` | ✅ green |
| B5.2 | POST /api/incidents/:id/export/pdf returns PDF | integration | `npm run test -- --run __tests__/api/export.pdf.test.ts` | ✅ green |
| B7.1 | Zod schema validates required fields | unit | `npm run test -- --run __tests__/lib/schemas.test.ts` | ✅ green |
| B7.3 | Validation error returns 400 with field details | unit | `npm run test -- --run __tests__/middleware/validate.test.ts` | ✅ green |
| B7.4 | HTTP status codes correct (400/404/500) | integration | `npm run test -- --run __tests__/api/errors.test.ts` | ✅ green |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gap files created (all `__tests__/api/*.test.ts` and `__tests__/lib/*.test.ts`)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete — all API implementation tests green, phase verified
