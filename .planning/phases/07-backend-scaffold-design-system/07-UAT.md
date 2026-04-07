---
status: testing
phase: 07-backend-scaffold-design-system
source: 07-01a-SUMMARY.md, 07-01b-SUMMARY.md, 07-01c-SUMMARY.md, 07-01d-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md
started: 2026-04-07T12:25:00Z
updated: 2026-04-07T12:25:00Z
language: de
---

## Aktueller Test

number: 1
name: Kaltstart-Integritätsprüfung
expected: |
  Alle laufenden Server-Prozesse beenden.
  Backend mit `npm run dev:backend` neu starten.
  Server startet fehlerlos, lauscht auf localhost:3000, und Health-Check-Endpoint antwortet mit {"status":"ok"}.
awaiting: Benutzer-Eingabe

## Tests

### 1. Kaltstart-Integritätsprüfung
expected: Backend startet mit `npm run dev:backend`, lauscht auf localhost:3000, Health-Check GET /api/health antwortet mit {"status":"ok"}.
result: pending

### 2. Express-Scaffold-Verifikation
expected: Express-App-Verzeichnisstruktur existiert (src/api, src/middleware, src/utils); Middleware und Error Handler konfiguriert; npm Scripts dev:backend, type-check und dev:all laufen ohne Fehler.
result: pending

### 3. TypeScript Strict Mode
expected: `npm run type-check` beendet mit Status 0; keine Kompilierungsfehler; TypeScript Strict Mode aktiviert (13 Strict-Einstellungen in tsconfig.json).
result: pending

### 4. Prisma ORM Installation
expected: `npm list @prisma/client @prisma/adapter-neon zod` zeigt alle drei Pakete installiert; `npx prisma validate` bestätigt Schema ist gültig; keine fehlenden Abhängigkeiten.
result: pending

### 5. PrismaClient Singleton
expected: src/lib/prisma.ts exportiert PrismaClient Singleton mit Neon-Adapter-Konfiguration; `import prisma from '@/lib/prisma'` funktioniert fehlerlos in Testdateien; Globales Caching-Pattern vorhanden.
result: pending

### 6. Zod Validierungsschemas
expected: src/lib/schemas/incident.schema.ts exportiert createIncidentSchema und updateIncidentSchema; Schemas können importiert und zur Validierung von Incident-Objekten verwendet werden; Type Inference funktioniert.
result: pending

### 7. Datenbank-Schema Vollständigkeit
expected: Prisma-Schema definiert Incident-Modell mit allen SIAG-Feldern (recognition, classification, playbook, regulatory, metadata JSONB); Indizes auf incident_type, severity, createdAt, erkennungszeitpunkt erstellt; Migration existiert und wird sauber angewendet.
result: pending

### 8. Seed-Script Funktionalität
expected: `npm run prisma:db:seed` (oder gleichwertiges Kommando) füllt Testdaten; 3+ Test-Incidents mit verschiedenen Severity-Levels erstellt; Seed-Script läuft ohne Fehler; Daten können via `npx prisma studio` abgefragt werden.
result: pending

### 9. SIAG Farb-Token
expected: src/app/globals.css enthält CSS Custom Properties für --siag-red (#CC0033), --siag-navy (#003B5E), --siag-orange (#D44E17); Farben können in Tailwind Utilities oder CSS-Klassen verwendet werden.
result: pending

### 10. Typografie-System
expected: Source Sans 3 geladen via next/font/google in src/app/layout.tsx; Font-Variablen in CSS injiziert; H1/H2 Display-Fonts und Body-Text-Fonts ordnungsgemäß konfiguriert.
result: pending

### 11. Dark Mode CSS-Variablen
expected: src/app/globals.css enthält @media (prefers-color-scheme: dark) Block mit getauschten Farbvariablen; Hintergrund- und Vordergrundfarben ändern sich, wenn Dark Mode aktiviert ist.
result: pending

### 12. Animation-Barrierefreiheit
expected: Alle Animationen (Button Hover 150ms, Press 100ms Scale-98, Card Elevation, Spinner Rotation) respektieren `prefers-reduced-motion: reduce`; keine Animationen, wenn Benutzer Accessibility-Setting aktiviert hat.
result: pending

### 13. Swagger UI Endpoint
expected: Express-App mounted Swagger UI unter /api-docs; Navigation zu http://localhost:3000/api-docs zeigt interaktive API-Dokumentation mit SIAG-Rot-Branding (#CC0033); Raw-Spec abrufbar unter /api-docs/json.
result: pending

### 14. OpenAPI 3.0.0 Spezifikation
expected: /api-docs/json gibt gültiges OpenAPI 3.0.0 JSON zurück mit Incident-Schema-Definition, Error-Response-Schema, ApiKeyAuth-Sicherheitsschema und Endpoint-Beschreibungen; Spec ist maschinenlesbar und gültig.
result: pending

### 15. Prisma Adapter Konfiguration
expected: src/lib/prisma.ts instantiiert PrismaClient mit `adapter: new PrismaNeon({ connectionString })` Option; Adapter lädt korrekt, wenn DATABASE_URL-Umgebungsvariable gesetzt ist; Conditional Logic behandelt fehlende Env Var.
result: pending

### 16. TypeScript Build Erfolg
expected: `npm run type-check` erfolgreich mit 0 TypeScript-Fehlern; prisma.config.ts-Datei existiert nicht (gelöscht in 07-01d); schema.prisma-only Konfiguration wird verwendet.
result: pending

## Zusammenfassung

total: 16
passed: 0
issues: 0
pending: 16
skipped: 0
blocked: 0

## Lücken

[noch keine]
