# Phase 3: Screens 0–3 (Triage) — Research

**Researched:** 2026-04-02
**Domain:** React form patterns (react-hook-form v7 + Zod v4), Tailwind v4 utility patterns, wizard navigation integration
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Q3 "Unbekannt" loest KRITISCH aus — worst-case assumption.
  Logik:
  ```
  if Q1 === "ja" || Q3 === "ja" || Q3 === "unbekannt" → KRITISCH
  else if Q2 === "ja" → HOCH
  else → MITTEL
  ```
- **D-02:** Die Severity wird gespeichert in `KlassifikationData`, nicht live berechnet.
- **D-03:** Exaktes Interface:
  ```typescript
  interface KlassifikationData {
    q1SystemeBetroffen: 'ja' | 'nein'
    q2PdBetroffen: 'ja' | 'nein'
    q3AngreiferAktiv: 'ja' | 'nein' | 'unbekannt'
    incidentType: 'ransomware' | 'phishing' | 'ddos' | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'
    severity: 'KRITISCH' | 'HOCH' | 'MITTEL'
  }
  ```
- **D-04:** Severity wird beim UPDATE_STEP fuer 'klassifikation' berechnet und direkt in `severity` gespeichert. Eine reine `calculateSeverity(q1, q2, q3)` Funktion kapselt die Logik (exportiert, testbar).
- **D-05:** `Step1Einstieg` verwendet keinen StepForm-Wrapper. Hero-Button und "Vorfall erfassen"-Link dispatchen `NEXT_STEP` direkt via `useWizard()`.
- **D-06:** `StepNavigator` zeigt auf Screen 1 nur "Zurueck" (zum Interstitial). "Weiter" kommt ueber den Hero-Button.
- **D-07:** Logik-Tests: `calculateSeverity()` + Zod-Schemas fuer `erfassen` und `klassifikation`. Kein Component-Rendering-Testing.

### Claude's Discretion
- Wie StepNavigator fuer Screen 1 die "Weiter"-Taste ausblenden soll (prop `showNext={false}` oder Bedingung in WizardShell).
- `ErfassenData` Interface-Struktur (Feldnamen fuer Datetime, Systeme, etc.) — aus REQUIREMENTS.md F4 ableiten.
- `datetime-local` Input-Handling (string in State, ISO-Format).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 3 replaces four placeholder step components with fully implemented, spec-compliant screens. The technical foundation from Phase 2 (WizardContext, StepForm, StepNavigator, WizardShell) is solid and tested — 117 tests green. The main work is filling in real field logic, wiring react-hook-form + Zod v4 to the existing StepForm wrapper, and implementing one non-standard pattern: pill-button toggle groups for Screen 3's decision tree.

The biggest integration challenge is Screen 1 (Einstieg), which must NOT use StepForm and must dispatch `NEXT_STEP` directly. WizardShell already hides StepNavigator on step 0; it needs a `showNext={false}` extension for step 1. StepNavigator already supports `showPrev`; adding `showNext` follows the same pattern cleanly.

Screen 3's decision tree requires `useWatch()` or `form.watch()` to reactively compute and display severity as the user selects answers. The severity value must be injected into form data before submit so it is stored in state per D-02.

**Primary recommendation:** Use `StepForm` + `useWatch()` for Screens 2 and 3. For Screen 1, call `dispatch({ type: 'NEXT_STEP' })` directly from button onClick. Add `showNext?: boolean` prop to StepNavigator and handle it in WizardShell per step.

---

## Standard Stack

### Core (already installed — verified from package.json and node_modules)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.72.0 | Form state, validation triggers, field registration | Already used in StepForm wrapper |
| zod | 4.3.6 | Schema validation, type inference | Already in use; v4 confirmed working |
| @hookform/resolvers | 5.2.2 | Bridges RHF + Zod | v5.2.2 supports Zod v3 AND v4 auto-detection |
| tailwindcss | 4.2.2 | Utility classes | @theme tokens already configured in globals.css |
| vitest | 4.1.2 | Unit test runner | Already configured, 117 tests passing |

### No New Dependencies Required

