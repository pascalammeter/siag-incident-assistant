---
phase: 21
plan: 01
completed: true
completed_date: 2026-04-19T19:51:43Z
duration_seconds: 573
task_count: 3
file_count: 2
---

# Phase 21 Plan 01: Add @swagger JSDoc to PDF and JSON Export Routes — Summary

## Objective

Add `@swagger` JSDoc annotations to App Router export routes (PDF and JSON) so the OpenAPI specification correctly documents HTTP methods, response types, and status codes. Completes B6.1/B6.3 requirements by ensuring Swagger/OpenAPI documentation includes all App Router endpoint paths.

**One-liner:** PDF and JSON export endpoints now documented in Swagger UI with correct HTTP methods, status codes, and content-type headers.

## Tasks Completed

| Task | Name | Status | Files | Commit |
|------|------|--------|-------|--------|
| 1 | Add @swagger JSDoc to PDF export route | ✅ DONE | `src/app/api/incidents/[id]/export/pdf/route.ts` | `f589bbc` |
| 2 | Add @swagger JSDoc to JSON export route | ✅ DONE | `src/app/api/incidents/[id]/export/json/route.ts` | `8e911eb` |
| 3 | Verify swagger integration tests pass with content-type assertions | ✅ DONE | `src/__tests__/integration/swagger.integration.test.ts` | `f99894a` |

## Key Artifacts

### 1. PDF Export Route with Swagger JSDoc
**File:** `src/app/api/incidents/[id]/export/pdf/route.ts`

Added `@swagger` JSDoc block documenting:
- Path: `/api/incidents/{id}/export/pdf` (OpenAPI format, not Next.js `[id]` syntax)
- Method: `get` (lowercase)
- Parameter: `id` as uuid format
- Responses:
  - `200`: PDF file generated (content-type: `application/pdf`, format: binary)
  - `404`: Incident not found
  - `500`: PDF generation failed
- x-curl-examples with placeholder API keys (sk_test_abc123...)

### 2. JSON Export Route with Swagger JSDoc
**File:** `src/app/api/incidents/[id]/export/json/route.ts`

Added `@swagger` JSDoc block documenting:
- Path: `/api/incidents/{id}/export/json` (OpenAPI format)
- Method: `get` (lowercase)
- Parameter: `id` as uuid format
- Responses:
  - `200`: JSON file with complete incident data (content-type: `application/json`, schema: `$ref: '#/components/schemas/Incident'`)
  - `400`: Invalid incident ID format
  - `404`: Incident not found
  - `500`: Export failed
- x-curl-examples with placeholder API keys

### 3. Test Enhancements
**File:** `src/__tests__/integration/swagger.integration.test.ts`

Enhanced test suite with two new assertions:
- **PDF endpoint test:** Verifies GET method exists, response 200 includes `application/pdf` content-type with binary schema, 404/500 responses documented
- **JSON endpoint test:** Verifies GET method exists, response 200 includes `application/json` content-type with Incident schema reference, 400/404/500 responses documented

## Test Results

### Swagger Integration Tests
```
✅ 17 tests passed (17 total)
  ✅ 15 existing tests
  ✅ 2 new content-type and response assertions
```

All export endpoints:
- ✅ Appear in OpenAPI spec at `/api/incidents/{id}/export/pdf` and `/api/incidents/{id}/export/json`
- ✅ Documented with GET method (not POST)
- ✅ Include correct HTTP status codes (200, 404, 500 for PDF; 200, 400, 404, 500 for JSON)
- ✅ Document correct content-type headers (application/pdf, application/json)
- ✅ Path parameters documented as uuid format

### Verification
- ✅ Swagger UI at `/api/swagger` serves endpoints correctly
- ✅ OpenAPI spec at `/api/swagger/openapi.json` includes both endpoints
- ✅ JSDoc blocks follow OpenAPI 3.0 standard
- ✅ No regressions in swagger integration test suite

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use GET instead of POST for exports | Aligns with REST semantics and existing Express routes (changed to GET in Phase 15 for App Router) |
| Document 400 response for JSON only | JSON endpoint validates UUID format; PDF endpoint skips validation (accepts invalid IDs for graceful 404 handling) |
| Include x-curl-examples with placeholder keys | Security best practice: never commit real API keys to source; examples show integration pattern |
| Reference Incident schema via $ref | Eliminates duplication; single source of truth for incident object structure |

