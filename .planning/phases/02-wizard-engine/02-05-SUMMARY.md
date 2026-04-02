---
phase: 02-wizard-engine
plan: 05
subsystem: wizard-steps
tags: [wizard, steps, scaffold, navigation, placeholder]
dependency_graph:
  requires: ["02-01", "02-03", "02-04"]
  provides: ["step-components", "wizard-on-page", "end-to-end-wizard"]
  affects: ["phase-3", "phase-4", "phase-5"]
tech_stack:
  added: []
  patterns: ["step-per-file", "useWizard-hook", "StepForm-render-prop"]
key_files:
  created:
    - src/components/wizard/steps/StepInterstitial.tsx
    - src/components/wizard/steps/Step1Einstieg.tsx
    - src/components/wizard/steps/Step2Erfassen.tsx
    - src/components/wizard/steps/Step3Klassifikation.tsx
    - src/components/wizard/steps/Step4Reaktion.tsx
    - src/components/wizard/steps/Step5Kommunikation.tsx
    - src/components/wizard/steps/Step6Dokumentation.tsx
  modified:
    - src/components/wizard/WizardShell.tsx
    - src/app/page.tsx
decisions:
  - "Placeholder step components with dashed-border empty form areas -- real fields in Phases 3-5"
  - "StepInterstitial manages its own navigation (no StepNavigator at step 0)"
  - "Tailwind v4 tokens (bg-navy, text-navy) instead of siag- prefixed classes"
metrics:
  duration: 10min
  completed: "2026-04-02T10:15:00Z"
---

# Phase 2 Plan 5: Step Scaffold + Wizard Mount Summary

7 placeholder step components wired into WizardShell with end-to-end navigation, progress bar, and localStorage persistence on the app main page.

## What Was Built

### Task 1: 7 Placeholder Step Components

Created `src/components/wizard/steps/` with 7 components:

- **StepInterstitial.tsx** -- No-Go confirmation screen (step 0) with checkbox gate and "Verstanden -- Weiter" button. Uses `useWizard` directly, dispatches `CONFIRM_NO_GO` and `NEXT_STEP`.
- **Step1Einstieg.tsx** through **Step6Dokumentation.tsx** -- Each wraps `StepForm` with respective Zod schema and shows a dashed-border placeholder for future form fields.

All components: `'use client'`, zero `next/*` imports, consistent SIAG design token usage.

**Commits:** `757fc1a`, `bbe34ba`

### Task 2: WizardShell Wiring + Page Mount

- **WizardShell.tsx** updated: imports all 7 step components, replaces placeholder divs with actual JSX in `stepComponents` record. StepNavigator hidden at step 0 (Interstitial has its own button).
- **page.tsx** updated: renders `<WizardShell />` inside `<main>` tag as the app's landing experience.

**Commit:** `bbe34ba`

### Bug Fix: Tailwind v4 Class Names

Replaced invalid `siag-navy`, `siag-amber` prefixed Tailwind classes with correct v4 custom tokens (`bg-navy`, `text-navy`, `border-amber`, etc.) defined in `globals.css` `@theme{}` block.

**Commit:** `91ec553`

### Task 3: Human Verification (Checkpoint)

User verified in browser:
- Checkbox on Interstitial disables "Verstanden -- Weiter" until checked
- Navigation through all 6 steps via Weiter/Zurueck works correctly
- Progress bar updates on each step transition
- No console errors

**Result:** Approved

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Invalid Tailwind v4 class prefixes**
- **Found during:** Task 2 (build verification)
- **Issue:** Step components used `text-siag-navy`, `bg-siag-navy`, `border-siag-amber` -- these classes don't exist in Tailwind v4 theme. The correct tokens defined in globals.css are `--color-navy`, `--color-amber` etc., which produce utilities like `bg-navy`, `text-navy`.
- **Fix:** Replaced all `siag-` prefixed classes across 7 step files and WizardShell
- **Files modified:** All 7 step components, WizardShell.tsx
- **Commit:** `91ec553`

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| Step1-6 | form area | Dashed-border empty div | Form fields added in Phases 3-5 |
| StepInterstitial | rules area | "8 No-Go-Regeln werden hier in Phase 3 eingefuegt" | Content from Phase 3 |

These stubs are intentional -- the plan's goal is scaffold/navigation, not form content. Phases 3-5 will populate all form fields and No-Go rules.

## Verification Results

- `npm run build`: passes
- 7 step files in `src/components/wizard/steps/`
- Zero `next/*` imports in wizard components
- Browser: all 7 screens navigable, progress bar correct, localStorage persistence works

## Phase 2 Completion

This plan (02-05) is the final plan of Phase 2 (wizard-engine). All 5 plans are now complete:

| Plan | Name | Status |
|------|------|--------|
| 02-01 | WizardContext + Reducer | Done |
| 02-02 | localStorage Persistence | Done |
| 02-03 | ProgressBar + StepNavigator | Done |
| 02-04 | Zod Schemas + StepForm | Done |
| 02-05 | Step Scaffold + Wizard Mount | Done |

Phase 2 deliverable: A fully navigable 7-screen wizard with state management, persistence, progress tracking, and placeholder forms -- ready for Phase 3 content.

## Self-Check: PASSED

- All 10 key files: FOUND
- Commits 757fc1a, bbe34ba, 91ec553: FOUND
