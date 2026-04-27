---
phase: 19-wizard-resume-from-api
reviewed: 2026-04-16T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/__tests__/wizard-resume.test.ts
  - src/lib/migration.ts
  - src/app/wizard/page.tsx
  - src/components/wizard/WizardContext.tsx
  - src/components/wizard/WizardShell.tsx
  - src/hooks/useIncidentAPI.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

This phase delivers the wizard resume-from-API feature: a reverse mapping layer (`mapIncidentToWizardState`) in `migration.ts`, integration in `WizardContext.tsx` (hydration via `apiClient`), a server-component `page.tsx` that passes `?incident=<uuid>` down to `WizardShell`, and a comprehensive test suite.

The overall implementation is well-structured. The UUID validation in `WizardContext` closes a realistic injection path. The fallback chain (API -> localStorage -> initialState) is deliberate and documented against design decision IDs. No critical security issues were found.

Four warnings stand out: a `setIsHydrated(true)` call is missing after a successful API fetch, causing the loading spinner to remain visible indefinitely on the happy path; `mapIntToYesNo` conflates a genuinely absent value with an explicit `nein` answer; the `HYDRATE` action's type signature enforces a full `WizardState` but callers pass partial objects via unsafe casts; and `useIncidentAPI.ts` wraps errors in a new generic `Error`, destroying the `APIError`/`NetworkError` type information that `WizardContext` relies on for fallback decisions.

---

## Warnings

### WR-01: Missing `setIsHydrated(true)` on API success path — spinner never resolves

**File:** `src/components/wizard/WizardContext.tsx:60-97`

**Issue:** After a successful API fetch and `dispatch({ type: 'HYDRATE', … })` at line 63, `setIsHydrated(true)` is never called. Control falls through to the outer `setIsHydrated(true)` at line 111 only in the `else` branch (`incidentId` is falsy). When `incidentId` is truthy and the fetch succeeds, `isHydrated` stays `false` indefinitely; the `LoadingSpinner` rendered at line 129 never disappears and the wizard children are never mounted.

```tsx
// Current (broken):
try {
  const incident = await apiClient.get<Incident>(`/api/incidents/${incidentId}`)
  const mapped = mapIncidentToWizardState(incident)
  dispatch({ type: 'HYDRATE', data: { ...mapped, currentStep: 1 } as WizardState })
  // setIsHydrated(true) is missing here — falls off the end of the if-block,
  // then hits the outer setIsHydrated(true) only on the else branch
} catch (err) { … }

// Fix — add setIsHydrated(true) after dispatch:
try {
  const incident = await apiClient.get<Incident>(`/api/incidents/${incidentId}`)
  const mapped = mapIncidentToWizardState(incident)
  dispatch({ type: 'HYDRATE', data: { ...mapped, currentStep: 1 } as WizardState })
  setIsHydrated(true)   // <-- add this
} catch (err) { … }
```

Note: The `setIsHydrated(true)` at line 111 (`hydrate()` function end) is reached only when `!incidentId`. In the `incidentId` branch all code paths that return early do call `setIsHydrated(true)`, but the happy-path try-block does not. Confirm with a runtime test: the spinner should disappear after a 200 response.

---

### WR-02: `mapIntToYesNo` treats `null`/`undefined` as `'nein'` — silent data loss on unknown q1/q2

**File:** `src/lib/migration.ts:272-274`

**Issue:** `mapIntToYesNo` returns `'nein'` for any value that is not `1`, including `null` and `undefined`. When an incident was saved without answering q1 or q2 (fields are `number | null` in the schema), a resume will silently pre-fill those answers as `'nein'` — the opposite of the `'unbekannt'` default used by `mapIntToYesNoUnbekannt` for q3. This is an asymmetric contract: the wizard shows q1/q2 as binary (`ja`/`nein`) with no unknown state, so forced-`'nein'` may be acceptable by design, but the test at line 132 documents the expectation without acknowledging the data-loss risk. If the intent is truly `'nein'`-as-default, the function should be renamed to `mapIntToYesNoDefaultNein` or a comment should make the contract explicit.

**Fix:** Add an explicit comment to the function (or rename it) to communicate the intentional lossy mapping:

```ts
/**
 * Map integer (0/1/null) back to 'ja'/'nein'.
 * NOTE: null/undefined are treated as 'nein' because the wizard's
 * q1/q2 fields are strictly binary (no 'unbekannt' state).
 * Use mapIntToYesNoUnbekannt() for fields that support three states.
 */
export function mapIntToYesNo(val?: number | null): 'ja' | 'nein' {
  return val === 1 ? 'ja' : 'nein'
}
```

If the product decision is that an unanswered q1/q2 should not default to `'nein'`, change the signature to return `'ja' | 'nein' | 'unbekannt'` and handle it in the wizard form.

---

### WR-03: `HYDRATE` action type forces full `WizardState`, callers use `as WizardState` casts to work around it

**File:** `src/components/wizard/WizardContext.tsx:63,79,84,88`

