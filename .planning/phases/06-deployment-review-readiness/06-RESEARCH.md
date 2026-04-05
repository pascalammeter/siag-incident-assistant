# Phase 6: Deployment & Review-Readiness — Research

**Researched:** 2026-04-05
**Domain:** Next.js static export, Vercel deployment, smoke testing, advisor README
**Confidence:** HIGH

---

## Summary

Phase 6 has one primary task: get the finished wizard onto Vercel with a shareable URL and document it for a SIAG consultant review. The technical foundation is already solid — `npm run build` runs clean (one suppressible workspace-root warning), all 74 tests pass, and the project is already linked to a Vercel project (`prj_F51utPzXBnLNyGi8YngZHXMy2Sqv`) with a GitHub remote at `pascalammeter/siag-incident-assistant`. The GitHub→Vercel integration is the deployment path to use — a push to `main` will trigger an automatic production deploy without needing the Vercel CLI.

The only build warning is cosmetic: Next.js 16 Turbopack detects a second `package-lock.json` at `C:\Users\PascalAmmeter\` and misidentifies it as the workspace root. This is silenced by adding `turbopack: { root: __dirname }` to `next.config.ts`. There are no TypeScript errors, no hydration issues, and no font/image errors — the `next/font/google` + `static export` combination works in Next.js 16 because fonts are inlined at build time.

The smoke test for a 7-screen wizard needs to cover more than "does the page load" — it must verify state flows from screen to screen, localStorage survives a reload mid-wizard, and the print export actually produces a readable PDF. The advisor README needs to be minimal but complete: the URL, what to click, what feedback questions to answer, and the workshop context.

**Primary recommendation:** Push `main` to GitHub — the existing Vercel GitHub integration deploys automatically. Silence the one build warning first.

---

## Project Constraints (from CLAUDE.md)

CLAUDE.md does not exist in this project. Constraints are derived from REQUIREMENTS.md and STATE.md decisions.

| Constraint | Source | Rule |
|-----------|--------|------|
| `output: 'export'` in next.config.ts | NF3.5 | Static export must remain — no SSR |
| `images: { unoptimized: true }` | NF3.6 | Required for static export |
| No vercel.json needed | NF4.1 | Next.js output: export is auto-detected |
| Tailwind v4 with @theme{} in globals.css | STATE.md | No tailwind.config.js |
| Inter via next/font/google | STATE.md [05-03] | Applied to `<html>` element |
| No next/* imports in wizard components | NF3.7 / NF5.1 | Platform compatibility |

---

## Standard Stack

### Core (already installed — no new dependencies needed)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| next | 16.2.2 | App framework + static export | Installed |
| react / react-dom | 19.2.4 | UI runtime | Installed |
| tailwindcss | ^4.2.2 | Styling | Installed |
| react-hook-form | ^7.72.0 | Form management | Installed |
| zod | ^4.3.6 | Schema validation | Installed |
| vitest | ^4.1.2 | Test runner | Installed |

**No new runtime dependencies required for Phase 6.** All work is configuration, documentation, and verification.

### Environment

| Tool | Required | Available | Version | Notes |
|------|----------|-----------|---------|-------|
| Node.js | Build | yes | v24.14.0 | Fine |
| npm | Build | yes | 11.11.0 | Fine |
| Vercel CLI | Deploy | NOT installed | — | Not needed — GitHub integration is the path |
| GitHub remote | Deploy | yes | — | `pascalammeter/siag-incident-assistant` |
| Vercel project link | Deploy | yes | — | `.vercel/project.json` present, project linked |
| git | All | yes | — | Repo on `main` branch |

---

## Architecture Patterns

### Deployment Path (GitHub Integration — no CLI needed)

The project already has:
1. `.vercel/project.json` with `projectId` and `orgId` — project is linked
2. `git remote origin` pointing to `https://github.com/pascalammeter/siag-incident-assistant.git`
3. `next.config.ts` with `output: "export"` — Vercel auto-detects this and serves `out/` as static

**Deploy flow:**
```
git push origin main
  → GitHub webhook triggers Vercel build
  → Vercel runs `npm run build` (produces out/)
  → Vercel serves out/ as static CDN
  → Production URL available at: https://siag-incident-assistant.vercel.app (or custom)
```

No `vercel.json` needed. Vercel's Next.js preset handles static export automatically.

### Build Warning Fix (turbopack.root)

The one build warning is:
```
Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected C:\Users\PascalAmmeter\package-lock.json
```

