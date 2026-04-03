# Phase 4: Screens 4–5 (Response & Communication) — Context

**Erstellt:** 2026-04-03
**Status:** Bereit für Planning

<domain>
## Phase Boundary

Placeholder-Komponenten für Step4Reaktion und Step5Kommunikation durch vollständig implementierte, spec-konforme Screens ersetzen:

- **Screen 4:** 25-Punkte Ransomware-Playbook-Checkliste in 4 Phasen, abhakbar, Fortschrittszähler, No-Go-Inlines, Rollen-Badges
- **Screen 5:** 3-Ja/Nein Meldepflicht-Check (ISG/DSG/FINMA) mit Fristanzeige, Kommunikations-Checkliste, Kommunikationsbausteine (editierbare Textvorlagen, kopierbar), SIAG-CTA

Scope: Nur Screens 4 und 5. Kein Content für Screen 6 (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Screen 4 — Checklist State

- **D-01:** Checklist-Fortschritt wird in **`ReaktionData` im WizardState** gespeichert.
  Exaktes Interface:
  ```typescript
  interface ReaktionData {
    completedSteps: string[]  // Array von Step-IDs der abgehakten Schritte
  }
  ```
  Persistiert via localStorage (automatisch durch bestehende Wizard-Infrastruktur). Screen 6 kann `completedSteps.length` / `totalSteps` für den Report verwenden.

- **D-02:** Playbook-Daten (die 25 Schritte, 4 Phasen, Rollen, No-Go-Flags) als **TypeScript-Konstanten** in separater Datei (`src/lib/playbook-data.ts`). Struktur erweiterbar für weitere Incident-Typen (NF5.2).

### Screen 4 — Navigation Gate

- **D-03:** Der „Weiter"-Button auf Screen 4 ist **disabled** bis alle 25 Schritte abgehakt sind.
  - Button ist graued out (disabled-State via Tailwind) — kein separater Fehler-Toast nötig
  - Fortschrittszähler „X von 25 erledigt" kommuniziert was noch fehlt
  - Begründung: Strikte Vollständigkeit — die Checkliste ist ein Pflicht-Protokoll, kein optionaler Leitfaden

- **D-04:** Zurück-Navigation (zu Screen 3) ist jederzeit möglich — kein Gate für Rückwärts-Navigation.

### Screen 5 — Meldepflicht Countdown

- **D-05:** Countdown-Basis = **`erkennungszeitpunkt`** aus `ErfassenData` (Screen 2).
  Rechtlich korrekt: die Meldefrist läuft ab Kenntnis des Vorfalls.
  - ISG (krit. Infrastruktur): `erkennungszeitpunkt` + 24h
  - DSG/DSGVO (PD betroffen): `erkennungszeitpunkt` (Frist: "so schnell wie möglich")
  - FINMA (reguliertes Unternehmen): `erkennungszeitpunkt` + 24h (informell) / + 72h (vollständig)

- **D-06:** Anzeige als **statische Deadline**, kein Live-Ticking.
  Format: „Frist bis: Freitag, 04. Apr 2026 14:32 Uhr"
  Begründung: Klar, kein zusätzlicher Stressfaktor durch laufende Uhr.

- **D-07:** Die 3 Meldepflicht-Fragen (ISG / DSG / FINMA) bestimmen, welche Fristen angezeigt werden. Fragen werden im `KommunikationData`-Interface gespeichert.

### Screen 5 — Kommunikationsbausteine

- **D-08:** Textvorlagen für GL/VR, Mitarbeitende und Medien/Öffentlichkeit als **editierbare Textareas** mit vorausgefülltem Text.
  - Bekannte Daten aus Wizard-State werden dynamisch eingefügt: `erkennungszeitpunkt`, `severity` (KRITISCH/HOCH/MITTEL), `incidentType`, `betroffene_systeme`
  - Nicht bekannte Kundendaten bleiben als explizite Platzhalter: `[Firmenname]`, `[Name des Ansprechpartners]`, `[Ihre E-Mail]` etc.
  - Nutzer kann Text in der Textarea anpassen, bevor er kopiert
  - „Kopieren"-Button (Clipboard API) pro Vorlage

- **D-09:** **SIAG-CTA** „SIAG-Berater jetzt einbeziehen" zeigt statische Kontaktinfo (Telefonnummer + E-Mail als Placeholder für Review-Phase). Kein mailto-Link (Geräte in Akutsituation haben oft keinen konfigurierten E-Mail-Client).

### Claude's Discretion

- Exakte Struktur der `KommunikationData` Interface-Felder (Meldepflicht-Fragen + Vorlage-State)
- Ob die editierten Vorlage-Texte in `KommunikationData` persistiert werden oder nur local state
- Visuelle Gestaltung der Rollen-Badges auf Screen 4 (Farbe/Pill-Style) — konsistent mit bestehendem Design-System
- Exakte Tailwind-Klassen für disabled Button-State auf Screen 4
- Reihenfolge und Gruppierung der Kommunikationsbausteine auf Screen 5

</decisions>

<canonical_refs>
## Canonical References

**Downstream-Agents MÜSSEN diese Files lesen, bevor sie planen oder implementieren.**

### Requirements (Screens 4–5)
- `.planning/REQUIREMENTS.md` §F6 — Screen 4: Reaktionsschritte (25-Punkte Checkliste, 4 Phasen, Checkboxen, No-Go-Hinweise, Rollen, Fortschrittszähler)
- `.planning/REQUIREMENTS.md` §F7 — Screen 5: Kommunikation & Eskalation (3-Fragen Meldepflicht, Fristen, Kommunikationsbausteine, SIAG-CTA)
- `.planning/REQUIREMENTS.md` §NF1 — UX: Stress-Tauglichkeit
- `.planning/REQUIREMENTS.md` §NF2 — Design/Branding
- `.planning/REQUIREMENTS.md` §NF3 — Technisch (Tailwind v4, RHF + Zod, useReducer)
- `.planning/REQUIREMENTS.md` §NF5 — Plattform-Kompatibilität (Playbook-Daten als separate TS-Konstanten)

### Existierender Code (Basis für Phase 4)
- `src/components/wizard/steps/Step4Reaktion.tsx` — Placeholder, wird mit Playbook-Checkliste befüllt
- `src/components/wizard/steps/Step5Kommunikation.tsx` — Placeholder, wird mit Meldepflicht + Kommunikationsbausteine befüllt
- `src/lib/wizard-types.ts` — `ReaktionData` und `KommunikationData` Interfaces (leer) befüllen
- `src/lib/wizard-schemas.ts` — Zod-Schemas für reaktion + kommunikation befüllen
- `src/components/wizard/WizardContext.tsx` — UPDATE_STEP nutzen für Checklist + Kommunikation State
- `src/components/wizard/StepForm.tsx` — Wrapper, ggf. für Screen 5 Meldepflicht-Fragen
- `src/lib/wizard-schemas.ts` — bestehende reaktionSchema + kommunikationSchema befüllen

### Prior Context (Phase 3 Patterns)
- `.planning/phases/03-screens-0-3-triage/03-CONTEXT.md` — D-02 (KlassifikationData.severity lesbar von nachfolgenden Screens), D-04 (UPDATE_STEP Pattern)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useWizard()` Hook — dispatch + state. `state.klassifikation.severity` und `state.erfassen.erkennungszeitpunkt` direkt lesbar für Screen 4/5
- `StepForm` — Wrapper mit RHF + Zod + onSubmit-Navigation. Für Meldepflicht-Fragen auf Screen 5 nutzbar
- `StepNavigator` — Vor/Zurück-Buttons. Prop `nextDisabled={completedCount < 25}` für Screen 4
- Tailwind-Tokens: `bg-navy`, `text-navy`, `bg-amber`, `border-amber` — für No-Go-Boxes und Severity-Badges
- `border-l-4 border-amber bg-amber/10 rounded-r-lg p-4` — Pattern für No-Go Amber-Boxen (aus Phase 3)
- `min-h-[44px]` auf allen Buttons (Touch-Target, NF1.4)
- `accent-navy` auf Checkboxen/Radios

### Integration Points
- `wizard-types.ts` — `ReaktionData` und `KommunikationData` Interfaces mit echten Feldern befüllen
- `wizard-schemas.ts` — `reaktionSchema`, `kommunikationSchema` mit echten Feldern + Meldepflicht-Fragen
- `StepNavigator` — braucht `nextDisabled` Prop für Screen 4 (oder äquivalente Lösung) falls nicht schon vorhanden
- Neues File: `src/lib/playbook-data.ts` — Ransomware-Playbook als TypeScript-Konstanten

</code_context>

<specifics>
## Specific Ideas

- **Erkennungszeitpunkt für Fristen:** `state.erfassen?.erkennungszeitpunkt` (ISO-String aus Screen 2). Deadline berechnen als `new Date(erkennungszeitpunkt).getTime() + 24 * 60 * 60 * 1000` für 24h-Fristen.
- **Vorlage-Platzhalter:** `[Firmenname]`, `[Name des Ansprechpartners]`, `[Ihre E-Mail]` — deutlich erkennbare Bracket-Notation damit der Nutzer weiss, was er ersetzen muss.
- **Dynamische Vorlage-Befüllung:** `erkennungszeitpunkt` formatiert als Datum, `severity` als "KRITISCH"/"HOCH"/"MITTEL", `incidentType` als "Ransomware", betroffene Systeme als Komma-Liste.
- **Zukunftsvision (nicht für MVP):** Wenn das Modul in die SIAG-Kundenplattform integriert wird, können KI und Kundendaten die Platzhalter automatisch befüllen. Platzhalterstuktur jetzt anlegen = späte Integration einfacher.
- **SIAG Kontaktinfo:** Placeholder für Review-Phase — z.B. „+41 XX XXX XX XX" und „incident@siag.ch" (echte Daten vor Go-Live ersetzen).

</specifics>

<deferred>
## Deferred Ideas

- **KI-gestützte Vorlage-Befüllung** (Zukunftsphase): Wenn Kundendaten via Plattform verfügbar sind, können Platzhalter automatisch durch KI abgefüllt werden. → Für Kundenplattform-Integration Phase 2+
- **Weitere Incident-Typen** (z.B. Phishing-Playbook, DDoS-Playbook): Playbook-Struktur (`src/lib/playbook-data.ts`) ist so designed, dass weitere Typen einfach ergänzbar sind → Für spätere Milestones

</deferred>

---

*Phase: 04-screens-4-5-response-communication*
*Context erstellt: 2026-04-03*
