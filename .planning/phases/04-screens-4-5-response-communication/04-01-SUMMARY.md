---
phase: 04-screens-4-5-response-communication
plan: 01
subsystem: data-layer
tags: [playbook, communication-templates, deadline-logic, zod-schemas, types]
dependency_graph:
  requires: [wizard-types, wizard-schemas]
  provides: [playbook-data, communication-templates, reaktion-types, kommunikation-types]
  affects: [Step4Reaktion, Step5Kommunikation]
tech_stack:
  added: []
  patterns: [playbook-constants, template-generators, deadline-computation]
key_files:
  created:
    - src/lib/playbook-data.ts
    - src/lib/communication-templates.ts
    - src/__tests__/playbook-data.test.ts
    - src/__tests__/deadline-logic.test.ts
  modified:
    - src/lib/wizard-types.ts
    - src/lib/wizard-schemas.ts
    - src/__tests__/wizard-schemas.test.ts
decisions:
  - "25 steps distributed: 7 Sofort, 6 Eindaemmung, 6 Untersuchung, 6 Kommunikation"
  - "4 noGoWarning items: no restart, isolate backups, no ransom payment, no cleanup before forensics"
  - "Template placeholders use bracket notation [Firmenname] for future auto-fill"
  - "formatDeadline uses de-CH locale with Uhr suffix for stress-appropriate display"
metrics:
  duration: 4min
  completed: "2026-04-04T10:54:00Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 23
  tests_total: 74
  files_changed: 7
---

# Phase 4 Plan 1: Data Layer (Playbook, Templates, Types, Schemas) Summary

25-step ransomware playbook as TypeScript constants with 4 phases, role assignments, and no-go warnings; deadline computation for ISG/FINMA reporting; 3 German communication template generators with dynamic wizard data and static placeholders.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Playbook data + types + schemas | 5f28375 | playbook-data.ts, wizard-types.ts, wizard-schemas.ts |
| 2 | Deadline logic + communication templates | a2360e4 | communication-templates.ts, deadline-logic.test.ts |

## Key Implementation Details

### Playbook Structure
- 4 phases: Sofortmassnahmen (7), Eindaemmung (6), Untersuchung (6), Kommunikation (6) = 25 total
- Roles: IT-Leiter, CISO, CEO, Forensik
- 4 noGoWarning items on critical steps (no restart, isolate backups, no ransom, no cleanup before forensics)
- Step IDs: `{phase.id}-{nn}` pattern for stable references
- `PLAYBOOKS` record for future incident type extensibility

### Types and Schemas
- `ReaktionData.completedSteps: string[]` tracks checked playbook steps
- `KommunikationData` has 3 nullable Meldepflicht fields + kommChecklist + 3 optional template fields
- Zod schemas with `.default()` for progressive fill (empty object valid)

### Communication Templates
- `computeDeadline(iso, hours)` for ISG 24h, FINMA 24h/72h deadline calculation
- `formatDeadline(date)` with de-CH locale + "Uhr" suffix
- 3 generators: GL (formal), Mitarbeitende (internal), Medien (press)
- Dynamic: erkennungszeitpunkt, severity, incidentType, betroffene_systeme
- Static placeholders: [Firmenname], [Name des Ansprechpartners], [Ihre E-Mail], [Telefonnummer]

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all exports are fully implemented with real data and logic.

## Verification

- `npx vitest run --reporter=verbose` -- 74/74 tests pass (23 new)
- `npx tsc --noEmit` -- zero TypeScript errors
- No regressions in existing test suites
