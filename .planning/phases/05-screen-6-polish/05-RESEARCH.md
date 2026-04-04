# Phase 5: Screen 6 + Polish — Research

**Researched:** 2026-04-04
**Domain:** React summary screen, print CSS, SVG branding, mobile responsiveness, Tailwind v4
**Confidence:** HIGH — all findings verified directly from project source files and well-established browser/CSS standards

---

## Summary

Phase 5 completes the 7-screen wizard by implementing Screen 6 (Incident-Zusammenfassung), adding print-to-PDF functionality, refining SIAG branding (logo SVG), and ensuring mobile responsiveness on 375px viewports.

All prior wizard state is typed and populated by Screens 2–5. Screen 6 is currently a placeholder (`Step6Dokumentation.tsx`) with a single `<StepForm>` wrapper over an empty `dokumentationSchema`. The plan must replace this with a read-only summary display consuming `useWizard()` directly (no form), plus a `window.print()` button and a SIAG Handoff CTA block.

The project uses Tailwind v4 with CSS-based config (`@theme{}` in `globals.css`), no `tailwind.config.js`. Print media queries are written as standard CSS `@media print` blocks in `globals.css`. The static export constraint (`output: 'export'`, no server-side features) means all print logic is client-side. The branding gap is limited: the Header currently shows a `<div>` placeholder with text "SIAG" instead of an SVG logo; this needs an inline SVG or `<img>` with an SVG file from `public/`.

Mobile issues are concentrated in a small number of specific patterns documented below — the codebase is broadly well-structured for mobile, but a few components need targeted fixes.

**Primary recommendation:** Screen 6 uses `useWizard()` directly (not `StepForm`) to render a structured read-only summary. Print CSS goes in `globals.css` as `@media print {}`. The SVG logo lives in `public/siag-logo.svg` and is referenced via `<img>` in `Header.tsx` (permitted since Header is a layout component, not a wizard component, and `images: { unoptimized: true }` is set in `next.config.ts`).

---

## Project Constraints (from CLAUDE.md)

No `CLAUDE.md` exists in the project root. Constraints are derived from `REQUIREMENTS.md` and `next.config.ts`.

### Binding Constraints from REQUIREMENTS.md / next.config.ts

| Source | Constraint |
|--------|-----------|
| NF3.7 | No `next/*` imports in wizard components (platform compatibility) |
| NF3.5 | `output: 'export'` — static deployment, no SSR APIs |
| NF3.6 | `images: { unoptimized: true }` — required for static export |
| NF3.2 | Tailwind v4 with `@theme{}` in `globals.css` — no `tailwind.config.js` |
| NF3.3 | react-hook-form + Zod per step |
| NF2.2 | No dominierendes Alarming-Rot |
| NF1.4 | Touch-targets ≥ 44px (`min-h-[44px]` pattern throughout codebase) |
| Out of Scope | Echte PDF-Generierung — Print-to-PDF reicht für MVP |

---

## WizardState Structure — All Available Fields

This is the complete typed state available to Screen 6. Source: `src/lib/wizard-types.ts`.

```typescript
// Full WizardState
type WizardState = {
  currentStep: number           // 0–6
  noGoConfirmed: boolean
  einstieg: EinstiegData | null  // {} — no fields
  erfassen: ErfassenData | null
  klassifikation: KlassifikationData | null
  reaktion: ReaktionData | null
  kommunikation: KommunikationData | null
  dokumentation: DokumentationData | null  // {} — no fields, not used
}
```

### ErfassenData (Screen 2 inputs)

```typescript
interface ErfassenData {
  erkennungszeitpunkt: string        // ISO datetime-local string, e.g. "2026-04-04T14:30"
  erkannt_durch:
    | 'it-mitarbeiter'
    | 'nutzer'
    | 'externes-system'
    | 'angreifer-kontakt'
    | 'sonstiges'
  betroffene_systeme: string[]       // subset of: workstations, server, backups, email, netzwerk, ot-ics, sonstiges
  erste_auffaelligkeiten?: string    // free text, optional
  loesegeld_meldung: boolean         // true if ransomware note present
}
```

