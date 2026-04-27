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

## v1.1 Update — Server-side Persistence Overview

The sections above reflect the original v1.0 client-only prototype. Starting with v1.1, the application adds a server-side API layer backed by a hosted PostgreSQL database. The wizard UI, component hierarchy, and step flow described above remain unchanged; what changes is how incident data is persisted and exchanged. The sections below describe the additions introduced in v1.1.

Two important corrections to the v1.0 overview now apply in v1.1:

- `next.config.ts` no longer sets `output: 'export'`. The comment in `next.config.ts` explicitly states: "Removed output: 'export' to enable Vercel Functions (API routes require server runtime)." The application is now deployed as a Next.js application on Vercel with serverless functions, not as a static export.
- Data no longer lives exclusively in `localStorage`. Incidents are now persisted to a Neon PostgreSQL database via Prisma, accessed through authenticated REST endpoints under `/api/incidents`. `localStorage` still plays a role in the migration path from v1.0 to v1.1 (see the "Migration Service" section below).

## API Layer

v1.1 introduces a REST API layer that lives alongside the wizard UI. Two complementary implementations exist in the repository, both documented in `docs/API.md`:

1. **Next.js App Router route handlers** (primary deployment target) — serverless endpoints under `src/app/api/` that run as Vercel Functions.
2. **Standalone Express server** (`src/api/index.ts`) — a parallel implementation used for local backend development and for generating the OpenAPI spec. Started via `npm run dev:backend`; both dev servers run together with `npm run dev:all`.

### Endpoint surface

The canonical endpoint set (see `docs/API.md` for full request/response schemas):

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/incidents` | List incidents (paginated, filter by type/severity) |
| `POST` | `/api/incidents` | Create a new incident |
| `GET` | `/api/incidents/[id]` | Get a single incident by UUID |
| `PATCH` | `/api/incidents/[id]` | Partially update an incident |
| `DELETE` | `/api/incidents/[id]` | Soft-delete an incident |
| `POST` | `/api/incidents/[id]/export/json` | Export incident as JSON file |
| `POST` | `/api/incidents/[id]/export/pdf` | Export incident as PDF (Puppeteer + Chromium) |
| `GET` | `/api/health` | Server health check (unauthenticated) |
| `GET` | `/api/swagger` + `/api/swagger/openapi.json` | OpenAPI 3.0 spec |

### Request pipeline

For each App Router handler under `src/app/api/incidents/`:

1. `OPTIONS` is handled by `handleOptions()` (CORS preflight) from `src/app/api/_helpers.ts`.
2. `validateApiKey(request)` checks the `X-API-Key` header against the `API_KEY` environment variable using constant-time comparison; on failure it returns `401`.
3. The request payload or query is parsed with a Zod schema from `src/api/schemas/incident.schema.ts` (e.g., `CreateIncidentInputSchema`, `ListIncidentsQuerySchema`). `ZodError` results in a structured `400` response.
4. `IncidentService` (from `src/api/services/incident.service.ts`) executes the Prisma call against the database.
5. Responses are returned via `jsonResponse()` / `errorResponse()` helpers with consistent envelope shape.

### Authentication and caching

- Every `/api/incidents*` endpoint requires the `X-API-Key` header; `/api/health` does not.
- Cache headers are defined in `next.config.ts` `headers()`: `GET /api/incidents` has `max-age=300` with `stale-while-revalidate=60`, and `GET /api/incidents/:id` has `max-age=600`.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`) are applied to non-API routes via the same `headers()` config.

### Services

`src/api/services/` contains the business logic shared by both the App Router handlers and the Express server:

- `incident.service.ts` — Prisma-backed CRUD with soft-delete filtering (`deletedAt IS NULL`), pagination, and type/severity filtering.
- `pdf.service.ts` — PDF rendering pipeline using `puppeteer` + `@sparticuz/chromium-min` (Chromium binary compatible with Vercel serverless).

## Database Persistence

v1.1 persists incidents in **Neon PostgreSQL** via **Prisma ORM** (`@prisma/client` v7 with `@prisma/adapter-neon` for serverless-friendly connections).

### Prisma schema layout

The schema is defined in `prisma/schema.prisma`:

