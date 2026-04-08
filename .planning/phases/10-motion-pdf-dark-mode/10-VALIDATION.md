---
phase: 10
slug: motion-pdf-dark-mode
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-08
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 10 is **complete**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 (existing) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test:coverage` |

---

## Sampling Rate

- **After every task commit:** `npm run test` (quick Vitest run)
- **After every plan wave:** `npm run test:coverage` (full coverage report)
- **Phase gate:** Full suite green + manual visual inspection (animations, dark mode, PDF quality)

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| MOTION-01 | Button shows hover state (150ms ease-out transition) | unit | `npm run test -- motion/Button` | ✅ green |
| MOTION-02 | Button shows press state (100ms scale 0.98) | unit | `npm run test -- motion/Button` | ✅ green |
| MOTION-03 | Card elevates on hover with shadow increase | unit | `npm run test -- motion/Card` | ✅ green |
| MOTION-04 | Loading spinner animates (1s rotation) | unit | `npm run test -- motion/Spinner` | ✅ green |
| MOTION-05 | prefers-reduced-motion:reduce disables animations | unit | `npm run test -- motion/Accessibility` | ✅ green |
| PDF-01 | PDF export generates valid PDF file | integration | `npm run test -- pdf/Export.test.ts` | ✅ green |
| PDF-02 | Title page renders with SIAG logo and metadata | integration | `npm run test -- pdf/TitlePage.test.ts` | ✅ green |
| PDF-03 | Multi-page layout includes page breaks | integration | `npm run test -- pdf/Layout.test.ts` | ✅ green |
| DARK-01 | Theme toggle switches between light/dark | unit | `npm run test -- dark/ThemeToggle.test.ts` | ✅ green |
| DARK-02 | Theme preference persists to localStorage | integration | `npm run test -- dark/Persistence.test.ts` | ✅ green |
| DARK-03 | All text readable in both light and dark modes | manual | Visual inspection + lighthouse | ✅ verified |
| DARK-04 | Print styles work with dark mode (no bright backgrounds) | manual | Ctrl+P test | ✅ verified |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Status |
|----------|-------------|------------|--------|
| All text readable in light/dark modes | DARK-03 | Visual inspection | ✅ passed |
| Print styles work with dark mode | DARK-04 | Browser print preview | ✅ passed |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 gap files created (motion, pdf, dark mode test files)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete — animations, PDF export, and dark mode verified; phase complete
