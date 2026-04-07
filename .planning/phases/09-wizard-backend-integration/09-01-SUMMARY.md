---
phase: 9
plan: 1
title: "useIncident() Hook Implementation — COMPLETE"
duration: "5 hours"
status: "✅ COMPLETE"
date: "2026-04-07"
tasks_completed: 7
tests_passed: 47
key_files:
  - src/lib/incident-types.ts
  - src/api/client.ts
  - src/hooks/useIncidentAPI.ts
  - src/hooks/useIncident.ts
  - tests/hooks/useIncident.test.ts
  - tests/hooks/useIncidentAPI.test.ts
---

# Phase 9 Plan 1: useIncident() Hook Implementation — Summary

## Objective Achieved ✅

Successfully created an API-backed incident state management hook with localStorage fallback, enabling the wizard and incident list to persist data to the backend while maintaining graceful offline functionality.

## Deliverables

### 1. Incident Type Definitions (src/lib/incident-types.ts)

**Purpose:** Type safety across frontend and API integration

**Exports:**
- `IncidentType` enum and type union: 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other'
- `Severity` enum and type union: 'critical' | 'high' | 'medium' | 'low'
- `Incident` interface: Full model matching Prisma schema with all fields
- `CreateIncidentInput`: Subset for POST payloads (incident_type, severity required)
- `UpdateIncidentInput`: Partial type for PATCH payloads (all optional)
- `ListIncidentsFilters`: Query params (type, severity, page, limit)
- `ListIncidentsResponse`: Paginated response type

**Helper Functions:**
- `getIncidentTypeLabel()`, `getSeverityLabel()`: Display labels
- `getIncidentTypeIcon()`, `getSeverityIcon()`: Emoji icons for UI
- `isValidIncidentType()`, `isValidSeverity()`: Type guards

### 2. HTTP Client with Error Handling (src/api/client.ts)

**Core Features:**
- `APIError` class: Typed HTTP error with status property
- `NetworkError` class: Network failures and timeouts
- `apiClient` object with POST, GET, PATCH, DELETE methods
- 10-second timeout per request (AbortController)
- Automatic Content-Type: application/json header
- JSON serialization/deserialization
- Proper error propagation with status detection

**Error Handling:**
```typescript
// Server errors (5xx) and network errors trigger fallback
shouldFallback(error) => returns true for 5xx or NetworkError

// Client errors (4xx) bubble to UI
APIError.isClientError() => status 400-499
APIError.isServerError() => status 500+
```

### 3. API Service Layer (src/hooks/useIncidentAPI.ts)

**IncidentAPI class with 5 static methods:**

1. `createIncident(input: CreateIncidentInput): Promise<Incident>`
   - POST /api/incidents
   - Returns new incident with ID and timestamps

2. `getIncident(id: string): Promise<Incident>`
   - GET /api/incidents/{id}
   - Throws 404 APIError if not found

3. `updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident>`
   - PATCH /api/incidents/{id}
   - Partial updates with optional fields

4. `deleteIncident(id: string): Promise<void>`
   - DELETE /api/incidents/{id}
   - Soft delete (returns 204 No Content)

5. `listIncidents(filters?: ListIncidentsFilters): Promise<ListIncidentsResponse>`
   - GET /api/incidents?type={type}&severity={severity}&page={page}&limit={limit}
   - Returns paginated list with data and total count

**Error Handling:**
- All methods wrap APIError with context message
- Network errors bubble up for fallback logic

### 4. useIncident() Hook Implementation (src/hooks/useIncident.ts)

**Hook Interface:**
```typescript
{
  // State
  incident: Incident | null,
  isLoading: boolean,
  error: string | null,
  isOffline: boolean,
  
  // CRUD
  createIncident(input): Promise<Incident>
  getIncident(id): Promise<Incident | null>
  updateIncident(id, input): Promise<Incident>
  deleteIncident(id): Promise<void>
  listIncidents(filters): Promise<Incident[]>
  
  // Utilities
  clearError(): void
}
```

**API-First Strategy with localStorage Fallback:**

1. **Primary Flow:** Try API call → update state → return result
2. **Fallback Trigger:** Network error OR 5xx response
3. **Fallback Action:** Save to localStorage → set isOffline=true → continue
4. **4xx Handling:** Bubble to UI (validation errors, not offline)

**localStorage Structure:**
```typescript
siag-incident-{id}      // Individual incidents
siag-incidents          // List of all incidents
siag-incident-fallback  // Flag indicating offline mode
```

**State Management:**
- `useState` for incident, isLoading, error, isOffline
- `useCallback` for each CRUD method
- `useEffect` cleanup for AbortController on unmount
- Safe JSON.parse/stringify with try-catch

### 5. Unit Tests (47 tests total)

**useIncident Hook Tests (20 tests):**
- ✅ Create incident (4 scenarios: success, loading, error, fallback)
- ✅ Get incident (3 scenarios)
- ✅ Update incident (2 scenarios)
- ✅ Delete incident (1 scenario)
- ✅ List incidents (3 scenarios)
- ✅ Fallback behavior (5 scenarios: 5xx, network, 4xx pass-through, 404)

**HTTP Client Tests (27 tests):**
- ✅ POST, GET, PATCH, DELETE methods
- ✅ Content-Type header
- ✅ Error status handling (4xx, 5xx)
- ✅ Network error detection
- ✅ Timeout handling (10s)
- ✅ IncidentAPI methods (all 5 CRUD methods)
- ✅ Type guards and helpers (shouldFallback, isAPIError, isNetworkError)

**All tests passing:** ✅ 47/47

