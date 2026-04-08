---
plan: 13-01
phase: 13
status: complete
completed_at: 2026-04-08
---

# 13-01 Summary: Vercel + Neon Production Deployment

## What was built

Converted the v1.1 backend from a standalone Express server to **Vercel Functions** via Next.js App Router API routes. Removed the `output: "export"` static mode that was blocking server-side functionality.

## Key changes

| File | Change |
|------|--------|
| `next.config.ts` | Removed `output: "export"` — enables Vercel Functions |
| `src/app/api/_helpers.ts` | CORS headers + timing-safe X-API-Key validation |
| `src/app/api/health/route.ts` | GET /api/health (no auth) |
| `src/app/api/incidents/route.ts` | GET (list) + POST (create) |
| `src/app/api/incidents/[id]/route.ts` | GET + PATCH + DELETE (soft) |

## Infrastructure state (already provisioned)

- **Neon** `siag-v1.1`: PostgreSQL 17, `Incident` table migrated ✅
  - Pooled: `ep-wandering-dream-a9ir4yrk-pooler.gwc.azure.neon.tech`
  - Direct: `ep-wandering-dream-a9ir4yrk.gwc.azure.neon.tech`
- **Vercel** `siag-incident-assistant`: project live, GitHub auto-deploy active ✅

## Checkpoint — user action required before deployment

Set these env vars in the **Vercel dashboard** → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_DxG7XK5VIhmW@ep-wandering-dream-a9ir4yrk-pooler.gwc.azure.neon.tech/neondb?channel_binding=require&sslmode=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_DxG7XK5VIhmW@ep-wandering-dream-a9ir4yrk.gwc.azure.neon.tech/neondb?sslmode=require` |
| `API_KEY` | Generate: `openssl rand -hex 32` |
| `CORS_ORIGIN` | `https://siag-incident-assistant.vercel.app` |
| `NODE_ENV` | `production` |

After setting env vars: push to main → Vercel auto-deploys.

## Deviations from plan

- Tasks 1 (Neon setup) and 2 (migrations) were already complete from Phase 7 testing
- Used Next.js API routes instead of Express wrapper (cleaner, native Vercel support)
- No `vercel.json` needed — Next.js App Router handles routing natively
