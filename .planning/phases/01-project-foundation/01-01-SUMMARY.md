---
phase: 01-project-foundation
plan: 01
subsystem: infra
tags: [nextjs, tailwindcss-v4, typescript, static-export, postcss, siag-branding]

# Dependency graph
requires: []
provides:
  - "Buildable Next.js 16 project with Tailwind v4"
  - "SIAG design tokens (navy, amber, lightgray) as @theme{} CSS tokens"
  - "Static export config (output: export, out/ directory)"
  - "PostCSS pipeline with @tailwindcss/postcss"
affects: [01-02, 01-03, 02-wizard-engine]

# Tech tracking
tech-stack:
  added: [next@16.2.2, react@19.2.4, tailwindcss@4.2.2, "@tailwindcss/postcss@4.2.2", postcss@8.5.8, typescript@5, eslint@9]
  patterns: [tailwind-v4-css-first-config, nextjs-static-export, siag-theme-tokens]

key-files:
  created: [package.json, next.config.ts, postcss.config.mjs, src/app/globals.css, src/app/layout.tsx, src/app/page.tsx, tsconfig.json, eslint.config.mjs, .gitignore]
  modified: []

key-decisions:
  - "Next.js 16.2.2 installed (latest via create-next-app@latest) instead of 15.x -- API-compatible, same static export config"
  - "Tailwind v4 installed manually (create-next-app --tailwind still installs v3)"
  - "No next/font/google in layout -- incompatible with static export, Inter loaded via CSS"

patterns-established:
  - "Tailwind v4 CSS-first: @import tailwindcss + @theme{} in globals.css, no tailwind.config.js"
  - "PostCSS: only @tailwindcss/postcss plugin, no autoprefixer (built-in)"
  - "Static export: output: export + images.unoptimized in next.config.ts"

requirements-completed: [NF3.1, NF3.2, NF3.5, NF3.6, NF2.1, NF2.3, NF5.3]

# Metrics
duration: 4min
completed: 2026-04-02
---

# Phase 1 Plan 01: Next.js + Tailwind v4 Setup Summary

**Next.js 16 with Tailwind v4 CSS-first config, SIAG brand tokens (navy/amber/lightgray), and static export producing out/ directory**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T06:34:16Z
- **Completed:** 2026-04-02T06:38:23Z
- **Tasks:** 1
- **Files modified:** 16

## Accomplishments
- Next.js 16.2.2 project with TypeScript, App Router, and ESLint configured
- Tailwind CSS v4.2.2 with @tailwindcss/postcss plugin (no v3 artifacts)
- SIAG design tokens defined as @theme{} in globals.css (navy, amber, lightgray, Inter font)
- Static export config (output: export) producing out/ directory on build
- Build and lint both pass cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Next.js 16 Projekt erstellen und Tailwind v4 installieren** - `15099b9` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `package.json` - Next.js 16 + Tailwind v4 dependencies
- `next.config.ts` - Static export config with unoptimized images
- `postcss.config.mjs` - @tailwindcss/postcss plugin only
- `src/app/globals.css` - SIAG design tokens via @theme{} + Tailwind v4 import
- `src/app/layout.tsx` - Minimal RootLayout with lang=de and metadata
- `src/app/page.tsx` - Placeholder page with Tailwind utility classes
- `tsconfig.json` - TypeScript config with @/* import alias
- `eslint.config.mjs` - ESLint 9 flat config
- `.gitignore` - Standard Next.js gitignore

## Decisions Made
- Used Next.js 16.2.2 (latest from create-next-app@latest) instead of 15.x as specified in plan -- API-compatible successor, same static export support
- Removed next/font/google from layout (incompatible with static export) -- Inter configured via CSS font-family instead
- Created project in temp directory and copied files (create-next-app refuses to run in non-empty directory)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed next/font/google from layout**
- **Found during:** Task 1 (layout.tsx configuration)
- **Issue:** create-next-app generated layout with Geist font via next/font/google, which requires a server and breaks static export
- **Fix:** Replaced with minimal layout without next/font import, Inter font configured via CSS --font-sans variable
- **Files modified:** src/app/layout.tsx
- **Verification:** npm run build passes, out/ directory generated
- **Committed in:** 15099b9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for static export compatibility. No scope creep.

## Issues Encountered
- create-next-app refuses to run in directory with existing files (.planning/) -- resolved by creating in temp directory and copying files over

## Known Stubs
None - page.tsx placeholder text is intentional and will be replaced in Phase 2.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Build infrastructure complete, ready for Plan 02 (Header/Footer layout)
- Tailwind v4 utility classes (bg-navy, text-amber etc.) available for all components
- Static export verified, out/ directory produced on build

## Self-Check: PASSED

All created files verified on disk. Commit 15099b9 verified in git log.

---
*Phase: 01-project-foundation*
*Completed: 2026-04-02*
