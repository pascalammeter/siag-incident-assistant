---
phase: 18-api-data-layer-fixes
fixed_at: 2026-04-16T13:17:30Z
review_path: .planning/phases/18-api-data-layer-fixes/18-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 18: Code Review Fix Report

**Fixed at:** 2026-04-16T13:17:30Z
**Source review:** .planning/phases/18-api-data-layer-fixes/18-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Header Injection via Unsanitised `id` in Content-Disposition

**Files modified:** `src/app/api/incidents/[id]/export/json/route.ts`, `tests/api/json-export-route.test.ts`
**Commit:** a99e613
**Applied fix:** Added `UUID_REGEX` constant at module scope and an early-return guard in `GET` that calls `errorResponse('Invalid incident ID format', 400)` when `id` does not match the UUID pattern. Updated all happy-path tests to use the valid UUID `123e4567-e89b-12d3-a456-426614174000` (introduced as `VALID_UUID` constant) and added a new `400 for non-UUID incident ID` describe block with two tests: one asserting the 400 status and one asserting `IncidentService.getIncidentById` is never called for malformed IDs.

### WR-01: TOCTOU Race Condition in `updateIncident`

**Files modified:** `src/api/services/incident.service.ts`, `tests/api/incident.service.test.ts`
**Commit:** 165fff5
**Applied fix:** Replaced the two-step `findFirst` + `update` pattern in `updateIncident` with a single atomic `prisma.incident.updateMany({ where: { id, deletedAt: null }, data })` call. If `result.count === 0` the method returns `null`. Otherwise it fetches the updated record via `prisma.incident.findFirst({ where: { id } })` for the response body. Updated all `updateIncident` tests to mock `prisma.incident.updateMany` (added to the mock object) instead of `findFirst`+`update`, and revised assertions to check `updateMany` is called with `deletedAt: null` in the where clause.

### WR-02: `deleteIncident` Allows Double-Deletion of Already-Deleted Records

**Files modified:** `src/api/services/incident.service.ts`, `tests/api/incident.service.test.ts`
**Commit:** 22714a9
**Applied fix:** Added `deletedAt: null` to the `findFirst` where clause in `deleteIncident` so re-deleting an already-soft-deleted record returns `null` without overwriting the original `deletedAt` timestamp. Updated the test "should call findFirst to check if incident exists" (renamed to "should call findFirst with deletedAt: null to prevent double-deletion") to assert the guard is present in the where clause.

### WR-03: Filter Values in `listIncidents` Not Validated Before Passing to Prisma

**Files modified:** `src/api/services/incident.service.ts`, `tests/api/incident.service.test.ts`
**Commit:** 8e5a024
**Applied fix:** Imported `IncidentTypeSchema` and `SeveritySchema` from the schema module and built `VALID_INCIDENT_TYPES` and `VALID_SEVERITIES` Sets from their `.options` arrays. Added Set membership guards (`VALID_INCIDENT_TYPES.has(filters.type)` and `VALID_SEVERITIES.has(filters.severity)`) before assigning to the Prisma `where` clause — unknown values are silently ignored rather than passed to the database. Added two new tests asserting that invalid `type` and `severity` values are not included in the Prisma query.

---

_Fixed: 2026-04-16T13:17:30Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
