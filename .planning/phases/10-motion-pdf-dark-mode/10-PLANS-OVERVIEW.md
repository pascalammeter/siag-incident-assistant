# Phase 10: Motion + PDF + Dark Mode — Plans Overview

**Phase Status:** Planning complete, ready for execution
**Phase Duration:** ~17-20 hours execution (distributed across 2 waves)
**Dependency:** Phase 9 (complete)
**Blocking:** Phase 11 (Multi-Type Playbooks)

---

## Executive Summary

Phase 10 adds three complementary features to deliver professional UX polish:

1. **Animations (10-01):** Motion library integrations with accessibility compliance
2. **Dark Mode (10-02):** Full theme support with persistence and system preference detection
3. **PDF Export (10-03):** Server-side PDF generation with professional title pages and headers/footers

All features are independent at the component level but integrated at the app level (root layout provides Motion and Theme context). Plans execute in 2 waves: Wave 1 runs sequentially (Plans 10-01 + 10-02 with single coordinated root layout edit), Wave 2 waits for Wave 1 completion (Plan 10-03 depends on LoadingSpinner from 10-01).

**CRITICAL COORDINATION:** Plans 10-01 and 10-02 both touch `src/app/layout.tsx`, but to avoid merge conflicts during development, they are **sequentially executed within Wave 1** with a **single unified provider wrapper edit** in Task 2 of Plan 10-01. Plan 10-02 does NOT modify layout.tsx again.

---

## Plan Breakdown

### Plan 10-01: Motion + Button States + Loading Spinner + Root Layout Providers
**Wave:** 1 (sequential with 10-02 due to shared layout.tsx)
**Duration:** 6-7 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** D3.1, D3.2, D3.3

**Scope:**
- Install Motion v12.38.0 and next-themes v0.4.6
- Create motion configuration module with accessibility settings (`MotionConfig` with `reducedMotion="user"`)
- **Update root layout to wrap app with UNIFIED dual-provider wrapper: `<ThemeProvider><MotionConfig>{children}</MotionConfig></ThemeProvider>`**
- Implement animated Button component (whileHover: scale 1.05, whileTap: scale 0.98, 150ms/100ms)
- Create animated LoadingSpinner component (1s continuous rotation)
- Update card components with hover elevation (shadow increase, 150ms ease-out)
- Add spinner to StepForm during submission
- Add spinner to IncidentList during fetch
- Implement 8+ tests covering animations and accessibility

**Files Modified:** 9 (including coordinated layout.tsx edit with both Motion and Theme providers)
**Test Coverage:** 8+ tests (motion animations, accessibility, loading states)
**Bundle Impact:** Motion adds ~20KB to JavaScript

**Key Deliverable:** 
- `src/components/atoms/LoadingSpinner.tsx` (used by 10-03)
- `src/app/layout.tsx` with unified dual-provider wrapper (coordinates with 10-02)

**Verification:**
- All buttons show 150ms hover animation (scale 1.05 + shadow)
- All buttons show 100ms press animation (scale 0.98)
- LoadingSpinner rotates continuously at 1s interval
- Form displays spinner during submission
- Incident list displays spinner during fetch
- Root layout wraps app with both ThemeProvider and MotionConfig
- All animations disabled when `prefers-reduced-motion: reduce` enabled
- No console errors; TypeScript builds cleanly

---

### Plan 10-02: Dark Mode with next-themes + Tailwind v4
**Wave:** 1 (sequential with 10-01, DOES NOT modify layout.tsx)
**Duration:** 4-5 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** D4.1, D4.2, D4.3, D4.4, D4.5, D4.6

**Scope:**
- Create ThemeToggle component with light/dark mode toggle button
- Integrate ThemeToggle into Header component
- Update globals.css with `@custom-variant dark` for Tailwind v4
- Verify/add dark mode color overrides (SIAG colors adjusted for contrast)
- Implement 7+ tests covering theme toggling, localStorage persistence, system preference detection
- Manual verification: no hydration flashing, color contrast, print styles

**Files Modified:** 5 (Header.tsx, ThemeToggle.tsx, globals.css, test file, package.json)
**Test Coverage:** 7+ tests (toggle, persistence, system preference, contrast)
**External Dependencies:** next-themes v0.4.6 (installed by Plan 10-01)

