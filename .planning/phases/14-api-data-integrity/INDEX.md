# Phase 14: API Data Integrity — Plan Index

**Phase Goal:** Fix GAP-2 audit gap (wizard data loss) by consolidating schemas, fixing field persistence, implementing soft-delete, and routing playbooks correctly.

**Total Plans:** 5
**Total Lines:** 1,313+ lines of detailed specifications
**Estimated Duration:** 12-16 hours
**Wave Structure:** Wave 1 (2h) → Wave 2 (8h parallel) → Wave 3 (4h)

---

## Quick Navigation

### Overview
📋 **[PHASE-14-OVERVIEW.md](./PHASE-14-OVERVIEW.md)** — Full phase context, dependency graph, success metrics (183 lines)

### Individual Plans

#### Wave 1: Schema Consolidation (2 hours, execute first)
🎯 **[14-01-PLAN.md](./14-01-PLAN.md)** — Consolidate Zod Schemas (128 lines)
- **Goal:** Merge two competing schema files into single unified schema supporting all 14 fields
- **Status:** Auto task
- **Depends on:** None
- **Tasks:** 3 (merge definitions, delete orphan file, verify imports)
- **Output:** Single schema with 14 fields, 'datenverlust' enum variant

#### Wave 2: Fix Persistence (8 hours, execute in parallel)

🔧 **[14-02-PLAN.md](./14-02-PLAN.md)** — Fix IncidentService Field Persistence (169 lines)
- **Goal:** Persist all 14 fields to database instead of dropping 9 wizard fields
- **Status:** Auto task
- **Depends on:** 14-01
- **Tasks:** 3 (fix createIncident, fix updateIncident, verify schema compatibility)
- **Output:** Service persists all fields, no silent data loss

🗑️ **[14-03-PLAN.md](./14-03-PLAN.md)** — Fix Soft-Delete Endpoint (188 lines)
- **Goal:** Implement actual soft-delete with deletedAt timestamp instead of no-op
- **Status:** Auto task
- **Depends on:** 14-01
- **Tasks:** 3 (implement deleteIncident, verify route response, verify list filtering)
- **Output:** Soft-deleted incidents marked with timestamp, filtered from queries

🎮 **[14-04-PLAN.md](./14-04-PLAN.md)** — Add Playbook Routing for data_loss (166 lines)
- **Goal:** Complete incident type to playbook routing with missing 'data_loss' case
- **Status:** Auto task
- **Depends on:** 14-01
- **Tasks:** 3 (add data_loss case, verify all types routed, verify DATA_LOSS_PLAYBOOK exported)
- **Output:** 1-line addition to getPlaybook switch, all 4 types routed

#### Wave 3: Validation (4 hours, execute after Wave 2)

✅ **[14-05-PLAN.md](./14-05-PLAN.md)** — Integration Tests for Complete Flow (479 lines)
- **Goal:** Comprehensive TDD test suite validating wizard → API → DB → retrieve flow
- **Status:** Auto task with TDD (RED → GREEN → REFACTOR)
- **Depends on:** 14-01, 14-02, 14-03, 14-04
- **Tasks:** 3 (setup infrastructure + write failing tests, implement fixes, refactor)
- **Output:** 6 integration test cases (~400 lines), all passing

---

## What Gets Fixed

| Component | Problem | Fix | Plan |
|-----------|---------|-----|------|
| API Schema | Only accepts 6/14 fields | Extend to 14 fields | 14-01 |
| Service Layer | Only persists 5/14 fields | Map all 14 to Prisma | 14-02 |
| Delete Endpoint | Returns 204 but doesn't delete | Set deletedAt timestamp | 14-03 |
| Playbook Routing | data_loss falls to default ransomware | Add data_loss case | 14-04 |
| Data Integrity | No end-to-end validation | Add integration tests | 14-05 |

## Data Flow After Fixes

