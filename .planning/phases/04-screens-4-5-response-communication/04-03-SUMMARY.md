---
phase: 04-screens-4-5-response-communication
plan: 03
subsystem: screen-5-kommunikation
tags: [meldepflicht, deadlines, checkliste, siag-cta, kommunikation]
dependency_graph:
  requires: [wizard-types, wizard-schemas, communication-templates, WizardContext, StepForm]
  provides: [Step5Kommunikation-meldepflicht, Step5Kommunikation-checkliste, Step5Kommunikation-cta]
  affects: [04-04-communication-templates-integration]
tech_stack:
  added: []
  patterns: [pill-button-questions, conditional-deadline-cards, checklist-toggle, inner-form-component]
key_files:
  created: []
  modified:
    - src/components/wizard/steps/Step5Kommunikation.tsx
decisions:
  - "Used inner KommunikationForm component pattern (same as Step3Klassifikation) for useWizard access inside StepForm children"
  - "Meldepflicht answers stored via form.setValue with shouldValidate for Zod consistency"
  - "Deadlines use unicode em-dash for ISG/DSG/FINMA law names"
metrics:
  duration: 1min
  completed: "2026-04-04T10:59:00Z"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 04 Plan 03: Screen 5 Meldepflicht + Checkliste + CTA Summary

Screen 5 Kommunikation with 3 Swiss legal reporting obligation questions (ISG/DSG/FINMA), conditional deadline cards computed from erkennungszeitpunkt, 6-item communication checklist, and SIAG CTA block.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Screen 5 Meldepflicht questions + deadlines + Checkliste + CTA | 5f67753 | src/components/wizard/steps/Step5Kommunikation.tsx |

## What Was Built

**Step5Kommunikation.tsx** (190 lines) - Complete Screen 5 implementation:

1. **Meldepflicht Questions** - 3 pill-button cards asking about critical infrastructure (ISG), personal data (DSG), and regulated entity (FINMA). Ja/Nein toggle with navy/white styling matching Screen 3 pattern.

2. **Conditional Deadline Display** - ISG shows 24h deadline card, DSG shows "So schnell wie moeglich" (no computed time), FINMA shows both 24h informal and 72h formal deadlines. All time-based deadlines computed from erkennungszeitpunkt via `computeDeadline()`.

3. **Edge Cases** - Missing erkennungszeitpunkt shows amber warning. All-Nein shows "Keine gesetzlichen Meldepflichten identifiziert" message.

4. **Kommunikations-Checkliste** - 6 toggleable checkbox items (Krisenstab, GL/VR, Mitarbeitende, Medien, Kunden, Partner).

5. **SIAG CTA Block** - Centered contact block with placeholder phone/email. No mailto/tel links per spec.

6. **Plan 04 Marker** - Comment placeholder for Kommunikationsbausteine section.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` - zero errors
- `npx vitest run` - 74/74 tests pass (7 test files)
- All acceptance criteria strings verified present in output file

## Known Stubs

- **SIAG contact info** (`+41 XX XXX XX XX`, `incident@siag.ch`) - intentional placeholder per spec, to be updated before Go-Live
- **Kommunikationsbausteine comment marker** - Plan 04 will add communication template section here
