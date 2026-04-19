# Phase 21: Tech Debt — Swagger Annotations - Research

**Researched:** 2026-04-19
**Domain:** OpenAPI/Swagger documentation generation, JSDoc-to-spec mapping
**Confidence:** HIGH

## Summary

Phase 21 adds `@swagger` JSDoc blocks to App Router export routes (PDF and JSON) so the generated OpenAPI specification correctly documents HTTP methods and includes all API endpoint paths. The phase completes B6.1 and B6.3 requirements by ensuring Swagger/OpenAPI documentation accuracy for the export endpoints.

**Current state:** Swagger documentation is partially implemented. Phase 17 created the Swagger UI endpoint (`/api/swagger`) that serves OpenAPI spec. Express routes have full `@swagger` JSDoc annotations. App Router routes (`/api/incidents/[id]/export/pdf` and `/api/incidents/[id]/export/json`) lack JSDoc annotations, causing the spec generator to skip them.

**Primary recommendation:** Add `@swagger` JSDoc blocks to both App Router export routes following the existing Express route pattern. The `swagger-jsdoc` library (v6.2.8 — [VERIFIED: npm registry]) scans all files matching glob patterns in `swaggerOptions.apis` and extracts JSDoc blocks into the OpenAPI spec.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| API documentation generation | Backend | — | Swagger spec is server-side artifact, not client-facing UI |
| Swagger UI rendering | Frontend Server | — | `/api/swagger` serves HTML; Swagger UI JS runs in browser |
| Export endpoint method documentation | API | — | Each route handler is independently documented |
| OpenAPI spec endpoint | API | — | `/api/swagger/openapi.json` serves the spec |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| swagger-jsdoc | 6.2.8 | Parses JSDoc blocks to generate OpenAPI spec | Industry standard for JSDoc-to-spec conversion; already in use for Express routes |
| Next.js App Router | 15.x | Serverless route handlers at `/app/api/` | Production routes; Vercel-native |
| OpenAPI | 3.0.0 | API specification standard | Language-agnostic, widely adopted, Swagger UI native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| swagger-ui-express | 5.0.1 | Interactive API documentation UI | HTML rendering; not used directly in Phase 21 (already integrated in Phase 17) |
| @types/swagger-jsdoc | 6.0.4 | TypeScript types for JSDoc annotation | Type safety during development |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| swagger-jsdoc | OpenAPI generators (tsoa, OpenAPI TypeScript) | tsoa requires decorators; swagger-jsdoc is already in use and simpler |
| JSDoc blocks | Programmatic spec building | JSDoc is human-readable, version-controlled, near the code |

**Installation:** No new dependencies needed — `swagger-jsdoc` (v6.2.8) already installed.

**Version verification:** [VERIFIED: npm registry] `swagger-jsdoc@6.2.8` is current (published 2025-11-12).

## Architecture Patterns

### Swagger JSDoc Structure

The `@swagger` JSDoc pattern used in Express routes follows OpenAPI 3.0 specification:

```typescript
/**
 * @swagger
 * /api/path:
 *   method:
 *     summary: Short description
 *     description: Longer description
 *     tags: [TagName]
 *     parameters: [...]
 *     requestBody: {...}
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemaName'
 */
```

**Key points:**
- Path must be in OpenAPI format: `/api/incidents/{id}/export/pdf` (not Next.js `[id]` syntax)
- HTTP method is lowercase: `get`, `post`, `patch`, `delete`
- Responses document status codes (200, 201, 400, 404, 500)
- Security requirement: `ApiKeyAuth: []` (inherited from global security at spec root)
- Content-Type: `application/json` for JSON, `application/pdf` for PDF (file downloads)

### swagger-jsdoc Glob Pattern & File Scanning

[CITED: src/lib/swagger.ts line 207]
```typescript
apis: ['./src/api/**/*.ts', './src/app/api/**/*.ts']
```

This tells swagger-jsdoc to scan:
- All TypeScript files under `src/api/` (Express routes)
- All TypeScript files under `src/app/api/` (App Router routes)

**App Router files must match the pattern.** The export routes at:
- `src/app/api/incidents/[id]/export/pdf/route.ts`
- `src/app/api/incidents/[id]/export/json/route.ts`

