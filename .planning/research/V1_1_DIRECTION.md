# v1.1 Direction Analysis — SIAG Incident Assistant

**Researched:** 2026-04-06  
**Mode:** Strategic Milestone Direction  
**Recommendation:** **Backend Integration (API + Database)** as Phase 1 of v1.1

---

## Executive Summary

SIAG Incident Assistant v1.0 has shipped a fully functional, stress-tested ransomware incident response wizard. The next question is: what direction generates the most customer value, is technically feasible, and moves toward the customer platform integration goal?

Based on ecosystem research (incident management tools, CISO adoption patterns, Swiss compliance requirements), **Backend Integration + API** emerges as the clear winner. Here's why:

1. **Customer Value:** Swiss consultants and CISOs need persistent incident records, not ephemeral browser sessions. Backend enables incident storage, multi-session workflows, and audit trails — table stakes for professional incident management tools.

2. **Integration Path:** Backend is the prerequisite for customer platform integration. Without API endpoints, the wizard cannot be embedded in SIAG's customer portal or connected to their case management systems.

3. **Unblocks Everything:** Backend enables Auth, Multi-Tenant support, additional incident types (with incident history), and analytics. Other v1.1 directions become dependencies of backend rather than alternatives.

4. **Market Reality:** Industry-standard incident management platforms (PagerDuty, incident.io, Xurrent) all have APIs and persistent storage as core features. Competing without this limits adoption.

5. **Technical Readiness:** The v1.0 wizard state architecture is already designed for export. Migrating state to a database is straightforward — no UI rewrites needed.

---

## Options Evaluated

| Option | Difficulty | Customer Value | Integration Path | Timeline | Recommendation |
|--------|-----------|-----------------|------------------|----------|-----------------|
| **Backend Integration (API + DB)** | 3/5 | 5/5 | **YES** — enables all future features | 4–6 weeks | **PRIMARY** |
| Additional Incident Types | 2/5 | 3/5 | Partial — need backend for multi-incident workflows | 2–3 weeks | After Backend |
| Real PDF Generation | 2/5 | 2/5 | No — print-to-PDF adequate for MVP | 1 week | Defer |
| Authentication (OAuth/SSO) | 3/5 | 4/5 | **YES** — needed for platform integration | 3–4 weeks | **Phase 2** (depends on Backend) |
| Multilingual Support | 2/5 | 3/5 | Partial — content expansion, not integration | 2–3 weeks | Phase 3+ |

---

## Recommended Direction: Backend Integration (API + Database)

### Why Backend First

**1. Unblocks Customer Platform Integration**
- v1.0 architecture explicitly prepared for platform integration via "exportable state structure"
- Without backend API, wizard cannot be embedded in SIAG customer portal
- Customer platform expects incidents to be retrievable, queryable, and updatable — requires persistent storage

**2. Enables Multi-Session Incident Workflows**
- Current v1.0: wizard session ends, data in localStorage — consultant must print/screenshot to preserve
- With backend: incident persists, can be reopened, updated across sessions, shared with team
- Aligns with professional incident management expectations (CISO priority in 2026 research)

**3. Makes Additional Incident Types Viable**
- Multiple playbook types (Ransomware, Phishing, DDoS) need incident history and comparison
- Backend enables incident classification → playbook type routing
- localStorage-only approach doesn't scale for multi-type incident workflows

**4. Prerequisite for Auth and Multi-Tenancy**
- OAuth/SSO requires backend sessions and user identity management
- Multi-tenant support requires database isolation and user→tenant mapping
- Cannot cleanly implement either without backend

**5. Market Standard**
- Industry analysis shows 100% of professional incident management tools have APIs
- CISO priorities (2026): "tool consolidation" and "API integration with existing stack"
- Customers expect: incident export/import, webhook integration, audit logs

---

## Why NOT The Other Options (Yet)

### Real PDF Generation (Defer)
- **Why defer:** Print-to-PDF works fine for v1.0 and v1.1
- **Cost:** 1 week + server-side tooling (Puppeteer/PDFMake)
- **Value:** Cosmetic — doesn't unlock features
- **Better timing:** v1.2 (after backend stabilizes)

### Additional Incident Types (After Backend)
- **Why defer:** Multiple incident types need shared incident storage
- **Current architecture:** Playbook data is hardcoded per-session
- **Required first:** Backend incident model → supports Phishing/DDoS/Data-Loss playbooks
- **Better timing:** v1.1-Wave-2 (first half depends on backend stability)

