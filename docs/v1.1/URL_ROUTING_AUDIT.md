# URL Routing Audit — v1.0 → v1.1 Backwards Compatibility

**Audit Date:** 2026-04-08
**Scope:** All URL routes from v1.0 verified against v1.1 Next.js App Router structure

---

## Frontend Routes

| Route | v1.0 Status | v1.1 Status | File | Notes |
|-------|-------------|-------------|------|-------|
| `/` | Active | Active ✅ | `src/app/page.tsx` | Wizard shell (WizardShell component) |
| `/incidents` | New in v1.1 | Active ✅ | `src/app/incidents/page.tsx` | Incident list (IncidentList component) |

**v1.0 had a single-page wizard with localStorage.** There were no additional URL routes in v1.0 beyond `/`. The `/incidents` page is a new v1.1 addition and does not break backwards compatibility.

### URL Compatibility: VERIFIED ✅

- `/` still loads the wizard (WizardShell) — no change from v1.0
- No deprecated URLs exist that would return 404 to v1.0 users
- No `vercel.json` redirects are needed — Next.js App Router handles routing natively

---

## API Routes (v1.1 New)

These are new routes added in v1.1. They did not exist in v1.0, so there are no backwards compatibility concerns.

| Method | Route | Auth Required | Description |
|--------|-------|--------------|-------------|
| GET | `/api/health` | No | Health check (uptime, DB ping) |
| GET | `/api/incidents` | X-API-Key | List all incidents (paginated) |
| POST | `/api/incidents` | X-API-Key | Create incident |
| GET | `/api/incidents/:id` | X-API-Key | Get single incident by UUID |
| PATCH | `/api/incidents/:id` | X-API-Key | Partial update |
| DELETE | `/api/incidents/:id` | X-API-Key | Soft delete (sets deletedAt) |
| OPTIONS | `/api/incidents` | No | CORS preflight |
| OPTIONS | `/api/incidents/:id` | No | CORS preflight |

---

## Wizard Step Navigation

v1.0 used client-side step navigation (no URL parameter for step). v1.1 maintains the same pattern — wizard steps are managed in React state, not in the URL. This means:

- Bookmarked `/` always loads Step 0 (intro screen) — same as v1.0
- There are no step-specific URLs that could break

---

## Redirects & Rewrites

- **No `vercel.json` file** — not needed; Next.js App Router handles all routing
- **No deprecated URL patterns** to redirect from v1.0
- **Permanent redirects (301):** None required

---

## Summary

| Check | Result |
|-------|--------|
| All v1.0 URLs accessible | ✅ Pass (`/` still works) |
| No new 404 routes introduced | ✅ Pass |
| Wizard workflow URL unchanged | ✅ Pass (client-side step state) |
| API routes backwards compatible | ✅ N/A (new in v1.1) |
| Redirects needed | None |
