---
phase: 07-backend-scaffold-design-system
plan: 01b
title: Prisma ORM Initialization
description: Install Prisma, create PrismaClient singleton, initialize schema with placeholders, and configure environment for database connectivity
type: execute
wave: 2
depends_on:
  - 07-01a
files_modified:
  - package.json
  - prisma/schema.prisma
  - src/lib/prisma.ts
  - src/lib/schemas/incident.schema.ts
  - .env.local
autonomous: true
requirements:
  - B1.6
  - B2.1
  - B2.2
must_haves:
  truths:
    - "Prisma CLI installed and schema file initialized"
    - "PrismaClient singleton created with serverless-safe pattern"
    - "Incident model schema with placeholder fields for Phase 02 expansion"
    - ".env.local configured with placeholder DATABASE_URL and DIRECT_URL"
    - "Zod validation schema for incident creation requests"
  artifacts:
    - path: src/lib/prisma.ts
      provides: Singleton PrismaClient for serverless-safe reuse
      contains: "PrismaClient"
    - path: prisma/schema.prisma
      provides: Prisma schema definition with placeholder Incident model
      contains: "model Incident"
    - path: src/lib/schemas/incident.schema.ts
      provides: Zod validation schema for API requests
      contains: "createIncidentSchema"
    - path: .env.local
      provides: Database connection configuration (placeholders)
      contains: "DATABASE_URL"
  key_links:
    - from: src/lib/prisma.ts
      to: prisma/schema.prisma
      via: "Prisma code generation"
      pattern: "@prisma/client"
    - from: .env.local
      to: prisma/schema.prisma
      via: "DATABASE_URL and DIRECT_URL"
      pattern: "db.neon.tech|postgresql"
---

## Context

**Phase Goal:** Establish backend infrastructure and SIAG design tokens as foundation for all subsequent phases.

**This Plan Accomplishes:**
- Installs Prisma ORM for type-safe database queries
- Creates serverless-safe PrismaClient singleton pattern (critical for Phase 8+)
- Initializes Prisma schema with placeholder Incident model (detailed in Phase 02)
- Configures environment variables for Neon PostgreSQL connections
- Creates Zod validation schema for incident API requests
- Provides foundation for Phase 02 (complete schema) and Phase 08 (CRUD endpoints)

**Why This Matters:**
Phase 02 and all subsequent phases depend on Prisma being installed and configured. The PrismaClient singleton pattern is critical for serverless safety; without it, Vercel Functions would exhaust connection limits in production.

**Output:**
- Prisma ORM installed and schema initialized
- PrismaClient singleton ready for Phase 02 database operations
- Zod schema ready for API validation
- Environment variables configured for Neon connectivity (awaiting user values)

---

## Execution Context

@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/07-backend-scaffold-design-system/07-RESEARCH.md
@.planning/phases/07-backend-scaffold-design-system/07-01a-PLAN.md

---

## Tasks

<task type="auto">
  <name>Task 1: Install Prisma and validation dependencies</name>
  <files>package.json</files>
  <action>
Add Prisma ORM and validation packages to package.json:

Prisma ORM:
```bash
npm install @prisma/client@7.6.0
npm install -D prisma@7.6.0
```

Validation + Security:
```bash
npm install zod@4.3.6
npm install -D express-rate-limit@8.3.2
```

Verify installations:
```bash
npm list @prisma/client prisma zod
```

The installed versions are the standard stack verified in 07-RESEARCH.md.
  </action>
  <verify>
    <automated>npm list @prisma/client prisma | grep -E "@prisma/client|prisma" && echo "✓ Prisma installed" || echo "✗ Prisma missing"</automated>
  </verify>
  <done>Prisma and Zod dependencies installed in package.json</done>
</task>

<task type="auto">
  <name>Task 2: Initialize Prisma schema</name>
  <files>
    - prisma/schema.prisma
    - .env.local
  </files>
  <action>
Initialize Prisma and configure the schema for serverless PostgreSQL (Neon).

**Run Prisma init:**
```bash
npx prisma init
```

This creates `prisma/schema.prisma` and updates `.env.local`.

