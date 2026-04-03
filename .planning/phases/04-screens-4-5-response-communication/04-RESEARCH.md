# Phase 4: Screens 4-5 (Response & Communication) - Research

**Researched:** 2026-04-03
**Domain:** React component implementation, Swiss legal deadline logic, Clipboard API, TypeScript data modeling
**Confidence:** HIGH

## Summary

Phase 4 replaces placeholder components for Step4Reaktion and Step5Kommunikation with fully implemented screens. The existing codebase provides a mature, well-established pattern from Phases 2-3: `StepForm` wrapper with react-hook-form + Zod, `useWizard()` for state access, `StepNavigator` with `isNextDisabled` prop, and consistent Tailwind v4 styling tokens. The UI-SPEC provides pixel-precise component contracts.

The core technical challenges are: (1) modeling the 25-step ransomware playbook as extensible TypeScript constants, (2) integrating checklist state with the existing wizard reducer without breaking form submission flow, (3) computing legal deadlines from `erkennungszeitpunkt`, and (4) implementing Clipboard API with graceful fallback. All of these are straightforward given the existing infrastructure.

**Primary recommendation:** Follow the established Phase 3 patterns exactly (inner form component, `useWizard()` for cross-screen data, pill buttons via `form.setValue`). Screen 4 needs custom checkbox-array state management outside the standard StepForm submit flow. Screen 5 reuses the pill-button pattern from Screen 3 for Meldepflicht questions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Checklist progress stored in `ReaktionData.completedSteps: string[]` in WizardState, persisted via localStorage
- **D-02:** Playbook data as TypeScript constants in `src/lib/playbook-data.ts`, extensible for future incident types (NF5.2)
- **D-03:** "Weiter" button on Screen 4 disabled until all 25 steps checked (greyed out, no toast)
- **D-04:** Back navigation always possible on Screen 4 (no gate)
- **D-05:** Countdown basis = `erkennungszeitpunkt` from ErfassenData. ISG: +24h, DSG: "so schnell wie moeglich", FINMA: +24h/+72h
- **D-06:** Static deadline display (no live ticking). Format: "Frist bis: Freitag, 04. Apr 2026 14:32 Uhr"
- **D-07:** 3 Meldepflicht questions determine which deadlines show. Stored in KommunikationData
- **D-08:** Editable textareas with pre-filled templates. Dynamic data from wizard state + static `[Platzhalter]` brackets. "Kopieren" button per template
- **D-09:** SIAG CTA with static contact info (placeholder). No mailto/tel links

### Claude's Discretion
- Exact structure of KommunikationData interface fields
- Whether edited template texts persist in KommunikationData or remain local state
- Visual design of role badges (consistent with design system)
- Exact Tailwind classes for disabled button state on Screen 4
- Ordering/grouping of Kommunikationsbausteine on Screen 5

### Deferred Ideas (OUT OF SCOPE)
- KI-gestuetzte Vorlage-Befuellung (future platform integration)
- Additional incident types beyond Ransomware (future milestones)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| F6.1 | 25-Punkte Checkliste in 4 Phasen | Playbook data model in `playbook-data.ts`, phase grouping via `PlaybookPhase` type |
| F6.2 | Checkboxen mit Abhaklogik | `completedSteps: string[]` in ReaktionData, checkbox toggle dispatches UPDATE_STEP |
| F6.3 | No-Go-Hinweise inline (amber box) | Reuse `border-l-4 border-amber bg-amber/10` pattern from Phase 3 interstitial |
| F6.4 | Verantwortlichkeiten sichtbar (Rollen) | Role badge component `bg-navy/10 text-navy` per UI-SPEC S4-06 |
| F6.5 | Fortschrittszaehler | Progress counter + bar per UI-SPEC S4-02 |
| F7.1 | 3-Fragen Meldepflicht-Check | Pill button pattern from Screen 3, deadline computation from erkennungszeitpunkt |
| F7.2 | Meldepflichten mit Fristanzeige | Deadline cards (S5-03/S5-04), `toLocaleString('de-CH')` formatting |
| F7.3 | Kommunikations-Checkliste | Simple checkbox list (S5-05), 6 items |
| F7.4 | Kommunikationsbausteine (Textvorlagen) | Editable textareas with Clipboard API copy (S5-06/S5-07) |
| F7.5 | SIAG-Berater CTA | Static contact block (S5-08), placeholder data |
| NF1.1 | Stress-taugliche Sprache | All copy from UI-SPEC Copywriting Contract |
| NF1.4 | Grosse Touch-Targets | `min-h-[44px]` on all interactive elements |
| NF5.2 | Playbook als separate TS-Konstanten | Extensible data structure in `playbook-data.ts` |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.4 | UI framework | Already in project |
| react-hook-form | 7.72.0 | Form state management | Already in project, used in StepForm |
| zod | 4.3.6 | Schema validation | Already in project, used for step schemas |
| tailwindcss | 4.2.2 | Styling | Already in project, v4 with @theme |
| next | 16.2.2 | Framework | Already in project |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 5.2.2 | Zod-RHF bridge | Already used in StepForm |
| vitest | 4.1.2 | Testing | Unit tests for playbook data + deadline logic |
| @testing-library/react | 16.3.2 | Component testing | If component tests are needed |

