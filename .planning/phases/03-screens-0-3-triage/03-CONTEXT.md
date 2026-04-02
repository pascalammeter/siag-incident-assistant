# Phase 3: Screens 0–3 (Triage) — Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Placeholder-Komponenten für Screens 0–3 (StepInterstitial, Step1Einstieg, Step2Erfassen, Step3Klassifikation) durch vollständig implementierte, spec-konforme Screens ersetzen. Wizard-Typen und Zod-Schemas mit echten Feldern befüllen. Severity-Berechnung als testbare Funktion implementieren.

Scope: Nur die 4 Triage-Screens. Kein Content für Screens 4–6 (Phase 4/5).

</domain>

<decisions>
## Implementation Decisions

### Schweregrad-Logik (Screen 3)
- **D-01:** Q3 "Unbekannt" löst **KRITISCH** aus — worst-case assumption, Security-Best-Practice.
  Logik:
  ```
  if Q1 === "ja" || Q3 === "ja" || Q3 === "unbekannt" → KRITISCH
  else if Q2 === "ja" → HOCH
  else → MITTEL
  ```
- **D-02:** Die Severity wird **gespeichert** in `KlassifikationData`, nicht live berechnet. Phase 4/5/6 lesen direkt aus State.

### State-Schema (KlassifikationData)
- **D-03:** Exaktes Interface:
  ```typescript
  interface KlassifikationData {
    q1SystemeBetroffen: 'ja' | 'nein'
    q2PdBetroffen: 'ja' | 'nein'
    q3AngreiferAktiv: 'ja' | 'nein' | 'unbekannt'
    incidentType: 'ransomware' | 'phishing' | 'ddos' | 'datenverlust' | 'unbefugter-zugriff' | 'sonstiges'
    severity: 'KRITISCH' | 'HOCH' | 'MITTEL'
  }
  ```
- **D-04:** Severity wird beim UPDATE_STEP für 'klassifikation' berechnet und direkt in `severity` gespeichert. Eine reine `calculateSeverity(q1, q2, q3)` Funktion kapselt die Logik (exportiert, testbar).

### Screen 1 Navigation (Einstieg — keine Formularfelder)
- **D-05:** `Step1Einstieg` verwendet **keinen StepForm-Wrapper**. Hero-Button und "Vorfall erfassen"-Link dispatchen `NEXT_STEP` direkt via `useWizard()`. Kein leeres `<form>`-Tag.
- **D-06:** `StepNavigator` zeigt auf Screen 1 nur "Zurück" (zum Interstitial). "Weiter" kommt über den Hero-Button.

### Test-Abdeckung
- **D-07:** Logik-Tests für Phase 3:
  - `calculateSeverity()` — alle Kombinationen inkl. Q3 "Unbekannt" → KRITISCH
  - Zod-Schemas für `erfassen` und `klassifikation` — Pflichtfelder, Enum-Werte
  - Kein Component-Rendering-Testing

### Claude's Discretion
- Wie StepNavigator für Screen 1 die "Weiter"-Taste ausblenden soll (prop `showNext={false}` oder Bedingung in WizardShell) — Claude entscheidet die sauberste Lösung.
- `ErfassenData` Interface-Struktur (Feldnamen für Datetime, Systeme, etc.) — aus REQUIREMENTS.md F4 ableiten.
- `datetime-local` Input-Handling (string in State, ISO-Format) — Claude's Discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements (Screens 0–3)
- `.planning/REQUIREMENTS.md` §F2 — No-Go Interstitial (8 Regeln, Bestätigung)
- `.planning/REQUIREMENTS.md` §F3 — Screen 1: Einstieg (Shit-Happens-Button)
- `.planning/REQUIREMENTS.md` §F4 — Screen 2: Vorfall erfassen (Formularfelder, Auto-Timestamp)
- `.planning/REQUIREMENTS.md` §F5 — Screen 3: Klassifikation (3-Fragen-Baum, Schweregrad)
- `.planning/REQUIREMENTS.md` §NF1 — UX: Stress-Tauglichkeit (grosse Touch-Targets, Submit-Validierung)
- `.planning/REQUIREMENTS.md` §NF2 — Design/Branding (SIAG-Farben, kein dominantes Rot)
- `.planning/REQUIREMENTS.md` §NF3 — Technisch (Tailwind v4, react-hook-form + Zod, useReducer)

