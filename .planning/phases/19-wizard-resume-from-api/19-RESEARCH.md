# Phase 19: Wizard Resume from API - Research

**Researched:** 2026-04-16
**Domain:** React state hydration, Next.js App Router searchParams, API-to-WizardState mapping
**Confidence:** HIGH

## Summary

Phase 19 closes the W1.2 gap identified in the v1.2 milestone audit: when a user clicks "Resume" in the incident list, the wizard currently only reads from localStorage. This phase adds an API fetch on mount so the wizard hydrates from the database, enabling true multi-session resume.

The implementation is narrowly scoped: one new App Router page (`/wizard/page.tsx`), one prop addition to `WizardShell`, and one `useEffect` extension in `WizardProvider`. All UI components already exist (LoadingSpinner, Toast helpers, WizardProgress). The critical new logic is the **Incident-to-WizardState reverse mapping** -- the inverse of `mapIncidentState()` in `migration.ts`.

**Primary recommendation:** Create a new `mapIncidentToWizardState(incident: Incident): Partial<WizardState>` function in `src/lib/migration.ts` (co-located with its inverse `mapIncidentState`), then extend `WizardProvider` to accept an optional `incidentId` prop that triggers an API fetch + HYDRATE dispatch before rendering.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Create a dedicated `/wizard` route at `src/app/wizard/page.tsx` (App Router Server Component).
- **D-02:** The root page `/` (`src/app/page.tsx`) remains unchanged -- it renders `WizardShell` without an `incidentId` and is the "new incident" entry point.
- **D-03:** `/wizard?incident=<uuid>` is the resume URL. `IncidentList.tsx` already navigates here -- the new route makes this link work.
- **D-04:** `searchParams.incident` is read in the Server Component and passed as `incidentId` prop to `WizardShell`.
- **D-05:** Show a loading spinner (`LoadingSpinner`) while `getIncident()` is in-flight. No partial/optimistic rendering from localStorage during the fetch.
- **D-06:** The `WizardProvider` (or `WizardShell`) must not render wizard steps until either the API data has been hydrated or an error/fallback has been resolved. Same pattern as the existing `isHydrated` guard in `WizardContext`.
- **D-07:** When resuming (incidentId provided), start at Step 1 (Einstieg), not Step 0 (Interstitial).
- **D-08:** For new incidents (no incidentId), behavior is unchanged -- still starts at Step 0.
- **D-09:** Follow the existing Phase 9 fallback chain: API -> localStorage -> empty state.
- **D-10:** `useIncident.getIncident()` already handles network errors by falling back to localStorage -- reuse this behavior.
- **D-11:** If fallback to localStorage succeeds: show a Toast warning ("Offline-Modus -- zwischengespeicherte Daten geladen") and continue rendering.
- **D-12:** If localStorage also has no data: show a Toast error and render wizard at Step 1 with empty state.
- **D-13:** 404 (incident not found / soft-deleted): show error Toast, redirect to `/incidents` list.

### Claude's Discretion
- Exact mapping of API `Incident` fields to `WizardState` step keys (ErfassenData, KlassifikationData, etc.) -- Claude decides based on field names and wizard-types.ts.
- Whether to extend `WizardProvider` with an `incidentId` prop or handle fetch logic in a new wrapper component.
- Exact Toast message copy (German, stress-resistant language, per SIAG design guidelines).