### No New Dependencies Needed
This phase requires zero new npm packages. All functionality is achievable with existing dependencies plus browser-native APIs (Clipboard API, Date).

## Architecture Patterns

### Recommended File Structure
```
src/
  lib/
    playbook-data.ts          # NEW: 25 ransomware steps, 4 phases, roles, no-go flags
    wizard-types.ts            # UPDATE: ReaktionData + KommunikationData interfaces
    wizard-schemas.ts          # UPDATE: reaktionSchema + kommunikationSchema with real fields
    communication-templates.ts # NEW: 3 text templates with placeholder logic
  components/
    wizard/
      steps/
        Step4Reaktion.tsx      # REPLACE: Full checklist implementation
        Step5Kommunikation.tsx # REPLACE: Meldepflicht + Kommunikation implementation
```

### Pattern 1: Playbook Data as TypeScript Constants
**What:** Typed constant arrays for the 25 ransomware response steps, grouped into 4 phases
**When to use:** Any structured reference data that needs to be extensible for future incident types
**Example:**
```typescript
// src/lib/playbook-data.ts
export interface PlaybookStep {
  id: string                    // Unique ID e.g. "sofort-01"
  text: string                  // Step description
  role: 'IT-Leiter' | 'CISO' | 'CEO' | 'Forensik'
  noGoWarning?: string          // If present, renders amber box
}

export interface PlaybookPhase {
  id: string
  title: string                 // e.g. "Phase 1: Sofortmassnahmen"
  steps: PlaybookStep[]
}

export interface Playbook {
  incidentType: string
  phases: PlaybookPhase[]
}

export const RANSOMWARE_PLAYBOOK: Playbook = {
  incidentType: 'ransomware',
  phases: [
    {
      id: 'sofort',
      title: 'Phase 1: Sofortmassnahmen',
      steps: [ /* ... */ ]
    },
    // ... 3 more phases
  ]
}

// Extensibility: future playbooks can be added here
export const PLAYBOOKS: Record<string, Playbook> = {
  ransomware: RANSOMWARE_PLAYBOOK,
}
```

### Pattern 2: Screen 4 Checklist State (bypass StepForm submit)
**What:** Screen 4 is unique because it does NOT follow the standard "fill form -> submit -> NEXT_STEP" flow. Instead, each checkbox toggle immediately dispatches `UPDATE_STEP` to persist progress. The "Weiter" button is gated by completion count.
**When to use:** When step data is incrementally built rather than submitted as a batch
**Example:**
```typescript
// Inside Step4Reaktion
function Step4Content() {
  const { state, dispatch } = useWizard()
  const completedSteps: string[] = (state.reaktion as ReaktionData)?.completedSteps ?? []

  const toggleStep = (stepId: string) => {
    const next = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId]
    dispatch({ type: 'UPDATE_STEP', stepKey: 'reaktion', data: { completedSteps: next } })
  }

  const totalSteps = RANSOMWARE_PLAYBOOK.phases.reduce((sum, p) => sum + p.steps.length, 0)

  return (
    <>
      {/* Progress + Checklist */}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => dispatch({ type: 'NEXT_STEP' })}
        onPrev={() => dispatch({ type: 'PREV_STEP' })}
        isNextDisabled={completedSteps.length < totalSteps}
      />
    </>
  )
}
```
**Key insight:** Screen 4 should NOT use the `<StepForm>` wrapper because StepForm ties navigation to form submission. Screen 4 needs manual StepNavigator + direct dispatch. This is the main architectural divergence from Screens 2-3.

### Pattern 3: Screen 5 Hybrid (StepForm for questions + manual sections)
**What:** Screen 5 has two distinct interaction modes: (a) Meldepflicht questions that fit the pill-button + Zod pattern, and (b) communication templates/checklists that are supplementary
**When to use:** When a screen mixes validated form data with auxiliary interactive content
**Recommendation:** Use `<StepForm>` for the Meldepflicht questions (they need validation before proceeding to Screen 6). The Kommunikations-Checkliste and Kommunikationsbausteine can be additional sections within the form's children. Template edits should persist in KommunikationData for consistency with the localStorage pattern.

