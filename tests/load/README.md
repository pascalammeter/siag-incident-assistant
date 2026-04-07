# Load Testing Suite — SIAG Incident Assistant

This directory contains k6 load testing scripts and analysis tools for verifying that the SIAG Incident Assistant API can handle production traffic loads.

## Overview

The load testing suite validates three critical scenarios:

1. **Read-Heavy** — 100 concurrent users fetching incidents (30 seconds)
2. **Write-Heavy** — 50 concurrent users creating incidents (5 minutes)
3. **Sustained Load** — Mixed 70% read / 30% write load (10 minutes, memory leak detection)

Each scenario is designed to stress-test different aspects of the system and identify bottlenecks.

## Quick Start

### Installation

#### macOS
```bash
brew install k6
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 6D6B03C85BA2C2E9 && \
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list && \
sudo apt-get update && \
sudo apt-get install k6
```

#### Windows (Choco)
```bash
choco install k6
```

#### Docker
```bash
docker run -i --net=host grafana/k6:latest run - <test-script.js
```

#### From source
https://k6.io/docs/getting-started/installation/

### Verify Installation

```bash
k6 version
```

Should output something like: `k6 v0.50.0`

### Running Tests

All tests assume the Express backend is running on `localhost:3000`. Start it first:

```bash
npm run dev:backend
```

Then in another terminal:

```bash
# Run read-heavy test (1 minute total: 10s ramp-up, 30s load, 10s ramp-down)
k6 run --scenario scenarioReadHeavy tests/load/scenarios.js

# Run write-heavy test (5+ minutes: 5s ramp-up, 5m load, 5s ramp-down)
k6 run --scenario scenarioWriteHeavy tests/load/scenarios.js

# Run sustained load test (10+ minutes: 15s ramp-up, 10m load, 15s ramp-down)
k6 run --scenario scenarioSustained tests/load/scenarios.js

# Generate JSON output for analysis
k6 run --scenario scenarioReadHeavy \
  -o json=tests/load/results/read-heavy.json \
  tests/load/scenarios.js

# Analyze results
node tests/load/analyze-results.js tests/load/results/read-heavy.json
```

### Using the Runner Script

For convenience, use the provided bash script (Unix/Linux/macOS):

```bash
chmod +x tests/load/run-tests.sh

# Run with defaults (reads from localhost:3000)
./tests/load/run-tests.sh read-heavy
./tests/load/run-tests.sh write-heavy
./tests/load/run-tests.sh sustained

# Specify custom base URL
BASE_URL=http://api.production.example.com ./tests/load/run-tests.sh read-heavy

# Generate JSON output
./tests/load/run-tests.sh read-heavy --output json

# Run in Grafana Cloud (requires projectID in script)
./tests/load/run-tests.sh read-heavy --cloud
```

## Test Scenarios

### Scenario A: Read-Heavy

**Goal:** Verify GET /api/incidents can serve 100 concurrent requests with low latency

**Configuration:**
- 100 Virtual Users (concurrent users)
- 10 second ramp-up
- 30 seconds at full load
- 10 second ramp-down
- **Total duration:** ~50 seconds

**Query patterns tested:**
- `?limit=10` — small page
- `?limit=50` — larger page
- `?type=ransomware` — filter by incident type
- `?severity=critical` — filter by severity
- `?limit=25&type=phishing` — combined filters

**SLA Targets:**
- Average response time: < 200ms
- p95 (95th percentile): < 500ms
- p99 (99th percentile): < 1000ms
- Error rate: 0%

**Example output:**
```
checks.........................: 100% (300/300)
data_received..................: 450 KB
data_sent.......................: 45 KB
http_req_blocked................: avg=10ms    min=5ms     max=50ms    p(95)=25ms
http_req_connecting.............: avg=2.5ms   min=1ms     max=10ms    p(95)=8ms
http_req_duration...............: avg=145ms   min=80ms    max=350ms   p(95)=280ms ✓
http_req_failed.................: 0% (0/300)
http_req_receiving..............: avg=5ms     min=1ms     max=20ms    p(95)=12ms
http_req_sending................: avg=2ms     min=0ms     max=10ms    p(95)=5ms
http_req_tls_handshaking........: avg=0ms     min=0ms     max=0ms     p(95)=0ms
http_req_waiting................: avg=136ms   min=75ms    max=340ms   p(95)=270ms
http_reqs........................: 300 requests
iteration_duration..............: avg=1.15s   min=1.09s   max=1.4s    p(95)=1.3s
iterations.......................: 300 (100 users × 3 iterations)
vus............................: 10 (min), 100 (max), 100 (current)
vus_max..........................: 100
```

