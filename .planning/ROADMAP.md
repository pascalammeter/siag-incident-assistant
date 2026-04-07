# Roadmap — SIAG Incident Management Assistent

## Project Goal

Build a guided incident response platform for security teams in crisis. v1.0 (Phases 1–6) delivered frontend MVP. v1.1 (Phases 7–13) adds persistent backend, design system, multi-type support, and production deployment.

---

## Phases

### v1.0: MVP Frontend (Completed 2026-04-06)

- [x] **Phase 01: Design + Research** — Incident response workflow analysis, prototype iterations
- [x] **Phase 02: Frontend Scaffold** — Next.js 15, Tailwind CSS, TypeScript, component structure
- [x] **Phase 03: Core Wizard + Ransomware** — 7-screen workflow, 25-point playbook, state management
- [x] **Phase 04: Swiss Compliance** — Meldepflicht automation (ISG 24h, DSG, FINMA 24/72h), deadline calculation
- [x] **Phase 05: Screen 6 + Polish** — Summary screen, localStorage persistence, responsive design
- [x] **Phase 06: Deployment Review + Smoke Testing** — Vercel production, CI/CD, bug fixes, UAT sign-off

**Status:** Shipped 2026-04-06 | Vercel: https://siag-incident-assistant.vercel.app | Tests: 74/74 passing

### v1.1: Backend Integration + Design System (In Progress)

- [x] **Phase 07: Backend Scaffold + Design System** — Express + Prisma + PostgreSQL + SIAG palette + typography (completed 2026-04-07)
- [x] **Phase 08: API Implementation** — CRUD endpoints + export + validation + OpenAPI docs (completed 2026-04-07)
- [x] **Phase 09: Wizard ↔ Backend Integration** — Replace localStorage with API + incident list UI + type selector (completed 2026-04-07)
- [x] **Phase 10: Motion + PDF + Dark Mode** — 150-300ms transitions + professional export + theme toggle (completed 2026-04-07)
- [x] **Phase 11: Multi-Type Playbooks + Forms** — Phishing/DDoS/Data Loss playbooks + inline validation + helper text (planned 2026-04-07)
- [ ] **Phase 12: Testing + Security** — Integration tests + load tests + security audit + 80%+ coverage
- [ ] **Phase 13: Deployment + Polish** — Vercel + Neon + CI/CD + performance tuning + UAT sign-off

---

## Phase Details

### Phase 01: Design + Research

**Status:** ✅ Complete (2026-03-20)

**Summary:** Incident response workflow analysis, prototype iterations, requirements documentation.

---

### Phase 02: Frontend Scaffold

**Status:** ✅ Complete (2026-03-22)

**Summary:** Next.js 15, Tailwind CSS, TypeScript, component structure, deployment setup on Vercel.

---

### Phase 03: Core Wizard + Ransomware

**Status:** ✅ Complete (2026-03-24)

**Summary:** 7-screen workflow, 25-point Ransomware playbook, state management with useWizard hook.

---

### Phase 04: Swiss Compliance

**Status:** ✅ Complete (2026-03-26)

**Summary:** Meldepflicht automation (ISG 24h, DSG, FINMA 24/72h), deadline calculation, compliance UI.

---

### Phase 05: Screen 6 + Polish

**Status:** ✅ Complete (2026-04-02)

**Summary:** Summary screen, localStorage persistence, responsive design refinement, accessibility.

---

### Phase 06: Deployment Review + Smoke Testing

**Status:** ✅ Complete (2026-04-06)

**Summary:** Vercel production deployment, GitHub CI/CD setup, smoke test execution, UAT sign-off, bugfixes.

---

### Phase 07: Backend Scaffold + Design System

**Goal:** Establish backend infrastructure and SIAG design tokens as foundation for all subsequent phases. Express app running locally, Prisma ORM connected to PostgreSQL, all color and typography tokens updated to spec.

**Depends on:** Nothing (foundation phase)

**Requirements:** B1.1–B1.6, B2.1–B2.4, B3.1–B3.4, D1.1–D1.6, D2.1–D2.6