## Deviations from Plan

### Auto-fixed Issues

**None** — Plan executed exactly as written.

- All three tasks completed without requiring rule-based fixes
- Test file already had path assertions; added content-type assertions as planned
- JSDoc patterns matched research guidance perfectly

## Known Stubs

**None** — All export endpoints fully wired and documented.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| No threats | N/A | JSDoc curl examples use placeholder keys (sk_test_abc123...), not real credentials. Swagger UI endpoint is public documentation (no auth), which is acceptable for internal API. No new security surface introduced. |

## Self-Check: PASSED

- ✅ File exists: `/c/Users/PascalAmmeter/ClaudeCode/siag-incident-assistant/src/app/api/incidents/[id]/export/pdf/route.ts`
- ✅ File exists: `/c/Users/PascalAmmeter/ClaudeCode/siag-incident-assistant/src/app/api/incidents/[id]/export/json/route.ts`
- ✅ File exists: `/c/Users/PascalAmmeter/ClaudeCode/siag-incident-assistant/src/__tests__/integration/swagger.integration.test.ts`
- ✅ Commit found: `f589bbc` (PDF route JSDoc)
- ✅ Commit found: `8e911eb` (JSON route JSDoc)
- ✅ Commit found: `f99894a` (test assertions)
- ✅ Tests pass: `npm test -- src/__tests__/integration/swagger.integration.test.ts` — 17/17 passing

## Requirements Satisfaction

| Requirement | Status | Evidence |
|-------------|--------|----------|
| B6.1 — OpenAPI/Swagger spec includes all endpoints | ✅ SATISFIED | Both export endpoints appear in spec with GET method at `/api/incidents/{id}/export/pdf` and `/api/incidents/{id}/export/json` |
| B6.3 — Endpoint documentation includes request/response examples | ✅ SATISFIED | JSDoc blocks include x-curl-examples for both endpoints; response schemas and status codes documented with content-type headers |
| PDF endpoint: 200 (application/pdf), 404, 500 | ✅ SATISFIED | JSDoc documents all three status codes; 200 response includes `application/pdf` content-type with binary schema |
| JSON endpoint: 200 (application/json), 400, 404, 500 | ✅ SATISFIED | JSDoc documents all four status codes; 200 response includes `application/json` content-type with Incident schema reference; 400 for invalid UUID format |
| Path parameters {id} in OpenAPI format | ✅ SATISFIED | JSDoc uses `{id}` (not Next.js `[id]`); documented as uuid format in parameters array |

## Metrics

| Metric | Value |
|--------|-------|
| Phase | 21 |
| Plan | 01 |
| Duration | 9 minutes 33 seconds (573 seconds) |
| Tasks Completed | 3 / 3 (100%) |
| Files Modified | 2 route files + 1 test file |
| Commits Created | 3 |
| Tests Added | 2 new assertions (content-type verification) |
| Tests Passing | 17 / 17 (100%) |
| Regressions | 0 |

## Completion Status

✅ **PHASE 21 PLAN 01 COMPLETE**

All success criteria met:
1. ✅ Both App Router export routes have @swagger JSDoc blocks
2. ✅ JSDoc blocks follow OpenAPI 3.0 standard (GET method, correct content-types, status codes)
3. ✅ Path parameter {id} documented in OpenAPI format (not Next.js [id])
4. ✅ PDF endpoint documents application/pdf content-type in 200 response
5. ✅ JSON endpoint documents application/json content-type in 200 response (with Incident schema ref)
6. ✅ Both endpoints document 404 responses
7. ✅ swagger.integration.test.ts passes with all endpoint assertions green (17/17 tests)
8. ✅ Full test suite passes with no regressions (swagger integration tests)
9. ✅ Swagger UI at /api/swagger displays both export endpoints with correct method
10. ✅ Requirements B6.1 and B6.3 satisfied

**Gap closure:** Phase 21 Plan 01 completes v1.2 Swagger documentation gaps (B6.1/B6.3 partial) from audit. Export endpoints are now fully documented in OpenAPI spec with correct methods, parameters, responses, and content-type headers.
