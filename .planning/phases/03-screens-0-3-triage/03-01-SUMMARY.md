---
phase: "03"
plan: "01"
subsystem: wizard-foundation
tags: [types, schemas, zod, triage-logic, screen-0]
dependency_graph:
  requires: [02-01, 02-02, 02-03, 02-04, 02-05]
  provides: [ErfassenData, KlassifikationData, calculateSeverity, StepForm-submit-wiring, Screen-0-NoGo]
  affects: [03-02, 03-03, 03-04]
tech_stack:
  added: []
  patterns:
    - "calculateSeverity pure function: Q3=unbekannt escalates to KRITISCH (assume worst case)"
    - "StepForm renders StepNavigator inside form with nextButtonType=submit for RHF Zod validation"
    - "WizardShell only mounts standalone StepNavigator for step 1 (hero nav); steps 2-6 use StepForm"
key_files:
  created:
    - src/__tests__/triage-logic.test.ts
  modified:
    - src/lib/wizard-types.ts
    - src/lib/wizard-schemas.ts
    - src/__tests__/wizard-schemas.test.ts
    - src/components/wizard/StepNavigator.tsx
    - src/components/wizard/StepForm.tsx
    - src/components/wizard/WizardShell.tsx
    - src/components/wizard/steps/StepInterstitial.tsx
decisions:
  - "[03-01] calculateSeverity: Q3 unbekannt = KRITISCH (assume worst case, CISO best practice)"
  - "[03-01] StepForm contains StepNavigator with type=submit — RHF handleSubmit fires before NEXT_STEP"
  - "[03-01] WizardShell standalone StepNavigator only for step 1 with showNext=false"
metrics:
  duration: "3min"
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_changed: 7
---

# Phase 3 Plan 01: Foundation + Screen 0 Summary

Shared type/schema foundation and Screen 0 No-Go interstitial — ErfassenData, KlassifikationData, calculateSeverity, StepForm submit wiring, and 8-rule amber card screen gate wizard entry.

## What Was Built

### Task 1: Types, Schemas, and Triage Logic
- **wizard-types.ts**: Added `IncidentType` union type, filled `ErfassenData` with 5 fields (erkennungszeitpunkt, erkannt_durch, betroffene_systeme, erste_auffaelligkeiten, loesegeld_meldung), filled `KlassifikationData` with q1/q2/q3 enums + incidentType + severity
- **wizard-schemas.ts**: Replaced placeholder `erfassenSchema` and `klassifikationSchema` with real Zod v4 schemas (using `{ error: '...' }` for enum messages). Exported `calculateSeverity` function.
- **triage-logic.test.ts** (new): 11 tests covering all 5 severity paths (including Q3=unbekannt→KRITISCH), erfassen schema accept/reject/defaults, klassifikation accept/reject
- **wizard-schemas.test.ts** (updated): Replaced "empty object accepted" tests for erfassen/klassifikation with "rejects empty object" tests; kept all other schema tests unchanged

### Task 2: StepNavigator showNext + StepForm submit wiring + Screen 0
- **StepNavigator**: Added `showNext?: boolean` prop (hides "Weiter" button, renders `<div />` spacer) + `nextButtonType?: 'button' | 'submit'` prop (default: 'button')
- **StepForm**: Now renders `StepNavigator` inside the `<form>` element with `nextButtonType="submit"` — Zod validation fires before `dispatch(NEXT_STEP)`. Added `showPrev`, `showNext`, `onPrev`, `nextLabel` props.
- **WizardShell**: Removed the `{state.currentStep > 0}` standalone navigator. Now only renders StepNavigator for `state.currentStep === 1` with `showNext={false}`. Steps 2-6 get navigation from their StepForm instances.
- **StepInterstitial**: Replaced placeholder div with 8 amber-styled No-Go rule cards (`border-l-4 border-amber bg-amber/10`), confirmation checkbox (`accent-navy`), and confirm button (`font-bold`, `w-full sm:w-auto`, `hover:bg-navy-light`)

## Verification Results

- `npx tsc --noEmit`: PASS (no type errors)
- `npx vitest run`: PASS — 38/38 tests in 4 test files
  - triage-logic.test.ts: 11/11
  - wizard-schemas.test.ts: 7/7
  - wizard-reducer.test.ts: 13/13
  - localStorage.test.ts: 7/7

## Decisions Made

1. **calculateSeverity Q3=unbekannt**: Escalates to KRITISCH (assume worst case per CISO best practice, documented in D-01). Note added in test: "assume worst case".
2. **StepForm submit wiring**: StepNavigator rendered inside `<form>` element ensures RHF `handleSubmit` fires validation before `dispatch(NEXT_STEP)`. The "Weiter" button is `type="submit"` — no `onClick` needed.
3. **WizardShell navigator scope**: Steps 2-6 rely on StepForm's internal navigator. WizardShell only handles the special case: step 1 back button (showNext=false because hero button on Step1Einstieg handles forward navigation).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

Steps 2-6 component files (Step2Erfassen, Step3Klassifikation, etc.) still contain placeholder content from Phase 2. These will be implemented in Plans 03-02 through 03-04. The stubs do not affect Plan 01's goal (foundation + Screen 0) — they are intentionally deferred per plan dependency graph.

## Self-Check: PASSED

Files verified:
- FOUND: src/lib/wizard-types.ts (ErfassenData, KlassifikationData, IncidentType)
- FOUND: src/lib/wizard-schemas.ts (calculateSeverity, erfassenSchema, klassifikationSchema)
- FOUND: src/__tests__/triage-logic.test.ts
- FOUND: src/components/wizard/StepNavigator.tsx (showNext, nextButtonType)
- FOUND: src/components/wizard/StepForm.tsx (StepNavigator inside form)
- FOUND: src/components/wizard/WizardShell.tsx (step 1 only navigator)
- FOUND: src/components/wizard/steps/StepInterstitial.tsx (8 No-Go cards)

Commits verified:
- FOUND: 8ffb968 feat(03-01): fill wizard types, schemas, and calculateSeverity
- FOUND: bb65b8b feat(03-01): StepNavigator showNext + StepForm submit wiring + Screen 0
