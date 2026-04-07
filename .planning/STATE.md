---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Backend Integration & Design System
status: executing
last_updated: "2026-04-07T21:00:00Z"
progress:
  total_phases: 13
  completed_phases: 9
  total_plans: 27
  completed_plans: 20
  percent: 74
---

# STATE.md — SIAG Incident Management Assistent v1.1

*Stand: 2026-04-07 | Phase 10 COMPLETE — All animations, dark mode, PDF export shipped*

## Current Position

Phase: 10 (motion-pdf-dark-mode) — COMPLETE ✅
Plans: 10-01 ✅ (Motion), 10-02 ✅ (Dark Mode), 10-03 ✅ (PDF Export)
**Milestone:** v1.1 — Backend Integration, Design System, Multi-Type Support
**Status:** Phase 10 complete; 20/27 plans done (74%); advancing to Phase 11 (Multi-Type Playbooks)
**Phase:** 11 (pending start)
**Next:** Phase 11 (Multi-Type Playbooks + Forms)

## Milestone Overview

v1.1 transforms the v1.0 frontend MVP into a production-ready incident management platform with:

- **Backend**: Express.js + Prisma + PostgreSQL (Neon) for persistent incident storage
- **Design System**: SIAG color palette (#CC0033 red, #003B5E navy, #D44E17 orange), Stone Sans + Source Sans typography, 150-300ms motion
- **Multi-Type**: Ransomware, Phishing, DDoS, Data Loss playbooks (25-point checklists each)
- **API**: 5 CRUD endpoints + export functionality, OpenAPI/Swagger docs
- **UX Polish**: Dark mode, inline form validation, professional PDF export, loading states
- **Deployment**: Vercel Functions + Neon, CI/CD, performance optimization (Lighthouse ≥90)

**Target:** Early June 2026 (7 weeks execution)

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

## v1.1 Phase Status (Current Milestone)

| Phase | Title | Status | Plans |
|-------|-------|--------|-------|
| 7 | Backend Scaffold + Design System | Complete | 6/6 ✅ |
| 8 | API Implementation | Complete | 4/4 ✅ |
| 9 | Wizard ↔ Backend Integration | Complete | 3/3 ✅ |
| 10 | Motion + PDF + Dark Mode | Complete | 3/3 ✅ |
| 11 | Multi-Type Playbooks + Forms | Pending | 0/4 |
| 12 | Testing + Security | Pending | 0/3 |
| 13 | Deployment + Polish | Pending | 0/4 |

**Total:** 20/27 plans | **Completed:** Phase 7, 8, 9, 10 (all 16 plans) | **Estimate:** 3 weeks remaining

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
✅ 80%+ test coverage + load testing + security audit complete (Phase 12)
✅ Deployed to Vercel + Neon, Lighthouse ≥90, SIAG UAT sign-off (Phase 13)

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
