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
3. **PDF Export (10-03):** Server-side PDF generation with professional title pages

All features are independent at the component level but integrated at the app level (root layout provides Motion and Theme context). Plans execute in 2 waves to minimize context overhead: Waves 1 & 2 run in parallel (Plans 10-01 + 10-02), Wave 2 waits for Wave 1 completion (Plan 10-03 depends on LoadingSpinner from 10-01).

---

## Plan Breakdown

### Plan 10-01: Motion + Button States + Loading Spinner
**Wave:** 1 (parallel with 10-02)
**Duration:** 6-7 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** D3.1, D3.2, D3.3

**Scope:**
- Install Motion v12.38.0
- Create motion configuration module with accessibility settings (`MotionConfig` with `reducedMotion="user"`)
- Update root layout to wrap app with MotionConfig
- Implement animated Button component (whileHover: scale 1.05, whileTap: scale 0.98, 150ms/100ms)
- Create animated LoadingSpinner component (1s continuous rotation)
- Update card components with hover elevation (shadow increase, 150ms ease-out)
- Add spinner to StepForm during submission
- Add spinner to IncidentList during fetch
- Implement 8+ tests covering animations and accessibility

**Files Modified:** 8
**Test Coverage:** 8+ tests (motion animations, accessibility, loading states)
**Bundle Impact:** Motion adds ~20KB to JavaScript

**Key Deliverable:** `src/components/atoms/LoadingSpinner.tsx` (used by 10-03)

**Verification:**
- All buttons show 150ms hover animation (scale 1.05 + shadow)
- All buttons show 100ms press animation (scale 0.98)
- LoadingSpinner rotates continuously at 1s interval
- Form displays spinner during submission
- Incident list displays spinner during fetch
- All animations disabled when `prefers-reduced-motion: reduce` enabled
- No console errors; TypeScript builds cleanly

---

### Plan 10-02: Dark Mode with next-themes + Tailwind v4
**Wave:** 1 (parallel with 10-01)
**Duration:** 4-5 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** D3.4, D3.5, D3.6

**Scope:**
- Install next-themes v0.4.6
- Wrap root layout with ThemeProvider (attribute="class", defaultTheme="system")
- Create ThemeToggle component with light/dark mode toggle button
- Integrate ThemeToggle into Header component
- Update globals.css with `@custom-variant dark` for Tailwind v4
- Verify/add dark mode color overrides (SIAG colors adjusted for contrast)
- Implement 7+ tests covering theme toggling, localStorage persistence, system preference detection
- Manual verification: no hydration flashing, color contrast, print styles

**Files Modified:** 5
**Test Coverage:** 7+ tests (toggle, persistence, system preference, contrast)
**External Dependencies:** next-themes v0.4.6

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

### Plan 10-03: PDF Export with Puppeteer + Title Page
**Wave:** 2 (depends on Wave 1 for LoadingSpinner)
**Duration:** 7-8 hours
**Autonomous:** Yes (no checkpoints)
**Requirements:** P1.1, P1.2, P1.3, P1.4, P1.5, P1.6
**Dependency:** 10-01 (LoadingSpinner component)

**Scope:**
- Install @sparticuz/chromium-min (minimal Chromium for serverless)
- Create Puppeteer singleton for browser instance reuse (serverless optimization)
- Create PDF HTML templates (title page + incident details)
- Implement GET `/api/incidents/[id]/export-pdf` route handler
- Update IncidentActions component with PDF download button + loading state
- Implement 8+ tests covering PDF generation, templates, error handling
- Manual verification: cold/warm start timing, Vercel deployment

**Files Modified:** 6
**Test Coverage:** 8+ tests (templates, route handler, error handling, filename format)
**External Dependencies:** Puppeteer v24.40.0 (already installed), @sparticuz/chromium-min

**Key Deliverable:** Professional PDF export with title page and multi-page layout

**Verification:**
- PDF downloads when user clicks "Download PDF"
- Title page includes SIAG logo, incident ID, date, severity, type
- Details page includes playbook checklist, affected systems, metadata
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
WAVE 1 (Parallel)
├── 10-01: Motion + Button States + Loading Spinner (6-7 hours)
│   └── Creates: LoadingSpinner component
│
└── 10-02: Dark Mode with next-themes (4-5 hours)
    └── Creates: ThemeToggle button, dark mode styling

     ↓ (upon completion of BOTH Wave 1 plans)

