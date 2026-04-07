# Load Test Execution Guide

This guide walks through executing the complete load testing suite and interpreting results.

## Pre-Execution Checklist

- [ ] k6 installed and verified: `k6 version` shows v0.50.0+
- [ ] Node.js 18+ installed: `node --version`
- [ ] Project dependencies installed: `npm ci`
- [ ] Backend can start: `npm run dev:backend` (test in separate terminal)
- [ ] No other services running on port 3000
- [ ] Database is accessible (Neon PostgreSQL connection working)
- [ ] Sufficient system resources (at least 4GB RAM free for 100 VU test)

## Execution Steps

### Phase 1: Backend Preparation (10 minutes)

1. **Start the Express backend:**

```bash
npm run dev:backend
```

Wait for output like:
```
Server running on http://localhost:3000
Database connected ✓
```

2. **Verify API is responding:**

```bash
curl http://localhost:3000/api/incidents?limit=5
# Should return 200 with incidents array (possibly empty)
```

### Phase 2: Read-Heavy Test (1 minute)

**Purpose:** Verify GET /api/incidents handles 100 concurrent reads efficiently

**Execution:**

```bash
# Terminal 2
cd tests/load
k6 run --scenario scenarioReadHeavy \
  -e BASE_URL=http://localhost:3000 \
  -o json=results/read-heavy-$(date +%Y%m%d_%H%M%S).json \
  scenarios.js
```

Or use the convenience script:

```bash
./run-tests.sh read-heavy --output json
```

**Expected output (PASS):**
```
checks.........................: 100% (300/300)
http_req_duration...............: avg=145ms   min=80ms    max=350ms   p(95)=280ms ✓
http_req_failed.................: 0%
```

**If FAIL (response times exceed SLA):**
- Note the avg and p95 values
- Continue to next test to gather all baseline data
- Follow optimization steps in Phase 4

**Time:** ~50 seconds (10s ramp-up + 30s load + 10s ramp-down)

### Phase 3: Write-Heavy Test (5 minutes)

**Purpose:** Verify POST /api/incidents creates incidents reliably under sustained load

**Execution:**

```bash
cd tests/load
k6 run --scenario scenarioWriteHeavy \
  -e BASE_URL=http://localhost:3000 \
  -o json=results/write-heavy-$(date +%Y%m%d_%H%M%S).json \
  scenarios.js
```

**Expected output (PASS):**
```
checks.........................: 100% (250/250)
http_req_duration...............: avg=380ms   min=100ms   max=800ms   p(95)=700ms ✓
http_req_failed.................: 0%
iterations.......................: 250 requests completed
```

**Key checks:**
- ✅ All iterations completed (no timeouts)
- ✅ Error rate is 0%
- ✅ p95 < 1000ms

**If failures occur:**
- Check backend logs for database errors
- Verify disk space available
- Check database connection pool status

**Time:** ~5:10 minutes (5s + 5m + 5s)

### Phase 4: Sustained Load Test (10+ minutes)

**Purpose:** Detect memory leaks and connection pool exhaustion

**Before starting, open a monitoring terminal:**

```bash
# Terminal 1 (already running backend, keep watching)
# Watch for "heap usage" or memory growth messages

# Terminal 3 (optional: system monitoring)
watch -n 2 'ps aux | grep node'
# Or on macOS: top -p $(pgrep -f "npm run dev")
```

**Execution:**

```bash
# Terminal 2
cd tests/load
k6 run --scenario scenarioSustained \
  -e BASE_URL=http://localhost:3000 \
  -o json=results/sustained-$(date +%Y%m%d_%H%M%S).json \
  scenarios.js
```

**What to monitor during the test:**

1. **Terminal 1 (backend):** Any error messages, connection warnings
2. **Terminal 3 (system):** Memory (VSIZE/RSS column) — should grow <10%
3. **k6 output:** Green checks, no timeout errors

