---
phase: 7
slug: backend-scaffold-design-system
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 7 is **complete**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 (existing) |
| **Backend tests** | `src/__tests__/api/` |
| **Config file** | `vitest.config.ts` |
| **Quick run** | `npm run test -- src/__tests__/api --run` |
| **Full suite** | `npm run test -- --run` |

---

## Sampling Rate

- **After every task commit:** `npm run test -- src/__tests__/api --run` (~5 sec)
- **After every plan wave:** `npm run test -- --run` (~30 sec)
- **Phase gate:** Full suite green + manual smoke test (Swagger UI loads, can POST incident)

---

## Per-Task Verification Map

| Req | Behavior | Test Type | Automated Command | Status |
|-----|----------|-----------|-------------------|--------|
| B1 | Express server starts + routes resolve | unit | `vitest src/__tests__/api/server.test.ts` | ✅ green |
| B2 | Prisma schema compiles + migrations run locally | integration | `npm run prisma migrate deploy` | ✅ green |
| B3 | Neon connection pool opens/closes without hanging | integration | `vitest src/__tests__/api/prisma.test.ts` | ✅ green |
| B4 | Incident schema validates JSONB playbook structure | unit | `vitest src/__tests__/schemas/incident.test.ts` | ✅ green |
| B5 | Tailwind @theme{} generates CSS variables | smoke | `npm run build && grep "var(--color-siag-red)" out/**/*.css` | ✅ green |
| B6 | Fonts load without error (no 404s) | smoke | Manual browser test | ✅ verified |
| B7 | Swagger UI serves at /api-docs with correct OpenAPI spec | integration | `vitest src/__tests__/api/swagger.test.ts` | ✅ green |
| B8 | Zod validation rejects invalid payloads + accepts valid | unit | `vitest src/__tests__/schemas/incident.test.ts` | ✅ green |
| B9 | CORS headers present on OPTIONS response | integration | `vitest src/__tests__/api/cors.test.ts` | ✅ green |
| B10 | API key auth rejects missing/invalid keys + rate limit blocks 101st request | integration | `vitest src/__tests__/api/auth.test.ts` | ✅ green |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| Swagger UI loads and shows correct schema | B7 | Browser visual check | ✅ passed |
| Fonts load without 404 in network tab | B6 | DevTools network check | ✅ passed |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gap files created (`server.test.ts`, `prisma.test.ts`, `swagger.test.ts`, `cors.test.ts`, `auth.test.ts`, `incident.test.ts`)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete — all backend scaffold tests green, phase verified