```
User completes wizard with 14 fields
    ↓
POST /api/incidents with CreateIncidentInputSchema (now accepts all 14)
    ↓
IncidentService.createIncident() maps all 14 to Prisma data object
    ↓
prisma.incident.create() writes all 14 fields to database
    ↓
GET /api/incidents/:id returns complete incident with all 14 fields + metadata
    ↓
Frontend displays correct playbook (routed by incident_type)
    ↓
DELETE /api/incidents/:id sets deletedAt timestamp
    ↓
GET /api/incidents filters deletedAt IS NULL (soft-deleted hidden from list)
```

## Field Mapping

**14 Fields Total:**
- 3 Core: incident_type, severity, description
- 5 Recognition: erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse
- 3 Classification: q1, q2, q3
- 3 Metadata: playbook, regulatorische_meldungen, metadata

**Before Phase 14:**
- API Schema accepts: 6/14
- Service persists: 5/14
- Database stores: 5/14 (rest null/empty)
- Result: 9 fields lost

**After Phase 14:**
- API Schema accepts: 14/14 ✓
- Service persists: 14/14 ✓
- Database stores: 14/14 ✓
- Result: 0 fields lost

## Execution Checklist

### Pre-Execution
- [ ] Read PHASE-14-OVERVIEW.md for context
- [ ] Verify all 5 plan files exist and are readable
- [ ] Review source files referenced in plans (line numbers accurate)

### Wave 1 (Plan 14-01)
- [ ] Execute 14-01 schema consolidation
- [ ] Verify: orphan file deleted, single schema with 14 fields
- [ ] Commit: `refactor(14-01): consolidate incident schemas`

### Wave 2 (Plans 14-02, 14-03, 14-04 — parallel)
- [ ] Execute 14-02 service persistence
  - [ ] Commit: `fix(14-02): persist all incident fields in IncidentService`
- [ ] Execute 14-03 soft-delete
  - [ ] Commit: `fix(14-03): implement actual soft-delete in IncidentService`
- [ ] Execute 14-04 playbook routing
  - [ ] Commit: `fix(14-04): add data_loss case to getPlaybook routing`

### Wave 3 (Plan 14-05)
- [ ] Execute 14-05 Task 1: Write failing tests (RED phase)
  - [ ] Commit: `test(14-05): add failing integration tests`
- [ ] Verify Wave 2 fixes make tests pass (GREEN phase)
- [ ] Optional: Refactor tests (if needed)
  - [ ] Commit: `test(14-05): integration tests passing`
- [ ] Verify all 6 test cases passing

### Post-Execution
- [ ] All 5 plans complete
- [ ] 5 commits created (6 if refactor needed)
- [ ] Integration tests passing
- [ ] GAP-2 audit gap resolved

## Quick Reference

**Wave 1 Duration:** ~2 hours
- 1 plan: schema consolidation + merge + delete orphan + verify imports

**Wave 2 Duration:** ~8 hours (can run in parallel)
- 3 plans: service persistence + soft-delete + playbook routing
- Each plan: 2-4 tasks, mostly straightforward line edits

**Wave 3 Duration:** ~4 hours
- 1 plan: TDD cycle (write tests → implement fixes → refactor)
- Depends on Wave 2 completion for GREEN phase

**Total:** 12-16 hours for complete Phase 14 execution

## Audit Gap Resolution

**GAP-2 (v1.1 Audit Report):** "Incident wizard data lost on API save"
- **Root Cause:** Schema rejected wizard fields, service didn't map them, DB stored nulls
- **Phase 14 Resolution:** All layers fixed, end-to-end integration tests validate
- **Verification:** 6 integration test cases confirm zero data loss

## Related Documentation

- `.planning/phases/14-api-data-integrity/PHASE-14-OVERVIEW.md` — Full context
- Project memory: `~/.claude/projects/.../MEMORY.md` — Historical phase tracking
- Audit report: See Phase 13 or previous phase documentation for GAP-2 details

---

**Phase 14 Plans Created:** 2026-04-14
**Creator:** Claude Haiku 4.5
**Status:** Ready for Execution
**Next Step:** Begin Wave 1 with plan 14-01
