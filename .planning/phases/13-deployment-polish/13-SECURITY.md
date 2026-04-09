---
phase: 13
slug: deployment-polish
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-10
---

# Phase 13 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Wizard → API | Browser wizard submits incident data to POST /api/incidents via useIncident hook | Incident metadata (type, severity, timestamps, playbook flags) — low sensitivity |
| API → Database | Prisma ORM writes to Neon PostgreSQL | Full incident record — sensitive (regulatory deadlines, contact fields) |
| Client → Toast | Error state surfaced to user via toast notification | Error status only; no raw API error propagated |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-13-05-01 | Input Validation | migration.ts / incident.schema.ts | mitigate | `CreateIncidentInputSchema.parse(body)` at `src/app/api/incidents/route.ts:72` — ZodError returns 400 with sanitized field details only; client `mapIncidentState` is convenience mapping with no trust boundary | closed |
| T-13-05-02 | Race Condition / Double-Submit | Step6Dokumentation.tsx | mitigate | `disabled={isSaving}` bound to `useIncident().isLoading` at line 129; button removed from DOM after `saveSuccess` (line 124) making a second call structurally impossible | closed |
| T-13-05-03 | Information Disclosure | Step6Dokumentation.tsx | accept | Bare `catch {}` with no error variable bound; toast uses hardcoded German literal only; no `error.message` or `response.message` interpolation — raw API errors never exposed to client | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-13-01 | T-13-05-03 | Generic error toast ("Fehler beim Speichern") provides no debugging context to the user. Accepted: the API already logs the error server-side; client-facing message is intentionally vague to avoid information disclosure. Future: structured error codes. | pascalammeter | 2026-04-10 |

---

## Additional Security Coverage (non-threat-registered)

Items implemented in Phase 13 plans with security impact but no new threat surface:

| Area | Evidence | Plan |
|------|----------|------|
| Security headers | `next.config.ts` — `X-Content-Type-Options: nosniff` (line 78), `X-Frame-Options: DENY` (line 82), `Referrer-Policy`, `Permissions-Policy` | 13-02 |
| Secrets management | DATABASE_URL, API_KEY, CORS_ORIGIN stored in Vercel env vars (not in git); `.env.example` documents required vars without values | 13-01 |
| Migration isolation | `migrationService.ts` reads localStorage and calls existing POST /api/incidents — no new auth paths introduced | 13-03 |
| Accessibility | ARIA attrs, skip link, 44px touch targets — no security impact | 13-04 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-10 | 3 | 3 | 0 | gsd-security-auditor (claude-sonnet-4-6) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-10