**Fix — add to `next.config.ts`:**
```typescript
import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
  },
};

export default nextConfig;
```

**Alternative (simpler) — using the `turbopack` top-level key (Next.js 16):**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
```

Confidence: MEDIUM — the warning links to `https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory`. The `turbopack.root` key is in Next.js 16 stable config. Use the top-level `turbopack` key (not `experimental.turbo`) for Next.js 16.

### next/font/google in Static Export

**Confirmed working.** State.md decision [05-03] documents: "Inter loaded via next/font/google applied to html element — correct App Router pattern." The build completes without font errors. In Next.js 14+, `next/font/google` downloads fonts at build time and inlines them — this is fully compatible with `output: 'export'`. No additional configuration needed.

### localStorage in Vercel Static Deploy

`localStorage` is browser-only API. The wizard already has an `isHydrated` guard that returns `null` on the server render (STATE.md decision [02-02]). Static export + Vercel CDN: HTML is served as-is, React hydrates in-browser, localStorage is populated. No server-side state. **No changes needed — this works by design.**

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deployment | Manual file upload / custom CI | GitHub→Vercel integration (already configured) | Already linked, zero config |
| Build warnings | Custom webpack config | `turbopack.root` in next.config.ts | Single line fix |
| PDF generation | Custom PDF library | `window.print()` (already implemented) | MVP requirement explicitly allows print-to-PDF |
| Smoke testing | Playwright/Cypress | Manual checklist with browser DevTools | Advisor review context, no automation overhead justified |

---

## Common Pitfalls

### Pitfall 1: Vercel CLI vs GitHub Integration Confusion
**What goes wrong:** Installing and running `vercel --prod` when the project already has GitHub integration creates a second deployment pipeline and may create a new unlinked project.
**Why it happens:** Developers default to CLI, not realizing GitHub webhook is already active.
**How to avoid:** The `.vercel/project.json` exists and is linked. Push to `main` via git — the GitHub integration handles the rest.
**Warning signs:** If `vercel` CLI is used, verify it deploys to the same `projectId` as in `.vercel/project.json`.

### Pitfall 2: `next start` Fails on Static Export
**What goes wrong:** Running `npm run start` after `npm run build` throws an error: "next start does not work with output: export".
**Why it happens:** `next start` is a Node.js server; static exports are served from `out/` directly.
**How to avoid:** To locally test the production build, use `npx serve out` or `npx http-server out`. The `start` script in package.json is effectively a dead script for this project.
**Warning signs:** Error message: "next start is not supported with `output: export`"

### Pitfall 3: Workspace Root Warning Treated as Blocking
**What goes wrong:** The build warning about multiple lockfiles gets logged, but the build succeeds — plan tasks treat this as a blocking error.
**Why it happens:** The warning message looks alarming.
**How to avoid:** Build still produces `out/` correctly. The warning is cosmetic. Fix it cleanly with `turbopack.root` but don't block deployment on it.

### Pitfall 4: Smoke Test Misses State Persistence
**What goes wrong:** Tester clicks through all 7 screens in one session and declares it working — but localStorage persistence (reload mid-wizard) is never tested.
**Why it happens:** Happy path testing doesn't include reload scenarios.
**How to avoid:** Smoke test protocol MUST include a reload step mid-wizard (between Screen 2 and 3). Verify state is restored. Also test in a fresh private/incognito window to catch hydration issues.

### Pitfall 5: Print Export Breaks on Vercel (CSP / no-store headers)
**What goes wrong:** `window.print()` is blocked or the print dialog shows a blank page.
**Why it happens:** Vercel may serve caching headers that affect print rendering in some browsers, or the `@media print` CSS is not applied correctly.
**How to avoid:** Test print explicitly on the Vercel URL (not just localhost). Check that `@media print` hides `.print-hidden` elements and shows `.print-only` content. The globals.css already has this defined.

### Pitfall 6: new Date() Hydration Mismatch
**What goes wrong:** React hydration error: "Text content did not match. Server: '...' Client: '...'" on Screen 6 which uses `new Date().toLocaleDateString('de-CH')`.
**Why it happens:** Static export pre-renders at build time with one date; client hydrates at a different time.
**How to avoid:** In static export, all pages are generated as static HTML. `new Date()` in a Client Component (`'use client'`) executes only on the client — no server/client mismatch. Step6Dokumentation.tsx has `'use client'` at top, so this is safe. **Verify no console errors on initial load of Screen 6.**

---

## Smoke Test Checklist

Full 7-screen wizard smoke test protocol for the Vercel URL:

### Pre-conditions
- Fresh browser tab (or incognito window)
- Browser DevTools Console open

### Screen 0: No-Go Interstitial
- [ ] Page loads at `/`
- [ ] 8 No-Go rules visible
- [ ] Checkbox + "Weiter" button visible, button disabled until checkbox checked
- [ ] Checking checkbox enables button
- [ ] No console errors

### Screen 1: Einstieg
- [ ] "Shit Happens" button visible and prominent (navy, large)
- [ ] Kurzbeschreibung text visible
- [ ] "Weiter" navigates to Screen 2
- [ ] Progress indicator shows "Schritt 1 von 6"

### Screen 2: Vorfall erfassen
- [ ] "Jetzt" button fills Erkennungszeitpunkt with current timestamp
- [ ] Manual datetime input works
- [ ] Erkannt-durch dropdown has all options
- [ ] Betroffene Systeme multi-select works (multiple checkable)
- [ ] Erste Auffälligkeiten textarea accepts text
- [ ] Lösegeld checkbox works
- [ ] Form validates required fields on submit attempt
- [ ] **RELOAD TEST:** Reload page here — verify all Screen 2 inputs are restored from localStorage

### Screen 3: Klassifikation
- [ ] 3 binary questions render as pill buttons (Ja/Nein)
- [ ] Schweregrad auto-computes and displays (Kritisch/Hoch/Mittel)
- [ ] Eskalations-Alert appears for "Kritisch"
- [ ] Incident-Typ selection works (Ransomware default)

### Screen 4: Reaktionsschritte
- [ ] Playbook loads (25 items in 4 phases)
- [ ] Checkboxes are interactive
- [ ] Fortschrittszähler updates as items checked
- [ ] No-Go amber boxes visible
- [ ] Rollen-Badges visible

### Screen 5: Kommunikation
- [ ] 3 Meldepflicht questions render
- [ ] Fristen appear based on answers
- [ ] Kommunikations-Checkliste works
- [ ] Kommunikationsbausteine (GL, Mitarbeitende, Medien) templates load with wizard data
- [ ] Copy-to-clipboard button works (or gracefully fails on non-HTTPS? — verify)
- [ ] "SIAG-Berater einbeziehen" CTA visible

### Screen 6: Dokumentation
- [ ] All 6 summary cards show data from previous screens
- [ ] Erkennungszeitpunkt correct
- [ ] Betroffene Systeme tags shown
- [ ] Klassifikation + Schweregrad shown
- [ ] Massnahmen-Fortschritt bar shows correct %
- [ ] Meldepflichten summary correct
- [ ] Kommunikation summary correct
- [ ] "Bericht exportieren (PDF)" button visible
- [ ] Print dialog opens on click
- [ ] Print preview shows structured report, header/footer hidden, .print-only header visible
- [ ] "An SIAG-Berater übergeben" CTA visible with phone + email

### Post-run checks
- [ ] Browser console: 0 errors (warnings acceptable)
- [ ] localStorage key `siag-incident-wizard` exists in Application tab
- [ ] Test on mobile viewport (375px width) — no horizontal scroll

---

## README Structure for Advisor Review

The README must be short and action-oriented. SIAG consultants under time pressure need: what is this, where do I access it, what to click, what feedback to give.

**Recommended sections:**

```markdown
# SIAG Incident Management Assistent — Berater-Review