### Scenario B: Write-Heavy

**Goal:** Verify POST /api/incidents can create 50 concurrent incidents over sustained 5 minutes without timeouts

**Configuration:**
- 50 Virtual Users
- 5 second ramp-up
- 5 minutes at full load
- 5 second ramp-down
- **Total duration:** ~5:10 minutes

**Actions per user:**
- Create 1-3 incidents (randomized payload)
- Each incident includes:
  - erkennungszeitpunkt (detection timestamp)
  - erkannt_durch (detection method)
  - betroffene_systeme (affected systems)
  - incident_type (ransomware, phishing, ddos, data_loss)
  - severity (critical, high, medium, low)
  - q1, q2, q3 (classification scores)

**SLA Targets:**
- Average response time: < 500ms
- p95: < 1000ms
- Error rate: 0%
- All requests must complete (no timeouts)

### Scenario C: Sustained Load

**Goal:** Detect memory leaks and connection pool exhaustion over 10+ minutes

**Configuration:**
- 100 Virtual Users (70% readers, 30% writers)
- 15 second ramp-up
- 10 minutes at full load
- 15 second ramp-down
- **Total duration:** ~10:30 minutes

**What to monitor:**
- Memory growth over time (should be < 10%)
- Database connection pool size (should not exceed limits)
- Error rate should remain 0%
- Response times should remain stable

**Metrics to capture manually:**

```bash
# Terminal 1: Start the backend and monitor memory
NODE_OPTIONS="--max-old-space-size=512" npm run dev:backend | grep -i "memory\|heap"

# Terminal 2: Run the test with verbose output
k6 run --scenario scenarioSustained \
  -o json=tests/load/results/sustained-latest.json \
  tests/load/scenarios.js
```

After the test completes, analyze the JSON output for memory metrics.

## Understanding the Results

### Key Metrics

| Metric | What It Means | Why It Matters |
|--------|---------------|-----------------|
| **http_req_duration** | Total time from request sent to response received | Measures user-perceived latency; most important for SLA |
| **p95 / p99** | 95th and 99th percentiles | Even if avg is good, slow outliers harm user experience |
| **http_req_failed** | Count of failed requests (HTTP >= 400) | Should be 0 in healthy tests |
| **http_req_waiting** | Time spent waiting for server response | Indicates server-side performance |
| **vus** | Virtual Users (concurrent connections) | Peak load being applied |
| **iterations** | Total test cycles completed | Throughput indicator |

### Interpreting Percentiles

If p95 = 500ms, this means:
- 95% of requests completed in <= 500ms
- 5% of requests took > 500ms (outliers)

If average = 200ms but p95 = 800ms, the system has consistency issues — some requests are much slower.

### Example: Good Results

```
✅ PASS
- http_req_duration..................: avg=180ms   p(95)=420ms   p(99)=680ms
- http_req_failed: 0%
- All checks passing
```

### Example: Performance Issues

```
❌ FAIL
- http_req_duration..................: avg=750ms   p(95)=2500ms  p(99)=4000ms
- http_req_failed: 2.5% (database timeouts)
- Waiting time is very high (server bottleneck)
```

## Performance Tuning

If tests reveal SLA violations, use this checklist:

### 1. Identify the Bottleneck

Check the request phase breakdown in results:

```
http_req_sending..................: 5ms (network/client)
http_req_waiting..................: 720ms (SERVER — this is the problem!)
http_req_receiving.................: 3ms (network/client)
```

If **waiting time is high** → server issue
If **sending/receiving high** → network latency

### 2. Enable Query Logging

```bash
# Terminal 1: Start backend with Prisma logging
DATABASE_URL="postgresql://..." \
DATABASE_DEBUG="*" \
npm run dev:backend
```