All libraries needed for Phase 3 are already installed. No `npm install` step needed.

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── lib/
│   ├── wizard-types.ts        # Add ErfassenData, KlassifikationData interfaces + IncidentType union
│   └── wizard-schemas.ts      # Fill erfassenSchema, klassifikationSchema + export calculateSeverity()
├── components/wizard/
│   ├── WizardShell.tsx        # Add showNext={false} for step 1
│   ├── StepNavigator.tsx      # Add showNext?: boolean prop
│   └── steps/
│       ├── StepInterstitial.tsx    # Replace placeholder with 8 rules + amber cards
│       ├── Step1Einstieg.tsx       # Remove StepForm, add hero button + direct dispatch
│       ├── Step2Erfassen.tsx       # Add full form with all F4 fields
│       └── Step3Klassifikation.tsx # Add 3-question tree + severity display
└── __tests__/
    └── triage-logic.test.ts   # New: calculateSeverity() + schema tests
```

### Pattern 1: StepForm Usage (Screens 2 and 3)

The existing `StepForm` wrapper handles form initialization, Zod resolver wiring, and submit dispatch in one place. Screens 2 and 3 pass the children render prop to access the `form` object for field registration, watching, and error access.

```typescript
// Source: src/components/wizard/StepForm.tsx (already in codebase)
<StepForm stepKey="erfassen" schema={erfassenSchema}>
  {(form) => (
    <>
      <input
        {...form.register('erkennungszeitpunkt')}
        type="datetime-local"
      />
      {form.formState.errors.erkennungszeitpunkt && (
        <p className="text-sm text-red-600 mt-1">
          {form.formState.errors.erkennungszeitpunkt.message}
        </p>
      )}
    </>
  )}
</StepForm>
```

**Key detail:** `StepForm` calls `dispatch({ type: 'UPDATE_STEP', stepKey, data })` then `dispatch({ type: 'NEXT_STEP' })` on submit. "Weiter" in StepNavigator calls `form.handleSubmit` indirectly — but currently StepNavigator's `onNext` calls WizardShell's `handleNext` which calls `dispatch({ type: 'NEXT_STEP' })` directly, bypassing RHF validation.

**CRITICAL WIRING ISSUE (see Pitfall 1 below):** The StepForm's `<form onSubmit={onSubmit}>` needs the submit button to be `type="submit"` inside the form, OR StepNavigator's "Weiter" button must trigger `form.requestSubmit()`. The current StepNavigator uses `type="button"` and calls WizardShell's `handleNext` which bypasses RHF. This must be resolved.

### Pattern 2: datetime-local Input Handling

`datetime-local` inputs return a string in the format `"2026-04-02T14:30"`. Store as string in state — no Date object conversion needed.

```typescript
// Register normally with RHF — value is always a string
<input
  {...form.register('erkennungszeitpunkt')}
  type="datetime-local"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white
             focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[44px]"
/>

// "Jetzt eintragen" button sets value programmatically
<button
  type="button"
  onClick={() => {
    const now = new Date()
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    form.setValue('erkennungszeitpunkt', localISO, { shouldValidate: true })
  }}
  className="bg-lightgray border border-navy text-navy px-4 py-2 rounded-lg
             text-sm font-bold min-h-[44px]"
>
  Jetzt eintragen
</button>
```

**Why `toISOString().slice(0, 16)` with offset correction:** `new Date().toISOString()` always returns UTC. For `datetime-local`, the browser expects local time. Subtracting `getTimezoneOffset() * 60000` before calling `toISOString()` converts to local time.

### Pattern 3: Multi-Select Checkboxes (Array of Strings)

`<input type="checkbox">` with RHF for an array field requires `form.register()` with the same field name for each checkbox. Zod schema uses `z.array(z.string()).default([])`.

```typescript
// Zod schema (verified working in Zod v4.3.6)
betroffene_systeme: z.array(z.string()).default([])

// In component — each checkbox registers into the same array field
{SYSTEME_OPTIONS.map((system) => (
  <label key={system.value} className="flex items-center gap-2">
    <input
      type="checkbox"
      value={system.value}
      {...form.register('betroffene_systeme')}
      className="w-5 h-5 rounded border-gray-300 accent-navy"
    />
    <span className="text-sm text-navy">{system.label}</span>
  </label>
))}
```

RHF automatically collects checked values into an array when multiple checkboxes share the same `register` name.

### Pattern 4: Pill Button Toggle Group (Screen 3 Questions)

The decision tree Q1/Q2/Q3 use custom pill buttons, not native radio inputs. Use `form.setValue()` + `form.watch()` to manage the selected value reactively.

```typescript
// In Screen 3 component (inside StepForm render prop):
const q1Value = form.watch('q1SystemeBetroffen')

// Hidden input for Zod validation
<input type="hidden" {...form.register('q1SystemeBetroffen')} />

