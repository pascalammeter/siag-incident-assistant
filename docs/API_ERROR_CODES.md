# API Error Codes Reference

**Version:** 1.0  
**Last Updated:** 2026-04-07

## Overview

This document lists all possible error codes returned by the SIAG Incident Management API, with explanations, common causes, and solutions.

## Error Response Format

All error responses follow this JSON structure:

```json
{
  "error": "Error message (human-readable)",
  "details": [
    {
      "field": "field_name (if validation error)",
      "message": "Field-specific error message"
    }
  ]
}
```

---

## HTTP Status Codes

### 200 OK
**Meaning:** Request succeeded

- `GET /api/incidents` — List retrieved
- `GET /api/incidents/{id}` — Incident retrieved
- `POST /api/incidents/{id}/export/json` — JSON exported
- `POST /api/incidents/{id}/export/pdf` — PDF exported

### 201 Created
**Meaning:** Resource created successfully

- `POST /api/incidents` — New incident created

### 204 No Content
**Meaning:** Request succeeded, no response body

- `DELETE /api/incidents/{id}` — Incident soft-deleted

### 400 Bad Request
**Meaning:** Client error; validation or request format issue

See section [400 Bad Request Errors](#400-bad-request-errors) below.

### 401 Unauthorized
**Meaning:** Authentication failed (invalid or missing API key)

See section [401 Unauthorized Errors](#401-unauthorized-errors) below.

### 404 Not Found
**Meaning:** Requested resource not found

See section [404 Not Found Errors](#404-not-found-errors) below.

### 500 Internal Server Error
**Meaning:** Server error; unexpected condition

See section [500 Internal Server Error Errors](#500-internal-server-error-errors) below.

---

## 400 Bad Request Errors

### INVALID_INCIDENT_TYPE

**Message:** `Invalid incident type`

**HTTP Status:** 400

**Cause:**
The `incident_type` field contains a value not in the allowed enum.

**Valid Values:**
- `ransomware`
- `phishing`
- `ddos`
- `data_loss`
- `other`

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "incident_type",
      "message": "Invalid incident type. Must be one of: ransomware, phishing, ddos, data_loss, other"
    }
  ]
}
```

**Solution:**
Ensure `incident_type` is one of the five allowed values. Check for typos or case sensitivity (must be lowercase).

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "incident_type": "ransomware",
    "severity": "critical"
  }'
```

---

### INVALID_SEVERITY

**Message:** `Invalid severity level`

**HTTP Status:** 400

**Cause:**
The `severity` field contains a value not in the allowed enum.

**Valid Values:**
- `critical`
- `high`
- `medium`
- `low`

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "severity",
      "message": "Invalid severity level. Must be one of: critical, high, medium, low"
    }
  ]
}
```

**Solution:**
Ensure `severity` is one of the four allowed values. Check case sensitivity (must be lowercase).

---

### MISSING_REQUIRED_FIELD

**Message:** `Field is required`

**HTTP Status:** 400

**Cause:**
A required field is missing from the request body.

**Required Fields for POST /api/incidents:**
- `incident_type` (required)
- `severity` (required)

**Required Fields for PATCH /api/incidents/{id}:**
None (all fields are optional)

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "incident_type",
      "message": "Required field missing"
    },
    {
      "field": "severity",
      "message": "Required field missing"
    }
  ]
}
```

**Solution:**
Include all required fields in the request body. Refer to [Integration Guide](./INTEGRATION_GUIDE.md) for request schema.

---

### INVALID_FIELD_LENGTH

**Message:** `Field length out of bounds`

**HTTP Status:** 400

**Cause:**
A string field exceeds the length constraints.

**Field Constraints:**
| Field | Min | Max |
|-------|-----|-----|
| `erkannt_durch` | — | 255 chars |
| `erste_erkenntnisse` | 10 | 5000 chars |

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "erste_erkenntnisse",
      "message": "String must be at least 10 characters"
    }
  ]
}
```

**Solution:**
Adjust field length:
- `erste_erkenntnisse` must be 10-5000 characters
- `erkannt_durch` must be under 255 characters

---

### INVALID_ENUM_VALUE

**Message:** `Invalid enum value`

**HTTP Status:** 400

**Cause:**
An enum field (q1, q2, q3) contains a value outside the allowed range.

**Valid Values for q1, q2, q3:**
- `0` (no)
- `1` (yes)
- `null` (not yet answered)

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "q1",
      "message": "Must be 0 or 1"
    }
  ]
}
```

**Solution:**
Only set q1, q2, q3 to 0, 1, or null.

---

### PAYLOAD_TOO_LARGE

**Message:** `Request payload exceeds maximum size`

**HTTP Status:** 400