### Pattern 4: Deadline Computation
**What:** Pure function that computes deadline timestamps from `erkennungszeitpunkt`
**When to use:** Meldepflicht deadline display on Screen 5
**Example:**
```typescript
export function computeDeadline(erkennungszeitpunkt: string, hoursToAdd: number): Date {
  const base = new Date(erkennungszeitpunkt)
  return new Date(base.getTime() + hoursToAdd * 60 * 60 * 1000)
}

export function formatDeadline(date: Date): string {
  return date.toLocaleString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' Uhr'
}
```
**Key detail from UI-SPEC:** `toLocaleString('de-CH', ...)` with the exact options specified in S5-03. The "Uhr" suffix is appended manually.

### Pattern 5: Clipboard API with Fallback
**What:** Copy-to-clipboard with inline success/error feedback
**Example:**
```typescript
const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')

async function handleCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    setCopyState('success')
  } catch {
    setCopyState('error')
  }
  setTimeout(() => setCopyState('idle'), 2000)
}
```
**Note:** `navigator.clipboard.writeText()` requires a secure context (HTTPS or localhost). Vercel deployments are HTTPS, local dev is localhost -- both work.

### Anti-Patterns to Avoid
- **Using StepForm for Screen 4:** StepForm ties "Weiter" to form submission. Screen 4 needs manual navigation gating based on checkbox count, not form validity.
- **Live countdown timer:** D-06 explicitly says static deadline, no ticking. Do not use `setInterval`.
- **Toast notifications for copy:** UI-SPEC S5-07 specifies inline button text change only. No toast/snackbar.
- **Separate state for templates:** Template edits should persist in KommunikationData via wizard state, not in isolated `useState`. This ensures localStorage persistence across page reloads.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod schema + react-hook-form | Already established pattern, consistent with other screens |
| State persistence | Custom localStorage logic | Existing WizardContext + UPDATE_STEP dispatch | Already handles serialization, hydration, SSR safety |
| Date formatting | Custom date formatter | `Date.toLocaleString('de-CH', options)` | Browser-native, locale-aware, handles Swiss German formatting |
| Clipboard | Custom clipboard polyfill | `navigator.clipboard.writeText()` | Supported in all modern browsers, Vercel = HTTPS |

**Key insight:** The wizard infrastructure from Phase 2 handles all state management complexity. Phase 4 only needs to define the right data shapes and dispatch UPDATE_STEP at the right moments.

## Common Pitfalls

### Pitfall 1: StepForm Submit Conflict on Screen 4
**What goes wrong:** Using `<StepForm>` for Screen 4 means "Weiter" triggers form submission and auto-advances. But Screen 4 needs the button disabled until 25/25.
**Why it happens:** Copying the pattern from Screens 2-3 without recognizing Screen 4's different interaction model.
**How to avoid:** Screen 4 manages its own `<StepNavigator>` directly, without `<StepForm>`. Dispatch `NEXT_STEP` manually only when `completedSteps.length === totalSteps`.
**Warning signs:** "Weiter" button advances despite incomplete checklist.

### Pitfall 2: erkennungszeitpunkt Missing or Invalid
**What goes wrong:** User navigates directly to Screen 5 (via URL or localStorage state) without completing Screen 2.
**Why it happens:** The wizard allows back-navigation; state may be partially filled.
**How to avoid:** Check `state.erfassen?.erkennungszeitpunkt` before computing deadlines. Show amber warning per UI-SPEC empty state: "Erkennungszeitpunkt nicht erfasst. Bitte Schritt 2 vervollstaendigen."
**Warning signs:** `NaN` in deadline display, "Invalid Date" text.

### Pitfall 3: Checkbox State Not Persisting After Navigation
**What goes wrong:** User checks 15 items, goes back to Screen 3, returns to Screen 4, and all checks are gone.
**Why it happens:** State stored only in component `useState` instead of wizard state.
**How to avoid:** Every checkbox toggle dispatches `UPDATE_STEP` to wizard state immediately. Read initial state from `state.reaktion?.completedSteps` on mount.
**Warning signs:** Checks disappear on back/forward navigation.

### Pitfall 4: Zod Schema Mismatch for Partial Data
**What goes wrong:** Screen 4's reaktionSchema requires `completedSteps` to have exactly 25 items, preventing save of partial progress.
**Why it happens:** Overly strict Zod validation.
**How to avoid:** `reaktionSchema` should accept `z.object({ completedSteps: z.array(z.string()) })` without length constraint. The navigation gate (isNextDisabled) handles the 25-check requirement, not the schema.
**Warning signs:** Zod validation errors when toggling checkboxes.

