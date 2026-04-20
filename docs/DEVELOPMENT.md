# Development Guide

## Setup

Follow [GETTING-STARTED.md](GETTING-STARTED.md) first. Then:

```bash
npm install
npm run dev
```

Development server runs on **http://localhost:3000**

## Project Structure

```
src/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── health/route.ts     # Health check endpoint
│   │   ├── incidents/route.ts  # List, create incidents
│   │   ├── [id]/route.ts       # Get, update, delete incident
│   │   ├── [id]/export/        # PDF & JSON export endpoints
│   │   └── swagger/            # OpenAPI documentation
│   ├── (wizard)/               # Main wizard UI routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── layout.tsx              # Root layout
├── components/
│   ├── incidents/              # Incident list & detail components
│   ├── wizard/                 # Wizard step components
│   └── ui/                     # Reusable UI components (button, card, etc.)
├── lib/
│   ├── migration.ts            # v1.0 → v1.1 localStorage migration
│   ├── wizard-types.ts         # TypeScript type definitions
│   └── utils.ts                # Utility functions
├── hooks/
│   └── useMigration.ts         # React hook for data migration
└── api/
    ├── schemas/                # Zod validation schemas
    ├── services/               # Business logic (incident.service.ts)
    └── types/                  # API response types

prisma/
├── schema.prisma               # Database schema (Prisma ORM)
└── migrations/                 # Database migration files

tests/
├── api/                        # API endpoint tests
├── components/                 # Component render tests
└── security/                   # Auth & security tests
