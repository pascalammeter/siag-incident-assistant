# Requirements — SIAG Incident Management Assistent v1.1

## Goal

Professional-grade incident management platform with persistent backend storage, SIAG design system compliance, multi-incident type support, and platform integration APIs.

---

## Functional Requirements

### Backend & API (Phase 7–8)

#### B1 — Express Application Scaffold
- B1.1 Express.js server running on localhost:3000
- B1.2 TypeScript configuration (tsconfig.json) with strict mode
- B1.3 Environment variable loading (.env.local for local dev)
- B1.4 CORS middleware configured for frontend integration
- B1.5 Request logging middleware (morgan or similar)
- B1.6 Error handling middleware with consistent error response format

#### B2 — Prisma ORM Integration
- B2.1 Prisma client initialized and connected to PostgreSQL
- B2.2 Database schema defined with incident, playbook, audit_log tables
- B2.3 Prisma migrations workflow documented (migrate dev → deploy)
- B2.4 Database connection pooling configured (Neon serverless)

#### B3 — PostgreSQL Database
- B3.1 Neon PostgreSQL instance provisioned on Vercel
- B3.2 Connection string stored in environment variables
- B3.3 Database schema applied via Prisma migrate
- B3.4 Indexes created on frequent query columns (incident_type, severity, createdAt)

#### B4 — Incident CRUD Endpoints
- B4.1 POST /api/incidents → Create incident (validates input with Zod)
- B4.2 GET /api/incidents → List all incidents (supports filtering by type/severity/date)
- B4.3 GET /api/incidents/:id → Retrieve single incident
- B4.4 PATCH /api/incidents/:id → Update incident (partial updates allowed)
- B4.5 DELETE /api/incidents/:id → Soft-delete incident (soft delete, not purge)

#### B5 — Export Endpoints
- B5.1 POST /api/incidents/:id/export/json → Export incident as JSON
- B5.2 POST /api/incidents/:id/export/pdf → Export incident as PDF file
- B5.3 Request validation for export requests
- B5.4 File downloads with correct content-type headers

#### B6 — API Documentation
- B6.1 OpenAPI/Swagger specification generated for all endpoints
- B6.2 Swagger UI endpoint (/api-docs) for API exploration
- B6.3 Endpoint documentation includes request/response examples
- B6.4 Integration guide for platform teams

#### B7 — Request Validation
- B7.1 Zod schemas for incident creation (all required fields)
- B7.2 Zod schemas for incident update (subset of fields)
- B7.3 Validation errors returned with field-level messages
- B7.4 HTTP 400 for validation errors, 500 for server errors

### Wizard ↔ Backend Integration (Phase 9)

#### W1 — Wizard State Refactoring
- W1.1 New `useIncident()` hook replaces `useWizard()` for database-backed state
- W1.2 Incident fetched from API on wizard mount (if resuming)
- W1.3 Incident saved to API when wizard completes (final submit)
- W1.4 localStorage fallback during phase 9 transition (graceful degradation)
- W1.5 Hydration guard prevents flash of wrong state on page reload

#### W2 — Multi-Session Workflows
- W2.1 User can start new incident → gets unique incident ID
- W2.2 User can resume incomplete incident from list
- W2.3 Incident state persists across browser sessions
- W2.4 Multiple concurrent incidents supported in list view

#### W3 — Incident List UI
- W3.1 Table listing all incidents (ID, type, severity, created date, status)
- W3.2 Sortable columns (date, type, severity)
- W3.3 Filterable by incident type and severity
- W3.4 "Resume" button to continue incomplete incident
- W3.5 "View" button to review completed incident

#### W4 — Incident Type Selection
- W4.1 Step 1 extended with incident type selector (radio buttons)
- W4.2 Options: Ransomware, Phishing, DDoS, Data Loss, Other
- W4.3 Selected type loaded into wizard context immediately
- W4.4 Step 4 (playbook) updates based on selected type

### Design System (Phase 7, 10)

