---
phase: 18-api-data-layer-fixes
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - prisma/schema.prisma
  - src/api/services/incident.service.ts
  - src/app/api/incidents/[id]/export/json/route.ts
  - tests/api/incident.service.test.ts
  - tests/api/json-export-route.test.ts
findings:
  critical: 1
  warning: 3
  info: 3
  total: 7
status: issues_found
---

# Phase 18: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This review covers the Phase 18 changes: the `description` field addition to the Prisma schema and `IncidentService`, the `deletedAt: null` soft-delete guards in `getIncidentById()` and `updateIncident()`, the new App Router JSON export route, and the corresponding test files.

The core logic is sound. Prisma parameterised queries prevent SQL injection, `timingSafeEqual` prevents timing-attack API key comparison, and the soft-delete guards are consistent. However, one critical security issue was identified in the JSON export route: the `Content-Disposition` header is populated directly from the URL path parameter `id` without sanitisation, creating a header injection vector. Three warnings surface a logic gap in `updateIncident` (TOCTOU race), a missing `deleteIncident` idempotency guard, and an unvalidated filter input in `listIncidents`. Three informational items cover type safety and test coverage gaps.

---

## Critical Issues

### CR-01: Header Injection via Unsanitised `id` in Content-Disposition

**File:** `src/app/api/incidents/[id]/export/json/route.ts:41`

**Issue:** The `id` parameter—extracted directly from the URL—is interpolated into the `Content-Disposition` header without any sanitisation or validation. An attacker who can craft a request to a route where `id` contains newline characters (e.g. `%0d%0a`) can inject arbitrary HTTP response headers. Although Next.js may strip some characters, relying on framework behaviour for header safety is not sufficient defence-in-depth.

```
const contentDisposition = `attachment; filename="incident-${id}.json"`;
```

An `id` value such as `x%0d%0aX-Injected-Header:%20malicious` would render as:

```
Content-Disposition: attachment; filename="incident-x
X-Injected-Header: malicious.json"
```

**Fix:** Sanitise `id` before embedding it in any header value. UUIDs are the only valid identifier format for this application; reject anything that does not match the UUID pattern.

```typescript
// At the top of the GET handler, after `const { id } = await params;`
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(id)) {
  return errorResponse('Invalid incident ID format', 400);
}

// The Content-Disposition line can then remain as-is, safe in the
// knowledge that `id` contains only hex digits and hyphens.
const contentDisposition = `attachment; filename="incident-${id}.json"`;
```

This simultaneously closes the header injection vector and short-circuits the `IncidentService.getIncidentById` call for malformed IDs, reducing unnecessary database load.

---

## Warnings

### WR-01: TOCTOU Race Condition in `updateIncident`

**File:** `src/api/services/incident.service.ts:40-69`

**Issue:** `updateIncident` performs a `findFirst` (existence check) and then a separate `update` in two discrete round trips. Another concurrent request can delete or modify the record between those two operations, meaning the subsequent `update` will either silently succeed on a soft-deleted record (because the `update` uses `where: { id }` with no `deletedAt` guard) or throw a Prisma `P2025` "record not found" error that bubbles up as an unhandled exception to the caller.

```typescript
// Step 1: guards against soft-deleted
const incident = await prisma.incident.findFirst({ where: { id, deletedAt: null } });
if (!incident) return null;

// Step 2: NO deletedAt guard — can update a record deleted between steps 1 and 2
const updated = await prisma.incident.update({ where: { id }, data });
```

**Fix:** Use a single atomic `updateMany` call (which supports a `where` with `deletedAt: null`) and check the `count` to detect the not-found case. This eliminates the race window entirely.

```typescript
static async updateIncident(id: string, input: UpdateIncidentInput) {
  const data: Partial<...> = {};
  // ... build data object as before ...

  const result = await prisma.incident.updateMany({
    where: { id, deletedAt: null },
    data,
  });

  if (result.count === 0) return null;

  // Fetch and return the updated record for the response body
  return prisma.incident.findFirst({ where: { id } });
}
```

Alternatively, wrap both operations in a `prisma.$transaction()` if the two-step fetch-then-update pattern must be preserved.

### WR-02: `deleteIncident` Allows Double-Deletion of Already-Deleted Records

**File:** `src/api/services/incident.service.ts:75-95`

