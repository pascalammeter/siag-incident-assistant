---
phase: "03"
plan: "02"
subsystem: screens-triage
tags: [screen-1, hero-cta, einstieg, wizard-entry]
dependency_graph:
  requires: [03-01]
  provides: [Screen-1-Einstieg, ShitHappens-CTA]
  affects: [03-03, 03-04]
tech_stack:
  added: []
  patterns:
    - "Screen 1 uses direct useWizard dispatch — no StepForm (per D-05)"
    - "Hero button and alternative link both dispatch NEXT_STEP"
    - "min-h-[64px] for stress-tauglicher hero touch target (NF1.4)"
key_files:
  created: []
  modified:
    - src/components/wizard/steps/Step1Einstieg.tsx
decisions:
  - "[03-02] Step1Einstieg uses useWizard directly (no StepForm) per D-05 decision from Plan 01"
metrics:
  duration: "2min"
  completed_date: "2026-04-03"
  tasks_completed: 1
  files_changed: 1
---

# Phase 3 Plan 02: Screen 1 Einstieg Summary

Hero landing screen with "Shit Happens — Los geht's" CTA, Kurzbeschreibung, and "Vorfall erfassen" alternative entry link — no form fields, direct useWizard dispatch.

## What Was Built

### Task 1: Screen 1 Einstieg Hero Page

Replaced the StepForm placeholder with a clean hero-first entry screen:

- **Hero Section**: `text-3xl font-bold text-navy` heading "Sicherheitsvorfall?" + subheading in `text-gray-600`
- **Shit-Happens Button**: `bg-navy text-white text-2xl font-bold px-12 py-6 rounded-xl min-h-[64px] shadow-lg` — prominent, centered CTA dispatching `NEXT_STEP`
- **Kurzbeschreibung**: `bg-lightgray rounded-lg p-6` description card with full wizard journey explanation
- **Alternative Entry**: `text-navy underline font-bold` link-style button "Vorfall erfassen" dispatching same `NEXT_STEP`
- **No StepForm**: Component uses `useWizard()` directly — StepNavigator for back navigation provided by WizardShell (from Plan 01)

## Verification Results

- `npx tsc --noEmit`: PASS (no type errors)
- `npx vitest run`: PASS — 27/27 tests (3 test files)

## Decisions Made

1. **No StepForm on Screen 1**: Per D-05 decision from Plan 01 — this screen has no form fields, so StepForm wrapper was removed. Direct `useWizard` dispatch used instead.

## Deviations from Plan

None — plan executed exactly as written. The implementation matched the plan's code snippet verbatim (with HTML entity escaping for the apostrophe in "Los geht's").

## Known Stubs

None — Screen 1 is fully implemented. Steps 3-6 remain as placeholders to be implemented in Plans 03-03 and 03-04.

## Self-Check: PASSED

Files verified:
- FOUND: src/components/wizard/steps/Step1Einstieg.tsx (hero CTA, Kurzbeschreibung, alternative entry)

Commits verified:
- FOUND: 76cc250 feat(03-02): implement Screen 1 Einstieg hero page