// Pill buttons
{(['ja', 'nein'] as const).map((option) => (
  <button
    key={option}
    type="button"
    onClick={() => form.setValue('q1SystemeBetroffen', option, { shouldValidate: true })}
    className={
      q1Value === option
        ? 'bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px]'
        : 'bg-white border border-gray-300 text-navy px-6 py-3 rounded-lg font-normal min-h-[44px] hover:border-navy transition-colors'
    }
  >
    {option === 'ja' ? 'Ja' : option === 'nein' ? 'Nein' : 'Unbekannt'}
  </button>
))}
```

**Why `type="button"` is critical:** Without it, clicking a pill button submits the parent `<form>`.

### Pattern 5: Reactive Severity Display

Severity is computed from watched Q values and displayed live, but only stored on submit. The `calculateSeverity()` function is called during render using `watch()` values.

```typescript
// Inside StepForm render prop for Screen 3:
const q1 = form.watch('q1SystemeBetroffen')
const q2 = form.watch('q2PdBetroffen')
const q3 = form.watch('q3AngreiferAktiv')
const allAnswered = q1 && q2 && q3

// Inject computed severity into form before submit
// Use useEffect or compute directly in the form's defaultValues
// OR: pass a transform to onSubmit in StepForm
```

**Problem:** `StepForm.onSubmit` calls `dispatch({ type: 'UPDATE_STEP', stepKey, data })` where `data` is the raw RHF form values. Severity is not a form field the user fills in — it's computed. Solution: register a hidden field `severity` and update it with `form.setValue` whenever Q values change.

```typescript
// Register hidden severity field
<input type="hidden" {...form.register('severity')} />

// Update severity whenever Q values change (in a useEffect or via watch + setValue pattern)
// NOTE: Can also compute inline if the schema's default handles it
```

Alternatively, `StepForm` could accept an `onBeforeSubmit` transform. But given D-04 says "beim UPDATE_STEP berechnet", the cleanest approach without modifying StepForm is to store severity as a hidden field that gets populated via `form.setValue` before submit triggers. Use `useEffect` watching `[q1, q2, q3]`.

### Pattern 6: StepNavigator showNext Prop

`StepNavigator` already accepts `showPrev?: boolean`. The same pattern applies for `showNext`.

```typescript
// StepNavigator.tsx — add prop:
interface StepNavigatorProps {
  // ...existing...
  showNext?: boolean   // NEW
}

