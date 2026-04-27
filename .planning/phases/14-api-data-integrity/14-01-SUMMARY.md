---
phase: 14
plan: 14-01
name: "Consolidate Zod Schemas"
subsystem: api-data-integrity
tags: [schema, consolidation, zod, validation, api]
type: auto
status: complete
duration: "15 minutes"
completed_date: "2026-04-14T13:44:00Z"
---

# Phase 14 Plan 01: Consolidate Zod Schemas — Summary

## Objective Achieved

Eliminated schema fragmentation by consolidating two conflicting Zod schema definitions into a single unified schema. The API now accepts all 14 wizard fields during incident creation, enabling seamless data flow from wizard UI to database storage.

## Key Accomplishments

### Task 1: Extended CreateIncidentInputSchema (Completed)

**Changes to `src/api/schemas/incident.schema.ts`:**

- Extended CreateIncidentInputSchema from 6 to 14 fields:
  - **Core fields (3):** incident_type, severity, description
  - **Recognition fields (4):** erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse
  - **Classification fields (3):** q1, q2, q3 (0-1 integer questions)
  - **Metadata fields (3):** playbook, regulatorische_meldungen, metadata

- Added 'datenverlust' variant to IncidentTypeSchema (6 variants total):
  - ransomware, phishing, ddos, data_loss, datenverlust, other

- UpdateIncidentInputSchema correctly inherits via .partial() (all fields optional)

### Task 2: Deleted Orphan Schema File (Completed)

- **Deleted:** `src/lib/schemas/incident.schema.ts`
- **Verification:** No imports of this file exist anywhere in the codebase (grep confirmed)
- **Impact:** Single source of truth established at `src/api/schemas/incident.schema.ts`

### Task 3: Verified Imports and Compilation (Completed)

- IncidentService imports from correct path: `src/api/schemas/incident.schema.ts`
- TypeScript compilation: **SUCCESS** (npm run type-check)
- No import errors or missing references

## Testing & Validation

### Schema Tests
- **Total tests:** 45 (39 original + 6 new wizard field tests)
- **Status:** ✅ ALL PASSED
- **New test coverage includes:**
  - Recognition field validation (erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse)
  - Classification field validation (q1, q2, q3 as 0-1 integers)
  - Constraint validation (erkannt_durch 1-255 chars, betroffene_systeme min 1 item)
  - Combined wizard + core field acceptance

### Service Tests
- **Total tests:** 23 (IncidentService)
- **Status:** ✅ ALL PASSED
- **No service-level changes needed** (schema expansion is backward compatible)

## Files Modified

| File | Type | Changes |
|------|------|---------|
| src/api/schemas/incident.schema.ts | Modified | Extended CreateIncidentInputSchema with 8 wizard fields, added datenverlust enum variant |
| tests/schemas/incident.schema.test.ts | Modified | Added 6 comprehensive wizard field tests |
| src/lib/schemas/incident.schema.ts | Deleted | Orphan file removed (no remaining imports) |

## Commit Information

**Hash:** `de8bc54`

**Message:** 
```
refactor(14-01): consolidate incident schemas into unified definition

- Extended CreateIncidentInputSchema with all 14 wizard fields
- Added recognition fields: erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_erkenntnisse
- Added classification fields: q1, q2, q3
- Added 'datenverlust' variant to IncidentTypeSchema
- UpdateIncidentInputSchema inherits via .partial()
- Deleted orphan: src/lib/schemas/incident.schema.ts
- All 45 schema tests pass, 23 service tests pass
- TypeScript compilation succeeds
```

## Acceptance Criteria Met

| Criterion | Status | Evidence |
|-----------|--------|----------|
| CreateIncidentInputSchema includes all 14 fields | ✅ | src/api/schemas/incident.schema.ts lines 21-42 |
| UpdateIncidentInputSchema uses .partial() | ✅ | Line 45: `CreateIncidentInputSchema.partial()` |
| No orphan schema file exists | ✅ | Git delete confirmed, grep found 0 imports |
| All imports resolve without errors | ✅ | npm run type-check: SUCCESS |
| TypeScript compilation succeeds | ✅ | tsc --noEmit: no errors |
| Schema tests pass | ✅ | 45/45 tests passed |
| IncidentTypeSchema includes datenverlust | ✅ | Lines 4-11: 6 enum variants |

## Impact Analysis

### Data Flow Improvement
**Before:** Wizard fields were accepted by UI but dropped during API create (validation rejected them)
**After:** All 14 fields flow seamlessly from wizard → API → database

### API Validation
- CreateIncidentInputSchema now validates all wizard fields before database persistence
- Constraints properly enforced:
  - `erkannt_durch`: 1-255 characters
  - `betroffene_systeme`: array with min 1 item
  - `q1/q2/q3`: integers 0-1 only
  - `erkennungszeitpunkt`: ISO8601 datetime format
  - All new fields optional (can be added gradually)

### Type Safety
- TypeScript inference from Zod schema automatically reflects new fields
- Service layer receives properly typed data
- Database schema already supports all fields (no migration needed)

## Deviations from Plan

None — plan executed exactly as specified. All tasks completed successfully without requiring Rule 1-4 deviations.

## Known Stubs

None — no stub data or placeholders introduced.

## Threat Surface

No new security-relevant endpoints or patterns introduced. Schema consolidation is an internal validation layer improvement with no new attack surface.

## Next Steps

Plan 14-02 can now proceed with full confidence that:
1. Wizard data will not be lost during API create
2. All 14 fields are properly validated before storage
3. Type safety is maintained throughout the stack
4. Single schema source eliminates future conflicts

---

**Duration:** 15 minutes  
**Completed:** 2026-04-14T13:44:00Z  
**Wave:** 1 (Foundation)