## Architecture Decisions

### 1. localStorage as Graceful Degradation

**Decision:** Use localStorage when API unavailable, not for primary caching

**Why:**
- Users can continue working offline
- No state loss during network issues
- Transparent to UI (hook handles fallback)
- Aligns with MVP constraint: no auth complexity

**Limitations:**
- localStorage quota ~5MB per domain
- No encryption (Phase 13 addition)
- Soft delete only (database marks as deleted)

### 2. Error Classification

**Decision:** Different handling for 4xx vs 5xx errors

- **5xx (server errors):** Fallback to localStorage (temporary issue)
- **4xx (client errors):** Bubble to UI (validation, auth, not found)
- **Network errors:** Fallback to localStorage (same as 5xx)

**Why:** Distinguishes between "API is down" (recoverable) vs "your data is invalid" (not recoverable)

### 3. Hook Composition Over Reducer

**Decision:** Use useState + useCallback instead of useReducer

**Why:**
- Simpler for Phase 9 scope
- Each CRUD method is independent
- Easier to test individual operations
- Can refactor to useReducer in Phase 10 if needed

## Integration Points

### Wizard Integration (Phase 9 Task 2)
- Wizard will call `useIncident().createIncident()` to save progress
- Incident ID passed via query param: `/wizard?incident={id}`
- On load, wizard fetches with `getIncident(id)`

### Incident List UI (Plan 09-03)
- IncidentList calls `listIncidents(filters)` on mount
- View action calls `getIncident()` to load full data
- Delete action calls `deleteIncident()`
- All filtering/sorting happens via `listIncidents(filters)`

### API Endpoints (Phase 8)
- Uses 5 endpoints: POST, GET, PATCH, DELETE, GET list
- No authentication headers yet (Phase 12 adds API key auth)
- Assumes HTTPS in production (TLS at Vercel boundary)

## Testing Coverage

**Test Files:**
- `tests/hooks/useIncident.test.ts`: 20 tests
- `tests/hooks/useIncidentAPI.test.ts`: 27 tests

**Scenarios Covered:**
- Successful CRUD operations
- Loading states (isLoading transitions)
- Error states (error messages)
- Fallback triggers (5xx, network)
- Error passthrough (4xx)
- localStorage read/write
- isOffline flag state transitions
- Type safety validation

**Passing Tests:** ✅ 47/47 (100%)

## Known Limitations & Deferred Items

1. **No Pagination in Hook** (Phase 10)
   - `listIncidents()` returns flat array
   - API supports page/limit params, hook doesn't expose them
   - Will add pagination state in Phase 10

2. **No Request Caching** (Phase 10)
   - Each call fetches fresh data
   - No SWR or React Query integration
   - Could add in Phase 10 for performance

3. **No Auth Headers** (Phase 12)
   - API key auth deferred to Phase 12
   - Current implementation assumes public API for MVP

4. **Soft Delete Only**
   - Database marks as deleted (deletedAt timestamp)
   - Hard delete deferred to admin tools (Phase 13+)

## Files Created

```
src/lib/incident-types.ts                (191 lines)
src/api/client.ts                       (245 lines)
src/hooks/useIncidentAPI.ts             (137 lines)
src/hooks/useIncident.ts                (378 lines)
tests/hooks/useIncident.test.ts         (488 lines)
tests/hooks/useIncidentAPI.test.ts      (413 lines)
────────────────────────────────────────────────
Total: 1,852 lines (production: 951 lines, tests: 901 lines)
```

## Success Criteria Met

✅ `useIncident()` hook created with all 5 CRUD operations
✅ API-backed storage with localStorage fallback for 5xx and network errors
✅ Type safety: all inputs/outputs use Incident types from incident-types.ts
✅ Loading states: isLoading boolean reflects async operation status
✅ Error handling: error state shows user-friendly messages; 4xx errors bubble to UI
✅ Offline detection: isOffline flag set when fallback triggered
✅ localStorage structure: incidents stored under `siag-incident-{id}` and `siag-incidents` keys
✅ 47 unit tests covering CRUD, fallback scenarios, error cases
✅ All existing 92 Phase 1-5 tests still passing (no breaking changes)
✅ Hook ready for integration in Phase 9 Task 2 and 09-03 Incident List UI

## Next Steps

**Phase 9 Task 2 (Wizard Integration):**
- Integrate useIncident() into wizard component
- Add incident ID to URL params
- Load incident on wizard mount
- Save progress to API on each step

**Phase 9 Plan 03 (Incident List UI):**
- Uses useIncident() hook directly in IncidentList component
- Calls listIncidents() to fetch all incidents
- Delete/view actions trigger hook methods
- Ready now (see 09-03-SUMMARY.md)

**Phase 10 (Optimization):**
- Add SWR/React Query for caching
- Implement pagination UI
- Optimize refetch on mutations
- Add optimistic updates

## Commit

```
feat(09-01): implement useIncident hook with api-backed storage and fallback
- Create incident-types.ts with full Incident interface and type definitions
- Implement HTTP client (apiClient) with error handling, timeouts, and type safety
- Create IncidentAPI service layer with 5 CRUD methods (create, get, update, delete, list)
- Implement useIncident() hook with API-first strategy and localStorage fallback
- Add comprehensive unit tests (47 tests total)
- Hook provides loading, error, and offline states
- localStorage fallback triggered on network errors and 5xx responses
- Type-safe with full Prisma schema alignment
```

**Commit Hash:** cea4f50

---

**Status:** ✅ COMPLETE — Ready for Phase 9-03 Incident List UI integration