**Success Criteria** (what must be TRUE):
  1. Express app runs locally on localhost:3000 with TypeScript strict mode enabled
  2. Prisma connects to Neon PostgreSQL and migrations can be run (`npm run prisma:migrate`)
  3. All SIAG colors (#CC0033 red, #D44E17 orange, #003B5E navy) applied as CSS custom properties in globals.css
  4. Typography hierarchy implemented: Stone Sans display fonts (H1/H2) and Source Sans body text with correct font weights and line-height
  5. OpenAPI specification generated and Swagger UI accessible at /api-docs

**Plans:** 6/6 complete

Plan breakdown:
- [x] 07-01a-PLAN.md — Express Scaffold + TypeScript Configuration
- [x] 07-01b-PLAN.md — Prisma ORM Initialization (depends on 07-01a)
- [x] 07-01c-PLAN.md — Fix PrismaClient Adapter Configuration (Prisma v7.6.0) [GAP CLOSURE]
- [x] 07-01d-PLAN.md — Fix Prisma Config Type Definition (prisma.config.ts) [GAP CLOSURE]
- [x] 07-02-PLAN.md — Database Schema + Prisma Migrations (depends on 07-01b)
- [x] 07-03-PLAN.md — Design System Implementation (depends on 07-01a only; parallel with 07-02)

**Status:** ✅ Complete (2026-04-07)

---

### Phase 8: API Implementation

**Goal:** Implement all 5 CRUD endpoints for incident management, export endpoints for JSON/PDF, request validation with Zod, and comprehensive API documentation. All endpoints tested and responding correctly.

**Depends on:** Phase 7 (including gap-closure plans 07-01c and 07-01d)

**Requirements:** B4.1–B4.5, B5.1–B5.4, B6.1–B6.4, B7.1–B7.4

**Success Criteria** (what must be TRUE):
  1. POST /api/incidents creates incident and returns with 201 status code and ID
  2. GET /api/incidents lists incidents with filtering by type and severity working correctly
  3. GET /api/incidents/:id, PATCH /api/incidents/:id, DELETE /api/incidents/:id all respond with correct HTTP status codes
  4. POST /api/incidents/:id/export/json returns valid JSON file; /export/pdf returns binary PDF file
  5. Invalid requests return 400 with field-level validation error messages from Zod
  6. All endpoints documented in Swagger UI with request/response examples

**Plans:** 4/4 complete

Plan breakdown:
- [x] 08-01-PLAN.md — CRUD Endpoints Implementation
- [x] 08-02-PLAN.md — Incident List Endpoint with Filtering
- [x] 08-03-PLAN.md — Export Endpoints (JSON & PDF)
- [x] 08-04-PLAN.md — OpenAPI Documentation & Swagger UI

**Status:** ✅ Complete (2026-04-07)

---

### Phase 9: Wizard ↔ Backend Integration

**Goal:** Replace localStorage with API-backed incident storage. Users can create new incidents, resume previous incidents from list, and select incident type on Step 1. All v1.0 workflows remain unchanged from user perspective.

**Depends on:** Phase 7, Phase 8

**Requirements:** W1.1–W1.5, W2.1–W2.4, W3.1–W3.5, W4.1–W4.4

**Success Criteria** (what must be TRUE):
  1. New `useIncident()` hook replaces `useWizard()` for API-backed state; wizard saves to API when completed instead of localStorage
  2. Incident list page displays all incidents with sortable columns (date, type, severity) and filterable by type/severity
  3. User can resume incomplete incident from list and wizard hydrates with correct state
  4. Step 1 includes incident type selector (radio buttons: Ransomware, Phishing, DDoS, Data Loss, Other)
  5. All 74 existing tests still pass; no breaking changes to v1.0 user workflows
  6. localStorage fallback works if API unavailable (graceful degradation)

**Plans:** 3/3 complete

Plan breakdown:
- [x] 09-01-PLAN.md — useIncident() Hook Implementation (Wave 1, parallel with 09-03)
- [x] 09-02-PLAN.md — Data Migration Layer (Wave 2, depends on 09-01)
- [x] 09-03-PLAN.md — Incident List UI & Integration (Wave 1, parallel with 09-01)

**Wave Structure:**
- Wave 1 (parallel): 09-01 (useIncident hook) + 09-03 (incident list page) — no file conflicts
- Wave 2: 09-02 (migration layer) — depends on Wave 1 hook completion

**Status:** ✅ Complete (2026-04-07)

**UI hint:** yes

---

### Phase 10: Motion + PDF + Dark Mode

**Status:** ✅ Complete (2026-04-07)

**Summary:** Animation library integration (Motion v12.38.0) with 150-300ms transitions on all interactive elements, professional PDF export with title pages and headers/footers, and dark mode support with localStorage persistence.

**Completed Plans:**
- [x] 10-01 PLAN: Motion + Button States + Loading Spinner + Root Layout Providers
- [x] 10-02 PLAN: Dark Mode with next-themes + Tailwind v4
- [x] 10-03 PLAN: PDF Export with Puppeteer + Title Page + Headers/Footers

**Success Criteria** (all TRUE):
  1. ✅ All buttons show hover state (150ms ease-out transition) and press state (100ms scale 0.98); cards elevate on hover with shadow increase
  2. ✅ Loading spinner animates (12-frame rotation, 1s duration) when API request in flight
  3. ✅ prefers-reduced-motion:reduce respected — no animations if user has accessibility setting enabled
  4. ✅ PDF export includes professional title page with SIAG logo, incident metadata, and optimized multi-page layout with page breaks and headers/footers
  5. ✅ Dark mode toggle in header; theme persists to localStorage; all text readable in both light and dark modes
  6. ✅ Print styles optimized: no bright backgrounds, minimum 12pt text, colors suitable for printing

**Test Coverage:** 80/80 tests passing (20 motion, 9 dark-mode, 51 PDF export)

---

### Phase 11: Multi-Type Playbooks + Forms

**Goal:** Support 4 incident types with dedicated playbooks (25-point checklists each), inline form validation with helper text, and improved error feedback. Users select incident type and see correct playbook immediately.

**Depends on:** Phase 10

**Requirements:** M1.1–M1.5, M2.1–M2.5, M3.1–M3.5, M4.1–M4.4, P2.1–P2.5, P3.1–P3.4, P4.1–P4.4, P5.1–P5.4

**Success Criteria** (what must be TRUE):
  1. Phishing playbook (25 points) covers detection, containment, investigation, communication with phishing-specific content
  2. DDoS playbook (25 points) covers detection, mitigation, upstream notification, communication with DDoS-specific content
  3. Data Loss playbook (25 points) covers detection, containment, investigation, communication with data loss-specific content
  4. Wizard Step 4 loads correct playbook based on incident_type selected in Step 1; can be re-classified if needed
  5. Form validation triggered on blur (not just submit); error messages display immediately below field with red border; required fields marked with (*)
  6. Helper text below complex inputs (multi-select, date) explains constraints and provides examples
  7. Save button shows loading spinner during API request; disabled to prevent double-submit; error toast appears if request fails
  8. API errors mapped to user-friendly messages (not technical error codes)

**Plans:** 4/4 complete

Plan breakdown:
- [x] 11-01-PLAN.md — Phishing Playbook + Content Data Structure (Wave 1)
- [x] 11-02-PLAN.md — DDoS + Data Loss Playbooks (Wave 1, depends on 11-01)
- [x] 11-03-PLAN.md — Form Validation: onBlur, Error Display, Helper Text (Wave 1, parallel)
- [x] 11-04-PLAN.md — Error Mapping + Toast Integration (Wave 2, depends on 11-03)

**UI hint:** yes

**Status:** ⏳ Planned (2026-04-07) — Ready for execution

---

### Phase 12: Testing + Security

**Goal:** Comprehensive test coverage on new backend code (>80%), load testing to verify API can handle 100+ concurrent requests, security audit to address OWASP Top 10 and CH regulatory requirements, and finalized documentation.

**Depends on:** Phase 11

**Requirements:** T1.1–T1.4, T2.1–T2.4, T3.1–T3.5, T4.1–T4.6

**Success Criteria** (what must be TRUE):
  1. Unit tests written for all API logic, Zod schemas, and utility functions; coverage >80% for new backend code
  2. Integration tests cover end-to-end flows: Create → Save → List → Retrieve, and Wizard → Submit → Persisted
  3. Load test results: 100 concurrent requests to /api/incidents average <200ms, p95 <500ms; no response timeouts or errors
  4. Load test results: 50 concurrent incident creates over 5 minutes complete successfully; no memory leaks detected over 10-minute test
  5. Security audit completed: CORS headers correct, SQL injection prevented, no sensitive data exposed, API key auth working, rate limiting configured
  6. OWASP Top 10 checklist signed off; no critical vulnerabilities found
  7. API documentation (Swagger) complete with examples; database schema documented with ER diagram; integration guide for platform teams provided

**Plans:** TBD

---

### Phase 13: Deployment + Polish

**Goal:** Deploy v1.1 to production (Vercel + Neon), optimize performance to Lighthouse ≥90, verify backwards compatibility with v1.0, complete UAT with SIAG consultant, and provide sign-off for production promotion.

**Depends on:** Phase 12

**Requirements:** DE1.1–DE1.5, DE2.1–DE2.4, DE3.1–DE3.4, DE4.1–DE4.4, DE5.1–DE5.4, DE6.1–DE6.5, DE7.1–DE7.5

**Success Criteria** (what must be TRUE):
  1. Backend deployed as Vercel Functions; frontend deployed as static export; environment variables configured; production URL live and accessible
  2. Neon PostgreSQL provisioned; connection pooling configured for serverless; migrations run on first deploy; backups enabled
  3. GitHub Actions workflow running tests on pull requests and deploying on main branch; tests must pass before merge allowed
  4. API response times average <200ms (p95 <500ms); database queries optimized with indexes; Lighthouse score ≥90; Core Web Vitals met (LCP <2.5s, FID <100ms, CLS <0.1)
  5. All v1.0 URLs still accessible and functional; no breaking changes to wizard workflows; localStorage incidents automatically migrate to API on v1.1 first load
  6. SIAG consultant completes UAT: all 4 incident types tested end-to-end, PDF export verified for professional quality, performance tested on mobile networks
  7. SIAG consultant sign-off provided; README updated with backend setup; API docs and integration guide finalized; .env.example provided

**Plans:** TBD

---

## Dependencies

- **Phase 7** → Nothing (foundation)
- **Phase 8** → Phase 7 (needs Express + Prisma + DB schema)
- **Phase 9** → Phase 7 + Phase 8 (needs API endpoints)
- **Phase 10** → Phase 9 (wizard must be API-backed first)
- **Phase 11** → Phase 10 (needs motion + form infrastructure)
- **Phase 12** → Phase 11 (testing everything, all features in place)
- **Phase 13** → Phase 12 (production deployment after testing)

---

## Progress Tracking

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Backend Scaffold + Design System | 6/6 | ✅ Complete | 2026-04-07 |
| 8. API Implementation | 4/4 | ✅ Complete | 2026-04-07 |
| 9. Wizard ↔ Backend Integration | 3/3 | ✅ Complete | 2026-04-07 |
| 10. Motion + PDF + Dark Mode | 3/3 | ✅ Complete | 2026-04-07 |
| 11. Multi-Type Playbooks + Forms | 4/4 | 📋 Planned | 2026-04-07 |
| 12. Testing + Security | 0/3 | ⏳ Pending | — |
| 13. Deployment + Polish | 0/4 | ⏳ Pending | — |

**Total:** 24/27 plans | **Completed:** 20/27 (74%); **Planned:** 4/4 (89%) | **Estimate:** 2.5 weeks remaining (Phases 11–13)
