# UAT-Checkliste — SIAG Incident Assistant v1.1

**Version:** v1.1.0  
**UAT-URL:** https://siag-incident-assistant.vercel.app  
**Tester:** [PAM]  
**Datum:** [09.04.26]  
**Status:** [ ] In Bearbeitung  [ ] Abgeschlossen  [x] Probleme gefunden

---

## Vorbereitung

- [x] https://siag-incident-assistant.vercel.app in einem neuen Browser-Tab öffnen (kein Inkognito-Modus)
- [x] Seite lädt ohne Fehler (Browser-Konsole auf rote Fehler prüfen)
- [x] "SIAG Incident Management Assistent" erscheint in der Kopfzeile
- [x] Dark-Mode-Schalter ist in der Kopfzeile sichtbar: Ist bereits ausgewählt. Besser wäre default Whitemode.
- [x] Navigation zur Seite `/incidents` funktioniert (leere Liste oder vorhandene Incidents), dann wieder Navigation zur Seite `/wizard`

---

## Incident-Typ 1: Ransomware

### 1.1 Wizard-Ablauf

- [x] **Schritt 0 (No-Go-Regeln):** Checkbox anklicken, "Weiter" klicken
- [x] **Schritt 1 (Einstieg):**
  - [x] Incident-Typ: **Ransomware** auswählen
  - [x] "Shit Happens"-Button sichtbar und klickbar, dann "Weiter"
- [x] **Schritt 2 (Vorfall erfassen):**
  - [x] "Jetzt" klicken, um Erkennungszeitpunkt zu setzen (Zeitstempel erscheint)
  - [x] Mindestens 2 betroffene Systeme auswählen
  - [x] "Erste Erkenntnisse" mit Testtext ausfüllen
  - [x] "Weiter" klicken
- [x] **Schritt 3 (Klassifikation):**
  - [x] Alle 3 Klassifikationsfragen mit "Ja" beantworten
  - [x] Schweregrad-Badge zeigt automatisch "Kritisch"
  - [x] "Weiter" klicken
- [x] **Schritt 4 (Reaktion / Playbook):**
  - [x] Ransomware-Playbook wird geladen (mindestens 20 Schritte sichtbar)
  - [x] 3–5 Schritte abhaken (Fortschrittsanzeige erhöht sich)
  - [x] Rollenbezeichnungen auf Schritten sichtbar (IT-Leiter, CISO, CEO, Forensik)
  - [x] "Weiter" klicken: Alle Schritte mussten ausgewählt werden, damit auf "weiter" geklickt werden konnte.
- [x] **Schritt 5 (Meldepflichten / Kommunikation):**
  - [x] Compliance-Fragen beantworten
  - [x] ISG-Frist erscheint: Erkennungszeitpunkt + 24 Stunden
  - [x] DSG-Frist erscheint
  - [x] Mindestens 1 Kommunikationsvorlage öffnen (Inhalt vorhanden)
  - [x] "Weiter" klicken
- [x] **Schritt 6 (Dokumentation / Zusammenfassung):**
  - [x] Alle eingegebenen Daten in der Zusammenfassung sichtbar
  - [x] Incident-Typ zeigt "Ransomware"
  - [x] Alle betroffenen Systeme aufgeführt
  - [x] Schaltfläche "Bericht exportieren (PDF)" sichtbar

### 1.2 PDF-Export

- [x] "Bericht exportieren (PDF)" in Schritt 6 anklicken
- [ ] PDF wird innerhalb von 30 Sekunden heruntergeladen oder in neuem Tab geöffnet: Nein, es erscheint ein Pop-Up, identisch zu CTRL+P für Drucken/Print.
- [ ] PDF enthält: Nein enthält nichts, ist kein Bericht sondern nur der Print des Schritt 6.
  - [ ] SIAG-Branding (Logo oder Kopfzeile): nein enthält kein Logo
  - [ ] Incident-Typ: Ransomware
  - [ ] Erkennungszeitpunkt
  - [ ] Liste der betroffenen Systeme
  - [ ] Playbook-Schritte und abgehakte Punkte
  - [ ] Compliance-Fristen (ISG 24h, DSG): Steht nur "Ja", nicht exakt wann.
  - [ ] Professionelle Formatierung (auf A4 druckbar): nein nicht professionell
- [ ] PDF druckbar ohne abgeschnittene Inhalte

### 1.3 Compliance-Fristen

- [x] ISG-Frist = Erkennungszeitpunkt + 24 Stunden (Berechnung prüfen)
- [ ] DSG-Frist ist vorhanden und korrekt beschriftet: Steht nur "Ja", nicht exakt wann.
- [ ] Fristen im Schweizer Zeitzonenformat angezeigt

