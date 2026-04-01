# SIAG Incident Management Assistant — Technical Research

**Researched:** 2026-04-01
**Confidence:** HIGH (all major claims verified against official Next.js and Vercel docs)

---

## 1. Next.js 15 Static Export — Exact Setup

**Do this in `next.config.ts`:**

```ts
const nextConfig = {
  output: 'export',
  // Optional: add trailing slash for cleaner hosting
  trailingSlash: true,
}
export default nextConfig
```

`next build` produces an `out/` directory with static HTML/CSS/JS. Deploy that folder.

### Hard limits with `output: 'export'` (App Router)

These features are completely unavailable — using them causes a build error:

| Feature | Status |
|---|---|
| Server Actions | NOT SUPPORTED |
| cookies() / headers() | NOT SUPPORTED |
| Dynamic routes without generateStaticParams() | NOT SUPPORTED |
| ISR / revalidate | NOT SUPPORTED |
| Rewrites / Redirects in next.config | NOT SUPPORTED |
| next/image default loader | NOT SUPPORTED (needs custom loader or unoptimized) |
| Draft Mode | NOT SUPPORTED |

**Image fix for MVP:** Add `images: { unoptimized: true }` to avoid the image loader error if you use `<Image>`.

**What DOES work:** Server Components (run at build time), Client Components, Route Handlers (GET only, static), SWR for client-side fetching, all Tailwind/CSS.

### Phase 2 migration path

Remove `output: 'export'` and `trailingSlash: true`. The rest of the app (App Router, Server Components, Client Components) needs zero changes. Server Actions and API routes just start working.