**Example healthy output:**
```
http_req_duration...............: avg=160ms   min=75ms    max=450ms   p(95)=380ms
http_req_failed.................: 0%
vus............................: 100 (current)

... (after 5 minutes)
... (after 10 minutes)

iteration_duration..............: avg=1.15s   ...
```

**Example unhealthy output:**
```
❌ http_req_failed: 15% (connection pool exhausted)
❌ Memory growth: 250MB → 480MB (92% increase — memory leak!)
❌ Response times increasing: p95=800ms → 3000ms (degradation over time)
```

**Time:** ~10:30 minutes (15s + 10m + 15s)

### Phase 5: Result Analysis (10 minutes)

**Generate report for each test:**

```bash
node tests/load/analyze-results.js results/read-heavy-*.json
node tests/load/analyze-results.js results/write-heavy-*.json
node tests/load/analyze-results.js results/sustained-*.json
```

This creates:
- `results/read-heavy-*.md` — detailed read-heavy analysis
- `results/write-heavy-*.md` — detailed write-heavy analysis
- `results/sustained-*.md` — detailed sustained analysis with memory checks

**Review each report for:**
1. SLA compliance section (✅ PASS or ❌ FAIL)
2. Response time breakdown (avg, p95, p99)
3. Error count and error rate
4. Recommendations section

### Phase 6: Optimization (if needed)

If any test **FAILED** SLA targets:

#### Step A: Enable Query Logging

```bash
# Kill the existing backend
# Ctrl+C in Terminal 1

# Restart with Prisma logging
DATABASE_URL="postgresql://..." \
DATABASE_DEBUG="*" \
npm run dev:backend 2>&1 | tee backend.log
```

#### Step B: Run a Small Read-Heavy Test

```bash
# In Terminal 2, modify scenarios.js temporarily to use 20 VUs instead of 100
# Or just run:

k6 run --scenario scenarioReadHeavy \
  -e BASE_URL=http://localhost:3000 \
  scenarios.js
```

Look in `backend.log` for slow queries (queries taking >100ms):

```
prisma:query: SELECT ... FROM incidents WHERE type = $1 [DURATION: 450ms] ❌
prisma:query: SELECT ... FROM incidents ORDER BY createdAt DESC [DURATION: 80ms] ✓
```

#### Step C: Add Database Indexes

If queries on `incident_type`, `severity`, or `createdAt` are slow:

Edit `prisma/schema.prisma`:

```prisma
model Incident {
  // ... existing fields ...
  
  @@index([incident_type])  // Add if missing
  @@index([severity])       // Add if missing
  @@index([createdAt])      // Add if missing
}
```

Then migrate:

```bash
npx prisma migrate dev --name add-indexes
```

Restart backend and re-run tests.

#### Step D: Implement Result Caching

If reads are slow, cache incident lists (5-10 second TTL):

In `src/api/routes/incidents.ts`:

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 5 }); // 5 second cache