#### D1 — Color Palette
- D1.1 SIAG Primary Red: #CC0033 (replace amber #f59e0b)
- D1.2 SIAG Secondary Orange: #D44E17 (for accent highlights)
- D1.3 SIAG Navy Blue: #003B5E (primary dark, replace #1a2e4a)
- D1.4 CSS custom properties defined in globals.css
- D1.5 Tailwind @theme{} section updated with new palette
- D1.6 All hardcoded colors audited and migrated to tokens

#### D2 — Typography Hierarchy
- D2.1 Stone Sans Pro loaded for display headings (H1, H2)
- D2.2 Source Sans Pro loaded for body text and labels
- D2.3 Font scale: H1 (2.5rem), H2 (2rem), H3 (1.5rem), Body (1rem)
- D2.4 Font weights: Regular (400) for body, SemiBold (600) for headings
- D2.5 Line-height configured per scale (1.2 headings, 1.6 body)
- D2.6 Applied via next/font/google (no system fonts)

#### D3 — Motion & Animation
- D3.1 Button hover states with 150ms ease-out transition
- D3.2 Button press states with 100ms scale feedback (0.98)
- D3.3 Card elevation changes on hover (shadow increase)
- D3.4 Loading spinner animation (12 frames, 1s duration)
- D3.5 All transitions respect prefers-reduced-motion (no animation if user prefers)
- D3.6 Spring easing used for interactive feedback (cubic-bezier)

#### D4 — Dark Mode Support
- D4.1 CSS custom properties updated for dark theme
- D4.2 Dark background: #0f172a (dark navy)
- D4.3 Dark text: #f1f5f9 (light gray)
- D4.4 prefers-color-scheme: dark media query implemented
- D4.5 Toggle button in header to switch themes
- D4.6 Theme preference persisted to localStorage

### PDF & Forms (Phase 10–11)

#### P1 — Professional PDF Export
- P1.1 PDF title page with SIAG logo and incident metadata
- P1.2 Multi-page layout with optimized print styles
- P1.3 Page breaks placed logically between sections
- P1.4 Headers/footers on each page (incident ID, date, page number)
- P1.5 Colors optimized for printing (no bright backgrounds)
- P1.6 Text readable when printed to PDF (minimum 12pt)

#### P2 — Inline Form Validation
- P2.1 Validation triggered on blur (not just submit)
- P2.2 Error messages displayed below field immediately
- P2.3 Required field indicators (*) visible on all mandatory fields
- P2.4 Field border color changes to red on error
- P2.5 Error cleared when field corrected

#### P3 — Form Helper Text
- P3.1 Helper text appears below complex inputs (multi-select, date)
- P3.2 Helper text explains expected format or constraints
- P3.3 Helper text color distinct from error color (gray)
- P3.4 Examples provided for free-text fields

#### P4 — Loading States
- P4.1 Save button shows loading spinner when API request in flight
- P4.2 Button text changes to "Saving..." during request
- P4.3 Button disabled during save (no double-submit)
- P4.4 Error toast appears if API request fails

#### P5 — Error Feedback
- P5.1 API errors mapped to user-friendly messages
- P5.2 Network timeout errors show "Connection lost" message
- P5.3 Server errors (5xx) show generic "Something went wrong" message
- P5.4 Validation errors show specific field-level feedback

### Multi-Type Support (Phase 11)

#### M1 — Phishing Playbook
- M1.1 25-point checklist for phishing incident response
- M1.2 Phases: Detection → Containment → Investigation → Communication
- M1.3 All 25 points cover phishing-specific concerns (email artifacts, user awareness, etc.)
- M1.4 Stored in database (playbook table or JSONB field)
- M1.5 Assigned to incidents when incident_type = phishing

#### M2 — DDoS Playbook
- M2.1 25-point checklist for DDoS incident response
- M2.2 Phases: Detection → Mitigation → Upstream Notification → Communication
- M2.3 All 25 points cover DDoS-specific concerns (traffic patterns, ISP coordination, etc.)
- M2.4 Stored in database
- M2.5 Assigned to incidents when incident_type = ddos