**Key Deliverable:** Complete dark mode support (toggle, persistence, system preference)

**Verification:**
- ThemeToggle button appears in Header
- Clicking toggle switches modes immediately
- Theme persists to localStorage
- No flashing on page load (hard refresh test)
- System preference (prefers-color-scheme) detected on first visit
- All text readable in both modes (WCAG AA: 4.5:1)
- Print styles apply (black text on white, no dark mode styling)
- No console errors; TypeScript builds cleanly

---

### Plan 10-03: PDF Export with Puppeteer + Title Page + Headers/Footers
**Wave:** 2 (depends on Wave 1 for LoadingSpinner)
**Duration:** 7-8 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** P1.1, P1.2, P1.3, P1.4, P1.5, P1.6
**Dependency:** 10-01 (LoadingSpinner component)

**Scope:**
- Install @sparticuz/chromium-min (minimal Chromium for serverless)
- Create Puppeteer singleton for browser instance reuse (serverless optimization)
- Create PDF HTML templates (title page + incident details + headers/footers)
- Implement GET `/api/incidents/[id]/export-pdf` route handler
- Update IncidentActions component with PDF download button + loading state
- Implement 10+ tests covering PDF generation, templates, headers/footers, error handling
- Manual verification: cold/warm start timing, Vercel deployment, header/footer appearance

**Files Modified:** 6
**Test Coverage:** 10+ tests (templates, headers/footers, route handler, error handling, filename format)
**External Dependencies:** Puppeteer v24.40.0 (already installed), @sparticuz/chromium-min

**Key Deliverable:** Professional PDF export with title page, multi-page layout, and professional headers/footers

**Verification:**
- PDF downloads when user clicks "Download PDF"
- Title page includes SIAG logo, incident ID, date, severity, type
- Details page includes playbook checklist, affected systems, metadata
- **Headers appear on all pages (except title) with incident ID (left) and date (right)**
- **Footers appear on all pages (except title) with page numbers ("Page X of Y")**
- Multi-page layout with proper page breaks
- Printer-ready styling (no bright backgrounds, ≥12pt fonts)
- Cold start <30 seconds on Vercel (first request)
- Warm start <5 seconds on Vercel (subsequent requests)
- Filename format: `incident-{id}-{YYYY-MM-DD}.pdf`
- 404 for non-existent incident
- 500 with error message if generation fails
- No console errors; TypeScript builds cleanly

---

## Wave Structure & Execution Order

```
WAVE 1 (Sequential execution due to shared layout.tsx)
├── 10-01: Motion + Button States + Loading Spinner + Root Layout Providers (6-7 hours)
│   ├── Task 2: Single coordinated edit to src/app/layout.tsx
│   │   └── Installs both motion@12.38.0 and next-themes@0.4.6
│   │   └── Creates unified wrapper: <ThemeProvider><MotionConfig>{children}</MotionConfig></ThemeProvider>
│   └── Creates: LoadingSpinner component, MotionConfig wrapper, dual-provider root layout
│
└── 10-02: Dark Mode with next-themes + Tailwind v4 (4-5 hours)
    ├── Does NOT modify layout.tsx again (already done by 10-01)
    ├── Creates: ThemeToggle button, dark mode styling
    └── Integrates ThemeToggle into Header and updates globals.css

     ↓ (upon completion of BOTH Wave 1 plans)

WAVE 2 (Sequential)
└── 10-03: PDF Export with Puppeteer + Headers/Footers (7-8 hours)
    └── Depends on: LoadingSpinner from 10-01
    └── Creates: PDF export endpoint, IncidentActions component
```

**Timeline:**
- Wave 1: Runs sequentially (10-11 hours wall-clock time)
  - 10-01: 6-7 hours (including coordinated layout.tsx edit)
  - 10-02: 4-5 hours (refines layout established by 10-01)
- Wave 2: Starts after Wave 1 (7-8 hours)
- **Total:** 13-15 hours wall-clock time (17-20 hours of work distributed)

**Sequential benefit:** Running 10-01 then 10-02 sequentially avoids file merge conflicts while sharing the single root layout edit.

---

## Dependency Graph

