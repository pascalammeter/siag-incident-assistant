# Phase 1: Project Foundation - Research

**Researched:** 2026-04-01
**Domain:** Next.js 15 + Tailwind v4 + Vercel static export
**Confidence:** HIGH

## Summary

Phase 1 erstellt die technische Huelle: ein lauffaehiges Next.js 15 Projekt mit TypeScript, Tailwind CSS v4 (CSS-first config), SIAG-Branding-Tokens und Vercel-Deployment-Pipeline. Kein Inhalt, nur die Shell.

**Kritischer Fund:** `create-next-app --tailwind` installiert Stand April 2026 immer noch Tailwind v3. Fuer Tailwind v4 muss man die `--tailwind`-Flag WEGLASSEN und Tailwind v4 manuell installieren (`tailwindcss`, `@tailwindcss/postcss`, `postcss`). Die CSS-Konfiguration nutzt `@import "tailwindcss"` und `@theme {}` statt `tailwind.config.js`.

**Primary recommendation:** Projekt mit `create-next-app` OHNE `--tailwind` erstellen, dann Tailwind v4 manuell installieren und konfigurieren.

## Project Constraints (from CLAUDE.md)

Kein CLAUDE.md vorhanden. Projektkonventionen aus STATE.md und REQUIREMENTS.md:

- Stack: Next.js 15, TypeScript, Tailwind v4, react-hook-form + Zod, useReducer + Context
- Deployment: Vercel static export (`output: 'export'`)
- Kein vercel.json noetig
- Wizard-Komponenten ohne `next/*` Imports (Plattform-Kompatibilitaet)
- Tailwind v4: `@theme{}` in globals.css, kein tailwind.config.js
- Git user.email = GitHub No-Reply-Email (Vercel Hobby)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.2.x (latest 15) | React Framework | Locked decision, App Router + static export |
| react | 19.x | UI Library | Ships with Next.js 15 |
| typescript | 5.x | Type Safety | Locked decision |
| tailwindcss | 4.2.x | CSS Utility Framework | Locked decision, CSS-first config |
| @tailwindcss/postcss | 4.2.x | PostCSS Plugin fuer TW v4 | Required for Next.js integration |
| postcss | 8.x | CSS Processor | Peer dependency von @tailwindcss/postcss |

### Supporting (Phase 1 only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint | 9.x | Linting | Ships with create-next-app |
| @eslint/eslintrc | latest | ESLint Config Compat | Ships with create-next-app |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tailwindcss/postcss | @tailwindcss/vite | Vite-Plugin, aber Next.js nutzt Webpack/Turbopack, nicht Vite |
| Tailwind v4 manual | create-next-app --tailwind | Installiert v3 — muesste danach upgraden, mehr Aufwand |

**Installation (nach create-next-app):**
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

**Version verification (2026-04-01):**
- next: 15.2.2 (confirmed via npm view)
- tailwindcss: 4.2.2 (confirmed via npm view)
- @tailwindcss/postcss: 4.2.2 (confirmed via npm view)
- react: 19.2.4 (confirmed via npm view)
- typescript: 5.8.x (ships with create-next-app)

## Architecture Patterns

### Recommended Project Structure (Phase 1)
```
siag-incident-assistant/
├── app/
│   ├── globals.css          # @import "tailwindcss" + @theme{} SIAG tokens
│   ├── layout.tsx           # RootLayout mit Header + Footer
│   ├── page.tsx             # Leere Shell / Placeholder
│   └── favicon.ico
├── components/
│   ├── Header.tsx           # SIAG Logo Placeholder + Titel
│   └── Footer.tsx           # Minimal footer
├── public/
│   └── (SIAG logo placeholder)
├── next.config.ts           # output: 'export', images.unoptimized
├── postcss.config.mjs       # @tailwindcss/postcss Plugin
├── tsconfig.json
├── package.json
└── .gitignore
```

### Pattern 1: Tailwind v4 CSS-First Configuration
**What:** Design tokens direkt in CSS definiert via `@theme {}`, kein JavaScript-Config-File.
**When to use:** Immer bei Tailwind v4 Projekten.
**Example:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-navy: #1a2e4a;
  --color-navy-light: #2a4a6b;
  --color-navy-dark: #0f1e33;
  --color-amber: #f59e0b;
  --color-amber-light: #fbbf24;
  --color-lightgray: #f5f7fa;
  --color-white: #ffffff;
}
```
**Source:** https://tailwindcss.com/docs/theme

Dies generiert automatisch Utility-Klassen: `bg-navy`, `text-navy`, `bg-amber`, `text-lightgray`, etc.

### Pattern 2: Next.js Static Export Config
**What:** `output: 'export'` in next.config.ts fuer rein statisches Deployment.
**When to use:** Wenn kein Server-Side-Rendering noetig (dieser Fall).
**Example:**
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```
**Source:** https://nextjs.org/docs/app/guides/static-exports

