---
phase: 17-cicd-swagger-polish
plan: "01"
subsystem: ci-cd
tags: [github-actions, ci, cd, vercel, deployment, testing]
dependency_graph:
  requires: []
  provides: [ci-workflow, deploy-workflow, workflow-documentation]
  affects: [github-pr-checks, vercel-deployments]
tech_stack:
  added: [github-actions, vercel/action@v4, actions/checkout@v4, actions/setup-node@v4, codecov/codecov-action@v3]
  patterns: [ci-cd-gate, pr-status-checks, automated-deployment]
key_files:
  created:
    - .github/workflows/ci.yml
    - .github/workflows/deploy.yml
    - .github/workflows/README.md
  modified: []
decisions:
  - "Use npm ci (not npm install) for reliable, locked dependency installs in CI"
  - "Use separate DATABASE_URL_CI and API_KEY_CI secrets (not production keys) to isolate CI from production"
  - "Use official vercel/action@v4 (Vercel-maintained, simplest integration)"
  - "Task 4 (GitHub Secrets + branch protection) documented as manual user action — cannot be automated without GitHub PAT with admin scope"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-15T13:44:00Z"
  tasks_completed: 4
  files_created: 3
  files_modified: 0
---

# Phase 17 Plan 01: GitHub Actions CI/CD Workflows Summary

GitHub Actions CI/CD workflows created to gate merges with passing tests and automate Vercel deployments on push to main. Closes DE3 CI/CD gap from v1.1 audit.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create CI workflow (ci.yml) | e31950c | .github/workflows/ci.yml |
| 2 | Create deploy workflow (deploy.yml) | 9f92ab4 | .github/workflows/deploy.yml |
| 3 | Create workflow README.md | d4d0b7a | .github/workflows/README.md |
| 4 | Document GitHub Secrets + branch protection | (in SUMMARY) | manual user action required |

## Files Created

### `.github/workflows/ci.yml`
- Triggers on `pull_request` to `main` and `push` to `develop`
- Node.js 20.x LTS with `npm ci` for reproducible installs
- Runs `npm run prisma:generate` then `npm test -- --reporter=verbose`
- Secrets: `DATABASE_URL_CI` and `API_KEY_CI` (isolated from production)
- 15-minute timeout; optional Codecov upload

### `.github/workflows/deploy.yml`
- Triggers on `push` to `main` and `workflow_dispatch` (manual)
- Uses official `vercel/action@v4`
- Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `production: true` — targets https://siag-incident-assistant.vercel.app
- 10-minute timeout

### `.github/workflows/README.md`
- Full setup documentation for both workflows
- Step-by-step GitHub Secrets configuration
- Branch protection setup guide
- Vercel deployment configuration
- Troubleshooting section

## Task 4: Required Manual Configuration (GitHub Dashboard)

Task 4 requires admin access to the GitHub repository dashboard. The executor cannot automate these steps without a GitHub Personal Access Token with admin:repo scope.

### Step 1: Add GitHub Secrets

Go to: **GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret**

Add each of the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `DATABASE_URL_CI` | Neon test DB connection string | Neon Dashboard -> Project -> Connection String |
| `API_KEY_CI` | Test API key (>=32 chars) | Generate: `openssl rand -base64 32` |
| `VERCEL_TOKEN` | Vercel personal access token | Vercel Dashboard -> Settings -> Tokens -> Create Token |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel Dashboard -> Settings -> General -> Organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Dashboard -> Project Settings -> Project ID |

### Step 2: Configure Branch Protection for `main`

Go to: **GitHub repository -> Settings -> Branches -> Add rule**

Settings to apply:
- Branch name pattern: `main`
- Require status checks to pass before merging: **enabled**
- Required status checks: Select `Test Suite (Node 20)` (the job name from ci.yml)
- Require branches to be up to date before merging: **enabled**
- Require code reviews (optional, recommended): 1 approval

Result: Merge button is disabled (red X) if CI fails; enabled (green check) if CI passes.

### Step 3: Verify the Setup

After adding secrets and branch protection:
1. Create a test branch: `git checkout -b test/verify-ci`
2. Push an empty commit: `git commit --allow-empty -m "test: verify CI runs" && git push`
3. Open a PR to main in GitHub
4. Observe: "CI — Test Suite" check appears as pending, then running
5. If secrets are correct, tests should pass and check turns green
6. Merge is enabled when green; blocked (grey/red) if pending/failed

## Deviations from Plan

### Task 4 — Manual Action Documented Instead of Executed

- **Found during:** Task 4
- **Issue:** Configuring GitHub Secrets and branch protection rules requires admin-scope GitHub API access (GITHUB_TOKEN in Actions does not have admin:repo scope). Attempting to call GitHub API from executor without explicit PAT would fail.
- **Fix:** Documented all required secrets, steps, and verification procedure in this SUMMARY. User must perform these steps in the GitHub Dashboard.
- **This is expected behavior** per the task_notes in the execution prompt: "Mark Task 4 as configuration instructions documented — requires manual user action in GitHub dashboard"

No other deviations. Plan executed exactly as written for Tasks 1-3.

## Known Stubs

None. All workflow files contain real configuration referencing actual secrets and action versions.

## Threat Surface Scan

The following security-relevant surfaces were introduced, all covered by the plan's threat model:

| Flag | File | Description |
|------|------|-------------|
| threat_flag: secret-exposure | .github/workflows/ci.yml | DATABASE_URL_CI and API_KEY_CI referenced from secrets (not hardcoded) |
| threat_flag: deployment-token | .github/workflows/deploy.yml | VERCEL_TOKEN is a privileged credential — must be scoped to project only |

Mitigations applied per STRIDE threat register:
- T-17-01a: Using official pinned actions (checkout@v4, setup-node@v4, vercel/action@v4)
- T-17-01b: All sensitive values use `${{ secrets.* }}` syntax (GitHub masks in logs)
- T-17-01d: Separate CI secrets (DATABASE_URL_CI, API_KEY_CI) — not production credentials
- T-17-01f: No `permissions: write-all` granted; default GITHUB_TOKEN used

## Self-Check: PASSED

| Item | Status |
|------|--------|
| .github/workflows/ci.yml | FOUND |
| .github/workflows/deploy.yml | FOUND |
| .github/workflows/README.md | FOUND |
| .planning/phases/17-cicd-swagger-polish/17-01-SUMMARY.md | FOUND |
| Commit e31950c (ci.yml) | FOUND |
| Commit 9f92ab4 (deploy.yml) | FOUND |
| Commit d4d0b7a (README.md) | FOUND |