### 1.4 Incident fortsetzen (Resume)

- [x] Neuen Ransomware-Incident starten, aber NICHT abschliessen — auf halber Strecke stoppen
- [x] Zur Seite `/incidents` navigieren
- [ ] Laufender Incident erscheint in der Liste: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Incident anklicken und fortsetzen: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Wizard lädt mit zuvor eingegebenen Daten wieder: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Incident abschliessen und einreichen: Nein, es kommt Failed to list incidents: API request failed: 401 

### 1.5 Incident bleibt nach Browser-Neustart erhalten

- [ ] Nach dem Einreichen eines Ransomware-Incidents Seite neu laden: Es fehlt ein "Einreichen"-Button. Schritt 5 hat button "Weiter", Schritt 6 hat keinen Button mehr. 
- [ ] Zur Seite `/incidents` navigieren: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Incident ist weiterhin sichtbar (in Datenbank gespeichert, nicht verloren): Nein, es kommt Failed to list incidents: API request failed: 401 

---

## Incident-Typ 2: Phishing

### 2.1 Wizard-Ablauf

- [ ] Neuen Incident starten, Typ: **Phishing** auswählen: Bisherige eingaben bleiben erhalten, musst anderen Browser nehmen. 
- [ ] Schritt 2: Phishing-spezifische Felder ausfüllen: Keine Phishing spezifischen Felder sichtbar
  - [ ] Absender-E-Mail oder Domain: nicht vorhanden
  - [ ] Betreffzeile oder Angriffsbeschreibung: nicht vorhanden
  - [ ] Anzahl betroffener Benutzer (falls vorhanden): nicht vorhanden
- [ ] Schritt 3: Klassifikation abschliessen
- [ ] **Schritt 4 (Phishing-Playbook):** Da die zuvor eingetragenen Informationen bestehen blieb, zeigte es mir bereits 25 von 25 erledigt an, obwohl nichts abgehakt wurde. Klickte ich mich durch waren dann z.b 34 von 25 erledigt. 
  - [ ] Phishing-spezifische Schritte geladen (Erkennung/Eindämmung/Kommunikation). Gesamtes Playbook in Englisch, statt Deutsch mit den 4 Phasen: Detection & Analysis, Containment & Response, Investigation & Analysis, Communication & Recovery.
  - [ ] Schritte umfassen: E-Mail-Blockierung, Benutzerbenachrichtigung, Passwort-Reset
  - [ ] Rollen: IT, CISO, HR, Legal (mindestens 1 Legal- oder HR-Schritt sichtbar): 1x HR, Legal kam nicht vor.
  - [ ] 3–5 Schritte abhaken
- [ ] Schritt 5: DSG-Meldepflicht erscheint (falls Personendaten betroffen)
- [ ] Schritt 6: Zusammenfassung zeigt Incident-Typ "Phishing"

### 2.2 PDF-Export Phishing

- [ ] PDF aus Schritt 6 exportieren
- [ ] PDF enthält Phishing-spezifische Inhalte (Absender, betroffene Benutzer, Indikatoren)

---

## Incident-Typ 3: DDoS

### 3.1 Wizard-Ablauf

- [x] Neuen Incident starten, Typ: **DDoS** auswählen
- [ ] Schritt 2: DDoS-spezifische Felder ausfüllen: Es erscheinen keine spezifischen DDoS Felder
  - [ ] Angriffseigenschaften (Quell-IPs, Angriffstyp)
  - [ ] Betroffene Dienste / Systeme
- [ ] Schritt 3: Klassifikation abschliessen
- [ ] **Schritt 4 (DDoS-Playbook):** Da die zuvor eingetragenen Informationen bestehen blieb, zeigte es mir bereits 25 von 25 erledigt an, obwohl nichts abgehakt wurde. Klickte ich mich durch waren dann z.b 34 von 25 erledigt.
  - [ ] DDoS-spezifische Schritte geladen
  - [ ] Schritte umfassen: ISP-Benachrichtigung, Mitigation, Traffic-Filterung
  - [ ] 3–5 Schritte abhaken
- [ ] Schritt 5: Relevante Compliance-Fristen erscheinen
- [ ] Schritt 6: Zusammenfassung zeigt Incident-Typ "DDoS"

### 3.2 PDF-Export DDoS

- [ ] PDF aus Schritt 6 exportieren
- [ ] PDF enthält Netzwerkangriffs-Details (Quell-IPs, Angriffstyp, Zeitverlauf)

---

