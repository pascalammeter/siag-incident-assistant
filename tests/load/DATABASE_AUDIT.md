# Database Query Performance Audit

This document provides a structured approach to identifying and fixing database performance bottlenecks discovered during load testing.

## Audit Methodology

### Phase A: Query Logging Setup

Enable Prisma query logging to capture slow queries during load tests:

```bash
# Terminal 1: Start backend with debug logging
DATABASE_URL="postgresql://..." \
DATABASE_DEBUG="*" \
npm run dev:backend 2>&1 | tee backend-audit.log
```

### Phase B: Identify Slow Queries

During the load test, capture queries taking >100ms:

```bash
# Terminal 3: Extract slow queries while test runs
grep "DURATION: [1-9][0-9][0-9]ms\|DURATION: [1-9][0-9]{3}ms" backend-audit.log
```

Example output:
```
prisma:query: SELECT "public"."Incident"."id" FROM "public"."Incident" WHERE ("public"."Incident"."incident_type" = $1) ORDER BY "public"."Incident"."createdAt" DESC LIMIT $2 OFFSET $3 [DURATION: 450ms] ❌ SLOW
prisma:query: SELECT "public"."Incident"."id" FROM "public"."Incident" WHERE ("public"."Incident"."id" = $1) [DURATION: 5ms] ✓ FAST
```

### Phase C: Categorize Issues

Common performance issues and their symptoms:

## Issue 1: Missing Database Indexes

**Symptom:** Queries on `incident_type`, `severity`, or `createdAt` taking >100ms

**Query Example:**
```sql
SELECT * FROM Incident 
WHERE incident_type = 'ransomware' 
ORDER BY createdAt DESC
-- DURATION: 450ms ❌
```

**Root Cause:** Full table scan; database must check every row

**Fix:** Add index to `prisma/schema.prisma`:

```prisma
model Incident {
  id String @id @default(cuid())
  incident_type String
  severity String
  createdAt DateTime @default(now())

  // Add missing indexes
  @@index([incident_type])
  @@index([severity])
  @@index([createdAt])
  
  // Composite indexes for common queries
  @@index([incident_type, createdAt])
  @@index([severity, createdAt])
}
```

**Migration:**
```bash
npx prisma migrate dev --name add-incident-indexes
```

**Expected improvement:** 450ms → 10-20ms (20-40x faster)

## Issue 2: N+1 Query Pattern

**Symptom:** Multiple sequential queries instead of one batch query

**Bad Code:**
```typescript
// ❌ BAD: 1 + N queries
const incidents = await prisma.incident.findMany({ take: 50 });
for (const incident of incidents) {
  const playbook = await prisma.playbookStep.findMany({
    where: { incidentId: incident.id }
  });
  incident.steps = playbook;
}
// Total queries: 51 (1 list + 50 detail queries)
```

**Good Code:**
```typescript
// ✅ GOOD: 1 query with include
const incidents = await prisma.incident.findMany({
  include: {
    playbookSteps: true  // Batched in single query
  },
  take: 50
});
// Total queries: 1
```

**Locations to audit:**
- `src/api/routes/incidents.ts` - list, detail, filter endpoints
- `src/api/services/IncidentService.ts` - any loops over incidents

**Finding N+1 patterns:**
1. Count total queries during load test
2. If creating 50 incidents takes 150 queries, suspect N+1
3. Check for `findMany()` inside loops

**Expected improvement:** 51 queries → 1 query, 500ms → 20ms

## Issue 3: Missing WHERE Clause Optimization

**Symptom:** Broad queries that return more data than needed

**Bad Code:**
```typescript
// ❌ Fetches all 10,000 incidents, filters in-memory
const allIncidents = await prisma.incident.findMany();
const ransomware = allIncidents.filter(i => i.type === 'ransomware');
```

**Good Code:**
```typescript
// ✅ Filters at database level
const ransomware = await prisma.incident.findMany({
  where: { incident_type: 'ransomware' }
});
```

**Expected improvement:** 500ms (load 10k rows) → 20ms (load 100 rows)

## Issue 4: Unoptimized SELECT Statements

**Symptom:** Fetching all columns when only a few are needed

**Bad Code:**
```typescript
// ❌ Fetches all 50 fields including large JSONB payloads
const incidents = await prisma.incident.findMany();
```

**Good Code:**
```typescript
// ✅ Selects only needed fields
const incidents = await prisma.incident.findMany({
  select: {
    id: true,
    incident_type: true,
    severity: true,
    createdAt: true,
    // omit: large JSONB fields like 'playbook'
  }
});
```

**Expected improvement:** 200ms (transfer 50 fields) → 50ms (transfer 4 fields)

## Issue 5: Connection Pool Exhaustion

**Symptom:** Timeout errors appearing at 30+ concurrent users

**Indicator:**
```
Error: Connection pool is exhausted
```

**Root Cause:** Default Neon connection pool is small; each concurrent user needs a connection

**Fix:** Configure Prisma adapter for Neon with connection pooling

In `.env.local`:
```
DATABASE_URL="postgresql://user:pass@host/db?schema=public&pgbouncer=true"
```

