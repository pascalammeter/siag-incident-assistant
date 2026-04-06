# v1.1 Milestone Proposal — Backend + Design + Additional Features

**Date:** 2026-04-06  
**Status:** Ready for approval  
**Research sources:** 
- V1_1_DIRECTION.md (Strategic backend analysis)
- V1_1_DESIGN_REVIEW.md (UI/UX audit vs. SIAG standards)

---

## One-Page Summary

**Ziel:** SIAG Incident Assistant v1.1 transformiert die v1.0-Frontend-App in eine **professional-grade Incident-Management-Plattform** mit persistenter Speicherung, verbessertem Design und multi-incident-type Support.

### v1.1 bringt:

✅ **Backend + Persistente Speicherung** — Incidents bleiben über Sessions erhalten  
✅ **SIAG-konforme Visuals** — Farben, Typografie, Motion nach Brand-Standard  
✅ **PDF-Export optimiert** — Professionelle Berichte mit Titelseite  
✅ **Weitere Incident-Typen** — Phishing, DDoS, Data Loss (neben Ransomware)  
✅ **Dark Mode** — Für Consultants im Einsatz  
✅ **Bessere Forms** — Inline Validation, Helper Text, Fehlerbehandlung  

**Estimated Timeline:** 7–9 Wochen  
**Architecture:** Node.js + Express + PostgreSQL (Neon) im Backend; Next.js Frontend (no changes)  
**Phase Count:** 5 phases (Wave 1: Backend + Design, Wave 2: Features + Polish)

---

## Architecture: Backend for Platform Integration

**Why Backend?**

1. **Persistenz** — Incidents überleben Browser-Schließung (bisher nur localStorage)
2. **Team-Collaboration** — Mehrere Consultants können an Incident arbeiten
3. **Plattform-Integration** — Modul kann als eigenständige Komponente in SIAG-Plattform eingebaut werden
4. **Compliance** — Audit-Logs für ISG/DSG/FINMA Reportings
5. **Multi-Type Support** — Backend-Datenmodell skaliert für Phishing/DDoS/etc.

**Tech Stack:**

```
Frontend: Next.js 16 (App Router, kein Changes)
Backend: Node.js + Express + Prisma
Database: PostgreSQL (Neon Serverless auf Vercel)
Auth: API Key (v1.1) → OAuth (v1.2)
```

**API Endpoints (MVP):**

```
POST   /api/incidents              → Create
GET    /api/incidents              → List (with filters)
GET    /api/incidents/:id          → Retrieve
PATCH  /api/incidents/:id          → Update
DELETE /api/incidents/:id          → Soft-delete
POST   /api/incidents/:id/export   → PDF/JSON export
```

