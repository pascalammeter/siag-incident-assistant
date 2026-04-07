# Load Test Results Template

Use this template to document load test results after executing the complete test suite.

---

# Load Test Results — [DATE]

**Environment:** [Production / Staging / Local Development]
**Test Date:** YYYY-MM-DD HH:MM UTC
**k6 Version:** [e.g., 0.50.0]
**Node.js Version:** [e.g., 18.18.0]
**Test Duration:** [Total time to complete all 3 scenarios]

## Executive Summary

**Overall Status:** ✅ PASS / ⚠️ BORDERLINE / ❌ FAIL

| Scenario | Avg Response | p95 | Status | Notes |
|----------|--------------|-----|--------|-------|
| Read-Heavy (100 VUs) | [___]ms | [___]ms | ✅/⚠️/❌ | |
| Write-Heavy (50 VUs) | [___]ms | [___]ms | ✅/⚠️/❌ | |
| Sustained (10 min) | [___]ms | [___]ms | ✅/⚠️/❌ | Memory: [___]% growth |

---

## Scenario A: Read-Heavy Test Results

**Objective:** Verify GET /api/incidents handles 100 concurrent requests

**Test Configuration:**
- Virtual Users: 100
- Ramp-up: 10 seconds
- Sustained Load: 30 seconds
- Ramp-down: 10 seconds
- Total Duration: ~50 seconds

### SLA Compliance

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Average Response Time | <200ms | [___]ms | ✅/❌ |
| p95 Response Time | <500ms | [___]ms | ✅/❌ |
| p99 Response Time | <1000ms | [___]ms | ✅/❌ |
| Error Rate | 0% | [___]% | ✅/❌ |
| Successful Requests | 100% | [___]% | ✅/❌ |

### Response Time Breakdown

| Percentile | Duration | Notes |
|-----------|----------|-------|
| Min | [___]ms | Fastest request |
| p50 | [___]ms | Median |
| p75 | [___]ms | |
| p90 | [___]ms | |
| p95 | [___]ms | **SLA Target** |
| p99 | [___]ms | **SLA Target** |
| Max | [___]ms | Slowest request |

### Request Phase Breakdown

This shows where time is spent in the HTTP request cycle:

| Phase | Avg | Min | Max | Notes |
|-------|-----|-----|-----|-------|
| **DNS Lookup** | [___]ms | [___]ms | [___]ms | Should be <5ms |
| **TCP Connection** | [___]ms | [___]ms | [___]ms | Should be <10ms |
| **TLS Handshake** | [___]ms | [___]ms | [___]ms | Should be <20ms (HTTPS only) |
| **Sending Request** | [___]ms | [___]ms | [___]ms | Client → Server network |
| **Waiting (Server)** | [___]ms | [___]ms | [___]ms | **Most important** — server processing |
| **Receiving Response** | [___]ms | [___]ms | [___]ms | Server → Client network |
| **TOTAL** | [___]ms | | | Sum of all phases |

**Analysis:**
- If `Waiting` time is high → database query optimization needed
- If `Sending`/`Receiving` high → network latency or response payload is large
- If consistent across test → good; if increasing → degradation over time

### Throughput

| Metric | Value |
|--------|-------|
| Total Requests | [___] |
| Requests/Second | [___] |
| Data Sent | [___] KB |
| Data Received | [___] KB |

### Errors

| Error Type | Count | Rate | Status |
|-----------|-------|------|--------|
| HTTP 200 Success | [___] | [___]% | ✅ |
| HTTP 4xx Client Error | [___] | [___]% | ✅ (if 0) |
| HTTP 5xx Server Error | [___] | [___]% | ✅ (if 0) |
| Timeouts | [___] | [___]% | ✅ (if 0) |
| Connection Errors | [___] | [___]% | ✅ (if 0) |

### Assessment

**SLA Status:** ✅ PASS / ⚠️ BORDERLINE / ❌ FAIL

**Why:**
[Explain: Are we meeting targets? Are there concerns?]

**Recommendations:**
- [ ] If avg >200ms: [specify optimization needed]
- [ ] If p95 >500ms: [specify optimization needed]
- [ ] If error rate >0%: [specify debugging needed]

---

## Scenario B: Write-Heavy Test Results

**Objective:** Verify POST /api/incidents creates incidents reliably under sustained load

**Test Configuration:**
- Virtual Users: 50
- Ramp-up: 5 seconds
- Sustained Load: 5 minutes
- Ramp-down: 5 seconds
- Total Duration: ~5:10 minutes
- Payload: Randomized incident data (ransomware, phishing, ddos, data_loss)

### SLA Compliance

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Average Response Time | <500ms | [___]ms | ✅/❌ |
| p95 Response Time | <1000ms | [___]ms | ✅/❌ |
| Error Rate | 0% | [___]% | ✅/❌ |
| All Creates Completed | 100% | [___]% | ✅/❌ |
| Timeouts | 0 | [___] | ✅/❌ |

### Response Time Breakdown