**Issue:** The `findFirst` existence check in `deleteIncident` does not include `deletedAt: null`, so a record that was already soft-deleted can be "deleted" a second time, overwriting the original `deletedAt` timestamp with a newer one. This corrupts the audit trail, which is a meaningful concern in an incident-management context where timestamp integrity is important.

```typescript
// Missing deletedAt: null guard — matches soft-deleted records too
const incident = await prisma.incident.findFirst({ where: { id } });
```

The corresponding test at line 846 asserts `findFirst` is called with `where: { id: 'test-id' }` (no `deletedAt: null`), confirming this is intentional behaviour — but it is unsafe for an audit trail.

**Fix:** Add `deletedAt: null` to the check, and treat an already-deleted record as not found (return `null` or a 404 upstream):

```typescript
const incident = await prisma.incident.findFirst({
  where: { id, deletedAt: null },
});
```

Update the corresponding test expectation to include the guard.

### WR-03: Filter Values in `listIncidents` Are Not Validated Before Being Passed to Prisma

**File:** `src/api/services/incident.service.ts:116-121`

**Issue:** `listIncidents` accepts `filters.type` and `filters.severity` as raw strings and passes them directly into the Prisma `where` clause without validating them against the allowed enum values. While Prisma's parameterised queries prevent SQL injection, unvalidated enum values produce unhelpful or misleading 200 responses (empty result sets) when a caller passes a typo or unsupported value, rather than a proper 400 error. The issue is compounded because the `IncidentTypeSchema` enum includes `'datenverlust'` (a German alias) while the DB column stores `'data_loss'` — a mismatch that the service layer currently does not resolve.

```typescript
if (filters?.type) {
  where.incident_type = filters.type; // No validation — any string accepted
}
```

**Fix:** Validate `filters.type` against `IncidentTypeSchema` (or a dedicated enum) at the service boundary, or ensure the route handler passes only pre-validated values from the Zod `ListIncidentsQuerySchema`. The `datenverlust`/`data_loss` alias mismatch should also be resolved by normalising at the route layer before reaching the service.

---

## Info

### IN-01: `data` Object Typed as `any` in `updateIncident`

**File:** `src/api/services/incident.service.ts:51`

**Issue:** The local `data` accumulator object is typed as `any`, which disables all TypeScript checking on the fields being assembled for the Prisma `update`. A typo in a field name or an incorrect value type would compile cleanly and produce a Prisma runtime error or silently drop the update.

```typescript
const data: any = {};
```

**Fix:** Use `Prisma.IncidentUpdateInput` (auto-generated by the Prisma client) or construct a `Partial<UpdateIncidentInput>` typed accumulator:

```typescript
import { Prisma } from '@prisma/client';
const data: Prisma.IncidentUpdateInput = {};
```

### IN-02: `createIncident` Test Suite Does Not Assert `description` Is Mapped Correctly on Create (Null Path)

**File:** `tests/api/incident.service.test.ts:282-319`

**Issue:** The "should default description to null when not provided" test at line 282 verifies that `prisma.incident.create` is called with `description: null`, which is correct. However, no test asserts that the `description` field is omitted from the response body (or returned as `null`) when accessing the result. The create mock at line 300 sets `description: null` but the test makes no assertion on `result.description`. This is a minor test coverage gap.

**Fix:** Add an explicit assertion:

```typescript
expect(result.description).toBeNull();
```

### IN-03: JSON Export Route Test Does Not Cover Cache-Control Headers

**File:** `tests/api/json-export-route.test.ts`

**Issue:** The test suite covers status codes, `Content-Type`, `Content-Disposition`, response body fields, auth rejection, and error handling — but does not verify the `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache` headers. For a security-sensitive export endpoint serving potentially confidential incident data, confirming these headers are present is worth asserting.

**Fix:** Add a test in the "200 happy path" describe block:

```typescript
it('returns no-cache Cache-Control header', async () => {
  vi.mocked(IncidentService.getIncidentById).mockResolvedValue(mockIncident as any);
  const request = makeRequest('test-incident-id');
  const params = Promise.resolve({ id: 'test-incident-id' });
  const response = await GET(request, { params });

  expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
  expect(response.headers.get('Pragma')).toBe('no-cache');
});
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
