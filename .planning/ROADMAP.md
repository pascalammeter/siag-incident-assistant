# Roadmap — SIAG Incident Management Assistent v1.1

## Project Goal

Transform v1.0 frontend MVP into professional-grade incident management platform with persistent backend storage, SIAG design system compliance, multi-incident type support (Ransomware, Phishing, DDoS, Data Loss), and REST API for platform integration.

---

## Phases

- [ ] **Phase 7: Backend Scaffold + Design System** — Express + Prisma + PostgreSQL + SIAG palette + typography
- [ ] **Phase 8: API Implementation** — CRUD endpoints + export + validation + OpenAPI docs
- [ ] **Phase 9: Wizard ↔ Backend Integration** — Replace localStorage with API + incident list UI + type selector
- [ ] **Phase 10: Motion + PDF + Dark Mode** — 150-300ms transitions + professional export + theme toggle
- [ ] **Phase 11: Multi-Type Playbooks + Forms** — Phishing/DDoS/Data Loss playbooks + inline validation + helper text
- [ ] **Phase 12: Testing + Security** — Integration tests + load tests + security audit + 80%+ coverage
- [ ] **Phase 13: Deployment + Polish** — Vercel + Neon + CI/CD + performance tuning + UAT sign-off

---

## Phase Details

### Phase 7: Backend Scaffold + Design System

**Goal:** Establish backend infrastructure and SIAG design tokens as foundation for all subsequent phases. Express app running locally, Prisma ORM connected to PostgreSQL, all color and typography tokens updated to spec.

**Depends on:** Nothing (foundation phase)

**Requirements:** B1.1–B1.6, B2.1–B2.4, B3.1–B3.4, D1.1–D1.6, D2.1–D2.6

**Success Criteria** (what must be TRUE):
  1. Express app runs locally on localhost:3000 with TypeScript strict mode enabled
  2. Prisma connects to Neon PostgreSQL and migrations can be run (`npm run prisma:migrate`)
  3. All SIAG colors (#CC0033 red, #D44E17 orange, #003B5E navy) applied as CSS custom properties in globals.css
  4. Typography hierarchy implemented: Stone Sans display fonts (H1/H2) and Source Sans body text with correct font weights and line-height
  5. OpenAPI specification generated and Swagger UI accessible at /api-docs

**Plans:** 4 plans (07-01a + 07-01b + 07-02 + 07-03)

Plan breakdown:
- [ ] 07-01a-PLAN.md — Express Scaffold + TypeScript Configuration
- [ ] 07-01b-PLAN.md — Prisma ORM Initialization (depends on 07-01a)
- [ ] 07-02-PLAN.md — Database Schema + Prisma Migrations (depends on 07-01b)
- [ ] 07-03-PLAN.md — Design System Implementation (depends on 07-01a only; parallel with 07-02)

Wave structure:
- Wave 1: 07-01a (Express Scaffold)
- Wave 2 (parallel): 07-01b → 07-02 (sequential), 07-03 (independent of 07-02)

---

### Phase 8: API Implementation

**Goal:** Implement all 5 CRUD endpoints for incident management, export endpoints for JSON/PDF, request validation with Zod, and comprehensive API documentation. All endpoints tested and responding correctly.

**Depends on:** Phase 7

**Requirements:** B4.1–B4.5, B5.1–B5.4, B6.1–B6.4, B7.1–B7.4

**Success Criteria** (what must be TRUE):
  1. POST /api/incidents creates incident and returns with 201 status code and ID
  2. GET /api/incidents lists incidents with filtering by type and severity working correctly
  3. GET /api/incidents/:id, PATCH /api/incidents/:id, DELETE /api/incidents/:id all respond with correct HTTP status codes
  4. POST /api/incidents/:id/export/json returns valid JSON file; /export/pdf returns binary PDF file
  5. Invalid requests return 400 with field-level validation error messages from Zod
  6. All endpoints documented in Swagger UI with request/response examples

**Plans:** TBD

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

**Plans:** TBD

**UI hint:** yes

---

### Phase 10: Motion + PDF + Dark Mode

**Goal:** Add premium UX polish with animations, professional PDF export with title pages and optimized layout, and dark mode support. All interactive elements animate within 150-300ms, PDF is print-ready, dark mode respects user preference.

**Depends on:** Phase 9

**Requirements:** D3.1–D3.6, D4.1–D4.6, P1.1–P1.6

**Success Criteria** (what must be TRUE):
  1. All buttons show hover state (150ms ease-out transition) and press state (100ms scale 0.98); cards elevate on hover with shadow increase
  2. Loading spinner animates (12-frame rotation, 1s duration) when API request in flight
  3. prefers-reduced-motion:reduce respected — no animations if user has accessibility setting enabled
  4. PDF export includes professional title page with SIAG logo, incident metadata, and optimized multi-page layout with page breaks and headers/footers
  5. Dark mode toggle in header; theme persists to localStorage; all text readable in both light and dark modes
  6. Print styles optimized: no bright backgrounds, minimum 12pt text, colors suitable for printing

**Plans:** TBD

**UI hint:** yes

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

**Plans:** TBD

**UI hint:** yes

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
| 7. Backend Scaffold + Design System | 0/4 | Not started | - |
| 8. API Implementation | 0/4 | Not started | - |
| 9. Wizard ↔ Backend Integration | 0/3 | Not started | - |
| 10. Motion + PDF + Dark Mode | 0/3 | Not started | - |
| 11. Multi-Type Playbooks + Forms | 0/4 | Not started | - |
| 12. Testing + Security | 0/3 | Not started | - |
| 13. Deployment + Polish | 0/4 | Not started | - |

**Total:** 0/25 plans | **Estimate:** 7 weeks (1 week per phase)