#### M3 — Data Loss Playbook
- M3.1 25-point checklist for data loss incident response
- M3.2 Phases: Detection → Containment → Investigation → Communication
- M3.3 All 25 points cover data loss-specific concerns (data exfiltration, legal holds, etc.)
- M3.4 Stored in database
- M3.5 Assigned to incidents when incident_type = data_loss

#### M4 — Playbook Routing
- M4.1 Wizard determines playbook based on incident_type selected in Step 1
- M4.2 Correct playbook loaded into Step 4 before user reaches it
- M4.3 Playbook can be changed if incident type re-classified
- M4.4 Default playbook (Ransomware) if no type selected

### Testing & Verification (Phase 12)

#### T1 — Unit Tests
- T1.1 All API endpoint logic has unit tests (>80% coverage)
- T1.2 Zod validation schemas tested with valid/invalid inputs
- T1.3 Prisma queries tested with mock database
- T1.4 Utility functions tested (date calculations, severity logic, etc.)

#### T2 — Integration Tests
- T2.1 End-to-end test: Create incident → Save to API → List → Retrieve
- T2.2 End-to-end test: Wizard flow → Submit → Incident persisted
- T2.3 API response validation tests (shape, required fields)
- T2.4 Error handling tests (400/404/500 responses)

#### T3 — Load Testing
- T3.1 Baseline: Single user creates/lists/retrieves incidents
- T3.2 Load test: 100 concurrent requests to /api/incidents
- T3.3 Load test: 50 concurrent incident creates over 5 minutes
- T3.4 Results: Response time <500ms @ p95 under load
- T3.5 Results: No memory leaks detected over 10-minute test

#### T4 — Security Review
- T4.1 CORS headers configured correctly (no wildcard)
- T4.2 Input validation prevents SQL injection
- T4.3 No sensitive data in API responses (passwords, tokens)
- T4.4 API key authentication implemented (no public access)
- T4.5 Rate limiting configured (prevent abuse)
- T4.6 OWASP Top 10 checklist completed

### Deployment & Polish (Phase 13)

#### DE1 — Vercel Deployment
- DE1.1 Backend deployed as Vercel Functions (serverless)
- DE1.2 Frontend deployed as static export (existing v1.0)
- DE1.3 Environment variables configured on Vercel project
- DE1.4 Production URL live and accessible
- DE1.5 Preview deployments working for pull requests

#### DE2 — Database Deployment
- DE2.1 Neon PostgreSQL instance provisioned
- DE2.2 Connection pooling configured for serverless (pgBouncer)
- DE2.3 Backups enabled
- DE2.4 Database migrations run on first deploy

#### DE3 — CI/CD Pipeline
- DE3.1 GitHub Actions workflow for tests on pull requests
- DE3.2 GitHub Actions workflow for deploy on main branch
- DE3.3 Tests must pass before merge allowed
- DE3.4 Build artifacts uploaded to Vercel

#### DE4 — Performance Optimization
- DE4.1 API response times optimized (<200ms average)
- DE4.2 Database queries optimized with indexes
- DE4.3 Lighthouse score ≥90 for frontend
- DE4.4 Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

#### DE5 — Backwards Compatibility
- DE5.1 No breaking changes to v1.0 wizard workflows
- DE5.2 All v1.0 URLs still accessible and functional
- DE5.3 localStorage incidents automatically migrated to API (v1.0 → v1.1)
- DE5.4 Wizard defaults to localStorage if API unavailable (graceful fallback)

#### DE6 — Documentation
- DE6.1 README.md updated with backend setup instructions
- DE6.2 API documentation (Swagger) generated and accessible
- DE6.3 Environment variables documented (.env.example provided)
- DE6.4 Database schema documented (ER diagram)
- DE6.5 Integration guide for platform teams

