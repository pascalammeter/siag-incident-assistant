# Phase 15: PDF Export App Router Route - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning
**Source:** ROADMAP.md (Phase 15 specification)

<domain>
## Phase Boundary

Create the missing App Router PDF export route (`src/app/api/incidents/[id]/export/pdf/route.ts`) and wire all export UI entry points (IncidentList export button, Step6Dokumentation export button) to call this route. This fixes the broken PDF Export E2E flow that was identified in the v1.1 audit (GAP-1).

**What this phase delivers:**
1. Working App Router PDF export endpoint at `GET /api/incidents/:id/export/pdf`
2. IncidentList.handleExportClick wired to API route (not stub)
3. Step6Dokumentation export button wired to API route (not window.print fallback)
4. Correct HTTP headers (Content-Type, Content-Disposition) for PDF response
5. Integration tests validating the complete export flow

**Phase depends on:** Phase 14 (API Data Integrity) — IncidentService must persist all wizard fields before PDF export is meaningful.

</domain>

<decisions>
## Implementation Decisions

### PDF Route Architecture
- Create `src/app/api/incidents/[id]/export/pdf/route.ts` as a Next.js App Router API route
- Reuse existing Puppeteer/PDFService logic (located in `src/lib/pdf/` or similar)
- Route accepts GET request with incident ID as URL parameter
- Returns binary PDF file with proper headers

### PDF Response Headers
- Set `Content-Type: application/pdf` 
- Set `Content-Disposition: attachment; filename="incident-{id}-{date}.pdf"`
- Ensure browsers download instead of rendering inline (unless user explicitly chooses to view)

### Export UI Integration
- Update `IncidentList.handleExportClick()` to call `GET /api/incidents/:id/export/pdf` (remove console.log stub)
- Update `Step6Dokumentation` export button handler to use API route (remove window.print fallback)
- Both should trigger browser download using standard PDF response headers

### PDF Content
- Reuse Phase 10 (Motion + PDF + Dark Mode) implementation:
  - Title page with incident metadata
  - SIAG logo (if available in assets)
  - Headers/footers on all pages
  - Page breaks and multi-page layout optimized
  - Print-friendly styling

### Testing Strategy
- Unit test: Verify route accepts incident ID, calls PDFService, returns correct headers
- Integration test: Verify complete flow — fetch incident, generate PDF, validate PDF structure
- E2E test: Validate both UI buttons trigger correct API calls and download files

### Claude's Discretion
- Error handling for missing incidents (404 response)
- Error handling for PDF generation failures (500 with error message)
- Performance: Consider caching recently-generated PDFs if same incident requested multiple times within short window
- Streaming: Consider using response streaming for large PDFs to reduce memory footprint
- Authentication: Inherit from existing API auth (API key or JWT)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing PDF Implementation (Phase 10)
- `.planning/phases/10-motion-pdf-dark-mode/10-03-PLAN.md` — PDF export spec with title page, headers/footers, Puppeteer integration
- `src/lib/pdf/PDFService.ts` (or similar) — Active PDF generation service

### API Architecture & Schema (Phases 7–8)
- `.planning/phases/07-backend-scaffold-design-system/` — Express/Prisma stack, database schema
- `.planning/phases/08-api-implementation/` — API endpoint patterns, validation, error handling

### Phase 14 Completion (API Data Integrity)
- `.planning/phases/14-api-data-integrity/14-COMPLETION-SUMMARY.md` — Confirms IncidentService persists all 14 wizard fields
- Schema: All incident fields now available for PDF export

### Next.js App Router Routes
- Next.js 15 documentation: Route handlers in `src/app/api/[...]/route.ts`
- Pattern: `export async function GET(request, { params })` for dynamic routes

</canonical_refs>

<specifics>
## Specific Ideas

### Success Criteria (from Phase 15 ROADMAP)
1. `src/app/api/incidents/[id]/export/pdf/route.ts` exists and calls existing Puppeteer/PDFService logic
2. `IncidentList.handleExportClick` calls `GET /api/incidents/:id/export/pdf` (not a `console.log` stub)
3. `Step6Dokumentation` export button uses API route (not `window.print()` fallback)
4. PDF response includes correct `Content-Type: application/pdf` and `Content-Disposition` headers
5. PDF contains title page, incident metadata, SIAG logo, headers/footers per P1.1–P1.6

### Requirement Mapping
- **P1.1–P1.6:** PDF structure, metadata, headers/footers (covered by Phase 10; reused in this phase)
- **B5.1–B5.4:** API endpoint patterns, response handling, error codes (Phase 8 patterns applied here)

### File Locations to Update
- `src/app/api/incidents/[id]/export/pdf/route.ts` — NEW
- `src/components/IncidentList.tsx` (or similar) — Update handleExportClick
- `src/components/step-components/Step6Dokumentation.tsx` (or similar) — Update export button handler
- `.planning/phases/15-pdf-export-app-router/` — This phase's plans

</specifics>

<deferred>
## Deferred Ideas

- **Authentication for PDF downloads:** v1.2 could add fine-grained RBAC (e.g., only incident creator can download PDF)
- **Audit logging:** v1.2 could log all PDF exports for compliance
- **Scheduled exports:** v1.2 could add email/scheduled PDF delivery
- **Custom PDF templates:** v1.2 could allow teams to define custom PDF layouts

</deferred>

---

*Phase: 15-pdf-export-app-router*
*Context gathered: 2026-04-14 from ROADMAP.md specification*
