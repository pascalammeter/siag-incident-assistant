# Performance Optimization Playbook

Quick reference for optimizing API performance when load tests reveal SLA violations.

## Decision Tree

```
Load Test Complete
  │
  ├─ ✅ All tests PASS SLA?
  │  └─ → DONE. Regular monitoring only.
  │
  └─ ❌ Tests FAIL or BORDERLINE?
     │
     ├─ Avg Response Time HIGH (>200ms for reads)?
     │  └─ → Follow: Database Query Optimization
     │
     ├─ p95/p99 HIGH but avg OK?
     │  └─ → Follow: Latency Tail Fix
     │
     ├─ Error Rate >0%?
     │  └─ → Follow: Error Investigation
     │
     ├─ Sustained test: Memory growing >10%?
     │  └─ → Follow: Memory Leak Detection
     │
     └─ Sustained test: Connection errors?
        └─ → Follow: Connection Pool Tuning
```

---

## Optimization 1: Database Query Optimization

**Symptoms:**
- Avg response time >200ms for reads
- "Waiting" phase takes 150ms+
- Prisma debug log shows queries >100ms

**Diagnosis (5 minutes)**

```bash
# 1. Enable Prisma logging
DATABASE_DEBUG="*" npm run dev:backend 2>&1 | tee backend.log

# 2. Run small load test (10 VUs instead of 100)
k6 run --scenario scenarioReadHeavy -e BASE_URL=http://localhost:3000 tests/load/scenarios.js

# 3. Find slow queries (>100ms)
grep "DURATION.*[1-9][0-9][0-9]ms" backend.log | head -10
```

**Example slow queries:**

```
prisma:query: SELECT ... FROM Incident WHERE incident_type = $1 [DURATION: 450ms] ❌
prisma:query: SELECT ... FROM IncidentStep WHERE incidentId IN ($1,$2,$3) [DURATION: 200ms] ❌
prisma:query: SELECT * FROM Incident ORDER BY createdAt DESC [DURATION: 350ms] ❌
```

### Fix 1A: Add Missing Indexes

**Estimated Impact:** 50-80% faster queries

**Detection:**
- Slow queries on `incident_type`, `severity`, `createdAt`
- Query uses `WHERE` or `ORDER BY` on these columns

**Implementation (10 minutes):**

Edit `prisma/schema.prisma`:

```prisma
model Incident {
  id String @id @default(cuid())
  incident_type String
  severity String
  createdAt DateTime @default(now())
  
  // Add these indexes
  @@index([incident_type])
  @@index([severity])
  @@index([createdAt])
  
  // Composite indexes for common queries
  @@index([incident_type, createdAt])
  @@index([severity, createdAt])
  @@index([deleted_at])  // If using soft deletes
}
```

**Migrate:**

```bash
npx prisma migrate dev --name add-incident-indexes
```

**Verify:**

```bash
# Restart backend with new schema
DATABASE_DEBUG="*" npm run dev:backend &

# Run load test again
k6 run --scenario scenarioReadHeavy -e BASE_URL=http://localhost:3000 tests/load/scenarios.js

# Compare: 450ms → 15-20ms (22x faster) ✅
```

### Fix 1B: Fix N+1 Query Pattern

**Estimated Impact:** 30-60% faster responses

**Detection:**

```bash
# Count queries during test
grep "prisma:query" backend.log | wc -l
# If: 1000 requests but 5000 queries → N+1 suspected

# Look for pattern in logs
grep -B2 "prisma:query.*FROM IncidentStep" backend.log | head -20
# If multiple queries for same incident ID → N+1 confirmed
```

**Example N+1:**

```typescript
// ❌ BAD: 1 + N queries
async function listIncidents(limit = 50) {
  const incidents = await prisma.incident.findMany({ take: limit });
  
  for (const incident of incidents) {
    incident.steps = await prisma.playbookStep.findMany({
      where: { incidentId: incident.id }
    });
  }
  
  return incidents;
  // Total queries: 1 (list) + 50 (details) = 51 queries
}
```

**Fix (5 minutes):**

```typescript
// ✅ GOOD: 1 query with include
async function listIncidents(limit = 50) {
  const incidents = await prisma.incident.findMany({
    include: {
      playbookSteps: true  // Fetch in same query
    },
    take: limit
  });
  
  return incidents;
  // Total queries: 1 query
}
```

**Locations to check:**
- `src/api/routes/incidents.ts` — list and filter endpoints
- `src/api/services/IncidentService.ts` — any loops over results
- `src/api/routes/incidents/[id].ts` — detail endpoint

**Verification:**

```bash
# Before: 1000 requests = 5000 queries
# After: 1000 requests = 1000 queries (5x improvement)

# Check logs
grep "prisma:query" backend.log | wc -l
# Should be ~1000 (1 per request)
```

### Fix 1C: Optimize SELECT Columns

**Estimated Impact:** 20-50ms per response

**Detection:**

```typescript
// ❌ BAD: Fetching all columns (including large JSONB)
const incidents = await prisma.incident.findMany();
// Returns: id, type, severity, createdAt, playbook (5KB JSONB), etc.

// Check: is every field used?
// Probably not — list views only show: id, type, severity, createdAt
```

