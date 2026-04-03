---
phase: 4
slug: screens-4-5-response-communication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already installed) |
| **Config file** | `vitest.config.ts` or `package.json#scripts.test` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | F6/F7 | unit | `npm test -- --run src/data/playbook.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | F6/F7 | unit | `npm test -- --run src/data/meldepflicht.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | F6 | manual | Browser: Screen 4 renders 4 phases with checkboxes | n/a | ⬜ pending |
| 4-02-02 | 02 | 2 | F6 | manual | Browser: No-Go items show amber warning box | n/a | ⬜ pending |
| 4-03-01 | 03 | 2 | F7 | unit | `npm test -- --run src/utils/deadlines.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 2 | F7 | manual | Browser: Screen 5 Meldepflicht questions render correctly | n/a | ⬜ pending |
| 4-04-01 | 04 | 3 | F7 | manual | Browser: Communication templates show with copy button | n/a | ⬜ pending |
| 4-04-02 | 04 | 3 | F7 | unit | `npm test -- --run src/utils/clipboard.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/data/playbook.test.ts` — stubs for 25-step playbook TypeScript constants
- [ ] `src/data/meldepflicht.test.ts` — stubs for Meldepflicht deadline constants
- [ ] `src/utils/deadlines.test.ts` — unit tests for deadline calculation logic
- [ ] `src/utils/clipboard.test.ts` — stubs for clipboard copy utility

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Checkbox toggle persists across navigation | F6 | React state management | Navigate away and back, verify checked state preserved |
| No-Go amber warning appears on relevant items | F6 | Visual rendering | Scroll to No-Go items, verify amber box renders |
| Meldepflicht deadlines compute correctly | F7 | Time-based calculation | Set erkennungszeitpunkt, verify ISG=24h, DSG=72h, FINMA=24/72h |
| Copy button feedback shows inline "Kopiert!" | F7 | Clipboard API + UI state | Click copy, verify button text changes briefly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
