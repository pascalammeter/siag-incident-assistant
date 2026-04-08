---
plan: 13-04
phase: 13
subsystem: uat-and-signoff
tags: [uat, accessibility, documentation, sign-off, readme, mobile]
dependency_graph:
  requires: [13-01, 13-02, 13-03]
  provides: [uat-docs, sign-off-template, accessibility-improvements, v1.1-readme]
  affects: [docs/uat/, SIGN-OFF.md, README.md, src/components/FormField.tsx, src/components/Header.tsx, src/components/atoms/ThemeToggle.tsx, src/app/layout.tsx]
tech_stack:
  added: []
  patterns:
    - "aria-required + aria-invalid + aria-describedby on all form inputs (WCAG AA)"
    - "role=alert + aria-live=polite on error messages (screen reader announcements)"
    - "Skip-to-main-content link (sr-only, visible on focus)"
    - "nav landmark with aria-label for keyboard navigation"
key_files:
  created:
    - docs/uat/UAT_SETUP.md
    - docs/uat/UAT_CHECKLIST.md
    - SIGN-OFF.md
  modified:
    - README.md
    - src/components/FormField.tsx
    - src/components/Header.tsx
    - src/components/atoms/ThemeToggle.tsx
    - src/app/layout.tsx
decisions:
  - "Git tag v1.1.0 deferred until consultant provides written sign-off — NOT created in this plan"
  - "UAT conducted against production URL (no staging) — app has no PII, test data is safe to clean up post-UAT"
  - "ThemeToggle aria-label made dynamic (describes target state, not toggle action)"
  - "FormField error div uses role=alert (not aria-live region on parent) for immediate announcement"
metrics:
  duration_seconds: 900
  completed_at: "2026-04-08"
  tasks_completed: 5
  tasks_total: 7
  files_created: 3
  files_modified: 5
---

# Phase 13 Plan 04: UAT & Consultant Sign-off Summary

## One-liner

UAT documentation package (setup guide, 300-line checklist, sign-off template) + WCAG AA accessibility fixes + v1.1 README — consultant session and git tag pending human action.

## What Was Built

### Task 1: UAT Environment Setup (docs/uat/UAT_SETUP.md)

