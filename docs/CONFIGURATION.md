<!-- gsd:generated -->
# Configuration

## Next.js Configuration (`next.config.ts`)

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
}
```

| Setting | Value | Purpose |
|---------|-------|---------|
| `output` | `"export"` | Generates a fully static `out/` directory — no server required |
| `images.unoptimized` | `true` | Required when using `output: "export"` — disables Next.js image optimization which needs a server |

The static export means no vercel.json or server configuration is needed. The `out/` directory is deployed directly to Vercel CDN.

## TypeScript Configuration (`tsconfig.json`)

| Setting | Value | Notes |
|---------|-------|-------|
| `target` | `ES2017` | Broad browser compatibility |
| `strict` | `true` | Full strict mode enabled |
| `module` | `esnext` | Modern ES modules |
| `moduleResolution` | `bundler` | Next.js 16 bundler resolution |
| `paths` | `@/*` → `./src/*` | Absolute import alias — use `@/components/...` instead of relative paths |

The `@/` path alias is configured both in `tsconfig.json` and `vitest.config.ts` and resolves to `./src/`.

## Vitest Configuration (`vitest.config.ts`)

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/.claude/worktrees/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

| Setting | Value | Notes |
|---------|-------|-------|
| `environment` | `jsdom` | Browser-like DOM environment for React component tests |
| `globals` | `true` | `describe`, `it`, `expect` available without imports |
| `alias @/` | `./src/` | Mirrors tsconfig `paths` for consistent imports in tests |
| `exclude` | `.claude/worktrees/**` | Prevents GSD worktree test files from running in main |

## Tailwind CSS v4 (`src/app/globals.css`)

Tailwind v4 uses CSS-first configuration via `@theme {}` — there is no `tailwind.config.js`.

### SIAG Brand Color Tokens

| CSS Variable | Hex Value | Tailwind Class |
|-------------|-----------|----------------|
| `--color-navy` | `#1a2e4a` | `bg-navy`, `text-navy` |
| `--color-navy-light` | `#2a4a6b` | `bg-navy-light`, `text-navy-light` |
| `--color-navy-dark` | `#0f1e33` | `bg-navy-dark`, `text-navy-dark` |
| `--color-white` | `#ffffff` | `bg-white`, `text-white` |
| `--color-lightgray` | `#f5f7fa` | `bg-lightgray`, `text-lightgray` |
| `--color-amber` | `#f59e0b` | `bg-amber`, `text-amber` |
| `--color-amber-light` | `#fbbf24` | `bg-amber-light`, `text-amber-light` |
| `--color-amber-dark` | `#d97706` | `bg-amber-dark`, `text-amber-dark` |

> **Note:** Token prefix is the bare color name (e.g., `bg-navy`), not a namespaced prefix like `bg-siag-navy`. This matches the Tailwind v4 `@theme {}` convention.

### Font

The `--font-sans` token is set to `"Inter"` and falls back to `ui-sans-serif`. Inter is loaded via `next/font/google` in `src/app/layout.tsx` and applied to the `<html>` element.

### Print Styles

`globals.css` includes print media query rules for the Step 6 incident summary export:
- `.print-hidden` — hides navigation elements
- `.print-section` — prevents page breaks within summary cards
- `.print-only` — shows print-only header block (hidden on screen)

## Environment Variables

This project has no environment variables. All data is client-side, hardcoded, or derived from user input in the browser. No API keys, database URLs, or service credentials are required.

## localStorage

The wizard state is persisted to browser `localStorage` under a single key:

| Key | Type | Purpose |
|-----|------|---------|
| `siag-wizard-state` | JSON (`WizardState`) | Full wizard state across page refreshes |

State is written on every `WizardState` change (after initial hydration). Corrupted or missing data falls back to `initialState` silently.

## Path Alias

Use `@/` for all imports from the `src/` directory:

```ts
// Good
import { useWizard } from '@/components/wizard/WizardContext'
import { calculateSeverity } from '@/lib/wizard-schemas'

// Avoid
import { useWizard } from '../../../components/wizard/WizardContext'
```

## Deployment

The application is deployed to Vercel as a static site. No `vercel.json` is required — Vercel auto-detects Next.js and runs `next build` which outputs to `out/` via the `output: 'export'` setting. No server-side infrastructure is provisioned.

Live URL: `https://siag-incident-assistant.vercel.app`
