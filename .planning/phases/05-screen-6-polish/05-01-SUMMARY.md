---
phase: 05-screen-6-polish
plan: "01"
subsystem: wizard-steps
tags:
  - screen-6
  - read-only
  - incident-summary
  - handoff
dependency_graph:
  requires:
    - "02-wizard-engine (WizardContext, useWizard)"
    - "03-screens-0-3-triage (wizard-types ErfassenData, KlassifikationData)"
    - "04-screens-4-5-response (ReaktionData, KommunikationData, playbook-data)"
  provides:
    - "Step6Dokumentation: read-only incident summary, SIAG handoff CTA"
  affects:
    - "src/components/wizard/steps/Step6Dokumentation.tsx"
tech_stack:
  added: []
  patterns:
    - "useWizard() directly (no StepForm) — same as Step 4 pattern per project rules"
    - "Null-safe optional chaining with ?? '—' fallback for every field"
    - "Severity color coding: red/amber/yellow by severity level"
key_files:
  created: []
  modified:
    - "src/components/wizard/steps/Step6Dokumentation.tsx"
    - "src/lib/wizard-types.ts (backport from main: full type definitions)"
    - "src/components/wizard/StepNavigator.tsx (backport from main: showNext prop)"
    - "src/lib/playbook-data.ts (backport from main: new file)"
decisions:
  - "Backported wizard-types.ts, StepNavigator.tsx, and playbook-data.ts from main branch — these files were created in Phases 3-5 on main but were not yet in this worktree branch (branched from earlier commit)"
  - "No StepForm used — Step 6 is read-only per plan requirement and project MEMORY rule"
  - "showNext=false on StepNavigator hides the forward button (final step)"
metrics:
  duration: "8min"
  completed: "2026-04-05"
  tasks_completed: 1
  files_modified: 4
requirements_satisfied:
  - F8.1
  - F8.3
  - F8.4
---

# Phase 05 Plan 01: Step6Dokumentation Read-Only Summary

**One-liner:** Read-only incident summary screen using useWizard() with 6 data sections, severity banner, SIAG handoff CTA, and Nächste Schritte.

## What Was Built

Replaced the `Step6Dokumentation.tsx` stub (which used `StepForm` + a dashed placeholder box) with a fully functional read-only incident summary screen.

The component uses `useWizard()` directly to read WizardState and renders:

1. **Page header** — title + current date (de-CH locale)
2. **Severity banner** — color-coded (red/amber/yellow) when `klassifikation` is populated
3. **Six summary cards:**
   - "Was ist passiert" — erkennungszeitpunkt, erkannt_durch, erste_auffaelligkeiten, loesegeld_meldung
   - "Betroffene Systeme" — pill tags per system or '—'
   - "Klassifikation" — severity, incidentType, kritische systeme, personendaten, angreifer aktiv
   - "Massnahmen-Fortschritt" — completedCount/totalSteps with inline progress bar
   - "Meldepflichten" — ISG/NCSC, DSG/DSGVO, FINMA thresholds
   - "Kommunikation" — checklist items, template statuses
4. **Nächste Schritte** — 5 bullet points for post-incident actions (F8.4)
5. **SIAG Handoff CTA** — navy background, phone + email placeholders (F8.3)
6. **StepNavigator** — `showNext={false}` (no forward navigation, back-only)

Every field displays `'—'` when the corresponding state is null or the field is empty.

## Deviations from Plan

### Auto-fixed Issues (Rule 3 — Blocking)

**1. [Rule 3 - Blocking] Backported dependencies from main branch**
- **Found during:** Task 1 pre-flight
- **Issue:** This worktree was branched from an earlier commit (pre-Phase 3). Files added in Phases 3-5 on main were missing: `wizard-types.ts` had empty interfaces, `StepNavigator.tsx` lacked `showNext` prop, `playbook-data.ts` did not exist.
- **Fix:** Copied `wizard-types.ts`, `StepNavigator.tsx`, and `playbook-data.ts` from `main` branch using `git show main:path/to/file` before writing Step6.
- **Files modified:** `src/lib/wizard-types.ts`, `src/components/wizard/StepNavigator.tsx`, `src/lib/playbook-data.ts`
- **Commit:** df8fe80

## Known Stubs

None — all 6 summary sections display actual wizard state data with graceful '—' fallbacks. The SIAG contact phone number (`+41 XX XXX XX XX`) and email (`incident@siag.ch`) are intentional placeholder values per plan specification (F8.3 requires placeholder contact info for MVP).

## Self-Check: PASSED

- `src/components/wizard/steps/Step6Dokumentation.tsx` — FOUND (229 lines)
- No `StepForm` import — confirmed (grep returns 0)
- No `dokumentationSchema` import — confirmed (grep returns 0)
- `useWizard()` usage — confirmed (line 16)
- `showNext={false}` — confirmed (line 272)
- `incident@siag.ch` — confirmed (line 256)
- `Nächste Schritte` section — confirmed (line 230)
- TypeScript compile — PASSED (zero errors)
- Commit df8fe80 — EXISTS
