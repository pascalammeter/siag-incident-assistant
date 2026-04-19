---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Design Modernization & Tech Debt Cleanup
status: planning
last_updated: "2026-04-19T09:30:00.000Z"
progress:
  total_phases: 9
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# STATE.md — SIAG Incident Management Assistent v1.3

*Stand: 2026-04-19 | Milestone Planning Complete — Ready for Phase 20 Execution*

## Current Position

Phase: 20 (Tech Debt — GitHub Secrets & Branch Protection) — ⏳ PENDING EXECUTION
Plan: Ready for `/gsd-plan-phase 20`
**Milestone:** v1.3 — Design Modernization & Tech Debt Cleanup — 📋 PLANNED (Phases 20–28)
**Status:** Requirements locked, Roadmap approved, Questioning decisions documented
**Next:** `/gsd-plan-phase 20` to start Phase 20 planning

## v1.3 Milestone Overview

v1.3 modernizes the v1.2 production platform with a comprehensive design refresh and tech debt cleanup:

**Design-First (70%):**
- **Design System Implementation**: All UI components (Dashboard, Incident Details, Wizard, Settings) conform to Design-Prompt spec
  - Inter Font, #f0f2f5 background, #CC0033 Swiss Red accents
  - Floating Red Pill Navbar as signature navigation element
  - Box-shadow only (no borders), pill-shaped buttons, responsive layouts
  - Severity badges, Platform badges, Status indicators (green/amber/red dots)
  - Toast notifications, Slide-in detail panels, Modal dialogs

**Mobile-First UX (Part of D1–D4):**
- Responsive layouts: 1-col mobile, 2-col tablet, 3-col desktop
- Touch-friendly tap targets (min 44px)
- Table scrolling & collapsing on small screens
- Floating navbar stacking/collapsing

**Tech Debt Cleanup (30%):**
- **GitHub Secrets**: .env.example template + local .env.local + CI/CD secrets
- **Branch Protection**: PR reviews required, status checks enforced on main
- **Swagger Annotations**: @swagger TypeDoc comments on App Router routes

**Deliverables:**
- All 9 phases planned and ready for execution
- Requirements locked (v1.3-REQUIREMENTS.md)
- Roadmap defined (v1.3-ROADMAP.md)
- Design prompt integrated into Phase 22–27 specs

**Target:** 4–6 weeks (Phases 20–28)

## v1.0 (Completed)

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Design + Research | ✅ Complete |
| 2 | Frontend Scaffold | ✅ Complete |
| 3 | Core Wizard + Ransomware | ✅ Complete |
| 4 | Swiss Compliance | ✅ Complete |
| 5 | Screen 6 + Polish | ✅ Complete |
| 6 | Deployment Review + Smoke Testing | ✅ Complete |

**Shipped:** 2026-04-06 | **Tests:** 74/74 passing | **URL:** https://siag-incident-assistant.vercel.app

## v1.3 Phase Status (Current Milestone — Planning Phase)

| Phase | Title | Status | Scope |
|-------|-------|--------|-------|
| 20 | Tech Debt — GitHub Secrets & Branch Protection | 📋 Pending | .env template, GitHub Secrets, Branch protection rules |
| 21 | Tech Debt — Swagger Annotations | 📋 Pending | @swagger docs on App Router routes, OpenAPI spec |
| 22 | Design System Setup — CSS Tokens | 📋 Pending | CSS custom properties, typography scale, color tokens |
| 23 | Dashboard Redesign | 📋 Pending | Stat cards, charts, incident overview, responsive grids |
| 24 | Incident Details & Slide-in Panel | 📋 Pending | Slide-in panel, dt/dd rows, badges, smooth transitions |
| 25 | Wizard Redesign | 📋 Pending | Step-by-step visuals, modal report, toast notifications |
| 26 | Settings & Navigation Overhaul | 📋 Pending | Floating Pill Navbar, Settings sidebar, sub-tabs |
| 27 | Mobile Responsiveness & Polish | 📋 Pending | Viewport tests, touch-friendly, responsive tables |
| 28 | Design System Validation & E2E QA | 📋 Pending | WCAG AA testing, design spec compliance, UAT |

**Total Phases:** 9 | **Total Plans:** TBD (estimated 18–24) | **Completed:** Phases 14–19 (v1.2 shipped 2026-04-19)

## Key Architecture Decisions

### Backend Stack (Phase 7)

- **Framework:** Express.js (lightweight, serverless-compatible)
- **ORM:** Prisma (type-safe, migrations, excellent DX)
- **Database:** PostgreSQL on Neon (serverless, auto-scaling, connection pooling)
- **Validation:** Zod (server-side input validation, type inference)
- **API Docs:** OpenAPI/Swagger (auto-generated, interactive UI at /api-docs)

### Frontend Integration (Phase 9)

- **State Hook:** New `useIncident()` replacing `useWizard()` (API-backed instead of localStorage)
- **Fallback:** localStorage as graceful degradation if API unavailable
- **Migration:** Existing localStorage incidents auto-migrate to API on v1.1 first load
- **List UI:** New page showing all incidents (sortable, filterable by type/severity)