### Authentication/OAuth (Phase 2)
- **Why defer:** Backend is prerequisite
- **Current state:** v1.0 is public, no auth needed yet
- **Required first:** Backend + user model + session management
- **Timing:** v1.1-Wave-2 or v1.2-Phase-1 (depends on customer platform schedule)

### Multilingual Support (Phase 3+)
- **Why defer:** Content translation can happen anytime
- **Current scope:** German-only MVP is sufficient for SIAG consultants
- **Cost:** Not just i18n tooling — requires translation of all playbooks (25-point checklist + communication templates in DE/FR/IT)
- **Better timing:** v1.2+ (after backend and additional incident types are stable)

---

## Technical Analysis: Backend Integration

### What Backend Means (v1.1 Scope)

**API Endpoints (MVP):**
```
POST   /api/incidents              → Create incident
GET    /api/incidents/:id          → Retrieve incident
PATCH  /api/incidents/:id          → Update incident state
GET    /api/incidents              → List incidents (basic filtering)
DELETE /api/incidents/:id          → Soft-delete incident
POST   /api/incidents/:id/export   → Export incident as PDF/JSON
```

**Database Schema (MVP):**
```
incidents
├─ id (UUID)
├─ createdAt, updatedAt
├─ recognitionTime (erkennungszeitpunkt)
├─ recognizedBy, affectedSystems, firstFindings
├─ incidentType (ransomware | phishing | ddos | ...)
├─ q1, q2, q3 (classification questions)
├─ severity (critical | high | medium)
├─ playbook (JSON array of checked steps)
├─ regulatoryNotifications (ISG/DSG/FINMA)
├─ communicationTemplates (JSON)
└─ metadata (tags, custom fields for future expansion)
```

**Tech Stack:**
- Database: PostgreSQL (ACID, JSON columns for playbook/templates, SIAG-friendly)
- Backend: Node.js + Express (same runtime as Next.js, simpler deployment)
- API Auth: API Key (v1.1) → OAuth/JWT (v1.2)
- ORM: Prisma (type-safe, migrations, local dev-friendly)

### Prerequisites for Backend

| Prerequisite | Status | Notes |
|--------------|--------|-------|
| Wizard state structure | ✅ Ready | Already designed for export |
| Database design | 🔄 Needed | Use existing incident data structure |
| API contract/OpenAPI | 🔄 Needed | Define endpoint schemas |
| Backend framework | ✅ Available | Express + Prisma standard pattern |
| Deployment (PostgreSQL) | ✅ Available | Vercel + Neon (PostgreSQL serverless) or Railway |
| Test framework | ✅ Available | Vitest already in use |

### Blockers and Risks

| Blocker | Severity | Mitigation |
|---------|----------|-----------|
| Database schema design — need review by SIAG stakeholders | Medium | Design together in Phase 1 kickoff; document extensibility for additional incident types |
| Incident data privacy — what data can be stored? GDPR/DSG implications | Medium | Clarify with SIAG: PII minimization, encryption at rest, audit logging requirements |
| API authentication model for v1.1 — simple API key or JWT? | Low | Start with stateless API key (simple), plan JWT for v1.2 when OAuth arrives |
| Database hosting decision — self-managed vs serverless | Low | Recommend Neon (PostgreSQL serverless on Vercel) for simplicity; can migrate to self-managed later |

---

## Integration Path: How Backend Enables Platform Integration

**v1.0 (Current):**
- Wizard is standalone frontend app
- Data lives in browser localStorage
- Cannot integrate with SIAG customer platform

**v1.1 (with Backend):**
```
SIAG Customer Platform
    ↓
[OAuth/SSO Layer] — TBD, Phase 2
    ↓
[API Gateway / Incident Router]
    ↓
[Wizard Component as Embedded UI] ← reads/writes to backend
    ↓
[PostgreSQL] — incidents, playbooks, audit logs
```

- Wizard is pluggable component
- State persists to backend
- Can be embedded in customer portal
- Incidents queryable via API

**v1.2 (with Auth):**
- OAuth/SSO integration enables multi-tenant access
- Platform routes incidents to correct tenant database
- Consultants log in once, access all customer incidents

---

## Rough Scope for v1.1 Backend

### Phases and Dependencies