**Implementation (5 minutes):**

```typescript
// ✅ GOOD: Select only needed columns
const incidents = await prisma.incident.findMany({
  select: {
    id: true,
    incident_type: true,
    severity: true,
    createdAt: true,
    // Omit: playbook (5KB JSONB), metadata (large)
  },
  take: limit
});
```

**Per endpoint:**
- **List endpoint:** select id, type, severity, created, updated
- **Detail endpoint:** select * (all columns)
- **Summary endpoint:** select id, type, created only

**Verification:**

```bash
# Check network payload size
# Before: ~5KB per incident (playbook + metadata)
# After: ~500 bytes per incident (selected fields only)
```

### Fix 1D: Implement Result Caching

**Estimated Impact:** 100-200ms on frequently accessed data

**When to use:** Reads that don't change frequently (incident list filters)

**Implementation (20 minutes):**

```typescript
import NodeCache from 'node-cache';

// Cache with 5-second TTL (time-to-live)
const cache = new NodeCache({ stdTTL: 5 });

export async function listIncidents(query) {
  // Generate cache key from query parameters
  const cacheKey = `list:${JSON.stringify(query)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return { data: cached, cached: true };
  }
  
  // Query database
  const incidents = await prisma.incident.findMany({
    where: buildFilter(query),
    select: {
      id: true,
      incident_type: true,
      severity: true,
      createdAt: true,
    },
  });
  
  // Store in cache
  cache.set(cacheKey, incidents);
  
  return { data: incidents, cached: false };
}
```

**Install dependency:**

```bash
npm install node-cache
```

**Verify:**

```bash
# First request: 150ms (database)
# Second request (same query): 5ms (cache) ✅
# After 5 seconds: 150ms again (cache expired, refresh)
```

---

## Optimization 2: Latency Tail Fix

**Symptoms:**
- Average response time OK (<200ms)
- But p95/p99 very high (>500ms)
- Indicates occasional slow requests

**Diagnosis (5 minutes)**

```bash
# Look at response time distribution
grep "DURATION" backend.log | awk '{print $NF}' | sed 's/ms//' | sort -n | tail -20
```

**Common causes:**
- Occasional slow database queries (e.g., pagination with high offset)
- Garbage collection pauses (Node.js heap cleanup)
- External API timeouts (if calling third-party services)

### Fix 2A: Optimize Pagination

**Issue:** Skip-based pagination gets slower as offset increases

```typescript
// ❌ BAD: Page 100 with skip
const incidents = await prisma.incident.findMany({
  skip: (page - 1) * 50,  // Page 100: skip 5000 rows!
  take: 50
});
// This is slow — database must scan and skip 5000 rows
```

**Solution: Use cursor-based pagination**

```typescript
// ✅ GOOD: Cursor-based pagination
const incidents = await prisma.incident.findMany({
  take: 51,  // Fetch one extra to detect "has next"
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,  // Skip the cursor itself
  orderBy: { id: 'desc' },
});

const hasNext = incidents.length > 50;
const data = incidents.slice(0, 50);

