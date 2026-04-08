# Produktionsabnahme — SIAG Incident Assistant v1.1

> **VORLAGE — Bitte nach der UAT-Sitzung ausfüllen**
>
> Die UAT-Checkliste findet sich unter `docs/uat/UAT_CHECKLISTE.md`.

---

**Datum:** [Datum der UAT-Durchführung — z.B. 2026-04-15]  
**Berater:** [Vollständiger Name], [Funktion], [Organisation]  
**Version:** v1.1.0  
**Produktions-URL:** https://siag-incident-assistant.vercel.app  

---

## UAT-Zusammenfassung

| Testbereich | Ergebnis | Bemerkungen |
|-------------|----------|-------------|
| Ransomware-Incident (Ende-zu-Ende) | [ ] Bestanden / [ ] Nicht bestanden | |
| Phishing-Incident (Ende-zu-Ende) | [ ] Bestanden / [ ] Nicht bestanden | |
| DDoS-Incident (Ende-zu-Ende) | [ ] Bestanden / [ ] Nicht bestanden | |
| Datenverlust-Incident (Ende-zu-Ende) | [ ] Bestanden / [ ] Nicht bestanden | |
| PDF-Export-Qualität | [ ] Bestanden / [ ] Nicht bestanden | |
| FINMA/ISG/DSG-Compliance-Logik | [ ] Bestanden / [ ] Nicht bestanden | |
| Incident-Liste und Fortsetzen | [ ] Bestanden / [ ] Nicht bestanden | |
| Mobil-Bedienbarkeit (375px) | [ ] Bestanden / [ ] Nicht bestanden | |
| Tastatur-Barrierefreiheit | [ ] Bestanden / [ ] Nicht bestanden | |
| Farbkontrast (WCAG AA) | [ ] Bestanden / [ ] Nicht bestanden | |
| Dark Mode | [ ] Bestanden / [ ] Nicht bestanden | |

---

## Während des UAT gefundene Probleme

_Alle gefundenen Probleme auflisten. Kritische Probleme müssen vor der Abnahme behoben sein._

| # | Beschreibung | Schweregrad | Behebung |
|---|-------------|-------------|----------|
| — | Keine | — | — |

---

## Auflagen (falls vorhanden)

_Bei Abnahme mit Auflagen: vereinbarte Nachbesserungen und Zieldaten auflisten._

- [ ] [Auflage 1 — z.B. "Kleinere Formulierungskorrektur in Phishing-Playbook Schritt 12 bis v1.1.1"]

---

## Abnahme-Erklärung

> «Ich habe den User Acceptance Test des SIAG Incident Assistants v1.1 gemäss der Checkliste
> `docs/uat/UAT_CHECKLISTE.md` vollständig durchgeführt. Alle vier Incident-Typen
> (Ransomware, Phishing, DDoS, Datenverlust) wurden Ende-zu-Ende getestet. PDF-Export-Qualität,
> Compliance-Fristenlogik, Mobil-Bedienbarkeit und Barrierefreiheit wurden überprüft.
> Ich bestätige, dass diese Version die Abnahmekriterien erfüllt, und empfehle den
> Produktivbetrieb.»

**Name des Beraters:** [Vollständiger Name]  
**Funktion:** [Berufsbezeichnung]  
**Organisation:** [Unternehmen / SIAG]  
**Datum:** [Datum]  
**E-Mail:** [E-Mail-Adresse für die Ablage]  

---

## Nächste Schritte nach der Abnahme

1. Entwicklungsteam erstellt Git-Tag: `v1.1.0`
2. `CHANGELOG.md` wird mit Veröffentlichungsdatum aktualisiert
3. Stakeholder erhalten Benachrichtigungs-E-Mail mit Release-Zusammenfassung
4. UAT-Testincidents werden in der Produktionsdatenbank soft-gelöscht
5. Dieses Dokument wird als Nachweis ins Projekt-Repository eingecheckt

---

_SIAG Incident Assistant — Abnahme-Vorlage_  
_Dokumentversion: 1.0 — Erstellt 2026-04-08_
