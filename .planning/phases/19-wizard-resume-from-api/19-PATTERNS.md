# Phase 19: Wizard Resume from API - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 5 (1 new, 3 modified, 1 new test)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/wizard/page.tsx` | route (page) | request-response | `src/app/incidents/page.tsx` | exact |
| `src/components/wizard/WizardShell.tsx` | component | request-response | itself (current version) | exact |
| `src/components/wizard/WizardContext.tsx` | provider | event-driven | itself (current version) | exact |
| `src/lib/migration.ts` | utility (transform) | transform | itself (current version: `mapIncidentState`) | exact |
| `src/__tests__/wizard-resume.test.ts` | test | transform + unit | `src/__tests__/step6-save.test.ts` + `src/__tests__/wizard-reducer.test.ts` | role-match |

## Pattern Assignments

### `src/app/wizard/page.tsx` (NEW -- route/page, request-response)

**Analog:** `src/app/incidents/page.tsx` (lines 1-27)

**Imports pattern** (lines 1, 7):
```typescript
// Server Component -- NO 'use client' directive
import { IncidentList } from '@/components/incidents/IncidentList';
```
Adapt to:
```typescript
import { WizardShell } from '@/components/wizard'
```

**Metadata pattern** (lines 9-12):
```typescript
export const metadata = {
  title: 'Incidents — SIAG Incident Assistant',
  description: 'Manage and track all security incidents',
};
```

**Page structure pattern** (lines 14-26):
```typescript
export default function IncidentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Alle Vorfälle</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Übersicht aller erfassten Sicherheitsvorfälle
        </p>
      </div>
      <IncidentList />
    </div>
  );
}
```

**CRITICAL: Next.js 15 searchParams pattern** -- NOT in any existing analog, from RESEARCH.md:
```typescript
// Next.js 15: searchParams is a Promise, must await
interface WizardPageProps {
  searchParams: Promise<{ incident?: string }>
}

export default async function WizardPage({ searchParams }: WizardPageProps) {
  const params = await searchParams
  // pass params.incident to client component
}
```

**Root page analog** `src/app/page.tsx` (lines 1-9) -- shows how WizardShell is rendered without incidentId:
```typescript
import { WizardShell } from '@/components/wizard'

export default function Home() {
  return (
    <main>
      <WizardShell />
    </main>
  )
}
```

---

### `src/components/wizard/WizardShell.tsx` (MODIFIED -- component, request-response)

**Analog:** itself, current version at `src/components/wizard/WizardShell.tsx` (lines 1-70)

**Interface pattern** (lines 15-17) -- extend with `incidentId`:
```typescript
interface WizardShellProps {
  onComplete?: (state: WizardState) => void
}
```
Becomes:
```typescript
interface WizardShellProps {
  incidentId?: string
  onComplete?: (state: WizardState) => void
}
```

**Provider wrapping pattern** (lines 19-25) -- pass `incidentId` through to WizardProvider:
```typescript
export function WizardShell({ onComplete }: WizardShellProps) {
  return (
    <WizardProvider>
      <WizardShellInner onComplete={onComplete} />
    </WizardProvider>
  )
}
```

**Barrel export** `src/components/wizard/index.ts` (line 2) -- no change needed, already exports WizardShell:
```typescript
export { WizardShell } from './WizardShell'
```

---

### `src/components/wizard/WizardContext.tsx` (MODIFIED -- provider, event-driven)

**Analog:** itself, current version at `src/components/wizard/WizardContext.tsx` (lines 1-69)

**Imports pattern** (lines 1-4):
```typescript
'use client'

import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { type WizardState, type WizardAction, initialState, MAX_STEP, MIN_STEP } from '@/lib/wizard-types'
```
Extend with:
```typescript
import { IncidentAPI } from '@/hooks/useIncidentAPI'
import { APIError, shouldFallback } from '@/api/client'
import { mapIncidentToWizardState } from '@/lib/migration'
import { showWarningToast, showErrorToast } from '@/components/Toast'
```

**Provider signature pattern** (line 31):
```typescript
export function WizardProvider({ children }: { children: ReactNode }) {
```
Extend to:
```typescript
export function WizardProvider({ children, incidentId }: { children: ReactNode; incidentId?: string }) {
```

**Hydration guard pattern** (lines 33, 58-61) -- the core pattern to extend:
```typescript
const [isHydrated, setIsHydrated] = useState(false)

// ... (useEffects in between)

// Prevent rendering children until hydration complete (avoids flash of initial state)
if (!isHydrated) {
  return null
}
```

**localStorage hydration useEffect** (lines 36-48) -- the existing effect to branch from:
```typescript
useEffect(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Restore form data but always start at step 0 — avoids opening mid-wizard
      dispatch({ type: 'HYDRATE', data: { ...parsed, currentStep: 0, noGoConfirmed: false } })
    }
  } catch {
    // Ignore corrupted data — start fresh
  }
  setIsHydrated(true)
}, [])
```

