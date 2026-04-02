# Phase 2: Wizard Engine — Technical Research

**Phase:** 2 — Wizard Engine
**Researched:** 2026-04-01
**Source:** Consolidated from project-wide research (`.planning/research/RESEARCH.md`)
**Confidence:** HIGH

---

## Phase 2 Goal

Vollständige technische Wizard-Infrastruktur: State-Management, Navigation, Forms, Persistenz — ohne Inhalte.

5 deliverables:
1. `useReducer` + React Context — WizardContext mit vollständig getyptem State für alle 7 Schritte
2. `localStorage` Persistenz — SSR-sicherer Hydration-Guard
3. `StepNavigator`-Komponente — Fortschrittsbar, Schritt-Labels, Vor/Zurück-Buttons (KEINE next/* Imports)
4. `react-hook-form` + Zod Integration — pro-Schritt-Form mit `zodResolver`, Dispatch on Submit
5. 7 Placeholder-Screens als eigenständige Komponenten

---

## 1. Wizard State: useReducer + React Context

**Entscheidung:** `useReducer` + React Context (kein Zustand/Jotai für MVP — unnötige Abhängigkeit)

### WizardState Typ

```ts
// lib/wizard-types.ts
type WizardState = {
  currentStep: number        // 0 = No-Go Interstitial, 1–6 = Wizard-Schritte
  noGoConfirmed: boolean     // Interstitial-Bestätigung
  einstieg: EinstiegData | null
  erfassen: ErfassenData | null
  klassifikation: KlassifikationData | null
  reaktion: ReaktionData | null
  kommunikation: KommunikationData | null
  dokumentation: DokumentationData | null
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'CONFIRM_NO_GO' }
  | { type: 'UPDATE_STEP'; stepKey: keyof Omit<WizardState, 'currentStep' | 'noGoConfirmed'>; data: unknown }
  | { type: 'RESET' }
```

### Context Pattern

```ts
// components/wizard/WizardContext.tsx — 'use client'
const WizardContext = createContext<{ state: WizardState; dispatch: Dispatch<WizardAction> } | null>(null)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)
  return <WizardContext.Provider value={{ state, dispatch }}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
```

---

## 2. localStorage Persistenz (SSR-sicher)

**Critical constraint:** Next.js 15 App Router + `output: 'export'` → Komponenten können serverseitig gerendert werden. `localStorage` existiert nur im Browser. Ohne Guard → `ReferenceError: localStorage is not defined`.

### Hydration-Guard Pattern

```ts
// Nur im useEffect (nach Hydration) lesen/schreiben
useEffect(() => {
  const saved = localStorage.getItem('siag-wizard-state')
  if (saved) {
    try {
      dispatch({ type: 'HYDRATE', data: JSON.parse(saved) })
    } catch { /* ignore corrupt data */ }
  }
}, [])  // Einmal beim Mount

useEffect(() => {
  localStorage.setItem('siag-wizard-state', JSON.stringify(state))
}, [state])  // Bei jeder State-Änderung speichern
```

**Kein `typeof window !== 'undefined'` Check nötig** — `useEffect` läuft garantiert nur im Browser.

---

## 3. StepNavigator Komponente

**Constraint NF3.7:** Keine `next/*` Imports in Wizard-Komponenten. Navigation via Callbacks.

```ts
// components/wizard/StepNavigator.tsx — 'use client'
interface StepNavigatorProps {
  currentStep: number          // 1–6 (Interstitial = 0, zählt nicht)
  totalSteps: number           // 6
  stepLabels: string[]         // ['Einstieg', 'Erfassen', 'Klassifikation', ...]
  onNext: () => void
  onPrev: () => void
  isNextDisabled?: boolean
  nextLabel?: string           // Default: 'Weiter'
  prevLabel?: string           // Default: 'Zurück'
}
```

### Progress Bar: CSS-basiert, kein externes Package

```tsx
<div className="w-full bg-siag-gray-light h-2 rounded-full">
  <div 
    className="bg-siag-navy h-2 rounded-full transition-all"
    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
  />
</div>
<p className="text-sm text-gray-500 mt-1">Schritt {currentStep} von {totalSteps}</p>
```

---

## 4. react-hook-form + Zod (pro-Schritt)

**Entscheidung:** Separate `useForm()` Instanz pro Schritt — KEIN globales Form über alle Steps.

```bash
# Dependencies (müssen installiert sein vor Phase 2)
npm install react-hook-form zod @hookform/resolvers
```

### Pro-Schritt-Pattern

```ts
// In jedem Step-Component ('use client')
const schema = z.object({ /* step-specific fields */ })
type StepData = z.infer<typeof schema>

