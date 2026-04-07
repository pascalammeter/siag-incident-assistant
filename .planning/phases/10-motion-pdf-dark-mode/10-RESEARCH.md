# Phase 10: Motion + PDF + Dark Mode — Research

**Researched:** 2026-04-07
**Domain:** Frontend UX polish (animations, PDF export, dark mode support)
**Confidence:** HIGH

## Summary

Phase 10 adds premium UX polish to the SIAG Incident Assistant through three distinct features: smooth animations with accessibility support, professional PDF export with title pages, and dark mode support. The project already has excellent foundational CSS in place (globals.css with design tokens, Tailwind v4 with PostCSS, and prefers-reduced-motion handling), which means implementation focuses on integrating lightweight libraries rather than building from scratch.

**Key recommendations:**
1. **Animations:** Use Motion (v12.38.0, the rebranded Framer Motion) with `'use client'` components and `MotionConfig reducedMotion="user"` for automatic accessibility compliance
2. **PDF Export:** Implement server-side generation with Puppeteer (already in package.json v24.40.0) + optional client-side jsPDF fallback for simple cases
3. **Dark Mode:** Add next-themes (v0.4.6 available) to manage theme switching with localStorage persistence, aligned with Tailwind v4's CSS-based dark mode system

All three features integrate seamlessly with the existing Next.js 15 + React 19 + Tailwind v4 stack without requiring major refactoring. The project already respects `prefers-reduced-motion` in globals.css, significantly reducing accessibility compliance work.

**Primary recommendation:** Start with Motion animations and dark mode (lower risk, faster feedback), then add Puppeteer-based PDF export as Wave 2 (handles serverless complexity).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Motion | 12.38.0 | React animation library (rebranded Framer Motion) | Hybrid engine runs natively in browser via Web Animations API + JavaScript fallback; excellent React 19 support; automatic accessibility compliance via `reducedMotion="user"` |
| next-themes | 0.4.6 | Theme provider for dark/light mode toggle | Industry standard for Next.js theme management; handles localStorage persistence; zero flashing on page load; works seamlessly with Tailwind v4 CSS variables |
| Puppeteer | 24.40.0 | Headless browser for server-side PDF generation | Already installed; good Vercel/serverless support via @sparticuz/chromium-min; produces accurate HTML-to-PDF output for multi-page documents |
| Tailwind CSS v4 | 4.2.2 | CSS framework (already installed) | Supports CSS variables for dark mode; @custom-variant directive eliminates need for tailwind.config.js; 70% smaller CSS output than v3 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jsPDF + html2canvas | ~95kb combined | Client-side PDF generation | Fallback for simple incident summaries; use when Puppeteer is unavailable or for lightweight client-side exports |
| @sparticuz/chromium-min | latest | Minimal Chromium binary for serverless | Required when deploying Puppeteer to Vercel; reduces binary size from 200MB+ to ~50MB |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Motion | framer-motion | Identical API (Motion is rebranded framer-motion); framer-motion still works but Motion is recommended going forward |
| Motion | React Spring | More complex API; better for complex physics-based animations; overkill for this phase's button/card/spinner effects |
| next-themes | Manual localStorage | Reinventing theme switching is error-prone (flashing, hydration mismatches, persistence bugs); next-themes solves these problems |
| Puppeteer | Dedicated PDF API (Doppio, APITier) | Adds external dependency + costs; Puppeteer gives full control and is already available on Vercel |

**Installation:**
```bash
npm install motion next-themes @sparticuz/chromium-min
```

