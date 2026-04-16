---
phase: 19
slug: wizard-resume-from-api
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-16
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (jsdom for components, node for API) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/__tests__/wizard-resume.test.ts --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/wizard-resume.test.ts --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "mapIncidentToWizardState"` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "type mapping"` | ❌ W0 | ⬜ pending |
| 19-01-03 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "severity mapping"` | ❌ W0 | ⬜ pending |
| 19-01-04 | 01 | 1 | W1.2 | T-UUID | UUID validated before API call | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "WizardProvider API fetch"` | ❌ W0 | ⬜ pending |
| 19-01-05 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "loading state"` | ❌ W0 | ⬜ pending |
| 19-01-06 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "step 1"` | ❌ W0 | ⬜ pending |
| 19-01-07 | 01 | 1 | W1.2 | — | 404 shows toast, redirects; no data leak | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "404"` | ❌ W0 | ⬜ pending |
| 19-01-08 | 01 | 1 | W1.2 | — | N/A | unit | `npx vitest run src/__tests__/wizard-resume.test.ts -t "fallback"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/wizard-resume.test.ts` — stubs covering W1.2-a through W1.2-h (mapping, provider fetch, loading, 404, fallback, step 1)
- [ ] Test fixtures in the same file: mock `Incident` objects covering complete, partial, and null-field variants

*Wave 0 must be committed before any implementation tasks begin.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/wizard?incident=<uuid>` renders LoadingSpinner then wizard at Step 1 | W1.2 | Requires browser + running API | Start dev server, create incident via API, navigate to `/wizard?incident=<id>`, verify spinner then Step 1 |
| IncidentList "Weiterbearbeiten" button opens wizard with correct ID | W2.2 | E2E browser flow | Open `/incidents`, click resume on existing incident, verify URL includes `?incident=<uuid>` |
| Offline fallback shows German toast | W1.4 | Requires network throttling | Open DevTools → Network → Offline, navigate to `/wizard?incident=<id>`, verify warning toast appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
