# Getting Started

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ and npm 9+
- **PostgreSQL database** — Neon (recommended) or local PostgreSQL 15+
- **API Key** — for testing authenticated routes

## Installation and Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pascalammeter/siag-incident-assistant.git
cd siag-incident-assistant
npm install
```

### 2. Set Up Environment Variables

Copy the example and configure for your environment:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database configuration (get from Neon console at https://console.neon.tech)
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/siag_db?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxxxx.neon.tech/siag_db?sslmode=require

# API authentication
API_KEY=sk_test_your_secret_key_here
CORS_ORIGIN=http://localhost:3000

# Node environment
NODE_ENV=development
```

### 3. Neon Database Setup (if using Neon)

1. Go to https://console.neon.tech and create a project
2. Create a PostgreSQL database (default `neondb`)
3. Copy the **Node.js connection string** from the dashboard
4. Paste into `DATABASE_URL` and `DIRECT_URL` in `.env.local`

### 4. Database Migrations and Seeding

Initialize the database schema and seed with sample data:

```bash
# Run Prisma migrations (creates tables in your database)
npm run prisma:migrate

# (Optional) Seed database with sample incidents and users
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 6. Verify API Health

Test the backend API is running:

```bash
curl http://localhost:3000/api/health
# Expected response: { "status": "ok" }
```

### 7. Create Your First Incident

Navigate to http://localhost:3000 and:
1. Click **"Shit Happens"** button
2. Enter incident details (timestamp, affected systems, type)
3. Answer classification questions (severity, data impact)
4. Review the incident summary
5. Export as PDF (if PDF generation is enabled)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL not found` | Ensure `.env.local` exists and has `DATABASE_URL` set |
| `Connection refused` | Verify Neon credentials, check database is running |
| `Migration failed` | Ensure `DIRECT_URL` is set (used by Prisma migrate) |
| `API /health returns 500` | Check server logs, verify env vars are set |
| `npm install fails` | Delete `node_modules` and `package-lock.json`, try again with `npm install --legacy-peer-deps` |

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for contributing and local development
- Review [TESTING.md](TESTING.md) for running the test suite
- Explore [API.md](API.md) for API endpoint documentation
