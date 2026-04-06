# Phase 7: Gap Closure Planning Summary

**Date:** 2026-04-07
**Mode:** Gap Closure
**Plans Created:** 2 (07-01c, 07-01d)
**Gaps Addressed:** 2 critical configuration issues
**Status:** Ready for execution

---

## Overview

Phase 7 execution was verified on 2026-04-07 and identified 2 critical gaps preventing Phase 08 API endpoint implementation. Both gaps are Prisma v7.6.0 configuration issues that cause runtime failures and TypeScript strict mode build errors.

**Blocking Status:** Phase 08 cannot proceed until both gaps are resolved.

**Resolution:** Two focused gap-closure plans created to fix configuration issues in parallel (Wave 1).

---

## Gaps Identified

### Gap 1: PrismaClient Missing Adapter Configuration

**Severity:** CRITICAL 🛑

**File:** src/lib/prisma.ts

**Issue:** Prisma v7.6.0 changed the PrismaClient constructor API. It now requires either:
- `adapter` option (for serverless databases like Neon)
- `accelerateUrl` option (for Prisma Accelerate)

Current implementation in src/lib/prisma.ts uses old pattern without these required options.

**Impact:** When Phase 08 API endpoints attempt to import PrismaClient, the runtime throws:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

**All Phase 08+ endpoints blocked** until fixed.

**Verification Evidence:**
- VERIFICATION.md Truth #6: "PrismaClient can be instantiated and used in Phase 08+ endpoints" — FAILED
- Status: partial (PrismaClient imports correctly, but constructor throws at runtime)

**Gap Closure Plan:** 07-01c

---

### Gap 2: Invalid Prisma Config Type Definition

**Severity:** CRITICAL 🛑

**File:** prisma.config.ts

**Issue:** prisma.config.ts uses `directUrl` property in the datasource configuration object:

```typescript
datasource: {
  url: process.env["DATABASE_URL"],
  directUrl: process.env["DIRECT_URL"],  // ← Invalid property
}
```

However, Prisma v7.6.0's `defineConfig` type definition does not recognize `directUrl` as a valid property. This causes TypeScript strict mode compilation to fail:

```
error TS2353: Property 'directUrl' does not exist in type
```

**Impact:** TypeScript strict mode builds fail, blocking:
- CI/CD pipelines (tests cannot run)
- IDE type checking
- Phase 08+ development

**Verification Evidence:**
- VERIFICATION.md Truth #2: "TypeScript strict mode enabled and builds without errors" — PARTIAL
- Anti-pattern: `prisma.config.ts | 13 | directUrl property invalid per Prisma v7.6.0 type | BLOCKER`
- Test: `npx tsc --noEmit` fails with TS2353 error

**Root Cause:** Prisma v7.6.0 configuration API changed. The correct pattern is to define `url` and `directUrl` directly in the `datasource db` block of `prisma/schema.prisma`, not in a separate config file.

**Gap Closure Plan:** 07-01d

---

## Gap Closure Plans

### Plan 07-01c: Fix PrismaClient Adapter Configuration

**Objective:** Update src/lib/prisma.ts to include required adapter option for Prisma v7.6.0 serverless compatibility.

**Wave:** 1 (parallel with 07-01d)
**Autonomous:** Yes
**Files Modified:** src/lib/prisma.ts, package.json
**Estimated Duration:** 15-20 min

**Tasks:**
1. Install @prisma/adapter-neon and neon packages
2. Update src/lib/prisma.ts with Neon adapter in PrismaClient constructor

**Key Changes:**
- Import `Pool` from `neon-serverless`
- Wrap PrismaClient creation in function with adapter option:
  ```typescript
  adapter: new PrismaNeon(
    new Pool({ connectionString }).query.bind(...)
  )
  ```
- Preserve serverless singleton pattern and query logging
- Fall back to standard PrismaClient in development without DATABASE_URL

**Verification:**
- `npm list @prisma/adapter-neon` shows installed
- `grep "adapter:" src/lib/prisma.ts` finds adapter option
- `npx tsc --noEmit` reports no errors in this file
- `npx prisma validate` shows ✓ Schema is valid

**Why This Fixes Gap 1:**
- Prisma v7.6.0 requires adapter or accelerateUrl option in constructor
- PrismaNeon adapter is Prisma's built-in serverless adapter for Neon
- No external service setup needed beyond existing Neon database
- Maintains connection pooling for serverless invocation reuse

---

### Plan 07-01d: Fix Prisma Config Type Definition

**Objective:** Remove prisma.config.ts or update it to use correct Prisma v7.6.0 API; fix TypeScript strict mode build errors.

