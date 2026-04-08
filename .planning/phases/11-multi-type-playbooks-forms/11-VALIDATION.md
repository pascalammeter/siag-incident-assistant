---
phase: 11
slug: multi-type-playbooks-forms
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 11 is **complete**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + React Testing Library 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test -- src/lib/playbook-data.test.ts` |
| **Full suite command** | `npm run test` |

---

## Sampling Rate

- **After every task commit:** `npm run test -- src/lib/playbook-data.test.ts src/components/wizard/steps/Step4Reaktion.test.tsx`
- **After every plan wave:** `npm run test` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| M1.1–M1.3 | 4 playbooks (Ransomware, Phishing, DDoS, Data Loss) each have 25 steps, 4 phases | unit | `npm run test -- src/lib/playbook-data.test.ts` | ✅ green |
| M1.4 | Step 4 loads correct playbook by incident_type | integration | `npm run test -- src/components/wizard/steps/Step4Reaktion.test.tsx` | ✅ green |
| M2.1–M2.3 | Form validates on blur, error shows below field with red border, required fields marked (*) | integration | `npm run test -- src/components/wizard/steps/Step2.test.tsx` | ✅ green |
| M2.4–M2.5 | Helper text displays below complex fields (multi-select, date) | integration | `npm run test -- src/components/wizard/steps/Step2.test.tsx` | ✅ green |
| P2.1–P2.4 | Save button shows spinner, is disabled, error toast shows, API errors mapped to user text | integration | `npm run test -- src/components/wizard/StepForm.test.tsx` | ✅ green |

---

## Wave 0 Gap Files Created

- [x] `src/lib/playbook-data.test.ts` — 4 playbooks, 25 steps each, required fields
- [x] `src/components/wizard/steps/Step4Reaktion.test.tsx` — dynamic playbook loading
- [x] `src/lib/error-messages.test.ts` — error message mapping
- [x] `src/components/wizard/StepForm.test.tsx` (extended) — onBlur validation, loading state, error toast
- [x] `src/components/FormField.test.tsx` — helper text, error text, required indicator

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gap files created (all 5 test files above)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete — all playbook and form validation tests green; phase verified
