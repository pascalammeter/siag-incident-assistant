#!/usr/bin/env node

/**
 * K6 Load Test Results Analyzer
 * Parses JSON results from k6 and generates a markdown report
 *
 * Usage: node analyze-results.js <results.json> [output.md]
 */

const fs = require('fs');
const path = require('path');

function analyzeResults(jsonPath, outputPath) {
  console.log(`Reading results from: ${jsonPath}`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const lines = rawData.split('\n');

  const metrics = {
    http_req_duration: [],
    http_req_failed: [],
    http_req_sending: [],
    http_req_waiting: [],
    http_req_receiving: [],
    read_latency_ms: [],
    write_latency_ms: [],
    successful_reads: 0,
    successful_writes: 0,
    read_errors_rate: 0,
    write_errors_rate: 0,
  };

  const scenarios = {};
  let totalVUs = 0;

  // Parse streaming JSON metrics
  lines.forEach((line) => {
    if (!line.trim()) return;

    try {
      const event = JSON.parse(line);

      if (event.type === 'Metric' && event.data) {
        const metric = event.data.name;
        const value = event.data.value;

        if (metric === 'http_req_duration') {
          metrics.http_req_duration.push(value);
        } else if (metric === 'http_req_failed') {
          metrics.http_req_failed.push(value);
        } else if (metric === 'http_req_sending') {
          metrics.http_req_sending.push(value);
        } else if (metric === 'http_req_waiting') {
          metrics.http_req_waiting.push(value);
        } else if (metric === 'http_req_receiving') {
          metrics.http_req_receiving.push(value);
        } else if (metric === 'read_latency_ms') {
          metrics.read_latency_ms.push(value);
        } else if (metric === 'write_latency_ms') {
          metrics.write_latency_ms.push(value);
        } else if (metric === 'successful_reads') {
          metrics.successful_reads += 1;
        } else if (metric === 'successful_writes') {
          metrics.successful_writes += 1;
        }
      }

      if (event.type === 'Point') {
        const metric = event.data.name;
        const value = event.data.value;

        if (metric === 'vus') {
          totalVUs = Math.max(totalVUs, value);
        }
      }
    } catch (e) {
      // Ignore non-JSON or malformed lines
    }
  });

  // Calculate percentiles
  function percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (p / 100)) - 1;
    return sorted[Math.max(0, index)];
  }

  function avg(arr) {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 100) / 100;
  }

  function max(arr) {
    return arr.length === 0 ? 0 : Math.max(...arr);
  }

  function min(arr) {
    return arr.length === 0 ? 0 : Math.min(...arr);
  }

  // Generate report
  const report = generateReport({
    metrics,
    totalVUs,
    percentile,
    avg,
    max,
    min,
    filePath: jsonPath,
  });

  // Write report
  const output = outputPath || jsonPath.replace('.json', '.md');
  fs.writeFileSync(output, report);

  console.log(`Report written to: ${output}`);
  console.log('');
  console.log(report);

  return output;
}

