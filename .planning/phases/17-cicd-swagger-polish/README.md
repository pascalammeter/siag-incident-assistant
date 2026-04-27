# Phase 17: CI/CD + Swagger Polish

**Status:** Planning Complete — Ready for Execution
**Date:** 2026-04-15
**Duration:** ~8-10 hours (2 waves × 1-2 hours per task + manual verification)

---

## Overview

Phase 17 closes the final gaps in the v1.2 milestone by implementing GitHub Actions CI/CD workflows and exposing the Swagger API documentation via App Router.

**Gap Closure:** Closes DE3 (CI/CD workflow) and B6 (Swagger endpoint) from v1.1 audit.

---

## Plans

### 17-01-PLAN.md: GitHub Actions CI/CD Workflow

**Wave:** 1 (independent)  
**Duration:** 2-3 hours  
**Autonomous:** Yes

**What it delivers:**

1. **`.github/workflows/ci.yml`** — Continuous Integration
   - Triggers on pull requests to `main`
   - Runs `npm ci` → `npm test` → uploads coverage
   - Blocks merge if tests fail
   - Uses GitHub Secrets: `DATABASE_URL_CI`, `API_KEY_CI`

2. **`.github/workflows/deploy.yml`** — Continuous Deployment
   - Triggers on push to `main` (after CI passes)
   - Deploys to Vercel using official `vercel/action`
   - Uses Vercel secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - Deployment URL: https://siag-incident-assistant.vercel.app

3. **`.github/workflows/README.md`** — Documentation
   - Setup instructions for secrets
   - Branch protection configuration
   - Troubleshooting guide

**Tasks:**
- Task 1: Create ci.yml (PR → Test Suite)
- Task 2: Create deploy.yml (Push → Vercel)
- Task 3: Create README.md with setup docs
- Task 4: Configure GitHub secrets & branch protection (manual)

**Success Criteria:**
- ✓ CI workflow runs on every PR to main
- ✓ Tests must pass before merge is allowed
- ✓ Deploy workflow triggers on push to main
- ✓ All 5 GitHub secrets configured
- ✓ Branch protection rule enforced

---

### 17-02-PLAN.md: App Router Swagger Endpoint

**Wave:** 1 (independent)  
**Duration:** 2-3 hours  
**Autonomous:** Yes

**What it delivers:**