**Replace prisma/schema.prisma with serverless-safe config:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Incident model — to be expanded in Phase 02 with full schema
model Incident {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Placeholder fields; full schema in Phase 02
  erkennungszeitpunkt DateTime?
  erkannt_durch       String?
  betroffene_systeme  String[]
  erste_erkenntnisse  String?

  incident_type String? // "ransomware" | "phishing" | "ddos" | "data_loss" | "other"
  q1            Int?
  q2            Int?
  q3            Int?
  severity      String? // "critical" | "high" | "medium" | "low"

  playbook                   Json?
  regulatorische_meldungen   Json?
  metadata                   Json?

  @@index([incident_type])
  @@index([severity])
  @@index([createdAt])
}
```

**Configure .env.local with placeholders:**
```bash
# Database — Neon PostgreSQL (two connection strings)
# Pooled connection (for app traffic) — PLACEHOLDER, user provides real value in Phase 02
DATABASE_URL="postgresql://user:password@ep-placeholder-pooler.db.neon.tech/siag?sslmode=require"

# Direct connection (for migrations) — PLACEHOLDER, user provides real value in Phase 02
DIRECT_URL="postgresql://user:password@ep-placeholder.db.neon.tech/siag?sslmode=require"

# Environment
NODE_ENV="development"

# API Configuration
API_KEY="dev-api-key-change-in-production"
CORS_ORIGIN="http://localhost:3000"
```

**Important notes:**
- Both `DATABASE_URL` and `DIRECT_URL` are placeholders. User will provide real values from Neon during Phase 02.
- The `-pooler` variant in `DATABASE_URL` is critical for serverless reuse (per 07-RESEARCH.md).
- `DIRECT_URL` is used only by Prisma CLI and local development; not by the running app.

**Validate schema syntax:**
```bash
npx prisma validate
```

Expected: "✓ The schema is valid!" (even with placeholder URLs)
  </action>
  <verify>
    <automated>test -f prisma/schema.prisma && grep -q "datasource db" prisma/schema.prisma && echo "✓ Prisma schema initialized" || echo "✗ Schema file missing"</automated>
  </verify>
  <done>Prisma schema created with placeholder Incident model and serverless-safe configuration</done>
</task>

<task type="auto">
  <name>Task 3: Create serverless-safe PrismaClient singleton</name>
  <files>src/lib/prisma.ts</files>
  <action>
Create the PrismaClient singleton instance that safely reuses connections across serverless invocations.

**Create src/lib/prisma.ts:**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Why this pattern:**
- In serverless (production), PrismaClient is instantiated once per warm invocation
- In development, prevents multiple instances if Next.js dev server restarts
- Neon connection pooling handles actual connection reuse at the database level
- The global assignment caches the client across request handlers in the same execution context

**Usage in Phase 08+ route handlers:**
```typescript
import prisma from '@/lib/prisma';

export default async (req, res) => {
  const incidents = await prisma.incident.findMany();
  res.json(incidents);
};
```

This is the critical serverless pattern; all Phase 08+ endpoints will import from this singleton.
  </action>
  <verify>
    <automated>grep -q "PrismaClient" src/lib/prisma.ts && grep -q "globalForPrisma" src/lib/prisma.ts && echo "✓ PrismaClient singleton correct" || echo "✗ Singleton pattern missing"</automated>
  </verify>
  <done>Serverless-safe PrismaClient singleton created; ready for Phase 02 database operations</done>
</task>

<task type="auto">
  <name>Task 4: Create Zod incident validation schema</name>
  <files>src/lib/schemas/incident.schema.ts</files>
  <action>
Create Zod validation schema for incident creation and updates (used by Phase 08 endpoints).

**Create src/lib/schemas/ directory:**
```bash
mkdir -p src/lib/schemas
```

**Create src/lib/schemas/incident.schema.ts:**
```typescript
import { z } from 'zod';

export const createIncidentSchema = z.object({
  erkennungszeitpunkt: z.string().datetime(),
  erkannt_durch: z.string().min(1).max(255),
  betroffene_systeme: z.array(z.string()).min(1),
  erste_erkenntnisse: z.string().optional(),
  incident_type: z.enum(['ransomware', 'phishing', 'ddos', 'data_loss', 'other']).optional(),
  q1: z.number().int().min(0).max(1).optional(),
  q2: z.number().int().min(0).max(1).optional(),
  q3: z.number().int().min(0).max(1).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
});

export const updateIncidentSchema = createIncidentSchema.partial();

