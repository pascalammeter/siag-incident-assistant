---
phase: 13
slug: deployment-polish
status: verified
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-10
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for Phase 13: Vercel + Neon deployment, performance optimization, backwards compatibility, UAT, and wizard save-to-API.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/__tests__/step6-save.test.ts tests/lib/migration.test.ts tests/schemas/incident.schema.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30s (unit-only), ~150s (full with integration) |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (unit subset)

---

## Per-Task Verification Map

| Task ID | Plan | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File | Status |
|---------|------|-------------|------------|-----------------|-----------|-------------------|------|--------|
| 13-01-API | 01 | API routes accessible (health, incidents CRUD) | — | CORS + timing-safe X-API-Key validation | integration | `npx vitest run tests/api/incidents.list.test.ts tests/api/incidents.filtering.test.ts` | ✅ | ⚠️ flaky (live DB required) |
| 13-02-PERF | 02 | Pagination max=50 enforced | — | Halved max payload size | unit | `npx vitest run tests/schemas/incident.schema.test.ts` | ✅ | ✅ green |
| 13-02-HEADERS | 02 | Security headers in next.config.ts | — | X-Content-Type-Options, X-Frame-Options: DENY | manual | See Manual-Only table | n/a | ⬜ manual |
| 13-02-INDEXES | 02 | Prisma composite indexes added | — | N/A — schema audit only | manual | `grep -c "@@index" prisma/schema.prisma` | n/a | ⬜ manual |
| 13-03-MIGRATE | 03 | migrationService.ts idempotency + cursor | — | backup before mutations, cursor-based resume | unit | `npx vitest run tests/lib/migrationService.test.ts` | ✅ | ✅ green |
| 13-03-MAPPING | 03 | mapIncidentState 'migration' context populates metadata.tags | — | tags: ['v1.0-migrated'] in migration context | unit | `npx vitest run tests/lib/migration.test.ts` | ✅ | ✅ green |
| 13-04-A11Y | 04 | ARIA attrs on FormField, Header, ThemeToggle | — | WCAG AA — aria-required, aria-invalid, aria-describedby, role=alert, nav landmark, 44px target | unit | `npx vitest run src/__tests__/components/accessibility.test.tsx` | ✅ | ✅ green |
| 13-05-SAVE | 05 | mapIncidentState maps full wizard state to CreateIncidentInput | T-13-05-01 | Server-side Zod schema validates before DB write | unit | `npx vitest run src/__tests__/step6-save.test.ts` | ✅ | ✅ green |
| 13-05-DOUBLE | 05 | Button disabled during isSaving | T-13-05-02 | No concurrent createIncident() calls possible | unit | `npx vitest run src/__tests__/step6-save.test.ts` | ✅ | ✅ green |
| 13-05-ERR | 05 | Error toast uses hardcoded German literal | T-13-05-03 | Raw API errors not exposed to client (accepted risk) | unit | `npx vitest run src/__tests__/step6-save.test.ts` | ✅ | ✅ green |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

New test files created during validation:
- `tests/lib/migrationService.test.ts` — 12 tests for MigrationService (idempotency, backup, cursor, error classification)
- `src/__tests__/components/accessibility.test.tsx` — 16 tests for ARIA attrs (FormField, Header, ThemeToggle)

Fixed tests:
- `tests/lib/migration.test.ts` — fixed mapIncidentState test to pass `'migration'` context (Phase 13-05 added context param)
- `tests/schemas/incident.schema.test.ts` — updated limit boundary from 100→50 (Phase 13-02 changed max pagination)

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Security headers (X-Content-Type-Options, X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy) | Requires running Next.js server; Lighthouse audit covers this | Deploy and run: `curl -I https://siag-incident-assistant.vercel.app` → verify headers present |
| Lighthouse ≥90 (Performance, Accessibility, Best Practices, SEO) | Requires real browser + production URL | Run Chrome DevTools Lighthouse on production URL; see docs/lighthouse/ |
| Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1) | Real user data via Vercel Speed Insights | Check Vercel Analytics dashboard post-deploy |
| Prisma composite indexes (deletedAt, incident_type+deletedAt, severity+deletedAt) | Schema audit only (no DB in CI) | `grep -c "@@index" prisma/schema.prisma` → expect ≥4 indexes |
| API response times <200ms avg, p95 <500ms | Requires live production traffic or k6 load test | See docs/DEVELOPMENT.md performance section for k6 script |
| localStorage auto-migration on first load | E2E browser test; no unit harness for this flow | Open production URL with localStorage containing `siag-wizard-state` → verify migration toast + incidents in list |
| Consultant UAT sign-off (4 incident types, PDF, mobile, compliance) | Human actor required | Follow docs/uat/UAT_CHECKLIST.md; record results in SIGN-OFF.md |
| Prisma integration tests (incidents.filtering, incidents.list, prisma-filtering) | Live Neon DB required in CI (not configured) | Run with `DATABASE_URL` set: `npx vitest run tests/api/` |

---

## Validation Audit Trail

| Audit Date | Gaps Found | Resolved (auto) | Escalated (manual) | Run By |
|------------|-----------|-----------------|-------------------|--------|
| 2026-04-10 | 5 | 4 | 1 | gsd-nyquist-auditor (claude-sonnet-4-6) |

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual-only rationale
- [x] Sampling continuity: unit subset runs in <30s
- [x] No watch-mode flags in commands
- [x] 105 tests passing across 4 Phase 13 test files
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-04-10
