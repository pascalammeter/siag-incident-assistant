---
phase: "03"
plan: "03"
subsystem: screen-2-erfassen
tags: [screen, form, react-hook-form, zod, datetime, multi-select, amber-card]
dependency_graph:
  requires: [03-01]
  provides: [Step2Erfassen-complete, erfassen-form-fields]
  affects: [03-04]
tech_stack:
  added: []
  patterns:
    - "datetime-local + Jetzt eintragen: timezone-corrected via getTimezoneOffset() * 60000"
    - "Multi-select checkboxes via form.register('betroffene_systeme') array registration"
    - "Conditional timestamp display via form.watch('erkennungszeitpunkt')"
    - "Amber warning cards: border-l-4 border-amber bg-amber/10 rounded-r-lg"
key_files:
  created: []
  modified:
    - src/components/wizard/steps/Step2Erfassen.tsx
decisions:
  - "[03-03] Heading and intro placed outside StepForm (above it) — consistent with existing placeholder structure"
  - "[03-03] StepNavigator rendered by StepForm internally with nextButtonType=submit — no standalone navigator needed"
metrics:
  duration: "1min"
  completed_date: "2026-04-03"
  tasks_completed: 1
  files_changed: 1
---

# Phase 3 Plan 03: Screen 2 Vorfall erfassen Summary

Complete Vorfall erfassen form with datetime-local + Jetzt-eintragen auto-timestamp, Erkannt-durch dropdown, Betroffene Systeme multi-select checkboxes (responsive 2-column grid), Erste Auffaelligkeiten textarea, Ransomware amber-card checkbox, and conditional Meldefrist timestamp display.

## What Was Built

### Task 1: Implement Screen 2 — Vorfall erfassen form

- **Step2Erfassen.tsx**: Full replacement of placeholder content with complete form implementation
  - **Meldefrist Banner**: Amber left-bordered card at top with warning triangle and Meldefristen text (F4 requirement)
  - **Erkennungszeitpunkt**: `datetime-local` input + "Jetzt eintragen" button that auto-fills current local timestamp using timezone-corrected calculation (`getTimezoneOffset() * 60000`)
  - **Erkannt durch**: Select dropdown with 5 options (IT-Mitarbeiter, Nutzer/Mitarbeitende, Externes System/Monitoring, Angreifer-Kontakt, Sonstiges)
  - **Betroffene Systeme**: Multi-select checkbox group in `grid grid-cols-1 sm:grid-cols-2 gap-3` responsive layout with 7 options (Workstations, Server, Backups, E-Mail, Netzwerk, OT/ICS, Sonstiges)
  - **Erste Auffaelligkeiten**: Textarea with descriptive placeholder, `min-h-[120px] resize-y`
  - **Ransomware-Checkbox**: Single checkbox in amber left-bordered card matching UI-SPEC
  - **Conditional Timestamp Display**: Shown only when erkennungszeitpunkt has a value, displays `de-CH` formatted date+time with "Ihre rechtliche Meldefrist beginnt jetzt." notice
  - **Zod validation**: Required fields (erkennungszeitpunkt, erkannt_durch) enforced on submit via `StepForm` + `erfassenSchema`
  - **Navigation**: Handled by `StepForm` internal `StepNavigator` with `nextButtonType="submit"`

## Verification Results

- `npx tsc --noEmit`: PASS (0 errors)
- `npx vitest run`: PASS — 38/38 tests in 4 test files (no regressions)

## Acceptance Criteria Results

| Criterion | Result |
|-----------|--------|
| erkennungszeitpunkt >= 3 occurrences | PASS (6) |
| erkannt_durch >= 1 occurrence | PASS (3) |
| betroffene_systeme >= 1 occurrence | PASS (1) |
| erste_auffaelligkeiten >= 1 occurrence | PASS (1) |
| loesegeld_meldung >= 1 occurrence | PASS (1) |
| "Jetzt eintragen" = 1 match | PASS |
| "Meldefristen" = 1 match | PASS |
| bg-amber/10 >= 2 matches | PASS (2) |
| datetime-local = 1 match | PASS |
| getTimezoneOffset = 1 match | PASS |
| accent-navy >= 2 matches | PASS (2) |
| min-h-[44px] >= 2 matches | PASS (3) |
| grid-cols-1 sm:grid-cols-2 = 1 match | PASS |
| "Meldefrist beginnt jetzt" = 1 match | PASS |
| Placeholder "Phase 3 implementiert" removed | PASS |

## Decisions Made

1. **Heading/intro outside StepForm**: The `<h2>` and `<p>` intro are placed above the `StepForm` component, consistent with the existing Step2Erfassen structure. The StepForm render prop contains all form fields plus conditional timestamp display.
2. **StepNavigator via StepForm**: Navigation (Weiter/Zurueck) is rendered by `StepForm` internally with `nextButtonType="submit"`. No separate navigation props needed since Plan 01 set up this architecture.

## Deviations from Plan

None — plan executed exactly as written. The plan referenced Plan 01 outputs (erfassenSchema filled, StepForm wired) which were correctly in place after merging the wave 1 merge commit (e7c6320).

## Known Stubs

None — Screen 2 is fully implemented with all data fields wired to `erfassenSchema` and dispatched to `WizardContext` on submit.

## Self-Check: PASSED

Files verified:
- FOUND: src/components/wizard/steps/Step2Erfassen.tsx (147 lines, full implementation)

Commits verified:
- FOUND: 8ebca2b feat(03-03): implement Screen 2 Vorfall erfassen form
