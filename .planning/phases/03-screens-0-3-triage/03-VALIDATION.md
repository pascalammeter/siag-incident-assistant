---
phase: 3
slug: screens-0-3-triage
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose 2>&1 | tail -20` |
| **Full suite command** | `npx vitest run 2>&1 | tail -30` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `npx vitest run 2>&1 | tail -30`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | F2 (No-Go Interstitial) | build | `npx tsc --noEmit 2>&1 \| head -20` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 1 | F3 (Einstieg) | build | `npx tsc --noEmit 2>&1 \| head -20` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 1 | F4 (Vorfall erfassen) | unit | `npx vitest run src/__tests__/wizard-schemas.test.ts 2>&1 \| tail -10` | ✅ | ⬜ pending |
| 3-04-01 | 04 | 1 | F5 (Klassifikation) | unit | `npx vitest run src/__tests__/severity.test.ts 2>&1 \| tail -10` | ❌ W0 | ⬜ pending |
| 3-04-02 | 04 | 1 | F5.2 (Schweregrad) | unit | `npx vitest run src/__tests__/severity.test.ts 2>&1 \| tail -10` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/severity.test.ts` — Tests für `calculateSeverity()` (alle Q1/Q2/Q3 Kombinationen, inkl. Q3="unbekannt" → KRITISCH)

*Existing infrastructure (vitest.config.ts, wizard-schemas.test.ts, wizard-reducer.test.ts) covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Amber-Styling No-Go Cards | NF2.2 | Visual check | Browse to localhost:3000, verify Screen 0 shows amber left-border cards |
| Hero Button Prominence | NF1.4 | Visual check | Verify "Shit Happens" button is large, navy, centered on Screen 1 |
| Auto-Timestamp fills current time | F4.1 | Browser interaction | Click "Jetzt eintragen" on Screen 2, verify datetime-local field populates |
| Meldefrist Banner visible | F4.6 | Visual check | Verify amber banner appears at top of Screen 2 |
| KRITISCH Alert für Eskalation | F5.4 | Browser interaction | Answer Q1=Ja on Screen 3, verify amber KRITISCH alert appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
