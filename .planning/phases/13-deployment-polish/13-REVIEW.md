---
phase: 13-deployment-polish
reviewed: 2026-04-09T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/__tests__/step6-save.test.ts
  - src/components/wizard/steps/Step6Dokumentation.tsx
  - src/lib/migration.ts
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-04-09T00:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the three files introduced by plan 13-05 (wire wizard save to API): the mapping/migration layer (`migration.ts`), the Step 6 summary/save component (`Step6Dokumentation.tsx`), and the test suite (`step6-save.test.ts`).

The mapping logic is correct and well-structured. The test suite covers the key mapping paths thoroughly with clear fixtures. The main concerns are: a division-by-zero crash in the progress-bar rendering when a playbook has no steps; misleading stale metadata tags written on every new incident save; and a few logic-gap issues in boolean display fields where `undefined` is silently treated as `false`.

No security vulnerabilities or data-loss conditions were found.

## Warnings

### WR-01: Division by zero in progress bar — NaN width crashes rendering

**File:** `src/components/wizard/steps/Step6Dokumentation.tsx:218`

**Issue:** `Math.round((completedCount / totalSteps) * 100)` is evaluated without guarding against `totalSteps === 0`. If `getPlaybook()` returns a playbook with no phases or all phases have no steps, `totalSteps` is `0`. `completedCount / 0` produces `NaN`, which becomes the CSS `width` value (`width: NaN%`). While modern browsers silently ignore invalid style values, the progress bar renders as invisible/empty with no indication of why. Additionally, the text below the bar compares `completedCount < totalSteps` — when both are `0`, this is `false`, so it incorrectly shows "Alle Massnahmen abgeschlossen" even though no steps exist.

**Fix:**
```tsx
// Line 33-36: guard totalSteps
const totalSteps = useMemo(
  () => playbook.phases.reduce((sum, p) => sum + p.steps.length, 0),
  [playbook]
)
const progressPercent = totalSteps > 0
  ? Math.round((completedCount / totalSteps) * 100)
  : 0

// Line 215-229: use progressPercent
<div
  className="bg-navy h-2 rounded-full"
  style={{ width: `${progressPercent}%` }}
/>
// ...
{totalSteps === 0 ? (
  <span className="text-gray-500">Keine Massnahmen definiert</span>
) : completedCount < totalSteps ? (
  <span className="text-amber-800 dark:text-amber-400">
    {totalSteps - completedCount} Massnahmen ausstehend
  </span>
) : (
  <span className="text-navy dark:text-slate-200">Alle Massnahmen abgeschlossen</span>
)}
```

---

### WR-02: Unhandled promise in retry toast action

**File:** `src/components/wizard/steps/Step6Dokumentation.tsx:69`

**Issue:** The error toast retry callback is `onClick: () => handleSave()`. `handleSave` is an `async` function that returns a Promise. The arrow function discards that Promise, so if the retry also fails, the rejection is silently swallowed — no error boundary or unhandled rejection warning is triggered. This means a user clicking "Wiederholen" on a failed save gets no feedback if the retry also fails.

**Fix:**
```tsx
showErrorToast('Fehler beim Speichern. Bitte versuchen Sie es erneut.', {
  label: 'Wiederholen',
  onClick: () => void handleSave(),
  // OR if the toast system supports async actions:
  // onClick: handleSave,
})
```

Using `void` makes the intent explicit and suppresses the floating-promise lint warning. If the toast library supports async `onClick`, pass `handleSave` directly so errors can be caught at the toast layer.

---

### WR-03: Misleading boolean display — undefined treated as false

**File:** `src/components/wizard/steps/Step6Dokumentation.tsx:145`

**Issue:** Three display fields use the same logic pattern:
- Line 145: `erfassen?.loesegeld_meldung ? 'Ja' : erfassen ? 'Nein' : '—'`
- Line 185: `klassifikation?.q1SystemeBetroffen === 'ja' ? 'Ja' : klassifikation ? 'Nein' : '—'`
- Line 190: `klassifikation?.q2PdBetroffen === 'ja' ? 'Ja' : klassifikation ? 'Nein' : '—'`