### Pitfall 5: Template Text Losing Dynamic Data on Edit
**What goes wrong:** User edits a template, their changes are lost because the component re-renders with the original template text.
**Why it happens:** Template text is re-computed from wizard state on every render, overwriting user edits.
**How to avoid:** Initialize textarea value once from template, then store edits in state. Only use the template as `defaultValue`, not as controlled `value` derived from wizard state.
**Warning signs:** User edits reset when other parts of the screen change.

### Pitfall 6: Tailwind v4 Color Token Names
**What goes wrong:** Using `bg-siag-navy` or `bg-[#1a2e4a]` instead of the theme tokens.
**Why it happens:** Not checking globals.css @theme block.
**How to avoid:** Use `bg-navy`, `text-navy`, `bg-lightgray`, `bg-amber`, `border-amber` -- the tokens defined in @theme. Confirmed in STATE.md decision [02-05].
**Warning signs:** Colors don't match other screens.

## Code Examples

### KommunikationData Interface (Recommended)
```typescript
// wizard-types.ts
export interface KommunikationData {
  // Meldepflicht questions (pill buttons)
  kritischeInfrastruktur: 'ja' | 'nein' | null
  personendatenBetroffen: 'ja' | 'nein' | null
  reguliertesUnternehmen: 'ja' | 'nein' | null
  // Kommunikations-Checkliste
  kommChecklist: string[]  // Array of checked item IDs
  // Template edits (persisted for reload)
  templateGL?: string
  templateMitarbeitende?: string
  templateMedien?: string
}
```

### ReaktionData Interface (Locked by D-01)
```typescript
// wizard-types.ts
export interface ReaktionData {
  completedSteps: string[]  // Array of step IDs
}
```

### reaktionSchema (Permissive for Partial Progress)
```typescript
// wizard-schemas.ts
export const reaktionSchema = z.object({
  completedSteps: z.array(z.string()).default([]),
})
```

### kommunikationSchema
```typescript
// wizard-schemas.ts
export const kommunikationSchema = z.object({
  kritischeInfrastruktur: z.enum(['ja', 'nein']).nullable().default(null),
  personendatenBetroffen: z.enum(['ja', 'nein']).nullable().default(null),
  reguliertesUnternehmen: z.enum(['ja', 'nein']).nullable().default(null),
  kommChecklist: z.array(z.string()).default([]),
  templateGL: z.string().optional(),
  templateMitarbeitende: z.string().optional(),
  templateMedien: z.string().optional(),
})
```

### Template Generation Function
```typescript
// src/lib/communication-templates.ts
import type { WizardState } from './wizard-types'

export function generateGLTemplate(state: WizardState): string {
  const zeit = state.erfassen?.erkennungszeitpunkt
    ? new Date(state.erfassen.erkennungszeitpunkt).toLocaleString('de-CH', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '[Datum/Uhrzeit]'
  const severity = state.klassifikation?.severity ?? '[Schweregrad]'
  const systeme = state.erfassen?.betroffene_systeme?.join(', ') || '[Betroffene Systeme]'

  return `Sehr geehrte Geschaeftsleitung,

am ${zeit} wurde ein Sicherheitsvorfall der Stufe ${severity} erkannt.

Betroffene Systeme: ${systeme}
Incident-Typ: ${state.klassifikation?.incidentType ?? 'Ransomware'}

Sofortmassnahmen wurden eingeleitet. Die Checkliste wird aktuell abgearbeitet.

Naechste Schritte:
- Forensische Sicherung laeuft
- Meldepflichten werden geprueft
- SIAG-Berater werden einbezogen

Ansprechpartner: [Name des Ansprechpartners]
Kontakt: [Ihre E-Mail] / [Telefonnummer]

[Firmenname]`
}
```