### KlassifikationData (Screen 3 inputs)

```typescript
interface KlassifikationData {
  q1SystemeBetroffen: 'ja' | 'nein'
  q2PdBetroffen: 'ja' | 'nein'
  q3AngreiferAktiv: 'ja' | 'nein' | 'unbekannt'
  incidentType:
    | 'ransomware' | 'phishing' | 'ddos'
    | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'
  severity: 'KRITISCH' | 'HOCH' | 'MITTEL'
}
```

### ReaktionData (Screen 4 inputs)

```typescript
interface ReaktionData {
  completedSteps: string[]   // array of playbook step IDs that were checked
}
// Total playbook steps = 25 (from RANSOMWARE_PLAYBOOK.phases)
```

### KommunikationData (Screen 5 inputs)

```typescript
interface KommunikationData {
  kritischeInfrastruktur: 'ja' | 'nein' | null
  personendatenBetroffen: 'ja' | 'nein' | null
  reguliertesUnternehmen: 'ja' | 'nein' | null
  kommChecklist: string[]    // subset of: krisenstab, gl-vr, mitarbeitende, medien, kunden, partner
  templateGL?: string        // editable GL template text
  templateMitarbeitende?: string
  templateMedien?: string
}
```

### DokumentationData (Screen 6 — currently empty)

```typescript
interface DokumentationData {}  // No fields — Screen 6 is read-only summary
```

**Key insight:** `dokumentationSchema = z.object({})`. Screen 6 should NOT use `StepForm` (which is for form submission). It should read state via `useWizard()` and render a read-only summary. The `dokumentation` state slice will remain `{}` — no UPDATE_STEP dispatch needed.

**Null-safety:** Every state slice can be `null` if the user skipped earlier steps. All field reads must use optional chaining: `state.erfassen?.erkennungszeitpunkt`.

---

## Screen 6 Current State

`src/components/wizard/steps/Step6Dokumentation.tsx` (12 lines, placeholder):

```tsx
'use client'

import { StepForm } from '../StepForm'
import { dokumentationSchema } from '@/lib/wizard-schemas'

export function Step6Dokumentation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Dokumentation</h2>
      <p className="text-gray-600">Dokumentieren Sie den Vorfall und die getroffenen Massnahmen.</p>
      <StepForm stepKey="dokumentation" schema={dokumentationSchema}>
        {(_form) => (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
            Formularfelder werden in Phase 5 implementiert.
          </div>
        )}
      </StepForm>
    </div>
  )
}
```

The `StepForm` wrapper must be replaced entirely. Screen 6 is a summary/completion screen, not a data-entry form. The `StepNavigator` should still appear (with `showNext={false}` or a custom final-action button, and `showPrev={true}`).

---

## Existing Patterns (for consistent implementation)

### Pattern 1: Reading Wizard State Without Form (Step4 Pattern)

Step 4 (`Step4Reaktion.tsx`) reads state directly via `useWizard()` without `StepForm`:

```tsx
function Step4Content() {
  const { state, dispatch } = useWizard()
  const completedSteps: string[] = (state.reaktion as ReaktionData)?.completedSteps ?? []
  // ...
  return (
    <>
      {/* content */}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => dispatch({ type: 'NEXT_STEP' })}
        onPrev={() => dispatch({ type: 'PREV_STEP' })}
        isNextDisabled={completedCount < totalSteps}
      />
    </>
  )
}

export function Step4Reaktion() {
  return (
    <div className="space-y-6">
      <Step4Content />
    </div>
  )
}
```

**Screen 6 should follow this same pattern.** Use `useWizard()` directly, render a read-only summary, and use `StepNavigator` with `showNext={false}` (it is the final step, `currentStep === MAX_STEP`).

### Pattern 2: StepNavigator at Final Step

From `StepNavigator.tsx`:
```tsx
const resolvedNextLabel = nextLabel ?? (currentStep === MAX_STEP ? 'Abschliessen' : 'Weiter')
```
When `currentStep === 6 === MAX_STEP`, the next button auto-labels "Abschliessen". The planner may choose to hide the Next button entirely on Screen 6 and use a custom completion CTA instead.