## Incident-Typ 4: Datenverlust

### 4.1 Wizard-Ablauf

- [x] Neuen Incident starten, Typ: **Datenverlust** auswählen
- [ ] Schritt 2: Datenverlust-spezifische Felder ausfüllen: Es erscheinen keine spezifischen DDoS Felder
  - [ ] Datenklassifizierung (Personendaten? Finanzdaten? Gesundheitsdaten?)
  - [ ] Betroffene Systeme / Datenspeicher
  - [ ] Anzahl betroffener Personen (falls bekannt)
- [ ] Schritt 3: Klassifikation (Schweregrad) abschliessen
- [ ] **Schritt 4 (Datenverlust-Playbook):**
  - [ ] Datenverlust-spezifische Schritte geladen
  - [ ] Schritte umfassen: Datenklassifizierung, Eindämmung, regulatorische Meldung, Kundeninformation
  - [ ] Rollen: Legal, CISO vorhanden
  - [ ] 3–5 Schritte abhaken
- [ ] **Schritt 5 (Meldepflichten):**
  - [ ] FINMA-Frist erscheint (24 Stunden bei kritischen Finanzdaten-Verletzungen)
  - [ ] FINMA 72-Stunden-Frist bei geringerem Schweregrad (Logik korrekt?)
  - [ ] DSG-Meldepflicht erscheint (15 Tage)
  - [ ] ISG-Frist erscheint falls zutreffend
- [ ] Schritt 6: Zusammenfassung zeigt Incident-Typ "Datenverlust"

### 4.2 FINMA-Compliance-Prüfung

- [ ] Bei kritischem Datenverlust: FINMA-Frist = Erkennungszeitpunkt + 24 Stunden
- [ ] Bei geringerem Schweregrad: FINMA-Frist = Erkennungszeitpunkt + 72 Stunden
- [ ] DSG-Meldepflicht separat angezeigt (15 Tage)

### 4.3 PDF-Export Datenverlust

- [ ] PDF aus Schritt 6 exportieren
- [ ] PDF enthält Datenklassifizierung, Anzahl betroffener Personen, regulatorische Fristen

---

## Incident-Liste (/incidents)

- [x] Zur Seite `/incidents` navigieren
- [ ] Alle 4 Test-Incidents erscheinen in der Liste: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Filter nach Incident-Typ funktioniert (z.B. nur "Ransomware" anzeigen): Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Filter nach Schweregrad funktioniert: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Sortierung funktioniert (nach Datum, Typ oder Schweregrad): Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Klick auf einen Incident öffnet Detail-Ansicht oder setzt Wizard fort: Nein, es kommt Failed to list incidents: API request failed: 401 
- [ ] Löschen (soft-delete) funktioniert — Incident verschwindet nach Bestätigung aus der Liste: Nein, es kommt Failed to list incidents: API request failed: 401 

---

## Mobil-Test (nicht durchgeführt)

### Gerät: [Mobilgerät des Testers — iPhone / Android]

- [ ] https://siag-incident-assistant.vercel.app auf dem Mobilgerät öffnen
- [ ] Seite lädt ohne horizontales Scrollen
- [ ] "Incident erfassen"-Schaltfläche ist tippbar (mindestens 44px Touch-Ziel)
- [ ] Wizard-Schritte auf kleinem Bildschirm lesbar (375px Viewport)
- [ ] Alle Formularfelder zugänglich und tippbar
- [ ] Dark-Mode-Schalter funktioniert auf Mobilgerät
- [ ] Playbook scrollt flüssig ohne Ruckeln
- [ ] PDF-Export auf Mobilgerät initiierbar (Download oder neuer Tab)
- [ ] Seite `/incidents` lädt und scrollt korrekt auf Mobilgerät

### Langsames Netzwerk (Chrome DevTools → Netzwerk → 3G)

- [ ] App lädt in unter 5 Sekunden auf 3G
- [ ] Ladeindikator/Spinner sichtbar während API-Abfragen
- [ ] Incident-Speicherung innerhalb von 10 Sekunden auf 3G abgeschlossen
- [ ] Fehlermeldung erscheint (kein leerer Bildschirm) bei Zeitüberschreitung

---

## Barrierefreiheit

### Tastaturnavigation

- [x] Tab-Taste durch alle Formularfelder in Wizard-Schritt 2 — alle erreichbar
- [x] Enter-Taste aktiviert fokussierte Schaltflächen (Weiter, Checkboxen)
- [x] Fokus-Ring (Outline) auf fokussierten Elementen sichtbar
- [x] Tab-Reihenfolge logisch (oben nach unten, links nach rechts)

