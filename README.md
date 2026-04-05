# SIAG Incident Management Assistent — Berater-Review

## Live-URL

**https://siag-incident-assistant.vercel.app**

---

## Was ist das?

Ein klickbarer 7-Screen Prototyp für einen Incident-Response-Wizard, der SIAG-Berater durch einen Ransomware-Vorfall führt. Der Wizard deckt den vollständigen Ablauf ab: von der Ersterfassung über die Klassifikation und das Reaktions-Playbook bis zur Dokumentation und Übergabe.

Erstellt im Rahmen des HDT-Workshops «Gruppe Incident Management», Phase 4 Prototyp.

---

## Workshop-Kontext

- **Projekt:** Kundenplattform-Prototyp für SIAG-Incident-Response-Services
- **Ziel:** Validierung des Wizard-Flows und der inhaltlichen Vollständigkeit vor Integration in die Kundenplattform
- **Scope:** Frontend-Prototyp (kein Backend, alle Daten bleiben im Browser)

---

## Durchlauf (ca. 5–8 Minuten)

Empfehlung: Einen **Kritisch-Szenario** durchspielen (alle 3 Klassifikationsfragen mit «Ja» beantworten).

1. **Screen 0 — No-Go-Regeln:** Checkbox bestätigen, «Weiter» klicken
2. **Screen 1 — Einstieg:** «Shit Happens» Button klicken, «Weiter» klicken
3. **Screen 2 — Vorfall erfassen:** «Jetzt» Button klicken (setzt Zeitstempel), Systeme auswählen, «Ransomware» ankreuzen
4. **Screen 3 — Klassifikation:** Alle 3 Fragen mit «Ja» beantworten → Schweregrad «Kritisch» erscheint automatisch
5. **Screen 4 — Reaktionsschritte:** 2–3 Massnahmen abhaken, Fortschritts-Zähler beobachten
6. **Screen 5 — Meldepflichten:** Fragen beantworten → ISG/DSG/FINMA-Fristen erscheinen; Kommunikationsbausteine öffnen
7. **Screen 6 — Zusammenfassung:** Alle Eingaben konsolidiert sichtbar; «Bericht exportieren (PDF)» testen; «An SIAG-Berater übergeben»-Button sehen

---

## Feedback-Fragen

1. **Vollständigkeit des Flows:** Fehlt ein inhaltlicher Schritt im Wizard-Ablauf, der für einen echten Incident relevant wäre?
2. **Meldepflichten:** Sind die dargestellten Fristen und Behörden (ISG 24h, DSG, FINMA 24h/72h) korrekt und vollständig für den CH-Kontext?
3. **Kommunikationsbausteine:** Sind die Textvorlagen für GL, Mitarbeitende und Medien praxistauglich? Was würde ein Berater sofort ändern?
4. **Kundenpräsentation:** Was würde diesen Prototyp heute für eine Kundenpräsentation blockieren?
5. **Freies Feedback:** Was fällt noch auf — inhaltlich, sprachlich oder konzeptionell?

---

## Technischer Stand

| Eigenschaft | Wert |
|------------|------|
| Framework | Next.js 16, TypeScript, Tailwind v4 |
| Datenspeicherung | localStorage (Browser only — kein Backend, keine Datenübertragung) |
| Tests | 74/74 grün (Vitest) |
| Deployment | Vercel Static Export (CDN, kein Server) |
| Mobile | Getestet auf 375px Viewport |

---

## Bekannte Einschränkungen (Out of Scope für diesen Prototyp)

- Kein echtes Backend / keine Datenpersistenz über Browser hinaus
- PDF-Export via Browser-Druckdialog (kein dediziertes PDF-Library)
- Logo ist ein Placeholder (SVG-Vorlage, kein finales SIAG-Logo)
- Kein Authentication / Multi-User

---

_Fragen oder Feedback direkt an pascalammeter (GitHub: pascalammeter/siag-incident-assistant)_