### Pattern 3: Section Cards — bg-lightgray rounded-lg p-6

All screens use this pattern for grouped content sections:
```tsx
<div className="bg-lightgray rounded-lg p-6 space-y-3">
  <h3 className="text-lg font-bold text-navy">Section Title</h3>
  {/* content */}
</div>
```

### Pattern 4: Severity Badge

From `Step3Klassifikation.tsx` — reusable badge pattern for severity:
```tsx
<span className={
  severity === 'KRITISCH'
    ? 'inline-block bg-amber text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
    : severity === 'HOCH'
      ? 'inline-block bg-navy text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
      : 'inline-block bg-gray-500 text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
}>
  {severity}
</span>
```

### Pattern 5: Warning/Info Block (amber left-border)

```tsx
<div className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4">
  <p className="text-sm font-normal text-navy">
    <span className="mr-2">&#9888;</span>
    Warning text
  </p>
</div>
```

### Pattern 6: SIAG CTA Block (from Step5)

```tsx
<div className="border-2 border-navy bg-lightgray rounded-lg p-6 text-center space-y-4">
  <p className="text-lg font-bold text-navy">SIAG-Berater jetzt einbeziehen</p>
  <p className="text-base text-gray-600">...</p>
  <div className="bg-white rounded-lg p-4 inline-block text-left space-y-2">
    <p className="text-sm text-navy"><span className="font-bold">Telefon:</span> +41 XX XXX XX XX</p>
    <p className="text-sm text-navy"><span className="font-bold">E-Mail:</span> incident@siag.ch</p>
  </div>
</div>
```

Screen 6 should have an enhanced version of this as the primary handoff CTA (F8.3).

### Pattern 7: Timestamp Formatting (from communication-templates.ts)

```typescript
// de-CH locale formatting already in use
new Date(isoString).toLocaleString('de-CH', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})
// For deadline computation:
import { computeDeadline, formatDeadline } from '@/lib/communication-templates'
```

---

## Architecture Patterns

### Recommended Structure for Step6Dokumentation.tsx

```
Step6Dokumentation (exported)
  └── Step6Content (inner function, uses useWizard())
        ├── Section: Incident-Header (title, severity badge, timestamp)
        ├── Section: Vorfall-Details (erkennungszeitpunkt, erkannt_durch, systeme, beschreibung)
        ├── Section: Klassifikation (incidentType, severity, 3 Q&A, loesegeld)
        ├── Section: Reaktion (completedSteps count, checklist summary)
        ├── Section: Meldepflichten (kritischeInfrastruktur, personendaten, reguliert + deadlines)
        ├── Section: Kommunikation (kommChecklist completed items)
        ├── Section: Naechste Schritte (F8.4)
        ├── PrintButton (window.print(), print:hidden)
        ├── SIAGHandoffCTA (F8.3, print:hidden or styled for print)
        └── StepNavigator (showNext=false, showPrev=true)
```

### Print Architecture

Print logic uses standard CSS `@media print` in `globals.css`. No library needed.

**Pattern:**
1. Add `id="print-report"` to the summary container div
2. Add Tailwind `print:hidden` utility to elements that should not print (Header, Footer, StepNavigator, PrintButton, WizardProgress)
3. Add `@media print` block in `globals.css` for structural overrides
4. The `window.print()` call is in a `'use client'` handler — no Next.js APIs needed

**Tailwind v4 print variant:** Tailwind v4 includes `print:` variant natively. Use `print:hidden` and `print:block` directly in class strings.

**globals.css additions for print:**
```css
@media print {
  /* Hide UI chrome */
  header, footer, nav { display: none !important; }

  /* Reset body for print */
  body { background: white; color: black; }

  /* Break pages cleanly between sections */
  .print-section { break-inside: avoid; }

  /* Remove shadows and borders that look bad on paper */
  .bg-lightgray { background-color: #f5f7fa !important; }
}
```