**Version verification (current as of 2026-04-07):**
- Motion: [12.38.0](https://www.npmjs.com/package/motion)
- next-themes: [0.4.6](https://www.npmjs.com/package/next-themes)
- Puppeteer: 24.40.0 (already installed)

---

## Architecture Patterns

### 1. Motion Animations — Client Components with Accessibility

**Pattern:** Use Motion (`motion/react`) in client components with `MotionConfig reducedMotion="user"` to automatically disable animations for users with accessibility settings.

**When to use:** Buttons (hover/press states), cards (hover elevation), loading spinners, page transitions.

**Example:**
```typescript
'use client';

import { motion, MotionConfig } from 'motion/react';

export function AnimatedButton() {
  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, type: 'easeOut' }}
        className="btn-primary"
      >
        Click Me
      </motion.button>
    </MotionConfig>
  );
}
```

**Why MotionConfig over individual `useReducedMotion()` calls:** 
- Automatically applies accessibility setting to all child Motion components
- Zero boilerplate — no need to check `prefers-reduced-motion` manually in every component
- Motion docs recommend this pattern for app-wide accessibility compliance [CITED: motion.dev/docs/react-accessibility]

### 2. CSS-Based Loading Spinner (No Motion Required)

**Pattern:** Pure CSS spinner with `animate-spin` and `@keyframes spin` (already in globals.css), respects `prefers-reduced-motion` via media query.

**When to use:** API request loading states, form submissions.

**Example:**
```html
<!-- In globals.css (already present): -->
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

<!-- In component: -->
<div className="spinner"><!-- renders as animated loader --></div>
```

**Why CSS over Motion for spinners:**
- CSS animations have zero JavaScript overhead
- Single element, no DOM clutter
- Respects `@media (prefers-reduced-motion: reduce)` automatically via globals.css rule at line 168–190
- Existing implementation in globals.css at lines 150–154

### 3. Dark Mode with next-themes + Tailwind v4

**Pattern:** 
1. Wrap app in `ThemeProvider` from next-themes
2. Add `@custom-variant dark` in globals.css (Tailwind v4 syntax)
3. Use `dark:` prefix in Tailwind classes; theme persists to localStorage

**When to use:** Application-wide theme toggle, respects system preference on first visit.

**Example:**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          <Header /> {/* contains theme toggle button */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// In component (e.g., Header):
'use client';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

```css
/* In globals.css (Tailwind v4 syntax) */
@custom-variant dark (&:where(.dark, .dark *));

/* Design tokens already support dark mode (lines 41-53 of globals.css) */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-siag-red: #FF3355;
    --color-siag-navy: #1E3A8A;
    --color-siag-orange: #FB923C;
    --color-background: var(--color-dark-background);
    /* ... */
  }
}
```

**Why next-themes over manual localStorage:**
- Handles hydration mismatches (prevents flash of wrong theme on page load)
- Automatic system preference detection (prefers-color-scheme)
- localStorage persistence is built in
- Tailwind v4 CSS variables integrate seamlessly [CITED: sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4]

### 4. PDF Export — Server-Side with Puppeteer

**Pattern:** Route handler (`/api/incidents/[id]/export-pdf`) uses Puppeteer to render HTML template and generate PDF, optionally with image embedding.

**When to use:** Professional PDF export with title pages, multi-page layouts, images.

**Example (simplified):**
```typescript
// src/app/api/incidents/[id]/export-pdf/route.ts
import puppeteer from 'puppeteer';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const incident = await db.incident.findUnique({ where: { id: params.id } });
  
  // HTML template with title page + incident data
  const htmlContent = `
    <html>
      <head><style>${pdfStyles}</style></head>
      <body>
        <div class="title-page">
          <img src="data:image/svg+xml;base64,..." alt="SIAG Logo" />
          <h1>${incident.title}</h1>
          <p>Date: ${incident.createdAt}</p>
        </div>
        <div class="page-break"></div>
        <div class="incident-details">${incidentHTML}</div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

**Why Puppeteer over client-side (jsPDF):**
- Accurate CSS + layout rendering (jsPDF cannot render CSS)
- Handles images, fonts, and complex layouts
- Reproducible output (not dependent on user's browser)
- Can embed images without data-URL size limits

**Why NOT Puppeteer for simple exports:**
- Cold start overhead (loading Chromium takes ~15 seconds)
- Memory usage (~100MB per request)
- Consider jsPDF fallback for lightweight incident summaries

**Serverless optimization:**
- Use `@sparticuz/chromium-min` (50MB) instead of full Chromium (200MB+) for Vercel deployments [VERIFIED: github.com search, npm registry]
- Reuse browser instances across requests (singleton pattern) to reduce cold-start impact
- Set `waitUntil: 'networkidle0'` (not 'networkidle2') to avoid waiting for background requests

### 5. Combining All Three: Layout Component

**Pattern:** Root layout integrates Motion animations, dark mode provider, and CSS-based spinner.

**Example:**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';
import { MotionConfig } from 'motion/react';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning className={sourceSansPro.variable}>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system">
          <MotionConfig reducedMotion="user">
            <Header /> {/* includes theme toggle */}
            <main>{children}</main>
            <Footer />
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Anti-Patterns to Avoid

- **Excessive animations:** Avoid animating non-essential elements (e.g., page background, text colors). Keep animations to UI affordances (buttons, cards, spinners). [CITED: motion.dev/docs/react-accessibility]
- **Ignoring prefers-reduced-motion:** All animations MUST respect `@media (prefers-reduced-motion: reduce)` — Motion's `reducedMotion="user"` + globals.css handle this automatically.
- **Server-side animations in Next.js:** Never try to animate SSR-rendered content on the server; use `'use client'` and animate on client side only.
- **Manual theme switching without next-themes:** Will cause flashing, hydration mismatches, and lost localStorage state — use next-themes instead.
- **PDF generation on client:** jsPDF/html2canvas cannot handle CSS, images, fonts reliably — use Puppeteer for professional PDFs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|------------|-------------|-----|
| React animations | Custom requestAnimationFrame loops | Motion (12.38.0) | Browser API abstraction, automatic accessibility, spring physics, gesture support; hand-rolled will be buggy, inaccessible, and harder to maintain |
| Dark mode toggle + persistence | localStorage + useState + manual sync | next-themes (0.4.6) | Prevents hydration mismatches, handles system preference detection, automatic localStorage; manual implementation is error-prone |
| Prefers-reduced-motion compliance | Manual `useMediaQuery()` in every animated component | Motion's `MotionConfig reducedMotion="user"` + globals.css | Automatic application-wide; no boilerplate per component |
| HTML-to-PDF conversion | Try to use jsPDF for complex layouts | Puppeteer (24.40.0) | jsPDF doesn't render CSS/images; only Puppeteer produces production-quality PDFs with layouts |
| Loading spinners | JavaScript/Motion-based spinners | CSS `@keyframes spin` | Zero JavaScript overhead; automatic accessibility compliance; already implemented in globals.css |

**Key insight:** The project's foundation (globals.css, Tailwind v4, design tokens) already provides ~80% of what's needed. Phase 10 is about integrating lightweight libraries that respect these foundations, not building from scratch.

---

## Common Pitfalls

### Pitfall 1: Animations Ignore Accessibility Settings

**What goes wrong:** Users with motion sensitivity (vestibular disorders, epilepsy) see animations that trigger symptoms; app is unusable for them.

**Why it happens:** Developer forgets to implement `@media (prefers-reduced-motion: reduce)` or uses a library that doesn't support it.

**How to avoid:** 
1. Always use Motion's `MotionConfig reducedMotion="user"` at app root level
2. Verify globals.css has `@media (prefers-reduced-motion: reduce)` block (lines 168–190, already present)
3. Test with device accessibility settings enabled (macOS: System Prefs > Accessibility > Display > Reduce Motion; Windows 11: Settings > Ease of Access > Display > Show animations)

**Warning signs:**
- No `reducedMotion` setting on Motion components
- Animations work in browser but not when accessibility settings are enabled

### Pitfall 2: Dark Mode Flashing on Page Load

**What goes wrong:** Page loads in light mode for 100ms, then switches to dark mode; jarring user experience.

**Why it happens:** Theme preference is in localStorage, but React hydration completes before localStorage is read; theme is applied after render.

**How to avoid:**
1. Use `next-themes` (handles this automatically) — do NOT implement manual theme switching
2. Set `attribute="class"` in ThemeProvider (uses class toggle, not data attributes, for fastest detection)
3. Test in Firefox/Chrome DevTools with slow 3G to see flashing (if it occurs, hydration isn't properly managed)

**Warning signs:**
- Light then dark mode flicker on page load
- Theme preference not persisting to localStorage

### Pitfall 3: Puppeteer Exceeds Vercel Function Timeout

**What goes wrong:** PDF generation requests fail with "Function exceeded maximum execution time" error on Vercel.

**Why it happens:** 
- Cold start overhead (15+ seconds just to load Chromium)
- Waiting for all network requests to complete in page
- File system I/O overhead

**How to avoid:**
1. Use `@sparticuz/chromium-min` to reduce binary size
2. Set `waitUntil: 'networkidle0'` in `page.setContent()` (don't wait for all network requests)
3. Implement singleton browser instance to reuse across requests (reduce cold-start impact)
4. Consider moving to background job queue if generation takes > 30 seconds

**Warning signs:**
- Test PDF export with slow network simulation
- Monitor Vercel function execution time in deployment logs

### Pitfall 4: Motion Library Bundle Size Concerns

**What goes wrong:** Motion bundle added 50KB to client-side code; LCP regressed.

**Why it happens:** Importing all of Motion when you only need a few animations.

**How to avoid:**
1. Use Motion's `LazyMotion` with `domAnimation` preset (only loads the features you need, ~15KB)
2. Only wrap components that need animation in Motion providers
3. Use CSS animations for simple spinners/transitions (zero JavaScript overhead)

**Warning signs:**
- Next.js bundle analysis shows motion package > 30KB
- LCP metrics increase after adding Motion

### Pitfall 5: Images Not Embedding in PDFs

**What goes wrong:** SIAG logo appears as broken image in generated PDF.

**Why it happens:** Puppeteer page receives relative image URL (`/public/siag-logo.svg`) but can't access local files.

**How to avoid:**
1. Convert images to data URLs or base64 before passing to Puppeteer
2. Use absolute URLs (e.g., `https://yourdomain.com/siag-logo.svg`) if images are already hosted
3. For local assets, use `fs.readFile()` + convert to base64 before embedding

**Warning signs:**
- Test by generating a PDF and opening in PDF reader; look for broken image placeholders

---

## Code Examples

### Example 1: Animated Button with Accessibility Compliance

Source: [VERIFIED: motion.dev docs]

```typescript
'use client';

import { motion, MotionConfig } from 'motion/react';

export function AnimatedButton() {
  return (
    <MotionConfig reducedMotion="user">
      <motion.button
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:shadow-lg"
      >
        Click Me
      </motion.button>
    </MotionConfig>
  );
}
```

### Example 2: Loading Spinner (CSS-Only)

Source: [VERIFIED: globals.css lines 150–154]

```html
<!-- In component: -->
<div className="spinner" />

<!-- In globals.css (already implemented): -->
.spinner {
  @apply inline-block h-4 w-4 animate-spin rounded-full;
  @apply border-2 border-siag-red border-r-transparent;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Duration:** 1s (Tailwind's default `animate-spin` duration)
**Frame count:** Continuous rotation (not step-based); CSS animation is smooth 60fps

### Example 3: Dark Mode Toggle with next-themes

Source: [CITED: medium.com/@salihbezai98]

```typescript
// src/components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Example 4: Server-Side PDF Export with Puppeteer

Source: [CITED: dev.to/harshvats2000, strapi.io blog]

```typescript
// src/app/api/incidents/[id]/export-pdf/route.ts
import puppeteer from 'puppeteer';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const incident = await db.incident.findUnique({
    where: { id: params.id },
  });

  if (!incident) {
    return new Response('Incident not found', { status: 404 });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .title-page { text-align: center; page-break-after: always; }
          .title-page img { max-width: 200px; }
          h1 { color: #CC0033; margin: 20px 0; }
          .incident-details { margin-top: 20px; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="title-page">
          <img src="data:image/svg+xml;base64,PHN2ZyB..." alt="SIAG Logo" />
          <h1>${incident.title}</h1>
          <p>Date: ${incident.createdAt.toLocaleDateString()}</p>
          <p>Severity: ${incident.severity}</p>
        </div>
        
        <div class="page-break"></div>
        
        <div class="incident-details">
          <h2>Incident Details</h2>
          <p>Description: ${incident.description}</p>
          <p>Affected Systems: ${incident.affectedSystems}</p>
          <p>Status: ${incident.status}</p>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Set content with waitUntil: 'networkidle0' (don't wait for background requests)
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
  });

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  });

  await browser.close();

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="incident-${incident.id}.pdf"`,
    },
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion (`framer-motion` package) | Motion (`motion/react` package) | Late 2024 | API identical; new package recommended; both packages maintained for backward compatibility |
| Manual theme switching with useState + localStorage | next-themes ThemeProvider | ~2020s (still best practice) | Prevents hydration mismatches, automatic system preference detection, zero flashing |
| Client-side PDF with html2canvas + jsPDF | Server-side with Puppeteer | 2020s–present | Client-side fails for complex layouts/CSS; Puppeteer now has serverless optimization (@sparticuz/chromium-min) |
| Tailwind darkMode: "class" in config | @custom-variant dark in CSS (Tailwind v4) | Early 2025 | Config files removed; CSS-first approach; 70% smaller output; better tree-shaking |
| hand-rolled `useReducedMotion` hook | Motion's `MotionConfig reducedMotion="user"` | 2024+ | Built-in accessibility; zero boilerplate; automatic application-wide |

**Deprecated/outdated:**
- **Framer Motion package name:** No longer recommended; use `motion/react` instead (identical API, cleaner branding)
- **tailwind.config.js darkMode config:** No longer exists in Tailwind v4; use `@custom-variant dark` in globals.css instead
- **Manual localStorage theme sync:** Causes flashing and hydration bugs; next-themes solves this automatically

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Puppeteer is already installed (v24.40.0 in package.json) | Standard Stack | Verified via npm registry and package.json read; no risk |
| A2 | Tailwind CSS v4 CSS-first dark mode approach works with next-themes | Architecture, Dark Mode | Multiple sources confirm this integration; low risk; will verify during phase planning |
| A3 | Motion's `reducedMotion="user"` automatically detects user's accessibility setting | Common Pitfalls | Verified via motion.dev docs; Motion is actively maintained; low risk |
| A4 | @sparticuz/chromium-min reduces Puppeteer binary from 200MB+ to ~50MB | Don't Hand-Roll | Verified via GitHub project; production-used; medium risk (need to test in actual Vercel deployment) |
| A5 | globals.css already has correct `@media (prefers-reduced-motion: reduce)` handling | Architecture, Common Pitfalls | Verified by direct code read (lines 168–190); implemented correctly; no risk |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions

1. **PDF title page logo encoding:** Should SIAG logo be embedded as base64 data URL or fetched from public/siag-logo.svg at runtime?
   - What we know: Puppeteer needs absolute URLs or data URIs for images
   - What's unclear: Whether to pre-convert logo to base64 (increases HTML string size) or fetch dynamically
   - Recommendation: Start with data URL (simpler), optimize to CDN fetch if PDF generation becomes slow

2. **Puppeteer vs jsPDF fallback strategy:** Should simple incident summaries use jsPDF for speed, or always use Puppeteer for consistency?
   - What we know: jsPDF is ~95KB, fast client-side; Puppeteer is slower but higher quality
   - What's unclear: What counts as "simple" (1 page? no images?)
   - Recommendation: Phase 10 uses Puppeteer throughout; jsPDF fallback can be added in future optimization phase if needed

3. **Motion bundle size in production:** Will Motion's 12KB (LazyMotion + domAnimation) + Tailwind v4 CSS (6–12KB) fit within LCP budget?
   - What we know: Motion is ~50KB full, ~15KB with LazyMotion
   - What's unclear: Actual bundle size impact on this specific project
   - Recommendation: Monitor with Next.js bundle analysis (`npm run build && npx next/bundle-analyzer`) before committing

4. **Dark mode persistence across incidents list:** Should dark mode preference apply globally or per-incident detail page?
   - What we know: next-themes persists to localStorage, applied at root level
   - What's unclear: Whether Phase 10 includes global persistence or manual per-page toggle
   - Recommendation: Implement global toggle in Header (v0.4.6 next-themes defaults to global); can scope to specific pages later if needed

5. **Print styles for dark mode PDFs:** Existing globals.css has print styles; do they conflict with dark mode variables?
   - What we know: print styles (lines 224–295) force white background; dark mode uses CSS variables
   - What's unclear: Whether Puppeteer respects print media queries when rendering
   - Recommendation: Test during phase planning; may need separate print-specific CSS

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Puppeteer, build tooling | ✓ | 20.x (Vercel default) | — |
| npm | Package management | ✓ | 10.x (Vercel default) | — |
| Puppeteer CLI tools | Optional (debugging PDFs locally) | ✗ | — | Use npx puppeteer to download on-demand |
| @sparticuz/chromium-min | Serverless PDF generation (Vercel) | Not installed yet | latest | Standard Chromium (larger, slower) |
| Browser for testing dark mode/animations | Manual testing | ✓ (Chrome, Firefox, Safari available) | Latest | — |

**Missing dependencies with no fallback:**
- None — all required packages are available or in package.json

**Missing dependencies with fallback:**
- @sparticuz/chromium-min: Optional optimization; Puppeteer works without it (just slower on Vercel)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (v4.1.2, already installed) |
| Config file | vitest.config.ts (check during phase planning) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOTION-01 | Button shows hover state (150ms ease-out transition) | unit | `npm run test -- motion/Button` | ❌ Wave 0 |
| MOTION-02 | Button shows press state (100ms scale 0.98) | unit | `npm run test -- motion/Button` | ❌ Wave 0 |
| MOTION-03 | Card elevates on hover with shadow increase | unit | `npm run test -- motion/Card` | ❌ Wave 0 |
| MOTION-04 | Loading spinner animates (1s rotation) | unit | `npm run test -- motion/Spinner` | ❌ Wave 0 |
| MOTION-05 | prefers-reduced-motion:reduce disables animations | unit | `npm run test -- motion/Accessibility` | ❌ Wave 0 |
| PDF-01 | PDF export generates valid PDF file | integration | `npm run test -- pdf/Export.test.ts` | ❌ Wave 0 |
| PDF-02 | Title page renders with SIAG logo and metadata | integration | `npm run test -- pdf/TitlePage.test.ts` | ❌ Wave 0 |
| PDF-03 | Multi-page layout includes page breaks | integration | `npm run test -- pdf/Layout.test.ts` | ❌ Wave 0 |
| DARK-01 | Theme toggle switches between light/dark | unit | `npm run test -- dark/ThemeToggle.test.ts` | ❌ Wave 0 |
| DARK-02 | Theme preference persists to localStorage | integration | `npm run test -- dark/Persistence.test.ts` | ❌ Wave 0 |
| DARK-03 | All text readable in both light and dark modes | manual | Visual inspection + lighthouse | Manual only |
| DARK-04 | Print styles work with dark mode (no bright backgrounds) | manual | Ctrl+P / Cmd+P test | Manual only |

### Sampling Rate
- **Per task commit:** `npm run test` (quick Vitest run)
- **Per wave merge:** `npm run test:coverage` (full coverage report)
- **Phase gate:** Full suite green + manual visual inspection (animations, dark mode, PDF quality) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/components/motion/Button.test.tsx` — covers MOTION-01, MOTION-02
- [ ] `tests/components/motion/Card.test.tsx` — covers MOTION-03
- [ ] `tests/components/motion/Spinner.test.tsx` — covers MOTION-04
- [ ] `tests/components/motion/Accessibility.test.tsx` — covers MOTION-05 (uses `@testing-library/react`'s `matchMedia` mock)
- [ ] `tests/api/pdf/Export.test.ts` — covers PDF-01 (mocks Puppeteer)
- [ ] `tests/api/pdf/TitlePage.test.ts` — covers PDF-02
- [ ] `tests/api/pdf/Layout.test.ts` — covers PDF-03
- [ ] `tests/components/dark/ThemeToggle.test.tsx` — covers DARK-01 (mocks next-themes)
- [ ] `tests/components/dark/Persistence.test.tsx` — covers DARK-02 (mocks localStorage)
- [ ] Framework config check: `vitest.config.ts` exists and includes jsdom environment for DOM tests

*(Implementation guidance:)*
- Motion tests: Mock `motion/react` using Vitest's `vi.mock()` or test with real Motion in jsdom
- PDF tests: Mock `puppeteer` to return fake PDF buffer; test HTML generation separately
- Dark mode tests: Mock `next-themes` or test `ThemeProvider` wrapper; use jsdom's `localStorage` mock for persistence
- Accessibility tests: Use `window.matchMedia` mock to simulate `prefers-reduced-motion` setting

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | (Not applicable to Phase 10) |
| V3 Session Management | no | (Not applicable to Phase 10) |
| V4 Access Control | yes | PDF export route (`/api/incidents/[id]/export-pdf`) must validate user owns incident before generating |
| V5 Input Validation | yes | HTML template in PDF generation sanitized; no user input injected unsanitized into Puppeteer HTML |
| V6 Cryptography | no | (Not applicable to Phase 10) |
| V7 Error Handling | yes | Puppeteer errors (browser launch failure, page render timeout) handled gracefully; no stack traces exposed |
| V8 Data Protection | yes | PDF generation should not log sensitive incident data; ensure tmpfiles cleaned up |
| V9 Communications | no | (Not applicable to Phase 10) |
| V10 Malicious Component | yes | Puppeteer dependency vetted; @sparticuz/chromium-min from trusted source |

### Known Threat Patterns for {Next.js 15 + Puppeteer + next-themes}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via unsanitized incident data in PDF | Tampering, Elevation of Privilege | Sanitize all user-provided incident fields before passing to Puppeteer; use DOMPurify or Tailwind CSS + PostCSS escaping |
| PDF route accessible without authentication | Tampering, Information Disclosure | Check `userId` from session/JWT before exporting; return 401 if unauthorized |
| Puppeteer browser process DoS | Denial of Service | Set timeout on PDF generation (30s max); limit concurrent browser instances; use singleton pool |
| Sensitive data in browser cache / localStorage | Information Disclosure | Dark mode preference in localStorage is non-sensitive (just theme name); ensure no API keys/tokens stored in localStorage |
| CSS injection via dark mode variables | Tampering | CSS variables use limited scope (theme color values); no user input directly in variable names |

---

## Sources

### Primary (HIGH confidence)
- [motion.dev](https://motion.dev) - Official Motion (Framer Motion) documentation, API reference, accessibility guide
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) - Official next-themes repository, examples
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) - Official dark mode configuration, CSS variables, custom variants
- [npm registry](https://npmjs.com) - Verified package versions: Motion 12.38.0, next-themes 0.4.6, Puppeteer 24.40.0

### Secondary (MEDIUM confidence)
- [sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4](https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4) - Next.js 15 + Tailwind v4 + dark mode integration verified
- [dev.to/harshvats2000](https://dev.to/harshvats2000/creating-a-nextjs-api-to-convert-html-to-pdf-with-puppeteer-vercel-compatible-16fc) - Puppeteer + Vercel serverless implementation
- [strapi.io/blog](https://strapi.io/blog/build-a-pdf-generation-engine-with-nextjs-puppeteer-and-strapi) - Puppeteer PDF generation patterns
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) - prefers-reduced-motion standard
- [motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility) - Motion accessibility compliance patterns

### Tertiary (MEDIUM-LOW confidence)
- [medium.com/@salihbezai98](https://medium.com/@salihbezai98/step-by-step-guide-to-adding-dark-mode-with-next-themes-in-next-js-and-tailwind-css-15db7876f071) - next-themes integration guide
- [dev.to/tene](https://dev.to/tene/dark-mode-using-tailwindcss-v40-2lc6) - Tailwind CSS v4 dark mode
- [blog.logrocket.com](https://blog.logrocket.com/best-html-pdf-libraries-node-js/) - Comparison of Node.js PDF libraries
- [css-tricks.com](https://css-tricks.com/single-element-loaders-the-spinner/) - CSS loading spinners

---

## Metadata

**Confidence breakdown:**
- Standard stack (Motion, next-themes, Puppeteer): **HIGH** — All verified via npm registry and official docs
- Architecture patterns: **HIGH** — All patterns verified via source code examples and official documentation
- Common pitfalls: **HIGH** — Based on official docs + multiple community sources confirming same issues
- Environment availability: **HIGH** — All verified via npm registry and local package.json
- Validation architecture: **MEDIUM** — Test file templates TBD; framework/config verified, specific test implementations needed in Wave 0

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 days — stable tech stack; motion.dev and next-themes update infrequently)

---

## Next Steps for Planner

1. **Create sub-phases for Phase 10:**
   - 10-01: Motion animations + CSS spinner (low risk, quick wins)
   - 10-02: Dark mode with next-themes (medium risk, high visibility)
   - 10-03: PDF export with Puppeteer (higher complexity, serverless concerns)

2. **Validate with user:**
   - Confirm PDF title page design (logo size, metadata layout)
   - Confirm dark mode should be app-wide (next-themes default) or scoped
   - Confirm animation timing (150ms for buttons, 100ms press, 1s spinner — per success criteria)

3. **Plan testing strategy:**
   - Motion: Real Motion components in jsdom (test interaction, not just animation)
   - PDF: Mock Puppeteer for unit tests; manual PDF export test for integration
   - Dark mode: Mock next-themes for unit tests; manual toggle test for UX validation
   - Accessibility: Test with `prefers-reduced-motion` enabled on actual OS

4. **Identify Vercel deployment considerations:**
   - @sparticuz/chromium-min installation for serverless Puppeteer optimization
   - Function timeout settings for PDF generation (recommend 30s minimum)
   - Environment variables for any image CDN or external PDF services