WAVE 2 (Sequential)
└── 10-03: PDF Export with Puppeteer (7-8 hours)
    └── Depends on: LoadingSpinner from 10-01
    └── Creates: PDF export endpoint, IncidentActions component
```

**Timeline:**
- Wave 1: Runs in parallel (4-5 hours wall-clock time)
- Wave 2: Starts after Wave 1 (7-8 hours)
- **Total:** 11-13 hours wall-clock time (17-20 hours of work distributed)

**Parallelization Benefit:** Running 10-01 and 10-02 in parallel saves 6-7 hours vs. sequential execution.

---

## Dependency Graph

```
10-01 (Motion)
  ├── Creates: LoadingSpinner component
  │   └── Used by: 10-03 (IncidentActions button)
  └── Creates: MotionConfig wrapper
      └── Used by: Root layout (app-wide)

10-02 (Dark Mode)
  ├── Creates: ThemeToggle component
  │   └── Used by: Header
  └── Creates: Dark mode CSS
      └── Used by: All components (automatic via Tailwind dark: prefix)

10-03 (PDF Export)
  └── Depends on: 10-01 (LoadingSpinner)
  └── Creates: PDF export endpoint
      └── Used by: IncidentActions component
```

**No file conflicts between 10-01 and 10-02** → Can execute in parallel
**10-03 depends on 10-01's LoadingSpinner** → Must wait for Wave 1

---

## Requirements Mapping

All Phase 10 requirements from ROADMAP are distributed across the three plans:

| Requirement | Plan | Task | Status |
|-------------|------|------|--------|
| D3.1 | 10-01 | Motion animations with 150ms hover, 100ms press | ✓ |
| D3.2 | 10-01 | LoadingSpinner (1s rotation, 12-frame animation) | ✓ |
| D3.3 | 10-01 | prefers-reduced-motion accessibility compliance | ✓ |
| D3.4 | 10-02 | Dark mode toggle in header | ✓ |
| D3.5 | 10-02 | Theme persistence to localStorage + system preference | ✓ |
| D3.6 | 10-02 | Dark-optimized colors with sufficient contrast | ✓ |
| P1.1 | 10-03 | PDF export endpoint for incidents | ✓ |
| P1.2 | 10-03 | Professional title page with SIAG logo | ✓ |
| P1.3 | 10-03 | Multi-page layout with page breaks | ✓ |
| P1.4 | 10-03 | Printer-ready styling | ✓ |
| P1.5 | 10-03 | Serverless optimization (Puppeteer singleton) | ✓ |
| P1.6 | 10-03 | Client-side loading spinner during export | ✓ |

**Coverage:** 100% (12/12 requirements addressed)

---

## Critical Success Factors

### Animation (10-01)
- ✅ Motion library properly installed and configured
- ✅ MotionConfig with `reducedMotion="user"` at app root
- ✅ All interactive elements (buttons, cards) show animations
- ✅ Animations disabled for accessibility-sensitive users
- ✅ No performance regression (bundle size, LCP)

### Dark Mode (10-02)
- ✅ No hydration flashing on page load
- ✅ Theme persists across browser refresh
- ✅ System preference detected on first visit
- ✅ All colors meet WCAG AA contrast ratios (4.5:1)
- ✅ Print styles override dark mode (black on white)

### PDF Export (10-03)
- ✅ Puppeteer cold start <30 seconds on Vercel
- ✅ Warm start <5 seconds (singleton reuse)
- ✅ PDF contains all incident data (playbook, metadata, affected systems)
- ✅ Title page includes SIAG logo and incident metadata
- ✅ Multi-page layout with proper CSS page breaks

---

## Known Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Animations cause performance regression | Low | High | Monitor LCP/CLS with DevTools; Motion is tree-shakeable (import only needed features) |
| Dark mode causes hydration mismatch (flashing) | Medium | Medium | next-themes handles this automatically; verify with hard refresh test |
| Puppeteer exceeds 30s timeout on Vercel cold start | Medium | High | Use @sparticuz/chromium-min (50MB), singleton browser instance, waitUntil: 'networkidle0' |
| Color contrast insufficient in dark mode | Low | High | Test with WAVE/WebAIM contrast checker; adjust SIAG colors as needed |
| PDF generation fails with specific incident data | Low | Medium | Comprehensive error handling (500 response); test with real incident data |

---

## Testing Strategy

### Unit Tests
- Motion: 8+ tests (animations defined, loading states, accessibility)
- Dark Mode: 7+ tests (toggle, persistence, system preference, contrast)
- PDF: 8+ tests (templates, route handler, error cases, filename format)
- **Total:** 23+ tests (all must pass before merge)

### Integration Tests
- Motion: Test button hover/press with React Testing Library
- Dark Mode: Test toggle persistence with localStorage + page reload
- PDF: Test full flow (click button → fetch → download) with mocked Puppeteer

### Manual/E2E Tests
- Dark Mode: Hard refresh, system preference emulation, cross-browser (Chrome/Firefox/Safari)
- PDF: Local dev + Vercel deployment, cold/warm start timing, file integrity

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

**No Internal Blockers** between 10-01, 10-02, 10-03 except:
- 10-03 depends on LoadingSpinner from 10-01 (Wave 2 dependency)

---

## Checklist for Execution

### Before Starting
- [ ] Read RESEARCH.md (already completed)
- [ ] Verify Phase 9 is complete (useIncident hook, incident list, API integration)
- [ ] Fresh context window: `/clear` before starting execution

### Wave 1 (Parallel)
- [ ] 10-01: Motion + Button States + Loading Spinner
  - [ ] Install Motion v12.38.0
  - [ ] Create MotionConfig module
  - [ ] Update root layout
  - [ ] Implement Button animations
  - [ ] Implement LoadingSpinner
  - [ ] Update cards, forms, list
  - [ ] Write 8+ tests
  - [ ] Verify accessibility
  - [ ] Commit changes
  
- [ ] 10-02: Dark Mode with next-themes
  - [ ] Install next-themes v0.4.6
  - [ ] Update root layout with ThemeProvider
  - [ ] Create ThemeToggle component
  - [ ] Integrate ThemeToggle in Header
  - [ ] Update globals.css with dark mode colors
  - [ ] Write 7+ tests
  - [ ] Manual verification (no flashing, contrast, print)
  - [ ] Commit changes

### Wave 2 (Sequential, after Wave 1)
- [ ] 10-03: PDF Export with Puppeteer
  - [ ] Install @sparticuz/chromium-min
  - [ ] Create Puppeteer singleton
  - [ ] Create PDF templates
  - [ ] Implement PDF route handler
  - [ ] Update IncidentActions component
  - [ ] Write 8+ tests
  - [ ] Manual verification (local + Vercel)
  - [ ] Commit changes

### Completion
- [ ] All 23+ tests passing
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
│   ├── layout.tsx (updated: MotionConfig + ThemeProvider)
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
│   ├── pdf-templates.ts (new)
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

1. **Wave 1 runs in parallel:** Start 10-01 and 10-02 simultaneously in separate context windows if possible. They have no file conflicts and can run concurrently.

2. **LoadingSpinner is critical:** 10-03 depends on the LoadingSpinner from 10-01. Don't start Wave 2 until Wave 1 is complete and tested.

3. **Dark mode has subtle complexity:** next-themes has specific patterns for hydration safety (mounted state check). Review Task 2 of 10-02 carefully.

4. **Puppeteer on serverless is finicky:** Test PDF generation on Vercel early. If cold start exceeds 30s, the Puppeteer singleton and chromium-min are critical. Monitor Vercel logs.

5. **Accessibility is non-negotiable:** Test prefers-reduced-motion with actual system settings (not just CSS media query). Real users depend on these animations being disabled.

6. **Print styles matter:** Dark mode CSS can break printing. Verify `@media print` overrides dark mode styling. Test with Ctrl+P on production.

---

## Summary

**Phase 10 delivers premium UX polish with:**
- Smooth, accessible animations (Motion library)
- Complete dark mode support (next-themes + Tailwind)
- Professional PDF export (Puppeteer + serverless)

**Execution plan:**
- Wave 1 (parallel): 10-01 + 10-02 (4-5 hours wall-clock)
- Wave 2 (sequential): 10-03 (7-8 hours after Wave 1)
- Total: 11-13 hours wall-clock (17-20 hours distributed work)

**Success criteria:**
- All animations respect accessibility settings
- Dark mode has no hydration flashing
- PDF generation <30s cold start, <5s warm start
- 100% of requirements (12/12) addressed
- 23+ tests passing

**Blocking Phase 11:** PDF export is required for multi-type playbook documentation.
