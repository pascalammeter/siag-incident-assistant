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

---

## Backend Setup (Local Development)

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (Neon recommended for cloud)
- API Key for authentication

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/pascalammeter/siag-incident-assistant.git
cd siag-incident-assistant
npm install
```

### 2. Configure Environment

Create `.env.local` in the project root (use `.env.example` as template):

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:

```env
# Database (get from https://console.neon.tech)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# API Configuration
API_KEY=sk_test_your_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. Set Up PostgreSQL Database

**Option A: Using Neon (Recommended)**

1. Create free account at https://console.neon.tech
2. Create new PostgreSQL project
3. Copy connection string to `DATABASE_URL` in `.env.local`
4. Copy compute endpoint connection string to `DIRECT_URL`

**Option B: Local PostgreSQL**

```bash
# macOS (homebrew)
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database and user
psql postgres -c "CREATE USER incident_user WITH PASSWORD 'password';"
psql postgres -c "CREATE DATABASE incident_db OWNER incident_user;"

# Connection string for .env.local:
# DATABASE_URL=postgresql://incident_user:password@localhost:5432/incident_db
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate -- --name "initial"
```

This creates all tables defined in `prisma/schema.prisma`.

### 5. Start Backend Server

```bash
npm run dev:backend
```

Server starts at `http://localhost:3000`

Verify API is running:
```bash
curl -H "X-API-Key: sk_test_your_secret_key_here" \
  http://localhost:3000/api/incidents
```

Expected response:
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

### 6. Access API Documentation

Open **Swagger UI** at:
```
http://localhost:3000/api-docs
```

Or view **OpenAPI JSON spec**:
```
http://localhost:3000/api-docs/json
```

### 7. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Expected: 515+ tests passing ✅

---

## Frontend + Backend (Full Stack Local Development)

```bash
# Terminal 1: Backend API server
npm run dev:backend

# Terminal 2: Frontend dev server (in same project)
npm run dev:frontend

# Open http://localhost:3000 in browser
```

The frontend automatically connects to backend at `http://localhost:3000/api` with API key from `.env.local`.

---

## Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from main branch
# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - DIRECT_URL
# - API_KEY (use sk_live_ prefix)
# - CORS_ORIGIN=https://siag-incident-assistant.vercel.app
# - NODE_ENV=production
```

### Access Production API

```bash
curl -H "X-API-Key: sk_live_..." \
  https://siag-incident-assistant.vercel.app/api/incidents
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) | API endpoint documentation and examples |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Database schema, fields, indexes, constraints |
| [`docs/DATABASE_SCHEMA_ER.mmd`](docs/DATABASE_SCHEMA_ER.mmd) | Entity-relationship diagram (Mermaid) |
| [`docs/API_ERROR_CODES.md`](docs/API_ERROR_CODES.md) | Complete error codes reference and solutions |
| [`docs/PERFORMANCE_BENCHMARKS.md`](docs/PERFORMANCE_BENCHMARKS.md) | Load test results, SLA metrics, capacity planning |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Frontend development setup and architecture |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing strategy and test coverage |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and design decisions |

---

## API Quick Reference

### Create Incident

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_your_key" \
  -d '{
    "incident_type": "ransomware",
    "severity": "critical",
    "erkennungszeitpunkt": "2026-04-07T14:30:00Z",
    "erkannt_durch": "SOC monitoring",
    "betroffene_systeme": ["Exchange", "SharePoint"]
  }'
```

### List Incidents

```bash
curl "http://localhost:3000/api/incidents?severity=critical&limit=10" \
  -H "X-API-Key: sk_test_your_key"
```

### Get Incident by ID

```bash
curl "http://localhost:3000/api/incidents/{id}" \
  -H "X-API-Key: sk_test_your_key"
```

See [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) for complete API documentation.

---

## Entwicklung (Quick Reference)

```bash
npm install
npm run dev:backend       # Backend API server (http://localhost:3000/api)
npm run dev:frontend      # Frontend dev server
npm test                  # Tests via Vitest (515+ tests)
npm run build             # Static frontend export
npm run prisma:migrate    # Run database migrations
```

Weitere Details: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | [`docs/TESTING.md`](docs/TESTING.md) | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
