# UAT-Vorbereitung — SIAG Incident Assistant v1.1

## Übersicht

Dieses Dokument enthält die Informationen für den User Acceptance Test (UAT) des
SIAG Incident Assistants v1.1. Es richtet sich an den SIAG-Berater, der den
offiziellen Abnahmetest vor dem Produktivbetrieb durchführt.

---

## Produktions-URL (Testziel)

**https://siag-incident-assistant.vercel.app**

Dies ist die live Produktionsumgebung. Der UAT wird direkt gegen die Produktionsumgebung
durchgeführt — eine separate Testumgebung ist nicht notwendig, da die Applikation keine
sensitiven Personendaten speichert und alle während des UAT erfassten Incidents
anschliessend gelöscht werden können.

---

## Was wird getestet

v1.1 ist eine wesentliche Erweiterung gegenüber v1.0 (Browser-only Prototyp). Die wichtigsten Neuerungen:

| Funktion | v1.0 | v1.1 |
|---------|------|------|
| Incident-Speicherung | Browser localStorage (geht bei Cache-Leerung verloren) | Persistente PostgreSQL-Datenbank (Neon) |
| Incident-Typen | Nur Ransomware | Ransomware, Phishing, DDoS, Datenverlust |
| Playbooks | 20-schrittiges Ransomware-Playbook | 25 Schritte pro Typ (4 Typen) |
| PDF-Export | Browser-Druckdialog | Professionell formatiertes PDF-Dokument |
| Incident-Liste | Nicht vorhanden | Sortierbare, filterbare Seite `/incidents` |
| Dark Mode | Systemeinstellung | Toggle in der Kopfzeile |
| Compliance-Fristen | ISG/DSG/FINMA automatisch berechnet | Gleich, plus FINMA 24/72h |
| Mobil | Responsiv | Getestet ab 375px Breite |
| Datenmigration | — | v1.0 localStorage-Daten werden beim ersten Aufruf automatisch migriert |

---

## Zugang

1. **https://siag-incident-assistant.vercel.app** in einem modernen Browser öffnen
2. Kein Login erforderlich — der Wizard ist ohne Authentifizierung zugänglich
3. Die Incident-Liste ist über den Link "Incidents" in der Navigation erreichbar
4. Alle während des UAT erfassten Daten werden in der Produktionsdatenbank gespeichert

**Empfohlene Browser:** Chrome 120+, Firefox 121+, Safari 17+ (macOS/iOS)

---

## UAT-Zeitplan

| Phase | Dauer | Inhalt |
|-------|-------|--------|
| Einführung | 15 Min | Dokument lesen, App öffnen, orientieren |
| Funktionstests | 90 Min | UAT_CHECKLISTE.md für alle 4 Incident-Typen durcharbeiten |
| Mobil-Test | 20 Min | Wichtigste Schritte auf Mobilgerät wiederholen |
| Barrierefreiheit | 15 Min | Tastaturnavigation, Screenreader, Kontrast |
| Abschluss / Abnahme | 30 Min | Befunde dokumentieren, schriftliche Abnahme ausstellen |
| **Total** | **ca. 2.5–3 Stunden** | |

---

## Was mitbringen

- Laptop mit Chrome oder Firefox
- Mobilgerät (iPhone oder Android) für den Mobil-Test
- Die UAT-Checkliste: [`docs/uat/UAT_CHECKLISTE.md`](./UAT_CHECKLISTE.md)
- Bildschirmaufnahme-Software (optional, zur Dokumentation von Problemen)

---

## Testdaten

- Alle während des UAT erfassten Incidents sind echte Einträge in der Produktionsdatenbank
- Sie können nach dem UAT soft-gelöscht werden (kein physisches Löschen nötig)
- Bitte keine echten Personendaten oder sensitive Informationen eingeben — fiktive Testdaten verwenden (z.B. "Test AG", fiktive IP-Adressen)
- Falls v1.0 localStorage-Daten im Browser vorhanden sind, werden diese beim ersten Aufruf automatisch migriert

---

## Bei kritischen Problemen

1. Betroffenen Testfall stoppen
2. Dokumentieren: welcher Schritt schlug fehl, was war erwartet, was ist passiert (Screenshots willkommen)
3. Übrige Testfälle weiter durchführen
4. Problem vor dem Abnahme-Gespräch dem Entwicklungsteam melden

Kleinere kosmetische Probleme (Ausrichtung, Formulierungen) können als Nachbesserungen nach dem Launch protokolliert werden und blockieren die Abnahme nicht, sofern die Kernfunktionalität nicht beeinträchtigt ist.

---

## Nach dem UAT

Nach der Abnahme:

- Entwicklungsteam erstellt Tag `v1.1.0` auf GitHub
- UAT-Testincidents werden in der Produktionsdatenbank soft-gelöscht
- Dieses Dokument wird in `docs/uat/` archiviert

---

## Kontakt

Projekt: pascalammeter/siag-incident-assistant (GitHub)

Bei technischen Problemen während des UAT das Entwicklungsteam direkt kontaktieren.