- `generator client` — generates the Prisma Client (`provider = "prisma-client-js"`).
- `datasource db` — PostgreSQL provider; connection URL read from environment at runtime.
- `model Incident` — the single domain model for v1.1.

### Incident model structure

The `Incident` model is grouped into logical sections (see `prisma/schema.prisma` for the authoritative field list):

| Group | Fields | Notes |
|-------|--------|-------|
| Identity & timestamps | `id` (uuid PK), `createdAt`, `updatedAt`, `deletedAt` | Soft-delete via `deletedAt` timestamp |
| Recognition | `erkennungszeitpunkt`, `erkannt_durch`, `betroffene_systeme` (String[]), `erste_erkenntnisse` | German field names mirror wizard step 2 |
| Classification | `incident_type`, `q1`, `q2`, `q3`, `severity`, `description` | Enum strings stored as `VarChar` |
| Playbook progress | `playbook` (JSONB) | Structure: `{ checkedSteps: [...], status }` |
| Regulatory | `regulatorische_meldungen` (JSONB) | ISG 24h / DSG / FINMA 24h+72h deadlines |
| Metadata | `metadata` (JSONB) | Freeform tags, notes, custom fields |

### Indexes

The schema declares indexes for the common query shapes used by `IncidentService.listIncidents()`:

- Single-column: `incident_type`, `severity`, `createdAt DESC`, `erkennungszeitpunkt DESC`, `deletedAt`.
- Composite: `(incident_type, deletedAt)`, `(severity, deletedAt)` — accelerate filtered list queries that always include the soft-delete predicate.

### Migrations and client wiring

- Migrations live under `prisma/migrations/` (`001_init_incident` establishes the initial schema).
- `npm run prisma:generate` runs automatically before `next build` (see `"build": "prisma generate && next build"` in `package.json`).
- `npm run prisma:migrate` applies migrations in development; `npm run prisma:push` is available for rapid schema sync; `npm run prisma:studio` opens the Prisma Studio GUI.
- The Prisma Client is instantiated once in `src/api/config/prisma.ts` and imported by `IncidentService`. A parallel singleton exists at `src/lib/prisma.ts` for use from App Router handlers.
- `prisma/seed.ts` is registered as the Prisma seed entry point via `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json`.

## Migration Service (v1.0 → v1.1)

Because v1.0 stored incidents in `localStorage`, v1.1 includes an in-browser migration layer so existing users do not lose their work when they first load the new version.

### Components

- `src/lib/migration.ts` — schema-mapping logic. Defines `LegacyWizardState` and companion `LegacyErfassenData` / `LegacyKlassifikationData` / `LegacyReaktionData` / `LegacyKommunikationData` interfaces, and exposes `mapIncidentType()`, `migrateIncidents()`, and `getV1StateFromStorage()`.
- `src/hooks/useMigration.ts` — React hook that orchestrates migration on app load. Reads `siag-wizard-state` from `localStorage`, calls `migrateIncidents()`, POSTs the result to `/api/incidents`, and reports outcome via `sonner` toast notifications (with a `console.log` fallback when the toast library is unavailable).
- `src/hooks/useIncidentAPI.ts` / `src/hooks/useIncident.ts` — client-side hooks used by both the wizard and the migration flow to communicate with the API.

### Runtime flow

1. On first app load after the v1.1 upgrade, `useMigration()` checks `localStorage.getItem('siag-migration-completed')`. If already `'true'`, the hook returns early.
2. Otherwise it reads legacy state from `siag-wizard-state` via `getV1StateFromStorage()`.
3. Legacy field names are translated to the v1.1 schema — for example, `mapIncidentType('datenverlust')` returns `'data_loss'`, `'unbefugter-zugriff'` maps to `'other'`, and German classification answers (`'ja' | 'nein' | 'unbekannt'`) are translated into numeric `q1`/`q2`/`q3` values plus a canonical `severity` string.
4. The translated payload is POSTed to `/api/incidents` with the configured API key.
5. On success, `siag-migration-completed` is set to `'true'` and the user sees a success toast. On failure, the legacy state is preserved under `siag-migration-pending` for retry, and an error toast is shown.

Migration is one-way: once the v1.0 state has been translated and the API has accepted it, the server-side `Incident` row becomes the source of truth and the wizard reads from the API for subsequent sessions.
