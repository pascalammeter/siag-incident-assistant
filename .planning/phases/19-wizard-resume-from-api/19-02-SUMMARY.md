---
phase: 19-wizard-resume-from-api
plan: "02"
subsystem: wizard-state
tags: [wizard-resume, api-fetch, hydration, error-handling, loading-state]
dependency_graph:
  requires: [mapIncidentToWizardState]
  provides: [/wizard-route, api-resume-flow, incidentId-prop]
  affects: [src/app/wizard/page.tsx, src/components/wizard/WizardShell.tsx, src/components/wizard/WizardContext.tsx, src/hooks/useIncidentAPI.ts]
tech_stack:
  added: []
  patterns: [server-component-to-client-prop, async-hydration-guard, uuid-validation, api-fetch-with-fallback]
key_files:
  created:
    - src/app/wizard/page.tsx
  modified:
    - src/hooks/useIncidentAPI.ts
    - src/components/wizard/WizardShell.tsx
    - src/components/wizard/WizardContext.tsx
decisions:
  - "Use apiClient.get directly in WizardProvider instead of IncidentAPI wrapper to avoid error type loss"
  - "UUID validation regex at module level prevents injection before API call"
  - "LoadingSpinner shown only for API resume path; localStorage path keeps return null"
  - "1500ms delay before redirect on 404/invalid UUID for toast readability"
metrics:
  duration: "2 min"
  completed: "2026-04-16"
  tasks_completed: 3
  tasks_total: 3
  test_count: 26
  files_changed: 4
---

# Phase 19 Plan 02: Wizard Resume from API Summary

Wire reverse mapping into wizard flow: /wizard?incident=uuid route fetches from API, hydrates WizardProvider at Step 1, with loading spinner, 404 redirect, network fallback to localStorage, and UUID validation.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix getIncident error wrapping + create /wizard route | defcd55 | src/hooks/useIncidentAPI.ts, src/app/wizard/page.tsx |
| 2 | Extend WizardShell and WizardProvider with incidentId | 8e30616 | src/components/wizard/WizardShell.tsx, src/components/wizard/WizardContext.tsx |
| 3 | Manual verification (auto-approved) | -- | -- |

## Implementation Details

### New File: src/app/wizard/page.tsx
- App Router Server Component (async, no 'use client')
- Reads `searchParams.incident` (Promise, Next.js 15 pattern)
- Passes `incidentId` prop to WizardShell
- Metadata: German description for SEO

### Modified: src/hooks/useIncidentAPI.ts
- Removed try/catch wrapper from `getIncident` static method
- APIError and NetworkError now propagate to callers unchanged
- Other methods (createIncident, updateIncident, etc.) left unchanged (out of scope)

### Modified: src/components/wizard/WizardShell.tsx
- Added `incidentId?: string` to WizardShellProps interface
- Passes incidentId to WizardProvider
- WizardShellInner unchanged (does not use incidentId)

### Modified: src/components/wizard/WizardContext.tsx
- WizardProvider accepts optional `incidentId` prop
- New imports: useRouter, apiClient, APIError, shouldFallback, mapIncidentToWizardState, showWarningToast, showErrorToast, LoadingSpinner, Incident type
- UUID_RE regex at module level for input validation
- Hydration useEffect split into two paths:
  - **incidentId present (resume):** UUID validate -> API fetch -> mapIncidentToWizardState -> HYDRATE with currentStep: 1
  - **incidentId absent (new):** localStorage read -> HYDRATE with currentStep: 0 (unchanged)
- Error handling: 404 -> error toast + redirect; network error -> localStorage fallback + warning toast; no localStorage -> empty state + error toast; other client errors -> error toast + redirect
- Loading guard: shows LoadingSpinner with aria-label when incidentId present and !isHydrated; returns null for localStorage path (unchanged behavior)

### Decisions Made

- **Direct apiClient.get instead of IncidentAPI wrapper:** The IncidentAPI.getIncident wrapper (even after the fix) adds no value for a single fetch in WizardProvider. Using apiClient.get directly gives full APIError type access.
- **UUID validation before fetch:** Prevents server round-trip for obviously invalid IDs. Regex is case-insensitive per UUID spec.
- **1500ms redirect delay:** Allows toast to be visible before navigation away from the page.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `npx vitest run src/__tests__/wizard-resume.test.ts`: 26/26 passed
- src/app/page.tsx unchanged (git diff shows no changes)
- All acceptance criteria for both tasks verified

## Checkpoint: Auto-Approved

Task 3 (checkpoint:human-verify) was auto-approved per auto_advance configuration. The 5 manual test scenarios documented:
1. Happy path resume: /wizard?incident=uuid -> LoadingSpinner -> Step 1 with data
2. New incident unchanged: / -> Step 0
3. 404 handling: /wizard?incident=00000000-... -> error toast -> redirect
4. Invalid UUID: /wizard?incident=not-a-uuid -> error toast -> redirect
5. No param: /wizard (no query) -> Step 0

## Self-Check: PASSED

- [x] src/app/wizard/page.tsx exists
- [x] src/components/wizard/WizardShell.tsx contains incidentId prop
- [x] src/components/wizard/WizardContext.tsx contains UUID_RE, apiClient.get, LoadingSpinner
- [x] src/hooks/useIncidentAPI.ts getIncident has no try/catch
- [x] src/app/page.tsx unchanged
- [x] Commit defcd55 exists (Task 1)
- [x] Commit 8e30616 exists (Task 2)
- [x] No unexpected file deletions
