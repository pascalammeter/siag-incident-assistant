# Requirements — SIAG Incident Management Assistent

## Goal
Klickbarer Next.js-Prototyp auf Vercel für Review durch SIAG-Berater. Architektur von Beginn an auf Kundenplattform-Integration ausgelegt.

---

## Functional Requirements

### F1 — Wizard-Grundstruktur
- F1.1 7-Screen-Flow: No-Go Interstitial → Einstieg → Erfassen → Klassifikation → Reaktion → Kommunikation → Dokumentation
- F1.2 Fortschrittsanzeige oben: „Schritt X von 6" (Interstitial zählt nicht)
- F1.3 Vor/Zurück-Navigation zwischen Schritten
- F1.4 Session-Persistenz via localStorage — alle Eingaben überleben Browser-Reload
- F1.5 Jeder Schritt hat: klaren Titel, Kurzerklärung, Nutzerinteraktion, sichtbarer nächster Schritt

### F2 — No-Go Interstitial (vor Schritt 1)
- F2.1 Vollbild-Interstitial mit 8 No-Go-Regeln vor jedem anderen Screen
- F2.2 Pflicht-Bestätigung (Checkbox + Button) bevor Wizard startet
- F2.3 Amber/Warnorange Styling — nicht Rot, nicht alarmierend
- F2.4 No-Go-Liste: Kein Neustart, kein Lösegeld zahlen, kein Kontakt ohne Anwalt, keine Bereinigung vor Forensik, keine Logs löschen, nicht vertuschen, Backup sofort isolieren, normale Arbeit stoppen

### F3 — Schritt 1: Einstieg
- F3.1 Prominenter „Shit Happens" Startbutton (gross, Dunkelblau, sofort sichtbar)
- F3.2 Kurzerklärung: „Wenn ein Sicherheitsvorfall erkannt wird, führt Sie dieses Modul durch die Erstreaktion."
- F3.3 Alternativ-Einstieg: „Vorfall erfassen" ohne Button-Metapher

### F4 — Schritt 2: Vorfall erfassen
- F4.1 Pflichtfeld: Wann wurde der Vorfall erkannt (Datum + Uhrzeit) — mit „Jetzt"-Button für Auto-Timestamp
- F4.2 Pflichtfeld: Durch wen erkannt (Freitext oder Dropdown: IT-Mitarbeiter / Nutzer / Externes System / Angreifer-Kontakt)
- F4.3 Multi-Select: Betroffene Systeme/Assets (Workstations, Server, Backups, E-Mail, Netzwerk, OT/ICS, Sonstiges)
- F4.4 Freitext: Erste Auffälligkeiten
- F4.5 Checkbox: Ist ein Lösegeld-Schreiben oder eine Verschlüsselungs-Meldung vorhanden?
- F4.6 Timestamp wird prominent angezeigt — „Ihre rechtliche Meldefrist beginnt jetzt"

### F5 — Schritt 3: Klassifikation & Schweregrad
- F5.1 3-Fragen-Entscheidungsbaum (binär, kein Freitext):
  - „Sind kritische Geschäftssysteme betroffen oder verschlüsselt?" → Ja/Nein
  - „Sind personenbezogene Daten betroffen oder potenziell abgeflossen?" → Ja/Nein
  - „Ist der Angreifer noch aktiv im Netzwerk?" → Ja/Nein/Unbekannt
- F5.2 Automatische Schweregrad-Ableitung: Kritisch / Hoch / Mittel
- F5.3 Incident-Typ Auswahl: Ransomware / Phishing / DDoS / Datenverlust / Unbefugter Zugriff / Sonstiges (MVP: Ransomware als primärer Pfad)
- F5.4 Eskalationslogik sichtbar: „Schweregrad Kritisch → SIAG-Berater sofort einbeziehen"

### F6 — Schritt 4: Reaktionsschritte (Ransomware Playbook)
- F6.1 25-Punkte Checkliste in 4 Phasen: Sofortmassnahmen / Eindämmung / Untersuchung / Kommunikation
- F6.2 Checkboxen mit Abhakllogik — erledigte Schritte als abgehakt markiert
- F6.3 No-Go-Hinweise inline hervorgehoben (amber box)
- F6.4 Verantwortlichkeiten sichtbar: welche Rolle führt welchen Schritt (IT-Leiter / CISO / CEO / Forensik)
- F6.5 Fortschritt der Checkliste als Zähler sichtbar: „8 von 25 erledigt"