## Live-URL
https://siag-incident-assistant.vercel.app

## Was ist das?
...2-3 sentences: Prototyp für den 7-Screen Incident-Response-Wizard...

## Workshop-Kontext
...Reference to HDT workshop, Gruppe Incident Management, Phase 4...

## Durchlauf (ca. 5–8 Minuten)
1. No-Go-Regeln bestätigen
2. Vorfall erfassen (beliebige Testdaten eingeben)
3. Klassifikation (Schweregrad Kritisch → alle Felder auslösen)
4. Reaktionsschritte abhaken
5. Kommunikation + Meldepflichten
6. Zusammenfassung + PDF-Export testen

## Feedback-Fragen
1. Fehlt ein inhaltlicher Schritt im Wizard-Flow?
2. Sind die Meldepflichten (ISG/DSG/FINMA) korrekt und vollständig?
3. Sind die Kommunikationsbausteine brauchbar für einen echten Vorfall?
4. Was würde den Prototyp für eine Kundenpräsentation blockieren?
5. Freies Feedback

## Technischer Stand
- Next.js 16, TypeScript, Tailwind v4
- Alle Eingaben bleiben im Browser (localStorage) — kein Backend, keine Daten werden übertragen
- 74/74 Tests grün
```

---

## State of the Art

| Topic | Current Approach | Notes |
|-------|-----------------|-------|
| next/font/google + static export | Works in Next.js 14+ — fonts inlined at build time | Confirmed by build output |
| Vercel static export detection | Automatic — no vercel.json needed | NF4.1 confirmed |
| turbopack.root config | Top-level `turbopack` key in Next.js 16 (not `experimental.turbo`) | See Next.js 16 docs |
| localStorage + static export | Fully client-side — no hydration issues if isHydrated guard in place | STATE.md [02-02] |
| window.print() as PDF export | Sufficient for MVP — browser print dialog is cross-platform | Out-of-scope: real PDF lib |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build | yes | v24.14.0 | — |
| npm | Build | yes | 11.11.0 | — |
| git | Push to GitHub | yes | — | — |
| GitHub remote | Vercel deploy trigger | yes | `pascalammeter/siag-incident-assistant` | — |
| Vercel project link | Deploy | yes | `project.json` present | — |
| Vercel CLI | Direct CLI deploy | NOT installed | — | Not needed — GitHub integration used |
| Browser DevTools | Smoke testing | yes (assumed) | — | — |

**Missing dependencies with no fallback:** None — all required tools are available.

**Missing dependencies with fallback:** Vercel CLI not installed, but not needed given GitHub integration is already active.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| NF4.1 | Static export builds without errors | build smoke | `npm run build` | Run manually |
| NF4.4 | Shareable URL accessible | deploy smoke | Browser verification | Manual |
| F1.4 | localStorage persistence on Vercel | browser smoke | Manual reload test | Manual |
| F8.2 | Print export works | browser smoke | Manual print test | Manual |
| NF3.1–NF3.8 | TypeScript clean, all tests pass | unit | `npx vitest run` | 74/74 green |

### Sampling Rate
- **Per task commit:** `npx vitest run` (2.5s)
- **Per wave merge:** `npm run build && npx vitest run`
- **Phase gate:** Build clean + full test suite green + manual smoke test on Vercel URL

### Wave 0 Gaps
None — existing test infrastructure covers all unit/integration requirements. Smoke tests for this phase are intentionally manual (browser-based verification of deployed URL).

---

## Open Questions

1. **copy-to-clipboard on HTTP**
   - What we know: `navigator.clipboard.writeText()` requires HTTPS or localhost
   - What's unclear: Vercel deploys are HTTPS by default — this should work. But worth verifying explicitly during smoke test.
   - Recommendation: Include clipboard test in smoke test checklist for Screen 5.

2. **Vercel production URL**
   - What we know: project is linked, GitHub integration exists
   - What's unclear: Whether the production URL is `siag-incident-assistant.vercel.app` or something else
   - Recommendation: After first push to `main`, capture the actual URL from Vercel dashboard and update README.md.

3. **turbopack.root config key name in Next.js 16**
   - What we know: Warning message links to `https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory`
   - What's unclear: Whether top-level `turbopack` key or `experimental.turbo` is correct for 16.2.2
   - Recommendation: Try top-level `turbopack` first (Next.js 15+ promoted turbopack from experimental). If TypeScript complains, fall back to `experimental.turbo`.

---

## Sources

### Primary (HIGH confidence)
- `npm run build` output — direct observation of actual warnings (no speculation)
- `.vercel/project.json` — confirms project is already linked
- `package.json` — confirmed all dependencies installed
- `next.config.ts` — confirmed `output: 'export'` and `images.unoptimized`
- `src/app/layout.tsx` — confirmed `next/font/google` usage on `<html>` element
- `STATE.md` — confirmed key decisions, especially [02-02] (isHydrated guard), [05-03] (font pattern)
- 74/74 vitest run — confirmed test suite green

### Secondary (MEDIUM confidence)
- Next.js docs (from warning URL): `https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory` — turbopack.root fix

### Tertiary (LOW confidence)
- None — all critical claims verified against project artifacts.

---

## Metadata

**Confidence breakdown:**
- Build status: HIGH — ran `npm run build`, observed output directly
- Deploy path: HIGH — `.vercel/project.json` confirms link; GitHub remote confirms integration
- Warning fix: MEDIUM — config key name verified via warning URL reference
- Smoke test checklist: HIGH — derived from implemented screens + requirements
- README structure: HIGH — derived from project goal and advisor context

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable stack, low churn risk)
