# Phase 20: Tech Debt — GitHub Secrets & Branch Protection

**Status:** 📋 Planned  
**Milestone:** v1.3 — Design Modernization & Tech Debt Cleanup  
**Created:** 2026-04-19

---

## Overview

Phase 20 is the first phase of v1.3. It establishes foundational governance for secure environment variable management and enforced code review workflow on the main branch.

**Goals:**
1. Document all required environment variables (.env.example)
2. Configure GitHub Secrets for CI/CD pipelines
3. Enable branch protection rules (PR review required, status checks enforced)
4. Update README with setup instructions

---

## Scope

### T1: GitHub Secrets Configuration
- `.env.example` template with all required vars
- Local `.env.local` documentation (in .gitignore)
- GitHub Secrets setup for CI/CD (5 secrets)
- README.md setup guide

### T2: Branch Protection Rules
- Minimum 1 PR review required
- Status checks enforced (tests must pass)
- Admin enforcement (prevent force pushes)
- Stale PR approvals dismissed

---

## Plans

| Plan | Objective | Tasks | Type |
|------|-----------|-------|------|
| 20-01 | Environment variables + GitHub Secrets + Branch Protection | 4 | execute |

**Wave Structure:** Single plan, Wave 1 (foundational)

---

## Key Files

| File | Changes |
|------|---------|
| `.env.example` | Verify & enhance annotations (14 vars, 25+ comments) |
| `README.md` | Add GitHub Secrets table + setup instructions |
| `GitHub Settings` | Manual: configure 5 secrets + branch protection rule |

---

## Acceptance Criteria (Phase-Level)

- [ ] `.env.example` has 6+ section headers, 14 documented vars, clear security guidance
- [ ] `README.md` includes GitHub Secrets configuration table (5 secrets)
- [ ] `README.md` includes step-by-step branch protection setup instructions
- [ ] GitHub Secrets configured: DATABASE_URL_CI, API_KEY_CI, VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
- [ ] Branch protection rule active on main:
  - ✓ Require PR before merging
  - ✓ Status checks enforced (Test Suite)
  - ✓ Admin enforcement
  - ✓ Dismiss stale approvals
- [ ] Next PR to main requires review + passing tests
- [ ] Force push to main is blocked for all users

---

## Dependencies

**Upstream:** None (foundation phase)  
**Downstream:** Phase 21 (Swagger Annotations), all Phase 22+ design phases

---

## Known Constraints

- GitHub Secrets configuration requires repo admin access (manual step)
- Branch protection rules setup requires repo admin access (manual step)
- CI/CD database (DATABASE_URL_CI) must be separate from production database
- API_KEY_CI uses sk_test_ prefix (test-only key)

---

## Success Signals

✅ Phase complete when:
1. Files updated and committed
2. All 5 GitHub Secrets visible in repo settings
3. Branch protection rule enabled and blocking force pushes
4. Next PR to main shows "Review required" + status check requirement
5. Documentation reviewed and usable by new developers

---

## Notes

- Phase 20 establishes security boundaries before design system work
- Tech debt phases (20, 21) are independent of design phases (22–28)
- Both can execute in parallel after Phase 20 completes