### Pattern 3: PostCSS Config fuer Tailwind v4
**What:** Minimale PostCSS-Konfiguration mit dem neuen `@tailwindcss/postcss` Plugin.
**Example:**
```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```
**Source:** https://tailwindcss.com/docs/guides/nextjs

### Anti-Patterns to Avoid
- **`create-next-app --tailwind` verwenden:** Installiert Tailwind v3, nicht v4. Muss danach komplett migriert werden.
- **`tailwind.config.js` erstellen:** Tailwind v4 nutzt CSS-first config via `@theme {}`. Ein JS-Config-File ist veraltet.
- **`@tailwind base/components/utilities` Direktiven:** Veraltet in v4. Stattdessen `@import "tailwindcss"`.
- **`next/image` ohne `unoptimized: true`:** Bricht bei static export, da Image Optimization einen Server braucht.
- **Server Actions / API Routes:** Nicht kompatibel mit `output: 'export'`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS Reset / Base Styles | Eigenes Reset-CSS | Tailwind Preflight (inkludiert in `@import "tailwindcss"`) | Preflight ist bereits enthalten |
| Color Tokens System | Eigenes CSS-Variablen-System | `@theme {}` Direktive | Generiert automatisch Utility-Klassen |
| PostCSS Pipeline | Eigene Build-Config | `@tailwindcss/postcss` | Offizielle Integration, zero-config |

## Common Pitfalls

### Pitfall 1: create-next-app --tailwind installiert v3
**What goes wrong:** Projekt startet mit Tailwind v3 statt v4. `tailwind.config.js` wird generiert, `@theme` funktioniert nicht.
**Why it happens:** Next.js CLI hat Tailwind v4 noch nicht als Default uebernommen (Stand April 2026).
**How to avoid:** `--tailwind` Flag WEGLASSEN. Tailwind v4 manuell installieren.
**Warning signs:** Vorhandensein von `tailwind.config.js`, `@tailwind base` Direktiven in CSS.

### Pitfall 2: localStorage in Server Components
**What goes wrong:** `localStorage` ist auf dem Server nicht verfuegbar, Build bricht ab.
**Why it happens:** Next.js rendert Server Components waehrend `next build`.
**How to avoid:** localStorage NUR in Client Components (`'use client'`) und NUR innerhalb von `useEffect` verwenden.
**Warning signs:** "window is not defined" Fehler beim Build.

### Pitfall 3: Image Optimization bei Static Export
**What goes wrong:** `next build` schlaegt fehl wegen Image Optimization.
**Why it happens:** Default Image Loader braucht einen Server.
**How to avoid:** `images: { unoptimized: true }` in next.config.ts setzen.
**Warning signs:** Build-Error "Image Optimization using the default loader is not compatible with export".

### Pitfall 4: Vercel Hobby blockiert Deploys bei falscher Git-Email
**What goes wrong:** Vercel Hobby-Plan verweigert Deployment.
**Why it happens:** Git commits muessen mit der GitHub No-Reply-Email signiert sein.
**How to avoid:** `git config user.email` pruefen — muss `79907325+pascalammeter@users.noreply.github.com` sein.
**Warning signs:** Deploy-Fehler auf Vercel trotz gruener Builds.

### Pitfall 5: postcss.config.mjs vs postcss.config.js
**What goes wrong:** PostCSS-Config wird nicht erkannt oder Tailwind v4 Plugin laeuft nicht.
**Why it happens:** create-next-app generiert ggf. ein `postcss.config.mjs` mit altem Content.
**How to avoid:** Sicherstellen, dass `postcss.config.mjs` NUR `@tailwindcss/postcss` als Plugin hat (nicht `tailwindcss` oder `autoprefixer` — die sind v3-Plugins).
**Warning signs:** CSS-Klassen werden nicht kompiliert, Tailwind-Utilities haben keinen Effekt.

## Code Examples

### SIAG Design Tokens in globals.css
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* SIAG Brand Colors */
  --color-navy: #1a2e4a;
  --color-navy-light: #2a4a6b;
  --color-navy-dark: #0f1e33;
  --color-white: #ffffff;
  --color-lightgray: #f5f7fa;
  --color-amber: #f59e0b;
  --color-amber-light: #fbbf24;
  --color-amber-dark: #d97706;

  /* Font */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

/* Base body styles */
body {
  font-family: var(--font-sans);
  color: var(--color-navy);
  background-color: var(--color-white);
}
```
**Source:** https://tailwindcss.com/docs/theme + NF2.1-NF2.3 Requirements

### Base Layout mit Header und Footer
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIAG Incident Management Assistent",
  description: "Incident-Response-Wizard fuer SIAG-Berater",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col bg-white text-navy">
        <header className="bg-navy text-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            {/* SIAG Logo Placeholder */}
            <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-sm font-bold">
              SIAG
            </div>
            <h1 className="text-lg font-semibold">Incident Management Assistent</h1>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {children}
        </main>
        <footer className="bg-lightgray text-navy/60 text-sm px-6 py-4 text-center">
          SIAG Consulting AG
        </footer>
      </body>
    </html>
  );
}
```