| Percentile | Duration | Notes |
|-----------|----------|-------|
| Min | [___]ms | |
| p50 | [___]ms | |
| p95 | [___]ms | **SLA Target** |
| p99 | [___]ms | **SLA Target** |
| Max | [___]ms | |

### Request Phase Analysis

| Phase | Avg | Notes |
|-------|-----|-------|
| **Sending** | [___]ms | Client → Server |
| **Waiting** | [___]ms | Database write time (most important) |
| **Receiving** | [___]ms | Server → Client |

**Expected Breakdown for POST:**
- Sending: 10-20ms (larger than GET)
- Waiting: 300-400ms (database insert time)
- Receiving: 5-10ms

### Throughput

| Metric | Value |
|--------|-------|
| Total Incidents Created | [___] |
| Incidents/Minute | [___] |
| Successful Creates | [___] (100%) |
| Failed Creates | [___] (should be 0) |

### Database Write Performance

| Metric | Value |
|--------|-------|
| Avg Insert Time | [___]ms |
| Fastest Insert | [___]ms |
| Slowest Insert | [___]ms |
| p95 Insert Time | [___]ms |

### Connection Metrics

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Peak Active Connections | [___] | <20 | ✅/⚠️/❌ |
| Connection Pool Exhaustion | [___] | 0 errors | ✅/❌ |
| Connection Wait Time | [___]ms | <100ms | ✅/❌ |

### Errors

| Error Type | Count | Status |
|-----------|-------|--------|
| HTTP 201 Created | [___] | ✅ |
| HTTP 4xx | [___] | ✅ (if 0) |
| HTTP 5xx | [___] | ✅ (if 0) |
| Connection Timeouts | [___] | ✅ (if 0) |
| Database Errors | [___] | ✅ (if 0) |

### Assessment

**SLA Status:** ✅ PASS / ⚠️ BORDERLINE / ❌ FAIL

**Why:**
[Explain: Are creates completing? Database performance OK?]

**Recommendations:**
- [ ] If avg >500ms: [specify optimization]
- [ ] If errors >0%: [specify debugging]
- [ ] If connection pool exhaustion: [increase pool or optimize]

---

## Scenario C: Sustained Load Test Results

**Objective:** Detect memory leaks and connection pool stability over 10+ minutes

**Test Configuration:**
- Virtual Users: 100 (70% readers, 30% writers)
- Ramp-up: 15 seconds
- Sustained Load: 10 minutes
- Ramp-down: 15 seconds
- Total Duration: ~10:30 minutes

### SLA Compliance

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Average Response Time | <200ms reads, <500ms writes | [___]ms | ✅/⚠️/❌ |
| Heap Memory Growth | <10% | [___]% | ✅/⚠️/❌ |
| Connection Pool Stability | No exhaustion | [___] | ✅/❌ |
| Error Rate | 0% | [___]% | ✅/❌ |

### Memory Analysis

**Memory Usage Over Time:**

```
Start:      [___] MB
5 min:      [___] MB
10 min:     [___] MB
End:        [___] MB

Growth:     [___] MB total ([___]%)
Rate:       [___] MB/min
```

**Analysis:**
- Linear growth (steady) → likely expected caching behavior
- Exponential growth → memory leak detected
- >10% growth → investigate

**Heap Snapshots (if captured):**

| Timestamp | Heap | Trend | Notes |
|-----------|------|-------|-------|
| Start | [___]MB | - | Baseline |
| 2:30 min | [___]MB | → | Should be stable |
| 5:00 min | [___]MB | → | Check for growth |
| 7:30 min | [___]MB | → | Leaks become visible |
| 10:00 min | [___]MB | → | Final state |

### Database Connection Pool

| Metric | Start | Peak | End | Limit | Status |
|--------|-------|------|-----|-------|--------|
| Active Connections | [___] | [___] | [___] | 20 | ✅/❌ |
| Wait Time (ms) | [___] | [___] | [___] | <100ms | ✅/❌ |
| Exhaustion Events | 0 | [___] | 0 | 0 | ✅/❌ |

**Issues to watch for:**
- ⚠️ Connections not returning to pool (leak)
- ⚠️ Increasing wait times (pool pressure)
- ❌ "Connection pool exhausted" errors (need larger pool)

### Response Time Stability

Test if response times remain consistent or degrade:

```
Minute 1:  avg=150ms, p95=400ms
Minute 5:  avg=160ms, p95=410ms
Minute 10: avg=165ms, p95=420ms

Trend: ✅ Stable (minor variation)
```

Or:

```
Minute 1:  avg=150ms, p95=400ms
Minute 5:  avg=300ms, p95=800ms
Minute 10: avg=600ms, p95=1500ms

Trend: ❌ Degrading (performance collapse)
```

### Throughput Over Time

| Time | Requests | Errors | Avg Latency | Note |
|------|----------|--------|-------------|------|
| 0-1 min | [___] | 0 | [___]ms | Ramp-up phase |
| 1-2 min | [___] | [___] | [___]ms | Full load starts |
| 2-5 min | [___] | [___] | [___]ms | Sustained |
| 5-10 min | [___] | [___] | [___]ms | Sustained |