function StepComponent() {
  const { state, dispatch } = useWizard()
  const { register, handleSubmit, formState: { errors } } = useForm<StepData>({
    resolver: zodResolver(schema),
    defaultValues: state.stepKey ?? {}  // Pre-populate on back-navigation
  })
  
  const onNext = handleSubmit((data) => {
    dispatch({ type: 'UPDATE_STEP', stepKey: 'stepKey', data })
    dispatch({ type: 'NEXT_STEP' })
  })
  
  return <form onSubmit={onNext}>...</form>
}
```

### Zod Schemas in Phase 2 (Placeholder — leer aber typisiert)

Phase 2 scaffoldet leere Schemas. Content folgt in Phase 3–5.

```ts
// lib/wizard-schemas.ts
export const einstiegSchema = z.object({}) // Placeholder
export const erfassenSchema = z.object({}) // Placeholder
// ... für alle 6 Schritte
```

---

## 5. Component Architecture (Platform-Ready)

**Verzeichnisstruktur für Phase 2:**

```
src/
  components/
    wizard/
      WizardContext.tsx         # useReducer + Context + useWizard hook
      WizardShell.tsx           # Outer container (WizardProvider + Routing)
      WizardProgress.tsx        # Fortschrittsbar + Schritt-Label
      StepNavigator.tsx         # Vor/Zurück-Buttons
      steps/
        StepInterstitial.tsx    # No-Go Interstitial (Step 0)
        Step1Einstieg.tsx       # Placeholder
        Step2Erfassen.tsx       # Placeholder
        Step3Klassifikation.tsx # Placeholder
        Step4Reaktion.tsx       # Placeholder
        Step5Kommunikation.tsx  # Placeholder
        Step6Dokumentation.tsx  # Placeholder
      index.ts                  # barrel: export { WizardShell }
  lib/
    wizard-types.ts             # WizardState, WizardAction types
    wizard-schemas.ts           # Zod schemas (Phase 2: empty placeholders)
```

**Absolute Regel:** Keine `next/*` Imports ausserhalb `app/`. WizardShell nimmt Navigation-Callbacks als Props.

---

## 6. Wave-Abhängigkeiten

| Plan | Inhalt | Wave | Depends on |
|------|--------|------|-----------|
| 02-01 | Types + WizardContext | 1 | Phase 1 (Projekt setup) |
| 02-02 | localStorage Persistenz | 2 | 02-01 |
| 02-03 | StepNavigator + WizardShell | 2 | 02-01 |
| 02-04 | react-hook-form + Zod Integration | 3 | 02-01, 02-03 |
| 02-05 | 7 Placeholder-Screens | 3 | 02-01, 02-03, 02-04 |

---

## Validation Architecture

### Test Framework
- **Framework:** Vitest (bereits konfiguriert via Phase 1)
- **Test-Typ:** Unit-Tests für WizardContext (Reducer) + Integration-Tests für Form-Validation
- **Quick run:** `npm test -- --run`
- **Critical paths (müssen getestet sein):**
  - `wizardReducer`: NEXT_STEP, PREV_STEP, UPDATE_STEP, RESET, CONFIRM_NO_GO
  - localStorage hydration: korrekte Deserialisierung + Fehlertoleranz
  - Zod schemas: valid/invalid Inputs

### Testdatei-Struktur (Phase 2)
```
src/
  __tests__/
    wizard-reducer.test.ts     # wizardReducer Unit-Tests
    localStorage.test.ts       # Hydration-Guard Tests
    wizard-schemas.test.ts     # Zod Schema Validierung
```

---

## Summary: Decisions für Phase 2

| Question | Decision | Confidence |
|---|---|---|
| State management | `useReducer` + React Context in `WizardContext.tsx` | HIGH |
| localStorage | `useEffect`-basierter Hydration-Guard (kein SSR-Check nötig) | HIGH |
| Navigation | Props-basiert — keine `next/*` Imports in Wizard-Komponenten | HIGH |
| Forms | Separate `useForm()` pro Schritt mit `zodResolver` | HIGH |
| Zod schemas | Leere Placeholder-Schemas in Phase 2, befüllt in Phase 3–5 | HIGH |
| Test coverage | `wizardReducer` + localStorage + Zod schemas via Vitest | HIGH |

## Sources
- `.planning/research/RESEARCH.md` — Technische Research (Next.js 15, Wizard State, Tailwind v4)
- `.planning/REQUIREMENTS.md` — NF3.4, NF3.7, NF3.8, F1.4, NF1.3
- `.planning/ROADMAP.md` — Phase 2 Ziele und Success Criteria
