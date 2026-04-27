# Phase 19: Wizard Resume from API - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement W1.2: Extend WizardContext to fetch an existing incident from the API on mount when an `incidentId` is passed. Create a `/wizard` route that accepts `?incident=<id>` as a query parameter and hydrates the wizard state from the API before rendering.

**Deliverables:**
1. `src/app/wizard/page.tsx` — new route that reads `searchParams.incident`, passes it to WizardShell
2. `WizardShell` extended with optional `incidentId` prop
3. `WizardContext` / `WizardProvider` extended with API-fetch-on-mount logic (when `incidentId` is provided)
4. Loading spinner shown during API fetch; Interstitial (step 0) skipped for resume flow

**Out of scope:**
- Saving wizard progress back to the API on every step change (that is W1.3 — submit on complete, already in Phase 9)
- SSO / authentication changes
- UI design beyond loading/error state

</domain>

<decisions>
## Implementation Decisions

### Wizard Route Architecture
- **D-01:** Create a dedicated `/wizard` route at `src/app/wizard/page.tsx` (App Router Server Component).
- **D-02:** The root page `/` (`src/app/page.tsx`) remains unchanged — it renders `WizardShell` without an `incidentId` and is the "new incident" entry point.
- **D-03:** `/wizard?incident=<uuid>` is the resume URL. `IncidentList.tsx` already navigates here — the new route makes this link work.
- **D-04:** `searchParams.incident` is read in the Server Component and passed as `incidentId` prop to `WizardShell`.

### Loading State During API Fetch
- **D-05:** Show a loading spinner (`LoadingSpinner`) while `getIncident()` is in-flight. No partial/optimistic rendering from localStorage during the fetch.
- **D-06:** The `WizardProvider` (or `WizardShell`) must not render wizard steps until either the API data has been hydrated or an error/fallback has been resolved. Same pattern as the existing `isHydrated` guard in `WizardContext`.

### Resume Step Behavior
- **D-07:** When resuming (incidentId provided), start at **Step 1 (Einstieg)**, not Step 0 (Interstitial). The Interstitial splash screen is irrelevant for an existing incident.
- **D-08:** For new incidents (no incidentId), behavior is unchanged — still starts at Step 0.

### Error Handling on API Fetch Failure
- **D-09:** Follow the existing Phase 9 fallback chain: API → localStorage → empty state.
- **D-10:** `useIncident.getIncident()` already handles network errors by falling back to localStorage — reuse this behavior.
- **D-11:** If fallback to localStorage succeeds: show a Toast warning ("Offline-Modus — zwischengespeicherte Daten geladen") and continue rendering.
- **D-12:** If localStorage also has no data: show a Toast error and render wizard at Step 1 with empty state.
- **D-13:** 404 (incident not found / soft-deleted): show error Toast, redirect to `/incidents` list.

### Claude's Discretion
- Exact mapping of API `Incident` fields to `WizardState` step keys (ErfassenData, KlassifikationData, etc.) — Claude decides based on field names and wizard-types.ts.
- Whether to extend `WizardProvider` with an `incidentId` prop or handle fetch logic in a new wrapper component.
- Exact Toast message copy (German, stress-resistant language, per SIAG design guidelines).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Wizard Architecture
- `src/components/wizard/WizardContext.tsx` — existing hydration pattern (`useEffect`, `isHydrated` guard, `HYDRATE` action)
- `src/components/wizard/WizardShell.tsx` — entry point for WizardProvider and step routing
- `src/lib/wizard-types.ts` — WizardState, WizardAction, step data interfaces

### API / Hook Layer
- `src/hooks/useIncident.ts` — `getIncident(id)` with built-in localStorage fallback
- `src/hooks/useIncidentAPI.ts` — raw API calls
- `src/lib/incident-types.ts` — `Incident` type (API model) — must be mapped to WizardState fields

### Route Entry Points
- `src/app/page.tsx` — root wizard (new incident) — must NOT be changed
- `src/app/incidents/page.tsx` — list that navigates to `/wizard?incident=xxx`
- `src/components/incidents/IncidentList.tsx` — `handleViewClick` already pushes `/wizard?incident=${id}`

### Requirements
- `.planning/REQUIREMENTS.md` § W1 (Wizard State Refactoring) — W1.2 is the scope of this phase
- `.planning/phases/09-wizard-backend-integration/09-CONTEXT.md` — prior integration decisions (fallback chain, migration, hook design)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WizardContext.HYDRATE` action — already accepts partial WizardState; extend to accept API `Incident` data
- `useIncident.getIncident(id)` — returns `Incident | null`, handles fallback and offline state
- `LoadingSpinner` (`src/components/atoms/LoadingSpinner.tsx`) — use for fetch-in-flight state
- `showSuccessToast`, `showErrorToast` (`src/components/Toast.tsx`) — use for fallback/error feedback
- `useRouter` from `next/navigation` — for redirect on 404

### Established Patterns
- `WizardProvider` has an `isHydrated` guard that renders `null` until localStorage is read. Extend this pattern to also gate on API fetch completion.
- `useEffect` for side-effectful mount operations (SSR-safe) — follow existing pattern in WizardContext.
- App Router Server Components can read `searchParams` directly — use for `/wizard/page.tsx`.

### Integration Points
- `/wizard/page.tsx` (new) → passes `incidentId` prop to `WizardShell`
- `WizardShell` → passes `incidentId` to `WizardProvider`
- `WizardProvider` → on mount, if `incidentId` set, calls `getIncident(id)`, dispatches `HYDRATE` with mapped data, sets `currentStep: 1`

</code_context>

<specifics>
## Specific Ideas

- The `HYDRATE` action in `wizardReducer` already merges partial state: `{ ...initialState, ...action.data }`. The API-to-WizardState mapping can produce a partial object and dispatch `HYDRATE` with `{ ...mapped, currentStep: 1 }`.
- `searchParams` in App Router are available as props in Server Components — no need for `useSearchParams` (Client Component) on the page level. Pass `incidentId` as a prop to `WizardShell`.
- `WizardShell` is already a Client Component (imports `WizardProvider`) so it can accept a plain string prop from the Server Component page.

</specifics>

<deferred>
## Deferred Ideas

- Auto-save wizard progress to API on every step change (W1.3 is submit on completion — intermediate saves would be new scope)
- "Resume from last step" behavior (user chose Step 1 / Einstieg as the resume starting point)
- Loading skeleton per wizard step (vs. single spinner) — not needed given spinner decision

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 19-wizard-resume-from-api*
*Context gathered: 2026-04-16*