**Print button component:**
```tsx
<button
  type="button"
  onClick={() => window.print()}
  className="bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px] print:hidden"
>
  Bericht drucken / als PDF speichern
</button>
```

**Window.print() works in static export** — it is a browser API, not a Next.js API. No restrictions.

---

## Design Tokens (globals.css — Exact Values)

Source: `src/app/globals.css`

### Colors

| Token | CSS Custom Property | Hex Value | Tailwind Usage |
|-------|---------------------|-----------|----------------|
| `navy` | `--color-navy` | `#1a2e4a` | `bg-navy`, `text-navy`, `border-navy` |
| `navy-light` | `--color-navy-light` | `#2a4a6b` | `hover:bg-navy-light` |
| `navy-dark` | `--color-navy-dark` | `#0f1e33` | `bg-navy-dark` |
| `white` | `--color-white` | `#ffffff` | `bg-white`, `text-white` |
| `lightgray` | `--color-lightgray` | `#f5f7fa` | `bg-lightgray`, `border-lightgray` |
| `amber` | `--color-amber` | `#f59e0b` | `bg-amber`, `border-amber`, `text-amber` |
| `amber-light` | `--color-amber-light` | `#fbbf24` | `bg-amber-light` |
| `amber-dark` | `--color-amber-dark` | `#d97706` | `bg-amber-dark` |

### Typography

| Property | Value |
|----------|-------|
| `--font-sans` | `"Inter", ui-sans-serif, system-ui, sans-serif` |
| Applied via | `body { font-family: var(--font-sans); }` |

**Note:** Inter is declared as a font-stack preference but is NOT loaded via `next/font/google` or any `<link>` — it falls back to `ui-sans-serif`/`system-ui` if Inter is not installed. The branding refinement plan (05-03) should load Inter via a `<link rel="preconnect">` + `<link rel="stylesheet">` in `layout.tsx` for proper font loading in static export context.

**Why not `next/font`:** `next/font/google` works in `layout.tsx` (server component), but since the `WizardShell` components use `'use client'`, the font must be applied at the layout level. `layout.tsx` is not a wizard component, so `next/font/google` IS permitted there.

### Semantic Usage Patterns Observed

| Semantic | CSS Classes Used |
|----------|-----------------|
| Page background | `bg-white` |
| Card / section background | `bg-lightgray` |
| Warning block | `border-l-4 border-amber bg-amber/10` |
| Primary action button | `bg-navy text-white` |
| Secondary / outline button | `bg-white border border-navy text-navy` |
| Header bar | `bg-navy text-white` |
| Section heading | `text-2xl font-bold text-navy` |
| Subsection heading | `text-lg font-bold text-navy` |
| Body text | `text-base text-gray-600` |
| Caption / meta | `text-sm text-gray-500` |
| Disabled state | `opacity-50 cursor-not-allowed` |
| Touch target minimum | `min-h-[44px]` |

---

## Header / Branding Gap

Source: `src/components/Header.tsx` (current state):

```tsx
export function Header() {
  return (
    <header className="bg-navy text-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-sm font-bold">
          SIAG
        </div>
        <h1 className="text-lg font-semibold">Incident Management Assistent</h1>
      </div>
    </header>
  )
}
```

**Gap:** The `<div>` placeholder (`w-10 h-10 bg-white/20`) must be replaced with an SVG logo or `<img src="/siag-logo.svg">`.

### SVG Logo Approach for Static Export

`Header.tsx` is NOT a wizard component — it is imported from `src/components/Header.tsx` and used in `src/app/layout.tsx`. NF3.7 ("no `next/*` imports in wizard components") does NOT apply here.

**Three options:**

| Approach | Implementation | Pros | Cons |
|----------|---------------|------|------|
| `<img src="/siag-logo.svg">` | `<img src="/siag-logo.svg" alt="SIAG" width={40} height={40} />` | Simplest, static export safe | Cannot change color with CSS |
| Inline SVG | Copy SVG markup directly into JSX | CSS controllable, no HTTP request | Verbose if logo is complex |
| `next/image` | `<Image src="/siag-logo.svg" ...>` | Optimization features | Allowed in `Header.tsx` (non-wizard), but `unoptimized: true` means no benefit |

