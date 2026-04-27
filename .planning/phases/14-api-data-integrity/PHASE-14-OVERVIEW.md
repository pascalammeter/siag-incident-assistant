# Phase 14: API Data Integrity — Gap-2 Closure

**Status:** Planning Complete (Ready for Execution)
**Created:** 2026-04-14
**Target Duration:** ~12-16 hours (Wave 1: 2h, Wave 2: 8h parallel, Wave 3: 4h)

## Executive Summary

Phase 14 fixes the **GAP-2** data persistence bug identified in the v1.1 audit. Incident data collected by the wizard (8 fields) was being silently dropped before database write, resulting in incomplete incident records. This phase implements 5 coordinated fixes across schema, service layer, API endpoints, and playbook routing, validated by comprehensive integration tests.

## The Problem (GAP-2)

When a user completes the incident wizard and saves, the API receives all fields but drops 8 of them before database write:

```
User enters: erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse, 
            q1, q2, q3, plus incident_type, severity
            ↓
API schema rejects unrecognized fields
            ↓
Service receives only: incident_type, severity
            ↓
Database writes incomplete record (7 missing fields = null/empty)
            ↓
Retrieve returns incomplete data (no incident context for playbooks, reports)
```

## Solution Overview

### Wave 1: Schema Consolidation (2 hours)
**Plan 14-01:** Merge two conflicting schema files into one unified schema supporting all 14 fields.
- Consolidate `src/api/schemas/incident.schema.ts` + `src/lib/schemas/incident.schema.ts`
- Extend CreateIncidentInputSchema: 6 → 14 fields
- Delete orphan schema file
- Add 'datenverlust' enum variant for backwards compatibility

### Wave 2: Fix Persistence (8 hours parallel)
Four parallel fixes ensure data reaches database:

**Plan 14-02:** Fix IncidentService field persistence
- Update createIncident(): map all 14 fields to Prisma data object
- Update updateIncident(): conditionally map all optional fields
- Remove hardcoded empty values (e.g., `betroffene_systeme: []`)

**Plan 14-03:** Implement actual soft-delete
- Replace no-op deleteIncident() with real soft-delete via Prisma update
- Set deletedAt timestamp on DELETE request
- Soft-deleted incidents filtered from list queries

**Plan 14-04:** Complete playbook routing
- Add missing 'data_loss' case to getPlaybook() switch
- Ensure all 4 incident types route to correct playbook
- Minimal 1-line addition

### Wave 3: Validation (4 hours)
**Plan 14-05:** TDD integration test suite
- Test complete wizard → API → DB → retrieve flow
- Verify all 14 fields persist end-to-end
- Validate soft-delete filtering and playbook routing
- 6 test cases covering 7 scenarios

## File Changes Summary

### Files Modified
| File | Plan | Change | Impact |
|------|------|--------|--------|
| src/api/schemas/incident.schema.ts | 14-01 | Add 8 wizard fields to CreateIncidentInputSchema | Schema now accepts wizard input |
| src/api/services/incident.service.ts | 14-02 | Map all 14 fields in createIncident() | Fields actually written to DB |
| src/api/services/incident.service.ts | 14-02 | Add field mappings to updateIncident() | PATCH requests preserve all fields |
| src/api/services/incident.service.ts | 14-03 | Implement soft-delete with deletedAt timestamp | Deletion audit trail created |
| src/lib/playbook-data.ts | 14-04 | Add `case 'data_loss'` to getPlaybook() switch | data_loss incidents route correctly |

### Files Deleted
| File | Plan | Reason |
|------|------|--------|
| src/lib/schemas/incident.schema.ts | 14-01 | Consolidated into src/api/schemas/incident.schema.ts |

### Files Created
| File | Plan | Purpose |
|------|------|---------|
| src/__tests__/incident-integration.test.ts | 14-05 | Integration test suite (6 test cases, ~400 lines) |

## Execution Plan

### Prerequisites
- Working v1.1 codebase with API routes, IncidentService, Prisma schema
- Jest test framework configured
- Database available for integration tests

