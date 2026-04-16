---
phase: 19-wizard-resume-from-api
plan: "01"
subsystem: wizard-state
tags: [reverse-mapping, migration, wizard-resume, data-transform]
dependency_graph:
  requires: []
  provides: [mapIncidentToWizardState, mapApiTypeToWizardType, mapApiSeverityToWizardSeverity, mapIntToYesNo, mapIntToYesNoUnbekannt]
  affects: [src/lib/migration.ts]
tech_stack:
  added: []
  patterns: [reverse-mapping-functions, type-safe-enum-mapping]
key_files:
  created:
    - src/__tests__/wizard-resume.test.ts
  modified:
    - src/lib/migration.ts
decisions:
  - "Reverse mapping defaults: null incident_type defaults to ransomware, null severity defaults to MITTEL"
  - "API low severity maps to MITTEL (WizardState has no LOW level)"
  - "erkennungszeitpunkt uses .toISOString().slice(0,16) for datetime-local format"
  - "Only playbook steps with checked=true are included in completedSteps"
metrics:
  duration: "14 min"
  completed: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  test_count: 26
  files_changed: 2
---

# Phase 19 Plan 01: Reverse Mapping Functions Summary

Reverse mapping from API Incident to partial WizardState with 5 exported functions and 26 unit tests covering all field transformations including enum, severity, integer-to-German-yes/no, datetime format, and playbook step filtering.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create test file with fixtures and test stubs | 37633c6 | src/__tests__/wizard-resume.test.ts |
| 2 | Implement reverse mapping functions in migration.ts | f579601 | src/lib/migration.ts |

## Implementation Details

### New Exports in migration.ts (+5 functions)

1. **mapApiTypeToWizardType** -- `data_loss` -> `datenverlust`, `other` -> `sonstiges`, null -> `ransomware`
2. **mapApiSeverityToWizardSeverity** -- `critical` -> `KRITISCH`, `low` -> `MITTEL`, null -> `MITTEL`
3. **mapIntToYesNo** -- `1` -> `ja`, `0`/null -> `nein`
4. **mapIntToYesNoUnbekannt** -- `1` -> `ja`, `0` -> `nein`, null/undefined -> `unbekannt`
5. **mapIncidentToWizardState** -- Full Incident -> Partial<WizardState> (erfassen, klassifikation, reaktion, kommunikation)

### Key Field Mappings in mapIncidentToWizardState

| API Field | WizardState Field | Transform |
|-----------|-------------------|-----------|
| erkennungszeitpunkt | erfassen.erkennungszeitpunkt | ISO -> datetime-local (.slice(0,16)) |
| erste_erkenntnisse | erfassen.erste_auffaelligkeiten | Direct (field name difference) |
| incident_type | klassifikation.incidentType | mapApiTypeToWizardType |
| severity | klassifikation.severity | mapApiSeverityToWizardSeverity |
| q1/q2 | q1SystemeBetroffen/q2PdBetroffen | mapIntToYesNo |
| q3 | q3AngreiferAktiv | mapIntToYesNoUnbekannt |
| playbook.checkedSteps | reaktion.completedSteps | Filter checked=true, extract stepId |
| metadata.custom_fields.* | kommunikation.* | Direct cast |
| metadata.custom_fields.loesegeld_meldung | erfassen.loesegeld_meldung | Boolean cast |

### Design Decisions

- **No currentStep/noGoConfirmed in output:** The mapper returns only data fields. WizardProvider sets currentStep=1 and noGoConfirmed=true when hydrating from API.
- **Defaults for missing fields:** Empty string for erkennungszeitpunkt, empty array for betroffene_systeme/completedSteps, null for kommunikation booleans, `ransomware`/`MITTEL` for type/severity.
- **API `low` -> wizard `MITTEL`:** WizardState only has KRITISCH/HOCH/MITTEL; low maps to the closest level.

## Test Coverage

26 tests across 5 describe blocks:
- mapApiTypeToWizardType: 6 tests (all 5 types + null/undefined default)
- mapApiSeverityToWizardSeverity: 5 tests (all 4 levels + null/undefined default)
- mapIntToYesNo: 3 tests (1, 0, null)
- mapIntToYesNoUnbekannt: 4 tests (1, 0, null, undefined)
- mapIncidentToWizardState: 8 tests (full mapping, datetime format, playbook filtering, metadata, minimal incident, data_loss type, no currentStep, field name mapping)

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `npx vitest run src/__tests__/wizard-resume.test.ts`: 26/26 passed
- `npm test`: 37/44 test files passed, 728/773 tests passed (7 failed files are pre-existing integration test failures requiring DB connection -- not related to this plan's changes)
- `grep -c "export function" src/lib/migration.ts`: 11 (was 6, increased by 5)

## Self-Check: PASSED

- [x] src/__tests__/wizard-resume.test.ts exists
- [x] src/lib/migration.ts contains all 5 new exports
- [x] Commit 37633c6 exists (Task 1)
- [x] Commit f579601 exists (Task 2)
- [x] No unexpected file deletions
