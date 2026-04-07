# SIAG Incident Management API — Integration Guide

**Version:** 1.0  
**Last Updated:** 2026-04-07  
**Stability:** Stable (v1.1 milestone)

## Table of Contents

1. [Authentication](#authentication)
2. [Base URLs](#base-urls)
3. [Endpoints Overview](#endpoints-overview)
4. [Create Incident](#create-incident)
5. [List Incidents](#list-incidents)
6. [Get Incident](#get-incident)
7. [Update Incident](#update-incident)
8. [Delete Incident](#delete-incident)
9. [Export Incident](#export-incident)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)
12. [Code Examples](#code-examples)

---

## Authentication

All API requests require an **API Key** passed in the `X-API-Key` header.

### Getting Your API Key

**Development:**
Copy from `.env.local`:
```bash
API_KEY=sk_test_your_key_here
```

**Production:**
Get from Vercel Environment Variables dashboard:
```bash
https://vercel.com/siag-incident-assistant/settings/environment-variables
```

### Authentication Header Example

```bash
curl -H "X-API-Key: sk_test_abc123..." \
  https://siag-incident-assistant.vercel.app/api/incidents
```

### Key Rotation (Planned v1.2)

Currently, keys do not expire. For v1.2, implement:
1. Generate new key in dashboard
2. Update all integrations to use new key
3. Revoke old key after 30-day grace period

---

## Base URLs

### Development
```
http://localhost:3000/api
```
Requires local server running:
```bash
npm run dev:backend
```

### Production
```
https://siag-incident-assistant.vercel.app/api
```

### API Documentation (Swagger UI)
```
GET /api-docs

Development: http://localhost:3000/api-docs
Production:  https://siag-incident-assistant.vercel.app/api-docs
```

---

## Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/incidents` | Create new incident |
| `GET` | `/incidents` | List incidents (with filtering & pagination) |
| `GET` | `/incidents/{id}` | Retrieve specific incident |
| `PATCH` | `/incidents/{id}` | Update incident (partial) |
| `DELETE` | `/incidents/{id}` | Delete incident (soft delete) |
| `POST` | `/incidents/{id}/export/json` | Export incident as JSON |
| `POST` | `/incidents/{id}/export/pdf` | Export incident as PDF |

---

## Create Incident

Creates a new incident and returns the full incident object.

### Request

```http
POST /api/incidents
Content-Type: application/json
X-API-Key: sk_test_abc123...

{
  "incident_type": "ransomware",
  "severity": "critical",
  "erkennungszeitpunkt": "2026-04-07T14:30:00Z",
  "erkannt_durch": "SOC monitoring alert",
  "betroffene_systeme": ["Exchange", "SharePoint"],
  "erste_erkenntnisse": "Detected encrypted files with .locked extension",
  "playbook": {
    "checkedSteps": [],
    "status": "in_progress"
  },
  "metadata": {
    "tags": ["external-threat"],
    "notes": "Initial assessment completed"
  }
}
```

### Required Fields

- `incident_type` (string, enum): One of: `ransomware`, `phishing`, `ddos`, `data_loss`, `other`
- `severity` (string, enum): One of: `critical`, `high`, `medium`, `low`

### Optional Fields

- `erkennungszeitpunkt` (ISO 8601): When incident was detected (default: now)
- `erkannt_durch` (string, max 255): How incident was detected
- `betroffene_systeme` (string[]): Affected systems
- `erste_erkenntnisse` (string, 10-5000 chars): Initial findings
- `playbook` (object): Playbook progress tracking
- `metadata` (object): Custom fields and tags

### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-04-07T14:30:00.000Z",
  "updatedAt": "2026-04-07T14:30:00.000Z",
  "deletedAt": null,
  "incident_type": "ransomware",
  "severity": "critical",
  "erkennungszeitpunkt": "2026-04-07T14:30:00.000Z",
  "erkannt_durch": "SOC monitoring alert",
  "betroffene_systeme": ["Exchange", "SharePoint"],
  "erste_erkenntnisse": "Detected encrypted files with .locked extension",
  "q1": null,
  "q2": null,
  "q3": null,
  "playbook": {
    "checkedSteps": [],
    "status": "in_progress"
  },
  "regulatorische_meldungen": {
    "isg_24h": "2026-04-08T14:30:00.000Z",
    "dsg": false,
    "finma_24h": null,
    "finma_72h": null
  },
  "metadata": {
    "tags": ["external-threat"],
    "notes": "Initial assessment completed"
  }
}
```

### Example Payloads

#### Ransomware Incident
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "incident_type": "ransomware",
    "severity": "critical",
    "erkennungszeitpunkt": "2026-04-07T14:30:00Z",
    "erkannt_durch": "SOC monitoring",
    "betroffene_systeme": ["Exchange", "SharePoint"],
    "erste_erkenntnisse": "Encrypted files detected"
  }'
```

#### Phishing Incident
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "incident_type": "phishing",
    "severity": "high",
    "erkennungszeitpunkt": "2026-04-07T10:00:00Z",
    "erkannt_durch": "User report",
    "betroffene_systeme": ["Email"],
    "erste_erkenntnisse": "Suspicious email from support@company-clone.com"
  }'
```

#### DDoS Incident
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "incident_type": "ddos",
    "severity": "medium",
    "erkennungszeitpunkt": "2026-04-07T09:15:00Z",
    "erkannt_durch": "Automated WAF alert",
    "betroffene_systeme": ["Web API", "Load Balancer"],
    "erste_erkenntnisse": "High volume traffic from multiple IPs"
  }'
```

---

## List Incidents

Retrieve incidents with optional filtering and pagination.

### Request

```http
GET /api/incidents?type=ransomware&severity=critical&page=1&limit=10
X-API-Key: sk_test_abc123...
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | none | Filter by incident type (ransomware, phishing, ddos, data_loss, other) |
| `severity` | string | none | Filter by severity (critical, high, medium, low) |
| `page` | integer | 1 | Page number for pagination (1-indexed) |
| `limit` | integer | 10 | Items per page (1-100) |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "incident_type": "ransomware",
      "severity": "critical",
      "createdAt": "2026-04-07T14:30:00.000Z",
      "erkennungszeitpunkt": "2026-04-07T14:30:00.000Z",
      "betroffene_systeme": ["Exchange", "SharePoint"]
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### Example Queries

#### Get All Critical Incidents
```bash
curl "http://localhost:3000/api/incidents?severity=critical" \
  -H "X-API-Key: sk_test_abc123..."
```

#### Get Ransomware Incidents, Page 2
```bash
curl "http://localhost:3000/api/incidents?type=ransomware&page=2&limit=20" \
  -H "X-API-Key: sk_test_abc123..."
```

#### Filter by Multiple Criteria
```bash
curl "http://localhost:3000/api/incidents?type=phishing&severity=high&limit=5" \
  -H "X-API-Key: sk_test_abc123..."
```

---

## Get Incident

Retrieve a specific incident by ID.

### Request

```http
GET /api/incidents/550e8400-e29b-41d4-a716-446655440000
X-API-Key: sk_test_abc123...
```

### Response (200 OK)

Returns full incident object (see Create Incident response).

### Response (404 Not Found)

```json
{
  "error": "Incident not found",
  "details": []
}
```

### Example

```bash
curl "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
  -H "X-API-Key: sk_test_abc123..."
```

---

## Update Incident

Partially update an incident. Provide only fields to update.

### Request

```http
PATCH /api/incidents/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
X-API-Key: sk_test_abc123...

{
  "severity": "high",
  "playbook": {
    "checkedSteps": [
      {
        "stepId": "ransomware_01_isolate",
        "checked": true,
        "timestamp": "2026-04-07T14:45:00Z"
      }
    ],
    "status": "in_progress"
  }
}
```

### Updatable Fields

All fields except `id`, `createdAt`, and `deletedAt`:
- `incident_type`
- `severity`
- `erkennungszeitpunkt`
- `erkannt_durch`
- `betroffene_systeme`
- `erste_erkenntnisse`
- `q1`, `q2`, `q3`
- `playbook`
- `regulatorische_meldungen`
- `metadata`

### Response (200 OK)

Returns updated incident object.

### Example: Update Only Severity

```bash
curl -X PATCH "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "severity": "medium"
  }'
```

### Example: Update Playbook Progress

```bash
curl -X PATCH "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -d '{
    "playbook": {
      "checkedSteps": [
        {"stepId": "ransomware_01_isolate", "checked": true, "timestamp": "2026-04-07T14:45:00Z"},
        {"stepId": "ransomware_02_backup", "checked": true, "timestamp": "2026-04-07T14:50:00Z"}
      ],
      "status": "in_progress"
    }
  }'
```

---

## Delete Incident

Soft-delete an incident (sets `deletedAt` timestamp).

### Request

```http
DELETE /api/incidents/550e8400-e29b-41d4-a716-446655440000
X-API-Key: sk_test_abc123...
```

### Response (204 No Content)

No body returned on success.

### Response (404 Not Found)

```json
{
  "error": "Incident not found",
  "details": []
}
```

### Example

```bash
curl -X DELETE "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
  -H "X-API-Key: sk_test_abc123..."
```

### Note: Soft Delete

Deleted incidents are retained in the database with `deletedAt` set to the deletion timestamp. They are excluded from normal queries but can be recovered. Hard deletion is not supported in v1.1.

---

## Export Incident

Export incident as JSON or PDF file.

### Export as JSON

```http
POST /api/incidents/550e8400-e29b-41d4-a716-446655440000/export/json
X-API-Key: sk_test_abc123...
```

**Response:** JSON file download (200 OK, application/json)

```bash
curl -X POST "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/json" \
  -H "X-API-Key: sk_test_abc123..." \
  -o incident_550e8400.json
```

### Export as PDF

```http
POST /api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf
X-API-Key: sk_test_abc123...
```

**Response:** PDF file download (200 OK, application/pdf)

**Note:** PDF generation includes incident summary, classification, playbook checklist, and regulatory deadlines. Processing time: 2-5 seconds per document.

```bash
curl -X POST "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf" \
  -H "X-API-Key: sk_test_abc123..." \
  -o incident_550e8400.pdf
```

---

## Error Handling

All errors return consistent JSON response format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "severity",
      "message": "Invalid severity level"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | Success (GET, PATCH) | Incident retrieved/updated |
| `201` | Created (POST) | New incident created |
| `204` | No Content (DELETE) | Incident deleted |
| `400` | Bad Request (validation) | Invalid enum value |
| `401` | Unauthorized (auth) | Missing/invalid API key |
| `404` | Not Found | Incident ID doesn't exist |
| `500` | Server Error | Database unavailable |

### Common Error Responses

#### Validation Error (400)
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

#### Unauthorized (401)
```json
{
  "error": "Invalid API key",
  "details": []
}
```

#### Not Found (404)
```json
{
  "error": "Incident not found",
  "details": []
}
```

#### Server Error (500)
```json
{
  "error": "Database connection failed",
  "details": []
}
```

### Handling Errors in Code

**JavaScript/Node.js:**
```javascript
async function createIncident(incidentData) {
  try {
    const response = await fetch('http://localhost:3000/api/incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY,
      },
      body: JSON.stringify(incidentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error ${response.status}:`, errorData.error);
      console.error('Details:', errorData.details);
      throw new Error(errorData.error);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error.message);
    // Implement retry logic or user notification here
  }
}
```

**Python:**
```python
import requests

def create_incident(incident_data):
    response = requests.post(
        'http://localhost:3000/api/incidents',
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': os.environ['API_KEY'],
        },
        json=incident_data,
    )
    
    if response.status_code != 201:
        error_data = response.json()
        print(f"Error {response.status_code}: {error_data['error']}")
        print(f"Details: {error_data['details']}")
        raise Exception(error_data['error'])
    
    return response.json()
```

---

## Best Practices

### 1. API Key Management

- **Never commit API keys** to version control
- Store in `.env.local` (dev) or environment variables (production)
- Rotate keys periodically (planned for v1.2)

### 2. Error Handling

- Always check HTTP status codes
- Parse error responses for user-friendly messages
- Implement retry logic for transient errors (500, 503)

### 3. Pagination

- Default page size is 10; adjust with `limit` parameter
- Maximum limit is 100 items per page
- Always handle `total` field to implement pagination UI

### 4. Timestamps

- All timestamps are in UTC (ISO 8601 format)
- `createdAt` and `updatedAt` are system-managed (read-only)
- `erkennungszeitpunkt` is user-provided and represents actual incident time

### 5. Playbook Tracking

- Update `playbook.checkedSteps` as user progresses through incident response
- Include `timestamp` when marking steps complete for audit trail
- Set `status` to `completed` only when all relevant steps are done

### 6. Data Validation

- Validate all user inputs before sending to API
- Incident type and severity must match allowed enums
- Description (erste_erkenntnisse) must be 10-5000 characters

### 7. Soft Deletes

- Deleted incidents are retained for audit purposes
- Query with `WHERE deletedAt IS NULL` to get active incidents only
- Hard deletion is not supported; contact support for data purge requests

---

## Code Examples

### Complete Incident Workflow

```javascript
const API_BASE = 'http://localhost:3000/api';
const API_KEY = 'sk_test_abc123...';

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

// 1. Create incident
async function createAndTrackIncident() {
  // Create
  const createResponse = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      incident_type: 'ransomware',
      severity: 'critical',
      erkennungszeitpunkt: new Date().toISOString(),
      erkannt_durch: 'SOC monitoring',
      betroffene_systeme: ['Exchange', 'SharePoint'],
      erste_erkenntnisse: 'Encrypted files detected in file shares',
    }),
  });

  const incident = await createResponse.json();
  console.log('Incident created:', incident.id);

  // 2. Update with playbook progress
  const updateResponse = await fetch(`${API_BASE}/incidents/${incident.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      playbook: {
        checkedSteps: [
          {
            stepId: 'ransomware_01_isolate',
            checked: true,
            timestamp: new Date().toISOString(),
          },
        ],
        status: 'in_progress',
      },
    }),
  });

  const updated = await updateResponse.json();
  console.log('Incident updated:', updated.id);

  // 3. Export as JSON
  const exportResponse = await fetch(
    `${API_BASE}/incidents/${incident.id}/export/json`,
    {
      method: 'POST',
      headers,
    }
  );

  const exportedJSON = await exportResponse.json();
  console.log('Exported:', exportedJSON);

  // 4. Export as PDF
  const pdfResponse = await fetch(
    `${API_BASE}/incidents/${incident.id}/export/pdf`,
    {
      method: 'POST',
      headers,
    }
  );

  const pdfBlob = await pdfResponse.blob();
  const url = window.URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `incident_${incident.id}.pdf`;
  a.click();
  console.log('PDF downloaded');
}

// 5. List incidents
async function listIncidents() {
  const response = await fetch(
    `${API_BASE}/incidents?severity=critical&limit=20`,
    {
      method: 'GET',
      headers,
    }
  );

  const result = await response.json();
  console.log(`Found ${result.total} critical incidents:`, result.data);
}

// 6. Delete incident
async function deleteIncident(incidentId) {
  const response = await fetch(`${API_BASE}/incidents/${incidentId}`, {
    method: 'DELETE',
    headers,
  });

  if (response.status === 204) {
    console.log('Incident deleted');
  } else {
    console.error('Delete failed');
  }
}
```

---

## Support & Documentation

- **Interactive API Docs:** `/api-docs` (Swagger UI)
- **Database Schema:** See `docs/DATABASE_SCHEMA.md`
- **Error Codes Reference:** See `docs/API_ERROR_CODES.md`
- **Performance Benchmarks:** See `docs/PERFORMANCE_BENCHMARKS.md`

For questions or bug reports, contact the development team.
