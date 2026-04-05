---
phase: "05"
plan: "04"
subsystem: "wizard-steps"
tags: ["mobile", "responsive", "css", "tailwind", "polish"]
dependency_graph:
  requires: []
  provides: ["mobile-layout-fixes-steps-1-4-5"]
  affects: ["Step1Einstieg", "Step4Reaktion", "Step5Kommunikation"]
tech_stack:
  added: []
  patterns: ["responsive-breakpoints", "flex-wrap", "w-full-max-w"]
key_files:
  created: []
  modified:
    - "src/components/wizard/steps/Step1Einstieg.tsx"
    - "src/components/wizard/steps/Step4Reaktion.tsx"
    - "src/components/wizard/steps/Step5Kommunikation.tsx"
key_decisions:
  - "[05-04] Hero button uses px-6 sm:px-12 — mobile padding prevents 375px overflow, desktop unchanged"
  - "[05-04] Progress bar w-full max-w-xs replaces fixed w-48 — scales to viewport width"
  - "[05-04] Template card headers use flex-wrap gap-2 — prevents title/button overflow on narrow viewports"
  - "[05-04] Deadline display uses flex-col sm:flex-row — stacks vertically on mobile, side-by-side on sm+"
metrics:
  duration: "2min"
  completed_date: "2026-04-05"
  tasks_completed: 1
  files_modified: 3
requirements_satisfied: ["NF1.4"]
---

# Phase 05 Plan 04: Mobile Layout Regressions Fix Summary

Targeted Tailwind class changes across 3 step components to eliminate horizontal overflow and cramped UI on 375px viewports — 4 known regressions fixed in 4 precise edits, zero structural changes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix Step1, Step4, Step5 mobile CSS issues | bb303e4 | Step1Einstieg.tsx, Step4Reaktion.tsx, Step5Kommunikation.tsx |

## Fixes Applied

### Fix 1 — Step1Einstieg.tsx: Hero button overflow (APPLIED)

- **Before:** `px-12` (48px horizontal padding on all viewports)
- **After:** `px-6 sm:px-12` (24px on mobile, 48px on sm+)
- **Effect:** Eliminates horizontal scroll on 375px; desktop appearance unchanged

### Fix 2 — Step4Reaktion.tsx: Progress bar fixed width (APPLIED)

- **Before:** `w-48` (fixed 192px container)
- **After:** `w-full max-w-xs` (scales to available width, capped at 320px on larger screens)
- **Effect:** Progress bar stretches to fill the `flex items-center justify-between` row on mobile

### Fix 3 — Step5Kommunikation.tsx: Template card header overflow (APPLIED)

- **Before:** `flex items-center justify-between` (no wrap)
- **After:** `flex flex-wrap gap-2 items-center justify-between`
- **Effect:** Title and "Kopieren" button wrap to second line on narrow viewports; gap-2 provides spacing

### Fix 4 — Step5Kommunikation.tsx: Deadline display stacking (APPLIED)

- **Before:** `flex items-center justify-between` (horizontal layout at all widths)
- **After:** `flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between`
- **Effect:** Law label + deadline text stack vertically on mobile; badge moves below on mobile

## Sweep Results

Files swept: Step2Erfassen.tsx, Step3Klassifikation.tsx, StepNavigator.tsx, WizardProgress.tsx

| File | Finding | Action |
|------|---------|--------|
| Step2Erfassen.tsx | `flex gap-2 items-end` for datetime + "Jetzt eintragen" | No fix needed — input uses `flex-1`, button has `whitespace-nowrap`, still fits at 375px |
| Step3Klassifikation.tsx | Pill button row | Already has `flex gap-3 flex-wrap` — correct |
| StepNavigator.tsx | Both buttons | `min-h-[44px]` confirmed on both; `px-6 py-3` adequate touch target |
| WizardProgress.tsx | Step label row | `hidden md:flex` — not visible on mobile, no overflow risk |

No additional fixes applied during sweep.

## Deviations from Plan

None — plan executed exactly as written. All 4 targeted fixes applied as specified. Sweep found no additional issues requiring changes.

## Known Stubs

None — this plan makes CSS-only changes; no data or stub issues.

## Self-Check: PASSED

- [x] `Step1Einstieg.tsx` contains `px-6 sm:px-12`
- [x] `Step4Reaktion.tsx` contains `w-full max-w-xs`
- [x] `Step5Kommunikation.tsx` contains `flex-wrap`
- [x] `Step5Kommunikation.tsx` contains `flex-col sm:flex-row`
- [x] Commit bb303e4 exists
- [x] TypeScript compiles cleanly (zero errors)
