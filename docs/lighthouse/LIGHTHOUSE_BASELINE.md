# Lighthouse Audit — Baseline Report

**URL:** https://siag-incident-assistant.vercel.app  
**Date:** 2026-04-08  
**Phase:** 13-02 Performance Optimization  
**Status:** Pre-optimization baseline

---

## Audit Approach

Production deployed after Phase 13-01 (Vercel + Neon setup). Baseline scores are
estimated based on app architecture before code-side optimizations in 13-02:

- Next.js 16 App Router, SSR mode (not static export)
- Source Sans 3 loaded via next/font/google (optimized by default)
- Tailwind CSS v4 with purge enabled
- SVG logo (siag-logo.svg) — already lightweight
- No `@vercel/analytics` installed yet (Task 4 adds it)
- No explicit caching headers on API routes (Task 2 adds them)

---

## Pre-Optimization Estimates (Architecture-Based)

| Category        | Estimated Score | Target | Gap         |
|-----------------|-----------------|--------|-------------|
| Performance     | ~75-85          | ≥90    | 5-15 points |
| Accessibility   | ~90+            | ≥90    | Likely met  |
| Best Practices  | ~85-95          | ≥90    | Minimal     |
| SEO             | ~90+            | ≥90    | Likely met  |

**Note:** Exact Lighthouse scores require Chrome DevTools run against the live URL.
Run `npx lighthouse https://siag-incident-assistant.vercel.app --output=html` for
precise numbers.

---

## Known Performance Factors (Pre-Optimization)

### Positive (Already Optimized)
- ✅ `next/font/google` with `display: swap` — no FOIT
- ✅ SVG logo — vector, zero raster cost
- ✅ Tailwind CSS v4 — tree-shaken by default (no PurgeCSS config needed)
- ✅ Source Sans 3 — only weights 400/500/600/700 loaded
- ✅ No unused heavy image assets (all public assets are SVGs)
- ✅ App Router with React Server Components (minimal client JS)
- ✅ Next.js automatic code splitting per route

### Areas for Optimization (This Plan)
- ⚠️ No caching headers on `/api/incidents` responses
- ⚠️ No `@vercel/analytics` for real Web Vitals tracking
- ⚠️ No `viewport` metadata in layout (needed for mobile Lighthouse)
- ⚠️ `next.config.ts` has no image optimization domains configured
- ⚠️ No `preload` for the Source Sans 3 critical font
- ⚠️ No Vercel Speed Insights integration

---

## Core Web Vitals Targets

| Metric | Target  | Priority                    |
|--------|---------|-----------------------------|
| LCP    | <2.5s   | Page hero / largest element |
| FID    | <100ms  | Main thread blocking        |
| CLS    | <0.1    | Layout shift from fonts     |
| INP    | <200ms  | Interaction responsiveness  |

---

## Post-Optimization Report

See `LIGHTHOUSE_FINAL.md` (created after Task 5 re-audit).
