---
phase: 2
slug: wizard-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` (installed in Phase 1) |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run --coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **Before marking phase complete:** Run `npm test -- --run --coverage` and verify >90% coverage on `wizardReducer`

---

## Wave 0 — Test Infrastructure

**Required before any implementation:**

- [ ] Vitest is installed and `npm test` runs (from Phase 1)
- [ ] `src/__tests__/` directory exists
- [ ] Sample test file passes: `vitest --run` exits 0

---

## Critical Test Coverage (Dimension 8 Requirements)

### 1. wizardReducer Unit Tests (`wizard-reducer.test.ts`)

All reducer actions must be tested with known inputs and expected outputs:

| Action | Test case | Expected |
|--------|-----------|----------|
| `NEXT_STEP` | currentStep=1 | currentStep=2 |
| `NEXT_STEP` | currentStep=6 | currentStep=6 (no overflow) |
| `PREV_STEP` | currentStep=2 | currentStep=1 |
| `PREV_STEP` | currentStep=0 | currentStep=0 (no underflow) |
| `GO_TO_STEP` | step=3 | currentStep=3 |
| `UPDATE_STEP` | stepKey='erfassen', data={} | state.erfassen={} |
| `CONFIRM_NO_GO` | any state | noGoConfirmed=true |
| `RESET` | any state | initialState |

**Coverage target:** 100% branch coverage on wizardReducer

### 2. localStorage Hydration Tests (`localStorage.test.ts`)

| Scenario | Expected |
|----------|----------|
| Valid serialized state | Correctly deserialized + dispatched |
| Corrupted JSON | Silently ignored (no error thrown) |
| Missing key | Wizard starts with initialState |
| State changes | Saved to localStorage after each dispatch |

### 3. Zod Schema Tests (`wizard-schemas.test.ts`)

Phase 2 schemas are empty placeholders — basic tests:

| Schema | Valid input | Expected |
|--------|-------------|---------|
| `einstiegSchema` | `{}` | No validation error |
| `erfassenSchema` | `{}` | No validation error |
| All 6 schemas | `{}` | No validation error |

---

## Acceptance Gate

Phase 2 is complete when:

- [ ] `npm test -- --run` exits 0 with all tests passing
- [ ] `wizardReducer` has ≥ 90% branch coverage
- [ ] 7 Placeholder-Screens render without errors in browser
- [ ] `npm run build` exits 0 (static export)
- [ ] localStorage persistence: entering data + F5 + data still visible
- [ ] Fortschrittsbar zeigt korrekten Schritt beim Navigieren

---

## Non-Test Verification

These are checked manually or via `npm run build`, not by test runner:

| Check | Method |
|-------|--------|
| No `next/*` imports in `components/wizard/` | `grep -r "from 'next" src/components/wizard/` → 0 results |
| `npm run build` passes | Exit code 0 |
| Placeholder screens clickable | Manual browser test |
| localStorage survives reload | Manual browser test |