**Recommendation:** Use `<img src="/siag-logo.svg" alt="SIAG" width={40} height={40} className="block" />`. The SVG file lives in `public/siag-logo.svg`. For the MVP, create an SVG placeholder with SIAG initials styled as a proper mark (not just text in a box), with a comment `<!-- REPLACE WITH ACTUAL SIAG LOGO BEFORE GO-LIVE -->`.

**SVG Placeholder Template:**
```svg
<!-- public/siag-logo.svg -->
<!-- REPLACE WITH ACTUAL SIAG LOGO BEFORE GO-LIVE -->
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="6" fill="rgba(255,255,255,0.2)"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-sans-serif,system-ui,sans-serif" font-size="11"
        font-weight="700" fill="white">SIAG</text>
</svg>
```

---

## Mobile Responsiveness Audit

### Layout Container Analysis

The wizard content sits inside:
- `layout.tsx`: `<main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">` — `px-6` = 24px padding each side
- `WizardShell.tsx`: `<div className="max-w-2xl mx-auto px-4 py-8">` — additional `px-4` = 16px inner padding

At 375px viewport: `375 - 48 (px-6 × 2) - 32 (px-4 × 2) = 295px` content width. All content must fit within ~295px.

### Identified Mobile Issues

**Issue 1 — Step1Einstieg: px-12 on hero button**
```tsx
// Current — px-12 = 48px padding each side
className="bg-navy text-white text-2xl font-bold px-12 py-6 rounded-xl min-h-[64px] ..."
```
At 375px, `px-12` (96px total horizontal padding) + text may overflow. Fix: add `w-full sm:w-auto` and reduce to `px-8` or use `w-full`.

**Issue 2 — Step4Reaktion: w-48 progress bar not responsive**
```tsx
// Line 32: Hard-coded width for progress bar container
<div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
```
At 375px, the parent `flex items-center justify-between` with `w-48` leaves the "8 von 25 erledigt" text with fixed remaining space. At narrow widths, the text may wrap or overflow. Fix: `flex-1 max-w-[12rem]` or wrap the row in `flex-col sm:flex-row`.

**Issue 3 — Step5Kommunikation: template card header justify-between may overflow**
```tsx
// Line 92: flex items-center justify-between in template card header
<div className="bg-lightgray px-4 py-3 flex items-center justify-between border-b border-gray-200">
  <h4 className="text-sm font-bold text-navy">{template.title}</h4>
  <button ...>Kopieren</button>
</div>
```
Long template titles ("Vorlage: Geschaeftsleitung / VR") + "Kopieren" button may be tight at 375px. Fix: `flex-wrap` or `flex-col sm:flex-row` on the header, or shorten the title labels for mobile.

**Issue 4 — Step5Kommunikation: deadline display flex justify-between**
```tsx
// Line 210: flex items-center justify-between in deadline cards
<div className="flex items-center justify-between">
  <div>
    <p>law name</p>
    <p>deadline text</p>
  </div>
  <span>badge</span>
</div>
```
Long deadline text (e.g., "Frist bis: Samstag, 04. Apr. 2026, 16:32 Uhr") + badge at 375px. Risk of overlap. Fix: `flex-col sm:flex-row` or `items-start gap-2 flex-wrap`.

**Issue 5 — Step2Erfassen: datetime-local + "Jetzt eintragen" button row**
```tsx
// Line 48: flex gap-2 items-end — button may wrap or overflow
<div className="flex gap-2 items-end">
  <input type="datetime-local" className="flex-1 ..." />
  <button>Jetzt eintragen</button>
</div>
```
The `whitespace-nowrap` on the button is correct, but at 375px the `flex-1` input may be very narrow. This is acceptable since `flex-1` will still render correctly — the input will be small but usable. LOW priority fix.