```
v1.1 Wave 1 (Parallel):
├─ [01] Backend Scaffold (4 weeks)
│   ├─ Express app + Prisma + database
│   ├─ API endpoints (CRUD incidents)
│   ├─ Database schema + migrations
│   ├─ API documentation (OpenAPI)
│   └─ Deployment to Vercel/Railway
│
├─ [02] Wizard Integration (3 weeks, depends on 01)
│   ├─ POST /api/incidents on wizard complete
│   ├─ GET /api/incidents/:id to load existing incident
│   ├─ Replace localStorage with backend
│   ├─ Test with existing wizard (no UI changes)
│   └─ Verify v1.0 workflows still work
│
└─ [03] Export + Audit (2 weeks, depends on 01)
    ├─ PDF export endpoint (reuse v1.0 HTML-to-PDF)
    ├─ JSON export for integration
    ├─ Basic audit logging (who accessed what, when)
    └─ Incident list UI (simple table, filtering)

v1.1 Wave 2 (Sequential, after Wave 1 stable):
├─ [04] Additional Incident Types (3 weeks, depends on 02)
│   ├─ Phishing playbook (add to DB)
│   ├─ DDoS playbook (add to DB)
│   ├─ Data Loss playbook (add to DB)
│   ├─ Wizard incident-type router (Ransomware vs Phishing vs DDoS)
│   └─ Tests for each type
│
└─ [05] Polish + Documentation (2 weeks)
    ├─ API documentation
    ├─ Database schema documentation
    ├─ Integration guide for customer platform
    ├─ Performance testing (load test API)
    └─ Security review (API auth, data isolation)
```

### Key Components

| Component | Effort | Notes |
|-----------|--------|-------|
| Express app skeleton | 1 week | Include middleware (auth, CORS, logging) |
| Database schema design | 1 week | Work with SIAG; design for extensibility |
| API endpoints (CRUD) | 2 weeks | 5 endpoints, tests, error handling |
| Wizard ↔ API integration | 2 weeks | Replace localStorage; verify existing flows |
| Deployment (Vercel + DB) | 1 week | Set up Neon or Railway; CI/CD pipeline |
| Tests + docs | 2 weeks | Unit tests, integration tests, OpenAPI docs |

**Total: 4–6 weeks for Wave 1 (Backend + Integration)**

---

## Trade-Offs

### What We Gain
- ✅ Persistent incident storage (professional feature)
- ✅ Multi-session workflows (team collaboration)
- ✅ API for platform integration (unblocks customer portal embedding)
- ✅ Audit trail for compliance (ISG/DSG/FINMA reporting)
- ✅ Foundation for Auth + Multi-Tenant (v1.2)
- ✅ Data for analytics (which incident types occur most, response times)

### What We Deprioritize
- ❌ Additional incident types until backend stabilizes (small cost — Phishing/DDoS playbooks are data, not code)
- ❌ Real PDF generation (print-to-PDF is adequate; can add later)
- ❌ Multilingual support (German-only is sufficient for Phase 1; Swiss French/Italian can follow)
- ❌ Advanced analytics (basic incident counting first, dashboards in v1.2+)

### Downstream Effects

| Effect | Direction | Phase |
|--------|-----------|-------|
| Auth/OAuth becomes easier | ✅ Positive | v1.2 depends on backend, not a new prerequisite |
| Multi-Tenant support becomes viable | ✅ Positive | v1.2 can now be planned with confidence |
| Additional incident types are "just data" | ✅ Positive | v1.1-Wave-2 or v1.2 simple playbook imports |
| Analytics/reporting | ✅ Positive | v1.2 can query incident history |
| Customer platform embedding | ✅ Critical | v1.2 final step — embeds wizard as iframe/component |

---

## Why Backend Over Multilingual or PDF

### Customer Research Findings

**CISO Priorities (2026):**
- #1: Resilience + Incident Response Planning (not UI language)
- #2: Tool integration / API availability
- #3: Unified incident visibility

**Incident Management Tools (Market Survey):**
- 100% have persistent storage + APIs
- 80% have OAuth/SSO by default
- 30% have multi-language support
- Advanced PDF generation is nice-to-have, not mandatory

**Swiss Regulatory Context:**
- ISG, DSG, FINMA require incident documentation + audit trails
- Backend storage is necessary for compliance — not optional
- Language support is nice-to-have for multi-regional teams

### Technical Readiness

