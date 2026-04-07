# Phase 9: Wizard ↔ Backend Integration - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning
**Source:** Architecture decisions in STATE.md + Phase 8 API completion

## Phase Boundary

Connect the v1.0 frontend wizard to the v1.1 backend API. Replace localStorage-based state with API-backed persistence, with localStorage fallback. Create incident list UI showing all stored incidents with filtering/sorting capabilities.

**Deliverables:**
1. New `useIncident()` hook (replaces `useWizard()`) — API-backed state with localStorage fallback
2. Data migration layer — auto-migrate v1.0 localStorage incidents to API on first v1.1 load
3. Incident list page — display all incidents, sort by date/type/severity, filter by status

## Implementation Decisions

### Backend Integration
- Retire localStorage-only approach; migrate to API-first with graceful degradation
- `useIncident()` hook: wraps API calls (POST/GET/PATCH/DELETE), falls back to localStorage if API unavailable
- Error handling: Network failures → use cached localStorage; API errors → log + display toast
- Type safety: Reuse Prisma-generated types from `/server/db/schema.prisma` for frontend validation

### Data Migration
- Trigger: On app load in v1.1, detect v1.0 localStorage `incidents` key
- Auto-migrate: Iterate stored incidents, POST each to `/api/incidents`, delete localStorage entry on success
- Fallback: If API offline during migration, keep localStorage data and retry on next load
- UX: Silent migration (no modal), show success toast if >0 incidents migrated

### Incident List UI
- New route: `/incidents` (between home + wizard entry point)
- Display: Table or card grid showing all incidents
- Columns: Date (created), Type (Ransomware/Phishing/DDoS/Data Loss), Severity, Title, Status (Draft/Submitted)
- Actions: View (deep-link to wizard at step X), Export (PDF), Delete
- Filters: By type, by severity, by status
- Sorting: By date (default DESC), by type, by severity
- Empty state: "No incidents yet" with link to create one

### API Consistency
- Use same endpoints from Phase 8: GET /api/incidents, GET /api/incidents/{id}, PATCH /api/incidents/{id}, DELETE /api/incidents/{id}, POST /api/incidents
- Error responses: Match Phase 8 OpenAPI spec (400, 401, 404, 500)
- Loading states: Show skeleton loaders while fetching incidents list
- Cache invalidation: Refetch list after create/update/delete via SWR or React Query hooks

## Critical Constraints

1. **Fallback chain:** API → localStorage → empty state (never crash)
2. **Type safety:** Frontend and backend share incident type via Prisma schema (no manual sync)
3. **Migration must be non-blocking:** Run async, don't freeze UI during migration
4. **Backward compatible:** v1.0 users can load app, see their incidents migrated, continue working

## Canonical References

**Mandatory reads before planning:**

- `.planning/STATE.md` (Frontend Integration section) — architecture decisions
- `src/types/incident.ts` — frontend incident schema (will align with Prisma schema post-Phase 8)
- `/server/api/incidents.ts` (Phase 8 output) — endpoint specifications
- `.prisma/schema.prisma` — database schema for reference

## Specific Ideas

1. **Progressive enhancement:** Build useIncident() hook to gracefully handle API unavailability without rewriting wizard logic
2. **Reuse wizard state:** Leverage existing `StepForm` component + wizard context, just swap storage layer
3. **Incident list as admin view:** Later phases can extend with team assignment, SLA tracking, etc.

## Deferred Ideas

- User authentication/authorization (Phase 12 - Testing & Security)
- Team collaboration features (post-v1.1 roadmap)
- Webhook notifications for new incidents (post-v1.1 roadmap)
- Advanced filtering (tags, custom fields) — defer to Phase 11 Multi-Type Playbooks

---

*Phase: 09-wizard-backend-integration*
*Context gathered: 2026-04-07 from STATE.md architecture section*
