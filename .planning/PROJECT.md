# SIAG Incident Management Assistent

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

## Out of Scope (MVP)
- Backend / Datenbankanbindung
- Authentifizierung / SSO
- Mandantenfähigkeit
- Weitere Incident-Typen (nur Ransomware MVP)
- Vollständiges Berechtigungssystem
