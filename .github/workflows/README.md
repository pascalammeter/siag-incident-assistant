# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### ci.yml — Continuous Integration (Test Suite)

**Trigger:** Pull requests to `main` branch

**What it does:**
1. Checks out code
2. Sets up Node.js 20.x
3. Installs dependencies with `npm ci`
4. Generates Prisma Client
5. Runs test suite with `npm test`
6. Uploads coverage reports (optional)

**Status:** Required check before merge (blocks merge if fails)

**Secrets required:**
- `DATABASE_URL_CI` — Test database URL (Neon test instance)
- `API_KEY_CI` — Test API key (>=32 characters)

### deploy.yml — Continuous Deployment (Vercel)

**Trigger:** Push to `main` branch (after CI passes)

**What it does:**
1. Checks out code
2. Deploys to Vercel production using official `vercel/action`
3. Sets environment variables from Vercel dashboard
4. Completes deployment

**Status:** Automatic after CI passes

**Secrets required:**
- `VERCEL_TOKEN` — Personal access token from Vercel
- `VERCEL_ORG_ID` — Vercel organization ID
- `VERCEL_PROJECT_ID` — Vercel project ID

## Setup Instructions

### 1. Configure GitHub Secrets

Go to: Repository Settings -> Secrets and variables -> Actions

**Add these secrets:**

#### For CI Workflow
- **DATABASE_URL_CI**: Neon test database connection string
  - Format: `postgresql://user:password@host/database?...`
  - Get from: Neon Dashboard -> Project -> Connection String (test database)

- **API_KEY_CI**: Test API key for automated testing
  - Generate: Any string >=32 characters (e.g., `test-key-1234567890123456789012`)
  - Must match the test environment value

#### For Deploy Workflow
- **VERCEL_TOKEN**: Personal access token for Vercel CLI
  - Get from: Vercel Dashboard -> Settings -> Tokens -> Create Token
  - Scope: Full Access

- **VERCEL_ORG_ID**: Vercel organization ID
  - Get from: Vercel Dashboard -> Settings -> General -> Organization ID
  - Example: `team_abc123def456`

- **VERCEL_PROJECT_ID**: Vercel project ID
  - Get from: Vercel Dashboard -> Project Settings -> Project ID
  - Example: `prj_xyz789uvw123`

### 2. Configure Branch Protection (Enforce CI)

Go to: Repository Settings -> Branches -> main -> Add rule

**Settings:**
- Branch name pattern: `main`
- Require status checks to pass before merging: checked
- Require status checks: Select `CI — Test Suite`
- Require branches to be up to date before merging: checked
- Require code reviews before merging: checked (optional, recommended)
- Require approval from code owners: optional
- Dismiss stale pull request approvals: optional

**Result:**
- CI must pass before merge
- Red X if tests fail
- Green check if tests pass

### 3. Verify Deployment Configuration

In Vercel Dashboard:

1. **Environment Variables:**
   - Go to Project Settings -> Environment Variables
   - Ensure all required env vars are set:
     - `DATABASE_URL` (production Neon database)
     - `API_KEY` (production API key)
     - `NEXT_PUBLIC_*` variables (if any)
   - Deploy on main should automatically pick these up

2. **Deployment Trigger:**
   - Go to Project Settings -> Git
   - Production Branch: `main`
   - Framework Preset: `Next.js`
   - Root Directory: `.` (project root)
   - Build Command: (leave default or use `npm run build`)

## Workflow Status

View workflow status in GitHub:

1. **PR Checks:**
   - Open any PR to main
   - Scroll down to "Checks" section
   - See `CI — Test Suite` status (pending, running, passed, failed)

2. **Deployment:**
   - Go to Deployments tab in repository
   - See deployment history and status
   - View Vercel deployment logs

## Manual Triggers

### Run CI manually (for testing)
```bash
# Trigger workflow from GitHub Actions tab
# Click "Run workflow" on ci.yml
```

### Deploy manually (if needed)
```bash
# Trigger workflow from GitHub Actions tab
# Click "Run workflow" on deploy.yml
# Or use: gh workflow run deploy.yml --ref main
```

## Troubleshooting

### CI fails: "DATABASE_URL_CI not found"
- Add the secret to GitHub: Settings -> Secrets -> Add `DATABASE_URL_CI`

### CI fails: "Prisma Client generation failed"
- Check that test database is accessible
- Verify DATABASE_URL_CI is correct connection string

### CI fails: "npm test failed"
- Check test output in workflow logs
- Fix failing tests locally: `npm test`
- Push fix and re-run workflow

### Deploy fails: "VERCEL_TOKEN invalid"
- Generate new token in Vercel: Settings -> Tokens -> Create Token
- Update GitHub secret: Settings -> Secrets -> Update `VERCEL_TOKEN`

### Deploy fails: "Project not found"
- Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
- Get values from Vercel Dashboard -> Project Settings

## References

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Action](https://github.com/vercel/action)
- [Next.js CI/CD example](https://nextjs.org/docs/app/guides/testing#continuous-integration)
- [Neon connection strings](https://neon.tech/docs/connect/connection-strings)