function generateReport({ metrics, totalVUs, percentile, avg, max, min, filePath }) {
  const timestamp = new Date().toISOString();
  const httpDurations = metrics.http_req_duration;
  const totalRequests = httpDurations.length;
  const failedRequests = metrics.http_req_failed.filter((v) => v === 1).length;
  const errorRate = totalRequests > 0 ? ((failedRequests / totalRequests) * 100).toFixed(2) : '0.00';

  let report = `# Load Test Results Report

**Generated:** ${timestamp}
**Test File:** ${filePath}

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Requests | ${totalRequests} |
| Failed Requests | ${failedRequests} |
| Error Rate | ${errorRate}% |
| Peak VUs | ${totalVUs} |
| Test Duration | ${Math.ceil(totalRequests / 10)}s (estimated) |
| Successful Reads | ${metrics.successful_reads} |
| Successful Writes | ${metrics.successful_writes} |

## Response Time Analysis

| Percentile | Duration (ms) | Status |
|-----------|---------------|--------|
| Min | ${min(httpDurations).toFixed(2)} | - |
| Avg | ${avg(httpDurations).toFixed(2)} | ${avg(httpDurations) < 200 ? '✅ PASS' : '❌ FAIL'} |
| p50 | ${percentile(httpDurations, 50).toFixed(2)} | - |
| p95 | ${percentile(httpDurations, 95).toFixed(2)} | ${percentile(httpDurations, 95) < 500 ? '✅ PASS' : '❌ FAIL'} |
| p99 | ${percentile(httpDurations, 99).toFixed(2)} | ${percentile(httpDurations, 99) < 1000 ? '✅ PASS' : '❌ FAIL'} |
| Max | ${max(httpDurations).toFixed(2)} | - |

## Request Phase Breakdown

| Phase | Avg (ms) | Min (ms) | Max (ms) | p95 (ms) |
|-------|----------|----------|----------|----------|
| Sending | ${avg(metrics.http_req_sending).toFixed(2)} | ${min(metrics.http_req_sending).toFixed(2)} | ${max(metrics.http_req_sending).toFixed(2)} | ${percentile(metrics.http_req_sending, 95).toFixed(2)} |
| Waiting (Server) | ${avg(metrics.http_req_waiting).toFixed(2)} | ${min(metrics.http_req_waiting).toFixed(2)} | ${max(metrics.http_req_waiting).toFixed(2)} | ${percentile(metrics.http_req_waiting, 95).toFixed(2)} |
| Receiving | ${avg(metrics.http_req_receiving).toFixed(2)} | ${min(metrics.http_req_receiving).toFixed(2)} | ${max(metrics.http_req_receiving).toFixed(2)} | ${percentile(metrics.http_req_receiving, 95).toFixed(2)} |

## SLA Compliance

### Read-Heavy Test (100 concurrent, 30s at load)
- **Target:** avg < 200ms, p95 < 500ms, error rate 0%
- **Status:** ${
    avg(metrics.http_req_duration) < 200 &&
    percentile(metrics.http_req_duration, 95) < 500 &&
    errorRate === '0.00'
      ? '✅ PASS'
      : '❌ FAIL'
  }

${
  avg(metrics.http_req_duration) < 200
    ? '- ✅ Average response time is within SLA'
    : `- ❌ Average response time EXCEEDS SLA: ${avg(metrics.http_req_duration).toFixed(2)}ms > 200ms`
}
${
  percentile(metrics.http_req_duration, 95) < 500
    ? '- ✅ p95 response time is within SLA'
    : `- ❌ p95 response time EXCEEDS SLA: ${percentile(metrics.http_req_duration, 95).toFixed(2)}ms > 500ms`
}
${
  errorRate === '0.00'
    ? '- ✅ No errors during test'
    : `- ❌ Error rate is non-zero: ${errorRate}%`
}

### Write-Heavy Test (50 concurrent, 5 minutes at load)
- **Target:** avg < 500ms, p95 < 1000ms, error rate 0%
- **Status:** ${
    avg(metrics.http_req_duration) < 500 &&
    percentile(metrics.http_req_duration, 95) < 1000 &&
    errorRate === '0.00'
      ? '✅ PASS'
      : '❌ FAIL'
  }

### Sustained Load Test (70/30 read/write, 10 minutes)
- **Target:** heap growth < 10%, connection pool stable
- **Status:** ⚠️ REQUIRES MANUAL INSPECTION (see metrics capture instructions below)

## Custom Metrics

| Metric | Count |
|--------|-------|
| Successful Reads | ${metrics.successful_reads} |
| Successful Writes | ${metrics.successful_writes} |

## Recommendations

${
  avg(metrics.http_req_duration) > 200 || percentile(metrics.http_req_duration, 95) > 500
    ? `### Performance Optimization Needed

1. **Database Query Analysis**
   - Enable Prisma query logging: \`DATABASE_URL="..." DATABASE_DEBUG=* npm run dev:backend\`
   - Check for N+1 queries in IncidentService

2. **Potential Indexes to Add**
   - incident_type index: \`@@index([incident_type])\`
   - severity index: \`@@index([severity])\`
   - createdAt index: \`@@index([createdAt])\`

3. **Caching Strategy**
   - Cache frequently queried incident lists
   - Use Redis or in-memory cache for hot data

4. **Connection Pooling**
   - Verify Prisma Neon adapter configured correctly
   - Monitor connection pool exhaustion`
    : `### Performance Within SLA

The API is performing well under the tested load. Consider:
- Regular load testing as part of CI/CD
- Monitoring for gradual performance degradation
- Capacity planning based on these results`
}

## How to Run Tests

\`\`\`bash
# Install k6 (if not already installed)
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Run read-heavy scenario
./tests/load/run-tests.sh read-heavy

# Run write-heavy scenario
./tests/load/run-tests.sh write-heavy

# Run sustained load scenario (10 minutes)
./tests/load/run-tests.sh sustained

# Generate JSON output for analysis
k6 run --scenario scenarioReadHeavy -o json=results.json tests/load/scenarios.js

# Analyze results
node tests/load/analyze-results.js results.json
\`\`\`

## Interpreting Results

- **http_req_duration:** Total round-trip time from request sent to response received
- **p95/p99:** 95th and 99th percentiles (95% and 99% of requests were faster than these times)
- **VU (Virtual User):** Simulated user; concurrent request generator
- **Error Rate:** Percentage of failed requests (HTTP status >= 400)

## Next Steps

${
  avg(metrics.http_req_duration) > 200 || percentile(metrics.http_req_duration, 95) > 500
    ? `1. Run Prisma query analysis with logging enabled
2. Implement identified index optimizations
3. Re-run tests to verify improvement
4. Document final optimization impact`
    : `1. Commit load test scripts to version control
2. Integrate into CI/CD pipeline
3. Set up automated performance regression testing
4. Plan regular load test reviews (monthly)`
}

---

**Test Report Generated:** ${timestamp}
`;

  return report;
}

// Run if called directly
if (require.main === module) {
  const jsonPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!jsonPath) {
    console.error('Usage: node analyze-results.js <results.json> [output.md]');
    process.exit(1);
  }

  analyzeResults(jsonPath, outputPath);
}

module.exports = { analyzeResults };