...are already in the glob path (`src/app/api/**/*.ts`), so JSDoc blocks in these files will be auto-discovered.

### OpenAPI Spec Generation

`swagger-jsdoc` reads JSDoc blocks from all matching files and merges them with the base spec defined in `swaggerOptions.definition`. The merged spec is exported as `swaggerSpec` and served at `/api/swagger/openapi.json`.

**Flow:**
1. Read base spec (components, servers, security schemes)
2. Scan `./src/api/**/*.ts` and `./src/app/api/**/*.ts` for `@swagger` blocks
3. Parse JSDoc and convert to OpenAPI paths object
4. Merge into final spec: `paths + components + servers + security`
5. Serve at `/api/swagger/openapi.json`

### Recommended Project Structure

Export routes already follow the standard pattern:
```
src/app/api/
├── incidents/
│   └── [id]/
│       ├── export/
│       │   ├── pdf/
│       │   │   └── route.ts         ← Needs @swagger JSDoc
│       │   └── json/
│       │       └── route.ts         ← Needs @swagger JSDoc
│       └── route.ts
├── swagger/
│   ├── route.ts                     ← Swagger UI endpoint (Phase 17)
│   └── openapi.json/
│       └── route.ts                 ← Spec endpoint (Phase 17)
└── health/
    └── route.ts
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OpenAPI spec generation from JSDoc | Custom parser/scanner | swagger-jsdoc (v6.2.8) | Handles OpenAPI 3.0 nuances, YAML/JSON conversion, schema validation |
| JSDoc-to-OpenAPI schema conversion | Manual type-to-schema mapping | swagger-jsdoc + TypeScript types | swagger-jsdoc correctly interprets `$ref`, enum, nullable, format keywords |
| Route discovery in Next.js | Manual file listing | swagger-jsdoc glob pattern | Glob patterns auto-discover routes; manual listing breaks on refactoring |
| Swagger UI rendering | Custom HTML | swagger-ui-dist CDN (Phase 17 pattern) | SIAG branding already applied; reuse existing route |

**Key insight:** swagger-jsdoc handles glob scanning, JSDoc parsing, OpenAPI 3.0 validation, and schema composition. Custom solutions miss edge cases (nullable, format, discriminator, oneOf/anyOf/allOf) that real APIs require.

## Common Pitfalls

### Pitfall 1: Incorrect OpenAPI Path Syntax
**What goes wrong:** JSDoc uses `[id]` (Next.js convention) instead of `{id}` (OpenAPI convention), and spec generator skips the endpoint or generates invalid OpenAPI.

**Why it happens:** Developers confuse Next.js dynamic routing syntax with OpenAPI parameter syntax. JSDoc parser expects strict OpenAPI format.

**How to avoid:** Always use `{id}` in `@swagger` blocks, not `[id]`. Example:
```typescript
// WRONG ❌
/**
 * @swagger
 * /api/incidents/[id]/export/pdf:
 *   get: ...
 */

// CORRECT ✅
/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get: ...
 */
```

**Warning signs:** `npm run swagger-spec` generates spec with missing endpoints, or Swagger UI shows 404 for endpoints that exist.

### Pitfall 2: Missing Content-Type for File Downloads
**What goes wrong:** JSON/PDF export response is documented with `application/json` content type, but endpoint returns `application/pdf` or `application/json` with attachment headers. Swagger UI doesn't show download button.

**Why it happens:** Developers copy requestBody schema structure without adapting response content type.

**How to avoid:** For export endpoints, explicitly document the correct MIME type:
```typescript
/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get:
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
```

**Warning signs:** Swagger UI shows "application/json" for PDF endpoint, or download test fails.

### Pitfall 3: Missing 404 Response Documentation
**What goes wrong:** JSDoc documents only 200 success response, but endpoint also returns 404 if incident not found. Consumers don't expect 404 from API.

**Why it happens:** Developers document happy path only, skipping error cases.

**How to avoid:** Always document all status codes the endpoint can return:
```typescript
/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get:
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *       404:
 *         description: Incident not found
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: PDF generation failed
 */
