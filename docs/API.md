# API Documentation

## Base URL

```
https://siag-incident-assistant.vercel.app/api
```

## Authentication

All mutation endpoints (POST, PATCH, DELETE) require the `X-API-Key` header:

```bash
curl -H "X-API-Key: sk_test_your_key" \
  https://siag-incident-assistant.vercel.app/api/incidents
```

Same-origin requests (browser to localhost) bypass key validation.

## Endpoints

### Health Check

```http
GET /api/health
```

No authentication required. Returns server status.

```json
{ "status": "ok" }
```

### List Incidents

```http
GET /api/incidents?limit=10&offset=0&status=open&type=ransomware
```

**Query Parameters:**
- `limit` (default: 10) — max 100
- `offset` (default: 0) — pagination
- `status` — filter by `open`, `resolved`, `archived`
- `type` — filter by incident type

**Response:** Paginated incident array with metadata.

### Create Incident

```http
POST /api/incidents
X-API-Key: sk_test_...
Content-Type: application/json

{
  "title": "Ransomware Attack",
  "incident_type": "ransomware",
  "description": "Detected on workstations",
  "severity": "KRITISCH"
}
```

**Response:** Created incident object with `id`.

### Get Incident

```http
GET /api/incidents/{id}
```

Returns full incident details including export status.

### Update Incident

```http
PATCH /api/incidents/{id}
X-API-Key: sk_test_...
Content-Type: application/json

{ "status": "resolved" }
```

### Delete Incident

```http
DELETE /api/incidents/{id}
X-API-Key: sk_test_...
```

Soft-delete (marks as archived, doesn't remove data).

### Export as JSON

```http
GET /api/incidents/{id}/export/json
```

Returns incident data as downloadable JSON file.

### Export as PDF

```http
GET /api/incidents/{id}/export/pdf
```

Returns incident report as PDF (requires PDF generation service).

### OpenAPI / Swagger

```http
GET /api/swagger
GET /api/swagger/openapi.json
```

Interactive API documentation (Swagger UI) and OpenAPI schema.

## Error Codes

See [API_ERROR_CODES.md](API_ERROR_CODES.md) for detailed error responses.

Common errors:
- `400` — Validation error (check request payload)
- `401` — Missing or invalid API key
- `404` — Incident not found
- `500` — Server error (check logs)

## Rate Limiting

Currently disabled. Check `.env` for `RATE_LIMITING_ENABLED` (v1.2+).

## Response Format

All responses (success and error) use JSON:

```json
{
  "data": { ... },
  "error": null,
  "timestamp": "2026-04-21T12:00:00Z"
}
```
