---
phase: "03"
plan: "04"
subsystem: wizard-steps
tags: [klassifikation, severity, decision-tree, pill-toggle, screen-3, tdd]
dependency_graph:
  requires: [03-01, 03-03]
  provides: [Step3Klassifikation, severity-display, incident-type-radio, escalation-alert]
  affects: [03-05, 04-01]
tech_stack:
  added: []
  patterns:
    - "Inner component pattern (KlassifikationForm) to use hooks in StepForm render prop"
    - "Pill toggle buttons use form.setValue + type=button to avoid form submission"
    - "Hidden inputs for Zod validation of pill-toggled fields (q1/q2/q3/severity)"
    - "useEffect computes severity reactively from watched q1/q2/q3 values"
    - "calculateSeverity pure function: Q1=ja or Q3=ja/unbekannt => KRITISCH, Q2=ja => HOCH"
key_files:
  created:
    - src/__tests__/severity.test.ts
  modified:
    - src/components/wizard/steps/Step3Klassifikation.tsx
decisions:
  - "[03-04] Inner KlassifikationForm component to use useEffect/useWatch hooks in render prop"
  - "[03-04] Pill buttons use type=button + form.setValue — hidden inputs register values for Zod"
  - "[03-04] Severity computed reactively via useEffect watching q1/q2/q3"
  - "[03-04] incidentType defaults to ransomware via useEffect if not set (F5.3)"
metrics:
  duration: "6min"
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_changed: 12
---

# Phase 3 Plan 04: Klassifikation Screen Summary

Screen 3 decision tree with 3 pill-toggle question cards, reactive severity calculation (KRITISCH/HOCH/MITTEL), incident type radio group defaulting to Ransomware, and KRITISCH amber escalation alert with SIAG-Berater message.

## What Was Built

### Task 1: severity.test.ts (TDD)
- Created `src/__tests__/severity.test.ts` as dedicated test file for `calculateSeverity`
- 7 tests covering all combinations: 5 KRITISCH cases (Q1=ja, Q3=ja, Q3=unbekannt, all-ja, Q1+Q2 precedence), 1 HOCH (only Q2=ja), 1 MITTEL (all nein)
- D-01 edge case explicitly tested: Q3=unbekannt triggers KRITISCH (worst-case assumption)
- Also applied prerequisite schema/component changes from plans 03-01 through 03-03 (were not yet in this worktree)

### Task 2: Step3Klassifikation implementation
- Replaced placeholder with full decision tree implementation
- **3 question cards** via QUESTIONS array `.map()` — each with pill toggle buttons (`type="button"`) and error display
- **Hidden fields** for q1, q2, q3, severity to satisfy Zod validation of pill-toggled values
- **Reactive severity computation**: `useEffect` watches q1/q2/q3, calls `calculateSeverity`, stores via `form.setValue('severity', ...)`
- **Severity display**: conditional block shown after all 3 questions answered — amber/navy/gray badge + message text
- **KRITISCH escalation alert**: amber border-2 card with warning symbol, SIAG-Berater message (F5.4)
- **Incident-Typ radio group**: 6 options (Ransomware, Phishing, DDoS, Datenverlust, Unbefugter Zugriff, Sonstiges), defaults to Ransomware via useEffect
- **KlassifikationForm inner component pattern**: avoids invalid hooks-in-render-prop issue

## Verification Results

- `npx tsc --noEmit`: PASS (no type errors)
- `npx vitest run`: PASS — 45/45 tests in 5 test files
  - severity.test.ts: 7/7
  - triage-logic.test.ts: 11/11
  - wizard-schemas.test.ts: 7/7
  - wizard-reducer.test.ts: 13/13
  - localStorage.test.ts: 7/7

## Decisions Made

1. **Inner component pattern**: `KlassifikationForm({ form })` inner component to use `useEffect` and `form.watch()` hooks — render prop functions cannot use hooks directly.
2. **Hidden inputs for pill validation**: `form.register()` hidden inputs ensure Zod receives q1/q2/q3 values set via `form.setValue()`. Without these, RHF submit data omits these fields.
3. **Type cast via `unknown`**: `form as unknown as UseFormReturn<KlassifikationData>` used to bridge StepForm's generic `FieldValues` type to specific `KlassifikationData`. Follows same pattern as 03-01 `zodResolver as any`.
4. **Ransomware default via useEffect**: `form.setValue('incidentType', 'ransomware')` if not yet set — avoids Zod schema default conflicts with enum validation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Applied prerequisite 03-01 through 03-03 source changes**
- **Found during:** Task 1 setup
- **Issue:** Worktree was at pre-phase-03 state — wizard-schemas.ts had empty placeholder schemas, wizard-types.ts lacked KlassifikationData, StepForm/StepNavigator lacked submit wiring
- **Fix:** `git checkout 38f61c3 -- [files]` to apply all prerequisite source file changes from the phase-03 merge commit
- **Files modified:** src/lib/wizard-schemas.ts, src/lib/wizard-types.ts, src/components/wizard/StepForm.tsx, src/components/wizard/StepNavigator.tsx, src/components/wizard/WizardShell.tsx, src/components/wizard/steps/Step1Einstieg.tsx, src/components/wizard/steps/Step2Erfassen.tsx, src/components/wizard/steps/StepInterstitial.tsx, src/__tests__/triage-logic.test.ts, src/__tests__/wizard-schemas.test.ts
- **Commit:** 5c49eb1

**2. [Rule 1 - Bug] Type cast via `unknown` for StepForm render prop**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** `form as UseFormReturn<KlassifikationData>` caused TS2352 error — UseFormReturn<FieldValues> and UseFormReturn<KlassifikationData> don't overlap sufficiently
- **Fix:** Changed to `form as unknown as UseFormReturn<KlassifikationData>` (double cast via unknown)
- **Files modified:** src/components/wizard/steps/Step3Klassifikation.tsx
- **Commit:** dd6b2c1

## Known Stubs

None. Screen 3 is fully implemented with real data wired:
- All 3 question pills update form state via `form.setValue()`
- Severity computed from actual user answers via `calculateSeverity`
- `form.setValue('severity', ...)` stores computed severity in form data for Zod validation on submit
- Incident type radio group writes directly via `form.register('incidentType')`

## Self-Check: PASSED

Files verified:
- FOUND: src/__tests__/severity.test.ts
- FOUND: src/components/wizard/steps/Step3Klassifikation.tsx (190+ lines, full implementation)

Commits verified:
- FOUND: 5c49eb1 test(03-04): add dedicated severity.test.ts with 7 calculateSeverity combinations
- FOUND: dd6b2c1 feat(03-04): implement Screen 3 Klassifikation decision tree + severity display