return {
  data,
  nextCursor: hasNext ? data[data.length - 1].id : null,
};
```

**Verification:**
- Page 1: 20ms
- Page 100: still 20ms (cursor-based is O(1), not O(n))

### Fix 2B: Add Request Timeouts

**Ensure slow queries don't hang indefinitely:**

```typescript
// In API routes
async function getIncidents(req, res) {
  try {
    const incidents = await Promise.race([
      prisma.incident.findMany({ take: 50 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      ),
    ]);
    res.json(incidents);
  } catch (error) {
    if (error.message === 'Query timeout') {
      res.status(503).json({ error: 'Database timeout' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

## Optimization 3: Error Investigation

**Symptoms:**
- Error rate >0% (timeouts, 5xx errors)
- Tests fail completely or intermittently

### Common Causes & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Connection refused" | Backend down | Ensure `npm run dev:backend` running |
| "Connection pool exhausted" | Not enough connections | Increase pool: `max: 30` in Prisma config |
| "Timeout: query exceeded 30s" | Query too slow | Add indexes, fix N+1 |
| "Database connection lost" | Network issue | Check Neon connection string |
| "400 Bad Request" | Invalid query params | Check query validation |
| "500 Internal Server Error" | Unhandled exception | Check backend logs |

**Debug steps:**

```bash
# 1. Check backend logs
tail -f backend.log | grep -i error

# 2. Check database connectivity
curl http://localhost:3000/api/health

# 3. Check connection pool status
# In Neon dashboard: Monitoring → Active Connections

# 4. Run smaller test
k6 run --scenario scenarioReadHeavy -e BASE_URL=http://localhost:3000 tests/load/scenarios.js
# Reduce VUs to 10, see if errors persist
```

---

## Optimization 4: Memory Leak Detection

**Symptoms (sustained test):**
- Heap grows >10% over 10 minutes
- Memory never returns to baseline
- Examples: 250MB → 400MB

**Diagnosis (15 minutes)**

```bash
# 1. Capture heap snapshots during test
NODE_OPTIONS="--max-old-space-size=512" npm run dev:backend

# 2. Start load test in another terminal
k6 run --scenario scenarioSustained -e BASE_URL=http://localhost:3000 tests/load/scenarios.js

# 3. Monitor memory
watch -n 2 'ps aux | grep "npm run dev" | grep -v grep'

# 4. Take heap dump at end
# Press Ctrl+. in Node.js terminal to get REPL
# > writeHeapSnapshot() → saves heap-YYY.heapsnapshot
```

**Common leak causes:**

| Leak | Evidence | Fix |
|------|----------|-----|
| Unclosed DB connections | Connection count increasing, memory growing | Ensure `await prisma.disconnect()` on shutdown |
| Event listeners not removed | Memory grows but CPU stable | Add `.off()` / `.removeListener()` cleanup |
| Growing arrays | Memory linear growth | Check for unbounded caches, infinite arrays |
| Circular references | Hard to detect | Use WeakMap for caches |

**Example fix:**

```typescript
// ❌ BAD: Event listener leak
const server = express();
server.on('request', (req, res) => {
  const listener = () => {};
  res.on('finish', listener);
  // Listener never removed!
});

// ✅ GOOD: Remove listener
server.on('request', (req, res) => {
  const listener = () => {};
  res.on('finish', listener);
  res.on('finish', () => {
    res.removeListener('finish', listener);  // Clean up
  });
});

// Or use once()
res.once('finish', listener);  // Auto-removes after first call
```

---

## Optimization 5: Connection Pool Tuning

**Symptoms:**
- "Connection pool exhausted" errors at 30+ VUs
- `SELECT 1` timeouts in Prisma logs

**Diagnosis (5 minutes)**

```bash
# Check current pool size
grep "max:" src/backend/lib/prisma.ts

# Check connections in Neon dashboard
# Monitoring → Active Connections → note the limit
```

**Fix (5 minutes):**

In `src/backend/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 30,  // ← Increase from default (~10) to 30
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

**Also verify DATABASE_URL has pooling enabled:**

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@host/db?schema=public&pgbouncer=true"
#                                                         ↑ Required for high concurrency
```

**Verify:**

```bash
# Before: Connection pool exhausted at 30 VUs
# After: Handles 100+ VUs without exhaustion
```

---

## Quick Wins (5 minutes each)

Apply these first if desperate for quick improvements:

### 1. Enable HTTP Compression

In Express middleware:

```typescript
import compression from 'compression';

app.use(compression({
  threshold: 1024,  // Only compress > 1KB responses
  level: 6,         // Compression level (0-9)
}));
```

**Expected improvement:** 20-30ms (network transfer faster)

### 2. Add Response Caching Headers

```typescript
app.get('/api/incidents', (req, res) => {
  res.set('Cache-Control', 'public, max-age=5');  // Cache 5 seconds
  const incidents = await prisma.incident.findMany({ take: 50 });
  res.json(incidents);
});
```

**Expected improvement:** Browsers/proxies cache, fewer requests to server

### 3. Connection Keepalive

```typescript
// In backend server initialization
const server = app.listen(3000, () => {
  server.keepAliveTimeout = 65 * 1000;  // 65 seconds
});
```

**Expected improvement:** 10-20ms per request (reuse TCP connections)

---

## Optimization Priority

**Do in this order:**

1. **Add missing indexes** (10 min, 30-50% improvement) ← Start here
2. **Fix N+1 queries** (20 min, 30-60% improvement)
3. **Implement caching** (30 min, 50-80% improvement if applicable)
4. **Optimize SELECT** (10 min, 20-30% improvement)
5. **Tune connection pool** (5 min, prevents timeouts)
6. **Fix memory leaks** (1-4 hours, required for sustained load)

---

## Re-Test After Each Fix

```bash
# After each optimization:
k6 run --scenario scenarioReadHeavy -o json=results/read-heavy-after.json -e BASE_URL=http://localhost:3000 tests/load/scenarios.js

# Compare
node tests/load/analyze-results.js results/read-heavy-after.json

# Example output:
# Before: avg=500ms, p95=1200ms
# After:  avg=150ms, p95=350ms (70% improvement) ✅
```

---

## When to Give Up

If after 2 hours of optimization:
- Still not meeting SLA
- Changes are getting risky (refactoring core logic)

**Options:**
1. **Vertical scaling:** Upgrade database (Neon higher tier)
2. **Horizontal scaling:** Add read replicas, caching layer (Redis)
3. **Revisit SLA:** Are targets realistic for this architecture?
4. **Defer:** Plan optimization for next sprint, document findings

---

## Reference

- `tests/load/README.md` — How to run tests
- `tests/load/DATABASE_AUDIT.md` — Detailed database analysis
- `tests/load/EXECUTION_GUIDE.md` — Step-by-step test guide
- Prisma docs: https://www.prisma.io/docs/guides/performance-optimization
- k6 docs: https://k6.io/docs/