**Database Schema (MVP):**

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
  q1 INT, q2 INT, q3 INT (classification questions),
  severity VARCHAR (critical|high|medium|low),
  
  -- Playbook & Actions
  playbook JSONB (checked steps, timestamps),
  
  -- Regulatory
  regulatorische_meldungen JSONB (ISG/DSG/FINMA flags + timestamps),
  kommunikations_templates JSONB,
  
  -- Audit
  metadata JSONB (tags, custom fields)
)
```

---

## Design System Alignment (CRITICAL for v1.1)

**v1.0 Issues → v1.1 Fixes:**

| Issue | v1.0 | v1.1 |
|-------|------|------|
| **Colors** | Amber (#f59e0b) for warnings | SIAG-Red (#CC0033), Orange (#D44E17) |
| **Typography** | Inter only (flat hierarchy) | Source Sans Pro (body) + Stone Sans (display) |
| **Motion** | None (instant snap) | 150–300ms transitions, scale feedback |
| **PDF Export** | Functional, rough | Title page, optimized layout, print-ready |
| **Dark Mode** | No support | Native prefers-color-scheme |
| **Forms** | Post-submit errors | Inline validation + helper text |

**Phase 1 includes design overhaul** — no more amber, proper typographic hierarchy.

---

## v1.1 Detailed Roadmap (5 Phases)

### Wave 1: Backend + Design Foundation (4 Weeks)

#### **Phase 1: Backend Architecture + Design System (1 week)**

**Goals:**
- Express app scaffold + Prisma ORM + Neon PostgreSQL
- Update all color/typography tokens to SIAG spec
- Database schema design approved

**Deliverables:**
- Express starter with middleware (auth, CORS, logging)
- Prisma schema + migrations
- Updated globals.css with SIAG palette + Stone Sans
- OpenAPI spec (Swagger)

**Acceptance Criteria:**
- ✅ Express app runs locally
- ✅ `npm run dev` starts on localhost:3000
- ✅ PostgreSQL connects via Prisma
- ✅ All color tokens match SIAG spec
- ✅ Typography hierarchy visually correct

---

#### **Phase 2: API Implementation (1 week)**

**Goals:**
- Implement 5 CRUD endpoints
- JSON/PDF export endpoints
- Error handling + validation

**Deliverables:**
- `/api/incidents` CRUD fully implemented
- `/api/incidents/:id/export` (JSON + PDF)
- Request/response validation (Zod)
- Error handling middleware
- API documentation (OpenAPI)

**Acceptance Criteria:**
- ✅ All 5 endpoints tested with Postman/curl
- ✅ Export endpoints return valid JSON/PDF
- ✅ Error responses follow standard format
- ✅ API docs auto-generated (Swagger UI)

---

#### **Phase 3: Wizard ↔ Backend Integration (1 week)**

**Goals:**
- Replace localStorage with API calls
- Verify all v1.0 workflows still work
- Add incident list/history UI

**Deliverables:**
- Wizard hooks refactored (useIncident instead of useWizard state)
- POST to backend on wizard complete
- GET from backend to resume incident
- Basic incident list table
- Motion/hover states on all buttons

**Acceptance Criteria:**
- ✅ Wizard saves to backend instead of localStorage
- ✅ Can reopen incident from list
- ✅ All 74 tests still pass
- ✅ v1.0 workflows identical for end user

---

#### **Phase 4: Motion + PDF Polish (1 week)**

**Goals:**
- Add 150–300ms transitions on all interactive elements
- Optimize PDF export (title page, layout)
- Add dark mode support

**Deliverables:**
- Button hover/pressed states with spring easing
- Card elevation on hover
- Loading spinner component
- PDF title page + optimized print styles
- Dark mode toggle (prefers-color-scheme)
- Reduced-motion compliance

**Acceptance Criteria:**
- ✅ All buttons animate on click (no snap)
- ✅ PDF exports with professional formatting
- ✅ Dark mode toggles correctly
- ✅ reduced-motion: reduce works
- ✅ Print output matches brand spec

---

### Wave 2: Additional Types + Polish (3 Weeks)

#### **Phase 5: Additional Incident Types + Forms Enhancement (1 week)**

**Goals:**
- Add Phishing, DDoS, Data Loss playbooks to DB
- Wizard router selects playbook by incident type
- Form inline validation + helper text

**Deliverables:**
- Phishing playbook (25-point checklist)
- DDoS playbook (25-point checklist)
- Data Loss playbook (25-point checklist)
- Wizard Step 1 extended to choose incident type
- Inline form validation (on blur)
- Required-field indicators (*)
- Helper text on complex inputs

**Acceptance Criteria:**
- ✅ Wizard can select Ransomware / Phishing / DDoS / Data Loss
- ✅ Correct playbook loads per type
- ✅ All playbooks 25-point compliant
- ✅ Form validation blocks submit on error
- ✅ All 74+ tests passing

---

#### **Phase 6: API Testing + Security Review (1 week)**

**Goals:**
- Integration tests (Wizard ↔ API)
- Load testing
- Security audit (CORS, injection, auth)
- Final documentation

**Deliverables:**
- Integration test suite (Vitest)
- Load test report (k6 or similar)
- Security audit checklist signed off
- API documentation for integration partners
- Database schema documentation
- v1.1 Release Notes

**Acceptance Criteria:**
- ✅ 80%+ test coverage (new backend code)
- ✅ Can handle 100+ concurrent API requests
- ✅ No OWASP Top 10 vulnerabilities
- ✅ All documentation complete

---

#### **Phase 7: Deployment + Final Polish (1 week)**

**Goals:**
- Deploy to Vercel + Neon
- Performance optimization
- UAT with SIAG consultant

**Deliverables:**
- Backend deployed to Vercel Functions
- Database on Neon PostgreSQL
- CI/CD pipeline (GitHub Actions)
- Performance metrics (Core Web Vitals)
- UAT sign-off from SIAG

**Acceptance Criteria:**
- ✅ Production URL live
- ✅ Lighthouse score ≥90
- ✅ No breaking changes from v1.0
- ✅ SIAG consultant approval

---

## Feature Comparison: v1.0 vs v1.1

| Feature | v1.0 | v1.1 |
|---------|------|------|
| **Data Persistence** | localStorage only (ephemeral) | PostgreSQL + API (persistent) |
| **Incident Types** | 1 (Ransomware) | 4 (Ransomware, Phishing, DDoS, Data Loss) |
| **Multi-Session** | No (new browser = lost data) | Yes (resume from incident list) |
| **PDF Export** | Print-to-PDF (rough) | Server-side optimized (professional) |
| **Dark Mode** | No | Yes (prefers-color-scheme) |
| **API for Integration** | No | Yes (5 endpoints) |
| **Audit Logs** | No | Yes (API calls logged) |
| **Form Validation** | Post-submit | Inline (on blur) + post-submit |
| **Design System** | Partial (amber instead of red) | Full SIAG compliance |
| **Motion/UX** | Static (instant snap) | Animated (150–300ms) |

---

## Effort Estimate

| Phase | Duration | Effort | Risk |
|-------|----------|--------|------|
| Phase 1: Backend + Design | 1 week | High | Medium (DB schema design) |
| Phase 2: API | 1 week | Medium | Low |
| Phase 3: Wizard Integration | 1 week | Medium | Low |
| Phase 4: Motion + PDF | 1 week | Medium | Low |
| Phase 5: Additional Types | 1 week | Medium | Low |
| Phase 6: Testing + Security | 1 week | Medium | Medium (load testing) |
| Phase 7: Deployment + Polish | 1 week | Low | Low |
| **Total** | **7 weeks** | **Medium** | **Medium-Low** |

**Can be compressed to 5–6 weeks with parallel work (Phases 1+2 overlap, etc.)**

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Database schema too complex | Design schema in Phase 1 kickoff with SIAG; keep MVP minimal, extend in v1.2 |
| API auth complexity | Start with API Key (stateless); plan OAuth for v1.2 |
| Performance degradation | Load test Phase 6; optimize indexes on incident creation |
| Breaking changes in wizard | Maintain localStorage fallback during Phase 3 transition |
| Deploy failures | Test on staging Vercel → branch before prod push |

---

## Success Criteria (v1.1 Done)

✅ Backend + API fully functional, tested  
✅ All v1.0 workflows unchanged for end user  
✅ 4 incident types (Ransomware, Phishing, DDoS, Data Loss) with playbooks  
✅ SIAG Design System 100% compliant (colors, typography, motion)  
✅ PDF export professional-grade  
✅ Dark mode functional  
✅ Form validation user-friendly  
✅ 80%+ test coverage on new code  
✅ Lighthouse ≥90 on production  
✅ SIAG consultant approval (UAT)  

---

## Open Questions Before Kickoff

1. **Data Privacy:** Any PII encryption requirements? Compliance scope (GDPR/DSG)?
2. **Multi-Tenant:** Design for single SIAG or multiple customers from day one?
3. **Database Hosting:** Neon PostgreSQL (recommended, simple) or self-managed?
4. **API Auth:** Start with API Key or plan OAuth immediately?
5. **Playbook Extensibility:** Who maintains additional playbooks? (SIAG team or platform admin?)
6. **Customer Platform Timeline:** When does embedding need to be production-ready? (Affects v1.1 vs v1.2 scope)

---

## Next Steps

**If approved:**

```bash
/gsd-new-milestone --reset-phase-numbers v1.1-Backend-Design \
  --title "Backend Integration, SIAG Design, Multi-Type Support" \
  --description "Persistent incident storage, REST API, professional UX, additional incident types"
```

This kicks off:
1. Phase 1: Backend + Design (requirements gathering + architecture)
2. Phase 2–7: Implementation per roadmap above

**Timeline:** Start immediately → Production v1.1 by early June 2026