**localStorage write-back useEffect** (lines 51-55) -- no change needed, works correctly after API hydration:
```typescript
useEffect(() => {
  if (isHydrated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}, [state, isHydrated])
```

**HYDRATE action in reducer** (lines 20-21):
```typescript
case 'HYDRATE':
  return { ...initialState, ...action.data }
```

**NOTE on `isHydrated` return null** (line 59): When extending with API fetch, the `return null` continues to gate rendering. Replace with `<LoadingSpinner>` when `incidentId` is provided (D-05).

---

### `src/lib/migration.ts` (MODIFIED -- utility, transform)

**Analog:** itself, forward mapping functions at `src/lib/migration.ts` (lines 1-268)

**Forward type mapping pattern** (lines 64-77) -- reverse this:
```typescript
export function mapIncidentType(v1Type?: string): IncidentType | null {
  if (!v1Type) return null;

  const typeMap: Record<string, IncidentType> = {
    ransomware: 'ransomware',
    phishing: 'phishing',
    ddos: 'ddos',
    datenverlust: 'data_loss',
    'unbefugter-zugriff': 'other',
    sonstiges: 'other',
  };

  return typeMap[v1Type.toLowerCase()] ?? null;
}
```

**Forward severity mapping pattern** (lines 83-98) -- reverse this:
```typescript
export function mapSeverity(v1Severity?: string): Severity | null {
  if (!v1Severity) return null;

  const severityMap: Record<string, Severity> = {
    KRITISCH: 'critical',
    critical: 'critical',
    HOCH: 'high',
    high: 'high',
    MITTEL: 'medium',
    medium: 'medium',
    NIEDRIG: 'low',
    low: 'low',
  };

  return severityMap[v1Severity] ?? null;
}
```

**Forward yes/no mapping pattern** (lines 104-120) -- reverse this:
```typescript
export function mapYesNoToInt(value?: string): 0 | 1 | null {
  if (!value) return null;
  switch (value.toLowerCase()) {
    case 'ja':
    case 'yes':
      return 1;
    case 'nein':
    case 'no':
      return 0;
    case 'unbekannt':
    case 'unknown':
      return null;
    default:
      return null;
  }
}
```

**Forward full-state mapping pattern** (lines 129-229) -- `mapIncidentState()` -- the inverse function `mapIncidentToWizardState()` should mirror this structure:
```typescript
export function mapIncidentState(
  v1State: LegacyWizardState,
  context: 'migration' | 'new_save' = 'new_save'
): CreateIncidentInput | null {
  const klassifikation = v1State.klassifikation || {};
  const erfassen = v1State.erfassen || {};
  const reaktion = v1State.reaktion || {};
  const kommunikation = v1State.kommunikation || {};

  const incident_type = mapIncidentType(klassifikation.incidentType);
  // ... maps each section
  return incident;
}
```

**Import pattern** (line 7):
```typescript
import { CreateIncidentInput, IncidentType, Severity } from './incident-types';
```
Extend with:
```typescript
import { Incident, IncidentType as ApiIncidentType, Severity as ApiSeverity } from './incident-types';
import { IncidentType as WizardIncidentType, KlassifikationData, ErfassenData, ReaktionData, KommunikationData } from './wizard-types';
import type { WizardState } from './wizard-types';
```

---

### `src/__tests__/wizard-resume.test.ts` (NEW -- test, unit)

**Analog 1:** `src/__tests__/step6-save.test.ts` (lines 1-60) -- tests for forward mapping, mirror structure for reverse mapping

**Imports pattern** (lines 1-7):
```typescript
import { describe, it, expect } from 'vitest'
import { mapIncidentState, LegacyWizardState } from '../lib/migration'
```

**Fixture pattern** (lines 13-44):
```typescript
const DETECTION_TIME = '2026-04-09T08:00:00.000Z'

function buildFullState(): LegacyWizardState {
  return {
    currentStep: 6,
    noGoConfirmed: true,
    einstieg: {},
    erfassen: {
      erkennungszeitpunkt: DETECTION_TIME,
      erkannt_durch: 'it-mitarbeiter',
      betroffene_systeme: ['Fileserver', 'AD'],
      // ...
    },
    // ...
  }
}
```

**Test structure pattern** (lines 50-60):
```typescript
describe('Wizard to API mapping', () => {
  it('Test 1: maps full wizard state to CreateIncidentInput with all fields', () => {
    const state = buildFullState()
    const result = mapIncidentState(state)

    expect(result).not.toBeNull()
    expect(result!.incident_type).toBe('ransomware')
    expect(result!.severity).toBe('critical')
  })
})
```

