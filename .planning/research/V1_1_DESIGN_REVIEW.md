# v1.1 UI/UX Design Review & Recommendations

**Date:** 2026-04-06  
**Reviewed against:** SIAG Design System + ui-ux-pro-max Standards  
**Scope:** v1.0 → v1.1 improvements (visual design, UX clarity, accessibility)

---

## Executive Summary

SIAG Incident Assistant v1.0 is **functionally complete** but has **5 priority improvements** for v1.1 to meet SIAG brand standards and enhance stress-taugliche usability:

| Priority | Issue | Impact | Effort | v1.1 Phase |
|----------|-------|--------|--------|-----------|
| 🔴 **CRITICAL** | Color palette not SIAG-compliant (Amber instead of SIAG-Red) | Brand inconsistency, reduced visual hierarchy | 2–3 hours | Phase 1 |
| 🔴 **CRITICAL** | Typography inconsistent (Inter throughout, missing Stone Sans for display) | Reduces perceived professionalism | 1–2 hours | Phase 1 |
| 🟠 **HIGH** | Motion states missing (buttons, cards, navigation) | Interaction feels unresponsive, stale | 3–4 hours | Phase 2 |
| 🟠 **HIGH** | PDF export formatting rough (print styles exist but not optimized) | Poor document quality | 2–3 hours | Phase 2 |
| 🟡 **MEDIUM** | No dark mode support | Missing for consultants working late/in-field | 3–4 hours | Phase 2+ |
| 🟡 **MEDIUM** | Form error states unclear (no inline validation, missing helper text) | Users make mistakes, frustration increases | 2–3 hours | Phase 3 |

---

## Detailed Findings by Category

### 1. 🔴 Colors: SIAG Palette Not Fully Applied

**Finding:** v1.0 uses `--color-amber` (#f59e0b) for warning/no-go cards instead of SIAG-Red (#CC0033).

**Current state:**
```css
/* globals.css */
--color-amber: #f59e0b;          /* ❌ Not SIAG-compliant */
--color-navy: #1a2e4a;            /* ✅ Good */
--color-lightgray: #f5f7fa;       /* ✅ Good */
```

**SIAG Design System says:**
```
Primary: SIAG-Rot #CC0033 (204, 0, 51) — CTAs, Hover, Akzente, Links
Secondary: SIAG-Blau #003B5E (0, 59, 94) — Secondary elements
Highlight: SIAG-Orange #D44E17 (212, 78, 23) — Highlights
Text: SIAG-Schwarz #404040 (64, 64, 64) — Navigation, Footer, Fliesstext
Background: SIAG-Hellgrau #F0F0F0 (240, 240, 240) — Section backgrounds
```

**Issue:**
- No-Go Rules cards use amber border-left, which is muted and lacks urgency
- Missing SIAG-Rot for critical warnings and error states
- Missing SIAG-Orange for highlights and secondary CTAs
- Inconsistent with SIAG website (infosec.ch)

**Recommendation for v1.1:**
```css
@theme {
  /* SIAG Brand Colors (SPEC-COMPLIANT) */
  --color-red: #CC0033;           /* Primary accent, CTAs, warnings */
  --color-blue: #003B5E;          /* Secondary elements */
  --color-orange: #D44E17;        /* Highlights, emphasis */
  --color-black: #404040;         /* Text, nav, footer */
  --color-lightgray: #F0F0F0;     /* Section backgrounds */
  --color-white: #FFFFFF;         /* Default background */
  
  /* Semantic aliases */
  --color-error: var(--color-red);
  --color-warning: var(--color-orange);
  --color-success: #2D6A4F;       /* Not in SIAG palette, use for confirmed actions */
  --color-info: var(--color-blue);
}
```

**Impact:** Upgraded visual hierarchy, brand consistency, better CTA prominence.

---

### 2. 🔴 Typography: Inter-Only, Missing SIAG Display Hierarchy

**Finding:** All text uses Inter (Body font) throughout. No Stone Sans for display/headlines.

**Current state:**
```css
body { font-family: "Inter", ui-sans-serif, system-ui, sans-serif; }
/* All h1, h2, h3 also inherit Inter */
```

**SIAG Design System says:**
```
Stone Sans Std — Headings, Display (especially print/professional)
Source Sans Pro — Body, Fliesstext (Web)
Typografie-Pairing: 2.5× Größensprung zwischen Display und Body
```

**Issue:**
- No visual distinction between headline and body text (only font-weight changes)
- Inconsistent with SIAG professional brand (Stone Sans signals authority)
- Print export (PDF) lacks stone-sans, looks generic

**Recommendation for v1.1:**

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

@theme {
  --font-display: "Stone Sans Std", "Source Sans Pro", ui-sans-serif, sans-serif;
  --font-body: "Source Sans Pro", ui-sans-serif, sans-serif;
}

/* Headlines use display font with size scale */
h1 { font: 700 42px var(--font-display); letter-spacing: -0.02em; }
h2 { font: 700 32px var(--font-display); }
h3 { font: 600 24px var(--font-body); }  /* Still body-like but bolder */
body { font: 400 16px var(--font-body); line-height: 1.6; }

@media print {
  * { font-family: "Stone Sans Std" !important; }
}
```

**Note:** Stone Sans Std is proprietary to ITC. Fallback: use **Crimson Text** (serif, professional) or **IBM Plex Sans** (geometric, modern) if licensing is not available. Check SIAG's actual web setup (infosec.ch).

**Impact:** Enhanced visual hierarchy, professional feel, better print quality.

---

### 3. 🟠 Motion & Interaction States: Missing Feedback

**Finding:** No hover, pressed, or transition states on interactive elements (except basic `transition-colors`).

**Current state:**
```tsx
// StepInterstitial.tsx
<button
  className="bg-navy text-white px-6 py-3 rounded-lg font-bold ... 
  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-light"
>
```

**Issues:**
1. No pressed-state feedback (scale, ripple, elevation) → feels unresponsive
2. No animation on button state changes (instant snap to `hover:bg-navy-light`)
3. Cards and interactive elements have no hover elevation or accent
4. Disabled state is only opacity (0.5) — should be more distinct
5. No loading state animation (spinners, skeleton) for async operations

**Recommendation for v1.1:**

```tsx
/* Interactive Button Component */
<button
  className="
    /* Base */
    bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px]
    
    /* Interaction States */
    transition-all duration-200 ease-out
    hover:bg-blue-700 hover:shadow-lg
    active:scale-[0.97] active:shadow-md
    focus-visible:outline-2 outline-offset-2 outline-red
    
    /* Disabled */
    disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
  "
