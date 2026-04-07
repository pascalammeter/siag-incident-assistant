import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Histogram, Trend, Rate } from 'k6/metrics';

// === Custom Metrics ===
const readLatency = new Trend('read_latency_ms');
const writeLatency = new Trend('write_latency_ms');
const readErrors = new Rate('read_errors_rate');
const writeErrors = new Rate('write_errors_rate');
const successfulReads = new Counter('successful_reads');
const successfulWrites = new Counter('successful_writes');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// === Utility Functions ===

function generateIncidentPayload(type) {
  const types = ['ransomware', 'phishing', 'ddos', 'data_loss'];
  const severities = ['critical', 'high', 'medium', 'low'];

  return {
    erkennungszeitpunkt: new Date().toISOString(),
    erkannt_durch: `System Scanner ${Math.random()}`,
    betroffene_systeme: ['Server-1', 'Server-2', `Server-${Math.floor(Math.random() * 100)}`],
    erste_erkenntnisse: `Detection via ${type || 'unknown'} signature`,
    incident_type: type || types[Math.floor(Math.random() * types.length)],
    q1: Math.floor(Math.random() * 3) + 1,
    q2: Math.floor(Math.random() * 3) + 1,
    q3: Math.floor(Math.random() * 3) + 1,
    severity: severities[Math.floor(Math.random() * severities.length)],
    notes: `Load test incident at ${new Date().toISOString()}`,
  };
}

function getRandomIncidentId() {
  // In real tests, we'd fetch this first; for now, use a placeholder
  return '550e8400-e29b-41d4-a716-446655440000';
}

// === Test Scenarios ===

// Scenario A: Read-Heavy (100 concurrent users, 30 seconds at full load)
export const scenarioReadHeavy = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'], // 1% error rate threshold
    read_errors_rate: ['rate<0.01'],
  },
};

// Scenario B: Write-Heavy (50 concurrent users, 5 minutes at full load)
export const scenarioWriteHeavy = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '5s', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
    write_errors_rate: ['rate<0.01'],
  },
};

// Scenario C: Sustained Mixed Load (70 readers, 30 writers, 10 minutes)
export const scenarioSustained = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '15s', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// === Scenario A: Read-Heavy Test ===
export function readHeavyTest() {
  group('Read-Heavy: Fetch Incidents', () => {
    // Vary query parameters
    const queries = [
      '?limit=10',
      '?limit=50',
      '?type=ransomware',
      '?severity=critical',
      '?limit=25&type=phishing',
    ];

    const query = queries[Math.floor(Math.random() * queries.length)];
    const url = `${BASE_URL}/api/incidents${query}`;

    const res = http.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-load-test/1.0',
      },
      timeout: '30s',
    });

    readLatency.add(res.timings.duration);

    const passed = check(res, {
      'read status 200': (r) => r.status === 200,
      'read response time <200ms': (r) => r.timings.duration < 200,
      'read has data': (r) => r.json('data') !== undefined,
    });

    if (!passed) {
      readErrors.add(1);
    } else {
      successfulReads.add(1);
    }

    sleep(1);
  });
}

// === Scenario B: Write-Heavy Test ===
export function writeHeavyTest() {
  group('Write-Heavy: Create Incident', () => {
    const payload = JSON.stringify(generateIncidentPayload('ransomware'));

    const res = http.post(`${BASE_URL}/api/incidents`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'k6-load-test/1.0',
      },
      timeout: '30s',
    });

    writeLatency.add(res.timings.duration);

    const passed = check(res, {
      'write status 201': (r) => r.status === 201,
      'write response time <500ms': (r) => r.timings.duration < 500,
      'write has id': (r) => r.json('data.id') !== undefined,
    });

    if (!passed) {
      writeErrors.add(1);
    } else {
      successfulWrites.add(1);
    }

    sleep(1);
  });
}

// === Scenario C: Sustained Mixed Load ===
export function sustainedLoadTest() {
  const isWriter = Math.random() < 0.3; // 30% writers, 70% readers

  if (isWriter) {
    writeHeavyTest();
  } else {
    readHeavyTest();
  }
}

// Default export: which scenario to run (set via --scenario flag)
export const options = {
  scenarios: {
    scenarioReadHeavy: scenarioReadHeavy,
    scenarioWriteHeavy: scenarioWriteHeavy,
    scenarioSustained: scenarioSustained,
  },
};

// Configure default scenario if none specified
export default function () {
  // Fallback: run read-heavy if no scenario specified
  readHeavyTest();
}