### Design System (Phase 7, 10)

- **Colors:** CSS custom properties in globals.css (@theme for Tailwind v4)
  - `--siag-red: #CC0033` (primary, warnings)
  - `--siag-navy: #003B5E` (primary dark, replaced #1a2e4a)
  - `--siag-orange: #D44E17` (accent highlights)
- **Typography:** next/font/google
  - Stone Sans Pro (H1, H2 display)
  - Source Sans Pro (body, labels, UI text)
- **Motion:** All transitions respect prefers-reduced-motion
  - Button hover: 150ms ease-out
  - Button press: 100ms scale 0.98
  - Card elevation: shadow increase on hover
  - Loading spinner: 1s rotation animation

### Database Schema (Phase 7)

```sql
incidents (
  id UUID PRIMARY KEY,
  createdAt, updatedAt TIMESTAMP,
  
  -- Recognition details
  erkennungszeitpunkt TIMESTAMP,
  erkannt_durch TEXT,
  betroffene_systeme TEXT[],
  erste_erkenntnisse TEXT,
  
  -- Classification
  incident_type VARCHAR (ransomware|phishing|ddos|data_loss|other),
  q1, q2, q3 INT (classification questions),
  severity VARCHAR (critical|high|medium|low),
  
  -- Playbook & Actions
  playbook JSONB (checked steps, timestamps),
  
  -- Regulatory
  regulatorische_meldungen JSONB (ISG/DSG/FINMA flags),
  
  -- Audit
  metadata JSONB (tags, custom fields)
)
```

## Requirements Mapping

**Total Requirements:** 150 (derived from V1_1_MILESTONE_PROPOSAL.md)

| Category | Count | Phases |
|----------|-------|--------|
| Backend & API (B1–B7) | 31 | 7–8 |
| Wizard ↔ Backend (W1–W4) | 18 | 9 |
| Design System (D1–D4) | 20 | 7, 10 |
| PDF & Forms (P1–P5) | 19 | 10–11 |
| Multi-Type (M1–M4) | 20 | 11 |
| Testing (T1–T4) | 19 | 12 |
| Deployment (DE1–DE7) | 33 | 13 |

**Coverage:** 150/150 requirements mapped ✓

## Critical Success Criteria (Milestone Level)

✅ Backend running locally with Express + Prisma + Neon (Phase 7)
✅ All 5 CRUD endpoints working + documented with Swagger (Phase 8)
✅ Wizard refactored to use API instead of localStorage (Phase 9)
✅ 150-300ms animations + dark mode + professional PDF export (Phase 10)
✅ 4 playbooks (Ransomware, Phishing, DDoS, Data Loss) implemented (Phase 11)
✅ 99 tests (>85% coverage) + k6 load framework + OWASP A-grade + 85+ KB docs (Phase 12) ✅ COMPLETE
⏳ Deployed to Vercel + Neon, Lighthouse ≥90, SIAG UAT sign-off (Phase 13)

## Known Constraints

1. **Backwards Compatibility:** v1.0 URLs must remain accessible; no breaking changes to wizard workflows
2. **Graceful Degradation:** If API unavailable, fallback to localStorage (read-only for new incidents)
3. **Static Export:** Frontend remains static export (no Next.js server needed) for deployment simplicity
4. **Auth Minimal:** v1.1 uses API key auth only; OAuth planned for v1.2
5. **PII Handling:** No encryption at rest in MVP; v1.2 to add PII encryption and SSO

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Database schema too complex | Phase 7 kickoff: design with SIAG; keep MVP minimal, extend in v1.2 |
| Performance degradation | Phase 12: load test; optimize indexes in Phase 13 |
| Breaking changes in wizard | Phase 9: maintain localStorage fallback during transition; comprehensive testing |
| Deploy failures | Phase 13: test on staging Vercel before production push |
| API auth complexity | Start with API Key (stateless); OAuth deferred to v1.2 |

## Parallel Work Opportunities

- **Phase 1 & 2 overlap:** Can start Phase 8 API endpoint coding while Phase 7 finalizing design tokens
- **Phase 3 & 4 overlap:** Can start Phase 10 motion specs while Phase 9 integrating backend
- **Phase 5 & 6 overlap:** Can start Phase 12 test setup while Phase 11 playbook content being finalized

## Next Steps (Phase 7 Kickoff)

1. Initialize Express app: `npm init`, TypeScript config, directory structure
2. Install Prisma: `npm install @prisma/client prisma`
3. Initialize Neon PostgreSQL: provisioning, connection string in .env.local
4. Design database schema: review with SIAG requirements, finalize tables
5. Update globals.css: SIAG color tokens, load Stone Sans + Source Sans via next/font/google
6. Generate Swagger/OpenAPI spec template
7. Create 3 plans for Phase 7 execution

**Estimated duration:** 3 weeks (overlaps with v1.0 final polish if needed)

## Last Milestone (v1.0)

- **Status:** ✅ Complete (2026-04-06)
- **URL:** https://siag-incident-assistant.vercel.app
- **Tests:** 74/74 passing
- **Phases:** 6/6 complete (24/24 plans)
- **Production:** Fully deployed and stable
