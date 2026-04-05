<!-- gsd:generated -->
# Testing

## Overview

The project uses [Vitest](https://vitest.dev/) with a jsdom environment. All 74 tests cover business logic, state management, schema validation, and utility functions. No component rendering tests (no snapshot tests or interaction tests) — the test suite focuses on pure logic.

## Running Tests

```bash
npm test                # Watch mode (default)
npx vitest run          # Single run, no watch
npx vitest run --coverage  # With coverage report
```

## Test Files

All tests live in `src/__tests__/`:

| File | What it tests | Count |
|------|--------------|-------|
| `severity.test.ts` | `calculateSeverity()` — triage severity logic | 7 |
| `wizard-reducer.test.ts` | `wizardReducer` — all action types and edge cases | ~15 |
| `wizard-schemas.test.ts` | Zod schema validation for each step | ~18 |
| `localStorage.test.ts` | `HYDRATE` action + JSON serialization/deserialization | ~10 |
| `playbook-data.test.ts` | `RANSOMWARE_PLAYBOOK` structure and integrity | ~8 |
| `deadline-logic.test.ts` | `computeDeadline()`, `formatDeadline()`, template generators | ~10 |
| `triage-logic.test.ts` | Integration: severity + schema validation together | ~6 |

## Test Structure

Tests use Vitest globals (`describe`, `it`, `expect` — no imports needed). The jsdom environment provides `localStorage` and DOM APIs.

### Severity Tests (`severity.test.ts`)

Tests the `calculateSeverity(q1, q2, q3)` function for all meaningful input combinations:

```ts
import { calculateSeverity } from '@/lib/wizard-schemas'

describe('calculateSeverity', () => {
  it('returns KRITISCH when Q1=ja (critical systems affected)', () => {
    expect(calculateSeverity('ja', 'nein', 'nein')).toBe('KRITISCH')
  })

  it('returns KRITISCH when Q3=unbekannt (worst-case assumption per D-01)', () => {
    expect(calculateSeverity('nein', 'nein', 'unbekannt')).toBe('KRITISCH')
  })

  it('returns HOCH when only Q2=ja (personal data affected)', () => {
    expect(calculateSeverity('nein', 'ja', 'nein')).toBe('HOCH')
  })
})
```

### Reducer Tests (`wizard-reducer.test.ts`)

Tests `wizardReducer` directly (exported as a named function from `WizardContext.tsx` — no React Provider needed):

```ts
import { wizardReducer } from '@/components/wizard/WizardContext'
import { initialState, MAX_STEP } from '@/lib/wizard-types'

it('NEXT_STEP: does not overflow beyond MAX_STEP', () => {
  const state = { ...initialState, currentStep: MAX_STEP }
  const result = wizardReducer(state, { type: 'NEXT_STEP' })
  expect(result.currentStep).toBe(MAX_STEP)
})
```

### Schema Validation Tests (`wizard-schemas.test.ts`)

Tests Zod schemas using `.parse()` and `.safeParse()`:

```ts
import { erfassenSchema } from '@/lib/wizard-schemas'

it('accepts valid full data', () => {
  const result = erfassenSchema.parse({
    erkennungszeitpunkt: '2026-04-03T09:00',
    erkannt_durch: 'it-mitarbeiter',
    betroffene_systeme: ['Server', 'Backups'],
    loesegeld_meldung: true,
  })
  expect(result.erkannt_durch).toBe('it-mitarbeiter')
})
```

### localStorage Tests (`localStorage.test.ts`)

Tests the `HYDRATE` action and JSON round-trip without mounting React components:

```ts
it('merges valid partial data onto initialState', () => {
  const savedData = { currentStep: 3, noGoConfirmed: true } as WizardState
  const result = wizardReducer(initialState, { type: 'HYDRATE', data: savedData })
  expect(result.currentStep).toBe(3)
  expect(result.einstieg).toBeNull()  // initialState fallback
})
```

### Deadline Logic Tests (`deadline-logic.test.ts`)

Tests `computeDeadline()`, `formatDeadline()`, and the three template generators:

```ts
import { computeDeadline, generateGLTemplate } from '@/lib/communication-templates'

it('adds 24 hours correctly', () => {
  const result = computeDeadline('2026-04-03T14:32:00.000Z', 24)
  expect(result.toISOString()).toBe('2026-04-04T14:32:00.000Z')
})
```

## Writing New Tests

### File location
Place new test files in `src/__tests__/` with the `.test.ts` suffix.

### Import style
Use the `@/` alias:

```ts
import { myFunction } from '@/lib/my-module'
```

### No imports needed for globals
`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` are available without imports (`globals: true` in `vitest.config.ts`).

### Testing pure logic (recommended approach)
Test business logic functions directly — no React mounting required. The wizard logic layer (`wizard-types.ts`, `wizard-schemas.ts`, `playbook-data.ts`, `communication-templates.ts`) is designed to be testable without a browser or React Provider.

### Testing with mocks (vi)
When testing localStorage-dependent code:

```ts
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
})
```

## Coverage

Run coverage locally:

```bash
npx vitest run --coverage
```

Key modules to keep covered:
- `src/lib/wizard-schemas.ts` — severity calculation and step schemas
- `src/lib/communication-templates.ts` — deadline computation and template generators
- `src/components/wizard/WizardContext.tsx` — reducer logic
- `src/lib/playbook-data.ts` — playbook structure integrity