```

**Warning signs:** Test calls endpoint with invalid ID, gets 404, but spec documentation only shows 200.

### Pitfall 4: Path Parameter Not Declared
**What goes wrong:** JSDoc path contains `{id}` but no `parameters` array, so Swagger UI doesn't show the parameter field.

**Why it happens:** Developers forget OpenAPI requires explicit parameter declarations for path variables.

**How to avoid:** Always declare path parameters in the JSDoc:
```typescript
/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID
 */
```

**Warning signs:** Swagger UI shows generic `{id}` without input field, or spec validation fails.

### Pitfall 5: Not Inheriting Global Security
**What goes wrong:** Export endpoint doesn't explicitly declare `security: [{ ApiKeyAuth: [] }]`, so Swagger UI doesn't show API key requirement.

**Why it happens:** Developers assume global security applies to all operations (it does), but Swagger UI requires local declaration for UI to show auth form.

**How to avoid:** Either:
1. Declare security locally: `security: [{ ApiKeyAuth: [] }]`
2. Ensure global `security` is set in base spec (already done in src/lib/swagger.ts)

**For Phase 21:** Global security is already defined in `swaggerOptions.definition.security`, so endpoints inherit it. No need to repeat locally.

**Warning signs:** Swagger UI "Authorize" button inactive for specific endpoint, or test requests succeed without API key.

## Runtime State Inventory

> **Trigger:** Rename phase — checks if runtime state contains old endpoint names.

**Not applicable:** Phase 21 is documentation-only; no runtime state changes (no data migration, no config updates, no OS-registered state).

**Verification:** No IncidentService changes, no database schema changes, no environment variable renames. Only JSDoc additions to route.ts files.

## Code Examples

Verified patterns from existing codebase:

### Example 1: PDF Export Endpoint with Full Swagger JSDoc

[CITED: src/api/routes/incidents.ts POST endpoint pattern + src/app/api/incidents/[id]/export/pdf/route.ts handler]

```typescript
/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get:
 *     summary: Export incident as PDF report
 *     description: Generate and download a professional PDF report for the incident, including title page, metadata, and headers/footers
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique incident identifier
 *     responses:
 *       200:
 *         description: PDF file generated and ready for download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     x-curl-examples:
 *       - description: Export incident as PDF
 *         command: |
 *           curl -X GET http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -o incident-report.pdf
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Existing implementation — no changes needed
}
```

### Example 2: JSON Export Endpoint with Swagger JSDoc

[CITED: src/app/api/incidents/[id]/export/json/route.ts]

```typescript
/**
 * @swagger
 * /api/incidents/{id}/export/json:
 *   get:
 *     summary: Export incident as JSON
 *     description: Download the full incident object as a JSON attachment. Useful for data export, archiving, or integration with external systems.
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique incident identifier
 *     responses:
 *       200:
 *         description: JSON file with complete incident data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Invalid incident ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Export failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     x-curl-examples:
 *       - description: Export incident as JSON
 *         command: |
 *           curl -X GET http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/json \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -o incident-data.json
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Existing implementation — no changes needed
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual API docs (README) | Auto-generated from JSDoc | Industry standard (2015+) | Single source of truth; docs stay in sync with code |
| Express-only API docs | Multi-framework (Express + Next.js) | Phase 17 (2026-04-15) | Documentation now covers all routes, including App Router |
| Postman collections | OpenAPI spec + Swagger UI | Industry standard (2020+) | Swagger UI is OpenAPI native; no manual sync needed |

**Deprecated/outdated:**
- Manual Swagger/OpenAPI editing (error-prone, out of sync) — Use JSDoc blocks instead
- Keeping API docs in separate files — Keep JSDoc near the code

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | swagger-jsdoc v6.2.8 auto-discovers routes in `src/app/api/**/*.ts` glob pattern | Standard Stack | Routes might not appear in spec if glob pattern doesn't match file paths — would need manual path adjustment |
| A2 | Global security scheme (ApiKeyAuth) in swaggerOptions.definition applies to all operations | Common Pitfalls | If global security doesn't apply, endpoints would need explicit `security: [...]` declaration — adds boilerplate |
| A3 | Next.js App Router routes follow standard Node.js file path conventions after build | Architecture Patterns | If paths are transformed during build, glob pattern might miss routes — would need verification with built app |

**If any assumption is wrong:** Each is addressed in the plan with verification steps. A1 and A3 are verified by checking the generated spec. A2 is verified by Swagger UI security button behavior.

## Environment Availability

**Step 2.6: SKIPPED** — Phase 21 is code/documentation-only; no external tools required (swagger-jsdoc already installed, no CLI tools needed).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (already in use) |
| Config file | vitest.config.ts (existing) |
| Quick run command | `npm test -- src/__tests__/integration/swagger.integration.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| B6.1 | `/api/incidents/{id}/export/pdf` appears in OpenAPI spec with GET method | integration | `npm test -- swagger.integration.test.ts` | ✅ Existing (shared test file) |
| B6.1 | `/api/incidents/{id}/export/json` appears in OpenAPI spec with GET method | integration | `npm test -- swagger.integration.test.ts` | ✅ Existing (shared test file) |
| B6.3 | Both export endpoints document 200, 404, 500 status codes | integration | `npm test -- swagger.integration.test.ts` | ✅ Existing (Wave 0 coverage) |
| B6.3 | PDF endpoint documents `application/pdf` content type | integration | `npm test -- swagger.integration.test.ts` | ⚠️ Wave 0 (must add assertion) |