### Screenreader (VoiceOver auf Mac: Cmd+F5, oder NVDA auf Windows) (nicht durchgeführt)

- [ ] Seitentitel wird vorgelesen: "SIAG Incident Management Assistent"
- [ ] Formular-Labels sind mit Eingabefeldern verknüpft
- [ ] Schaltflächen haben beschreibende Namen
- [ ] Fehlermeldungen werden bei fehlgeschlagener Validierung angekündigt
- [ ] Playbook-Checkboxen sind mit Schrittinhalt beschriftet

### Farbkontrast (WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/)

- [x] Primärtext auf hellem Hintergrund: mindestens 4.5:1 Kontrastverhältnis
- [x] Primärtext im Dark Mode: mindestens 4.5:1 auf dunklem Hintergrund
- [x] SIAG Rot (#CC0033) auf Weiss: mindestens 3:1 für grossen Text (Logo)
- [x] Schweregrad-Badge "Kritisch" (rot): Text lesbar
- [x] Farben für Compliance-Fristen: bei normaler Textgrösse lesbar

---

## Dark Mode: Kontrast ist nicht gut: Vorherige Blaue Bezeichnung sind beim Darkmode nicht mehr gut lesbar. 

- [x] Dark Mode über den Header-Schalter aktivieren
- [x] Alle Wizard-Schritte im Dark Mode korrekt dargestellt
- [x] PDF-Export erzeugt auch im Dark Mode ein helles Dokument
- [ ] Playbook-Checkboxen im Dark Mode sichtbar
- [x] Incident-Liste im Dark Mode korrekt dargestellt
- [x] Dark Mode deaktivieren — Layout kehrt sauber zum hellen Modus zurück

---

## Datenmigration (falls v1.0-Daten im Browser vorhanden)

_Überspringen, falls keine v1.0 localStorage-Daten im Testbrowser vorhanden._

- [ ] Schlüssel `siag-wizard-state` in localStorage vorhanden (DevTools → Applikation → Speicher)
- [ ] Beim ersten v1.1-Aufruf erscheint eine Migrations-Benachrichtigung
- [ ] Nach dem Neuladen sind v1.0-Daten in der `/incidents`-Liste sichtbar
- [ ] Schlüssel `siag-wizard-state` ist nach der Migration aus dem localStorage entfernt
- [ ] Schlüssel `siag-v1-backup` existiert als Sicherungskopie (30-Tage-Aufbewahrung)

---

## Leistungs-Schnellprüfung

- [x] Initialer App-Aufruf: unter 3 Sekunden im Büro-WLAN
- [x] "Weiter" zwischen Wizard-Schritten: unter 1 Sekunde (Seitenübergänge sofort)
- [x] Laden der Incident-Liste (0–10 Incidents): unter 2 Sekunden
- [x] PDF-Generierung: unter 30 Sekunden für einen vollständigen Incident

---

## Gesamtbewertung

| Bereich | Bestanden / Nicht bestanden / Teilweise | Bemerkungen |
|---------|-----------------------------------------|-------------|
| Ransomware-Workflow | | |
| Phishing-Workflow | | |
| DDoS-Workflow | | |
| Datenverlust-Workflow | | |
| PDF-Export-Qualität | | |
| FINMA/ISG/DSG-Compliance-Logik | | |
| Mobil-Bedienbarkeit | | |
| Barrierefreiheit (Tastatur) | | |
| Barrierefreiheit (Screenreader) | | |
| Farbkontrast | | |
| Dark Mode | | |
| Incident-Liste und Fortsetzen | | |
| Datenmigration | | |

---

## Gefundene Probleme

| # | Beschreibung | Schweregrad | Reproduktionsschritte |
|---|-------------|-------------|----------------------|
| 1 | | | |
| 2 | | | |

**Schweregradskala:**
- **Kritisch** — blockiert Kernfunktion, muss vor Abnahme behoben werden
- **Hoch** — beeinträchtigt Bedienbarkeit erheblich, sollte behoben werden
- **Gering** — kosmetisch oder geringer Einfluss, kann auf v1.1.x verschoben werden

---

## UAT-Ergebnis

- [ ] **BESTANDEN** — alle kritischen und wesentlichen Punkte bestanden; Produktivbetrieb v1.1.0 empfohlen
- [ ] **BESTANDEN MIT AUFLAGEN** — [Auflagen unten auflisten]
- [x] **NICHT BESTANDEN** — kritische Probleme gefunden; Nachtest nach Behebung erforderlich

**Abnahme des Beraters:** Siehe `SIGN-OFF.md` im Projektstamm.
