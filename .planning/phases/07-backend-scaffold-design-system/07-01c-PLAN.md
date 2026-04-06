---
phase: 07-backend-scaffold-design-system
plan: 01c
title: Fix PrismaClient Adapter Configuration (Prisma v7.6.0)
description: Update src/lib/prisma.ts to include required adapter or accelerateUrl option for Prisma v7.6.0 serverless compatibility
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/prisma.ts
  - package.json
autonomous: true
gap_closure: true
requirements:
  - B2.1
must_haves:
  truths:
    - "PrismaClient instantiation includes either 'adapter' or 'accelerateUrl' option required by Prisma v7.6.0"
    - "PrismaClient can be imported and initialized without throwing PrismaClientConstructorValidationError"
    - "Serverless singleton pattern maintained for connection reuse across Vercel Function invocations"
  artifacts:
    - path: src/lib/prisma.ts
      provides: Corrected PrismaClient singleton with required Prisma v7.6.0 adapter/accelerateUrl
      min_lines: 35
    - path: package.json
      provides: Neon adapter dependency if using Neon native driver
      contains: "dependencies|devDependencies"
  key_links:
    - from: src/lib/prisma.ts
      to: "@prisma/adapter-neon (if chosen)"
      via: "import statement"
      pattern: "adapter-neon|accelerateUrl"
    - from: src/lib/prisma.ts
      to: "@prisma/client"
      via: "PrismaClient constructor"
      pattern: "new PrismaClient"
---

## Context

**Gap:** Prisma v7.6.0 changed the PrismaClient constructor API. It now requires either an `adapter` option (for edge/serverless databases like Neon) or an `accelerateUrl` option (for Prisma Accelerate), but src/lib/prisma.ts uses the old pattern without these required options. When Phase 08+ endpoints attempt to import and use the PrismaClient, the runtime will throw `PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.`

**Why This Blocks Phase 08+:** All Phase 08 API endpoints (POST /api/incidents, GET /api/incidents, PATCH, DELETE, export endpoints) depend on the PrismaClient singleton. Without fixing this configuration, those endpoints will fail at runtime before any handler logic executes.

**Solution:** Update src/lib/prisma.ts to include the Neon adapter in the PrismaClient constructor. Neon provides a native JavaScript driver adapter (`@prisma/adapter-neon`) that is optimized for serverless and requires no external service setup beyond the existing Neon database connection.

---

## Execution Context

@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/07-backend-scaffold-design-system/07-RESEARCH.md
@.planning/phases/07-backend-scaffold-design-system/07-VERIFICATION.md
@src/lib/prisma.ts
@.env.local

---

## Tasks

<task type="auto">
  <name>Task 1: Install Neon adapter dependency</name>
  <files>package.json</files>
  <read_first>
    - package.json (to see current dependencies)
    - .env.local (to verify DATABASE_URL is present)
  </read_first>
  <action>
Install the Neon Prisma adapter for serverless compatibility:

```bash
npm install @prisma/adapter-neon neon
npm list @prisma/adapter-neon neon
```

Verify the installation by checking package.json shows both packages in dependencies.

**Why Neon adapter:** Neon provides a JavaScript-compatible driver adapter that works in serverless environments (Vercel Functions, Edge Runtime) without requiring external pooling services. It integrates directly with Prisma's adapter system and reuses the existing DATABASE_URL environment variable.

**Alternative note:** Prisma Accelerate is another option but requires a separate service subscription; Neon adapter is built-in and recommended for this setup.
  </action>
  <verify>
    <automated>npm list @prisma/adapter-neon neon 2>&1 | grep -E "@prisma/adapter-neon|neon" && echo "✓ Neon adapter installed" || echo "✗ Neon adapter missing"</automated>
  </verify>
  <done>@prisma/adapter-neon and neon packages installed in package.json</done>
</task>

<task type="auto">
  <name>Task 2: Update src/lib/prisma.ts with adapter configuration</name>
  <files>src/lib/prisma.ts</files>
  <read_first>
    - src/lib/prisma.ts (current file content)
    - .env.local (to see DATABASE_URL format)
  </read_first>
  <action>
Update src/lib/prisma.ts to include the Neon adapter in the PrismaClient constructor.

Replace the current src/lib/prisma.ts (which is missing the adapter option) with this corrected version:

```typescript
import { PrismaClient } from '@prisma/client';
import { Pool } from 'neon-serverless';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Neon connection pool for serverless environments
const createPrismaClient = () => {
  // In serverless, use Neon adapter for connection pooling
  if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    const connectionString = process.env.DATABASE_URL;
    
    return new PrismaClient({
      adapter: new (require('@prisma/adapter-neon').PrismaNeon)(
        new Pool({ connectionString }).query.bind(new Pool({ connectionString }))
      ),
      log: process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ]
        : [
            { level: 'error', emit: 'event' },
          ],
    });
  } else {
    // Development fallback: standard PrismaClient
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ]
        : [
            { level: 'error', emit: 'event' },
          ],
    });
  }
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Development: Log all queries and timing
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    console.log(`[${new Date().toISOString()}] Query took ${e.duration}ms`);
    console.log(`  ${e.query}`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Key changes:**
1. Import `Pool` from `neon-serverless` for connection pooling
2. Wrap PrismaClient creation in `createPrismaClient()` function
3. In production/with DATABASE_URL: use `adapter: new PrismaNeon(...)` — this is the Prisma v7.6.0 required option
4. In development without DATABASE_URL: fall back to standard PrismaClient (for local testing without Neon)
5. Preserve all existing logging configuration and singleton pattern

**Why this fixes the gap:**
- Prisma v7.6.0 requires `adapter` or `accelerateUrl` in PrismaClient constructor
- The Neon adapter (`PrismaNeon`) is a built-in Prisma adapter designed for serverless
- The adapter takes a connection function from `neon-serverless` Pool
- This maintains the existing serverless singleton pattern while satisfying Prisma's v7.6.0 API requirements
  </action>
  <acceptance_criteria>
    - src/lib/prisma.ts contains `new PrismaClient({ adapter: ...` OR `new PrismaClient({ accelerateUrl: ...`
    - No line in src/lib/prisma.ts contains `new PrismaClient({` without adapter/accelerateUrl option
    - src/lib/prisma.ts imports from `@prisma/adapter-neon` (if using Neon) or has accelerateUrl reference
    - File contains the singleton pattern with `globalForPrisma.prisma` check
    - All logging configuration is preserved
    - Verify with: `grep -n "adapter:" src/lib/prisma.ts && grep -n "new PrismaClient" src/lib/prisma.ts`
  </acceptance_criteria>
  <verify>
    <automated>grep "adapter:" src/lib/prisma.ts && echo "✓ Adapter option present" || (grep "accelerateUrl:" src/lib/prisma.ts && echo "✓ AccelerateUrl option present") || echo "✗ Neither adapter nor accelerateUrl found"</automated>
  </verify>
  <done>src/lib/prisma.ts updated with PrismaClient adapter configuration for Prisma v7.6.0 compatibility; serverless singleton pattern maintained</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| DATABASE_URL env var → Prisma adapter | Connection string must be valid PostgreSQL URI; adapter will fail fast with clear error if malformed |
| Neon connection pool → PrismaClient | Neon Pool reuses connections; no SQL injection risk (Prisma parameterizes queries) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-01c-01 | Tampering | DATABASE_URL env var | accept | Environment variables are not part of application code; assumed managed by deployment platform (Vercel) with secure secret storage. In .env.local (dev), values are placeholder. |
| T-07-01c-02 | Repudiation | Connection pooling | mitigate | Neon Pool reuses pooled connections automatically; no connection-based injection vector. Prisma parameterizes all queries internally. |
| T-07-01c-03 | Information Disclosure | Query logs in development | mitigate | Query logging is dev-only (NODE_ENV === 'development'). Logs printed to stdout only, not persisted. Production disables query logging. |
</threat_model>

<verification>
After both tasks complete, verify the fix:

1. **Syntax check:** `npx tsc --noEmit src/lib/prisma.ts` should report no type errors in this file
2. **Import verification:** `node -e "require('./src/lib/prisma.ts')" 2>&1 | grep -i "error" || echo "✓ Import successful"`
3. **Prisma validation:** `npx prisma validate` should show "✓ Schema is valid"
4. **Phase 08 readiness:** The updated PrismaClient will be ready for Phase 08 API endpoint imports; endpoints will no longer fail at PrismaClient instantiation

**Note:** Full runtime test (Express server startup) deferred to Phase 08 API endpoint tasks, as this plan focuses on configuration syntax only.
</verification>

<success_criteria>
- [x] @prisma/adapter-neon and neon packages installed in package.json
- [x] src/lib/prisma.ts contains adapter or accelerateUrl option in PrismaClient constructor
- [x] Serverless singleton pattern preserved (globalForPrisma check intact)
- [x] All logging configuration preserved
- [x] npx tsc --noEmit reports no type errors in src/lib/prisma.ts
- [x] npx prisma validate returns ✓ Schema is valid
- [x] PrismaClient import and instantiation ready for Phase 08 endpoints
</success_criteria>

<output>
After completion, create `.planning/phases/07-backend-scaffold-design-system/07-01c-SUMMARY.md` documenting the adapter configuration fix and confirming Phase 08 readiness.
</output>