**Watch for:**
- Throughput dropping over time (resource exhaustion)
- Error rate increasing over time (degradation)
- p95 increasing significantly (system under stress)

### Assessment

**SLA Status:** ✅ PASS / ⚠️ BORDERLINE / ❌ FAIL

**Memory Status:** ✅ No Leak / ⚠️ Borderline / ❌ Leak Detected

**Why:**
[Explain: Healthy sustained load? Any concerning trends?]

**Recommendations:**
- [ ] If memory growing: [investigate leak source]
- [ ] If connections exhausting: [increase pool or optimize]
- [ ] If performance degrading: [investigate root cause]

---

## Comparative Analysis

### Comparing This Run to Previous Baselines

If this is a re-test after optimizations, compare:

| Scenario | Previous Run | Current Run | Improvement | Status |
|----------|--------------|-------------|-------------|--------|
| Read Avg | [___]ms | [___]ms | [___]% ✅ | |
| Read p95 | [___]ms | [___]ms | [___]% ✅ | |
| Write Avg | [___]ms | [___]ms | [___]% ✅ | |
| Write p95 | [___]ms | [___]ms | [___]% ✅ | |
| Sustained Memory | [___]% | [___]% | [___]% ✅ | |

---

## Optimization Recommendations

### If All Tests PASSED ✅

No action needed. Consider:
- Regular re-testing (monthly)
- Set up alerting if metrics drift above targets
- Document baseline for future comparison

### If Tests BORDERLINE ⚠️

Monitor closely:
- Add application performance monitoring (APM)
- Weekly re-testing
- Plan optimization for next sprint

### If Tests FAILED ❌

Prioritize optimizations:

**1. Database Performance (if Waiting time high)**
   - Enable Prisma logging: `DATABASE_DEBUG=*`
   - Look for slow queries (>100ms)
   - Add missing indexes
   - Check for N+1 queries
   - Estimated fix time: 2-4 hours
   - Expected improvement: 30-50%

**2. Connection Pool (if pool exhaustion)**
   - Verify `pgbouncer=true` in DATABASE_URL
   - Increase max connections in Prisma config
   - Optimize query time to reduce connection hold time
   - Estimated fix time: 1 hour
   - Expected improvement: handles 2-3x more users

**3. Memory Leak (if sustained test shows growth)**
   - Check for unclosed database connections
   - Review event listeners cleanup
   - Check for circular references
   - Use heap snapshots to identify retained objects
   - Estimated fix time: 4-8 hours
   - Expected improvement: stable memory usage

See `tests/load/DATABASE_AUDIT.md` for detailed optimization guide.

---

## Performance Optimization Log

Track optimizations applied:

| Date | Issue | Fix | Result | Improvement |
|------|-------|-----|--------|-------------|
| 2026-04-XX | Missing incident_type index | Added @@index | [___]ms | [___]% ✅ |
| | | | | |
| | | | | |

---

## Monitoring & Alerting Setup

### Recommended Alerts

For production deployment, set up alerts:

```yaml
- Alert: READ_SLA_VIOLATION
  Condition: p95 > 600ms for 5 minutes
  Action: Page on-call engineer

- Alert: WRITE_SLA_VIOLATION
  Condition: p95 > 1200ms or error_rate > 1%
  Action: Page on-call engineer

- Alert: CONNECTION_POOL_EXHAUSTION
  Condition: active_connections >= 18/20
  Action: Scale database or optimize queries

- Alert: MEMORY_LEAK
  Condition: heap_growth > 20% over 1 hour
  Action: Investigate, restart if critical
```

### Monitoring Tools

Recommended tools for ongoing monitoring:

- **Application Performance:** New Relic, DataDog, Sentry
- **Database:** Neon monitoring dashboard, pgAdmin
- **Load Testing:** k6 Cloud for weekly automated testing
- **Infrastructure:** Vercel analytics, AWS CloudWatch

---

## Sign-Off

**Test Executed By:** [Name/Team]
**Date:** YYYY-MM-DD
**Status:** ✅ PASS / ⚠️ BORDERLINE / ❌ FAIL

**Approved for Production:** ✅ Yes / ❌ No / ⚠️ Conditional

**Conditions (if conditional):**
- [ ] [Specific optimization must be completed]
- [ ] [Specific re-test must pass]
- [ ] [Specific monitoring must be in place]

**Next Review Date:** YYYY-MM-DD

---

## Appendix: Raw Test Data

### Read-Heavy JSON Output
```
[Attach k6 JSON output or summary]
```

### Write-Heavy JSON Output
```
[Attach k6 JSON output or summary]
```

### Sustained Load JSON Output
```
[Attach k6 JSON output or summary]
```

### Backend Logs During Test
```
[Attach relevant backend logs, especially Prisma slow query warnings]
```

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Next Review:** [Date]