**Cause:**
The request body exceeds the maximum allowed size (typically 10 MB).

**Solution:**
Reduce payload size:
- Remove unnecessary fields
- Compress large arrays
- Use the export endpoints for large incidents

---

### INVALID_JSON

**Message:** `Invalid JSON in request body`

**HTTP Status:** 400

**Cause:**
The request body contains malformed JSON.

**Example Error:**
```json
{
  "error": "Invalid JSON",
  "details": []
}
```

**Solution:**
Validate JSON syntax:
```bash
echo '{"incident_type": "ransomware"}' | jq .
```

Use JSON linting tools or editors with syntax checking.

---

### INVALID_PAGINATION

**Message:** `Invalid pagination parameters`

**HTTP Status:** 400

**Cause:**
Query parameters for pagination are invalid.

**Valid Values:**
- `page`: integer ≥ 1
- `limit`: integer 1-100

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "limit",
      "message": "Limit must be between 1 and 100"
    }
  ]
}
```

**Solution:**
- Set `page` to 1 or higher
- Set `limit` between 1 and 100

---

## 401 Unauthorized Errors

### INVALID_API_KEY

**Message:** `Invalid API key`

**HTTP Status:** 401

**Cause:**
- API key is missing from `X-API-Key` header
- API key is invalid or revoked
- API key is malformed

**Example Error:**
```json
{
  "error": "Invalid API key",
  "details": []
}
```

**Solution:**

1. **Check header is present:**
   ```bash
   curl -H "X-API-Key: sk_test_abc123..." http://localhost:3000/api/incidents
   ```

2. **Verify API key format:**
   - Development keys start with `sk_test_`
   - Production keys start with `sk_live_`

3. **Get correct API key:**
   - **Development:** Check `.env.local` file
   - **Production:** Go to Vercel dashboard > Environment Variables

4. **Rotate key if compromised:**
   - Generate new key in dashboard
   - Update all integrations
   - Revoke old key

---

### MISSING_API_KEY

**Message:** `X-API-Key header is required`

**HTTP Status:** 401

**Cause:**
Request is missing the `X-API-Key` header entirely.

**Solution:**
Add the header to all requests:
```bash
curl -H "X-API-Key: sk_test_abc123..." http://localhost:3000/api/incidents
```

---

## 404 Not Found Errors

### INCIDENT_NOT_FOUND

**Message:** `Incident not found`

**HTTP Status:** 404

**Cause:**
The incident ID doesn't exist in the database, or the incident has been deleted.

**Example Error:**
```json
{
  "error": "Incident not found",
  "details": []
}
```

**Solution:**

1. **Verify incident ID exists:**
   ```bash
   curl -H "X-API-Key: sk_test_abc123..." \
     http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000
   ```

2. **Check incident wasn't deleted:**
   ```sql
   SELECT * FROM Incident WHERE id = '550e8400-e29b-41d4-a716-446655440000';
   -- If deletedAt is set, incident is soft-deleted
   ```

3. **List all incidents to find correct ID:**
   ```bash
   curl -H "X-API-Key: sk_test_abc123..." \
     http://localhost:3000/api/incidents
   ```

4. **Use correct ID format:**
   Ensure you're using a valid UUID (36 characters, hyphenated).

---

### ENDPOINT_NOT_FOUND

**Message:** `Endpoint not found` (implicit 404)

**HTTP Status:** 404

**Cause:**
The requested endpoint doesn't exist (typo in URL or wrong HTTP method).

**Example:**
```bash
curl http://localhost:3000/api/incident  # ✗ Wrong endpoint (should be /incidents)
```

**Solution:**
Verify the endpoint path and HTTP method against the [Integration Guide](./INTEGRATION_GUIDE.md).

---

## 500 Internal Server Error Errors

### DATABASE_ERROR

**Message:** `Database connection failed`

**HTTP Status:** 500

**Cause:**
- Database is unreachable
- Connection pool exhausted
- Database credentials invalid
- Neon (PostgreSQL) service is down

**Example Error:**
```json
{
  "error": "Database connection failed",
  "details": []
}
```

**Solution:**

1. **Check database connectivity:**
   ```bash
   # Verify DATABASE_URL in .env.local (dev) or Vercel dashboard (prod)
   echo $DATABASE_URL
   ```

2. **Test connection:**
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

3. **Check Neon status:**
   - Visit https://status.neon.tech
   - Verify project is not suspended

4. **Restart server:**
   ```bash
   npm run dev:backend
   ```

5. **Check database logs:**
   - Vercel dashboard > Environment > Logs
   - Look for connection timeout or authentication errors

6. **Retry with exponential backoff:**
   ```javascript
   async function retry(fn, maxAttempts = 3) {
     for (let i = 0; i < maxAttempts; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i < maxAttempts - 1) {
           await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
         } else {
           throw error;
         }
       }
     }
   }
   ```

---

### PDF_GENERATION_ERROR

**Message:** `Failed to generate PDF`

**HTTP Status:** 500

**Cause:**
- Puppeteer (PDF library) failed to render incident
- Out of memory during PDF generation
- Timeout while generating PDF (>30 seconds)
- Invalid incident data prevents rendering

**Example Error:**
```json
{
  "error": "Failed to generate PDF",
  "details": []
}
```

**Solution:**

1. **Check incident data validity:**
   ```bash
   curl -H "X-API-Key: sk_test_abc123..." \
     http://localhost:3000/api/incidents/{id}
   ```

2. **Simplify incident:**
   - Remove very long notes or descriptions
   - Ensure all required fields are present

3. **Retry after delay:**
   ```bash
   # Wait 5 seconds before retrying
   sleep 5 && curl -X POST http://localhost:3000/api/incidents/{id}/export/pdf \
     -H "X-API-Key: sk_test_abc123..."
   ```

4. **Check server memory:**
   - Puppeteer requires ~150-200 MB per PDF instance
   - If server is under heavy load, queue PDF generation

5. **Contact support:**
   - If error persists, provide incident ID for debugging

---

### VALIDATION_ERROR

**Message:** `Validation failed`

**HTTP Status:** 400 or 500 (typically 400)

**Cause:**
Unexpected validation failure (usually indicates a bug in API validation logic).

**Example Error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "unknown_field",
      "message": "Unexpected field"
    }
  ]
}
```