export type CreateIncidentRequest = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentRequest = z.infer<typeof updateIncidentSchema>;
```

**Why this schema:**
- Type-safe validation for all API requests
- Matches the Incident model fields from prisma/schema.prisma
- Partial variant for PATCH requests
- Type inference from schema prevents duplicate types

This schema will be used by Phase 08 API endpoints for request validation.
  </action>
  <verify>
    <automated>test -f src/lib/schemas/incident.schema.ts && grep -q "createIncidentSchema" src/lib/schemas/incident.schema.ts && echo "✓ Zod schema created" || echo "✗ Schema file missing"</automated>
  </verify>
  <done>Zod incident validation schema created for API request validation</done>
</task>

<task type="auto">
  <name>Task 5: Add Prisma npm scripts</name>
  <files>package.json</files>
  <action>
Update package.json with Prisma CLI scripts for schema management and database operations.

**Update scripts section in package.json:**
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio"
  }
}
```

**Usage:**
- `npm run prisma:generate` — Generate Prisma Client (needed after schema changes)
- `npm run prisma:migrate` — Create and apply migrations interactively
- `npm run prisma:push` — Push schema to database (development shortcut, creates implicit migrations)
- `npm run prisma:studio` — Open Prisma Studio for database inspection

For Phase 02, the user will run `npm run prisma:migrate` after providing real database credentials.
  </action>
  <verify>
    <automated>grep -q "prisma:migrate" package.json && grep -q "prisma:generate" package.json && echo "✓ Prisma scripts added" || echo "✗ Scripts missing"</automated>
  </verify>
  <done>Prisma npm scripts configured for schema and database management</done>
</task>

<task type="auto">
  <name>Task 6: Verify and commit Phase 07-01b completion</name>
  <files>
    - package.json
    - prisma/schema.prisma
    - src/lib/prisma.ts
    - src/lib/schemas/incident.schema.ts
    - .env.local
  </files>
  <action>
Run final verification and commit Phase 07-01b changes.

**Verification checks:**
```bash
# 1. Prisma is installed
npm list @prisma/client prisma

# 2. Prisma schema is valid
npx prisma validate

# 3. Files exist and have content
test -f src/lib/prisma.ts && test -f prisma/schema.prisma && test -f src/lib/schemas/incident.schema.ts && echo "✓ All files present"

# 4. .env.local exists
test -f .env.local && echo "✓ .env.local configured"
```

**Commit:**
```bash
git add -A
git commit -m "feat(07-01b): prisma orm initialization

- Install Prisma 7.6.0, @prisma/client, and Zod validation
- Create PrismaClient singleton with serverless-safe pattern
- Initialize Prisma schema with placeholder Incident model
- Create Zod validation schema for incident API requests
- Configure .env.local with database connection placeholders
- Add npm scripts: prisma:generate, prisma:migrate, prisma:push, prisma:studio
- Directory structure: src/lib/{prisma.ts, schemas/}

STATUS: Prisma ready; schema waiting for Phase 02 expansion and user database credentials
"
```
  </action>
  <verify>
    <automated>npx prisma validate 2>&1 | grep -q "valid" && test -f src/lib/prisma.ts && echo "✓ Phase 07-01b ready" || echo "✗ Verification failed"</automated>
  </verify>
  <done>Prisma ORM initialized and committed; ready for Phase 02 database schema expansion</done>
</task>

</tasks>

---

## Threat Model

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-04 | Denial of Service | Connection pool exhaustion in serverless | mitigate | Use Neon PgBouncer with pooled connection string; singleton PrismaClient minimizes open connections per invocation |
| T-07-05 | Information Disclosure | Database credentials in .env.local | mitigate | .env.local is gitignored; .env.example provided without secrets; Neon credentials never committed |

---

## Verification

After Phase 07-01b completion:
- [ ] `npm list @prisma/client prisma` shows correct versions
- [ ] `npx prisma validate` returns ✓ The schema is valid!
- [ ] src/lib/prisma.ts exists with singleton pattern
- [ ] src/lib/schemas/incident.schema.ts exists with Zod exports
- [ ] prisma/schema.prisma has Incident model with placeholders
- [ ] .env.local configured with DATABASE_URL and DIRECT_URL placeholders
- [ ] npm scripts include prisma:generate, prisma:migrate, etc.

---

## Success Criteria

Phase 07-01b is complete when:
1. Prisma installed and configured
2. PrismaClient singleton pattern implemented correctly
3. Incident model schema with placeholder fields (full details in Phase 02)
4. Zod validation schema for API requests
5. Environment variables configured with placeholders
6. npm scripts added for Prisma operations

---

## Next Phase

**Phase 07-02: Database Schema + Prisma Migrations** — Expand Incident model with complete schema, create migrations, provision Neon database, and apply migrations (depends on Phase 07-01b).
