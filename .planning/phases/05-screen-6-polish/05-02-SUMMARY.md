---
phase: 05-screen-6-polish
plan: "02"
subsystem: wizard-steps
tags:
  - screen-6
  - print
  - export
  - pdf
dependency_graph:
  requires:
    - "05-01 (Step6Dokumentation read-only summary)"
    - "02-wizard-engine (WizardContext, useWizard)"
  provides:
    - "Print-to-PDF export via window.print() on Step 6"
    - "@media print CSS in globals.css hiding nav and showing print-only content"
  affects:
    - "src/app/globals.css"
    - "src/components/wizard/steps/Step6Dokumentation.tsx"
    - "src/components/wizard/WizardProgress.tsx"
    - "src/components/wizard/StepNavigator.tsx"
tech_stack:
  added: []
  patterns:
    - "window.print() with SSR guard (typeof window !== 'undefined')"
    - "Tailwind print: variant for per-element print hiding"
    - "@media print in globals.css for layout-level print overrides"
    - "print-section CSS class for page-break-inside: avoid on summary cards"
    - "print-only CSS class to show print header only during print"
key_files:
  created: []
  modified:
    - "src/app/globals.css (added @media print block)"
    - "src/components/wizard/steps/Step6Dokumentation.tsx (handlePrint, export buttons, print-only header, print-section classes)"
    - "src/components/wizard/WizardProgress.tsx (added print:hidden to outer wrapper)"
    - "src/components/wizard/StepNavigator.tsx (added print:hidden to outer wrapper, added showNext prop)"
    - "src/lib/wizard-types.ts (backport: full type definitions)"
    - "src/lib/playbook-data.ts (backport: new file, RANSOMWARE_PLAYBOOK)"
decisions:
  - "Used Tailwind print: variant for component-level hiding — clean, no extra CSS needed"
  - "Used .print-only + .print-section custom classes in @media print block — needed for layout-level overrides that Tailwind cannot handle (display: block !important for hidden elements)"
  - "SSR guard (typeof window !== 'undefined') on window.print() — required for Next.js static export compatibility"
  - "Backported wizard-types.ts and playbook-data.ts from main branch — same requirement as 05-01 since this worktree was branched from Phase 2"
metrics:
  duration: "6min"
  completed: "2026-04-05"
  tasks_completed: 2
  files_modified: 6
requirements_satisfied:
  - F8.2
---

# Phase 05 Plan 02: Print-to-PDF Export Summary

**One-liner:** Print-to-PDF export for Screen 6 via window.print() with @media print CSS hiding wizard nav and showing clean report layout.

## What Was Built

Added print-to-PDF export functionality to Step 6 (Incident-Zusammenfassung). Users can click "Bericht exportieren (PDF)" to open the browser print dialog, which produces a clean, navigation-free report layout.

### Changes Made

**globals.css — @media print block:**
- `.print-hidden`: hides elements with `display: none !important` (fallback for non-Tailwind usage)
- `header, footer`: hidden in print
- `body`: white background, black text, 11pt font size
- `main`: full width, no padding/margin
- `.print-section`: `page-break-inside: avoid` — prevents mid-card page breaks
- `.print-only`: `display: block !important` — shows the print-only SIAG header
- `.bg-lightgray` / `.bg-navy`: color-adjust for accurate print rendering

**WizardProgress.tsx:**
- Added `print:hidden` to outer wrapper `<div className="w-full mb-6">` — hides progress bar in print

**StepNavigator.tsx:**
- Added `print:hidden` to outer wrapper div — hides nav buttons in print
- Added `showNext` and `nextButtonType` props (backport from main branch)

**Step6Dokumentation.tsx — full replacement of Phase 2 stub:**
- `handlePrint()` function with `typeof window !== 'undefined'` SSR guard
- Print-only header div (class `print-only hidden`) — invisible in browser, visible in print
- Export button near top (`print:hidden`) — "Bericht exportieren (PDF)"
- Second export button inside SIAG Handoff CTA (`print:hidden`) — "Bericht für GL/VR exportieren (PDF)"
- All 6 summary cards + Nächste Schritte + SIAG CTA div have `print-section` class

## Deviations from Plan

### Auto-fixed Issues (Rule 3 — Blocking)

**1. [Rule 3 - Blocking] Backported dependencies from main branch (same as 05-01)**
- **Found during:** Task 1 pre-flight
- **Issue:** This worktree (`worktree-agent-ae4760c4`) was branched from Phase 2 (commit `716cdc6`). The 05-01 plan ran in a different worktree (`df8fe80` commit) and its changes were not yet in this branch. `wizard-types.ts` had empty interfaces, `StepNavigator.tsx` lacked `showNext` prop, `playbook-data.ts` did not exist.
- **Fix:** Copied full type definitions into `wizard-types.ts`, created `playbook-data.ts`, and updated `StepNavigator.tsx` with `showNext`/`nextButtonType` props — all matching the `df8fe80` commit content from main.
- **Files modified:** `src/lib/wizard-types.ts`, `src/lib/playbook-data.ts`, `src/components/wizard/StepNavigator.tsx`
- **Commit:** 0f61b4b

**2. [Rule 3 - Blocking] Step6 stub required full replacement**
- **Found during:** Task 2
- **Issue:** The worktree's `Step6Dokumentation.tsx` was the Phase 2 stub using `StepForm` and `dokumentationSchema`. The 05-01 full component from the other worktree was not merged here.
- **Fix:** Wrote the full read-only component (matching `df8fe80` content) plus all Task 2 additions (handlePrint, export buttons, print-only header, print-section classes) in a single file write.
- **Files modified:** `src/components/wizard/steps/Step6Dokumentation.tsx`
- **Commit:** 8d2cf3f

## Known Stubs

None — all print functionality is fully wired. Export buttons call `handlePrint()` directly. SIAG contact details (`+41 XX XXX XX XX`, `incident@siag.ch`) are intentional MVP placeholders per F8.3 (same as 05-01).

## Self-Check: PASSED

- `src/app/globals.css` contains `@media print` block — FOUND (line 25)
- `src/components/wizard/WizardProgress.tsx` has `print:hidden` — FOUND (line 12)
- `src/components/wizard/StepNavigator.tsx` has `print:hidden` — FOUND (line 31)
- `src/components/wizard/steps/Step6Dokumentation.tsx` has `window.print()` — FOUND (line 32)
- `handlePrint` function with SSR guard — FOUND (lines 30-34)
- Two export buttons present — FOUND (lines 67, 288)
- Print-only header — FOUND (line 51)
- `print-section` on all 6 cards + Nächste Schritte + SIAG CTA — FOUND (8 occurrences)
- TypeScript compile (`npx tsc --noEmit`) — PASSED (zero errors)
- Commit 0f61b4b (Task 1) — EXISTS
- Commit 8d2cf3f (Task 2) — EXISTS
