---
phase: 07-backend-scaffold-design-system
plan: 01d
title: Fix Prisma Config Type Definition (prisma.config.ts)
description: Update prisma.config.ts to use correct Prisma v7.6.0 configuration API; remove invalid 'directUrl' property
type: execute
wave: 1
depends_on: []
files_modified:
  - prisma.config.ts
autonomous: true
gap_closure: true
requirements:
  - B1.2
must_haves:
  truths:
    - "prisma.config.ts uses only valid properties from Prisma v7.6.0 defineConfig type definition"
    - "TypeScript strict mode compilation succeeds without type errors in prisma.config.ts"
    - "Prisma schema validation passes (npx prisma validate)"
    - "Database connection configuration works for both migrations (direct) and application runtime (pooled)"
  artifacts:
    - path: prisma.config.ts
      provides: Valid Prisma v7.6.0 configuration (no invalid properties)
      min_lines: 15
    - path: prisma/schema.prisma
      provides: Reference schema with url and directUrl datasource properties (read-only for this task)
      contains: "datasource db"
  key_links:
    - from: prisma.config.ts
      to: .env.local
      via: "process.env[] references"
      pattern: "DATABASE_URL|DIRECT_URL"
    - from: prisma.config.ts
      to: prisma/schema.prisma
      via: "schema path reference"
      pattern: 'schema: "prisma/schema.prisma"'
---

## Context

**Gap:** prisma.config.ts uses `directUrl` property in the `datasource` object, but this property is not recognized by the Prisma v7.6.0 `defineConfig` type definition. This causes TypeScript strict mode builds to fail with error `TS2353: Property 'directUrl' does not exist in type`.

**Why This Blocks Strict Mode:** Phase 7 plan 07-01a sets `"strict": true` in tsconfig.json. With invalid properties in prisma.config.ts, running `npm run type-check` fails, blocking all Phase 08+ development and preventing CI/CD builds from succeeding.

**Root Cause:** The Prisma v7.6.0 configuration API changed from earlier versions. The `defineConfig` function in Prisma 7.6.0 does not accept `directUrl` as a top-level datasource property. The correct approach in Prisma v7.6.0 is to define `url` and `directUrl` inline in the `datasource db` block in `prisma/schema.prisma` using environment variables, not in a separate config file.

**Solution:** Either:
1. **Option A (Recommended):** Remove prisma.config.ts entirely and configure datasource directly in prisma/schema.prisma (current pattern: `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")`)
2. **Option B:** Update prisma.config.ts to use only valid Prisma v7.6.0 properties and move connection string overrides into schema.prisma

This plan implements **Option A** (remove the config file), as it aligns with Prisma's recommended pattern for serverless environments where schema.prisma is the source of truth.

---

## Execution Context

@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/07-backend-scaffold-design-system/07-RESEARCH.md
@.planning/phases/07-backend-scaffold-design-system/07-VERIFICATION.md
@prisma.config.ts
@prisma/schema.prisma
@.env.local

---

## Tasks

<task type="auto">
  <name>Task 1: Verify prisma/schema.prisma has correct datasource configuration</name>
  <files>prisma/schema.prisma</files>
  <read_first>
    - prisma/schema.prisma (to confirm datasource block structure)
    - .env.local (to see DATABASE_URL and DIRECT_URL values)
  </read_first>
  <action>
Read and verify that prisma/schema.prisma has the correct datasource block for Prisma v7.6.0:

**Expected content in prisma/schema.prisma:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Verify:**
```bash
grep -A 4 "datasource db" prisma/schema.prisma
```

The schema.prisma should have both `url` (for application runtime with pooling) and `directUrl` (for migrations) properties. These are valid in prisma/schema.prisma and do NOT require a separate config file in Prisma v7.6.0.

If the datasource block is missing or malformed, fix it to match the above before proceeding.
  </action>
  <verify>
    <automated>grep -A 3 "datasource db" prisma/schema.prisma | grep -E "url|directUrl" | wc -l | grep -E "^2$" && echo "✓ Datasource has both url and directUrl" || echo "✗ Datasource missing url or directUrl"</automated>
  </verify>
  <done>prisma/schema.prisma verified to have correct datasource configuration with url and directUrl properties</done>
</task>