Then run a small load test and watch the terminal for slow queries.

### 3. Optimize Database Queries

Common issues:

```typescript
// ❌ BAD: N+1 query (1 per incident)
const incidents = await prisma.incident.findMany();
for (const incident of incidents) {
  const metadata = await prisma.metadata.findUnique(/* ... */);
  // ...
}

// ✅ GOOD: Single query with include
const incidents = await prisma.incident.findMany({
  include: { metadata: true }
});
```

### 4. Add Missing Indexes

In `prisma/schema.prisma`:

```prisma
model Incident {
  id String @id @default(cuid())
  incident_type String
  severity String
  createdAt DateTime @default(now())

  // Add these indexes for common queries
  @@index([incident_type])
  @@index([severity])
  @@index([createdAt])
}
```

Then migrate:

```bash
npx prisma migrate dev --name add_incident_indexes
```

### 5. Implement Caching

For frequently fetched incident lists:

```typescript
// Simple in-memory cache (short-lived)
const incidentCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

async function listIncidents(filter) {
  const cacheKey = JSON.stringify(filter);
  if (incidentCache.has(cacheKey)) {
    return incidentCache.get(cacheKey);
  }

  const results = await prisma.incident.findMany(filter);
  incidentCache.set(cacheKey, results);
  
  setTimeout(() => incidentCache.delete(cacheKey), CACHE_TTL);
  return results;
}
```

### 6. Check Connection Pool

Neon PostgreSQL has built-in connection pooling. Verify in `.env.local`:

```
DATABASE_URL="postgresql://user:password@ep-cool-panda-123.neon.tech/dbname?schema=public&pgbouncer=true"
```

The `pgbouncer=true` flag enables connection pooling.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Testing

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly Sunday 2 AM UTC
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: sudo apt-get install -y k6
      
      - name: Install Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Start backend
        run: |
          npm ci
          npm run build
          npm run dev:backend &
          sleep 10
      
      - name: Run load tests
        env:
          BASE_URL: http://localhost:3000
        run: |
          mkdir -p tests/load/results
          k6 run --scenario scenarioReadHeavy \
            -o json=tests/load/results/read-heavy.json \
            tests/load/scenarios.js
      
      - name: Analyze results
        run: node tests/load/analyze-results.js tests/load/results/read-heavy.json
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-results
          path: tests/load/results/
```

## Grafana Cloud Integration

For persistent performance monitoring:

1. Create account at https://grafana.com
2. Create a k6 cloud project
3. Get project ID from cloud settings
4. Update `tests/load/run-tests.sh` with project ID
5. Run: `./tests/load/run-tests.sh read-heavy --cloud`
6. View real-time results in Grafana dashboard

## Troubleshooting

### "Connection refused" errors

The backend is not running. Start it first:

```bash
npm run dev:backend
```

### "Too many open files" error

On macOS/Linux, increase file descriptor limit:

```bash
ulimit -n 10000
```

### k6 not found

Install k6 (see Installation section above)

### Tests timeout after 5 minutes

Increase the scenario timeout in scenarios.js or use smaller VU counts.

### Memory usage explodes

This indicates a memory leak in the backend. Check for:
- Unclosed database connections
- Growing arrays/objects without cleanup
- Event listeners not removed

Run with monitoring:

```bash
node --inspect=0.0.0.0:9229 server.js
# Then open chrome://inspect in Chrome DevTools
```

## Files in This Directory

- **scenarios.js** — K6 test scripts (read, write, sustained scenarios)
- **run-tests.sh** — Convenience runner script
- **analyze-results.js** — JSON result analyzer and report generator
- **README.md** — This file
- **results/** — Output directory for test results (JSON and markdown reports)

## Next Steps

1. **Run all three scenarios** and capture baselines
2. **Review results** using the analyzer
3. **Identify bottlenecks** (database, network, memory)
4. **Optimize** per recommendations above
5. **Re-test** to verify improvements
6. **Integrate into CI/CD** for ongoing monitoring
7. **Document SLAs** based on production targets

---

**Last updated:** April 2026
**k6 version:** 0.50.0+
**Node version:** 18.0.0+
