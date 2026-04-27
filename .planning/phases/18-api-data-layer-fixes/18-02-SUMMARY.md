---
phase: 18-api-data-layer-fixes
plan: 02
subsystem: api-data-layer
tags: [soft-delete, prisma, tdd, security, b4.3, b4.4]
dependency_graph:
  requires:
    - "18-01: description field + JSON export route"
  provides:
    - "deletedAt: null guard in getIncidentById"
    - "deletedAt: null guard in updateIncident"
  affects:
    - "src/api/services/incident.service.ts"
    - "tests/api/incident.service.test.ts"
tech_stack:
  added: []
  patterns:
    - "Prisma findFirst with deletedAt: null filter for soft-delete guard"
    - "TDD RED/GREEN cycle for service-layer correctness bugs"
key_files:
  created: []
  modified:
    - path: "src/api/services/incident.service.ts"
      change: "Added deletedAt: null to findFirst where clause in getIncidentById() and updateIncident()"
    - path: "tests/api/incident.service.test.ts"
      change: "Added 4 new tests for soft-delete guard behavior; updated 1 existing test expectation"
decisions:
  - "deleteIncident() intentionally left without deletedAt filter — re-deleting an already-deleted incident is a harmless no-op (sets deletedAt again)"
  - "Updated existing test 'should call findFirst with correct ID' to include deletedAt: null in where expectation, consistent with new guard behavior"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-16"
  tasks_completed: 1
  files_changed: 2
  tests_added: 4
---

# Phase 18 Plan 02: Soft-Delete Guards for getIncidentById and updateIncident — Summary

**One-liner:** Added `deletedAt: null` filter to `getIncidentById()` and `updateIncident()` in IncidentService, preventing information disclosure (B4.3) and tamper-through-deleted-incident attacks (B4.4) — implemented with full TDD RED/GREEN cycle.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Add failing tests for soft-delete guards | cc7e50a | tests/api/incident.service.test.ts |
| 1 (GREEN) | Implement deletedAt: null guards in service | ce24dc2 | src/api/services/incident.service.ts |

## What Was Built

### B4.3: getIncidentById Soft-Delete Guard

Before this plan, `getIncidentById()` called `prisma.incident.findFirst({ where: { id } })` — no `deletedAt` filter. This meant soft-deleted incidents were still returned via `GET /api/incidents/:id`, leaking data that was supposed to be hidden.

After:
```typescript
static async getIncidentById(id: string) {
  const incident = await prisma.incident.findFirst({
    where: {
      id,
      deletedAt: null,  // <-- guard added
    },
  });
  return incident;
}
```

When the DB row has `deletedAt` set, `findFirst` with `deletedAt: null` returns `null`, and the App Router handler converts `null` to HTTP 404.

### B4.4: updateIncident Soft-Delete Guard

Before this plan, `updateIncident()` called `prisma.incident.findFirst({ where: { id } })` — no `deletedAt` filter. This meant a client could `PATCH /api/incidents/:id` on a soft-deleted incident and modify it.

After:
```typescript
static async updateIncident(id: string, input: UpdateIncidentInput) {
  const incident = await prisma.incident.findFirst({
    where: {
      id,
      deletedAt: null,  // <-- guard added
    },
  });
  if (!incident) return null;
  // ... rest unchanged
}
```

When `findFirst` returns `null` (soft-deleted incident), the method returns `null` early without calling `prisma.incident.update`, and the App Router handler converts `null` to HTTP 404.

### deleteIncident() — Intentionally Unchanged

`deleteIncident()` does NOT have a `deletedAt: null` filter. This is by design (threat T-18-07 accepted). Re-deleting an already-deleted incident is a harmless no-op: it simply sets `deletedAt` to the current timestamp again.

### listIncidents() — Unchanged, No Regression

`listIncidents()` already had `deletedAt: null` in its where clause. No change needed; verified by existing test `should exclude soft-deleted incidents (deletedAt = null)`.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test commit) | cc7e50a | PASSED — 4 tests failed as expected before implementation |
| GREEN (feat commit) | ce24dc2 | PASSED — all 37 tests pass after implementation |
| REFACTOR | not needed | No refactoring required |

## Test Results

| Test File | Tests Before | Tests After | Result |
|-----------|-------------|-------------|--------|
| tests/api/incident.service.test.ts | 33 | 37 | 37/37 passing |

New tests added:
- `getIncidentById > should return null for soft-deleted incident (deletedAt set)` — verifies null return and correct where clause
- `getIncidentById > should include deletedAt: null in findFirst where clause` — verifies guard is always applied
- `updateIncident > should return null for soft-deleted incident (deletedAt set)` — verifies null return and no update call
- `updateIncident > should include deletedAt: null in findFirst where clause for update` — verifies guard is always applied

Updated test:
- `getIncidentById > should call findFirst with correct ID` — expectation updated from `where: { id }` to `where: { id, deletedAt: null }`

## Deviations from Plan

None — plan executed exactly as written. The TDD steps, service changes, and test updates all matched the plan's instructions precisely.

## Success Criteria Verification

- [x] GET /api/incidents/:id returns 404 for soft-deleted incidents (closes B4.3) — `getIncidentById` returns null, App Router handler converts to 404
- [x] PATCH /api/incidents/:id returns 404 for soft-deleted incidents (closes B4.4) — `updateIncident` returns null, App Router handler converts to 404
- [x] Non-deleted incidents still returned/updated correctly — existing tests pass (no regression)
- [x] deleteIncident() unchanged — intentional design, existing tests pass
- [x] listIncidents() unchanged — already had deletedAt: null, no regression
- [x] All 37 tests pass

## Known Stubs

None — all functionality is fully implemented.

## Threat Surface Scan

No new network endpoints or auth paths introduced. This plan only modifies existing service-layer filter logic. The threat mitigations in the plan's threat model are fully implemented:
- T-18-05 (Information Disclosure): `deletedAt: null` filter in `getIncidentById` prevents soft-deleted data from leaking via GET
- T-18-06 (Tampering): `deletedAt: null` filter in `updateIncident` prevents modification of soft-deleted incidents via PATCH
- T-18-07 (Elevation of Privilege): `deleteIncident` accepted — no filter intentional

No new threat surface beyond what the threat model anticipated.

## Self-Check: PASSED

Files exist:
- `src/api/services/incident.service.ts` — FOUND (contains deletedAt: null in getIncidentById and updateIncident)
- `tests/api/incident.service.test.ts` — FOUND (contains 37 tests, 4 new soft-delete guard tests)

Commits exist:
- `cc7e50a` — FOUND (test(18-02): add failing tests for soft-delete guards)
- `ce24dc2` — FOUND (feat(18-02): add deletedAt: null guards to getIncidentById and updateIncident)

grep verification:
```
src/api/services/incident.service.ts:32:        deletedAt: null,  (getIncidentById)
src/api/services/incident.service.ts:43:        deletedAt: null,  (updateIncident)
src/api/services/incident.service.ts:113:      deletedAt: null,   (listIncidents -- pre-existing)
```

deleteIncident at lines 74-93 has NO deletedAt filter — correct by design.