### Deadline Display Logic
```typescript
// Inside Step5Kommunikation
const erkennungszeitpunkt = state.erfassen?.erkennungszeitpunkt

const deadlines = []
if (kommunikation?.kritischeInfrastruktur === 'ja' && erkennungszeitpunkt) {
  deadlines.push({
    law: 'ISG — NCSC-Meldung',
    deadline: computeDeadline(erkennungszeitpunkt, 24),
    badge: '24h',
  })
}
if (kommunikation?.personendatenBetroffen === 'ja') {
  deadlines.push({
    law: 'DSG/DSGVO — FDPIC-Meldung',
    deadline: null, // No fixed deadline
    text: 'So schnell wie moeglich',
    note: 'Keine feste Frist — unverzueglich nach Kenntnis.',
  })
}
if (kommunikation?.reguliertesUnternehmen === 'ja' && erkennungszeitpunkt) {
  deadlines.push(
    { law: 'FINMA — Informelle Meldung', deadline: computeDeadline(erkennungszeitpunkt, 24), badge: '24h' },
    { law: 'FINMA — Vollstaendige Meldung', deadline: computeDeadline(erkennungszeitpunkt, 72), badge: '72h' },
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.execCommand('copy')` | `navigator.clipboard.writeText()` | 2020+ | Async, promise-based, cleaner error handling |
| Tailwind v3 config file | Tailwind v4 @theme in CSS | 2024 | Color tokens via `--color-*` in globals.css |
| Zod v3 | Zod v4 (4.3.6) | 2025 | Same API surface used here; `z.object`, `z.enum`, `z.array` unchanged |

## Open Questions

1. **25 Ransomware Steps Content**
   - What we know: 25 steps across 4 phases (Sofortmassnahmen, Eindaemmung, Untersuchung, Kommunikation) with roles and no-go flags
   - What's unclear: The exact text content for all 25 steps. The REQUIREMENTS.md and UI-SPEC define the structure but not the individual step texts.
   - Recommendation: The implementing agent should draft realistic German-language ransomware response steps based on standard incident response frameworks (NIST SP 800-61, BSI IT-Grundschutz). These are placeholder content for the prototype -- exact wording will be reviewed by SIAG consultants.

2. **Template Text Content**
   - What we know: 3 templates (GL/VR, Mitarbeitende, Medien) with dynamic + static placeholders
   - What's unclear: Exact template wording beyond the structural requirements
   - Recommendation: Implementing agent drafts realistic German incident communication templates. Content is for prototype review.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| F6-DATA | Playbook data has 25 steps across 4 phases | unit | `npx vitest run src/__tests__/playbook-data.test.ts -t "25 steps"` | Wave 0 |
| F6-ROLES | Every step has a valid role assigned | unit | `npx vitest run src/__tests__/playbook-data.test.ts -t "roles"` | Wave 0 |
| F6-NOGO | No-go steps have warning text | unit | `npx vitest run src/__tests__/playbook-data.test.ts -t "no-go"` | Wave 0 |
| F7-DEADLINE | ISG deadline = erkennungszeitpunkt + 24h | unit | `npx vitest run src/__tests__/deadline-logic.test.ts -t "ISG"` | Wave 0 |
| F7-FINMA | FINMA deadlines = +24h and +72h | unit | `npx vitest run src/__tests__/deadline-logic.test.ts -t "FINMA"` | Wave 0 |
| F7-DSG | DSG has no computed deadline | unit | `npx vitest run src/__tests__/deadline-logic.test.ts -t "DSG"` | Wave 0 |
| F7-FORMAT | Deadline formatted in de-CH locale | unit | `npx vitest run src/__tests__/deadline-logic.test.ts -t "format"` | Wave 0 |
| SCHEMA | reaktionSchema + kommunikationSchema validate correctly | unit | `npx vitest run src/__tests__/wizard-schemas.test.ts` | Existing (update) |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/playbook-data.test.ts` -- covers F6-DATA, F6-ROLES, F6-NOGO
- [ ] `src/__tests__/deadline-logic.test.ts` -- covers F7-DEADLINE, F7-FINMA, F7-DSG, F7-FORMAT
- [ ] Update `src/__tests__/wizard-schemas.test.ts` -- covers updated reaktionSchema + kommunikationSchema

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/components/wizard/WizardContext.tsx`, `StepForm.tsx`, `StepNavigator.tsx`, `Step3Klassifikation.tsx`, `Step2Erfassen.tsx` -- established patterns
- `src/lib/wizard-types.ts` -- current interface definitions
- `src/lib/wizard-schemas.ts` -- current Zod schemas
- `src/app/globals.css` -- Tailwind v4 @theme tokens
- `package.json` -- dependency versions verified

### Secondary (MEDIUM confidence)
- MDN Web Docs: `navigator.clipboard.writeText()` -- browser API is stable, widely supported
- MDN Web Docs: `Date.toLocaleString()` with `de-CH` locale -- standard Intl API

### Tertiary (LOW confidence)
- Template content and 25-step checklist text -- will need SIAG consultant review

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all dependencies already installed and verified in package.json
- Architecture: HIGH - established patterns from Phases 2-3, code reviewed directly
- Pitfalls: HIGH - derived from actual code analysis of StepForm/StepNavigator behavior
- Content (playbook steps, templates): LOW - prototype text, needs domain expert review

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- no external dependency changes expected)
