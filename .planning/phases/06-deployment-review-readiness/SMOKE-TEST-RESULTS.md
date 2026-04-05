# Smoke Test Results — SIAG Incident Assistant

**URL:** https://siag-incident-assistant.vercel.app
**Date:** (fill in)
**Tester:** (fill in)
**Browser:** (fill in — e.g. Chrome 124, Firefox 126)

## Pre-conditions
- [ ] Fresh browser tab (oder Inkognito-Fenster)
- [ ] Browser DevTools Console-Tab offen

---

## Screen 0: No-Go Interstitial

- [ ] Seite lädt auf der Produktions-URL
- [ ] 8 No-Go-Regeln sichtbar
- [ ] Checkbox + "Weiter"-Button sichtbar; Button deaktiviert bis Checkbox angehakt
- [ ] Checkbox anhaken aktiviert den Button
- [ ] Keine Console-Fehler

---

## Screen 1: Einstieg

- [ ] "Shit Happens"-Button sichtbar und prominent (Navy-Hintergrund, gross)
- [ ] Kurzbeschreibung-Text sichtbar
- [ ] "Weiter"-Button navigiert zu Screen 2
- [ ] Fortschrittsanzeige zeigt "Schritt 1 von 6"

---

## Screen 2: Vorfall erfassen

- [ ] "Jetzt"-Button befüllt Erkennungszeitpunkt mit aktuellem Zeitstempel
- [ ] Manuelle Datumseingabe funktioniert
- [ ] Erkannt-durch-Dropdown zeigt alle Optionen
- [ ] Betroffene Systeme Multi-Select funktioniert (mehrere Einträge anwählbar)
- [ ] Erste Auffälligkeiten Textarea nimmt Text an
- [ ] Lösegeld-Checkbox funktioniert
- [ ] Formular validiert Pflichtfelder beim Submit-Versuch (zeigt Fehler wenn leer)

### RELOAD TEST (kritisch — vor Screen 3 durchführen)
1. Alle Screen-2-Felder mit Testdaten befüllen
2. Seite neu laden (F5 oder Cmd+R)
3. [ ] Alle Screen-2-Eingaben werden aus localStorage wiederhergestellt (nicht leer)
4. [ ] DevTools → Application → Local Storage → https://siag-incident-assistant.vercel.app → Key `siag-incident-wizard` vorhanden

---

## Screen 3: Klassifikation

- [ ] 3 Ja/Nein-Fragen rendern als Pill-Buttons
- [ ] Schweregrad wird automatisch berechnet und angezeigt (Kritisch / Hoch / Mittel)
- [ ] Alle 3 "Ja" beantworten zeigt "Kritisch" mit Eskalations-Alert
- [ ] Incident-Typ-Auswahl funktioniert (Ransomware als Standard vorausgewählt)

---

## Screen 4: Reaktionsschritte

- [ ] Playbook lädt (25 Einträge in 4 Phasen-Gruppen sichtbar)
- [ ] Checkboxen sind interaktiv (an- und abhakbar)
- [ ] Fortschrittszähler aktualisiert sich beim Abhaken
- [ ] No-Go Amber-Warnboxen in der Liste sichtbar
- [ ] Rollen-Badges auf den Einträgen sichtbar

---

## Screen 5: Kommunikation & Meldepflichten

- [ ] 3 Meldepflicht-Fragen rendern (Ja/Nein)
- [ ] Fristen erscheinen basierend auf Antworten (ISG 24h / DSG / FINMA 24h/72h)
- [ ] Kommunikations-Checkliste funktioniert
- [ ] Kommunikationsbausteine-Tabs (GL / Mitarbeitende / Medien) laden mit Wizard-Daten
- [ ] Kopieren-Button funktioniert (Vercel ist HTTPS — Clipboard API verfügbar)
- [ ] "SIAG-Berater einbeziehen"-CTA sichtbar mit Kontaktdaten

---

## Screen 6: Dokumentation & Zusammenfassung

- [ ] Alle 6 Summary-Cards zeigen Daten aus vorherigen Screens
- [ ] Erkennungszeitpunkt zeigt den Wert aus Screen 2
- [ ] Betroffene Systeme als Tags dargestellt
- [ ] Klassifikation + Schweregrad korrekt (übereinstimmend mit Screen 3)
- [ ] Massnahmen-Fortschrittsbalken zeigt korrekten Prozentsatz
- [ ] Meldepflichten-Summary korrekt
- [ ] Kommunikation-Summary sichtbar
- [ ] "Bericht exportieren (PDF)"-Button sichtbar und klickbar
- [ ] Druckdialog öffnet sich beim Klick
- [ ] Druckvorschau zeigt strukturierten Bericht (Header/Footer ausgeblendet; .print-only Header sichtbar)
- [ ] "An SIAG-Berater übergeben"-CTA sichtbar mit Telefonnummer und E-Mail

---

## Post-run Checks

- [ ] Browser-Console: 0 Fehler (Warnungen akzeptabel, Fehler nicht)
- [ ] DevTools → Application → Local Storage → Key `siag-incident-wizard` bleibt nach vollem Durchlauf erhalten
- [ ] Viewport-Test: DevTools → 375px Breite → alle Screens durchnavigieren → kein horizontales Scrollen

---

## Result Summary

| Screen | Status | Notizen |
|--------|--------|---------|
| Screen 0 — No-Go Interstitial | ⬜ | |
| Screen 1 — Einstieg | ⬜ | |
| Screen 2 — Vorfall erfassen | ⬜ | |
| Screen 2 — Reload Test | ⬜ | |
| Screen 3 — Klassifikation | ⬜ | |
| Screen 4 — Reaktionsschritte | ⬜ | |
| Screen 5 — Kommunikation | ⬜ | |
| Screen 6 — Dokumentation | ⬜ | |
| Console — 0 Fehler | ⬜ | |
| localStorage Persistenz | ⬜ | |
| 375px Viewport | ⬜ | |

**Gesamtergebnis:** PASS / FAIL

**Gefundene Issues:**
(hier Fehler oder unerwartetes Verhalten eintragen)