**Issue:** The `WizardAction` type at `src/lib/wizard-types.ts:74` defines `{ type: 'HYDRATE'; data: WizardState }` — a complete, non-partial state. `mapIncidentToWizardState` returns `Partial<WizardState>`, so callers at lines 63, 79, 84, and 88 all spread the partial result and cast with `as WizardState` to satisfy the type checker. This defeats type safety: if `mapIncidentToWizardState` ever omits a required sub-field (e.g. `reaktion`), the cast hides it, and `wizardReducer` propagates `undefined` into `WizardState` silently.

**Fix (preferred):** Widen the `HYDRATE` action to accept a partial state, and make `wizardReducer` merge it with `initialState`:

```ts
// wizard-types.ts
| { type: 'HYDRATE'; data: Partial<WizardState> }

// WizardContext.tsx — wizardReducer
case 'HYDRATE':
  return { ...initialState, ...action.data }
```

The reducer already does `{ ...initialState, ...action.data }` (line 29), so the only change required is widening the action type. This eliminates all four unsafe `as WizardState` casts.

---

### WR-04: `IncidentAPI` methods wrap errors in `new Error(...)`, destroying `APIError`/`NetworkError` type — breaks `WizardContext` fallback logic

**File:** `src/hooks/useIncidentAPI.ts:34,71,93,128`

**Issue:** `IncidentAPI.createIncident`, `updateIncident`, `deleteIncident`, and `listIncidents` catch errors from `apiClient` and re-throw them as plain `new Error(...)`. This destroys the `APIError` and `NetworkError` instances that `shouldFallback()` and `err instanceof APIError` checks in `WizardContext.tsx` (lines 66, 74) rely on. However, `WizardContext` calls `apiClient.get` directly (not via `IncidentAPI`), so for the current phase's code this is not an active defect. The risk is that any future caller that routes through `IncidentAPI.getIncident` (which does NOT wrap errors — line 50) will get correct error propagation, but callers using the other four methods will not, producing inconsistent behavior.

`getIncident` at line 49 correctly lets `APIError` propagate (no try/catch wrapper). The inconsistency between `getIncident` (no wrapping) and the other four methods (wrapping) is a latent bug waiting to cause a fallback-logic failure.

**Fix:** Remove the try/catch wrappers from `createIncident`, `updateIncident`, `deleteIncident`, and `listIncidents`, matching the pattern of `getIncident`:

```ts
// Before (createIncident):
static async createIncident(input: CreateIncidentInput): Promise<Incident> {
  try {
    return await apiClient.post<Incident>('/api/incidents', input);
  } catch (error) {
    throw new Error(`Failed to create incident: …`);  // destroys APIError type
  }
}

// After:
static async createIncident(input: CreateIncidentInput): Promise<Incident> {
  return apiClient.post<Incident>('/api/incidents', input);
}
```

---

## Info

### IN-01: `eslint-disable-line react-hooks/exhaustive-deps` at line 114 suppresses a valid dependency warning

**File:** `src/components/wizard/WizardContext.tsx:114`

**Issue:** The `useEffect` that runs `hydrate()` has `incidentId` as a conceptual dependency but uses an empty dep-array with a suppression comment. The comment explains this is intentional because `incidentId` is a stable server-component prop. This is architecturally correct for a Next.js App Router server-to-client boundary, but the suppression silences ESLint without narrowing it. If the component were ever refactored to accept `incidentId` from client state, the suppression would hide a real stale-closure bug.

**Fix:** No action required now, but consider adding an `// @ts-expect-error` or code comment referencing the architecture decision so future readers understand why the suppression is safe.

---

### IN-02: `erkannt_durch` defaults to `'sonstiges'` when absent — may mislead resume UI

**File:** `src/lib/migration.ts:296`

**Issue:** When `incident.erkannt_durch` is `null` or `undefined`, `mapIncidentToWizardState` defaults it to `'sonstiges'`. A user resuming an incident where detection source was never entered will see "Sonstiges" pre-selected rather than an empty/unset state. If `ErfassenData['erkannt_durch']` were made optional, the form could detect the absence and leave the field blank. This is a UX concern rather than a bug.

**Fix:** If the wizard form supports an empty initial selection for `erkannt_durch`, change the default:

```ts
erkannt_durch: (incident.erkannt_durch as ErfassenData['erkannt_durch']) ?? undefined,
```

Otherwise, document the intentional default.

---

### IN-03: Test fixture uses `undefined` for `finma_24h`/`finma_72h` in `regulatorische_meldungen` — JSON serialisation drops these fields

**File:** `src/__tests__/wizard-resume.test.ts:47-49`

**Issue:** The `buildFullIncident` fixture sets `finma_24h: undefined` and `finma_72h: undefined` inside `regulatorische_meldungen`. When `JSON.stringify` is applied (e.g. during localStorage serialisation or API transport), `undefined` values in objects are silently dropped. The test data therefore represents a state that differs from what the API would actually return (the API returns `null` for absent optional fields, not `undefined`). This does not break any of the current test assertions, but if a future test checks `regulatorische_meldungen` round-trip behaviour, it may produce misleading results.

**Fix:** Use `null` instead of `undefined` for absent optional fields in API-shaped fixtures:

```ts
regulatorische_meldungen: {
  isg_24h: '2026-04-10T08:00:00.000Z',
  dsg: true,
  finma_24h: null,
  finma_72h: null,
},
```

---

_Reviewed: 2026-04-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