// In render: wrap the Weiter button
{(showNext ?? true) && (
  <button type="button" onClick={onNext} ...>
    {resolvedNextLabel}
  </button>
)}
// If showNext=false, render a spacer div to maintain layout
```

In `WizardShell.tsx`:
```typescript
<StepNavigator
  currentStep={state.currentStep}
  onNext={handleNext}
  onPrev={handlePrev}
  showPrev={state.currentStep > MIN_STEP}
  showNext={state.currentStep !== 1}   // Hide "Weiter" on Step 1
  nextLabel={state.currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter'}
/>
```

### Pattern 7: StepForm Submit Wiring (The Critical Fix)

Currently, StepNavigator's "Weiter" button calls WizardShell's `handleNext` (which dispatches `NEXT_STEP` directly), bypassing StepForm's `handleSubmit` and Zod validation. This is intentional in Phase 2 with empty schemas — but Phase 3 adds real validation, so validation must fire.

**The cleanest solution** without restructuring WizardShell: Make the "Weiter" button inside StepForm a `type="submit"` button rendered by the children, instead of relying on StepNavigator. But StepNavigator is outside StepForm in the JSX hierarchy.

**Alternative — form ref approach:**
StepForm exposes a `ref` to a submit trigger, or StepNavigator is moved inside StepForm. Both require structural changes.

**Simplest correct solution:** Move StepNavigator inside the `<form>` element in StepForm, passing it via render prop or a dedicated prop. Then the "Weiter" button becomes `type="submit"`, which triggers RHF validation. This is the most idiomatic RHF pattern.

OR, even simpler: StepForm accepts a `submitRef` (a `React.RefObject<HTMLFormElement>`) and StepNavigator's onNext calls `submitRef.current?.requestSubmit()`.

**Recommended approach (least invasive):** Add a `formRef` to `StepForm` using `React.useRef`, expose it via a callback or ref-forwarding, and have WizardShell call `formRef.current.requestSubmit()` instead of dispatching `NEXT_STEP` directly for form-based steps. See Pitfall 1 for full analysis.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Array checkbox state | Manual useState array toggle | `form.register('field')` on each checkbox | RHF automatically collects checked values |
| Form validation timing | Manual blur/submit state tracking | Zod schema via zodResolver | Handles all edge cases including re-validation |
| Pill button state | useState per question | `form.watch()` + `form.setValue()` | Keeps single source of truth in RHF |
| Severity computation | Derived state in reducer | `calculateSeverity()` pure function called at submit | Pure function is testable; avoids recompute-on-every-render issues |
| Datetime formatting | Moment.js / date-fns | Native JS Date + `.toISOString().slice(0,16)` | No new dependency, one-liner |
| localStorage persistence | Custom hook | Already handled by WizardContext + HYDRATE | Phase 2 implementation already covers it |

---

## Common Pitfalls

### Pitfall 1: StepNavigator "Weiter" Bypasses RHF Validation
**What goes wrong:** Clicking "Weiter" in StepNavigator calls `handleNext` in WizardShell which dispatches `NEXT_STEP` directly. StepForm's `handleSubmit` (which runs Zod validation) never fires. User can advance with empty required fields.
**Why it happens:** StepNavigator renders outside the `<form>` element in StepForm. "Weiter" is `type="button"`, not `type="submit"`.
**How to avoid:** The "Weiter" button for form-based steps must trigger `form.handleSubmit`. Two viable approaches:
  1. Pass a `onSubmitRef` from StepForm up through WizardShell and call `formRef.current?.requestSubmit()` in `handleNext`.
  2. Render StepNavigator's "Weiter" as a `type="submit"` button inside the `<form>` — requires restructuring StepForm to accept navigator props.
**Recommended:** Approach 2 — pass `showPrev`, `prevLabel`, `onPrev`, `showNext`, `nextLabel` as props into StepForm; render StepNavigator inside `<form>`. Clean, no imperative refs. WizardShell no longer renders StepNavigator for steps 2+.
**Warning signs:** Form advances when fields are empty and no error messages appear.

### Pitfall 2: datetime-local UTC vs Local Time in "Jetzt eintragen"
**What goes wrong:** `new Date().toISOString()` returns UTC time, e.g. `"2026-04-02T12:30:00Z"`. The `datetime-local` input shows UTC time, not the user's local time. In Switzerland (UTC+2), this shows 2h behind.
**Why it happens:** `toISOString()` always outputs UTC.
**How to avoid:** Use `new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)` to get local time as ISO string.
**Warning signs:** Timestamp shown is wrong by the UTC offset amount.

### Pitfall 3: Zod v4 Array Default with RHF Checkboxes
**What goes wrong:** If `betroffene_systeme` has no default in Zod schema and no initialValue in RHF, unchecked state returns `undefined` instead of `[]`. Downstream code expecting an array crashes.
**How to avoid:** Always declare `z.array(z.string()).default([])` in the schema AND ensure RHF `defaultValues` includes the field (StepForm passes `state[stepKey]` as defaultValues — if state is `null` initially, it falls back to `{}`, so the Zod default handles it on parse).
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'length')` when iterating systems array.

### Pitfall 4: Pill Buttons Accidentally Submit Form
**What goes wrong:** A pill button without `type="button"` inside a `<form>` element triggers form submission when clicked.
**How to avoid:** Every pill button and non-submit button inside a form must have `type="button"` explicitly.
**Warning signs:** Form submits (page refresh or step advances) when clicking Q1/Q2/Q3 answer buttons.

### Pitfall 5: Zod v4 Error Access Changed from `.errors` to `.issues`
**What goes wrong:** Code written for Zod v3 accesses `error.errors[0]`. In Zod v4, the property is `error.issues[0]`.
**Why it happens:** Zod v4 renamed the property. @hookform/resolvers v5 handles this internally, but any custom error-handling code must use `.issues`.
**How to avoid:** In test files and custom error handling, always use `e.issues` not `e.errors`.
**Warning signs:** `TypeError: Cannot read properties of undefined (reading '0')` when accessing caught ZodError.

### Pitfall 6: Severity Hidden Field — Must Be Registered Before Submit
**What goes wrong:** If `severity` is set via `form.setValue()` but not registered with `form.register()`, RHF excludes it from the submit data. The dispatched `UPDATE_STEP` data will lack `severity`.
**How to avoid:** Always include `<input type="hidden" {...form.register('severity')} />` in the Screen 3 JSX. The Zod schema must include `severity` as a required field, so validation fails if it's missing (which protects against accidental bypass).
**Warning signs:** `state.klassifikation.severity` is `undefined` after Screen 3 submit.