```
10-01 (Motion + Root Layout)
  ├── Creates: LoadingSpinner component
  │   └── Used by: 10-03 (IncidentActions button)
  ├── Creates: MotionConfig wrapper
  │   └── Used by: Root layout (app-wide)
  └── Modifies: src/app/layout.tsx (unified ThemeProvider + MotionConfig wrapper)

10-02 (Dark Mode)
  ├── Creates: ThemeToggle component
  │   └── Used by: Header
  ├── Creates: Dark mode CSS variables
  │   └── Used by: All components (automatic via Tailwind dark: prefix)
  └── Does NOT modify layout.tsx (already set up by 10-01)

10-03 (PDF Export)
  └── Depends on: 10-01 (LoadingSpinner)
  └── Creates: PDF export endpoint
      └── Used by: IncidentActions component
```

**No file conflicts between 10-02 and 10-03** → 10-02 can complete before 10-03 starts
**10-03 depends on 10-01's LoadingSpinner** → Must wait for Wave 1
**10-01 and 10-02 both touch layout.tsx** → Sequential execution with single coordinated edit

---

## Requirements Mapping

All Phase 10 requirements from ROADMAP are distributed across the three plans:

| Requirement | Plan | Task | Status |
|-------------|------|------|--------|
| D3.1 | 10-01 | Motion animations with 150ms hover, 100ms press | ✓ |
| D3.2 | 10-01 | LoadingSpinner (1s rotation, 12-frame animation) | ✓ |
| D3.3 | 10-01 | prefers-reduced-motion accessibility compliance | ✓ |
| D4.1 | 10-02 | Dark mode toggle in header | ✓ |
| D4.2 | 10-02 | Theme persistence to localStorage + system preference | ✓ |
| D4.3 | 10-02 | Dark-optimized colors with sufficient contrast | ✓ |
| D4.4 | 10-02 | Dark mode integration without hydration flashing | ✓ |
| D4.5 | 10-02 | Dark mode respects system preference (prefers-color-scheme) | ✓ |
| D4.6 | 10-02 | Print styles optimized for both light and dark modes | ✓ |
| P1.1 | 10-03 | PDF export endpoint for incidents | ✓ |
| P1.2 | 10-03 | Professional title page with SIAG logo | ✓ |
| P1.3 | 10-03 | Multi-page layout with page breaks | ✓ |
| P1.4 | 10-03 | Printer-ready styling + professional headers/footers | ✓ |
| P1.5 | 10-03 | Serverless optimization (Puppeteer singleton) | ✓ |
| P1.6 | 10-03 | Client-side loading spinner during export | ✓ |

**Coverage:** 100% (15/15 requirements addressed)

---

## Critical Success Factors

### Animation (10-01)
- ✅ Motion library properly installed and configured
- ✅ MotionConfig with `reducedMotion="user"` at app root
- ✅ All interactive elements (buttons, cards) show animations
- ✅ Animations disabled for accessibility-sensitive users
- ✅ No performance regression (bundle size, LCP)
- ✅ Root layout unified with ThemeProvider (coordinated with 10-02)

### Dark Mode (10-02)
- ✅ No hydration flashing on page load
- ✅ Theme persists across browser refresh
- ✅ System preference detected on first visit
- ✅ All colors meet WCAG AA contrast ratios (4.5:1)
- ✅ Print styles override dark mode (black on white)
- ✅ ThemeProvider properly integrated in root layout (set up by 10-01)

### PDF Export (10-03)
- ✅ Puppeteer cold start <30 seconds on Vercel
- ✅ Warm start <5 seconds (singleton reuse)
- ✅ PDF contains all incident data (playbook, metadata, affected systems)
- ✅ Title page includes SIAG logo and incident metadata
- ✅ Multi-page layout with proper CSS page breaks
- ✅ **Professional headers on all pages (except title) with incident ID and date**
- ✅ **Professional footers on all pages (except title) with page numbers**

---