#### DE7 — UAT & Sign-Off
- DE7.1 SIAG consultant reviews v1.1 on staging
- DE7.2 All 4 incident types tested end-to-end
- DE7.3 PDF export verified for professional quality
- DE7.4 Performance tested on mobile networks
- DE7.5 Sign-off provided before production promotion

---

## Non-Functional Requirements

### NF1 — Performance
- NF1.1 API endpoints respond in <200ms average (p95 <500ms)
- NF1.2 Page load time <2s on 4G network
- NF1.3 Database queries optimized (no N+1, indexed properly)
- NF1.4 Lighthouse score ≥90 on production

### NF2 — Security
- NF2.1 All user inputs validated server-side (Zod)
- NF2.2 SQL injection prevented (Prisma parameterized queries)
- NF2.3 CORS headers restrict to known origins
- NF2.4 API key authentication prevents unauthorized access
- NF2.5 Rate limiting prevents brute force attacks
- NF2.6 Sensitive data not logged or exposed in errors

### NF3 — Reliability
- NF3.1 Database connection pooling prevents exhaustion
- NF3.2 Graceful degradation: localStorage fallback if API unavailable
- NF3.3 Error handling: no unhandled promise rejections
- NF3.4 Retry logic for transient API failures

### NF4 — Maintainability
- NF4.1 Code follows TypeScript strict mode
- NF4.2 All public functions have JSDoc comments
- NF4.3 Test coverage >80% for new backend code
- NF4.4 Database schema documented with comments

