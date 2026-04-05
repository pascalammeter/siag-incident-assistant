---
phase: 6
slug: deployment-review-readiness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x (existing) + manual browser checks |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green (74+ tests)
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | NF3.1 | build | `npm run build 2>&1 \| tail -5` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | NF3.1 | manual | Vercel dashboard — deployment status | N/A | ⬜ pending |
| 06-03-01 | 03 | 3 | F1.1–F8.4 | manual | Browser walkthrough protocol | N/A | ⬜ pending |
| 06-04-01 | 04 | 1 | NF5.1 | file | `test -f README.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing test infrastructure covers all automated checks — no new test files needed for this phase.

*All phase behaviors requiring automated verification are covered by the existing vitest suite.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel URL accessible and 7-screen flow works | NF3.1 | Requires live deployment and browser | Navigate to production URL, complete full wizard flow |
| localStorage persists across page reload | F1.3 | Requires browser, real storage API | Enter wizard data, reload page, verify state restored |
| Print export works on production | F8.2 | Requires browser print dialog | Navigate to Step 6, click export button, verify print dialog |
| No console errors in browser | NF3.2 | DevTools required | Open DevTools console, run full wizard, verify no red errors |
| 375px viewport — no overflow | NF1.4 | Visual check required | DevTools → 375px width, run wizard, check all screens |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