### F7 — Schritt 5: Kommunikation & Eskalation
- F7.1 Drei-Fragen Meldepflicht-Check (Swiss Legal):
  - „Kritische Infrastruktur?" → ISG: NCSC innerhalb 24h (seit 01.04.2025)
  - „Personenbezogene Daten betroffen?" → DSG/DSGVO: FDPIC so schnell wie möglich
  - „Reguliertes Unternehmen (Bank/Versicherung/FMI)?" → FINMA: 24h informell + 72h vollständig
- F7.2 Ergebnis: Liste der Meldepflichten mit Fristanzeige und Countdown
- F7.3 Kommunikations-Checkliste: Krisenstab / GL + VR / Mitarbeitende / Medien / Kunden / Partner
- F7.4 Kommunikationsbausteine (Textvorlagen) für interne + externe Kommunikation
- F7.5 Button: „SIAG-Berater jetzt einbeziehen" — prominent, mit Kontaktinfo

### F8 — Schritt 6: Dokumentation & Abschluss
- F8.1 Strukturierte Incident-Zusammenfassung (alle Eingaben konsolidiert):
  - Was ist passiert | Wann | Betroffene Systeme | Klassifikation | Massnahmen | Risiken offen | Wer informiert | Nächste Schritte
- F8.2 „Bericht für GL/VR exportieren" Button (druckbares HTML oder PDF-Print)
- F8.3 Prominenter Übergabepunkt: „An SIAG-Berater übergeben" mit klarer Handoff-Botschaft
- F8.4 Nächste Schritte sichtbar (was nach dem Modul kommt)

---

## Non-Functional Requirements

### NF1 — UX / Stress-Tauglichkeit
- NF1.1 Sprache: Deutsch, kurz, imperativ, handlungsorientiert — kein Fachjargon ohne Erklärung
- NF1.2 Eine Entscheidung pro Screen — keine parallelen Aufgaben
- NF1.3 Fortschritt immer sichtbar
- NF1.4 Unter Stress bedienbar: grosse Touch-Targets, klarer Primary Action Button pro Schritt
- NF1.5 Fehlermeldungen klar und lösungsorientiert (nicht technisch)

### NF2 — Design / Branding
- NF2.1 SIAG-Farbpalette: #1a2e4a Navy (Primary), #ffffff Weiss, #f5f7fa Hellgrau, #f59e0b Amber (Warnung)
- NF2.2 Kein dominierendes Alarming-Rot
- NF2.3 Font: System-UI / Inter — klar, lesbar
- NF2.4 Ruhiges, vertrauenserweckendes Design — kein hektisches UI
- NF2.5 SIAG-Logo/Branding im Header

### NF3 — Technisch
- NF3.1 Next.js 15, App Router, TypeScript
- NF3.2 Tailwind CSS v4 (CSS-based config, @theme in globals.css)
- NF3.3 react-hook-form + Zod per Schritt
- NF3.4 useReducer + Context für globalen Wizard-State
- NF3.5 output: 'export' in next.config.ts für statisches Deployment
- NF3.6 images: { unoptimized: true } für static export
- NF3.7 Keine next/* Imports in Wizard-Komponenten (Plattform-Kompatibilität)
- NF3.8 Session-Persistenz via localStorage

### NF4 — Deployment
- NF4.1 Vercel-Deployment (kein vercel.json nötig — Next.js output: export wird erkannt)
- NF4.2 GitHub-Repository mit Vercel-Integration
- NF4.3 Git user.email = GitHub No-Reply-Email (Vercel Hobby-Anforderung)
- NF4.4 Shareable Preview-URL nach Deployment

### NF5 — Plattform-Kompatibilität (Future-Ready)
- NF5.1 Alle Wizard-Komponenten via Props konfigurierbar (keine hardcoded Next.js-Abhängigkeiten)
- NF5.2 Playbook-Daten als separate JSON/TS-Konstanten (austauschbar für weitere Incident-Typen)
- NF5.3 Branding-Tokens als CSS-Custom-Properties (einfach überschreibbar)
- NF5.4 State-Struktur exportierbar (Vorbereitung für API-Anbindung Phase 2)

---

## Out of Scope (MVP)
- Backend / Datenbankanbindung
- Authentifizierung / SSO
- Mandantenfähigkeit
- Weitere Incident-Typen (nur Ransomware als vollständiger Pfad)
- Echte PDF-Generierung (Print-to-PDF reicht für MVP)
- Mehrsprachigkeit
- Push-Benachrichtigungen / Alerts
