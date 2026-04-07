# Load Testing CI/CD Integration Guide

This guide explains how to integrate k6 load tests into your CI/CD pipeline for automated performance regression testing.

## Overview

Load testing can be integrated at different stages:

- **Post-deployment staging:** Verify performance after each deployment
- **Scheduled nightly:** Weekly baseline measurements
- **On-demand:** Manual trigger from PR for performance-critical changes
- **Production monitoring:** Continuous health checks using k6 Cloud

## GitHub Actions Integration

### Setup 1: Weekly Scheduled Load Test

Runs every Sunday at 2 AM UTC, creates report as artifact.

**.github/workflows/load-test-weekly.yml**

```yaml
name: Weekly Load Test

on:
  schedule:
    # Sunday 2 AM UTC
    - cron: '0 2 * * 0'
  workflow_dispatch:  # Allow manual trigger

jobs:
  load-test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 6D6B03C85BA2C2E9
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install -y k6
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Start backend
        run: |
          # Start backend in background
          npm run dev:backend &
          BACKEND_PID=$!
          
          # Wait for backend to be ready
          echo "Waiting for backend to start..."
          for i in {1..30}; do
            if curl -s http://localhost:3000/api/incidents > /dev/null; then
              echo "✅ Backend ready"
              break
            fi
            echo "Attempt $i/30..."
            sleep 2
          done
          
          # Store PID for cleanup later
          echo $BACKEND_PID > /tmp/backend.pid
      
      - name: Run read-heavy load test
        run: |
          mkdir -p tests/load/results
          k6 run --scenario scenarioReadHeavy \
            -e BASE_URL=http://localhost:3000 \
            -o json=tests/load/results/read-heavy.json \
            tests/load/scenarios.js
      
      - name: Run write-heavy load test
        run: |
          k6 run --scenario scenarioWriteHeavy \
            -e BASE_URL=http://localhost:3000 \
            -o json=tests/load/results/write-heavy.json \
            tests/load/scenarios.js
      
      - name: Analyze results
        run: |
          node tests/load/analyze-results.js tests/load/results/read-heavy.json
          node tests/load/analyze-results.js tests/load/results/write-heavy.json
      
      - name: Store results as artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results-${{ github.run_number }}
          path: tests/load/results/
          retention-days: 30
      
      - name: Comment on PR (if triggered from PR)
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const readHeavyReport = fs.readFileSync('tests/load/results/read-heavy.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Load Test Results\n\n${readHeavyReport}`
            });
      
      - name: Cleanup
        if: always()
        run: |
          kill $(cat /tmp/backend.pid 2>/dev/null) 2>/dev/null || true
