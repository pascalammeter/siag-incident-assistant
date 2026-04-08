<!-- generated-by: gsd-doc-writer -->
# SIAG Incident Management API

REST API for Swiss critical infrastructure incident management, classification, and regulatory response. Built with Express.js and served as a Vercel serverless function.

Interactive API documentation is available via Swagger UI at `/api-docs` when running the backend server.

---

## Authentication

All API endpoints under `/api/` require an API key passed in the `X-API-Key` request header. Keys are compared using constant-time comparison to prevent timing attacks.

```
X-API-Key: sk_test_your_secret_key_here_min_32_chars
```

The API key is configured via the `API_KEY` environment variable. Development keys conventionally use the `sk_test_` prefix; production keys use `sk_live_`. See [CONFIGURATION.md](CONFIGURATION.md) for setup instructions.

**Unauthorized response (HTTP 401):**

```json
{
  "error": "Unauthorized: Invalid or missing API key"
}
```

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000` |
| Production | <!-- VERIFY: confirm production base URL --> `https://siag-incident-assistant.vercel.app` |

The backend Express server is started with `npm run dev:backend` (uses `src/api/index.ts`). The Next.js frontend runs separately via `npm run dev`. Both can be started together with `npm run dev:all`.

---

## Endpoints Overview

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/health` | Server health check | No |
| `GET` | `/api-docs` | Swagger UI (interactive docs) | No |
| `GET` | `/api-docs/json` | OpenAPI 3.0 spec as JSON | No |
| `POST` | `/api/incidents` | Create a new incident | Yes |
| `GET` | `/api/incidents` | List incidents with filtering and pagination | Yes |
| `GET` | `/api/incidents/:id` | Get a single incident by UUID | Yes |
| `PATCH` | `/api/incidents/:id` | Partially update an incident | Yes |
| `DELETE` | `/api/incidents/:id` | Soft-delete an incident | Yes |
| `POST` | `/api/incidents/:id/export/json` | Export incident as a downloadable JSON file | Yes |
| `POST` | `/api/incidents/:id/export/pdf` | Export incident as a downloadable PDF report | Yes |

---

## Request / Response Formats

All request bodies and responses use `application/json`. The server accepts a maximum body size of 10 MB.

### Incident Object

The full Incident object returned by create, read, and update operations:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T14:30:00.000Z",
  "erkennungszeitpunkt": "2026-04-07T14:30:00.000Z",
  "erkannt_durch": "SOC monitoring alert",
  "betroffene_systeme": ["Exchange", "SharePoint", "File Server"],
  "erste_erkenntnisse": "Detected encrypted files with .locked extension",
  "incident_type": "ransomware",
  "severity": "critical",
  "q1": 1,
  "q2": 0,
  "q3": null,
  "playbook": {
    "checkedSteps": [
      {
        "stepId": "ransomware_01_isolate",
        "checked": true,
        "timestamp": "2026-04-07T14:45:00.000Z"
      }
    ],
    "status": "in_progress"
  },
  "regulatorische_meldungen": {
    "isg_24h": "2026-04-08T14:30:00.000Z",
    "dsg": false,
    "finma_24h": null,
    "finma_72h": null
  },
  "metadata": {
    "tags": ["external", "in-investigation"],
    "notes": "Coordinating with CERT-Bund",
    "custom_fields": {}
  }
}
```