export async function listIncidents(req, res) {
  const cacheKey = `list:${JSON.stringify(req.query)}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const incidents = await prisma.incident.findMany({
    where: buildFilter(req.query),
    take: req.query.limit || 50,
  });
  
  cache.set(cacheKey, incidents);
  res.json(incidents);
}
```

Install cache library:

```bash
npm install node-cache
```

#### Step E: Re-run Tests

After each optimization:

```bash
./run-tests.sh read-heavy --output json
./run-tests.sh write-heavy --output json
```

Compare results before and after. Expected improvement: 20-40% faster response times per optimization.

## Interpreting SLA Results

### Read-Heavy SLA

**Target:** 100 concurrent GET requests, avg <200ms, p95 <500ms, 0% errors

**Status Legend:**
- ✅ **PASS:** Can safely handle 100 concurrent users
- ⚠️ **BORDERLINE:** avg 180-220ms or p95 450-550ms — monitor but acceptable
- ❌ **FAIL:** avg >250ms or p95 >600ms — optimization required before production

### Write-Heavy SLA

**Target:** 50 concurrent POST creates over 5 minutes, avg <500ms, p95 <1000ms, 0% errors

**Status Legend:**
- ✅ **PASS:** Can handle production incident creation load
- ⚠️ **BORDERLINE:** avg 450-550ms or p95 900-1100ms — add monitoring
- ❌ **FAIL:** avg >600ms or p95 >1200ms — optimize database writes

### Sustained Load SLA

**Target:** 10 minute mixed load, heap growth <10%, no connection exhaustion

**Status Legend:**
- ✅ **PASS:** Production-ready; no memory leaks detected
- ⚠️ **BORDERLINE:** heap growth 8-10% or occasional connection pool warnings
- ❌ **FAIL:** heap growth >15% or repeated connection pool errors — investigate leaks

## Creating Baseline Results Document

After all 3 tests pass SLA, create `LOAD_TEST_RESULTS.md`:

```markdown
# Load Test Results — Production Baseline

**Date:** YYYY-MM-DD
**Environment:** localhost:3000
**k6 version:** 0.50.0+
**Node version:** 18.x.x

## Summary

✅ All tests PASSED SLA targets

## Read-Heavy Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Response Time | 145ms | <200ms | ✅ |
| p95 | 280ms | <500ms | ✅ |
| p99 | 350ms | <1000ms | ✅ |
| Error Rate | 0% | 0% | ✅ |

[Full details from analyze-results output]

## Write-Heavy Results

[Similar table]

## Sustained Load Results

[Similar table with memory metrics]

## Recommendations

- System is production-ready
- No optimization needed
- Monitor response times monthly
- Set up alerts if p95 exceeds 700ms
```

Save as `tests/load/LOAD_TEST_RESULTS.md` and commit.

## Troubleshooting During Execution

### "Connection refused" at Phase 1

The backend is not running. In Terminal 1:

```bash
npm run dev:backend
```

Wait 5 seconds for startup.

### Tests hang or timeout

- Check if backend is still responsive: `curl http://localhost:3000/api/incidents`
- If unresponsive, restart backend
- If timeouts persist, check database connectivity
- Reduce VU count in scenarios.js temporarily

### Memory spikes during sustained test

- Check if incidents are being created successfully (no errors in k6 output)
- If creating thousands of incidents, database disk may be full
- Or there's a connection leak in the backend

### Very high response times (p95 > 1000ms)

- Check backend CPU: `top` or Task Manager
- Check database connection status in backend logs
- May indicate resource contention with other processes

## Quick Command Reference

```bash
# Install k6
brew install k6

# Run all tests with JSON output
./run-tests.sh read-heavy --output json
./run-tests.sh write-heavy --output json
./run-tests.sh sustained --output json

# Analyze all results
node analyze-results.js results/read-heavy-*.json
node analyze-results.js results/write-heavy-*.json
node analyze-results.js results/sustained-*.json

# Run specific scenario directly
k6 run --scenario scenarioReadHeavy -e BASE_URL=http://localhost:3000 scenarios.js

# Monitor backend during test
watch -n 1 'ps aux | grep "npm run dev"'
```

## Expected Timeline

| Phase | Duration | What Happens |
|-------|----------|--------------|
| 1. Backend setup | 5 min | Start Express, verify API responds |
| 2. Read-heavy | 1 min | 100 concurrent GET requests |
| 3. Write-heavy | 5 min | 50 concurrent POST creates |
| 4. Sustained | 10 min | Mixed load, memory monitoring |
| 5. Analysis | 10 min | Generate and review reports |
| 6. Optimization (if needed) | 30-60 min | Index tuning, caching, re-test |

**Total:** ~30 minutes (baseline), 1+ hour if optimization needed

---

**Next Step:** Follow Phase 1–5 to establish baseline results, then commit LOAD_TEST_RESULTS.md