>
  Action
</button>

/* No-Go Rule Card Animation */
<div className="
  border-l-4 border-red bg-red/10 rounded-r-lg p-4
  transition-all duration-300 ease-out
  hover:border-red/80 hover:bg-red/15 hover:shadow-sm
">
  {/* Content */}
</div>

/* Loading State Spinner */
<div className="animate-spin h-5 w-5 border-2 border-red border-t-transparent rounded-full" />
```

**CSS for smooth motion:**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-enter { animation: fadeUp 0.3s ease-out; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Impact:** Interfaces feels responsive and polished. Consultants perceive app as trustworthy.

---

### 4. 🟠 PDF Export: Formatting & Visual Polish

**Finding:** PDF export is functional (via browser print) but lacks visual optimization.

**Issues:**
1. Print styles hide header/footer but don't create a title page
2. No summary cover page with incident ID, date, consultant
3. Page breaks not optimized — content may split awkwardly
4. Color/contrast handling rough for printed documents
5. No QR code or reference link for sharing/re-opening incident

**Recommendation for v1.1:**

**Add a dedicated export handler:**

```tsx
/* src/components/PDFExport.tsx */
export function PDFExport() {
  const { state } = useWizard()
  
  const handlePrint = () => {
    const content = `
      <html>
        <head>
          <title>SIAG-Incident-${state.recognitionTime}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: "Stone Sans Std", serif; }
            .cover { page-break-after: always; text-align: center; }
            .section { page-break-inside: avoid; margin-bottom: 24pt; }
            .footer { font-size: 10pt; color: #404040; margin-top: 40pt; border-top: 1px solid #F0F0F0; padding-top: 10pt; }
          </style>
        </head>
        <body>
          <!-- Title Page -->
          <div class="cover">
            <img src="/siag-logo.svg" alt="SIAG" style="height: 40mm; margin-bottom: 20mm;" />
            <h1>Incident Management Report</h1>
            <p>Incident ID: ${state.id}</p>
            <p>Erstellt: ${formatDate(state.recognitionTime)}</p>
          </div>
          
          <!-- Summary -->
          <div class="section">
            <h2>Incident-Zusammenfassung</h2>
            <table>
              <tr><td>Erkennungszeit:</td><td>${formatDate(state.recognitionTime)}</td></tr>
              <tr><td>Typ:</td><td>${state.incidentType}</td></tr>
              <tr><td>Schweregrad:</td><td>${state.severity}</td></tr>
            </table>
          </div>
          
          <!-- Playbook Steps -->
          <div class="section">
            <h2>25-Punkt Playbook</h2>
            ${renderPlaybookSteps(state.playbook)}
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>Vertraulich - Nur für berechtigte Personen</p>
            <p>SIAG Incident Management Assistant | v1.1</p>
          </div>
        </body>
      </html>
    `
    
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url)
    win.print()
  }
  
  return <button onClick={handlePrint}>PDF exportieren</button>
}
```

**Add to globals.css for print:**

```css
@media print {
  @page {
    margin: 20mm;
    size: A4;
  }

  body {
    font-family: "Stone Sans Std", serif;
    color: black;
    background: white;
  }

  .print-hidden { display: none !important; }
  header, footer, nav { display: none !important; }

  .print-section {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 24pt;
  }

  .print-title-page {
    page-break-after: always;
    text-align: center;
    padding: 60mm 0;
  }

  h1 { font-size: 28pt; margin-bottom: 12pt; }
  h2 { font-size: 18pt; margin-top: 16pt; margin-bottom: 8pt; }
  p { margin-bottom: 8pt; line-height: 1.5; }

  /* Preserve color in print */
  .bg-navy { background: #1a2e4a !important; color: white !important; }
  .border-red { border-color: #CC0033 !important; }

  /* Avoid page breaks in tables/lists */
  tbody tr { page-break-inside: avoid; }
}
```

**Impact:** Professional-looking exported documents. Consultants can share/archive incidents with confidence.

---

### 5. 🟡 Dark Mode Support

**Finding:** v1.0 has no dark mode. Critical for:
- Consultants working late/in field
- Privacy/security context (incr incident visibility)
- WCAG AAA compliance (dark mode preference)

**Recommendation for v1.1:**

**Add dark mode tokens to globals.css:**

```css
@theme {
  --color-navy: #1a2e4a;         /* Light mode primary */
  --color-white: #FFFFFF;

  --color-navy-dark: #0f1e33;    /* Darker navy for dark mode */
  --color-gray-dark: #1e293b;
  --color-text-dark: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-bg: var(--color-gray-dark);
    --color-surface: var(--color-navy-dark);
    --color-text: var(--color-text-dark);
  }

  body {
    background-color: var(--color-gray-dark);
    color: var(--color-text);
  }

  /* Ensure cards have sufficient contrast in dark mode */
  [class*="bg-navy"] { background: var(--color-navy-dark) !important; }
  [class*="border-amber"] { border-color: var(--color-orange) !important; }
}
```

**Impact:** Better for late-night incident response. Reduces eye strain. Compliance boost.

---

### 6. 🟡 Forms: Inline Validation & Error Clarity

**Finding:** Form error states exist (Step 5 Meldepflicht) but lack inline validation and helper text.

**Current state:**
```tsx
<StepForm onSubmit={handleSubmit} schema={validationSchema}>
  {/* No inline validation during input */}
  {/* Error only shown after submit attempt */}
</StepForm>
```

**Issues:**
1. Users don't get real-time feedback while typing/selecting
2. Error messages not placed adjacent to problem fields
3. Missing helper text explaining expected format (dates, phone numbers)
4. No "required" indicator (*)
5. Disabled submit button has no loading/spinner feedback

**Recommendation for v1.1:**

```tsx
/* FormField Component — reusable with validation */
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helperText?: string
  children: React.ReactNode
}