## Known Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Animations cause performance regression | Low | High | Monitor LCP/CLS with DevTools; Motion is tree-shakeable (import only needed features) |
| Dark mode causes hydration mismatch (flashing) | Medium | Medium | next-themes handles this automatically; verify with hard refresh test |
| layout.tsx merge conflict between 10-01 and 10-02 | Medium | High | **Use single coordinated edit in Task 2 of 10-01; 10-02 does NOT modify layout.tsx** |
| Puppeteer exceeds 30s timeout on Vercel cold start | Medium | High | Use @sparticuz/chromium-min (50MB), singleton browser instance, waitUntil: 'networkidle0' |
| PDF headers/footers don't appear on all pages | Low | Medium | Use CSS @page rules with top-center/bottom-center content; test on first page exclusion |
| Color contrast insufficient in dark mode | Low | High | Test with WAVE/WebAIM contrast checker; adjust SIAG colors as needed |
| PDF generation fails with specific incident data | Low | Medium | Comprehensive error handling (500 response); test with real incident data |

---

## Testing Strategy

### Unit Tests
- Motion: 8+ tests (animations defined, loading states, accessibility)
- Dark Mode: 7+ tests (toggle, persistence, system preference, contrast)
- PDF: 10+ tests (templates, headers/footers, route handler, error cases, filename format)
- **Total:** 25+ tests (all must pass before merge)

### Integration Tests
- Motion: Test button hover/press with React Testing Library
- Dark Mode: Test toggle persistence with localStorage + page reload
- PDF: Test full flow (click button → fetch → download) with mocked Puppeteer

### Manual/E2E Tests
- Dark Mode: Hard refresh, system preference emulation, cross-browser (Chrome/Firefox/Safari)
- PDF: Local dev + Vercel deployment, cold/warm start timing, file integrity, header/footer appearance

### Performance Tests
- Motion: Bundle size increase (target: <25KB for Motion)
- Dark Mode: No additional CSS (Tailwind dark: prefix is native)
- PDF: Cold start <30s, warm start <5s on Vercel (measure with DevTools/logs)

---

## Blockers & Dependencies

**Phase 10 Blockers:**
- Phase 9 completion (✅ complete as of 2026-04-07)

**Phase 10 Blocks:**
- Phase 11 (Multi-Type Playbooks) depends on Phase 10's PDF export for compliance documentation

**Internal Blockers:**
- 10-03 depends on LoadingSpinner from 10-01 (Wave 2 dependency)
- **10-01 and 10-02 share layout.tsx:** Mitigated by single coordinated edit in 10-01; 10-02 does NOT modify layout again

---

## Checklist for Execution

### Before Starting
- [ ] Read RESEARCH.md (already completed)
- [ ] Verify Phase 9 is complete (useIncident hook, incident list, API integration)
- [ ] Fresh context window: `/clear` before starting execution

### Wave 1 (Sequential, not parallel)
- [ ] 10-01: Motion + Button States + Loading Spinner + Root Layout Providers
  - [ ] Install motion@12.38.0 and next-themes@0.4.6
  - [ ] Create MotionConfig module
  - [ ] Update root layout with UNIFIED dual-provider wrapper (ThemeProvider + MotionConfig)
  - [ ] Implement Button animations
  - [ ] Implement LoadingSpinner
  - [ ] Update cards, forms, list
  - [ ] Write 8+ tests
  - [ ] Verify accessibility
  - [ ] Commit changes
  
- [ ] 10-02: Dark Mode with next-themes
  - [ ] Create ThemeToggle component
  - [ ] Integrate ThemeToggle in Header
  - [ ] Update globals.css with dark mode colors and @custom-variant dark
  - [ ] Write 7+ tests
  - [ ] Manual verification (no flashing, contrast, print)
  - [ ] **NOTE:** Do NOT modify layout.tsx (already done by 10-01)
  - [ ] Commit changes

### Wave 2 (Sequential, after Wave 1)
- [ ] 10-03: PDF Export with Puppeteer
  - [ ] Install @sparticuz/chromium-min
  - [ ] Create Puppeteer singleton
  - [ ] Create PDF templates (with header/footer HTML and CSS)
  - [ ] Implement PDF route handler
  - [ ] Update IncidentActions component
  - [ ] Write 10+ tests (including header/footer tests)
  - [ ] Manual verification (local + Vercel, headers/footers visible)
  - [ ] Commit changes

### Completion
- [ ] All 25+ tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Commit message: `docs(10): complete motion, dark mode, and pdf export — phase 10 ready`
- [ ] Update ROADMAP.md: Phase 10 status → Complete
- [ ] Create Phase 10 SUMMARY.md with execution metrics

