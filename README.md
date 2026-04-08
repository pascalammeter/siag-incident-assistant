# SIAG Incident Management Assistent

[![Version](https://img.shields.io/badge/version-v1.1.0--rc-blue)](https://github.com/pascalammeter/siag-incident-assistant)
[![Tests](https://img.shields.io/badge/tests-99%2B%20passing-brightgreen)](docs/TEST_COVERAGE.md)
[![Deployment](https://img.shields.io/badge/deployed-Vercel-black)](https://siag-incident-assistant.vercel.app)
[![Security](https://img.shields.io/badge/security-OWASP%20A--grade-green)](docs/SECURITY_AUDIT.md)

**Live:** https://siag-incident-assistant.vercel.app

---

## What Is This?

A production-grade Incident Response Wizard for SIAG consultants. Guides responders through the full lifecycle of a security incident — from initial detection through classification, playbook execution, compliance notification, and documentation export.

**v1.1 (current):** API-backed persistent storage, 4 incident types, professional PDF export, dark mode, and Swiss regulatory compliance (ISG, DSG, FINMA).

---

## Release History

| Version | Date | Highlights |
|---------|------|-----------|
| v1.1.0-rc | 2026-04-08 | Backend API, 4 incident types, PDF export, migration service — **UAT in progress** |
| v1.0.0 | 2026-04-06 | Frontend prototype — 7-screen wizard, Ransomware playbook, localStorage |

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

---

## v1.1 Features

### Incident Types (4)
- **Ransomware** — 25-step playbook with ISG/DSG compliance deadlines
- **Phishing** — detection, containment, user notification, credential reset
- **DDoS** — mitigation, upstream ISP notification, traffic scrubbing
- **Data Loss** — data classification, FINMA 24/72h notification, legal steps

### Key Capabilities
| Feature | Description |
|---------|-------------|
| Persistent storage | Neon PostgreSQL — incidents survive browser reloads |
| PDF export | Professional incident report with SIAG branding |
| Incident list | Sortable, filterable list at `/incidents` |
| Data migration | v1.0 localStorage data auto-migrated on first load |
| Dark mode | System preference + manual toggle |
| Compliance | ISG 24h, DSG 15 days, FINMA 24/72h deadlines auto-calculated |
| Mobile | Responsive from 375px; 44px touch targets |
| Accessibility | WCAG AA aria attributes, skip link, nav landmark |

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Vercel Functions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Neon PostgreSQL 17 + Prisma ORM |
| Validation | Zod |
| Animation | Motion (Framer Motion) |
| PDF | Puppeteer / next-pdf |
| Monitoring | Vercel Analytics + Speed Insights |
| Testing | Vitest — 99+ tests passing |
| Deployment | Vercel (auto-deploy from main) |

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL database (Neon recommended)
- API Key for authentication

### Install and Run

```bash
git clone https://github.com/pascalammeter/siag-incident-assistant.git
cd siag-incident-assistant
npm install
cp .env.example .env.local   # Edit with your DB credentials
npm run dev
```

Open http://localhost:3000

### Environment Variables

```env
# Database (get from https://console.neon.tech)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# API
API_KEY=sk_test_your_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Run Tests

```bash
npm test                  # 99+ tests via Vitest
npm test -- --coverage    # With coverage report
```

---

## Production Deployment

```bash
# Push to GitHub — Vercel auto-deploys from main branch
git push origin main

# Required environment variables in Vercel dashboard:
# DATABASE_URL, DIRECT_URL, API_KEY, CORS_ORIGIN, NODE_ENV
```

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check (no auth) |
| `/api/incidents` | GET | List incidents (paginated, filtered) |
| `/api/incidents` | POST | Create incident |
| `/api/incidents/:id` | GET | Get single incident |
| `/api/incidents/:id` | PATCH | Update incident |
| `/api/incidents/:id` | DELETE | Soft-delete incident |

All mutation routes require `X-API-Key` header.

```bash
curl -H "X-API-Key: sk_live_..." \
  https://siag-incident-assistant.vercel.app/api/health
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`CHANGELOG.md`](CHANGELOG.md) | Release notes (v1.0, v1.1) |
| [`SIGN-OFF.md`](SIGN-OFF.md) | UAT sign-off template |
| [`docs/uat/UAT_SETUP.md`](docs/uat/UAT_SETUP.md) | UAT environment setup |
| [`docs/uat/UAT_CHECKLIST.md`](docs/uat/UAT_CHECKLIST.md) | UAT test checklist |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System overview and design |
| [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md) | API endpoint documentation |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Prisma schema with field docs |
| [`docs/API_ERROR_CODES.md`](docs/API_ERROR_CODES.md) | Error code reference |
| [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md) | OWASP A-grade audit |
| [`docs/PERFORMANCE_BENCHMARKS.md`](docs/PERFORMANCE_BENCHMARKS.md) | Load test results |
| [`docs/TEST_COVERAGE.md`](docs/TEST_COVERAGE.md) | 99+ test coverage report |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Development setup guide |
| [`docs/v1.1/MIGRATION_GUIDE.md`](docs/v1.1/MIGRATION_GUIDE.md) | v1.0 → v1.1 migration |

---

## UAT Status

v1.1.0-rc is currently in User Acceptance Testing with the SIAG consultant.

- [ ] Consultant UAT session (see `docs/uat/UAT_CHECKLIST.md`)
- [ ] Written sign-off (see `SIGN-OFF.md`)
- [ ] Git tag `v1.1.0`
- [ ] Stakeholder announcement

---

_Fragen oder Feedback: pascalammeter (GitHub: pascalammeter/siag-incident-assistant)_