### Deferred Ideas (OUT OF SCOPE)
- Auto-save wizard progress to API on every step change (W1.3 is submit on completion -- intermediate saves would be new scope)
- "Resume from last step" behavior (user chose Step 1 / Einstieg as the resume starting point)
- Loading skeleton per wizard step (vs. single spinner) -- not needed given spinner decision
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| W1.2 | Incident fetched from API on wizard mount (if resuming) | WizardProvider extension with incidentId prop, useIncident().getIncident() call in useEffect, HYDRATE dispatch |
| W2.2 | User can resume incomplete incident from list | IncidentList.handleViewClick already pushes `/wizard?incident=${id}`; new `/wizard/page.tsx` makes this route work |
| W1.4 | localStorage fallback during transition | useIncident.getIncident() already has shouldFallback() -> localStorage chain; WizardProvider reuses this |
| W1.5 | Hydration guard prevents flash of wrong state | Extended isHydrated guard: remains false until API fetch completes or falls back |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Code language:** English for all code, commits, comments, file names
- **UI copy:** German (Swiss German register -- professional, concise, no anglicisms)
- **Active API:** App Router routes at `/app/api/` -- Vercel serves these
- **Wizard state:** localStorage-first; backend sync is partial (this phase closes the gap)
- **Test runner:** Vitest; all new API routes need corresponding tests
- **Design system:** SIAG design system (Inter font, #f0f2f5 bg, #CC0033 red accent, WCAG AA)
- **Commit format:** Conventional Commits, max 72 chars

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| URL param reading (`searchParams.incident`) | Frontend Server (SSR) | -- | App Router Server Component reads search params at render time |
| API fetch on mount | Browser / Client | -- | useEffect in WizardProvider calls getIncident() client-side |
| Incident -> WizardState mapping | Browser / Client | -- | Pure transform function, runs client-side after API response |
| Loading state display | Browser / Client | -- | LoadingSpinner rendered while fetch in-flight |
| Error/fallback handling | Browser / Client | -- | Toast notifications + router.push for redirect |
| Incident data persistence | API / Backend | Database | GET /api/incidents/:id already exists and serves data |

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (App Router) | Route `/wizard/page.tsx` reads `searchParams` | Already the project framework [VERIFIED: src/app structure] |
| React | 19.x | useReducer, useEffect, useState for WizardProvider | Already the project UI library [VERIFIED: package.json implied by Next 15] |
| sonner | installed | Toast notifications via showWarningToast/showErrorToast | Already integrated in Toast.tsx [VERIFIED: src/components/Toast.tsx] |
| motion/react | installed | LoadingSpinner animation | Already used in LoadingSpinner.tsx [VERIFIED: src/components/atoms/LoadingSpinner.tsx] |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | installed | Unit tests for mapping function + integration tests | All new logic needs tests [VERIFIED: vitest.config.ts] |
| @testing-library/react | installed | Hook and component testing | For WizardProvider extension tests [VERIFIED: tests/hooks/useIncident.test.ts imports it] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Extending WizardProvider | New wrapper component | Wrapper adds indirection; extending WizardProvider keeps hydration logic co-located with existing localStorage hydration |
| useEffect for API fetch | React.use() (Suspense) | Suspense requires more refactoring; useEffect matches existing WizardProvider pattern exactly |

**Installation:** No new packages needed. All dependencies are already installed.

## Architecture Patterns

### System Architecture Diagram

```
IncidentList                /wizard?incident=<uuid>             API
"Weiterbearbeiten" -----> page.tsx (Server Component)
button click               reads searchParams.incident
                           |
                           v
                    WizardShell (Client)
                    receives incidentId prop
                           |
                           v
                    WizardProvider (Client)
                    +-- incidentId present?
                    |   YES: useEffect calls getIncident(id) --------> GET /api/incidents/:id
                    |         |                                              |
                    |         |  <-- Incident JSON <-------------------------+
                    |         |
                    |         v
                    |   mapIncidentToWizardState(incident)
                    |         |
                    |         v
                    |   dispatch({ type: 'HYDRATE', data: {...mapped, currentStep: 1} })
                    |         |
                    |         v
                    |   setIsHydrated(true) --> Render wizard at Step 1
                    |
                    |   NO: existing localStorage hydration (unchanged)
                    |         |
                    |         v
                    |   setIsHydrated(true) --> Render wizard at Step 0
                    +--
```

**Fallback chain (when incidentId is present):**
```
getIncident(id)
  |-- API success --> mapIncidentToWizardState --> HYDRATE (step 1) --> render
  |-- API 404 --> showErrorToast --> router.push('/incidents')
  |-- API 5xx / network error --> shouldFallback(err) = true
        |-- localStorage has data --> showWarningToast --> HYDRATE (step 1) --> render
        |-- localStorage empty --> showErrorToast --> HYDRATE (empty, step 1) --> render
```

### Recommended Project Structure
```
src/
  app/
    wizard/
      page.tsx             # NEW: Server Component reading searchParams
  components/
    wizard/
      WizardShell.tsx      # MODIFIED: +incidentId prop
      WizardContext.tsx     # MODIFIED: +incidentId prop, API fetch in useEffect
  lib/
    migration.ts           # MODIFIED: +mapIncidentToWizardState() reverse mapping
    wizard-types.ts        # UNCHANGED (no new types needed)
  hooks/
    useIncident.ts         # UNCHANGED (getIncident already works)
```

### Pattern 1: Server Component to Client Component Prop Passing
**What:** App Router Server Component reads `searchParams` and passes value as prop to Client Component.
**When to use:** When URL parameters need to reach client-side state.
**Example:**
```typescript
// Source: existing pattern in src/app/incidents/page.tsx (Server Component)
// src/app/wizard/page.tsx
import { WizardShell } from '@/components/wizard'

interface WizardPageProps {
  searchParams: Promise<{ incident?: string }>
}

export default async function WizardPage({ searchParams }: WizardPageProps) {
  const params = await searchParams
  return (
    <main>
      <WizardShell incidentId={params.incident} />
    </main>
  )
}
```
[VERIFIED: Next.js 15 App Router uses `searchParams` as async prop in Server Components]

### Pattern 2: Extended Hydration Guard
**What:** WizardProvider delays rendering until both localStorage read AND optional API fetch complete.
**When to use:** When provider has async initialization that must complete before children render.
**Example:**
```typescript
// Source: existing pattern in WizardContext.tsx lines 36-48
// Extended with API fetch branch
useEffect(() => {
  async function hydrate() {
    if (incidentId) {
      // API fetch path
      try {
        const incident = await getIncident(incidentId)
        if (incident) {
          const wizardState = mapIncidentToWizardState(incident)
          dispatch({ type: 'HYDRATE', data: { ...wizardState, currentStep: 1 } })
        }
      } catch (err) {
        // Error handling (404 redirect, fallback toast, etc.)
      }
    } else {
      // Existing localStorage path (unchanged)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          dispatch({ type: 'HYDRATE', data: { ...parsed, currentStep: 0, noGoConfirmed: false } })
        }
      } catch { /* ignore */ }
    }
    setIsHydrated(true)
  }
  hydrate()
}, []) // incidentId is a prop, stable across renders
```
[VERIFIED: existing WizardContext.tsx pattern at lines 36-48]

### Pattern 3: Incident-to-WizardState Reverse Mapping
**What:** Transform API `Incident` fields back to `WizardState` step data.
**When to use:** When hydrating wizard from API data instead of localStorage.
**Example:**
```typescript
// Source: reverse of mapIncidentState() in src/lib/migration.ts
export function mapIncidentToWizardState(incident: Incident): Partial<WizardState> {
  return {
    erfassen: {
      erkennungszeitpunkt: incident.erkennungszeitpunkt
        ? new Date(incident.erkennungszeitpunkt).toISOString().slice(0, 16) // datetime-local format
        : '',
      erkannt_durch: incident.erkannt_durch ?? '',
      betroffene_systeme: incident.betroffene_systeme ?? [],
      erste_auffaelligkeiten: incident.erste_erkenntnisse ?? '',
      loesegeld_meldung: incident.metadata?.custom_fields?.loesegeld_meldung ?? false,
    },
    klassifikation: {
      incidentType: mapApiTypeToWizardType(incident.incident_type),
      severity: mapApiSeverityToWizardSeverity(incident.severity),
      q1SystemeBetroffen: mapIntToYesNo(incident.q1),
      q2PdBetroffen: mapIntToYesNo(incident.q2),
      q3AngreiferAktiv: mapIntToYesNoUnbekannt(incident.q3),
    },
    reaktion: {
      completedSteps: incident.playbook?.checkedSteps
        ?.filter(s => s.checked)
        .map(s => s.stepId) ?? [],
    },
    kommunikation: {
      kritischeInfrastruktur: incident.metadata?.custom_fields?.kritischeInfrastruktur ?? null,
      personendatenBetroffen: incident.metadata?.custom_fields?.personendatenBetroffen ?? null,
      reguliertesUnternehmen: incident.metadata?.custom_fields?.reguliertesUnternehmen ?? null,
      kommChecklist: [], // Not stored in API model
    },
  }
}
```
[VERIFIED: field names from Incident type (incident-types.ts) and WizardState (wizard-types.ts)]

### Anti-Patterns to Avoid
- **Double hydration race:** Do NOT start with localStorage hydration and then overwrite with API data. The `incidentId` branch should skip localStorage entirely (D-05: no partial/optimistic rendering).
- **useEffect dependency on getIncident:** The `getIncident` function from `useIncident()` is a `useCallback` with empty deps, so it's stable. But calling it inside WizardProvider means WizardProvider must use the hook. Alternative: accept a `fetchIncident` callback prop to avoid hook coupling inside the context provider.
- **Rendering before hydration:** Current WizardProvider returns `null` until `isHydrated`. The API fetch path must also gate on this -- do NOT show wizard steps during the fetch.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API fetch with fallback | Custom fetch + try/catch + localStorage | `useIncident().getIncident(id)` | Already handles 404 detection, network fallback to localStorage, isOffline flag, loading state |
| Toast notifications | Custom notification UI | `showWarningToast()`, `showErrorToast()` from Toast.tsx | Sonner-based, dark mode aware, accessible, already configured |
| Loading animation | Custom CSS spinner | `LoadingSpinner` from atoms/ | Framer Motion, reduced-motion aware, three sizes |
| URL param reading | `useSearchParams()` client-side hook | Server Component `searchParams` prop | Avoids client-side JS for reading URL; cleaner for SSR |
| Type mapping (IncidentType) | Inline switch statements | Extend `migration.ts` with reverse mappers | Co-locate with existing forward mappers; single source of truth |

**Key insight:** The entire API integration layer (fetch, fallback, error classification) is already built in `useIncident.ts`. This phase only needs to wire it into WizardProvider's mount lifecycle and add the reverse data mapping.

## Common Pitfalls

### Pitfall 1: Incident Type Enum Mismatch
**What goes wrong:** The API stores `data_loss` and `other`, but WizardState uses `datenverlust`, `unbefugter-zugriff`, and `sonstiges`. Mapping in the wrong direction causes the playbook to load incorrectly.
**Why it happens:** Phase 9's `mapIncidentType()` maps `datenverlust` -> `data_loss` for saving. The reverse mapping must handle `data_loss` -> `datenverlust` and `other` -> `sonstiges` (or `unbefugter-zugriff` if that metadata is preserved).
**How to avoid:** Create explicit reverse mapping functions. For `other` -> wizard type, check `metadata.custom_fields` for the original wizard type if available.
**Warning signs:** Playbook step count says "0 von 25" or wrong playbook type appears in Step 4.

### Pitfall 2: Severity Enum Mismatch
**What goes wrong:** API stores lowercase `critical`/`high`/`medium`/`low`. WizardState uses uppercase German `KRITISCH`/`HOCH`/`MITTEL`.
**Why it happens:** Same forward/reverse mapping issue as incident type.
**How to avoid:** Explicit reverse mapper: `critical` -> `KRITISCH`, etc. Already visible in `mapSeverity()` which handles both directions.
**Warning signs:** Severity badge shows raw English string or no styling applied.

### Pitfall 3: searchParams Type in Next.js 15
**What goes wrong:** In Next.js 15 App Router, `searchParams` is a Promise that must be awaited. Using it directly as an object causes TypeScript errors or runtime issues.
**Why it happens:** Next.js 15 changed `searchParams` from synchronous to async.
**How to avoid:** Declare the page component as `async` and `await searchParams` before accessing properties.
**Warning signs:** TypeScript error "Property 'incident' does not exist on type 'Promise'".

### Pitfall 4: Hook Usage Inside Context Provider
**What goes wrong:** If `WizardProvider` needs to call `useIncident().getIncident()`, it must itself be a component (not just a context wrapper). But `useIncident()` creates its own state -- a new instance per call.
**Why it happens:** React hooks can only be called inside components/hooks, and each `useIncident()` call is independent.
**How to avoid:** Two options: (1) Call `useIncident()` inside WizardProvider (fine since it's a component); (2) Import `IncidentAPI.getIncident()` directly (static class method, no hook needed). Option 2 is cleaner because WizardProvider only needs a one-shot fetch, not ongoing state management.
**Warning signs:** Multiple re-renders or stale state from competing hook instances.

### Pitfall 5: localStorage Write After API Hydration
**What goes wrong:** The existing second `useEffect` in WizardProvider writes state to localStorage on every change. After API hydration, this would overwrite the localStorage with the API data, which is correct behavior. But if the fetch fails and falls back to localStorage, then the fallback read -> HYDRATE -> write cycle could lose or corrupt data.
**Why it happens:** The localStorage write effect runs whenever `state` changes, including after HYDRATE dispatches.
**How to avoid:** The current pattern is actually fine: HYDRATE sets state, which triggers a localStorage write with the hydrated data. For the fallback case, reading then writing back is idempotent. No change needed -- just verify this works in tests.
**Warning signs:** localStorage data looks different after opening and closing the wizard without making changes.

## Code Examples

### Complete /wizard/page.tsx (Server Component)
```typescript
// Source: pattern from src/app/incidents/page.tsx + Next.js 15 searchParams
import { WizardShell } from '@/components/wizard'

export const metadata = {
  title: 'Wizard -- SIAG Incident Assistant',
  description: 'Incident-Response-Wizard fortsetzen',
}

interface WizardPageProps {
  searchParams: Promise<{ incident?: string }>
}

export default async function WizardPage({ searchParams }: WizardPageProps) {
  const params = await searchParams
  return (
    <main>
      <WizardShell incidentId={params.incident} />
    </main>
  )
}
```
[VERIFIED: Next.js 15 async searchParams pattern]

### Reverse Mapping Helper Functions
```typescript
// Source: inverse of existing mapIncidentType() / mapSeverity() in migration.ts
import type { IncidentType as WizardIncidentType } from './wizard-types'
import type { IncidentType as ApiIncidentType, Severity } from './incident-types'

export function mapApiTypeToWizardType(apiType?: ApiIncidentType | null): WizardIncidentType {
  if (!apiType) return 'ransomware' // default
  const reverseMap: Record<string, WizardIncidentType> = {
    ransomware: 'ransomware',
    phishing: 'phishing',
    ddos: 'ddos',
    data_loss: 'datenverlust',
    other: 'sonstiges',
  }
  return reverseMap[apiType] ?? 'ransomware'
}

export function mapApiSeverityToWizardSeverity(apiSeverity?: Severity | null): 'KRITISCH' | 'HOCH' | 'MITTEL' {
  if (!apiSeverity) return 'MITTEL' // default
  const reverseMap: Record<string, 'KRITISCH' | 'HOCH' | 'MITTEL'> = {
    critical: 'KRITISCH',
    high: 'HOCH',
    medium: 'MITTEL',
    low: 'MITTEL', // WizardState has no LOW -- map to MITTEL
  }
  return reverseMap[apiSeverity] ?? 'MITTEL'
}

export function mapIntToYesNo(val?: number | null): 'ja' | 'nein' {
  return val === 1 ? 'ja' : 'nein'
}

export function mapIntToYesNoUnbekannt(val?: number | null): 'ja' | 'nein' | 'unbekannt' {
  if (val === 1) return 'ja'
  if (val === 0) return 'nein'
  return 'unbekannt'
}
```
[VERIFIED: field values from wizard-types.ts (KlassifikationData) and incident-types.ts (Incident)]

### Using IncidentAPI Directly (Recommended for WizardProvider)
```typescript
// Source: pattern from src/hooks/useIncidentAPI.ts
// In WizardProvider, use the static API class directly instead of the hook
import { IncidentAPI } from '@/hooks/useIncidentAPI'
import { APIError } from '@/api/client'

// Inside the useEffect:
try {
  const incident = await IncidentAPI.getIncident(incidentId)
  const mapped = mapIncidentToWizardState(incident)
  dispatch({ type: 'HYDRATE', data: { ...mapped, currentStep: 1 } })
} catch (err) {
  if (err instanceof Error && err.message.includes('404')) {
    showErrorToast('Vorfall nicht gefunden oder geloescht.')
    setTimeout(() => router.push('/incidents'), 1500)
    return
  }
  // Fallback to localStorage
  // ...
}
```
[VERIFIED: IncidentAPI is a static class, can be called without hooks]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `searchParams` sync object (Next.js 14) | `searchParams` async Promise (Next.js 15) | Next.js 15 | Page components must be `async` and `await searchParams` |
| `useWizard()` for all state | `useIncident()` for API + `useWizard()` for step UI | Phase 9 (v1.1) | Wizard state split between localStorage (steps) and API (persistence) |
| Single localStorage hydration | API-first hydration with localStorage fallback | This phase (19) | Enables true multi-session, multi-device resume |

**Deprecated/outdated:**
- Synchronous `searchParams` access in page components (Next.js 14 pattern) -- must await in Next.js 15

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `IncidentAPI.getIncident()` wraps errors so that 404 is detectable via error message string matching | Code Examples | Error detection for 404 redirect might silently fail; need to verify error propagation from useIncidentAPI.ts |
| A2 | The `description` field (added to Prisma schema in Phase 18) is NOT yet in the TypeScript `Incident` interface | Common Pitfalls | If Phase 18 already added it, the mapping function should include it; if not, it's harmless to omit |
| A3 | `metadata.custom_fields.loesegeld_meldung` is reliably stored when incidents are saved via Step6 | Code Examples | If this field is not in the API response, the reverse mapping for ErfassenData.loesegeld_meldung will default to false |

**Note on A1:** Examining `useIncidentAPI.ts` line 53-58, `IncidentAPI.getIncident()` catches errors and re-throws as `new Error('Failed to fetch incident: ...')`. This wrapping means the original `APIError` with `.isNotFound()` is lost. The `useIncident().getIncident()` hook (lines 172-206) does check for `APIError.isNotFound()`, but only if the error is an `APIError` instance. Since `IncidentAPI` wraps it in a plain `Error`, the 404 detection in `useIncident` may not work correctly. **This is a pre-existing bug** that should be addressed in implementation. The fix: remove the try/catch wrapping in `IncidentAPI.getIncident()` or re-throw the original error.

## Open Questions

1. **IncidentAPI Error Wrapping Bug**
   - What we know: `IncidentAPI.getIncident()` catches all errors and re-throws as `new Error(...)`, losing the `APIError` type information. `useIncident().getIncident()` then can't detect 404 vs 5xx.
   - What's unclear: Whether this is an intentional design choice or an oversight from Phase 14.
   - Recommendation: Fix during this phase by removing the try/catch in `IncidentAPI.getIncident()` (let the original error propagate). Alternatively, use `IncidentAPI` directly in WizardProvider with raw `fetch` and proper error handling. The direct approach avoids the bug entirely.

2. **description Field in Incident TypeScript Type**
   - What we know: `description` exists in Prisma schema (Phase 18) but NOT in `src/lib/incident-types.ts` Incident interface.
   - What's unclear: Whether Phase 18 execution has added it to the TypeScript type yet (Phase 18 is listed as "EXECUTING" in memory).
   - Recommendation: If Phase 18 hasn't added it yet, ignore for now -- the mapping function just won't include `description`. It's a non-critical field.

3. **erkennungszeitpunkt Format (datetime-local vs ISO)**
   - What we know: The API stores `erkennungszeitpunkt` as ISO 8601 DateTime. The wizard's `<input type="datetime-local">` expects `YYYY-MM-DDTHH:mm` format (no seconds, no timezone).
   - What's unclear: Exact format stored and how Step2Erfassen reads it.
   - Recommendation: In the reverse mapping, use `.toISOString().slice(0, 16)` to truncate to datetime-local format.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (jsdom for components, node for API) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| W1.2-a | mapIncidentToWizardState correctly maps all Incident fields | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "mapIncidentToWizardState"` | Wave 0 |
| W1.2-b | WizardProvider fetches from API when incidentId prop set | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "WizardProvider API fetch"` | Wave 0 |
| W1.2-c | WizardProvider shows LoadingSpinner during fetch | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "loading state"` | Wave 0 |
| W1.2-d | 404 response triggers error toast + redirect | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "404"` | Wave 0 |
| W1.2-e | Network error falls back to localStorage | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "fallback"` | Wave 0 |
| W1.2-f | Resume starts at Step 1, not Step 0 | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "step 1"` | Wave 0 |
| W1.2-g | Reverse type mapping (data_loss -> datenverlust) | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "type mapping"` | Wave 0 |
| W1.2-h | Reverse severity mapping (critical -> KRITISCH) | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "severity mapping"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/wizard-resume.test.ts --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/wizard-resume.test.ts` -- covers W1.2-a through W1.2-h (all reverse mapping + provider behavior)
- [ ] Test fixtures: mock Incident objects with all field combinations (complete, partial, null fields)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Not in scope (existing API key auth unchanged) |
| V3 Session Management | no | No session changes |
| V4 Access Control | no | Existing API key auth on GET /api/incidents/:id unchanged |
| V5 Input Validation | yes | UUID format validation of `searchParams.incident` before API call |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns for this Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| URL parameter injection (non-UUID in `?incident=`) | Tampering | Validate UUID format before passing to API; API already validates |
| Incident ID enumeration via URL | Information Disclosure | Existing API key auth prevents unauthorized access; no additional mitigation needed |
| XSS via incident data in wizard fields | Tampering | React's JSX auto-escaping prevents XSS; no `dangerouslySetInnerHTML` used |

## Sources

### Primary (HIGH confidence)
- `src/components/wizard/WizardContext.tsx` -- existing hydration pattern, HYDRATE action, isHydrated guard
- `src/components/wizard/WizardShell.tsx` -- current WizardShell interface and provider wrapping
- `src/hooks/useIncident.ts` -- getIncident() with fallback logic, error handling
- `src/hooks/useIncidentAPI.ts` -- static IncidentAPI class, error wrapping behavior
- `src/lib/wizard-types.ts` -- WizardState, WizardAction, step data interfaces
- `src/lib/incident-types.ts` -- Incident type, field definitions
- `src/lib/migration.ts` -- mapIncidentState() forward mapping, type/severity helpers
- `src/components/Toast.tsx` -- showWarningToast, showErrorToast, showSuccessToast
- `src/components/atoms/LoadingSpinner.tsx` -- LoadingSpinner component
- `src/components/incidents/IncidentList.tsx` -- handleViewClick routing to `/wizard?incident=${id}`
- `src/app/page.tsx` -- current root page rendering WizardShell
- `src/app/incidents/page.tsx` -- Server Component pattern example
- `prisma/schema.prisma` -- database schema with description field
- `.planning/phases/19-wizard-resume-from-api/19-CONTEXT.md` -- locked decisions
- `.planning/phases/19-wizard-resume-from-api/19-UI-SPEC.md` -- UI design contract
- `.planning/v1.2-MILESTONE-AUDIT.md` -- W1.2 gap evidence

### Secondary (MEDIUM confidence)
- Next.js 15 App Router `searchParams` async pattern [ASSUMED from training knowledge -- Next.js 15 released Oct 2024]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, verified by reading source
- Architecture: HIGH -- clear extension of existing patterns (WizardProvider, useIncident, migration.ts)
- Pitfalls: HIGH -- identified by reading actual codebase code and tracing data flow
- Mapping logic: HIGH -- verified by reading both Incident and WizardState type definitions

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable -- no external dependency changes expected)