### NF5 — Compliance
- NF5.1 GDPR/DSG data handling documented (no PII encryption in MVP)
- NF5.2 Audit logs record all incident changes
- NF5.3 Meldepflicht logic correctly implements CH regulations

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| B1.1 — Express app scaffold | 7 | Pending |
| B1.2 — TypeScript configuration | 7 | Pending |
| B1.3 — Environment variables | 7 | Pending |
| B1.4 — CORS middleware | 7 | Pending |
| B1.5 — Request logging | 7 | Pending |
| B1.6 — Error handling middleware | 7 | Pending |
| B2.1 — Prisma client initialized | 7 | Pending |
| B2.2 — Database schema | 7 | Pending |
| B2.3 — Migrations workflow | 7 | Pending |
| B2.4 — Connection pooling | 7 | Pending |
| B3.1 — Neon PostgreSQL | 7 | Pending |
| B3.2 — Connection strings | 7 | Pending |
| B3.3 — Schema applied | 7 | Pending |
| B3.4 — Indexes created | 7 | Pending |
| B4.1 — POST /api/incidents | 14 | Pending |
| B4.2 — GET /api/incidents | 14 | Pending |
| B4.3 — GET /api/incidents/:id | 14 | Pending |
| B4.4 — PATCH /api/incidents/:id | 14 | Pending |
| B4.5 — DELETE /api/incidents/:id | 14 | Pending |
| B5.1 — JSON export endpoint | 15 | Pending |
| B5.2 — PDF export endpoint | 15 | Pending |
| B5.3 — Export validation | 15 | Pending |
| B5.4 — Export headers | 15 | Pending |
| B6.1 — OpenAPI spec | 17 | Pending |
| B6.2 — Swagger UI | 17 | Pending |
| B6.3 — Endpoint examples | 17 | Pending |
| B6.4 — Integration guide | 17 | Pending |
| B7.1 — Zod schemas (create) | 14 | Pending |
| B7.2 — Zod schemas (update) | 14 | Pending |
| B7.3 — Validation errors | 14 | Pending |
| B7.4 — HTTP status codes | 14 | Pending |
| W1.1 — useIncident() hook | 14 | Pending |
| W1.2 — API fetch on mount | 14 | Pending |
| W1.3 — API save on complete | 14 | Pending |
| W1.4 — localStorage fallback | 14 | Pending |
| W1.5 — Hydration guard | 14 | Pending |
| W2.1 — New incident flow | 9 | Pending |
| W2.2 — Resume incident | 9 | Pending |
| W2.3 — Multi-session persistence | 9 | Pending |
| W2.4 — Concurrent incidents | 9 | Pending |
| W3.1 — Incident list table | 9 | Pending |
| W3.2 — Sortable columns | 9 | Pending |
| W3.3 — Filterable by type/severity | 9 | Pending |
| W3.4 — Resume button | 9 | Pending |
| W3.5 — View button | 9 | Pending |
| W4.1 — Type selector in Step 1 | 9 | Pending |
| W4.2 — Type options | 9 | Pending |
| W4.3 — Type loaded immediately | 9 | Pending |
| W4.4 — Playbook updates by type | 9 | Pending |
| D1.1 — SIAG Red (#CC0033) | 7 | Pending |
| D1.2 — SIAG Orange (#D44E17) | 7 | Pending |
| D1.3 — SIAG Navy (#003B5E) | 7 | Pending |
| D1.4 — CSS custom properties | 7 | Pending |
| D1.5 — Tailwind @theme | 7 | Pending |
| D1.6 — Color audit & migration | 7 | Pending |
| D2.1 — Stone Sans display | 7 | Pending |
| D2.2 — Source Sans body | 7 | Pending |
| D2.3 — Font scale | 7 | Pending |
| D2.4 — Font weights | 7 | Pending |
| D2.5 — Line-height | 7 | Pending |
| D2.6 — next/font/google | 7 | Pending |
| D3.1 — Button hover (150ms) | 10 | Pending |
| D3.2 — Button press (100ms) | 10 | Pending |
| D3.3 — Card elevation | 10 | Pending |
| D3.4 — Loading spinner | 10 | Pending |
| D3.5 — prefers-reduced-motion | 10 | Pending |
| D3.6 — Spring easing | 10 | Pending |
| D4.1 — Dark theme CSS | 10 | Pending |
| D4.2 — Dark background | 10 | Pending |
| D4.3 — Dark text | 10 | Pending |
| D4.4 — prefers-color-scheme | 10 | Pending |
| D4.5 — Theme toggle | 10 | Pending |
| D4.6 — Theme persistence | 10 | Pending |
| P1.1 — PDF title page | 15 | Pending |
| P1.2 — Multi-page layout | 15 | Pending |
| P1.3 — Page breaks | 15 | Pending |
| P1.4 — Headers/footers | 15 | Pending |
| P1.5 — Print colors | 15 | Pending |
| P1.6 — Print readability | 15 | Pending |
| P2.1 — Validation on blur | 11 | Pending |
| P2.2 — Error messages | 11 | Pending |
| P2.3 — Required indicators | 11 | Pending |
| P2.4 — Error styling | 11 | Pending |
| P2.5 — Error clearing | 11 | Pending |
| P3.1 — Helper text below field | 11 | Pending |
| P3.2 — Helper text explains | 11 | Pending |
| P3.3 — Helper text color | 11 | Pending |
| P3.4 — Field examples | 11 | Pending |
| P4.1 — Loading spinner on save | 11 | Pending |
| P4.2 — Button text changes | 11 | Pending |
| P4.3 — Button disabled | 11 | Pending |
| P4.4 — Error toast | 11 | Pending |
| P5.1 — API errors mapped | 11 | Pending |
| P5.2 — Timeout messages | 11 | Pending |
| P5.3 — Server error messages | 11 | Pending |
| P5.4 — Validation feedback | 11 | Pending |
| M1.1 — Phishing playbook (25 points) | 11 | Pending |
| M1.2 — Phishing phases | 11 | Pending |
| M1.3 — Phishing-specific content | 11 | Pending |
| M1.4 — Stored in database | 11 | Pending |
| M1.5 — Type-based assignment | 11 | Pending |
| M2.1 — DDoS playbook (25 points) | 11 | Pending |
| M2.2 — DDoS phases | 11 | Pending |
| M2.3 — DDoS-specific content | 11 | Pending |
| M2.4 — Stored in database | 11 | Pending |
| M2.5 — Type-based assignment | 11 | Pending |
| M3.1 — Data Loss playbook (25 points) | 16 | Pending |
| M3.2 — Data Loss phases | 16 | Pending |
| M3.3 — Data Loss-specific content | 16 | Pending |
| M3.4 — Stored in database | 16 | Pending |
| M3.5 — Type-based assignment | 16 | Pending |
| M4.1 — Playbook routing | 16 | Pending |
| M4.2 — Correct playbook loaded | 16 | Pending |
| M4.3 — Playbook changeable | 16 | Pending |
| M4.4 — Default playbook | 16 | Pending |
| T1.1 — Unit tests (>80% coverage) | 12 | Pending |
| T1.2 — Validation tests | 12 | Pending |
| T1.3 — Prisma query tests | 12 | Pending |
| T1.4 — Utility function tests | 12 | Pending |
| T2.1 — E2E create-save-list | 12 | Pending |
| T2.2 — E2E wizard-submit | 12 | Pending |
| T2.3 — API response validation | 12 | Pending |
| T2.4 — Error handling tests | 12 | Pending |
| T3.1 — Single user baseline | 12 | Pending |
| T3.2 — 100 concurrent requests | 12 | Pending |
| T3.3 — 50 concurrent creates | 12 | Pending |
| T3.4 — Response time <500ms p95 | 12 | Pending |
| T3.5 — No memory leaks | 12 | Pending |
| T4.1 — CORS headers | 12 | Pending |
| T4.2 — SQL injection prevention | 12 | Pending |
| T4.3 — No sensitive data exposed | 12 | Pending |
| T4.4 — API key auth | 12 | Pending |
| T4.5 — Rate limiting | 12 | Pending |
| T4.6 — OWASP Top 10 checklist | 12 | Pending |
| DE1.1 — Vercel Functions | 16 | Pending |
| DE1.2 — Static export frontend | 13 | Pending |
| DE1.3 — Environment variables | 13 | Pending |
| DE1.4 — Production URL live | 13 | Pending |
| DE1.5 — Preview deployments | 13 | Pending |
| DE2.1 — Neon PostgreSQL | 13 | Pending |
| DE2.2 — Connection pooling | 13 | Pending |
| DE2.3 — Backups enabled | 13 | Pending |
| DE2.4 — Migrations on deploy | 13 | Pending |
| DE3.1 — GitHub Actions (tests) | 17 | Pending |
| DE3.2 — GitHub Actions (deploy) | 17 | Pending |
| DE3.3 — Tests gate merges | 17 | Pending |
| DE3.4 — Build artifacts | 17 | Pending |
| DE4.1 — API <200ms avg | 13 | Pending |
| DE4.2 — DB optimized | 13 | Pending |
| DE4.3 — Lighthouse ≥90 | 13 | Pending |
| DE4.4 — Core Web Vitals | 13 | Pending |
| DE5.1 — No breaking changes | 16 | Pending |
| DE5.2 — v1.0 URLs work | 16 | Pending |
| DE5.3 — localStorage migration | 16 | Pending |
| DE5.4 — API graceful fallback | 16 | Pending |
| DE6.1 — README setup | 13 | Pending |
| DE6.2 — API docs (Swagger) | 13 | Pending |
| DE6.3 — .env.example | 13 | Pending |
| DE6.4 — Database schema docs | 13 | Pending |
| DE6.5 — Integration guide | 13 | Pending |
| DE7.1 — SIAG consultant review | 13 | Pending |
| DE7.2 — All 4 types tested | 13 | Pending |
| DE7.3 — PDF verified | 13 | Pending |
| DE7.4 — Mobile network test | 13 | Pending |
| DE7.5 — Sign-off | 13 | Pending |

**Total Requirements:** 165 | **Mapped to Phases:** 165/165 ✓

---

## Out of Scope (v1.1)
- OAuth / SSO authentication (v1.2)
- Multi-tenant support (v1.2)
- Real-time collaboration (v1.2+)
- Encryption at rest (v1.2)
- Advanced analytics (v1.2+)
- Third-party integrations (Slack, JIRA, etc.) (v1.2+)