**Source:** [Next.js Static Exports docs](https://nextjs.org/docs/app/guides/static-exports) (verified 2026-03-31)

---

## 2. Multi-Step Wizard State Management

**Decision: `useReducer` + React Context (no external library needed for MVP)**

### Why not Zustand for MVP

Zustand is fine but adds a dependency for something React already handles natively. Use it if state grows beyond the wizard (e.g., shared across multiple pages). For a self-contained 6-step wizard, `useReducer` + Context is the right call.

### Why not plain `useState` per step

State lives across 6 steps and needs to be read/written from multiple components (progress bar, each step, final summary). Passing it via props becomes a prop-drilling mess. Context solves this cleanly.

### Pattern to implement

```ts
// types
type WizardState = {
  currentStep: number        // 0–5
  einstieg: EinstiegData
  erfassen: ErfassenData
  klassifikation: KlassifikationData
  reaktion: ReaktionData
  kommunikation: KommunikationData
  dokumentation: DokumentationData
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'UPDATE_STEP'; stepKey: keyof WizardState; data: unknown }
  | { type: 'RESET' }

// WizardContext.tsx — wrap the whole wizard in this
const WizardContext = createContext<{ state: WizardState; dispatch: Dispatch<WizardAction> } | null>(null)
```

Each step component calls `useContext(WizardContext)` — no props needed.

### Form validation per step

Use **react-hook-form** per step (not globally). Each step has its own `useForm()` instance. On "Next", call `handleSubmit` to validate, then dispatch `UPDATE_STEP` to the wizard context.

```ts
// In each step component
const { register, handleSubmit, formState } = useForm<StepData>({
  defaultValues: state.erfassen  // pre-populate from context on back-navigation
})

const onNext = handleSubmit((data) => {
  dispatch({ type: 'UPDATE_STEP', stepKey: 'erfassen', data })
  dispatch({ type: 'NEXT_STEP' })
})
```

**Do NOT use a single global `useForm` across all steps** — it fights react-hook-form's mental model and causes validation issues.

### Zod for schema validation (recommended)

Add Zod schemas per step and pass them as `resolver` to react-hook-form:

```bash
npm install react-hook-form zod @hookform/resolvers
```

This gives you typed validation with good German error messages via custom error maps.

**Sources:**
- [LogRocket: Building reusable multi-step form with RHF and Zod](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)
- [ClarityDev: Build a Multistep Form with react-hook-form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form)

---

## 3. Vercel Deployment

**Decision: No `vercel.json` needed for MVP.**

Vercel auto-detects Next.js and reads `output: 'export'` from `next.config.ts`. It will build with `next build` and serve from the `out/` directory automatically.

### When you DO need `vercel.json`

Only add a `vercel.json` if you need:
- Custom headers (e.g., CSP headers for Phase 2)
- Environment-specific build commands
- Custom output directory name

### Minimal `vercel.json` (if needed later)

```json
{
  "framework": "nextjs"
}
```

That is literally all that is ever needed for a standard Next.js project on Vercel — and even this is usually unnecessary.

### Deploy workflow

```bash
# Connect repo to Vercel via CLI or GitHub integration
npx vercel               # first deploy (creates project)
npx vercel --prod        # production deploy
```

Or just push to `main` with GitHub integration — Vercel auto-deploys.

**Important note from project memory:** `git user.email` must be the GitHub no-reply email (`ID+username@users.noreply.github.com`), otherwise Vercel Hobby blocks the deploy. This is already documented in `feedback_git_vercel.md`.

**Source:** [Vercel: Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

---

## 4. Tailwind CSS v4 with Next.js 15 App Router

**Tailwind v4 is the default with new Next.js 15 projects.** The config approach changed significantly from v3.

### v4 setup (current standard, no `tailwind.config.js` needed)

**Install:**
```bash
npm install -D tailwindcss @tailwindcss/postcss
```

**`postcss.config.mjs`:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**`app/globals.css`:**
```css
@import 'tailwindcss';

/* SIAG custom tokens — defined here, not in a config file */
@theme {
  --color-siag-navy: #1a2e4a;
  --color-siag-white: #ffffff;
  --color-siag-gray-light: #f5f5f5;
}
```

**`app/layout.tsx`:** `import './globals.css'` — that's it.

### Key v4 differences from v3

| v3 | v4 |
|---|---|
| `tailwind.config.js` required | No config file needed (auto-scans) |
| `@tailwind base/components/utilities` | `@import 'tailwindcss'` (one line) |
| `postcss autoprefixer` peer dep | `@tailwindcss/postcss` replaces it |
| Design tokens in `theme.extend` | Design tokens via `@theme {}` in CSS |

### If you need v3 (broader browser support)

Only use v3 if you need to support very old browsers. The project targets modern browsers for an incident response tool — use v4.

**Source:** [Next.js: CSS Setup (App Router)](https://nextjs.org/docs/app/getting-started/css#tailwind-css) (verified 2026-03-31)

---

## 5. Component Architecture for Future Platform Extraction

**Decision: Build as a self-contained module from day one. No monorepo for MVP.**

### Structure that enables future extraction

```
src/
  components/
    wizard/
      WizardShell.tsx          # outer container — accepts config props
      WizardContext.tsx         # state management, no Next.js deps
      WizardProgress.tsx        # step indicator
      steps/
        Step1Einstieg.tsx
        Step2Erfassen.tsx
        Step3Klassifikation.tsx
        Step4Reaktion.tsx
        Step5Kommunikation.tsx
        Step6Dokumentation.tsx
      index.ts                  # barrel export: export { WizardShell }
    ui/
      Button.tsx                # generic, no Next.js deps
      FormField.tsx
      Badge.tsx
  lib/
    wizard-types.ts             # shared TypeScript types
    wizard-schemas.ts           # Zod schemas
```

### The key rule: keep Next.js out of wizard components

Wizard components must not import from `next/*` (no `next/link`, `next/navigation`, `next/image`). The only Next.js-specific code lives in `app/` (pages, layouts). This makes the `components/wizard/` directory trivially extractable.

Pass navigation callbacks as props instead:

```ts
// WizardShell.tsx
interface WizardShellProps {
  onComplete: (data: WizardState) => void   // called when user finishes step 6
  onExit?: () => void
  initialData?: Partial<WizardState>         // for pre-filling in a platform
  locale?: 'de' | 'fr' | 'it' | 'en'       // mandantenfähig hook
}
```

### Monorepo: defer to Phase 2+

A monorepo (Turborepo or pnpm workspaces) only makes sense when there are two or more consuming apps. For MVP, keep it as a single Next.js project. When the customer platform needs to embed the wizard, extract `components/wizard/` into a separate `packages/incident-wizard` package at that point.

The folder structure above makes that extraction a copy-paste + minor import cleanup, not a refactor.

### SSO / mandantenfähig considerations

For future multi-tenant use, the key is:
- No hardcoded SIAG-specific text inside wizard components (all strings as props or i18n keys)
- No hardcoded branding colors in component JSX (use CSS custom properties / `@theme` tokens)
- Tenant config passed in via props, not environment variables read inside components

---

## Summary: Decisions Made

| Question | Decision | Confidence |
|---|---|---|
| Static export config | `output: 'export'` in next.config.ts, `images: { unoptimized: true }` | HIGH |
| Wizard state | `useReducer` + React Context, `react-hook-form` per step, Zod validation | HIGH |
| Vercel config | No `vercel.json` needed for MVP | HIGH |
| Tailwind version | v4 with `@tailwindcss/postcss`, tokens via `@theme {}` in CSS | HIGH |
| Component architecture | Self-contained wizard module with no Next.js deps inside components | MEDIUM |

## Dependencies to install

```bash
# Core (likely included with create-next-app)
npm install next react react-dom typescript
npm install -D tailwindcss @tailwindcss/postcss

# Forms and validation
npm install react-hook-form zod @hookform/resolvers
```

No other dependencies needed for MVP.

---

## Sources

- [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports) — official docs, verified 2026-03-31
- [Next.js CSS Setup (Tailwind v4)](https://nextjs.org/docs/app/getting-started/css#tailwind-css) — official docs, verified 2026-03-31
- [Vercel: Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) — official docs
- [LogRocket: Multi-step form with React Hook Form and Zod](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)
- [ClarityDev: Multistep form with react-hook-form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form)