<task type="auto">
  <name>Task 2: Remove invalid prisma.config.ts and verify TypeScript compilation</name>
  <files>prisma.config.ts</files>
  <read_first>
    - prisma.config.ts (to confirm it is the only source of type errors)
    - tsconfig.json (to verify strict mode is enabled)
  </read_first>
  <action>
Remove the prisma.config.ts file, as it is not needed in Prisma v7.6.0 and causes type errors:

```bash
rm prisma.config.ts
```

**Why this is safe:**
- Prisma v7.6.0 reads all necessary configuration from `prisma/schema.prisma`
- The schema file contains the correct `datasource db` block with `url` and `directUrl` pointing to .env.local variables
- No functionality is lost by removing the config file; the schema.prisma takes precedence
- Both Prisma CLI commands (`prisma migrate`, `prisma db push`, etc.) and `@prisma/client` runtime will continue to work

**Verify the fix:**
```bash
# Run TypeScript strict mode check
npm run type-check

# Or manually:
npx tsc --noEmit
```

Should now complete without errors related to prisma.config.ts.

**Also verify Prisma schema:**
```bash
npx prisma validate
```

Should show "✓ Schema is valid 🚀" (or similar success message).
  </action>
  <acceptance_criteria>
    - prisma.config.ts file does not exist (deleted or moved)
    - npx tsc --noEmit succeeds with no type errors mentioning "directUrl"
    - npx prisma validate succeeds
    - npm run type-check exits with status 0 (no errors)
    - Verify with: `! [ -f prisma.config.ts ] && echo "✓ File removed" || echo "✗ File still exists"`
  </acceptance_criteria>
  <verify>
    <automated>
# Check file is removed
! [ -f prisma.config.ts ] && echo "✓ prisma.config.ts removed" || echo "✗ prisma.config.ts still exists"
# Verify TypeScript compilation
npx tsc --noEmit 2>&1 | grep -i "directUrl" && echo "✗ directUrl error still present" || echo "✓ No directUrl type errors"
    </automated>
  </verify>
  <done>prisma.config.ts removed; TypeScript strict mode build succeeds with no type errors</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| prisma/schema.prisma → Prisma CLI | Schema file defines database connection; Prisma CLI reads and validates all configuration from this file only |
| .env.local → Database connection | Environment variables (DATABASE_URL, DIRECT_URL) are loaded by Prisma; no secrets stored in code |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-01d-01 | Tampering | Removed prisma.config.ts | accept | Config file contained no secrets or business logic; only type definition errors. Removal simplifies the codebase and aligns with Prisma v7.6.0 best practices. |
| T-07-01d-02 | Information Disclosure | DATABASE_URL / DIRECT_URL in .env.local | mitigate | Environment variables are loaded from .env.local (dev) or Vercel secrets (production). Not exposed in code or git (gitignored). |
</threat_model>

<verification>
After both tasks complete, verify the fix:

1. **File removal:** `[ ! -f prisma.config.ts ] && echo "✓ Removed" || echo "✗ Still exists"`
2. **TypeScript compilation:** `npx tsc --noEmit` (should exit 0, no errors)
3. **Prisma validation:** `npx prisma validate` (should show ✓ Schema is valid)
4. **Type-check script:** `npm run type-check` (should exit 0)

**Impact on other phases:**
- Phase 08 API endpoints will now be able to import and instantiate PrismaClient without type errors
- Prisma migrations (`npm run prisma:migrate`) will use schema.prisma only, which is correct
- Strict mode builds will succeed, allowing CI/CD pipelines to function
</verification>

<success_criteria>
- [x] prisma.config.ts file removed (no longer exists in repository)
- [x] prisma/schema.prisma verified to have correct datasource block with url and directUrl
- [x] npx tsc --noEmit completes without errors (no mention of "directUrl" or prisma.config.ts)
- [x] npx prisma validate returns ✓ Schema is valid
- [x] npm run type-check (TypeScript strict mode) exits with status 0
- [x] No functional impact to Prisma CLI or runtime operations
</success_criteria>

<output>
After completion, create `.planning/phases/07-backend-scaffold-design-system/07-01d-SUMMARY.md` documenting the config type fix and confirming TypeScript strict mode builds will succeed.
</output>