**Issue 6 — Step5Kommunikation: SIAG CTA inline-block contact card**
```tsx
// Line 267: inline-block may not fill width on mobile
<div className="bg-white rounded-lg p-4 inline-block text-left space-y-2">
```
`inline-block` inside a `text-center` parent will center the block, which is correct. No overflow risk. No fix needed.

### No Issues Found (Confirmed)

| Component | Assessment |
|-----------|-----------|
| `StepInterstitial` | `w-full sm:w-auto` on button — correct |
| `StepNavigator` | `flex justify-between` with only two items — fine at 375px |
| `WizardProgress` | Step labels hidden on mobile (`hidden md:flex`) — correct |
| `Step3Klassifikation` | `flex gap-3 flex-wrap` on option buttons — wraps correctly |
| `Step2Erfassen` | `grid-cols-1 sm:grid-cols-2` for systems — responsive |
| `WizardShell` | `px-4` inner padding — appropriate |
| `Header` | `px-6` with `flex items-center gap-4` — fine |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom PDF renderer | `window.print()` with `@media print` CSS | Scope says "Print-to-PDF reicht für MVP"; jsPDF/Puppeteer is out of scope |
| Copy to clipboard | Custom clipboard API wrapper | `navigator.clipboard.writeText()` | Already in use in Step5; consistent pattern |
| Date formatting | Custom date format function | `Date.toLocaleString('de-CH', {...})` | Already in use in `communication-templates.ts` |
| State aggregation | Redux/Zustand | `useWizard()` | State already in Context; consistent |
| Deadline calculation | Custom | `computeDeadline()` + `formatDeadline()` from `communication-templates.ts` | Already tested and in use |
| Font loading | `@import url()` in CSS | `next/font/google` in `layout.tsx` | Tree-shakes correctly, preloads Inter |

**Key insight:** The entire summary screen is a read-only view — no new state management, no new libraries. All helper functions exist. The only new work is layout composition and print CSS.

---

## Common Pitfalls

### Pitfall 1: Using StepForm for Read-Only Screen
**What goes wrong:** Wrapping Screen 6 in `StepForm` as the placeholder does, triggering unnecessary form validation on an empty schema, and rendering the "Weiter" submit button instead of a custom completion action.
**Why it happens:** The placeholder was scaffolded with `StepForm` in Phase 2 as a consistent pattern.
**How to avoid:** Screen 6 reads state via `useWizard()` directly. Use `StepNavigator` manually (as Step4 does) with `showNext={false}`. No `<form>` wrapper.
**Warning signs:** If you see `<StepForm stepKey="dokumentation">` in the final implementation, it is wrong.

### Pitfall 2: Null State Causing Runtime Errors
**What goes wrong:** `state.erfassen.erkennungszeitpunkt` throws if user navigated directly to Screen 6 or state was cleared.
**Why it happens:** Each state slice is typed as `ErfassenData | null`.
**How to avoid:** All state reads must use optional chaining: `state.erfassen?.erkennungszeitpunkt ?? 'Nicht erfasst'`. Every display field needs a fallback string.
**Warning signs:** TypeScript will warn on non-optional access; treat all TS errors as blockers.

### Pitfall 3: Print CSS Breaking Wizard Navigation
**What goes wrong:** `@media print` styles accidentally hide the summary content or show unwanted elements.
**Why it happens:** Overbroadly targeting elements in print CSS.
**How to avoid:** Use `print:hidden` Tailwind utility on specific elements (StepNavigator, WizardProgress, Header, Footer, print button). Add `@media print { header { display: none; } footer { display: none; } }` in `globals.css` as a safety net.
**Warning signs:** Test print preview in Chrome DevTools (More Tools → Rendering → Emulate print media).

### Pitfall 4: Tailwind v4 Print Variant
**What goes wrong:** Using `print:hidden` but importing a Tailwind v3 reference that requires `safelist` or explicit configuration.
**Why it happens:** Tailwind v4 changed how variants are configured vs v3.
**How to avoid:** In Tailwind v4 with CSS-based config, `print:hidden` works out of the box — no configuration needed. The `@import "tailwindcss"` in `globals.css` includes all variants.
**Confidence:** HIGH — Tailwind v4 docs confirm all core variants including `print:` are included by default.

