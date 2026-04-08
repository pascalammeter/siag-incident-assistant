# Changelog

All notable changes to SIAG Incident Management Assistent are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — Semantic Versioning.

---

## [Unreleased]

---

## [1.1.0] — 2026-04-08

### Summary

v1.1 transforms the v1.0 frontend prototype into a production-ready incident management platform. The core wizard flow is unchanged; v1.1 adds a persistent backend, cloud storage, enhanced playbooks, and production deployment infrastructure.

### Added

#### Backend & API (Phase 7–8)
- **Neon PostgreSQL** database for persistent incident storage (uuid-keyed incidents, soft deletes, JSONB for playbook/regulatory data)
- **Next.js API routes** (Vercel Functions):
  - `GET /api/health` — health check with DB ping
  - `GET /api/incidents` — paginated list with type/severity filters
  - `POST /api/incidents` — create incident
  - `GET /api/incidents/:id` — fetch single incident
  - `PATCH /api/incidents/:id` — partial update
  - `DELETE /api/incidents/:id` — soft delete (sets `deletedAt`)
- **API key authentication** via `X-API-Key` header (timing-safe comparison)
- **CORS headers** with origin whitelisting
- **Zod validation** on all API inputs with structured error responses
- **Prisma ORM** with type-safe query builder and DB migrations
- **DB indexes** on `deletedAt`, `incident_type+deletedAt`, `severity+deletedAt` for query performance

#### Frontend Integration (Phase 9)
- **`useIncident()` hook** — API-first data fetching with localStorage fallback on network errors
- **`useIncidentAPI`** — typed API client wrapping all 5 endpoints
- **`/incidents` page** — sortable, filterable list of all stored incidents

#### v1.0 → v1.1 Data Migration (Phase 9, 13-03)
- **`MigrationService`** — detects v1.0 localStorage incidents on first v1.1 load and auto-uploads to API
- **`useMigration()` hook** — runs migration on app mount, shows toast notifications
- **`MigrationInitializer` component** — wired into root layout; zero visible UI impact
- **Cursor-based resume** — migration is safe to interrupt and retry; no duplicate uploads
- **30-day safety backup** — v1.0 data written to `siag-v1-backup` before deletion

#### Design System & UX (Phase 7, 10)
- **Dark mode** via `next-themes` with `system` default
- **SIAG color tokens**: `--siag-red: #CC0033`, `--siag-navy: #003B5E`, `--siag-orange: #D44E17`
- **Typography**: Source Sans 3 from Google Fonts (display swap, latin-ext subset)
- **Motion animations**: 150–300ms transitions, `prefers-reduced-motion` respected
- **PDF export** — professional incident report as downloadable PDF (Puppeteer/next-pdf)
- **Inline form validation** with field-level error messages

#### Multi-Type Playbooks (Phase 11)
- **Phishing playbook** — 25-step response checklist
- **DDoS playbook** — 25-step response checklist
- **Data Loss playbook** — 25-step response checklist
- **Ransomware playbook** — enhanced from v1.0 (now 25 steps with severity-tiered guidance)

#### Observability (Phase 13-02)
- **Vercel Analytics** — real-user page view tracking
- **Vercel Speed Insights** — Core Web Vitals monitoring

#### Documentation
- `docs/ARCHITECTURE.md` — system overview and component diagram
- `docs/API_ERROR_CODES.md` — complete error code reference
- `docs/DATABASE_SCHEMA.md` — Prisma schema with field documentation
- `docs/SECURITY_AUDIT.md` — OWASP checklist (A-grade)
- `docs/PERFORMANCE_BENCHMARKS.md` — k6 load test results
- `docs/TEST_COVERAGE.md` — 99 tests, >85% coverage
- `docs/v1.1/URL_ROUTING_AUDIT.md` — URL backwards compatibility verification
- `docs/v1.1/DATA_MODEL_COMPATIBILITY.md` — v1.0→v1.1 field mapping
- `docs/v1.1/WIZARD_WORKFLOW_COMPATIBILITY.md` — end-to-end test plan
- `docs/v1.1/DATA_COEXISTENCE.md` — localStorage/API coexistence strategy

### Changed

- **`next.config.ts`**: Removed `output: "export"` — enables Vercel Functions (was required for static export in v1.0)
- **Root layout** (`src/app/layout.tsx`): Added `MigrationInitializer`, `ThemeProvider`, `MotionConfig`, `ToastContainer`
- **Prisma schema**: Added performance indexes on `deletedAt`, `incident_type`, `severity`
- **Security headers** in `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Caching headers**: `Cache-Control` for static assets (1 year) and API routes (no-store)

### Fixed

- 15 pre-existing TypeScript compilation errors resolved (Phase 13-02)
- Font loading: switched to `next/font/google` to avoid FOUT and CLS

### Deprecated

- `src/api/` — Express server routes (superseded by Next.js App Router API routes in `src/app/api/`)

### Security

- API key authentication on all mutation routes (POST, PATCH, DELETE)
- Timing-safe key comparison via `crypto.timingSafeEqual()`
- CORS origin whitelist (`CORS_ORIGIN` env var required in production)
- Security headers: CSP, X-Frame-Options, Referrer-Policy

---

## [1.0.0] — 2026-04-06

### Summary

Initial production release — 7-screen Incident Response Wizard for SIAG consultants.

### Added

- **Wizard flow** — 6 steps (Einstieg, Erfassen, Klassifikation, Reaktion, Kommunikation, Dokumentation)
- **Ransomware playbook** — 20-step response checklist
- **Swiss compliance deadlines** — ISG, DSG, FINMA notification requirements auto-calculated
- **localStorage persistence** — wizard state saved between browser sessions
- **Responsive design** — works on desktop and tablet
- **Dark mode** — system preference respected
- **PDF export** — downloadable incident summary
- **SIAG branding** — custom colors, Stone Sans Pro / Source Sans Pro typography

### Deployment

- Hosted on Vercel (static export)
- URL: https://siag-incident-assistant.vercel.app
- 74/74 tests passing at release

---

[Unreleased]: https://github.com/pascalammeter/siag-incident-assistant/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/pascalammeter/siag-incident-assistant/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/pascalammeter/siag-incident-assistant/releases/tag/v1.0.0