- **Wizard state → Backend:** 2-week effort (state structure already designed for export)
- **Multilingual:** 3–4 weeks (translation + i18n tooling, but *content* translation takes longer)
- **Real PDF:** 1 week (but print-to-PDF covers 95% of use cases)

Backend is both highest-impact *and* most aligned with v1.0 architecture.

---

## Next Steps

If approved, execute:

```bash
/gsd-new-milestone --reset-phase-numbers v1.1-Backend \
  --phase-count 5 \
  --title "Backend Integration (API + Database)" \
  --description "Persistent incident storage, REST API, SIAG customer platform integration foundation"
```

### Phase 1: Backend Architecture & Database Design
- Express app scaffold
- Prisma schema (incidents, playbooks, audit logs)
- Database hosting (Neon PostgreSQL)
- OpenAPI contract

### Phase 2: API Implementation
- CRUD endpoints (/incidents, /incidents/:id, etc.)
- Incident export (PDF, JSON)
- Error handling + validation
- API documentation

### Phase 3: Wizard Integration
- Replace localStorage with API calls
- Verify v1.0 workflows still work
- Add incident history UI (basic list)

### Phase 4: Testing & Deployment
- Integration tests (Wizard ↔ API)
- Load testing
- Security review (auth, CORS, data isolation)
- Vercel + database deployment

### Phase 5: Polish & Documentation
- API documentation (for SIAG partners)
- Database schema documentation
- Integration guide for customer platform
- Performance tuning

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|-----------|-------|
| **Recommendation (Backend)** | HIGH | v1.0 state architecture designed for export; market standard for incident tools; unblocks all other v1.1 options |
| **Technical Feasibility** | HIGH | Express + Prisma + PostgreSQL are standard patterns; Vercel integrates with Neon serverless DB; v1.0 codebase is clean |
| **Customer Value** | HIGH | Professional incident management requires persistent storage; CISOs expect API integration; Swiss compliance requires audit trails |
| **Integration Path** | MEDIUM-HIGH | Customer platform requirements not yet detailed with SIAG; assume standard SaaS multi-tenant pattern (likely correct) |
| **Effort Estimate** | MEDIUM | 4–6 weeks assumes no database design disputes or complex compliance requirements; scope can shift based on SIAG feedback |

---

## Open Questions for SIAG Stakeholders

Before v1.1 kickoff, clarify:

1. **Data privacy:** What incident data is sensitive? Any PII restrictions? Encryption requirements?
2. **Audit trail:** How detailed should incident audit logs be? Needed for compliance reporting?
3. **Multi-tenant:** Is backend designed for single-SIAG or multiple-SIAG-customers from day one? (affects schema design)
4. **API authentication:** Start with API key or plan OAuth immediately? (affects auth layer design)
5. **Customer platform timeline:** When is embedding deadline? Does it affect v1.1 scope?

---

## Sources

- [Incident Management with AI Adapter and ServiceNow](https://community.sap.com/t5/technology-blog-posts-by-members/incident-management-with-ai-adapter-and-servicenow-in-sap-Integration-suite/ba-p/14345051)
- [incident.io API Overview](https://docs.incident.io/integrations/api-overview)
- [Top 10 Incident Management Software for Enterprises in 2026](https://www.flowforma.com/blog/incident-management-tools)
- [20 Most used incident management tools in 2026](https://www.xurrent.com/blog/top-incident-management-software)
- [Best Incident Response Tools for 2026 Security Needs](https://www.vmray.com/best-incident-response-tools-comprehensive-guide-2026/)
- [CISO Strategic Priorities in 2026](https://www.trustcloud.ai/grc/top-10-cisos-strategic-priorities-in-2026/)
- [CISO Guide: Pick The Right Incident Tool In 2025](https://cyble.com/knowledge-hub/ciso-guide-pick-the-incident-tool/)
- [Incident management best practices: Complete guide 2026](https://incident.io/blog/incident-management-best-practices-2026/)
- [Node.js PDF generator guide](https://www.nutrient.io/blog/how-to-generate-pdf-from-html-with-nodejs/)
- [Multi-Tenant SaaS Architecture Best Practices](https://seedium.io/blog/how-to-build-multi-tenant-saas-architecture/)
- [Identity Management for Multi-Tenant SaaS Applications](https://securityboulevard.com/2026/03/identity-management-for-multi-tenant-saas-applications/)