When the parent object exists but the field itself is `undefined` (e.g., the user skipped that step, or the field was never set), the component displays 'Nein' instead of the neutral '—'. This misinforms users: a missing/unanswered field appears as a negative answer. For a security incident report this matters — displaying "Lösegeld-Forderung: Nein" when the user never answered is factually incorrect.

**Fix:**
```tsx
// Line 145 — check field explicitly
{erfassen?.loesegeld_meldung === true
  ? 'Ja'
  : erfassen?.loesegeld_meldung === false
  ? 'Nein'
  : '—'}

// Line 185
{klassifikation?.q1SystemeBetroffen === 'ja'
  ? 'Ja'
  : klassifikation?.q1SystemeBetroffen === 'nein'
  ? 'Nein'
  : '—'}

// Line 190 — same pattern as q1SystemeBetroffen above
```

---

### WR-04: Stale migration metadata written to all new incidents

**File:** `src/lib/migration.ts:177-178`

**Issue:** `mapIncidentState` is now used both for migrating old localStorage data AND for saving fresh wizard sessions in v1.1. Lines 177–178 unconditionally write:
```ts
tags: ['v1.0-migrated'],
notes: 'Auto-migrated from v1.0 localStorage',
```
Every incident created via the Step 6 "Speichern & Abschliessen" button gets tagged `v1.0-migrated` and has the note "Auto-migrated from v1.0 localStorage" stored in the database. This pollutes query results, makes filtering by tag unreliable, and embeds factually false provenance data for all new incidents.

**Fix:** The function needs a call-site context parameter, or two separate code paths:
```ts
// Option A — add a context parameter
export function mapIncidentState(
  v1State: LegacyWizardState,
  context: 'migration' | 'new_save' = 'new_save'
): CreateIncidentInput | null {
  // ...
  const incident: CreateIncidentInput = {
    // ...
    metadata: context === 'migration'
      ? {
          tags: ['v1.0-migrated'],
          notes: 'Auto-migrated from v1.0 localStorage',
          custom_fields: { ... },
        }
      : {
          custom_fields: { ... },
        },
  };
```

The `migrateIncidents()` function at line 225 would pass `'migration'`, while `Step6Dokumentation.tsx` would pass `'new_save'` (or omit it to use the default).

---

## Info

### IN-01: Placeholder phone number hardcoded in production component

**File:** `src/components/wizard/steps/Step6Dokumentation.tsx:327-329`

**Issue:** The SIAG handoff section contains `href="tel:+41XXXXXXXXX"` and displays `+41 XX XXX XX XX` as the contact number. This is a placeholder, not a real number. Users of the production application who click this link will reach nothing. The `tel:` link is also malformed and will not function on mobile.

**Fix:** Replace with the real SIAG emergency number before production launch, or make it configurable via an environment variable:
```tsx
const SIAG_PHONE = process.env.NEXT_PUBLIC_SIAG_PHONE ?? '+41XXXXXXXXX'
// ...
<a href={`tel:${SIAG_PHONE}`}>{SIAG_PHONE}</a>
```

---

### IN-02: `mapIncidentState` logs to console in library code

**File:** `src/lib/migration.ts:136`, `src/lib/migration.ts:143`

**Issue:** `console.warn('[Migration] Missing or invalid incident_type...')` and `console.warn('[Migration] Missing or invalid severity...')` are called in the mapping library. Library code should not log directly to the console in production — callers (like `Step6Dokumentation.tsx`) already handle the `null` return with a user-facing toast. These warns will surface in production browser consoles for normal user interactions (e.g., partially-filled wizard state).

**Fix:** Remove the `console.warn` calls from `mapIncidentState` (they are redundant given the `null` return convention), or gate them behind a debug flag:
```ts
if (process.env.NODE_ENV === 'development') {
  console.warn('[Migration] Missing or invalid incident_type, skipping state');
}
return null;
```

---

_Reviewed: 2026-04-09T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
