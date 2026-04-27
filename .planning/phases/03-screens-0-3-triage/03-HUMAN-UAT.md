---
status: partial
phase: 03-screens-0-3-triage
source: [03-VERIFICATION.md]
started: 2026-04-03T12:02:00Z
updated: 2026-04-03T12:02:00Z
---

## Current Test

number: 1
name: Full Triage Flow — End-to-End Navigation
expected: |
  Load localhost:3000, complete Screen 0 (checkbox + "Verstanden"), Screen 1 (hero button),
  Screen 2 (fill date + dropdown + submit), Screen 3 (answer 3 questions).
  Flow advances through all 4 screens without errors.
  Severity result appears immediately after all 3 questions answered.
  KRITISCH escalation alert appears when Q1=Ja selected.
awaiting: user response

## Tests

### 1. Full Triage Flow — End-to-End Navigation
expected: Load localhost:3000, complete Screen 0 (checkbox + "Verstanden"), Screen 1 (hero button), Screen 2 (fill date + dropdown + submit), Screen 3 (answer 3 questions). Flow advances through all 4 screens without errors. Severity result appears immediately after all 3 questions answered. KRITISCH escalation alert appears when Q1=Ja selected.
result: [pending]

### 2. Zod Validation Fires on Submit
expected: On Screen 2, click "Weiter" with empty Erkennungszeitpunkt and Erkannt-durch fields. Validation error messages appear below the fields. Navigation does NOT advance.
result: [pending]

### 3. Q3=Unbekannt Triggers KRITISCH
expected: On Screen 3, select Q1=Nein, Q2=Nein, Q3=Unbekannt. Severity result shows KRITISCH (amber badge + escalation alert).
result: [pending]

### 4. Screen 0 Checkbox Gate
expected: On Screen 0, the "Verstanden — Weiter" button is disabled (grayed out) until the checkbox is checked. After checking, button becomes active.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