### Pitfall 5: window.print() in SSR Context
**What goes wrong:** Calling `window.print()` during server render causes a `ReferenceError: window is not defined`.
**Why it happens:** `output: 'export'` still pre-renders pages.
**How to avoid:** The `window.print()` call must be inside an event handler (onClick), never called at module or render time. Since it is in a click handler it is safe. No `typeof window !== 'undefined'` guard needed in an onClick.

### Pitfall 6: SVG in Static Export
**What goes wrong:** Using `next/image` for the SVG logo with explicit `width`/`height` that are wrong for the actual SVG viewBox.
**Why it happens:** SVG intrinsic sizes can differ from rendered sizes.
**How to avoid:** Use `<img src="/siag-logo.svg" alt="SIAG" width={40} height={40} />` with explicit dimensions matching the SVG's `viewBox`. The `images: { unoptimized: true }` in `next.config.ts` makes `next/image` equivalent to `<img>` anyway, so prefer `<img>` for simplicity in `Header.tsx`.

### Pitfall 7: Inter Font Not Loading
**What goes wrong:** `globals.css` declares `--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif` but Inter is never loaded, so it always falls back to system font.
**Why it happens:** No `<link>` or `next/font` import loads Inter.
**How to avoid:** In `layout.tsx`, either add `next/font/google` (permitted — layout is not a wizard component) or add Google Fonts `<link>` tags. `next/font/google` is the recommended approach for Next.js App Router.

---

## Print CSS Architecture

### Recommended @media print additions to globals.css

```css
@media print {
  /* Hide navigation chrome */
  header { display: none !important; }
  footer { display: none !important; }
  
  /* Reset page for print */
  body {
    background-color: white;
    color: #1a2e4a;
    font-size: 12pt;
  }

  /* Avoid page breaks inside cards */
  .print-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Remove interactive styles */
  button { display: none !important; }
  
  /* Preserve colored backgrounds for section cards */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

### Print-Specific Class Usage

| Element | Screen class | Print behavior |
|---------|-------------|----------------|
| Header | (CSS rule) | `display: none` |
| Footer | (CSS rule) | `display: none` |
| WizardProgress | `print:hidden` | Hidden |
| StepNavigator | `print:hidden` | Hidden |
| Print button | `print:hidden` | Hidden |
| SIAG CTA block | Keep visible | Prints with contact info |
| Summary sections | `print-section` class | No page breaks inside |

### window.print() Integration

The print button should live inside Screen 6 and be a plain `<button>` with `onClick={() => window.print()}`. No ref, no portal, no special lifecycle needed.

```tsx
// In Step6Content, above StepNavigator:
<div className="flex gap-3 flex-wrap print:hidden">
  <button
    type="button"
    onClick={() => window.print()}
    className="bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px] hover:bg-navy-light transition-colors"
  >
    Bericht drucken / als PDF speichern
  </button>