**Analog 2:** `src/__tests__/wizard-reducer.test.ts` (lines 1-88) -- tests for reducer/HYDRATE action

**Reducer test pattern** (lines 82-88):
```typescript
it('HYDRATE: merges provided data into state', () => {
  const data: WizardState = { ...initialState, currentStep: 3, noGoConfirmed: true }
  const result = wizardReducer(initialState, { type: 'HYDRATE', data })
  expect(result.currentStep).toBe(3)
  expect(result.noGoConfirmed).toBe(true)
})
```

---

## Shared Patterns

### Toast Notifications
**Source:** `src/components/Toast.tsx` (lines 98-178)
**Apply to:** `WizardContext.tsx` (error/fallback handling during API fetch)
```typescript
import { showWarningToast, showErrorToast } from '@/components/Toast'

// Warning toast for offline fallback (D-11)
showWarningToast('Offline-Modus -- zwischengespeicherte Daten geladen')

// Error toast for 404 (D-13)
showErrorToast('Vorfall nicht gefunden oder geloescht.')

// Error toast for empty fallback (D-12)
showErrorToast('Vorfall konnte nicht geladen werden.')
```

### Error Classification (API -> Fallback)
**Source:** `src/api/client.ts` (lines 14-47, 240-248) + `src/hooks/useIncident.ts` (lines 172-206)
**Apply to:** `WizardContext.tsx` (API fetch error handling)

**APIError class** (`src/api/client.ts` lines 14-47):
```typescript
export class APIError extends Error {
  public readonly status: number;
  isNotFound(): boolean { return this.status === 404; }
  isClientError(): boolean { return this.status >= 400 && this.status < 500; }
  isServerError(): boolean { return this.status >= 500; }
}
```

**shouldFallback helper** (`src/api/client.ts` lines 240-248):
```typescript
export function shouldFallback(error: unknown): boolean {
  if (isNetworkError(error)) return true;
  if (isAPIError(error)) return error.isServerError();
  return false;
}
```

**CRITICAL BUG (from RESEARCH.md):** `IncidentAPI.getIncident()` (`src/hooks/useIncidentAPI.ts` lines 49-58) wraps all errors in `new Error(...)`, losing the `APIError` type:
```typescript
// BUG: This loses the APIError instance
static async getIncident(id: string): Promise<Incident> {
  try {
    const incident = await apiClient.get<Incident>(`/api/incidents/${id}`);
    return incident;
  } catch (error) {
    throw new Error(
      `Failed to fetch incident: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```
**Impact:** `APIError.isNotFound()` cannot be used downstream. **Fix:** Either (a) remove the try/catch in `IncidentAPI.getIncident()` to let original errors propagate, or (b) use `apiClient.get()` directly in WizardProvider instead of going through `IncidentAPI`.

### useRouter Navigation (for 404 redirect)
**Source:** `src/components/incidents/IncidentList.tsx` (lines 9, 19, 95-97)
**Apply to:** `WizardContext.tsx` (redirect to `/incidents` on 404)
```typescript
import { useRouter } from 'next/navigation';

// Inside component:
const router = useRouter();

// Navigate to incidents list
router.push('/incidents');
```
**NOTE:** `useRouter` cannot be used inside a Context Provider directly. Pass the router as a prop or use it in WizardShell instead, dispatching a callback.

### LoadingSpinner for Hydration Wait
**Source:** `src/components/atoms/LoadingSpinner.tsx` (lines 1-46)
**Apply to:** `WizardContext.tsx` or `WizardShell.tsx` (replace `return null` with spinner when incidentId is set)
```typescript
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

// Replace current: if (!isHydrated) return null
// With: if (!isHydrated) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
```

### HYDRATE Action Dispatch
**Source:** `src/components/wizard/WizardContext.tsx` (lines 20-21, 36-48)
**Apply to:** API fetch path in extended WizardProvider
```typescript
// For API resume: set currentStep to 1 (skip Interstitial), per D-07
dispatch({ type: 'HYDRATE', data: { ...mappedWizardState, currentStep: 1 } })

// For localStorage (existing, unchanged): always start at step 0
dispatch({ type: 'HYDRATE', data: { ...parsed, currentStep: 0, noGoConfirmed: false } })
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have exact analogs in the existing codebase |

**Note:** The reverse mapping function `mapIncidentToWizardState()` has no direct analog, but its structure is the exact inverse of the existing `mapIncidentState()` in `migration.ts`. The forward mapping serves as the structural template -- reverse each field assignment.

---

## Metadata

**Analog search scope:** `src/app/`, `src/components/wizard/`, `src/lib/`, `src/hooks/`, `src/api/`, `src/__tests__/`
**Files scanned:** 16 source files read in full
**Pattern extraction date:** 2026-04-16