---

## File Structure After Completion

```
src/
├── app/
│   ├── layout.tsx (updated: unified ThemeProvider + MotionConfig wrapper)
│   ├── globals.css (updated: @custom-variant dark, dark mode colors)
│   └── api/
│       └── incidents/
│           └── [id]/
│               └── export-pdf/
│                   └── route.ts (new)
├── components/
│   ├── atoms/
│   │   ├── Button.tsx (updated: motion.button)
│   │   ├── LoadingSpinner.tsx (new)
│   │   └── ThemeToggle.tsx (new)
│   ├── cards/
│   │   └── IncidentCard.tsx (updated: motion.div with whileHover)
│   ├── forms/
│   │   └── StepForm.tsx (updated: show spinner during submission)
│   ├── Header.tsx (updated: integrate ThemeToggle)
│   ├── IncidentList.tsx (updated: show spinner during fetch)
│   └── IncidentActions.tsx (new: PDF download button)
├── lib/
│   ├── motion-config.ts (new)
│   ├── pdf-templates.ts (new: includes header/footer HTML generation)
│   ├── puppeteer-singleton.ts (new)
│   └── incident-types.ts (unchanged, shared types)
├── hooks/
│   └── useIncident.ts (unchanged, from Phase 9)
└── __tests__/
    ├── components/
    │   ├── motion.test.tsx (new)
    │   └── dark-mode.test.tsx (new)
    └── api/
        └── export-pdf.test.ts (new)
```

---

## Notes for Executor

1. **Wave 1 is sequential, not parallel:** Execute 10-01 first (Task 2 establishes unified root layout), then 10-02 (which uses the layout already set up). Do NOT run them in parallel — this prevents merge conflicts on layout.tsx.

2. **Single coordinated root layout edit:** Task 2 of Plan 10-01 is the ONLY place where layout.tsx is modified. It installs both `motion@12.38.0` and `next-themes@0.4.6` and wraps the app with `<ThemeProvider><MotionConfig>{children}</MotionConfig></ThemeProvider>`. Plan 10-02 does NOT modify layout.tsx again.

3. **LoadingSpinner is critical:** 10-03 depends on the LoadingSpinner from 10-01. Don't start Wave 2 until Wave 1 is complete and tested.

4. **Dark mode has subtle complexity:** next-themes has specific patterns for hydration safety (mounted state check). Review Task 1 of 10-02 carefully.

5. **PDF headers/footers use CSS @page rules:** Headers/footers are rendered via CSS `@page` rules (e.g., `@top-center`, `@bottom-center`), not as separate HTML elements. Test on local dev to ensure they appear on all pages except the title page.

6. **Puppeteer on serverless is finicky:** Test PDF generation on Vercel early. If cold start exceeds 30s, the Puppeteer singleton and chromium-min are critical. Monitor Vercel logs.

7. **Accessibility is non-negotiable:** Test prefers-reduced-motion with actual system settings (not just CSS media query). Real users depend on these animations being disabled.

8. **Print styles matter:** Dark mode CSS can break printing. Verify `@media print` overrides dark mode styling. Test with Ctrl+P on production.

---

## Summary

**Phase 10 delivers premium UX polish with:**
- Smooth, accessible animations (Motion library)
- Complete dark mode support (next-themes + Tailwind)
- Professional PDF export with headers/footers (Puppeteer + serverless)

**Execution plan:**
- Wave 1 (sequential): 10-01 → 10-02 (10-11 hours wall-clock)
  - Single coordinated root layout edit in 10-01 Task 2
  - 10-02 does NOT modify layout.tsx
- Wave 2 (sequential): 10-03 (7-8 hours after Wave 1)
- Total: 13-15 hours wall-clock (17-20 hours distributed work)

**Success criteria:**
- All animations respect accessibility settings
- Dark mode has no hydration flashing
- PDF generation <30s cold start, <5s warm start
- **PDF headers appear on all pages (except title) with incident ID and date**
- **PDF footers appear on all pages (except title) with page numbers**
- 100% of requirements (15/15) addressed
- 25+ tests passing
- Single coordinated root layout edit (no merge conflicts)

**Blocking Phase 11:** PDF export is required for multi-type playbook documentation.
