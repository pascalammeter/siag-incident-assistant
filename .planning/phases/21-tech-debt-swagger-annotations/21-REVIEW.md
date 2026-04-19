---
phase: 21
reviewed: 2026-04-19T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/app/api/incidents/[id]/export/pdf/route.ts
  - src/app/api/incidents/[id]/export/json/route.ts
  - src/__tests__/integration/swagger.integration.test.ts
findings:
  critical: 1
  warning: 1
  info: 2
  total: 4
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-04-19
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 21 adds @swagger JSDoc blocks to export routes for OpenAPI specification integration. The implementation is largely sound with correct endpoint documentation and proper content-type handling. However, one critical security issue was identified in the JSON export route regarding input validation, and one warning about incomplete error handling in the PDF route.

## Critical Issues

### CR-01: Missing API Key Validation in PDF Export Route

**File:** `src/app/api/incidents/[id]/export/pdf/route.ts:74-76`

**Issue:** The PDF export route validates API keys via `validateApiKey(request)`, but this validation is only enforced for cross-origin requests. Same-origin requests skip validation entirely. The JSDoc comment at line 6 states "Requires X-API-Key header for cross-origin requests," which is correct, but this creates a potential security gap: an authenticated user could download PDFs for any incident ID by making same-origin requests, bypassing audit trails that depend on API key logging.

Additionally, there is no validation that the authenticated user has permission to access the specific incident being exported. The route fetches an incident by ID without checking the requester's access permissions.

**Fix:**
Add explicit permission check after fetching the incident:
```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Fetch incident from database
    const incident = await IncidentService.getIncidentById(id);
    if (!incident) {
      return errorResponse('Incident not found', 404);
    }

    // Add: Check if user has permission to access this incident
    // (pending implementation of authorization layer)
    // const hasAccess = await checkIncidentAccess(request, incident);
    // if (!hasAccess) {
    //   return errorResponse('Forbidden: No access to this incident', 403);
    // }

    let page;
    // ... rest of code
  }
}
```

**Note:** This requires implementing an authorization layer. For now, document this as a known limitation and add a TODO comment.

## Warnings

### WR-01: Incomplete Error Handling in PDF Generation

**File:** `src/app/api/incidents/[id]/export/pdf/route.ts:88-123`

**Issue:** The PDF generation code has a try-finally block that closes the page resource, but errors thrown by `page.setContent()` or `page.pdf()` are not caught or logged individually. If Puppeteer encounters a network error or rendering failure, the generic catch block at line 124 logs "Failed to generate PDF" without distinguishing between:
- Invalid HTML causing render failure
- Network timeout
- Puppeteer process crash
- Page memory exhaustion

This makes debugging difficult and obscures whether the issue is transient (retry-able) or permanent (requires incident data fix).

**Fix:**
Add more granular error handling and logging:
```typescript
try {
  const browser = await getBrowserInstance();
  page = await browser.newPage();

  const htmlContent = generateCompletePDF(incident);

  try {
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  } catch (htmlError) {
    console.error('[PDF setContent] HTML rendering failed:', htmlError);
    throw new Error('PDF_HTML_RENDER_ERROR');
  }

  try {
    pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });
  } catch (pdfError) {
    console.error('[PDF generation] Puppeteer PDF creation failed:', pdfError);
    throw new Error('PDF_GENERATION_ERROR');
  }

  // ... filename logic
  return new Response(pdfBuffer, { ... });
} catch (error) {
  const errorType = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  console.error(
    `[GET /api/incidents/:id/export/pdf] Failed to generate PDF [${errorType}]:`,
    error
  );
  return errorResponse('Failed to generate PDF', 500);
}
```

## Info

### IN-01: JSDoc Example Uses Hardcoded Test API Key

**File:** `src/app/api/incidents/[id]/export/pdf/route.ts:50` and `src/app/api/incidents/[id]/export/json/route.ts:55`

**Issue:** The x-curl-examples in both @swagger blocks use `sk_test_abc123...` as a placeholder API key. While this is clearly a fake key, it could mislead developers into thinking this is a valid test key format. Best practice is to use a more obviously fake value like `sk_test_REPLACE_WITH_YOUR_KEY` or reference a documentation link.

**Fix:**
Update curl examples:
```javascript
x-curl-examples:
  - description: Export incident as PDF
    command: |
      curl -X GET http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf \
        -H "X-API-Key: your_api_key_here" \
        -o incident-report.pdf
```

### IN-02: Incomplete Test Coverage for JSON Route Validation

**File:** `src/__tests__/integration/swagger.integration.test.ts:221-238`

**Issue:** The test at line 221-238 verifies that the JSON endpoint appears in the OpenAPI spec with correct content-type and schema references. However, there is no test that validates:
- The endpoint returns a 400 error when given an invalid UUID
- The endpoint returns a 404 when the incident doesn't exist
- The returned JSON matches the Incident schema
- The Content-Disposition header is set correctly for file download

The swagger.integration.test.ts file tests the spec generation, not the actual endpoint behavior. This is appropriate for a swagger test, but the actual route handler (`src/app/api/incidents/[id]/export/json/route.ts`) should have corresponding unit or integration tests elsewhere.

**Fix:**
Add a separate test file `src/__tests__/integration/incidents-export.integration.test.ts` with actual endpoint tests (or verify these exist in another test file):
```typescript
describe('GET /api/incidents/{id}/export/json', () => {
  it('should return 400 for invalid UUID format', async () => {
    const response = await fetch(`${BASE_URL}/api/incidents/invalid-id/export/json`, {
      headers: { 'X-API-Key': API_KEY },
    });
    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent incident', async () => {
    const fakeId = '550e8400-e29b-41d4-a716-446655440000';
    const response = await fetch(`${BASE_URL}/api/incidents/${fakeId}/export/json`, {
      headers: { 'X-API-Key': API_KEY },
    });
    expect(response.status).toBe(404);
  });

  it('should return JSON with Content-Disposition attachment header', async () => {
    const response = await fetch(`${BASE_URL}/api/incidents/{validId}/export/json`, {
      headers: { 'X-API-Key': API_KEY },
    });
    const disposition = response.headers.get('content-disposition');
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('.json');
  });
});
```

---

_Reviewed: 2026-04-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