</div>
```

---

## F8 Requirement Mapping

| Req | Description | Implementation |
|-----|-------------|---------------|
| F8.1 | Strukturierte Incident-Zusammenfassung | Read-only sections from `useWizard().state` — 8 data categories |
| F8.2 | „Bericht für GL/VR exportieren" Button | `window.print()` + `@media print` CSS in `globals.css` |
| F8.3 | „An SIAG-Berater übergeben" Handoff CTA | Enhanced version of Step5 CTA block, prominent at bottom |
| F8.4 | Nächste Schritte sichtbar | Static section with post-incident recommendations |

### F8.1 — 8 Data Sections for Summary

Per F8.1 specification: "Was ist passiert | Wann | Betroffene Systeme | Klassifikation | Massnahmen | Risiken offen | Wer informiert | Nächste Schritte"

| Section | Data Source | Fields |
|---------|-------------|--------|
| Was ist passiert | `state.klassifikation` | `incidentType`, `severity`, `loesegeld_meldung` |
| Wann | `state.erfassen` | `erkennungszeitpunkt`, `erkannt_durch` |
| Betroffene Systeme | `state.erfassen` | `betroffene_systeme[]` |
| Klassifikation | `state.klassifikation` | `q1`, `q2`, `q3`, `severity` |
| Massnahmen | `state.reaktion` | `completedSteps[]` count + list |
| Risiken offen | Derived | `completedSteps.length < 25` → uncompleted steps |
| Wer informiert | `state.kommunikation` | `kommChecklist[]` |
| Nächste Schritte | Static | Post-incident recommendations (hardcoded) |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 with jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |
| Current coverage | 74/74 tests passing |

### Phase 5 Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| F8.1 | Summary renders all state fields, null-safe | unit | `npx vitest run src/__tests__/step6-summary.test.ts` | ❌ Wave 0 |
| F8.2 | window.print() called on button click | unit | `npx vitest run src/__tests__/step6-summary.test.ts` | ❌ Wave 0 |
| F8.3 | SIAG CTA block renders with contact info | unit | `npx vitest run src/__tests__/step6-summary.test.ts` | ❌ Wave 0 |
| NF2.5 | SVG logo renders in Header | unit | `npx vitest run src/__tests__/header.test.ts` | ❌ Wave 0 |
| NF1.4 | Touch targets ≥ 44px | manual | — | manual-only |
| Mobile | 375px viewport correct | manual | — | manual-only |
| Print | Print preview readable | manual | — | manual-only |

### Sampling Rate

- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/step6-summary.test.ts` — covers F8.1 (null-safe renders), F8.2 (print button), F8.3 (CTA)
- [ ] `src/__tests__/header.test.ts` — covers NF2.5 (SVG logo in header)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF / html2canvas for PDF | `window.print()` + print CSS | Always the MVP approach here | No dependency needed |
| Tailwind config.js for print variant | Native `print:` variant in Tailwind v4 | Tailwind v4 (this project uses v4.2.2) | Works out of the box |
| `next/image` SVG in static export | `<img>` tag or inline SVG | n/a | `unoptimized: true` means `next/image` provides no benefit for SVGs |

---

## Environment Availability

Step 2.6 analysis: Phase 5 has no new external dependencies. All tools are already in use.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | Build | ✓ | (project active) | — |
| Vitest | Testing | ✓ | 4.1.2 | — |
| Tailwind v4 | Styling + print: variant | ✓ | 4.2.2 | — |
| window.print() | Print export | ✓ (browser API) | — | — |
| navigator.clipboard | Copy (Step5 already uses) | ✓ | — | — |

No missing dependencies.

---

## Sources

### Primary (HIGH confidence)

- Direct source file reads — `src/lib/wizard-types.ts`, `src/lib/wizard-schemas.ts`, `src/lib/communication-templates.ts`
- Direct source file reads — all 7 step components, `WizardContext.tsx`, `StepForm.tsx`, `StepNavigator.tsx`, `WizardShell.tsx`
- Direct source file reads — `src/app/globals.css`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- Direct source file reads — `next.config.ts`, `package.json`, `vitest.config.ts`
- MDN Web Docs — `window.print()`, `@media print`, `break-inside: avoid` (well-established browser standards)
- Tailwind v4 CSS variable / variant model — `@import "tailwindcss"` includes all core variants including `print:`

### Secondary (MEDIUM confidence)

- Tailwind v4 print variant: `print:hidden` / `print:block` confirmed available in Tailwind v4 (all variants included by default, no configuration required)
- `-webkit-print-color-adjust: exact` + `print-color-adjust: exact` — required for background color preservation in print; well-documented cross-browser pattern

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**
- WizardState structure: HIGH — read directly from TypeScript source
- Component patterns: HIGH — read directly from implemented screens
- Print CSS: HIGH — standard browser/CSS API, no library required
- Tailwind v4 print variant: HIGH — core variant, no config needed
- Mobile issues: HIGH — identified from actual className strings in source
- SVG logo approach: HIGH — confirmed by `next.config.ts` (`unoptimized: true`), NF3.7 constraint

**Research date:** 2026-04-04
**Valid until:** 2026-05-04 (stable stack, no fast-moving dependencies)