### UI-Spec (exakte Styles, Copy, Komponenten-Inventar)
- `.planning/phases/03-screens-0-3-triage/03-UI-SPEC.md` — Vollständiger Design-Contract für Screens 0–3. Enthält: exakte Tailwind-Klassen, Copywriting-Contract, Component Inventories, Responsive Breakpoints, Interaction States.

### Existierender Code (Basis für Phase 3)
- `src/components/wizard/steps/StepInterstitial.tsx` — Placeholder, muss mit 8 Regeln + UI-SPEC befüllt werden
- `src/components/wizard/steps/Step1Einstieg.tsx` — Placeholder, muss StepForm entfernen (D-05)
- `src/components/wizard/steps/Step2Erfassen.tsx` — Placeholder, muss Formularfelder bekommen
- `src/components/wizard/steps/Step3Klassifikation.tsx` — Placeholder, muss 3-Fragen-Baum bekommen
- `src/lib/wizard-types.ts` — Leere Interfaces, müssen mit ErfassenData + KlassifikationData befüllt werden
- `src/lib/wizard-schemas.ts` — Leere Schemas, müssen für erfassen + klassifikation befüllt werden
- `src/components/wizard/WizardContext.tsx` — Reducer + Context (fertig, nur UPDATE_STEP nutzen)
- `src/components/wizard/WizardShell.tsx` — Shell (fertig, nur StepNavigator-Visibility für Screen 1 anpassen)
- `src/components/wizard/StepForm.tsx` — Wrapper (für Screens 2+3 verwenden, nicht für Screen 1)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useWizard()` Hook — dispatch + state, in allen Step-Komponenten nutzbar (D-05 nutzt dispatch direkt)
- `StepForm` — Wrapper mit RHF + Zod + onSubmit-Navigation. Für Screen 2 + 3 verwenden.
- `StepNavigator` — Vor/Zurück-Buttons. Erhält `showPrev` und `nextLabel` Props. Braucht ggf. `showNext` für Screen 1.
- `WizardProgress` — Schritt-Anzeige. Läuft bereits korrekt.
- Tailwind v4 Tokens: `bg-navy`, `text-navy`, `bg-lightgray`, `bg-amber`, `border-amber` — alle in globals.css @theme definiert.

### Established Patterns
- `'use client'` Direktive auf allen Wizard-Komponenten
- `dispatch({ type: 'UPDATE_STEP', stepKey: '...', data: formData })` + `dispatch({ type: 'NEXT_STEP' })` beim Form-Submit
- `min-h-[44px]` auf allen Buttons (Touch-Target, NF1.4)
- `accent-navy` auf Checkboxen/Radios
- `border-l-4 border-amber bg-amber/10 rounded-r-lg p-4` für Warning-Cards (bereits in StepInterstitial-Placeholder)
- Validierung mit Zod in `wizard-schemas.ts`, Schema per StepKey in `stepSchemas` registrieren

### Integration Points
- `wizard-types.ts` — `EinstiegData`, `ErfassenData`, `KlassifikationData` Interfaces befüllen + `IncidentType` Union-Type hinzufügen
- `wizard-schemas.ts` — `erfassenSchema`, `klassifikationSchema` mit echten Feldern + `calculateSeverity()` pure function exportieren
- `WizardShell.tsx` — `StepNavigator` für Step 1 ohne "Weiter"-Button (D-06)

</code_context>

<specifics>
## Specific Ideas

- **8 No-Go-Regeln** sind in `03-UI-SPEC.md` Component Inventory Screen 0 vollständig mit exaktem deutschem Text definiert — direkt verwenden.
- **Copywriting** vollständig im UI-SPEC Copywriting-Contract — keine Abweichungen.
- **Severity-Badge-Colors:** amber = KRITISCH, navy = HOCH, gray-500 = MITTEL (aus UI-SPEC).
- **Q3 "Unbekannt"** löst KRITISCH aus UND zeigt einen zusätzlichen Hinweis: "Unbekannt wird als aktiv behandelt — erhöhte Wachsamkeit." (aus UI-SPEC).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-screens-0-3-triage*
*Context gathered: 2026-04-02*
