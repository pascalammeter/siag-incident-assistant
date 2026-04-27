/**
 * Smoke Test: Phase 14 Data Persistence Verification
 * 
 * Tests:
 * 1. Wizard → Save → Retrieve flow
 * 2. All 14 incident fields persisted
 * 3. Soft delete functionality
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TIMEOUT = 30000;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${e.message}`);
    return false;
  }
}

async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  
  const resp = await Promise.race([
    fetch(url, opts),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT)
    ),
  ]);
  
  if (!resp.ok) {
    throw new Error(`${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

async function runTests() {
  console.log(`\n🔍 Running Smoke Tests Against: ${BASE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  let testIncidentId = null;
  
  // Test 1: Health check
  if (await test('API Health Check', async () => {
    const res = await request('GET', '/api/health');
    if (!res.status || res.status !== 'ok') throw new Error('Health check failed');
  })) passed++; else failed++;

  // Test 2: Create incident
  if (await test('Create Incident (Wizard Data)', async () => {
    const incident = {
      title: 'Smoke Test Incident',
      description: 'Testing Phase 14 persistence',
      severity: 'high',
      status: 'open',
      assignee: 'test-user',
      component: 'api',
      startTime: new Date().toISOString(),
      rootCause: 'Test root cause',
      workarounds: 'Test workaround',
      resolution: 'Test resolution',
      impact: 'Test impact',
      data_loss: false,
      tags: ['test', 'smoke'],
    };
    const res = await request('POST', '/api/incidents', incident);
    if (!res.id) throw new Error('No incident ID returned');
    testIncidentId = res.id;
  })) passed++; else failed++;

  // Test 3: Retrieve incident
  if (await test('Retrieve Incident (Field Persistence)', async () => {
    if (!testIncidentId) throw new Error('No incident ID from previous test');
    const res = await request('GET', `/api/incidents/${testIncidentId}`);
    
    // Verify all 14 fields
    const requiredFields = [
      'id', 'title', 'description', 'severity', 'status', 'assignee',
      'component', 'startTime', 'rootCause', 'workarounds', 'resolution',
      'impact', 'data_loss', 'tags',
    ];
    
    const missing = requiredFields.filter(f => !(f in res));
    if (missing.length > 0) {
      throw new Error(`Missing fields: ${missing.join(', ')}`);
    }
    
    // Verify values
    if (res.title !== 'Smoke Test Incident') throw new Error('Title mismatch');
    if (res.severity !== 'high') throw new Error('Severity mismatch');
    if (res.data_loss !== false) throw new Error('data_loss mismatch');
  })) passed++; else failed++;

  // Test 4: List incidents (includes newly created)
  if (await test('List Incidents (Includes New Record)', async () => {
    const res = await request('GET', '/api/incidents');
    if (!Array.isArray(res)) throw new Error('Response is not an array');
    if (res.length === 0) throw new Error('No incidents returned');
    const found = res.find(i => i.id === testIncidentId);
    if (!found) throw new Error('Created incident not found in list');
  })) passed++; else failed++;

  // Test 5: Soft delete
  if (await test('Soft Delete Incident', async () => {
    if (!testIncidentId) throw new Error('No incident ID');
    const res = await request('DELETE', `/api/incidents/${testIncidentId}`);
    if (!res.success) throw new Error('Delete response missing success flag');
  })) passed++; else failed++;

  // Test 6: Verify soft delete (should be filtered from list)
  if (await test('Soft Delete Verification (Not in List)', async () => {
    const res = await request('GET', '/api/incidents');
    const found = res.find(i => i.id === testIncidentId);
    if (found) throw new Error('Deleted incident still appears in list');
  })) passed++; else failed++;

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
