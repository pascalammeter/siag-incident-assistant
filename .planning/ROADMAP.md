# Roadmap — SIAG Incident Management Assistent

## Project Goal
Klickbarer, vollständiger 7-Screen Incident-Response-Wizard als Next.js 15 App auf Vercel. SIAG-Branding. Bereit für Review durch SIAG-Berater. Komponentenarchitektur vorbereitet für spätere Kundenplattform-Integration.

---

## Phase 1: Project Foundation
**Goal:** Lauffähiges Next.js 15 Projekt mit SIAG-Branding, Tailwind v4 und Vercel-Pipeline. Kein Inhalt — nur die Hülle.

**Success Criteria:**
- `npm run build` läuft durch ohne Fehler (static export)
- Vercel Preview-URL existiert und zeigt leere Shell
- SIAG-Farbpalette als CSS-Custom-Properties konfiguriert
- Git + GitHub Setup mit korrekter Email (Vercel Hobby)

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 15 + Tailwind v4 Setup + SIAG Design-Tokens + Static Export
- [x] 01-02-PLAN.md — Base Layout: Header (SIAG-Branding), Footer, Page-Shell
- [ ] 01-03-PLAN.md — GitHub Repo + Vercel Deploy-Pipeline

---

## Phase 2: Wizard Engine
**Goal:** Vollständige technische Wizard-Infrastruktur: State-Management, Navigation, Forms, Persistenz — ohne Inhalte.

**Success Criteria:**
- 7 Placeholder-Screens durchklickbar (Vor/Zurück)
- Fortschrittsanzeige zeigt korrekten Schritt
- Formulareingaben überleben Browser-Reload (localStorage)
- Zod-Schemas für jeden Schritt vorhanden (leer, aber typisiert)

**Plans:** 5 plans

Plans:
- [ ] 02-01-PLAN.md — Wizard-State mit `useReducer` + React Context (Types, Reducer, Provider, Tests)
- [ ] 02-02-PLAN.md — `localStorage`-Persistenz mit SSR-sicherem Hydration-Guard
- [ ] 02-03-PLAN.md — `StepNavigator` + `WizardProgress` + `WizardShell` (Navigation-UI)
- [ ] 02-04-PLAN.md — `react-hook-form` + Zod Integration (StepForm, Schemas, Tests)
- [ ] 02-05-PLAN.md — 7 Placeholder-Screens scaffolden + Wizard auf Hauptseite mounten

---

## Phase 3: Screens 0–3 (Triage)
**Goal:** No-Go Interstitial, Shit-Happens-Einstieg, Vorfall-Erfassung und Klassifikation vollständig implementiert und inhaltlich korrekt.

**Success Criteria:**
- No-Go-Interstitial: 8 Regeln, Pflicht-Bestätigung, Amber-Styling
- Schritt 1: Shit-Happens-Button funktioniert, Kurzerklärung vorhanden
- Schritt 2: Auto-Timestamp funktioniert, alle Pflichtfelder validiert, Meldefrist-Hinweis sichtbar
- Schritt 3: 3-Fragen-Entscheidungsbaum leitet korrekt zu Kritisch/Hoch/Mittel

**Plans:**
- 01: Screen 0 — No-Go Interstitial: 8 Regeln, amber-Styling, Checkbox + Confirm-Button, localStorage-Flag
- 02: Screen 1 — Einstieg: „Shit Happens"-Button (gross, Navy, Hero), Kurzbeschreibung, Alternativeinstieg
- 03: Screen 2 — Vorfall erfassen: Formular mit Auto-Timestamp, System-Multi-Select, Ransomware-Checkbox, Meldefrist-Banner
- 04: Screen 3 — Klassifikation: 3-Fragen-Entscheidungsbaum → automatischer Schweregrad, Incident-Typ-Auswahl, Eskalations-Alert bei Kritisch

---

## Phase 4: Screens 4–5 (Response & Communication)
**Goal:** Ransomware Playbook und Schweizer Meldepflicht-Logik vollständig implementiert.

**Success Criteria:**
- Schritt 4: 25-Punkte Checkliste in 4 Phasen, abhakbar, Fortschritts-Zähler, No-Go-Inlines
- Schritt 5: 3-Fragen Meldepflicht → korrekte CH-Fristen (ISG 24h, DSG, FINMA 24/72h), Kommunikations-Checkliste

**Plans:**
- 01: Playbook-Daten als TypeScript-Konstanten — 25 Ransomware-Schritte, 4 Phasen, Rollen, No-Go-Flags
- 02: Screen 4 — Reaktionsschritte: Checklisten-UI, Checkbox-State im Wizard-Context, Phase-Gruppen, No-Go-Amber-Boxes, Rollen-Badges
- 03: Screen 5 — Meldepflicht: 3-Ja/Nein-Fragen → dynamische Fristen-Liste mit Countdown (ISG/DSG/FINMA), Kommunikations-Checkliste
- 04: Screen 5 — Kommunikationsbausteine: Textvorlagen für GL, Mitarbeitende, Medien (kopierbar), „SIAG einbeziehen"-CTA

---

## Phase 5: Screen 6 + Polish
**Goal:** Incident-Report-Seite vollständig. SIAG-Branding polished. Mobile responsive. Print-Export funktioniert.

**Success Criteria:**
- Schritt 6: Vollständige Incident-Zusammenfassung, alle Eingaben der vorherigen Schritte korrekt konsolidiert
- „SIAG-Berater übergeben"-Button prominent, mit Kontaktinfo/Placeholder
- Print-to-PDF liefert lesbaren, strukturierten Report
- Mobile: alle Screens auf 375px Viewport korrekt dargestellt
- Keine offensichtlichen Design-Inkonsistenzen

**Plans:**
- 01: Screen 6 — Incident-Zusammenfassung: alle State-Felder konsolidiert darstellen, strukturierter Report-Layout
- 02: Screen 6 — SIAG-Handoff CTA + Bericht-Export (Print-CSS, `window.print()`, sauberes Print-Layout)
- 03: SIAG-Branding Refinement — Logo (SVG Placeholder mit Markierung), Typography-Hierarchie, Spacing-Konsistenz
- 04: Mobile Responsiveness — alle 7 Screens auf 375px + 768px testen, Touch-Targets ≥ 44px, Stacking-Layouts

---

## Phase 6: Deployment & Review-Readiness
**Goal:** Produktiver Vercel-Deploy mit geteilter URL. Smoke-tested. Bereit für Berater-Review.

**Success Criteria:**
- Öffentliche Vercel-URL erreichbar, kompletter 7-Screen-Durchlauf funktioniert
- Keine Console-Errors im Browser
- localStorage-Persistenz auf Vercel verifiziert
- Review-Notiz / README für Berater vorhanden

**Plans:**
- 01: Production Build verifizieren (`next build` + `output: 'export'`) — alle Warnings beseitigen
- 02: Vercel Production Deploy — Branch `main` → automatisches Deploy, Custom-Domain optional
- 03: End-to-End Smoke Test — kompletter Durchlauf aller 7 Screens, localStorage, Print-Export
- 04: `README.md` für Berater — Vercel-URL, Ziel des Reviews, Feedback-Fragen, Workshop-Kontext

---

## Dependencies
- Phase 2 → Phase 1 (Foundation muss stehen)
- Phasen 3–5 können parallel laufen (je eigene Screens), sofern Phase 2 abgeschlossen
- Phase 5 (Polish) → alle Screens aus 3+4 müssen existieren
- Phase 6 → alle vorherigen Phasen abgeschlossen
