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

## Database Configuration (v1.1+)

The v1.1 backend introduces a PostgreSQL database hosted on Neon. Two connection strings are used:

| Variable | Purpose | Used By |
|----------|---------|---------|
| `DATABASE_URL` | Primary pooled application connection (pgBouncer enabled) | Prisma Client for all CRUD operations at runtime |
| `DIRECT_URL` | Direct compute-endpoint connection (bypasses pooler) | Prisma migrations and `prisma.config.ts` |

Connection-string format (both variables):

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

`prisma.config.ts` loads `.env.local` first, then `.env` as fallback, and resolves the datasource URL as `process.env.DIRECT_URL ?? process.env.DATABASE_URL`. Migrations live under `prisma/migrations/` (current baseline: `001_init_incident`).

<!-- VERIFY: Neon connection strings, compute endpoints, and pool vs. direct URL details must be obtained from the Neon console (https://console.neon.tech). Repository does not contain actual connection strings. -->

### Prisma Configuration Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Data model (single `Incident` model, PostgreSQL provider) |
| `prisma/migrations/` | Versioned SQL migrations applied via `prisma migrate dev` / `prisma migrate deploy` |
| `prisma/seed.ts` | Seed script, registered via `package.json` `"prisma.seed": "tsx prisma/seed.ts"` |
| `prisma.config.ts` | Centralized datasource config for Prisma CLI, reads `DIRECT_URL` with `DATABASE_URL` fallback |

Run migrations locally with `npm run prisma:migrate`; generate the client with `npm run prisma:generate` (also runs as part of `npm run build`).

## API Authentication (v1.1+)

All mutating endpoints (POST, PATCH, DELETE) require the `X-API-Key` HTTP header. GET endpoints (list, fetch, health) do not require authentication.

Implementation reference: `src/app/api/_helpers.ts` reads the header via `request.headers.get('x-api-key')` and compares it against `process.env.API_KEY`.

```bash
curl -H "X-API-Key: sk_test_xxxxx" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3000/api/incidents \
     -d '{"...":"..."}'
```

Key conventions (from `.env.example`):

| Prefix | Use |
|--------|-----|
| `sk_test_*` | Development and CI/CD test runs |
| `sk_live_*` | Production |

Generation: `openssl rand -hex 16` produces a 32-character hex value suitable for use as an API key. Keys must be at least 32 characters.

## CORS & Network Configuration (v1.1+)

The API enforces Cross-Origin Resource Sharing (CORS) based on the `CORS_ORIGIN` environment variable. Accepts a single origin or a comma-separated list; wildcards are not permitted in production.

| Environment | Recommended value |
|-------------|-------------------|
| Development | `http://localhost:3000` |
| Production  | `https://siag-incident-assistant.vercel.app` |
| Combined dev+prod | `http://localhost:3000,https://siag-incident-assistant.vercel.app` |

<!-- VERIFY: Staging domain (e.g., https://siag-incident-assistant-staging.vercel.app) is mentioned as a pattern in .env.example but the actual staging URL is environment-dependent and not defined in the repository. -->

## Runtime Environment Variables (v1.1+)

Environment variables consumed by the Next.js app and the Express backend at runtime. See `.env.example` for the canonical template.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Pooled Neon PostgreSQL URL used by Prisma Client |
| `DIRECT_URL` | Yes | Falls back to `DATABASE_URL` | Direct compute-endpoint URL used for migrations |
| `API_KEY` | Yes | — | Bearer token enforced on mutating API routes |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed frontend origin(s) for API requests |
| `NODE_ENV` | Yes | `development` | `development` \| `test` \| `production`; Vercel auto-sets to `production` |
| `PORT` | Optional | `3000` | Local Express port for `npm run dev:backend` (ignored on Vercel) |
| `DATABASE_DEBUG` | Optional | (empty) | Prisma debug scope, e.g., `prisma:*` or `prisma:client` |
| `LOG_LEVEL` | Optional | `info` | `debug` \| `info` \| `warn` \| `error` |
| `PDF_TIMEOUT_MS` | Optional | `30000` | Puppeteer PDF render timeout in milliseconds |
| `PUPPETEER_ARGS` | Optional | (empty) | Chromium launch flags, e.g., `--no-sandbox --disable-gpu` |
| `RATE_LIMITING_ENABLED` | Optional (v1.2+) | `true` | Toggle for `express-rate-limit` middleware |
| `LOG_REQUESTS` | Optional (v1.2+) | `false` | Toggle for HTTP request logging middleware |

## Per-Environment Overrides (v1.1+)

The repo loads environment variables in this order (via `dotenv` in `prisma.config.ts` and `vitest.config.ts`): `.env.local` → `.env`. Vercel and GitHub Actions inject their own values and do not read local dotfiles.

### Development

- Source: `.env.local` (copied from `.env.example`)
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:3000`
- Use a dedicated "dev" database in Neon (separate from prod)
- `API_KEY` should be `sk_test_*` prefixed

### Test / CI

- `NODE_ENV=test`
- Values injected by GitHub Actions from repository secrets (see CI/CD Secrets section)
- Vitest loads `.env.local` via `dotenv.config({ path: '.env.local' })` for local test runs

### Staging

- Configured in the Vercel dashboard (not via repo files)
- `CORS_ORIGIN` pattern: `https://siag-incident-assistant-staging.vercel.app`

<!-- VERIFY: The actual staging deployment URL and whether a dedicated staging environment exists in Vercel is not discoverable from the repository. -->

### Production

- Configured in the Vercel dashboard (not via repo files)
- `NODE_ENV=production` (auto-set by Vercel)
- `DATABASE_URL` / `DIRECT_URL` point to the production Neon database
- `API_KEY` should be `sk_live_*` prefixed
- `CORS_ORIGIN=https://siag-incident-assistant.vercel.app`

<!-- VERIFY: Production environment variable values are managed via Vercel's dashboard and are not stored in the repository. -->

## CI/CD Secrets (GitHub Actions)

The CI workflow (`.github/workflows/ci.yml`) runs on pull requests to `main` and pushes to `develop`, using Node 20.x. Required GitHub repository secrets:

| Secret | Used By | Purpose |
|--------|---------|---------|
| `DATABASE_URL_CI` | `ci.yml` (prisma generate + test steps) | Connection string for a dedicated CI/test database (separate from dev/prod) |
| `API_KEY_CI` | `ci.yml` (test step) | `sk_test_*` API key injected as `API_KEY` during tests |

The workflow sets `NODE_ENV=test` during the test step.

<!-- VERIFY: deploy.yml workflow contents and its exact secret usage (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID) must be reviewed directly; this doc reflects the .env.example specification. -->

## Vercel Deployment Secrets

For the deploy workflow (`.github/workflows/deploy.yml`), the following GitHub repository secrets are expected per `.env.example`:

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Authenticates the Vercel CLI in GitHub Actions. Create at `https://vercel.com/account/tokens`. Rotate regularly. |
| `VERCEL_ORG_ID` | Identifies the Vercel organization/team owning the project. |
| `VERCEL_PROJECT_ID` | Identifies the specific Vercel project (format: `prj_...`). |

These secrets must never be placed in `.env.local` — they are injected only by GitHub Actions.

<!-- VERIFY: Actual VERCEL_ORG_ID and VERCEL_PROJECT_ID values are project-specific and must be obtained from the Vercel dashboard. -->

## Build Configuration (v1.1+)

### `next.config.ts` (current state)

The current `next.config.ts` has removed `output: "export"` to enable Vercel Functions, because API routes require a server runtime. Key settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| `images.formats` | `["image/avif", "image/webp"]` | Modern image formats via Vercel image optimization |
| `images.minimumCacheTTL` | `31536000` (1 year) | Long-lived cache for optimized images |
| `images.deviceSizes` | `[375, 640, 768, 1024, 1280, 1920]` | Responsive image breakpoints |
| `compress` | `true` | Enables Next.js built-in compression (Vercel adds gzip + brotli automatically) |
| `turbopack.root` | `__dirname` | Suppresses Turbopack workspace lockfile warning |

Custom HTTP response headers configured in `async headers()`:
- `/_next/static/:path*` and static asset file extensions: `Cache-Control: public, max-age=31536000, immutable`
- `/api/incidents`: `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=60`
- `/api/incidents/:id`: `Cache-Control: public, max-age=600, s-maxage=600, stale-while-revalidate=60`
- HTML pages: `Cache-Control: public, max-age=0, must-revalidate` plus security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`)

> Note: Earlier sections of this doc describe the v1.0 static export configuration (`output: "export"`, `images.unoptimized: true`). That configuration has been superseded by the v1.1 server-runtime configuration documented here.

### `vitest.config.ts` (current state)

The current Vitest config differs from the earlier snippet in several ways relevant to backend testing:

| Setting | Value | Notes |
|---------|-------|-------|
| `environment` | `node` | Default environment is `node` to avoid jsdom/node `Event` class conflicts |
| `environmentMatchGlobs` | `[['**/__tests__/**', 'jsdom']]` | Use `jsdom` only for UI component tests under `__tests__/` |
| `testTimeout` | `30000` ms | Extended to accommodate Puppeteer PDF generation |
| `hookTimeout` | `60000` ms | Extended for database setup/teardown hooks |
| `coverage.provider` | `v8` | V8 coverage provider |
| `coverage.reporter` | `['text', 'json', 'html', 'lcov']` | Multiple reporter outputs |
| `coverage.include` | `['src/api/**/*.ts']` | Coverage scoped to backend API code |
| `coverage.lines` / `statements` | `75` | Line/statement coverage threshold |
| `coverage.functions` | `75` | Function coverage threshold |
| `coverage.branches` | `70` | Branch coverage threshold |

`dotenv.config({ path: '.env.local' })` is called at the top of the file so tests pick up local DB and API credentials without extra setup.

> Note: The config filename referenced in this doc's header (`vitest.config.ts`) matches the actual file; there is no separate `vitest.config.mts` in the repository at the time of writing.