### Execution Order
1. **Plan 14-01** (Wave 1, 2 hours)
   - Consolidate schemas
   - Delete orphan file
   - Commit: `refactor(14-01): consolidate incident schemas`

2. **Plans 14-02, 14-03, 14-04** (Wave 2, 8 hours parallel)
   - 14-02: Fix service persistence
     - Commit: `fix(14-02): persist all incident fields in IncidentService`
   - 14-03: Fix soft-delete
     - Commit: `fix(14-03): implement actual soft-delete in IncidentService`
   - 14-04: Complete playbook routing
     - Commit: `fix(14-04): add data_loss case to getPlaybook routing`

3. **Plan 14-05** (Wave 3, 4 hours)
   - RED: Write failing integration tests
     - Commit: `test(14-05): add failing integration tests`
   - GREEN: All fixes from Wave 2 make tests pass
   - REFACTOR: Clean up test code if needed
     - Commit: `test(14-05): integration tests passing for incident persistence`

### Verification Checkpoints
- ✓ All 14 fields accepted by API schema (after 14-01)
- ✓ Fields persisted to database (after 14-02)
- ✓ Soft-delete creates timestamp (after 14-03)
- ✓ Playbook routing works for all types (after 14-04)
- ✓ All integration tests pass (after 14-05)

## Dependency Graph

```
14-01 (Schema Consolidation)
  ├─→ 14-02 (Field Persistence) ──┐
  ├─→ 14-03 (Soft-Delete)         ├─→ 14-05 (Integration Tests)
  └─→ 14-04 (Playbook Routing) ──┘
```

## Success Metrics

| Metric | Success Criterion |
|--------|-------------------|
| Schema Consolidation | Single unified schema with 14 fields, orphan file deleted |
| Field Persistence | All 14 fields persisted to database on create and update |
| Soft-Delete | deletedAt timestamp set on delete, filtered from list queries |
| Playbook Routing | All 4 incident types route to correct playbook |
| Test Coverage | 6 integration test cases, all passing |
| Data Integrity | Complete round-trip: wizard input → API → DB → retrieve, no data loss |

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking changes to API | Plan 14-02 maintains same method signatures, only adds internal mappings |
| Schema import errors | Plan 14-01 deletes orphan file after consolidation verified |
| Soft-delete regressions | Plan 14-03 tested by 14-05 (filters in list query already used) |
| Playbook routing bugs | Plan 14-04 is 1-line change, fully covered by 14-05 tests |
| Integration failures | Plan 14-05 TDD cycle catches any issues from Wave 2 |

## Related Audit Gap

- **GAP-2 (v1.1 Audit):** "Incident wizard data lost on API save — 8 wizard fields dropped before DB write"
  - **Status:** Resolved by Phase 14
  - **Impact:** Complete incident records with audit trail (soft-delete), proper playbook routing
  - **Verification:** All integration tests pass, data round-trip confirmed

## Files by Location

### Schema Layer
- `.planning/phases/14-api-data-integrity/14-01-PLAN.md` — Schema consolidation spec
- Source: `src/api/schemas/incident.schema.ts` (modify)
- Source: `src/lib/schemas/incident.schema.ts` (delete)

### Service Layer
- `.planning/phases/14-api-data-integrity/14-02-PLAN.md` — Field persistence spec
- `.planning/phases/14-api-data-integrity/14-03-PLAN.md` — Soft-delete spec
- Source: `src/api/services/incident.service.ts` (modify)

### Routing Layer
- `.planning/phases/14-api-data-integrity/14-04-PLAN.md` — Playbook routing spec
- Source: `src/lib/playbook-data.ts` (modify)

### Test Layer
- `.planning/phases/14-api-data-integrity/14-05-PLAN.md` — Integration test spec
- Source: `src/__tests__/incident-integration.test.ts` (create)

## Next Phase

**Phase 15 (v1.1 Final Audit):** Verify all audit gaps closed, conduct final security review, prepare v1.1 release.

---

**Phase 14 Planning completed:** 2026-04-14
**Executor:** Claude Haiku 4.5
**Plans Ready for Execution:** 5 (14-01 through 14-05)
