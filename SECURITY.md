# SECURITY.md — SIAG Incident Assistant

**Phase:** 13 — Deployment & Polish (Plans 13-01 through 13-05)
**ASVS Level:** 1
**Audit Date:** 2026-04-10
**Auditor:** gsd-security-auditor (automated)

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-13-05-01 | Input Validation | mitigate | CLOSED | `src/app/api/incidents/route.ts:72` — `CreateIncidentInputSchema.parse(body)` enforces server-side Zod validation before any service call; ZodError returns 400 with sanitized field-level details; client mapping in `src/lib/migration.ts` is convenience only |
| T-13-05-02 | Race Condition / Double-Submit | mitigate | CLOSED | `src/components/wizard/steps/Step6Dokumentation.tsx:129` — `disabled={isSaving}` on "Speichern & Abschliessen" button; `isSaving` sourced from `useIncident().isLoading`; button additionally removed from DOM on `saveSuccess` (line 124) |
| T-13-05-03 | Information Disclosure | accept | CLOSED | See Accepted Risks section below |

---

## Security Headers Verification

Verified in `next.config.ts` (HTML pages route pattern `/((?!_next|api|.*\\..*).*)`):

| Header | Value | Line |
|--------|-------|------|
| X-Content-Type-Options | nosniff | 78 |
| X-Frame-Options | DENY | 82 |
| Referrer-Policy | strict-origin-when-cross-origin | 86 |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | 90 |

---

## Accepted Risks

### T-13-05-03 — Information Disclosure via Error Toast

| Field | Value |
|-------|-------|
| **Threat ID** | T-13-05-03 |
| **Category** | Information Disclosure |
| **Component** | `src/components/wizard/steps/Step6Dokumentation.tsx` |
| **Accepted By** | gsd-security-auditor, Phase 13 threat register |
| **Date Accepted** | 2026-04-10 |
| **Risk Description** | If raw API error messages (e.g., Zod validation details, database error strings) were forwarded to the client toast, internal schema structure or server state could be disclosed to the user. |
| **Mitigation Implemented** | The `catch` block in `handleSave()` uses a bare `catch {}` with no error variable binding. The toast message is the hardcoded German literal `'Fehler beim Speichern. Bitte versuchen Sie es erneut.'` — no `error.message`, `response.message`, or any dynamic API response content is interpolated. Pre-validation error also uses a hardcoded string. Verified at `Step6Dokumentation.tsx:69-74`. |
| **Residual Risk** | Minimal. The server-side `route.ts` logs errors to `console.error` which may appear in Vercel Function logs — access to those logs is restricted to project members. |
| **Review Trigger** | Re-evaluate if error handling is refactored to bind caught errors to a variable and include dynamic content in user-facing messages. |

---

## Unregistered Threat Flags

None. All five SUMMARY.md files (13-01 through 13-05) explicitly report `Threat Flags: None`. No new network endpoints, auth paths, schema trust boundaries, or file access patterns were introduced across any Phase 13 plan.

---

## Scope Notes

- All Phase 13 API routes require `X-API-Key` authentication (timing-safe comparison via `src/app/api/_helpers.ts`). Cache-Control headers on `/api/incidents` do not bypass this requirement — auth is enforced per-request in the route handler before any cached response could be served.
- The `MigrationService` in `src/lib/migrationService.ts` reads localStorage and calls the existing `POST /api/incidents` endpoint — no new attack surface introduced.
- Accessibility improvements in Phase 13-04 (aria attributes, nav landmarks, skip links) are additive HTML attributes with no security implications.