Created a consultant-facing setup document covering:
- Production UAT URL (https://siag-incident-assistant.vercel.app)
- v1.0 vs v1.1 feature comparison table
- Access instructions (no login required)
- UAT timeline (~2.5–3 hours)
- Data isolation notes (test data soft-deleteable post-UAT)
- Issue triage guidance (critical vs cosmetic)
- Post-UAT cleanup steps

### Task 2: UAT Checklist (docs/uat/UAT_CHECKLIST.md)

300-line comprehensive test checklist covering:
- **Pre-test setup** (page load, console errors, navigation)
- **Ransomware** (full wizard, PDF export, compliance deadlines, resume, persistence)
- **Phishing** (wizard, phishing-specific fields, PDF)
- **DDoS** (wizard, attack fields, PDF)
- **Data Loss** (wizard, FINMA 24/72h logic, DSG, PDF)
- **Incident list** (filters, sorting, soft-delete)
- **Mobile** (375px, 44px targets, 3G simulation)
- **Accessibility** (keyboard nav, VoiceOver/NVDA, color contrast)
- **Dark mode** (all wizard steps, PDF in dark mode)
- **Data migration** (v1.0 localStorage auto-migrate)
- **Performance** (load times, spinner visibility)
- Overall assessment table + issue tracking template

### Task 3: Mobile & Accessibility Code Improvements

Audited all components. Found and fixed 4 accessibility gaps (Rule 2 — missing critical functionality):

1. **FormField.tsx** — Added `aria-required`, `aria-invalid`, `aria-describedby` to all input types (textarea, select, input). Error div gets `role="alert"` + `aria-live="polite"` for screen reader announcements. Helper text gets unique `id` for `aria-describedby` association. Required indicator `*` is `aria-hidden` with sr-only "(required)" text.

2. **Header.tsx** — Added `<nav aria-label="Hauptnavigation">` landmark with navigation links (Wizard, Incidents) using Next.js `<Link>` with visible focus rings. Changed `<h1>` to `<span>` (page heading should come from page content, not persistent chrome).

3. **ThemeToggle.tsx** — Touch target increased from 40px (w-10 h-10) to 44px (w-11 h-11). `aria-label` made dynamic to describe the target state ("Switch to light mode" / "Switch to dark mode") rather than the action.

4. **layout.tsx** — Added skip-to-main-content link (`sr-only`, becomes visible on keyboard focus). `<main>` element gets `id="main-content"` as skip link target.

**Confirmed already correct:**
- Button.tsx: `min-h-[44px]` was already present — 44px touch target
- ThemeToggle.tsx: `aria-label` was already present (updated wording)
- layout.tsx: `lang="de"` already set (correct for Swiss German app)
- layout.tsx: `<main>` landmark already in place

### Task 5: SIGN-OFF.md Template

Created consultant sign-off template at project root with:
- Pre-filled version (v1.1.0) and production URL
- UAT summary table (11 test areas, Pass/Fail checkboxes)
- Issue tracking table with severity scale
- Conditions section for conditional sign-off
- Formal sign-off statement (consultant fills name/date/email)
- Post-sign-off next steps (git tag, CHANGELOG, stakeholder email, database cleanup)
- Clearly marked as TEMPLATE — not a completed sign-off

### Task 6: README.md Update

Complete rewrite of README.md for v1.1:
- Badges: version (v1.1.0-rc), tests (99+), Vercel deployment, OWASP A-grade
- Release history table (v1.0.0 vs v1.1.0-rc)
- v1.1 feature list (4 incident types, compliance, mobile, accessibility)
- Tech stack table (Next.js 16, Neon, Prisma, Zod, Motion, Vitest)
- Quick start guide, environment variables, test commands
- API routes reference table
- Documentation index (including new UAT docs, SIGN-OFF.md)
- UAT status checklist (3 items pending human action)

---

## Deviations from Plan

### Tasks Not Executable (Human Action Required)

**Task 4: Consultant Feedback Collection**
- Status: Pending human action
- Reason: Requires physical UAT session with SIAG consultant
- What's prepared: UAT_CHECKLIST.md provides all feedback questions; UAT_SETUP.md has access instructions

**Task 7: Post-Release Monitoring**
- Status: Pending (after sign-off and tag)
- Reason: Monitoring only relevant after production promotion
- What's prepared: SIGN-OFF.md lists post-sign-off steps including monitoring setup

**v1.1.0 git tag:**
- Status: NOT created — deferred to human action after consultant sign-off
- Documented clearly in SIGN-OFF.md next-steps section

### Auto-fixed Issues (Rule 2 — Missing Critical Accessibility Functionality)

**1. [Rule 2 - Accessibility] FormField missing aria-invalid and aria-describedby**
- **Found during:** Task 3 code audit
- **Issue:** Form validation errors were visually displayed but not exposed to screen readers; aria-invalid not set when field has error; error message not linked to input via aria-describedby
- **Fix:** Added aria-required, aria-invalid, aria-describedby to all three input variants; error div gets role=alert + aria-live=polite; unique IDs for all descriptive elements
- **Files modified:** src/components/FormField.tsx
- **Commit:** 8ff4f2c

**2. [Rule 2 - Accessibility] Header missing nav landmark and navigation links**
- **Found during:** Task 3 code audit
- **Issue:** Header had no nav landmark — keyboard/screen reader users cannot navigate to the Incidents page without it. No navigation links existed in the header.
- **Fix:** Added nav with aria-label, navigation links to / and /incidents using Next.js Link with focus-visible styles
- **Files modified:** src/components/Header.tsx
- **Commit:** 8ff4f2c

**3. [Rule 2 - Accessibility] ThemeToggle below 44px touch target**
- **Found during:** Task 3 code audit
- **Issue:** w-10 h-10 = 40px; WCAG 2.5.5 recommends 44px minimum touch target
- **Fix:** Changed to w-11 h-11 = 44px; dynamic aria-label describing target state
- **Files modified:** src/components/atoms/ThemeToggle.tsx
- **Commit:** 8ff4f2c

**4. [Rule 2 - Accessibility] No skip-to-main-content link**
- **Found during:** Task 3 code audit
- **Issue:** Keyboard users must tab through entire header navigation on every page load with no way to skip to content
- **Fix:** Added sr-only skip link that becomes visible on focus; main element gets id for anchor target
- **Files modified:** src/app/layout.tsx
- **Commit:** 8ff4f2c

### Pre-existing Build Issue (Not Caused by This Plan)

The `npx next build` command fails with a Turbopack workspace-root detection error in the worktree environment. Verified by running the build both with and without this plan's changes — identical error in both cases. This is a Turbopack path-detection limitation when Next.js is run from a deeply-nested git worktree path (`.claude/worktrees/agent-a483183b/`). The code changes are syntactically valid TypeScript/React. Production builds on Vercel (which runs from the main repo root) are not affected.

---

## Human-Required Actions (Pending)

The following items require human action and are NOT complete:

| Action | Who | When | What's Prepared |
|--------|-----|------|----------------|
| Send UAT invite to consultant | Pascal / team | Before UAT | UAT_SETUP.md + UAT_CHECKLIST.md ready |
| Conduct UAT session | SIAG consultant | Scheduled | Full checklist at docs/uat/UAT_CHECKLIST.md |
| Provide written sign-off | SIAG consultant | After UAT | SIGN-OFF.md template ready |
| Create git tag v1.1.0 | Pascal | After sign-off | CHANGELOG.md already has the entry |
| Send stakeholder announcement | Pascal | After tag | Draft from SIGN-OFF.md next-steps |

---

## Known Stubs

None. All documentation is complete and actionable. The SIGN-OFF.md is a template (by design) with placeholders — this is intentional, not a stub. The UAT_CHECKLIST.md is fully pre-filled with test steps requiring only checkbox ticks.

---

## Threat Flags

None. This plan added no new network endpoints, auth paths, file access patterns, or schema changes. Accessibility improvements are purely additive HTML attributes. Navigation links point to existing routes.

---

## Self-Check: PASSED

| File | Status |
|------|--------|
| docs/uat/UAT_SETUP.md | FOUND |
| docs/uat/UAT_CHECKLIST.md | FOUND |
| SIGN-OFF.md | FOUND |
| README.md (updated) | FOUND |
| src/components/FormField.tsx (aria attrs) | FOUND |
| src/components/Header.tsx (nav landmark) | FOUND |
| src/components/atoms/ThemeToggle.tsx (44px) | FOUND |
| src/app/layout.tsx (skip link) | FOUND |
| Commit 89fa2b1 (Task 1: UAT_SETUP.md) | FOUND |
| Commit 670f8c8 (Task 2: UAT_CHECKLIST.md) | FOUND |
| Commit 8ff4f2c (Task 3: accessibility fixes) | FOUND |
| Commit f29a81e (Task 5: SIGN-OFF.md) | FOUND |
| Commit 50a75c9 (Task 6: README.md) | FOUND |
