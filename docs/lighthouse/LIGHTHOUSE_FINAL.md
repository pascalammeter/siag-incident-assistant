# Lighthouse Audit — Post-Optimization Report

**URL:** https://siag-incident-assistant.vercel.app  
**Date:** 2026-04-08  
**Phase:** 13-02 Performance Optimization (post-optimization)  
**Status:** Code optimizations complete; browser audit pending

---

## How to Run the Audit

Since Chrome is not available in the CI/automation environment, run the audit manually:

### Option A: Chrome DevTools
1. Open https://siag-incident-assistant.vercel.app in Chrome
2. Open DevTools → Lighthouse tab
3. Select: Performance, Accessibility, Best Practices, SEO
4. Run for Mobile and Desktop separately

### Option B: PageSpeed Insights (Recommended for real-world data)
1. Visit https://pagespeed.web.dev/
2. Enter: https://siag-incident-assistant.vercel.app
3. Results include both lab data and field data (CrUX)

### Option C: CLI (if Chrome is available)
```bash
npx lighthouse https://siag-incident-assistant.vercel.app \
  --output=html \
  --output-path=docs/lighthouse/report-$(date +%Y%m%d).html \
  --chrome-flags="--headless --no-sandbox"
```

---

## Optimizations Applied (This Plan)

### Frontend (Task 2)

| Optimization | Implementation | Expected Impact |
|-------------|----------------|-----------------|
| Font weight reduction | 400/600/700 only (dropped 500) | -~15KB transfer |
| Font preload | `preload: true` in next/font | -50-100ms LCP |
| Viewport metadata | Separate `viewport` export (Next.js 14+) | Lighthouse Best Practices ✓ |
| OG metadata | Added openGraph block | SEO +2-3 points |
| Image optimization | AVIF/WebP formats, 1yr TTL | -20-40% image size |
| Caching headers | Static: 1yr immutable; API: 5/10min; Pages: no-cache | Performance +5-10pts |
| Security headers | X-Content-Type-Options, X-Frame-Options, etc. | Best Practices +5-10pts |
| SEO description | Full German description added | SEO +2-3 points |

### Backend (Task 3)

| Optimization | Implementation | Expected Impact |
|-------------|----------------|-----------------|
| deletedAt index | Added `@@index([deletedAt])` | -10-30ms on filtered queries |
| Composite indexes | (incident_type, deletedAt), (severity, deletedAt) | -5-15ms on combined filters |
| Pagination cap | 50 max (was 100) | -50% max payload size |

### Monitoring (Task 4)

| Component | Purpose |
|-----------|---------|
| @vercel/analytics | Real user page view tracking |
| @vercel/speed-insights | Core Web Vitals from real sessions |

---

## Expected Post-Optimization Scores

Based on the optimizations applied and the existing architecture:

| Category | Pre-Optimization | Expected Post | Target |
|----------|-----------------|---------------|--------|
| Performance | ~75-85 | **90-95** | ≥90 |
| Accessibility | ~90+ | **92-96** | ≥90 |
| Best Practices | ~85-90 | **92-95** | ≥90 |
| SEO | ~90+ | **92-96** | ≥90 |

**Key factors favoring high scores:**
- App Router with React Server Components (minimal client JS bundle)
- next/font with preload:true (zero FOIT, minimal CLS)
- All images are SVGs (zero raster cost, vector perfect)
- Tailwind CSS v4 (aggressive dead-code elimination)
- Security headers now set (Best Practices requirement)
- Separate viewport export (eliminates Lighthouse warning)

---

## Core Web Vitals Expectations

| Metric | Expected | Target | Notes |
|--------|----------|--------|-------|
| LCP    | 1.2-2.0s | <2.5s  | Hero text (no large images) |
| FID    | <50ms    | <100ms | Minimal JS on main thread |
| CLS    | <0.05    | <0.1   | Font preload prevents layout shift |
| INP    | <100ms   | <200ms | Simple wizard interactions |

---

## API Performance (from Phase 12-02 Load Tests)

| Endpoint | Avg | p95 | Target |
|----------|-----|-----|--------|
| GET /api/incidents | 145ms | 320ms | avg <200ms, p95 <500ms |
| POST /api/incidents | 380ms | 850ms | avg <500ms, p95 <1000ms |

With new composite indexes on (incident_type, deletedAt) and (severity, deletedAt):
- Filtered GET requests: estimated -10-20ms improvement

---

## Pending Actions

- [ ] Run Chrome DevTools Lighthouse audit on production
- [ ] Run PageSpeed Insights and save screenshots to this directory
- [ ] Verify Vercel Analytics dashboard shows data (24h after deploy)
- [ ] Check Speed Insights for real CWV data (requires real traffic)
- [ ] Run `npx prisma db push` to apply new indexes to Neon DB
- [ ] Re-run k6 load test (from 12-02) after index migration

---

## Notes

- The Vercel deployment is live (HTTP 200 confirmed 2026-04-08)
- Code-side optimizations committed and pushed via Phase 13-01 + 13-02
- Production Lighthouse numbers will be available once Chrome is run against the live URL
- Speed Insights data requires real user traffic (not available immediately post-deploy)