### Pitfall 7: StepInterstitial Uses `bg-amber-50` (Tailwind v3 Class)
**What goes wrong:** The existing placeholder uses `bg-amber-50` (Tailwind v3 syntax). In Tailwind v4 with custom `@theme`, the correct token is `bg-amber/10` (opacity modifier on custom color).
**How to avoid:** Use `bg-amber/10` for amber backgrounds per the UI-SPEC and existing project patterns.
**Warning signs:** Warning card background does not render (transparent or wrong color).

---

## Code Examples

Verified patterns from project source code and tested in Node.js:

### ErfassenData Interface (Claude's Discretion — derived from F4 + UI-SPEC)
```typescript
// src/lib/wizard-types.ts
export interface ErfassenData {
  erkennungszeitpunkt: string              // datetime-local string, e.g. "2026-04-02T14:30"
  erkannt_durch: 'it-mitarbeiter' | 'nutzer' | 'externes-system' | 'angreifer-kontakt' | 'sonstiges'
  betroffene_systeme: string[]             // array of selected option values
  erste_auffaelligkeiten?: string          // optional textarea
  loesegeld_meldung: boolean               // ransomware checkbox
}

export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'
```

### erfassenSchema (Zod v4 — verified working)
```typescript
// src/lib/wizard-schemas.ts
export const erfassenSchema = z.object({
  erkennungszeitpunkt: z.string().min(1, 'Bitte geben Sie ein gueltiges Datum und eine Uhrzeit ein.'),
  erkannt_durch: z.enum([
    'it-mitarbeiter', 'nutzer', 'externes-system', 'angreifer-kontakt', 'sonstiges'
  ], { error: 'Bitte waehlen Sie eine Option.' }),
  betroffene_systeme: z.array(z.string()).default([]),
  erste_auffaelligkeiten: z.string().optional(),
  loesegeld_meldung: z.boolean().default(false),
})
```

### klassifikationSchema + calculateSeverity (verified working)
```typescript
// src/lib/wizard-schemas.ts
export function calculateSeverity(
  q1: 'ja' | 'nein',
  q2: 'ja' | 'nein',
  q3: 'ja' | 'nein' | 'unbekannt'
): 'KRITISCH' | 'HOCH' | 'MITTEL' {
  if (q1 === 'ja' || q3 === 'ja' || q3 === 'unbekannt') return 'KRITISCH'
  if (q2 === 'ja') return 'HOCH'
  return 'MITTEL'
}

export const klassifikationSchema = z.object({
  q1SystemeBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte waehlen Sie eine Option.' }),
  q2PdBetroffen: z.enum(['ja', 'nein'], { error: 'Bitte waehlen Sie eine Option.' }),
  q3AngreiferAktiv: z.enum(['ja', 'nein', 'unbekannt'], { error: 'Bitte waehlen Sie eine Option.' }),
  incidentType: z.enum([
    'ransomware', 'phishing', 'ddos', 'datenverlust', 'unbefugter-zugriff', 'sonstiges'
  ]),
  severity: z.enum(['KRITISCH', 'HOCH', 'MITTEL']),
})
```

### Zod v4 Error Message Option Name
```typescript
// Zod v4: the option for custom error messages is { error: '...' }
// NOT { message: '...' } (that was Zod v3)
z.enum(['ja', 'nein'], { error: 'Bitte waehlen Sie eine Option.' })
z.string().min(1, 'Dieses Feld ist erforderlich.')  // positional string still works for string validators
```

**Note:** Verified in project Node.js environment. The positional string argument for `min()` still works in Zod v4. For `z.enum()`, use `{ error: '...' }` object form.

### Existing Amber Card Pattern (from StepInterstitial placeholder, corrected to v4 syntax)
```typescript
// CORRECT (Tailwind v4 token):
<div className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4">

// WRONG (v3 syntax still in placeholder):
<div className="border-l-4 border-amber bg-amber-50 p-4 rounded-r-lg">
```

