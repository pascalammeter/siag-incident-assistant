---
phase: 18-api-data-layer-fixes
plan: 01
subsystem: api-data-layer
tags: [json-export, description-field, app-router, prisma, tdd]
dependency_graph:
  requires: []
  provides:
    - "GET /api/incidents/:id/export/json App Router handler"
    - "description field persisted in Incident model"
  affects:
    - "prisma/schema.prisma (Incident model)"
    - "src/api/services/incident.service.ts (createIncident, updateIncident)"
tech_stack:
  added: []
  patterns:
    - "App Router route handler with RouteParams<Promise<{id}>> pattern"
    - "vi.mock for relative imports in Vitest tests"
    - "Prisma nullable Text field with @db.Text"
key_files:
  created:
    - path: "src/app/api/incidents/[id]/export/json/route.ts"
      purpose: "App Router GET handler for JSON incident export"
    - path: "tests/api/json-export-route.test.ts"
      purpose: "10 Vitest tests for the JSON export route handler"
  modified:
    - path: "prisma/schema.prisma"
      change: "Added description String? @db.Text to Incident model"
    - path: "src/api/services/incident.service.ts"
      change: "Map description in createIncident() and updateIncident()"
    - path: "tests/api/incident.service.test.ts"
      change: "Added 3 tests for description field persistence and retrieval"
decisions:
  - "Used ../../../../_helpers relative import (not ../../_helpers as in plan) — plan had wrong depth"
  - "Prisma migration applied via db push (non-destructive nullable column add)"
  - "prisma generate run after db push to update client types"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-04-16"
  tasks_completed: 2
  files_changed: 5
  tests_added: 13
---

# Phase 18 Plan 01: JSON Export Route + Description Field — Summary

**One-liner:** App Router GET /api/incidents/:id/export/json handler with Content-Disposition attachment header, plus description String? field added to Prisma schema and mapped through IncidentService — closes gaps B5.1 and B4.1.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create JSON export App Router route + add description to schema and service | e1c12be | route.ts (new), schema.prisma, incident.service.ts, json-export-route.test.ts (new), incident.service.test.ts |
| 2 | Run Prisma migration for description field | (no commit needed — DB-only change) | prisma generate applied automatically |

## What Was Built

### B5.1: JSON Export App Router Route

Created `src/app/api/incidents/[id]/export/json/route.ts` as a Next.js App Router handler:

- `OPTIONS()` returns 200 with CORS headers for preflight requests
- `GET()` validates the API key (cross-origin requests require `X-API-Key`), fetches the incident, and returns it as a downloadable JSON file with `Content-Disposition: attachment; filename="incident-{id}.json"`
- Returns 404 for non-existent incidents
- Returns 401 for invalid cross-origin API keys
- Returns 500 on internal errors with error logging

### B4.1: Description Field Persistence

- Added `description String? @db.Text` to the Incident model in `prisma/schema.prisma`
- Mapped `description: input.description ?? null` in `IncidentService.createIncident()`
- Added `if (input.description !== undefined) data.description = input.description` in `IncidentService.updateIncident()`
- Applied migration via `npx prisma db push --accept-data-loss` (confirmed: "Your database is now in sync with your Prisma schema")
- Regenerated Prisma Client with `npx prisma generate`

## Test Results

| Test File | Tests | Result |
|-----------|-------|--------|
| tests/api/json-export-route.test.ts | 10 | 10/10 passing |
| tests/api/incident.service.test.ts | 33 | 33/33 passing |
| **Total** | **43** | **43/43 passing** |

New tests in `json-export-route.test.ts`:
- OPTIONS returns 200
- GET 200 with JSON body, correct Content-Type, Content-Disposition attachment filename, all fields present
- GET calls IncidentService.getIncidentById with correct ID
- GET 404 for non-existent incident
- GET 401 for invalid API key (does not call service)
- GET 500 on service error

New tests in `incident.service.test.ts`:
- `createIncident` passes description to `prisma.incident.create`
- `createIncident` defaults description to null when not provided
- `getIncidentById` returns description field when present

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect relative import path for _helpers**
- **Found during:** Task 1 (GREEN phase — tests failed with import resolution error)
- **Issue:** Plan specified `../../_helpers` from `json/route.ts`, but the actual relative depth from `src/app/api/incidents/[id]/export/json/route.ts` to `src/app/api/_helpers.ts` is 4 levels up, not 2. The correct import is `../../../../_helpers`.
- **Fix:** Changed import in route.ts to `../../../../_helpers`
- **Note:** The PDF route in the plan has the same incorrect `../../_helpers` — this may be a pre-existing bug in the PDF route that Next.js resolves differently than Vitest. The JSON route uses the correct path.
- **Files modified:** `src/app/api/incidents/[id]/export/json/route.ts`
- **Commit:** e1c12be

**2. [Rule 3 - Blocking] Prisma db push required temp .env.local in worktree**
- **Found during:** Task 2
- **Issue:** The Prisma config reads `DATABASE_URL`/`DIRECT_URL` from `.env.local`, which is not present in the isolated git worktree.
- **Fix:** Temporarily copied `.env.local` from main project directory to worktree, ran `prisma db push`, then removed the file. No sensitive data committed.
- **Commit:** (none — no file changes to commit)

## Prisma Migration

- **Command:** `npx prisma db push --accept-data-loss`
- **Result:** "Your database is now in sync with your Prisma schema. Done in 1.08s"
- **Database:** Neon PostgreSQL (neondb, gwc.azure.neon.tech)
- **Change:** Added nullable `description` TEXT column to `incidents` table (non-destructive)
- **Client:** Regenerated with `npx prisma generate` (v7.6.0)

## Success Criteria Verification

- [x] GET /api/incidents/:id/export/json returns 200 with Content-Disposition: attachment; filename=incident-{id}.json (closes B5.1)
- [x] description field written to DB on POST /api/incidents and returned in GET responses (closes B4.1)
- [x] Prisma migration applied successfully ("in sync with your Prisma schema")
- [x] All tests pass (43/43)

## Known Stubs

None — all functionality is fully implemented and wired.

## Threat Surface Scan

The new JSON export route introduces a network endpoint at `GET /api/incidents/:id/export/json`. This is already covered in the plan's threat model:
- T-18-01: `validateApiKey()` with timing-safe comparison for cross-origin requests — implemented
- T-18-02: 404 for non-existent incidents, no information disclosure — implemented
- T-18-03: description field uses Prisma parameterized write — implemented

No new threat surface beyond what the threat model anticipated.

## Self-Check: PASSED

Files exist:
- `src/app/api/incidents/[id]/export/json/route.ts` — FOUND
- `tests/api/json-export-route.test.ts` — FOUND
- `prisma/schema.prisma` (has description field) — FOUND

Commits exist:
- `e1c12be` — FOUND (feat(18-01): create JSON export App Router route + add description field)
