<!-- gsd:generated -->
# Architecture

## Overview

SIAG Incident Management Assistent is a client-side Next.js application that guides users through a structured incident-response workflow. All state is managed in the browser — there is no backend, no database, and no data transmission. The application is deployed as a static export to Vercel CDN.

```
Browser (Client only)
├── Next.js App Router (static export)
│   ├── layout.tsx          — Root layout: Header + Footer + Inter font
│   └── page.tsx            — Single entry point → WizardShell
│
├── Wizard Engine
│   ├── WizardContext       — useReducer + Context + localStorage persistence
│   ├── WizardShell         — Orchestrates step routing and navigation
│   ├── WizardProgress      — Step indicator (0–6)
│   ├── StepForm            — Generic form wrapper (react-hook-form + Zod)
│   └── StepNavigator       — Back / Next / Submit buttons
│
├── Wizard Steps (6 screens + interstitial)
│   ├── StepInterstitial    — No-Go rules gate (Step 0)
│   ├── Step1Einstieg       — Entry with hero "Shit Happens" button
│   ├── Step2Erfassen       — Incident capture: timestamp, systems, type
│   ├── Step3Klassifikation — Classification + automatic severity calculation
│   ├── Step4Reaktion       — Ransomware playbook with progress tracking
│   ├── Step5Kommunikation  — Notification obligations + communication templates
│   └── Step6Dokumentation  — Summary view + print/PDF export
│
└── Library Layer
    ├── wizard-types.ts          — TypeScript types and WizardState shape
    ├── wizard-schemas.ts        — Zod schemas + calculateSeverity()
    ├── playbook-data.ts         — Hardcoded RANSOMWARE_PLAYBOOK (phases + steps)
    └── communication-templates.ts — Dynamic template generators (GL, Mitarbeitende, Medien)
```

## Key Architectural Decisions

### Client-side only (no backend)
The application operates entirely in the browser. Wizard state is persisted to `localStorage` under the key `siag-wizard-state`. This makes the prototype shareable as a Vercel static export without any server infrastructure.

### Static export (`output: 'export'`)
`next.config.ts` sets `output: 'export'`, which produces a fully static `out/` directory. This means:
- No Next.js server features (Server Components rendering with data, Route Handlers, Middleware)
- All components that use React hooks must be Client Components (`'use client'`)
- Images are served unoptimized (`images: { unoptimized: true }`)

### Wizard state management
State is managed by a single `useReducer` in `WizardContext.tsx`. The reducer handles navigation (`NEXT_STEP`, `PREV_STEP`, `GO_TO_STEP`), per-step data updates (`UPDATE_STEP`), and hydration from localStorage (`HYDRATE`). The context exposes `state` and `dispatch` to all child components.

Hydration guard: the Provider renders `null` until localStorage is read, preventing a flash of the initial empty state.

### Form validation
Each data-entry step (Steps 2–5) uses `StepForm`, a generic wrapper around `react-hook-form` with `zodResolver`. The Zod schema per step is imported from `wizard-schemas.ts`. On successful submit, `UPDATE_STEP` is dispatched and the wizard advances.

### Severity calculation
`calculateSeverity(q1, q2, q3)` in `wizard-schemas.ts` applies Swiss incident response logic:
- `KRITISCH` if Q1=`ja` (critical systems) OR Q3=`ja`/`unbekannt` (attacker active or unknown)
- `HOCH` if only Q2=`ja` (personal data affected)
- `MITTEL` otherwise

The `unbekannt` path for Q3 defaults to `KRITISCH` (worst-case assumption, decision D-01).

### Communication templates
`communication-templates.ts` generates dynamic notification text for GL/VR, Mitarbeitende, and Medien using live `WizardState` data (timestamp, severity, incident type, affected systems). Swiss legal deadlines (ISG 24h, DSG, FINMA 24h/72h) are computed from the recognition timestamp via `computeDeadline()`.

## Component Hierarchy

```
WizardShell
└── WizardProvider (Context + localStorage)
    └── WizardShellInner
        ├── WizardProgress
        ├── [active step component]
        │   └── StepForm (steps 2–5)
        │       └── StepNavigator
        └── StepNavigator (step 1 — hero button handles forward nav)
```

## Data Flow

1. User loads the app → WizardProvider reads `siag-wizard-state` from localStorage and dispatches `HYDRATE`.
2. User interacts with a step form → `react-hook-form` manages field state locally.
3. User submits the step → `StepForm.onSubmit` dispatches `UPDATE_STEP` (persists to `WizardState`) and `NEXT_STEP`.
4. `WizardState` change → `useEffect` writes updated state to localStorage.
5. Step 6 reads the complete `WizardState` and renders the incident summary.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Forms | react-hook-form + @hookform/resolvers | latest |
| Validation | Zod | latest |
| Font | Inter (next/font/google) | — |
| Tests | Vitest + @vitejs/plugin-react | latest |
| Test env | jsdom | — |
| Deployment | Vercel static export | — |

## Directory Structure

```
siag-incident-assistant/
├── src/
│   ├── app/
│   │   ├── layout.tsx          — Root layout
│   │   ├── page.tsx            — Home page
│   │   ├── globals.css         — Tailwind v4 @theme{} tokens + global styles
│   │   ├── Header.tsx          — Site header with SIAG logo
│   │   └── Footer.tsx          — Site footer
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── wizard/
│   │       ├── WizardContext.tsx
│   │       ├── WizardShell.tsx
│   │       ├── WizardProgress.tsx
│   │       ├── StepForm.tsx
│   │       ├── StepNavigator.tsx
│   │       └── steps/
│   │           ├── StepInterstitial.tsx
│   │           ├── Step1Einstieg.tsx
│   │           ├── Step2Erfassen.tsx
│   │           ├── Step3Klassifikation.tsx
│   │           ├── Step4Reaktion.tsx
│   │           ├── Step5Kommunikation.tsx
│   │           └── Step6Dokumentation.tsx
│   ├── lib/
│   │   ├── wizard-types.ts
│   │   ├── wizard-schemas.ts
│   │   ├── playbook-data.ts
│   │   └── communication-templates.ts
│   └── __tests__/
│       ├── severity.test.ts
│       ├── wizard-reducer.test.ts
│       ├── wizard-schemas.test.ts
│       ├── localStorage.test.ts
│       ├── playbook-data.test.ts
│       ├── deadline-logic.test.ts
│       └── triage-logic.test.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── GETTING-STARTED.md
│   ├── DEVELOPMENT.md
│   ├── TESTING.md
│   └── CONFIGURATION.md
├── next.config.ts
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

## Phase Roadmap (for context)

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project Foundation (Next.js setup, layout, Wizard engine skeleton) | Complete |
| 2 | Wizard Engine (Context, reducer, localStorage, step routing) | Complete |
| 3 | Screens 0–3 (Interstitial, Einstieg, Erfassen, Klassifikation) | Complete |
| 4 | Screens 4–5 (Reaktion playbook, Kommunikation/Meldepflichten) | Complete |
| 5 | Screen 6 + Polish (Dokumentation summary, SIAG branding, mobile) | Complete |
| 6 | Deployment & Review (Vercel, advisor review, smoke test, 3 bugfixes) | Complete |