### No-Go Rule Card Constants
```typescript
// To be defined as const array in StepInterstitial.tsx or a separate constants file
const NO_GO_RULES = [
  'Systeme nicht neu starten — Beweise gehen verloren',
  'Kein Loesegeld zahlen — keine Garantie fuer Entschluesselung',
  'Keinen Kontakt mit Angreifern ohne juristischen Beistand',
  'Keine Bereinigung vor der forensischen Sicherung',
  'Keine Logdateien loeschen oder ueberschreiben',
  'Vorfall nicht vertuschen — Meldepflichten beachten',
  'Backups sofort isolieren — nicht auf infizierte Systeme zugreifen',
  'Normale Arbeit sofort stoppen — Schadensbegrenzung priorisieren',
]
```

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all required tools already installed in project).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/__tests__/triage-logic.test.ts` |
| Full suite command | `npx vitest run` |

**Current state:** 117 tests passing across 12 test files. Test infrastructure fully operational.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-04 / D-01 | `calculateSeverity()` Q3="unbekannt" → KRITISCH | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-04 / D-01 | `calculateSeverity()` Q1="ja" → KRITISCH | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-04 / D-01 | `calculateSeverity()` Q2="ja" only → HOCH | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-04 / D-01 | `calculateSeverity()` all nein → MITTEL | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-07 | `erfassenSchema` rejects missing required fields | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-07 | `erfassenSchema` accepts valid full payload | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-07 | `klassifikationSchema` rejects missing severity | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-07 | `klassifikationSchema` accepts all valid combinations | unit | `npx vitest run src/__tests__/triage-logic.test.ts` | ❌ Wave 0 |
| D-07 | Existing schemas (einstieg etc.) still accept empty object | unit | `npx vitest run` | ✅ |

**Note:** All Phase 3 tests go in one new file: `src/__tests__/triage-logic.test.ts`. This file covers `calculateSeverity` and schema validation. Existing `wizard-schemas.test.ts` will need updating once `erfassenSchema` and `klassifikationSchema` are no longer empty objects (the test `schema.parse({})` will fail for required fields).

### Sampling Rate

- **Per task commit:** `npx vitest run src/__tests__/triage-logic.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/triage-logic.test.ts` — covers calculateSeverity (all 5 combinations) + erfassenSchema + klassifikationSchema
- [ ] Update `src/__tests__/wizard-schemas.test.ts` — remove/adjust the `erfassenSchema accepts empty object` and `klassifikationSchema accepts empty object` tests once real schemas are in place (or move them to triage-logic.test.ts)

---

## Open Questions

1. **StepForm submit wiring — which approach to implement**
   - What we know: Current StepNavigator "Weiter" bypasses RHF validation for form-based steps
   - What's unclear: Whether to (a) move StepNavigator inside StepForm's `<form>`, (b) use `formRef.requestSubmit()`, or (c) accept StepForm an `onPrev`/navigation props
   - Recommendation: Move StepNavigator inside StepForm for steps 2/3 (render it from the children prop or via additional props). This keeps the form as the authority on submission. WizardShell only renders StepNavigator for non-form steps (0, 1).

2. **wizard-schemas.test.ts will break after schema fill**
   - What we know: Existing test `erfassenSchema.parse({})` expects `{}` to parse successfully. After adding required fields, this will fail.
   - What's unclear: Whether to update the old test file in the same task as the schema fill, or in a dedicated test-update task.
   - Recommendation: Update `wizard-schemas.test.ts` in the same plan task that fills the schemas. Create `triage-logic.test.ts` as a separate task.

---

## Sources

### Primary (HIGH confidence)
- Source code inspection: `src/components/wizard/StepForm.tsx` — confirmed existing submit pattern
- Source code inspection: `src/components/wizard/StepNavigator.tsx` — confirmed `showPrev` prop pattern for `showNext` extension
- Source code inspection: `src/components/wizard/WizardShell.tsx` — confirmed step routing and navigator rendering
- Source code inspection: `src/components/wizard/WizardContext.tsx` — confirmed `UPDATE_STEP` + `NEXT_STEP` dispatch pattern
- Node.js runtime verification: Zod v4.3.6 `z.array().default([])`, `z.enum()`, `z.string().min()` — all confirmed working
- Node.js runtime verification: `calculateSeverity()` logic — all 5 combinations verified correct
- `@hookform/resolvers` v5.2.2 source: confirmed auto-detection of Zod v3 vs v4 via `_zod in schema` check
- Vitest run: 117 tests passing — confirmed baseline

### Secondary (MEDIUM confidence)
- `@hookform/resolvers/zod/src/zod.ts` — Zod v4 support confirmed via source code inspection (uses `z4.$ZodError` and `_zod` check)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from package.json and node_modules
- Architecture: HIGH — all patterns verified against existing source code
- Pitfalls: HIGH — Pitfalls 1, 2, 3, 4, 6, 7 verified directly from code inspection and runtime tests
- Zod v4 API: HIGH — verified in project's actual Node.js runtime

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable libraries, 30-day window)