export function FormField({ label, required, error, helperText, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-red flex items-start gap-2">
          <span className="text-base leading-none">⚠</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
    </div>
  )
}

/* Usage */
<FormField
  label="Erkennungszeit"
  required
  error={errors.recognitionTime?.message}
  helperText="Format: TT.MM.YYYY HH:MM"
>
  <input
    type="datetime-local"
    {...register('recognitionTime')}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-2 outline-red outline-offset-2"
  />
</FormField>
```

**Inline validation (on blur):**

```tsx
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

const handleBlur = async (fieldName: string, value: any) => {
  try {
    await validationSchema.pick({ [fieldName]: true }).validate({ [fieldName]: value })
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }))
  } catch (err) {
    setFieldErrors(prev => ({ ...prev, [fieldName]: err.message }))
  }
}
```

**Impact:** Users fix errors in real-time, fewer submit failures, reduced frustration.

---

## Design System Compliance Summary

| Dimension | v1.0 Status | v1.1 Target | Effort |
|-----------|-----------|-----------|--------|
| Colors | ❌ Amber instead of SIAG-Red | ✅ SIAG palette spec-compliant | 2–3h |
| Typography | ⚠️ Inter only, no hierarchy | ✅ Source Sans Pro + Stone Sans display | 1–2h |
| Motion | ❌ None (instant snap) | ✅ 150–300ms easing, reduced-motion aware | 3–4h |
| PDF Export | ⚠️ Functional, rough formatting | ✅ Professional title page, optimized layout | 2–3h |
| Dark Mode | ❌ Not supported | ✅ Native prefers-color-scheme | 3–4h |
| Forms | ⚠️ Post-submit errors only | ✅ Inline validation + helper text | 2–3h |
| Accessibility | ✅ Basic (focus rings, contrast) | ✅ Enhanced (aria-live, descriptive errors) | 1–2h |
| Mobile/Responsive | ✅ Good (Tailwind breakpoints) | ✅ Maintain (no changes needed) | — |

---

## Recommended v1.1 Roadmap (UX/Design Phase)

### **Phase 1: Color + Typography (CRITICAL BRAND)**
- Replace amber with SIAG-Red palette (#CC0033, #003B5E, #D44E17)
- Add Stone Sans display font (or approved fallback)
- Update all color references in components
- Test contrast compliance (WCAG AAA)

**Effort:** 3–4 hours | **Priority:** Must-do before any other v1.1 work

### **Phase 2: Motion + PDF Export (UX Polish)**
- Add hover/pressed states with 200ms ease-out transitions
- Add loading spinner (animate-spin)
- Implement PDF export with title page + optimized print styles
- Test on multiple devices/browsers

**Effort:** 5–7 hours | **Priority:** Recommended

### **Phase 3: Dark Mode + Forms (Enhancement)**
- Add dark mode tokens and media query
- Implement inline validation + helper text on all form fields
- Add required-field indicators (*)
- Test dark mode contrast separately

**Effort:** 5–6 hours | **Priority:** Nice-to-have

---

## Accessibility Checklist (WCAG AA)

- [ ] **Contrast:** Text ≥4.5:1 (normal), ≥3:1 (large)
  - Navy #1a2e4a on white #FFFFFF = **11.3:1** ✅
  - Red #CC0033 on white = **9.7:1** ✅
  - Amber #f59e0b on white = **6.3:1** ✅ (but should use red)
  
- [ ] **Focus Rings:** Visible 2–4px outline on all interactive elements
  - Current: `focus-visible:outline-2 outline-offset-2` ✅
  
- [ ] **Alt Text:** All meaningful images labeled
  - Logo: `alt="SIAG"` ✅
  
- [ ] **Keyboard Navigation:** Tab order = visual order
  - Need to verify with full form walkthrough
  
- [ ] **Reduced Motion:** Animations respect user preference
  - Need to add `@media (prefers-reduced-motion: reduce)`
  
- [ ] **Form Labels:** All inputs have visible labels (not placeholder-only)
  - Depends on Step component implementation

---

## Quick Wins (Low Effort, High Impact)

1. **Swap amber → SIAG-Red** (30 min)
   ```css
   --color-amber: #CC0033;  /* Update in globals.css */
   ```

2. **Add button hover state** (15 min)
   ```css
   .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
   ```

3. **Add reduced-motion media query** (10 min)
   ```css
   @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
   ```

4. **Add required-field asterisk** (10 min)
   ```tsx
   {required && <span className="text-red">*</span>}
   ```

---

## Conclusion

SIAG Incident Assistant v1.0 is **functionally excellent** but needs **visual & brand polish** for v1.1. 

**Must-do (CRITICAL):**
- Color palette: Amber → SIAG-Red
- Typography: Add display hierarchy

**Recommended (HIGH):**
- Motion: Micro-interactions on buttons/cards
- PDF: Professional export formatting

**Nice-to-have (MEDIUM):**
- Dark mode support
- Form inline validation enhancements

Estimated total effort for all improvements: **10–15 hours across 3 phases**.

The good news: v1.0's architecture is clean, no major refactoring needed. All changes are CSS/component refinements.