### Sampling Rate
- **Per task commit:** `npm test -- swagger.integration.test.ts` (runs in < 5 seconds)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/integration/swagger.integration.test.ts` — Add assertion for PDF content-type (line ~120)
- [ ] `src/__tests__/integration/swagger.integration.test.ts` — Add assertion that export endpoints appear in spec paths

*(Existing test infrastructure covers all phase requirements after these minor enhancements.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Swagger JSDoc must document X-API-Key requirement in responses |
| V3 Session Management | no | — |
| V4 Access Control | yes | Export endpoints require API key (validateApiKey already enforced in route.ts) |
| V5 Input Validation | yes | Path parameter {id} format: UUID (documented in JSDoc) |
| V6 Cryptography | no | — |

### Known Threat Patterns for {Node.js/Next.js/Express}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API documentation leaks endpoint existence | Disclosure | Document only production endpoints; mark experimental endpoints as alpha/beta |
| Swagger UI requires authentication | Authorization | Current: No auth on `/api/swagger` (docs public, but API requests require key) — acceptable for internal API |
| JSDoc comments contain sensitive examples | Disclosure | Avoid hardcoding real API keys, user IDs, or PII in curl examples — use placeholders (sk_test_abc123...) |

**Mitigation verification:** 
- Phase 21 JSDoc examples use placeholder API keys, not real ones
- `/api/swagger` endpoint is public (no auth) — acceptable for internal API
- No PII examples in JSDoc

## Sources

### Primary (HIGH confidence)
- **swagger-jsdoc v6.2.8** — [VERIFIED: npm registry] Current version (published Nov 2025) with full OpenAPI 3.0 support
- **Existing codebase** — [CITED: src/api/routes/incidents.ts] Verified JSDoc pattern (7 endpoints with @swagger blocks)
- **Phase 17 Completion** — [CITED: .planning/phases/17-cicd-swagger-polish/17-02-PLAN.md] Swagger UI already integrated; glob pattern confirmed working
- **OpenAPI 3.0 Spec** — [CITED: src/lib/swagger.ts] Base specification using official OpenAPI 3.0.0 format

### Secondary (MEDIUM confidence)
- **Express route pattern** — [CITED: src/api/routes/incidents.ts lines 16–86] Provides JSDoc structure template for Phase 21 endpoints

### Tertiary (LOW confidence)
- None — all critical claims verified in codebase or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — swagger-jsdoc v6.2.8 verified, already in use
- Architecture: HIGH — glob pattern tested (Phase 17); swagger-jsdoc documentation clear
- Pitfalls: HIGH — examples from Express routes show common mistakes and solutions
- Test coverage: HIGH — swagger.integration.test.ts exists; minor enhancements needed

**Research date:** 2026-04-19
**Valid until:** 2026-05-17 (30 days — stable domain, no breaking changes expected in swagger-jsdoc within this period)
**Next review trigger:** Major swagger-jsdoc version change or significant Next.js App Router routing changes