Add to `src/backend/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Max connections in pool
});

const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

**Expected improvement:** Timeouts at 30 VUs → handles 100+ VUs

## Issue 6: Inefficient Pagination

**Symptom:** Pagination queries slow down as offset increases

**Bad Code:**
```typescript
// ❌ Skip-based pagination is O(n) — gets slower
const page = req.query.page || 1;
const incidents = await prisma.incident.findMany({
  skip: (page - 1) * 50,  // Page 100: skips 5000 rows!
  take: 50
});
```

**Good Code:**
```typescript
// ✅ Cursor-based pagination is O(1) — consistent speed
const incidents = await prisma.incident.findMany({
  take: 51,  // Fetch one extra for "has next" detection
  ...(cursor && { skip: 1, cursor: { id: cursor } })
});

const hasNext = incidents.length > 50;
const data = incidents.slice(0, 50);
```

**Expected improvement:** Page 100 taking 500ms → consistent 20ms

## Performance Testing Checklist

Use this checklist while analyzing audit results:

### Query Analysis

- [ ] Run Prisma logging for 2 minutes during load test
- [ ] Extract slow queries (>100ms) to `backend-audit.log`
- [ ] Categorize by type (missing index, N+1, SELECT *, etc.)
- [ ] Document frequency (how many times did slow query run?)

### Database Schema

- [ ] Check for existing indexes on `incident_type`, `severity`, `createdAt`
- [ ] Verify `@@index` definitions in `prisma/schema.prisma`
- [ ] Check composite indexes for common filter combinations
- [ ] Verify foreign key relationships have indexes

### Code Review

- [ ] Search for `.findMany()` and `.find()` inside loops → suspect N+1
- [ ] Check all incidents list endpoints for missing `.where()` filters
- [ ] Verify `.select()` is used to limit columns when appropriate
- [ ] Check pagination implementation (cursor-based preferred)

### Connection Pool

- [ ] Verify `pgbouncer=true` in DATABASE_URL
- [ ] Check Prisma adapter configuration for max connections
- [ ] Monitor during 100 VU test — should stay < 20 connections

### Load Test Results

- [ ] Read-heavy SLA: avg <200ms, p95 <500ms
- [ ] Write-heavy SLA: avg <500ms, p95 <1000ms
- [ ] Sustained: memory growth <10%, no connection errors

## Optimization Priority Matrix

| Issue | Frequency | Impact | Priority | Expected Gain |
|-------|-----------|--------|----------|----------------|
| Missing indexes | High | High | 1️⃣ **CRITICAL** | 300-400ms improvement |
| N+1 queries | Medium | High | 2️⃣ **HIGH** | 200-300ms improvement |
| Unoptimized SELECT | High | Medium | 3️⃣ **MEDIUM** | 50-100ms improvement |
| Connection pool | Low | Critical | 4️⃣ **CRITICAL if present** | Removes timeouts |
| Pagination method | Medium | Low | 5️⃣ **LOW** | 20-50ms improvement |

**Recommended approach:**
1. Fix issues in priority order
2. Re-test after each fix
3. Document improvement with before/after metrics

## Example Audit Report

```markdown
# Database Audit Results — 2026-04-07

## Summary

Executed 1-minute read-heavy test (100 concurrent users).
Identified 3 performance issues.

## Issues Found

### 1. ❌ CRITICAL: Missing Index on incident_type
- Query: `SELECT * FROM Incident WHERE incident_type = ?`
- Duration: 450ms (avg across 50 test runs)
- Frequency: 300 queries during 1-minute test
- Root cause: Full table scan; 10,000 rows examined
- Fix: Add `@@index([incident_type])` to schema
- Expected improvement: 450ms → 15ms (30x faster)

### 2. ❌ HIGH: N+1 in listIncidents endpoint
- Location: `src/api/routes/incidents.ts:43`
- Pattern: Loop fetching playbook steps for each incident
- Frequency: 50 incidents × 50 test requests = 2,500 extra queries
- Duration: 100ms of 500ms response time is this N+1
- Fix: Add `include: { playbookSteps: true }` to query
- Expected improvement: 500ms → 150ms

### 3. ⚠️ MEDIUM: SELECT fetching all columns
- Query: Large JSONB playbook field (5KB per row)
- Frequency: Every list request
- Impact: Network transfer time 150ms, only use id + type (50 bytes)
- Fix: Use `.select()` to limit to needed fields
- Expected improvement: 50-80ms per request

## Action Items

1. Add indexes (5 minutes)
   ```prisma
   @@index([incident_type])
   @@index([severity])
   @@index([createdAt])
   ```

2. Fix N+1 in listIncidents (10 minutes)

3. Optimize SELECT columns (5 minutes)

4. Re-test (1 minute)

## Expected Results After Fixes

- Read-heavy avg: 500ms → 100ms (5x faster) ✅
- Write-heavy avg: stays same (not affected)
- Sustained: lower memory pressure
```

## Post-Optimization Verification

After implementing fixes, re-run tests:

```bash
# 1. Deploy fixes
git add -A && git commit -m "perf: optimize database queries"

# 2. Restart backend (to load new schema)
npm run dev:backend

# 3. Run load tests again
./run-tests.sh read-heavy --output json
./run-tests.sh write-heavy --output json

# 4. Compare results
# Before: avg=500ms, p95=1200ms
# After: avg=120ms, p95=300ms (76% improvement)
```

Document improvements in LOAD_TEST_RESULTS.md.

## Monitoring Going Forward

**Set up alerts for production:**

- **Response time p95** > 700ms → investigate
- **Error rate** > 1% → investigate database
- **Connection pool utilization** > 15/20 → increase pool size or optimize queries

Use tools like:
- Neon monitoring dashboard for query metrics
- k6 Cloud for continuous load testing
- New Relic or DataDog for production monitoring

---

**Reference:** See `tests/load/README.md` for full load testing guide