1. **`src/app/api/swagger/route.ts`** — Swagger UI Endpoint
   - `GET /api/swagger` → HTML page with interactive Swagger UI
   - `GET /api/swagger/openapi.json` → Raw OpenAPI spec (JSON)
   - SIAG branding applied (#CC0033 red)
   - Cached for 1 hour (Cache-Control: max-age=3600)

2. **Updated `src/lib/swagger.ts`** — OpenAPI Spec
   - Already exists; verified for proper exports
   - Includes all 7+ API endpoints
   - ApiKeyAuth security scheme documented

3. **`src/__tests__/integration/swagger.integration.test.ts`** — Integration Tests
   - Verifies GET /api/swagger returns 200 + HTML
   - Verifies GET /api/swagger/openapi.json returns spec
   - Validates spec structure and completeness
   - Tests caching headers

**Tasks:**
- Task 1: Create Swagger UI endpoint (route.ts)
- Task 2: Verify OpenAPI spec exports
- Task 3: Create integration tests
- Task 4: Manual verification (browser + Vercel production)

**Success Criteria:**
- ✓ Swagger UI accessible at `/api/swagger`
- ✓ OpenAPI spec available at `/api/swagger/openapi.json`
- ✓ Swagger UI responsive and interactive
- ✓ All endpoints documented in spec
- ✓ API key authorization works in Swagger UI
- ✓ Accessible in production on Vercel
- ✓ Integration tests passing

---

## Wave Structure

Both plans run in **Wave 1** (parallel) — no dependencies.

```
Wave 1 (2-3 hours):
  └─ 17-01: GitHub Actions CI/CD Workflow
  └─ 17-02: App Router Swagger Endpoint
```

After both plans complete:
- Phase 17 is done
- v1.2 milestone complete (Phases 14–17 gap closure)
- Production ready for sign-off

---

## Key Files

### Created/Modified

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI workflow (test on PR) |
| `.github/workflows/deploy.yml` | Deploy workflow (deploy on main) |
| `.github/workflows/README.md` | CI/CD documentation |
| `src/app/api/swagger/route.ts` | Swagger endpoint (App Router) |
| `src/__tests__/integration/swagger.integration.test.ts` | Swagger tests |

### Configuration (Manual)

| Location | Action |
|----------|--------|
| GitHub → Settings → Secrets | Add 5 secrets (DATABASE_URL_CI, API_KEY_CI, VERCEL_*) |
| GitHub → Settings → Branches | Add branch protection rule for main |
| Vercel → Project Settings | Verify env vars and deployment settings |

---

## Requirements Mapping

| Requirement | Plan | Task | Status |
|-------------|------|------|--------|
| DE3.1 CI workflow exists | 17-01 | 1-2 | ✓ |
| DE3.2 Tests required for merge | 17-01 | 4 | ✓ |
| DE3.3 Deploy workflow auto-triggers | 17-01 | 2 | ✓ |
| DE3.4 Vercel production deployed | 17-01 | 4 | ✓ |
| B6.1 Swagger endpoint exists | 17-02 | 1 | ✓ |
| B6.2 OpenAPI spec served | 17-02 | 1-2 | ✓ |
| B6.3 Swagger UI accessible | 17-02 | 4 | ✓ |
| B6.4 All endpoints documented | 17-02 | 2 | ✓ |

---

## Testing Strategy

### CI Workflow Testing
1. Create test PR to main
2. Observe CI check shows "pending" → "running" → "passed" or "failed"
3. If passed: "Merge pull request" button enabled
4. If failed: "Merge pull request" button disabled (red X)
5. Merge PR to main
6. Observe deploy workflow triggers automatically
7. Wait for deployment to complete
8. Verify production URL is updated

### Swagger Endpoint Testing
1. Local: `curl http://localhost:3000/api/swagger` → HTML response
2. Local: `curl http://localhost:3000/api/swagger/openapi.json` → JSON spec
3. Browser: Visit `http://localhost:3000/api/swagger` → Swagger UI loads
4. Browser: Click "Authorize" → Enter test API key → Authorize
5. Browser: Try "GET /api/incidents" → Should return 200 (or empty list)
6. Production: Visit `https://siag-incident-assistant.vercel.app/api/swagger`
7. Production: Verify Swagger UI works same as local

---

## Manual Tasks (User Interaction)

Phase 17-01 (CI/CD) requires these manual steps:

1. **Gather Vercel credentials:**
   - VERCEL_TOKEN: From Vercel Settings → Tokens
   - VERCEL_ORG_ID: From Vercel Project Settings
   - VERCEL_PROJECT_ID: From Vercel Project Settings

2. **Create test database (if not exists):**
   - Neon: Create separate "test" database or use existing
   - Get DATABASE_URL_CI connection string
   - Verify test database is empty (no data collision risk)

3. **Add GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add 5 secrets: DATABASE_URL_CI, API_KEY_CI, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID

4. **Configure Branch Protection:**
   - Go to Settings → Branches → Add rule for `main`
   - Require CI checks to pass
   - Require branches up to date
   - (Optional) Require code reviews

5. **Test CI/Deploy:**
   - Create test PR
   - Verify CI runs and passes
   - Merge PR to main
   - Verify deploy triggers and completes

---

## Success Criteria (Phase Level)

**CI/CD (17-01):**
- [ ] `.github/workflows/ci.yml` created and functional
- [ ] `.github/workflows/deploy.yml` created and functional
- [ ] All GitHub secrets configured (5 total)
- [ ] Branch protection enforced on main
- [ ] CI check required before merge
- [ ] Deploy workflow triggers on main push
- [ ] Production deployment succeeds

**Swagger (17-02):**
- [ ] `src/app/api/swagger/route.ts` created
- [ ] `GET /api/swagger` returns 200 + HTML
- [ ] `GET /api/swagger/openapi.json` returns spec
- [ ] Swagger UI loads and interactive in browser
- [ ] OpenAPI spec includes all endpoints
- [ ] API key authorization works in UI
- [ ] Accessible in production
- [ ] Integration tests passing

**Overall:**
- [ ] Phase 17 complete (all 2 plans done)
- [ ] v1.2 milestone complete (Phases 14–17)
- [ ] 0 critical issues
- [ ] Production ready for sign-off

---

## Next Steps After Execution

1. **Generate SUMMARY files:**
   - `17-01-SUMMARY.md` (CI/CD workflow summary)
   - `17-02-SUMMARY.md` (Swagger endpoint summary)
   - `17-COMPLETION-SUMMARY.md` (Phase 17 overall)

2. **Update STATE.md:**
   - Mark Phase 17 complete
   - Mark v1.2 milestone complete
   - Update progress: 40/42 plans (or 51/51 if all phases included)

3. **Production sign-off:**
   - Verify all endpoints working in production
   - Run smoke tests
   - SIAG consultant UAT (if applicable)
   - Document any issues for v1.3

---

## Estimated Timeline

| Task | Duration | Start | End |
|------|----------|-------|-----|
| 17-01 Task 1 (ci.yml) | 30 min | 0:00 | 0:30 |
| 17-01 Task 2 (deploy.yml) | 30 min | 0:30 | 1:00 |
| 17-01 Task 3 (README.md) | 30 min | 1:00 | 1:30 |
| 17-01 Task 4 (config + test) | 1 hour | 1:30 | 2:30 |
| 17-02 Task 1 (swagger route) | 1 hour | 0:00 | 1:00 |
| 17-02 Task 2 (verify spec) | 30 min | 1:00 | 1:30 |
| 17-02 Task 3 (tests) | 1 hour | 1:30 | 2:30 |
| 17-02 Task 4 (verify + prod) | 1 hour | 2:30 | 3:30 |
| **TOTAL** | **5-6 hours** | | |

Both plans can run **in parallel** (Wave 1), reducing total time to ~3-4 hours.

---

## Related Documentation

- `.planning/ROADMAP.md` — Full project roadmap (Phases 1–17)
- `.planning/STATE.md` — Current project state and milestones
- `.planning/phases/16-playbook-migration-cleanup/` — Previous gap closure phase
- `.github/workflows/README.md` — CI/CD setup and troubleshooting