**Field reference:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string (uuid)` | Unique identifier |
| `createdAt` | `string (date-time)` | Record creation timestamp |
| `updatedAt` | `string (date-time)` | Last update timestamp |
| `erkennungszeitpunkt` | `string (date-time)` | When the incident was detected |
| `erkannt_durch` | `string (max 255)` | Who or what detected the incident |
| `betroffene_systeme` | `string[]` | List of affected systems |
| `erste_erkenntnisse` | `string \| null` | Initial findings/observations |
| `incident_type` | `enum` | `ransomware`, `phishing`, `ddos`, `data_loss`, `other` |
| `severity` | `enum` | `critical`, `high`, `medium`, `low` |
| `q1`, `q2`, `q3` | `0 \| 1 \| null` | Classification questions (wizard answers) |
| `playbook` | `object \| null` | Playbook step progress tracking |
| `regulatorische_meldungen` | `object \| null` | Regulatory deadline timestamps (ISG, DSG, FINMA) |
| `metadata` | `object \| null` | Tags, notes, and custom fields |

### Create Incident Request Body

`POST /api/incidents` — validated by Zod (`CreateIncidentInputSchema`):

```json
{
  "incident_type": "ransomware",
  "severity": "critical",
  "description": "Optional extended description (10–5000 chars)",
  "playbook": {},
  "regulatorische_meldungen": {},
  "metadata": {}
}
```

**Required fields:** `incident_type`, `severity`

### List Incidents Query Parameters

`GET /api/incidents` — all parameters are optional:

| Parameter | Type | Default | Constraints | Description |
|-----------|------|---------|-------------|-------------|
| `type` | `string` | — | enum | Filter by incident type |
| `severity` | `string` | — | enum | Filter by severity level |
| `page` | `integer` | `1` | `>= 1` | Page number (1-indexed) |
| `limit` | `integer` | `10` | `1–50` | Items per page (max 50) |

**Response envelope:**

```json
{
  "data": [ /* Incident[] */ ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

## Error Codes

All error responses share the same shape:

```json
{
  "error": "Error message string",
  "details": [
    {
      "field": "incident_type",
      "message": "Invalid enum value"
    }
  ]
}
```

`details` is an array of field-level Zod validation errors (empty array for non-validation errors).

| HTTP Status | Meaning |
|-------------|---------|
| `200 OK` | Success (GET, PATCH) |
| `201 Created` | Incident created (POST /api/incidents) |
| `204 No Content` | Incident deleted (DELETE) |
| `400 Bad Request` | Validation failed (invalid enum, missing required field, out-of-range limit) |
| `401 Unauthorized` | Missing or invalid `X-API-Key` header |
| `404 Not Found` | Incident UUID does not exist |
| `500 Internal Server Error` | Unhandled server error (database unavailable, PDF generation failed) |

### Validation Error Example

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "incident_type",
      "message": "Invalid enum value. Expected 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other', received 'breach'"
    },
    {
      "field": "severity",
      "message": "Required"
    }
  ]
}
```

---

## Rate Limits

Rate limiting is not active in the current release (v1.0). The `express-rate-limit` package is installed as a dev dependency. The `.env.example` includes the commented-out flag `RATE_LIMITING_ENABLED=false` for a planned v1.2 feature.

<!-- VERIFY: confirm rate limiting status in production and update if enabled -->

---

## Endpoint Reference

### `GET /health`

Health check. No authentication required.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-09T10:00:00.000Z"
}
```

---

### `POST /api/incidents`

Create a new incident.

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_your_key" \
  -d '{
    "incident_type": "ransomware",
    "severity": "critical",
    "erkennungszeitpunkt": "2026-04-07T14:30:00Z",
    "erkannt_durch": "SOC monitoring",
    "betroffene_systeme": ["Exchange", "SharePoint"]
  }'
```

Returns the created `Incident` object with HTTP `201`.

---

### `GET /api/incidents`

List incidents with optional filtering and pagination.

```bash
# All incidents
curl http://localhost:3000/api/incidents \
  -H "X-API-Key: sk_test_your_key"

# Filter: critical severity, page 2, 20 per page
curl "http://localhost:3000/api/incidents?severity=critical&page=2&limit=20" \
  -H "X-API-Key: sk_test_your_key"
```

---

### `GET /api/incidents/:id`

Retrieve a specific incident by UUID.

```bash
curl http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-API-Key: sk_test_your_key"
```

---

### `PATCH /api/incidents/:id`

Partially update an incident. All fields are optional.

```bash
curl -X PATCH http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_your_key" \
  -d '{"severity": "medium"}'
```

---

### `DELETE /api/incidents/:id`

Soft-delete an incident. The record is retained in the database with `deletedAt` set (for audit purposes) but no longer appears in list results.

```bash
curl -X DELETE http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-API-Key: sk_test_your_key"
```

Returns HTTP `204 No Content` on success.

---

### `POST /api/incidents/:id/export/json`

Download an incident as a formatted JSON file (`application/json`).

```bash
curl -X POST http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/json \
  -H "X-API-Key: sk_test_your_key" \
  -o incident_550e8400.json
```

---

### `POST /api/incidents/:id/export/pdf`

Generate and download a PDF incident report (`application/pdf`). The PDF is generated using Puppeteer (headless Chromium) and includes incident details, classification, playbook checklist, and regulatory deadlines. Allow 2–5 seconds for generation.

```bash
curl -X POST http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf \
  -H "X-API-Key: sk_test_your_key" \
  -o incident_550e8400.pdf
```

---

## Related Documentation

- [CONFIGURATION.md](CONFIGURATION.md) — Environment variables including `API_KEY` setup
- [docs/API_ERROR_CODES.md](API_ERROR_CODES.md) — Extended error code reference
- `/api-docs` — Interactive Swagger UI (available when backend is running)
- `/api-docs/json` — OpenAPI 3.0 specification as JSON