**Wave:** 1 (parallel with 07-01c)
**Autonomous:** Yes
**Files Modified:** prisma.config.ts (delete)
**Estimated Duration:** 10-15 min

**Tasks:**
1. Verify prisma/schema.prisma has correct datasource block with url and directUrl
2. Remove prisma.config.ts file (not needed in Prisma v7.6.0)

**Key Changes:**
- Delete prisma.config.ts (contains no critical configuration)
- Rely on prisma/schema.prisma for all Prisma configuration:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")    — for runtime (pooled)
    directUrl = env("DIRECT_URL")      — for migrations (direct)
  }
  ```

**Verification:**
- `[ ! -f prisma.config.ts ]` confirms file removed
- `npx tsc --noEmit` reports no type errors (no mention of directUrl)
- `npx prisma validate` shows ✓ Schema is valid
- `npm run type-check` exits with status 0

**Why This Fixes Gap 2:**
- Prisma v7.6.0 reads all configuration from prisma/schema.prisma
- The schema already has correct datasource block with url and directUrl
- No functionality is lost by removing config file
- Simplifies codebase and aligns with Prisma best practices

---

## Execution Strategy

### Wave 1 (Parallel Execution)

Both gap-closure plans execute in parallel (no dependencies):

| Plan | Duration | Start | Dependencies | Blocker |
|------|----------|-------|--------------|---------|
| 07-01c | 15-20 min | Immediate | None | No |
| 07-01d | 10-15 min | Immediate | None | No |

**Total Wave 1 Time:** ~20 minutes (parallel)

### Validation After Completion

After both plans complete, run verification suite:

```bash
# TypeScript strict mode
npm run type-check

# Prisma schema validation
npx prisma validate

# Verify imports work
node -e "require('./src/lib/prisma.ts')" 2>&1 | grep -i error

# Check file removal
[ ! -f prisma.config.ts ] && echo "✓ Config removed" || echo "✗ Still exists"
```

**All checks must pass** before Phase 08 can proceed.

---

## Phase 08 Readiness

After gap closure completion:

✓ PrismaClient singleton ready with correct Prisma v7.6.0 adapter configuration
✓ TypeScript strict mode builds succeed with no config errors
✓ All Phase 7 success criteria met:
  - Express app runs on localhost:3000
  - Prisma connects to PostgreSQL
  - SIAG design tokens applied
  - Swagger UI accessible
✓ Phase 08 API endpoints can now import and use PrismaClient without runtime or compile errors

---

## Decision Coverage Matrix

| Gap | Plan | Task | Coverage | Status |
|-----|------|------|----------|--------|
| 1 (PrismaClient adapter) | 07-01c | 1-2 | FULL | ✓ Addresses all missing configuration |
| 2 (Config type definition) | 07-01d | 1-2 | FULL | ✓ Removes invalid config, verifies schema |

**Scope:** Gaps are isolated configuration fixes; no features deferred, no scope reduction.

---

## Risk Assessment

| Risk | Mitigation | Status |
|------|-----------|--------|
| Adapter installation fails | Plan 07-01c Task 1 includes explicit npm install + verification | Low |
| PrismaClient initialization error | Plan 07-01c Task 2 includes detailed code with fallback logic | Low |
| File removal unintended side effects | Plan 07-01d validates schema before removing config | Low |
| Breaking changes to Prisma CLI | Prisma v7.6.0 CLI reads from schema.prisma only; no breaking changes | Low |

---

## Timeline

- **2026-04-07:** Gap closure plans created (this document)
- **Next:** `/gsd-execute-phase 07 --gaps-only` to run gap-closure plans
- **Estimated completion:** Same day (~20 minutes execution)
- **Phase 08 kickoff:** After gap closure verification

---

## Appendix: Why Both Gaps Exist

Phase 7 was planned before Prisma v7.6.0 was released or before the adapter requirement became mandatory. The initial plan (07-01b) created PrismaClient following older Prisma patterns that worked in v5-v6 but are incompatible with v7.6.0's breaking changes:

1. **PrismaClient adapter requirement:** Prisma v7 introduced a new adapter architecture for serverless/edge environments. The old pattern of `new PrismaClient()` without adapter now requires the adapter option.

2. **Config file deprecation:** Prisma v7.6.0 simplified configuration to rely entirely on `prisma/schema.prisma` (via `datasource db` block). Separate `prisma.config.ts` files are no longer supported with the `defineConfig` API.

Both issues are well-documented in Prisma v7 migration guides but were not caught during Phase 7 planning due to knowledge cutoff or oversight. The verification phase caught them correctly, and gap closure plans fix them cleanly.

---

_Gap Closure Planning Complete_
_Ready for: `/gsd-execute-phase 07 --gaps-only`_
