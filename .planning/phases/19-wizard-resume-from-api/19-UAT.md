---
status: complete
phase: 19-wizard-resume-from-api
source:
  - .planning/phases/19-wizard-resume-from-api/19-01-SUMMARY.md
  - .planning/phases/19-wizard-resume-from-api/19-02-SUMMARY.md
started: "2026-04-17T14:40:00Z"
updated: "2026-04-17T16:40:00Z"
---

## Current Test

number: complete
name: All tests passed
expected: N/A
awaiting: none

## Tests

### 1. Wizard Resume - Happy Path
expected: |
  Navigate to /wizard?incident=99683c81-a61a-4cbf-a56d-8515bd9320c4
  Ladespinner erscheint während Fetch. Wizard öffnet bei Schritt 1 (Erkennung)
  mit vorausgefülltem Typ (Ransomware) und Schweregrad (KRITISCH).
result: pass

### 2. New Incident Unchanged
expected: |
  Navigate to /wizard (no ?incident param).
  Wizard opens at Step 0 with no pre-filled data. No loading spinner.
result: pass

### 3. Invalid UUID Rejection
expected: |
  Navigate to /wizard?incident=not-a-uuid
  Error toast appears immediately (no API call). Redirect after ~1500ms.
result: pass

### 4. 404 Handling
expected: |
  Navigate to /wizard?incident=00000000-0000-0000-0000-000000000000
  API call made, then error toast "Incident nicht gefunden". Redirect after ~1500ms.
result: pass

### 5. Type Mapping Correctness
expected: |
  Navigate to /wizard?incident=c09c17b8-4fbb-4351-be61-d789fe571dd2 (type=data_loss, severity=high).
  After loading, wizard shows "Datenverlust" as incident type and "HOCH" as severity.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