### next.config.ts
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` (JS) | `@theme {}` in CSS | Tailwind v4 (Jan 2025) | Kein JS-Config mehr, alles in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 (Jan 2025) | Eine Zeile statt drei |
| `tailwindcss` + `autoprefixer` PostCSS | `@tailwindcss/postcss` | Tailwind v4 (Jan 2025) | Neues PostCSS-Plugin, autoprefixer eingebaut |
| `next export` CLI Command | `output: 'export'` in config | Next.js 14 (Oct 2023) | CLI-Befehl entfernt |
| `next.config.js` (CommonJS) | `next.config.ts` (TypeScript) | Next.js 15 | Type-safe Config |

**Deprecated/outdated:**
- `tailwind.config.js`: Ersetzt durch `@theme {}` in CSS (Tailwind v4)
- `@tailwind base/components/utilities`: Ersetzt durch `@import "tailwindcss"` (Tailwind v4)
- `autoprefixer`: In `@tailwindcss/postcss` eingebaut (Tailwind v4)
- `next export`: Ersetzt durch `output: 'export'` in next.config (Next.js 14+)

## Open Questions

1. **Tailwind v4 Default in create-next-app**
   - What we know: Stand April 2026 installiert `--tailwind` immer noch v3. Manuelles Setup ist sicher.
   - What's unclear: Ob Next.js 16 dies aendert.
   - Recommendation: Manuelles Setup verwenden, kein Risiko.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js Runtime | Yes | v24.14.0 | -- |
| npm | Package Manager | Yes | 11.11.0 | -- |
| git | Version Control | Yes | 2.53.0 | -- |
| gh CLI | GitHub Repo erstellen | Yes | 2.67.0 | Manuell ueber github.com |
| Vercel CLI | Optional Deploy | No | -- | Vercel GitHub Integration (kein CLI noetig) |

**Missing dependencies with no fallback:** Keine.

**Missing dependencies with fallback:**
- Vercel CLI nicht installiert, aber nicht noetig — Vercel GitHub Integration reicht fuer Auto-Deploy.

**Git Email:** Bereits korrekt konfiguriert als `79907325+pascalammeter@users.noreply.github.com` (No-Reply-Format fuer Vercel Hobby).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Noch nicht vorhanden (Phase 1 = Foundation) |
| Config file | Keiner -- kein Test-Framework in Phase 1 noetig |
| Quick run command | `npm run build` (Build-Erfolg = primaere Validierung) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NF3.1 | Next.js 15 App Router + TS | smoke | `npm run build` | Wave 0 |
| NF3.2 | Tailwind v4 CSS config | smoke | `npm run build` (CSS kompiliert) | Wave 0 |
| NF3.5 | Static export | smoke | `npm run build` (out/ Ordner existiert) | Wave 0 |
| NF4.2 | GitHub Repo + Vercel | manual | Vercel Preview URL pruefen | Manual |
| NF4.3 | Git no-reply email | manual | `git config user.email` | Manual |
| NF2.1 | SIAG Farbpalette | visual | Manuell im Browser pruefen | Manual |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Build green + Vercel Preview URL erreichbar

### Wave 0 Gaps
- Kein dediziertes Test-Framework noetig fuer Phase 1. Build-Erfolg und Lint sind die Validierung.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Docs](https://tailwindcss.com/docs/theme) - @theme directive syntax, color namespaces
- [Tailwind CSS Next.js Installation Guide](https://tailwindcss.com/docs/guides/nextjs) - Packages, PostCSS config, setup steps
- [Next.js Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) - output: export config, unsupported features, Image handling
- [Next.js create-next-app CLI](https://nextjs.org/docs/app/api-reference/cli/create-next-app) - CLI flags

### Secondary (MEDIUM confidence)
- [GitHub Discussion #75320](https://github.com/vercel/next.js/discussions/75320) - --tailwind flag still installs v3
- [Tailwind + Next.js Setup Guide 2026](https://designrevision.com/blog/tailwind-nextjs-setup) - Manual v4 setup approach

### Tertiary (LOW confidence)
- Keine LOW-confidence Findings.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Versionen via npm view verifiziert, offizielle Docs geprueft
- Architecture: HIGH - Offizielles Tailwind v4 + Next.js Setup, keine Experimente
- Pitfalls: HIGH - Bekannte Issues (v3-Default, static export Limits) mehrfach dokumentiert

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stabil, keine Breaking Changes erwartet)
