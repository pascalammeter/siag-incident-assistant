---
phase: 1
slug: project-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — foundation phase, CLI-based verification |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | Setup | cli | `node --version && npm --version` | ✅ | ⬜ pending |
| 1-01-02 | 01 | 1 | create-next-app | cli | `test -f package.json && cat package.json \| grep '"next"'` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | static export | cli | `grep 'output.*export' next.config.ts` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | SIAG tokens | cli | `grep '#1a2e4a' src/app/globals.css` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 2 | base layout | cli | `test -f src/app/layout.tsx && npm run build` | ❌ W0 | ⬜ pending |
| 1-05-01 | 05 | 2 | Vercel deploy | manual | Vercel Preview-URL existiert | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- None — foundation phase creates files from scratch, no pre-existing test stubs needed.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel Preview-URL | Deployment pipeline | Requires Vercel + GitHub connection | Check Vercel dashboard after push |
| SIAG-Farben visuell | Design tokens | Browser rendering required | Open Preview-URL, verify navy header |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
