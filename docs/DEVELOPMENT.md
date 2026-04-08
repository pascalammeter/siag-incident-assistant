<!-- gsd:generated -->
# Development

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 16.2.2 | Framework (App Router, SSR + Vercel Functions) |
| React | 19.x | UI |
| TypeScript | 5.x | Language |
| Tailwind CSS | v4 | Styling |
| react-hook-form | 7.x | Form state management |
| Zod | 4.x | Schema validation |
| @hookform/resolvers | 5.x | Connects Zod to react-hook-form |
| Vitest | 4.x | Test framework |

## Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build static export to out/
npm run start    # Serve the Next.js production build (not static — use after next build without output:export)
npm run lint     # Run ESLint
npm test         # Run Vitest in watch mode
```

## Code Conventions

### Path Alias

All imports from `src/` must use the `@/` alias:

```ts
// Correct
import { useWizard } from '@/components/wizard/WizardContext'
import type { WizardState } from '@/lib/wizard-types'

// Incorrect — use alias instead
import { useWizard } from '../../components/wizard/WizardContext'
```

### Client Components

Because the project uses `output: 'export'`, all components that use React hooks (`useState`, `useEffect`, `useContext`, `useReducer`) must have `'use client'` at the top. The wizard step components, the context provider, and all form wrappers are Client Components.

```ts
'use client'

import { useWizard } from '@/components/wizard/WizardContext'
```

### TypeScript

Strict mode is enabled. Avoid `any` casts. Use the types exported from `src/lib/wizard-types.ts` and the Zod inference helpers from `src/lib/wizard-schemas.ts`:

```ts
import type { WizardState, StepKey, ErfassenData } from '@/lib/wizard-types'
import type { ErfassenFormData } from '@/lib/wizard-schemas'
```

### Tailwind v4

Tailwind v4 uses CSS `@theme {}` in `globals.css` — there is no `tailwind.config.js`. Use the SIAG brand tokens:

```tsx
// SIAG colors
<div className="bg-navy text-white">          // Dark blue header
<div className="bg-lightgray">               // Light background
<span className="text-amber font-bold">      // Warning / highlight
```

Do not use `bg-siag-navy` or similar namespaced variants — the token prefix is just the color name.

## Adding a New Wizard Step

1. Create `src/components/wizard/steps/StepN{Name}.tsx` as a Client Component.
2. Add the step key to `StepKey` union in `wizard-types.ts` and add the corresponding data interface.
3. Add a Zod schema in `wizard-schemas.ts` and export the inferred type.
4. Add initial state (`null`) for the new step in `initialState` and `WizardState` in `wizard-types.ts`.
5. Handle the new `stepKey` in `wizardReducer` (`UPDATE_STEP` switch — no changes needed if using the generic `[action.stepKey]: action.data` pattern).
6. Register the step component in `WizardShell.tsx`'s `stepComponents` map.
7. Update `MAX_STEP` in `wizard-types.ts`.
8. Update `STEP_LABELS` array in `wizard-types.ts`.

## Adding a New Playbook

Playbooks are defined in `src/lib/playbook-data.ts`. Each playbook implements the `Playbook` interface:

```ts
export const MY_PLAYBOOK: Playbook = {
  incidentType: 'phishing',
  phases: [
    {
      id: 'sofort',
      title: 'Phase 1: Sofortmassnahmen',
      steps: [
        {
          id: 'sofort-01',
          text: 'Step description',
          role: 'IT-Leiter',
          noGoWarning: 'Optional warning displayed prominently',
        },
      ],
    },
  ],
}
```

`noGoWarning` is optional — include it only for steps where doing the wrong thing causes irreversible damage (e.g., rebooting a compromised system).

## Modifying Communication Templates

Templates are generated in `src/lib/communication-templates.ts`. Each template function receives the full `WizardState` and returns a string. Dynamic placeholders use live state values; static placeholders like `[Firmenname]` are left for the user to fill in.

To add a new template:
1. Add a new generator function `generateXTemplate(state: WizardState): string`.
2. Export it from `communication-templates.ts`.
3. Consume it in `Step5Kommunikation.tsx`.

## Severity Logic

The severity calculation is in `calculateSeverity()` in `wizard-schemas.ts`. The rules implement the Swiss incident triage logic per decision D-01:

```ts
calculateSeverity('ja', 'nein', 'nein')        // → 'KRITISCH' (Q1: critical systems)
calculateSeverity('nein', 'ja', 'nein')        // → 'HOCH' (Q2: personal data)
calculateSeverity('nein', 'nein', 'unbekannt') // → 'KRITISCH' (Q3: unknown = worst case)
calculateSeverity('nein', 'nein', 'nein')      // → 'MITTEL'
```

Any change to this logic requires updating the corresponding tests in `src/__tests__/severity.test.ts`.

## localStorage Persistence

The wizard state key is `STORAGE_KEY = 'siag-wizard-state'` (exported constant from `WizardContext.tsx`). The `HYDRATE` action replaces the full state from a parsed JSON object. The hydration guard (`isHydrated`) prevents writing `initialState` over existing saved state on mount.

To clear state programmatically: `dispatch({ type: 'RESET' })`.

## Linting

ESLint is configured via `eslint.config.mjs` using `eslint-config-next`. Run:

```bash
npm run lint
```

## Building for Deployment

```bash
npm run build
```

Next.js builds as SSR (no `output: 'export'` — removed in Phase 13-01 to enable Vercel
Functions). Vercel picks this up automatically via git push. Do not commit the `.next/`
directory (it is in `.gitignore`).

After schema changes, push indexes to Neon:

```bash
npx prisma db push   # non-destructive: creates missing tables/indexes
# or for tracked migrations:
npx prisma migrate dev --name describe-change
```

## Performance Optimization (Phase 13-02)

### What Was Optimized

| Area | Change | Impact |
|------|--------|--------|
| Font | Dropped weight 500 (unused), added `preload: true` | -15KB, -50ms LCP |
| Viewport | Separate `export const viewport` (Next.js 14+) | Lighthouse Best Practices |
| Caching | Cache-Control headers in next.config.ts | Repeat visits ~instant |
| Security | X-Content-Type-Options, X-Frame-Options, Referrer-Policy | Best Practices +5pts |
| Images | AVIF/WebP formats configured, 1yr TTL | -20-40% image transfer |
| DB indexes | deletedAt, (type, deletedAt), (severity, deletedAt) | -10-30ms filtered queries |
| Pagination | Max 50 per page (was 100) | -50% max payload |
| Monitoring | @vercel/analytics + @vercel/speed-insights wired | Real CWV tracking |

### Lighthouse Targets

All categories ≥90. See `docs/lighthouse/` for audit reports.

### Running a Lighthouse Audit

```bash
# Via PageSpeed Insights (recommended — includes field data)
open https://pagespeed.web.dev/report?url=https://siag-incident-assistant.vercel.app

# Via CLI (requires Chrome)
npx lighthouse https://siag-incident-assistant.vercel.app \
  --output=html \
  --output-path=docs/lighthouse/report-$(date +%Y%m%d).html \
  --chrome-flags="--headless"
```

### Performance Monitoring

- **Vercel Analytics**: Visit https://vercel.com/dashboard → your project → Analytics
- **Speed Insights**: Visit https://vercel.com/dashboard → your project → Speed Insights
- **Alert thresholds**: See `docs/PERFORMANCE_BENCHMARKS.md` for recommended alert levels
