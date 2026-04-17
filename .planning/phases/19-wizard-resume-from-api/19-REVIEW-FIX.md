---
phase: 19-wizard-resume-from-api
fixed_from: 2026-04-17T00:00:00Z
fix_scope: critical_warning
findings_in_scope: 4
fixed: 4
skipped: 0
iteration: 1
status: all_fixed
---

# Phase 19: Code Review Fix Report

**Fixed:** 2026-04-17T00:00:00Z
**Scope:** Critical + Warning only (4 findings)
**Status:** all_fixed

## Summary

All 4 warning findings from the code review were resolved in separate atomic commits. Tests pass after all fixes.

---

## Fixes Applied

### WR-01: setIsHydrated(true) on API success path
**Commit:** `fix(19): WR-01 add setIsHydrated(true) on API success path`
**File:** `src/components/wizard/WizardContext.tsx`
**Change:** Added `setIsHydrated(true)` immediately after `dispatch({ type: 'HYDRATE', ... })` in the successful API fetch try-block. The wizard loading spinner now resolves correctly on the happy path when an incident is loaded from the API.

### WR-02: mapIntToYesNo null/undefined contract documented
**Commit:** `fix(19): WR-02 document intentional lossy null mapping in mapIntToYesNo`
**File:** `src/lib/migration.ts`
**Change:** Added a JSDoc comment to `mapIntToYesNo` explicitly documenting that null/undefined are intentionally mapped to `'nein'` because q1/q2 are strictly binary fields with no `'unbekannt'` state. The comment directs readers to `mapIntToYesNoUnbekannt()` for ternary fields.

### WR-03: HYDRATE type widened to Partial<WizardState>
**Commit:** `fix(19): WR-03 widen HYDRATE type to Partial<WizardState>, remove unsafe casts`
**File:** `src/lib/wizard-types.ts`, `src/components/wizard/WizardContext.tsx`
**Change:** Changed `{ type: 'HYDRATE'; data: WizardState }` to `{ type: 'HYDRATE'; data: Partial<WizardState> }` in `WizardAction`. Removed all 4 unsafe `as WizardState` casts from callers in `WizardContext.tsx`. The reducer's existing `{ ...initialState, ...action.data }` merge pattern handles partial data safely.

### WR-04: IncidentAPI error wrapping removed
**Commit:** `fix(19): WR-04 remove error-wrapping try/catch from IncidentAPI methods`
**File:** `src/hooks/useIncidentAPI.ts`
**Change:** Removed try/catch wrappers from `createIncident`, `updateIncident`, `deleteIncident`, and `listIncidents`. Each method now returns the `apiClient` call directly, matching the pattern of `getIncident`. `APIError` and `NetworkError` types now propagate correctly to callers.

---

## Skipped

None.

---

## Info Findings (out of scope)

The following Info findings were not addressed (fix scope: critical_warning only):

- **IN-01:** `eslint-disable-line react-hooks/exhaustive-deps` suppression in `WizardContext.tsx` — intentional by architecture
- **IN-02:** `erkannt_durch` defaults to `'sonstiges'` — UX concern, not a bug
- **IN-03:** Test fixture uses `undefined` for `finma_24h`/`finma_72h` — does not affect current assertions

---

_Fixes applied: 2026-04-17_
_Agent: gsd-code-fixer (orchestrated by gsd-code-review-fix)_