```

### Setup 2: Post-Deployment Staging Test

Runs after each production deployment, fails if SLA violated.

**.github/workflows/load-test-post-deploy.yml**

```yaml
name: Load Test Post-Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  load-test-staging:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    timeout-minutes: 30
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 6D6B03C85BA2C2E9
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install -y k6
      
      - name: Get environment URL
        id: env-url
        run: |
          if [ "${{ github.event.inputs.environment }}" = "production" ]; then
            echo "url=https://siag-incident-assistant.vercel.app" >> $GITHUB_OUTPUT
          else
            echo "url=https://siag-staging.vercel.app" >> $GITHUB_OUTPUT
          fi
      
      - name: Run read-heavy test against ${{ steps.env-url.outputs.url }}
        run: |
          mkdir -p tests/load/results
          k6 run --scenario scenarioReadHeavy \
            -e BASE_URL=${{ steps.env-url.outputs.url }} \
            -o json=tests/load/results/read-heavy.json \
            tests/load/scenarios.js
      
      - name: Check SLA compliance
        run: |
          node tests/load/analyze-results.js tests/load/results/read-heavy.json
          
          # Extract metrics from JSON
          AVG_RESPONSE=$(node -e "
            const fs = require('fs');
            const lines = fs.readFileSync('tests/load/results/read-heavy.json', 'utf8').split('\n');
            const durations = [];
            lines.forEach(line => {
              try {
                const event = JSON.parse(line);
                if (event.data && event.data.name === 'http_req_duration') {
                  durations.push(event.data.value);
                }
              } catch(e) {}
            });
            const avg = durations.reduce((a,b) => a+b, 0) / durations.length;
            console.log(Math.round(avg));
          ")
          
          echo "Average response time: ${AVG_RESPONSE}ms"
          
          if [ $AVG_RESPONSE -gt 250 ]; then
            echo "❌ FAIL: Average response time ${AVG_RESPONSE}ms exceeds SLA (200ms)"
            exit 1
          fi
          
          echo "✅ PASS: Average response time within SLA"
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results-${{ github.event.inputs.environment }}
          path: tests/load/results/
```

### Setup 3: k6 Cloud Integration (Grafana)

For persistent performance tracking, integrate with k6 Cloud.

**.github/workflows/load-test-k6-cloud.yml**

```yaml
name: Load Test — k6 Cloud

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  load-test-cloud:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Start backend
        run: |
          npm run dev:backend &
          echo $! > /tmp/backend.pid
          sleep 5
      
      - name: Run k6 tests in cloud
        env:
          K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
          K6_CLOUD_PROJECTID: ${{ secrets.K6_CLOUD_PROJECT_ID }}
        run: |
          npx k6 cloud \
            --name "Weekly Load Test Run" \
            -e BASE_URL=http://localhost:3000 \
            tests/load/scenarios.js
      
      - name: Cleanup
        if: always()
        run: kill $(cat /tmp/backend.pid) 2>/dev/null || true
```

## GitLab CI Integration

### Setup: Load Test on Push to Main

**.gitlab-ci.yml** (add to existing file)

```yaml
load-test:
  stage: test
  image: grafana/k6:latest
  only:
    - main
    - merge_requests
  
  services:
    - docker:dind
  
  before_script:
    - apk add --no-cache node npm curl
    - npm ci
    - npm run build
    - npm run dev:backend &
    - sleep 10
  
  script:
    - mkdir -p tests/load/results
    - k6 run --scenario scenarioReadHeavy -o json=tests/load/results/read-heavy.json -e BASE_URL=http://localhost:3000 tests/load/scenarios.js
    - k6 run --scenario scenarioWriteHeavy -o json=tests/load/results/write-heavy.json -e BASE_URL=http://localhost:3000 tests/load/scenarios.js
  
  artifacts:
    paths:
      - tests/load/results/
    reports:
      performance: tests/load/results/performance.json
    expire_in: 30 days
  
  allow_failure: true  # Don't block merge if test runs long
```

## Jenkins Integration

### Declarative Pipeline

```groovy
pipeline {
  agent any
  
  stages {
    stage('Build') {
      steps {
        sh 'npm ci && npm run build'
      }
    }
    
    stage('Start Backend') {
      steps {
        sh '''
          npm run dev:backend &
          echo $! > backend.pid
          sleep 5
        '''
      }
    }
    
    stage('Load Test — Read Heavy') {
      steps {
        sh '''
          mkdir -p tests/load/results
          k6 run --scenario scenarioReadHeavy \
            -e BASE_URL=http://localhost:3000 \
            -o json=tests/load/results/read-heavy.json \
            tests/load/scenarios.js
        '''
      }
    }
    
    stage('Load Test — Write Heavy') {
      steps {
        sh '''
          k6 run --scenario scenarioWriteHeavy \
            -e BASE_URL=http://localhost:3000 \
            -o json=tests/load/results/write-heavy.json \
            tests/load/scenarios.js
        '''
      }
    }
    
    stage('Analyze Results') {
      steps {
        sh '''
          npm install
          node tests/load/analyze-results.js tests/load/results/read-heavy.json
          node tests/load/analyze-results.js tests/load/results/write-heavy.json
        '''
      }
    }
  }
  
  post {
    always {
      sh 'kill $(cat backend.pid) 2>/dev/null || true'
      archiveArtifacts artifacts: 'tests/load/results/**', allowEmptyArchive: true
      publishHTML([
        reportDir: 'tests/load/results',
        reportFiles: '*.md',
        reportName: 'Load Test Report'
      ])
    }
  }
}
```

## Vercel Deployment Integration

### Pre-Deployment Validation

For Vercel deployments, you can use a pre-deployment hook to run load tests against staging.

**.vercel/beforeDeploy.sh**

```bash
#!/bin/bash

# Before deploying to production, run load tests against staging

echo "🚀 Running pre-deployment load tests..."

# Get staging URL from Vercel
STAGING_URL="https://siag-staging.vercel.app"

# Run read-heavy test
k6 run --scenario scenarioReadHeavy \
  -e BASE_URL=$STAGING_URL \
  -o json=pre-deploy-results.json \
  tests/load/scenarios.js

# Check SLA
if grep -q '"metric":"http_req_duration"' pre-deploy-results.json; then
  AVG=$(node -e "
    const fs = require('fs');
    const lines = fs.readFileSync('pre-deploy-results.json', 'utf8').split('\n');
    const durations = [];
    lines.forEach(l => {
      try {
        const e = JSON.parse(l);
        if (e.data && e.data.name === 'http_req_duration') durations.push(e.data.value);
      } catch(e) {}
    });
    console.log(Math.round(durations.reduce((a,b) => a+b, 0) / durations.length));
  ")
  
  if [ $AVG -gt 300 ]; then
    echo "❌ Pre-deployment load test failed: avg ${AVG}ms > 200ms"
    exit 1
  fi
  echo "✅ Pre-deployment load test passed: avg ${AVG}ms"
fi

echo "✅ Safe to deploy"
```

## Best Practices

### 1. Test Isolation

- Run load tests in **separate job** from other tests
- Don't run other tests during load tests (resource contention)
- Use **dedicated staging environment** for load testing

### 2. Resource Management

- Ensure CI runner has **sufficient CPU and memory** for 100 VU test
- Set timeout limits: `timeout-minutes: 30` (15 min for 3 tests + cleanup)
- Gracefully **kill backend process** in `finally` blocks

### 3. Result Storage

- Save JSON results as **artifacts** (30-day retention)
- Generate **human-readable reports** (markdown)
- Compare against previous baselines (track trends)

### 4. Alerting

- Fail CI job if SLA **exceeded** (reject bad changes)
- Or use **soft fail** if baseline needs updating
- Send notifications to Slack/Teams if concerning trends

### 5. Frequency

- **Weekly scheduled:** Stable baseline measurement
- **Post-deployment:** Verify no regressions
- **On-demand:** Performance-critical PRs
- **Continuous (k6 Cloud):** Real-time monitoring

## Monitoring & Trending

### Grafana Cloud Dashboard

Once integrated with k6 Cloud, Grafana automatically creates dashboards showing:

- Response time trends over 30 days
- Error rate changes
- Throughput patterns
- Peak load capacity

Access at: https://app.k6.io/projects/[PROJECT_ID]

### Custom Trend Analysis

Store results in a database or Google Sheets for custom trending:

```bash
# Extract and store results
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('results.json'));
console.log(new Date().toISOString(), 'avg:', data.avg, 'p95:', data.p95);
" >> performance-trends.csv
```

## Troubleshooting CI/CD Load Tests

### Problem: Tests pass locally but fail in CI

**Causes:**
- Different backend performance in CI
- Resource contention with other jobs
- Network latency differences

**Solutions:**
- Run backend health check before tests
- Use dedicated CI runner for load testing
- Compare with baseline metrics from local runs

### Problem: Tests timeout

**Causes:**
- Backend slow to start (5 seconds not enough)
- Insufficient CPU on CI runner

**Solutions:**
- Increase wait time: `sleep 15` instead of `sleep 5`
- Request larger CI runner size
- Reduce VU count for CI (100 → 50)

### Problem: Inconsistent results

**Causes:**
- CI runner shared with other jobs
- Variable network quality

**Solutions:**
- Run tests in isolated pipeline
- Run multiple times, take average
- Set loose thresholds (p95 < 800ms instead of 500ms)

## Example: Complete GitHub Actions Workflow

```yaml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 0'

jobs:
  load-test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 6D6B03C85BA2C2E9
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install -y k6
      
      - run: npm ci && npm run build
      
      - run: npm run dev:backend & sleep 5
      
      - run: |
          mkdir -p tests/load/results
          k6 run --scenario scenarioReadHeavy -e BASE_URL=http://localhost:3000 -o json=tests/load/results/read-heavy.json tests/load/scenarios.js
      
      - run: node tests/load/analyze-results.js tests/load/results/read-heavy.json
      
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: load-test-results
          path: tests/load/results/
```

---

**See Also:**
- `README.md` — Local test execution
- `EXECUTION_GUIDE.md` — Manual testing procedure
- `DATABASE_AUDIT.md` — Performance optimization guide
