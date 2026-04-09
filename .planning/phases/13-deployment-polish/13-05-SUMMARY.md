---
phase: 13-deployment-polish
plan: "05"
subsystem: wizard-api-integration
tags: [wizard, api, save, migration, toast, uat-fix]
dependency_graph:
  requires: ["13-04"]
  provides: ["wizard-save-to-api", "regulatorische-meldungen-mapping"]
  affects: ["src/components/wizard/steps/Step6Dokumentation.tsx", "src/lib/migration.ts"]
tech_stack:
  added: []
  patterns: ["useIncident hook", "mapIncidentState migration mapper", "sonner toasts", "disabled-during-save pattern"]
key_files:
  created:
    - src/__tests__/step6-save.test.ts
  modified:
    - src/components/wizard/steps/Step6Dokumentation.tsx
    - src/lib/migration.ts
decisions:
  - "Used mapIncidentState with 'as unknown as LegacyWizardState' cast — WizardState is structurally compatible but TypeScript cannot infer this across separate type definitions"
  - "Save button replaced by 'Incident gespeichert' confirmation text after success (not hidden) so user has visual feedback before wizard resets"
  - "1500ms delay before RESET gives user time to read success toast before navigation"
  - "Error toast includes Wiederholen retry action — calls handleSave() directly"
  - "Pre-existing test failures (playbooks, swagger, schema) are out of scope — confirmed unrelated to plan 13-05 changes"
metrics:
  duration_seconds: 193
  completed_date: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 2
---

# Phase 13 Plan 05: Wire Wizard Save to API — Summary

**One-liner:** Added "Speichern & Abschliessen" button to Step 6 wiring wizard completion to POST /api/incidents via useIncident().createIncident(), closing UAT Test 16 blocker (incident persistence).

## What Was Built

### Task 1: mapIncidentState regulatorische_meldungen mapping + tests (TDD)

Enhanced `src/lib/migration.ts` to populate the structured `regulatorische_meldungen` field alongside the existing `metadata.custom_fields` copy. The new mapping calculates ISG 24h, DSG, FINMA 24h/72h deadlines from the `kommunikation` wizard section using the `erkennungszeitpunkt` timestamp.

Created `src/__tests__/step6-save.test.ts` with 6 test cases covering:
- Full wizard state mapping with all fields
- Phishing + HOCH severity mapping
- datenverlust → data_loss type mapping
- Regulatory deadlines from kommunikation flags (ISG/DSG/FINMA)
- Graceful null return on missing klassifikation
- Graceful null return on missing severity

All 6 tests pass.

### Task 2: Save-to-API button in Step6Dokumentation

Modified `src/components/wizard/steps/Step6Dokumentation.tsx` to:
- Import `useIncident`, `mapIncidentState`, `LegacyWizardState`, `showSuccessToast`, `showErrorToast`
- Add `isSaving` (from `useIncident().isLoading`) and `saveSuccess` (local state)
- Add `handleSave()` async function that maps wizard state and calls `createIncident()`
- Replace single "Neuen Incident erfassen" button with two-button layout:
  - **Primary**: "Speichern & Abschliessen" — navy bg, loading spinner during save, disabled to prevent double-submit
  - **Secondary**: "Neuen Incident erfassen" — text link, red, escape hatch (reset only)

## Verification

- 6/6 new tests pass: `npx vitest run src/__tests__/step6-save.test.ts`
- TypeScript: `npx tsc --noEmit` — no errors
- Build: `npx next build` from project root — succeeds (worktree has known Turbopack workspace detection env issue — documented in PROJECT.md)
- Pre-existing test failures (10 tests in playbooks.test.ts, swagger.test.ts, incident.schema.test.ts) confirmed unrelated to plan 13-05 changes

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Notes

- Plan referenced `npx jest` but project uses `vitest`. Used `npx vitest run` throughout — functionally equivalent, same test results.
- Build verified from project root (`/c/Users/PascalAmmeter/ClaudeCode/siag-incident-assistant`) due to the known Turbopack workspace detection issue in worktrees (documented in STATE.md Known Issues).

## Threat Model Coverage

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-13-05-01 | mitigate | Server-side Zod validation in incident.schema.ts already validates CreateIncidentInput — client mapping is convenience only |
| T-13-05-02 | mitigate | Button disabled during isSaving; prevents concurrent createIncident() calls |
| T-13-05-03 | accept | Error toast shows generic German message; raw API errors not exposed to client |

## Known Stubs

None — all data flows are wired. The save button calls the real API via useIncident().createIncident().

## Threat Flags

None — no new network endpoints, auth paths, or schema changes introduced. The wizard save reuses the existing POST /api/incidents endpoint already in the threat model.

## Self-Check

- [x] `src/__tests__/step6-save.test.ts` — file exists, 6 tests pass
- [x] `src/lib/migration.ts` — regulatorische_meldungen mapping added
- [x] `src/components/wizard/steps/Step6Dokumentation.tsx` — save button added
- [x] Commit e00805c (Task 1) — verified in git log
- [x] Commit c8ca67f (Task 2) — verified in git log

## Self-Check: PASSED
