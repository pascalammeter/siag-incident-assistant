# SIAG Incident Management Assistent

## What This Is

A guided incident response wizard for security teams in crisis. Incident-focused: Ransomware, Phishing, DDoS, Data Loss. Deployed to Vercel as interactive Next.js web app.

## Core Value

Removes decision paralysis during active incidents through structured, step-by-step guidance — from first recognition to handoff to SIAG consultant. Standardizes response vs. ad-hoc reactions. Ensures compliance with Swiss incident notification requirements (ISG, DSG, FINMA).

## Requirements

- Wizard UI: 7-screen interactive flow for incident classification and response
- Playbooks: 25-point checklists per incident type (detection → containment → investigation → communication)
- Compliance: Auto-calculate notification deadlines (ISG 24h, DSG, FINMA 24/72h)
- Storage: Persistent backend (Express + PostgreSQL) with API
- Design: SIAG branding (Navy #003B5E, Red #CC0033, Orange #D44E17), responsive, mobile-first
- Deployment: Vercel production with CI/CD
- Testing: 80%+ coverage, UAT sign-off from SIAG consultant

## What We're Building
Ein interaktiver, geführter Incident-Response-Assistent als Next.js-Webapplikation. Startpunkt ist ein klickbarer Prototyp auf Vercel für Review durch SIAG-Berater und Stakeholder. Die Architektur ist von Beginn an auf spätere Integration in die SIAG-Kundenplattform ausgelegt.

## Why It Exists
SIAG-Kunden (CISO, IT-Leiter, Security Officers) sind in einer Sicherheitskrise überfordert. Sie brauchen Führung, keine Flexibilität. Der Assistent führt Schritt für Schritt durch einen Incident — von der Ersterkennung bis zur strukturierten Übergabe an SIAG-Berater. Er ersetzt ad-hoc-Reaktionen durch ein standardisiertes Vorgehen.

## Target Users
- **Primär:** CISO / IT-Verantwortliche in Akutsituation (Persona: Bettina)
- **Review-Phase:** SIAG-Berater (Thomas, Oliver, Tizian) via Vercel-Link
- **Später:** Kunden der SIAG-Kundenplattform (mandantengetrennt, mit SSO)

## Core User Journey
1. Startscreen → „Shit Happens Button"
2. Vorfall erfassen (Wann, Wer, betroffene Systeme)
3. Klassifikation & Schweregrad (Incident-Typ, Impact, Eskalationslogik)
4. Geführte Reaktionsschritte (Playbooks, Checklisten, No-Go-Hinweise)
5. Kommunikation & Eskalation (Krisenstab, SIAG, extern)
6. Dokumentation & Abschluss (Incident-Report, Übergabe SIAG-Berater)

## Technical Decisions
- **Framework:** Next.js 15 (App Router) — gleicher Stack wie RGA
- **Deployment:** Vercel (static export für MVP, dann SSR/API für Phase 2+)
- **Styling:** Tailwind CSS — SIAG-Farben: Dunkelblau #1a2e4a, Weiss, Hellgrau
- **Language:** TypeScript
- **State:** React useState/useReducer (kein Backend für MVP)
- **Data:** Hardcoded Playbooks für Ransomware (MVP), erweiterbar

## Existing Assets
- `workshop/Gruppe Incident Management/Phase 4 - Prototyp/siag-incident-assistant_1-3.html` — 3 HTML-Prototyp-Iterationen
- `workshop/Gruppe Incident Management/Phase 4 - Prototyp/Prompt_Beispiel_siag-incident-assistant_4.docx` — vollständiger Anforderungs-Prompt
- `spezifikation_kundenplattform/usecase_incident_management/USECASE-IM-V0.1.md` — UseCase-Skeleton
- `workshop/Gruppe Incident Management/Phase 5 - Test und Reflexion/Feedback_Workshop.docx` — Feedback Phase 5

## Key Constraints
- Stress-taugliche Sprache: kurz, klar, handlungsorientiert, Deutsch
- Kein Fachjargon ohne Erklärung
- Fortschrittsanzeige (Schritt X von 6) immer sichtbar
- No-Go-Hinweise sichtbar integriert
- Mobil + Desktop (responsive)
- SIAG-Branding: #1a2e4a, kein alarmierendes Rot als Hauptfarbe

## Success Criteria (MVP)
- Vollständig klickbarer 6-Schritt-Ablauf für Ransomware-Incident
- Vercel-URL teilbar mit SIAG-Beratern für Review
- SIAG-Branding korrekt
- Expliziter Übergabepunkt „An SIAG-Berater übergeben"
- Komponentenstruktur bereit für Kundenplattform-Integration (Phase 2)

## Current State (v1.0)

**Shipped:** 2026-04-06 — SIAG Incident Assistant MVP v1.0

Complete 7-screen ransomware incident response wizard deployed to production on Vercel. All functional and non-functional requirements validated and shipped:

- ✅ Full 7-screen workflow (Interstitial → Einstieg → Erfassen → Klassifikation → Reaktion → Meldepflicht → Summary)
- ✅ 25-point Playbook with 4 phases (Sofortmassnahmen, Eindämmung, Untersuchung, Kommunikation)
- ✅ Schweizer Meldepflicht compliance (ISG 24h, DSG, FINMA 24/72h with auto-calculation)
- ✅ SIAG branding (SVG logo, Inter font, #1a2e4a Navy palette)
- ✅ Mobile-responsive (375px–2560px viewports)
- ✅ Print-to-PDF export of incident summary
- ✅ localStorage persistence (values auto-save on change)
- ✅ 74/74 tests passing, production build verified
- ✅ Public Vercel URL: https://siag-incident-assistant.vercel.app

**Known Issues (Non-blocking):**
- Turbopack workspace root detection warning (environmental, build succeeds)
- GitHub webhook integration issue (documented, CLI deploy workaround provided)

**Architecture Ready for:**
- Customer platform integration (component structure prepared)
- Additional incident types (playbook-data.ts architecture supports extensibility)
- Backend integration (state structure exportable for API Phase 2)

## Next Milestone (v1.1+)

**Planned Enhancements:**
- [ ] Backend integration (database + API layer)
- [ ] User authentication (OAuth / SSO)
- [ ] Multi-tenant support
- [ ] Additional incident types (Phishing, DDoS, etc.)
- [ ] Real PDF generation (vs. print-to-PDF)
- [ ] Multilingual support (German, French, Italian)

## Out of Scope (MVP)
- Backend / Datenbankanbindung
- Authentifizierung / SSO
- Mandantenfähigkeit
- Weitere Incident-Typen (nur Ransomware MVP)
- Vollständiges Berechtigungssystem