**Solution:**
Check request format against [Integration Guide](./INTEGRATION_GUIDE.md) schema. If error persists, report to development team.

---

### INTERNAL_SERVER_ERROR

**Message:** `Internal server error`

**HTTP Status:** 500

**Cause:**
Unhandled exception in API code (bug or edge case).

**Solution:**

1. **Check server logs:**
   ```bash
   tail -f logs/server.log
   ```

2. **Include error details in bug report:**
   - Request method, URL, headers
   - Request body (if applicable)
   - Error message and timestamp
   - Incident ID if applicable

3. **Try again:**
   - Server errors are often transient
   - Retry after 30 seconds

4. **Contact development team:**
   - Report with reproduction steps

---

## Error Handling Best Practices

### Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry on 4xx errors (except 429 rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      // Retry on 5xx or 429
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
```

### Error Logging

```javascript
function logError(error, context = {}) {
  console.error({
    timestamp: new Date().toISOString(),
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    context,
  });
  
  // Send to monitoring service (Sentry, DataDog, etc.)
  // reportToMonitoring(error, context);
}
```

### User-Friendly Error Messages

```javascript
function getUserMessage(error) {
  const errorMap = {
    'INVALID_INCIDENT_TYPE': 'Please select a valid incident type.',
    'INVALID_SEVERITY': 'Please select a valid severity level.',
    'MISSING_REQUIRED_FIELD': 'Please fill in all required fields.',
    'DATABASE_ERROR': 'Service temporarily unavailable. Please try again in a moment.',
    'PDF_GENERATION_ERROR': 'PDF generation failed. Please try again.',
    'INVALID_API_KEY': 'Authentication failed. Please check your API key.',
  };
  
  return errorMap[error.code] || 'An unexpected error occurred. Please try again.';
}
```

---

## Summary Table

| Status | Code | Message | Cause | Solution |
|--------|------|---------|-------|----------|
| 400 | INVALID_INCIDENT_TYPE | Invalid incident type | Wrong enum value | Use ransomware, phishing, ddos, data_loss, other |
| 400 | INVALID_SEVERITY | Invalid severity | Wrong enum value | Use critical, high, medium, low |
| 400 | MISSING_REQUIRED_FIELD | Field is required | Missing incident_type or severity | Provide both fields |
| 400 | INVALID_FIELD_LENGTH | Field length invalid | erste_erkenntnisse not 10-5000 chars | Adjust length |
| 400 | INVALID_ENUM_VALUE | Invalid enum value | q1/q2/q3 not 0/1 | Use 0, 1, or null |
| 400 | PAYLOAD_TOO_LARGE | Payload too large | Request > 10 MB | Reduce payload |
| 401 | INVALID_API_KEY | Invalid API key | Missing or wrong key | Add X-API-Key header |
| 404 | INCIDENT_NOT_FOUND | Incident not found | ID doesn't exist | Verify ID exists |
| 500 | DATABASE_ERROR | Database unavailable | Connection failed | Check database status |
| 500 | PDF_GENERATION_ERROR | PDF generation failed | Puppeteer error | Retry or simplify incident |

For additional help, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) and [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).
