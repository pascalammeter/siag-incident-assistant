# Database Schema Documentation

**Last Updated:** 2026-04-07  
**Database:** PostgreSQL (Neon)  
**ORM:** Prisma v5+

## Overview

The SIAG Incident Management API uses a single primary table (`Incident`) designed for scalable incident tracking and reporting. The schema is optimized for Swiss incident notification requirements and supports full audit trails through JSON columns for complex state.

## Table: Incident

### Purpose
Core table storing all incident data from creation through resolution. Supports soft deletes and maintains complete audit history.

### Schema Definition

| Field | Type | Constraints | Purpose |
|-------|------|-----------|---------|
| `id` | UUID | PRIMARY KEY, auto-generated | Unique incident identifier |
| `createdAt` | TIMESTAMP | auto-generated, UTC | Incident creation timestamp (system time) |
| `updatedAt` | TIMESTAMP | auto-updated, UTC | Last modification timestamp (updated by Prisma `@updatedAt`) |
| `deletedAt` | TIMESTAMP | nullable, UTC | Soft delete marker (NULL if active, timestamp if deleted) |
| `erkennungszeitpunkt` | TIMESTAMP | nullable | When incident was discovered/detected (user-provided, critical for compliance) |
| `erkannt_durch` | VARCHAR(255) | nullable | Detection method/source (e.g., "SOC monitoring", "Employee report", "Automated alert") |
| `betroffene_systeme` | TEXT[] | nullable | Array of affected systems/services (e.g., `["Exchange", "SharePoint", "VPN"]`) |
| `erste_erkenntnisse` | TEXT | nullable | Initial findings/observations (free-form text, max 5000 chars) |
| `incident_type` | VARCHAR(50) | nullable, enum | Classification: `ransomware`, `phishing`, `ddos`, `data_loss`, `other` |
| `q1` | INT | nullable, 0-1 | Classification question 1 response (0=no, 1=yes) |
| `q2` | INT | nullable, 0-1 | Classification question 2 response |
| `q3` | INT | nullable, 0-1 | Classification question 3 response |
| `severity` | VARCHAR(20) | nullable, enum | Severity level: `critical`, `high`, `medium`, `low` |
| `playbook` | JSONB | nullable | Playbook progress tracking (see Playbook Structure below) |
| `regulatorische_meldungen` | JSONB | nullable | Regulatory notification deadlines (see Regulatory Structure below) |
| `metadata` | JSONB | nullable | Custom fields, tags, audit notes (see Metadata Structure below) |

### Field Constraints & Validation

**Incident Type Enum (incident_type)**
- Valid values: `ransomware`, `phishing`, `ddos`, `data_loss`, `other`
- Must be provided at creation (via API validation, not DB constraint)
- Cannot be NULL in business logic

**Severity Enum (severity)**
- Valid values: `critical`, `high`, `medium`, `low`
- Must be provided at creation
- Cannot be NULL in business logic

**Description Text (erste_erkenntnisse)**
- Min length: 10 characters (API validation)
- Max length: 5000 characters (API validation)
- Optional but recommended for incident context

**Timestamps**
- All stored as UTC in PostgreSQL TIMESTAMP columns
- `createdAt`: Set once at record creation, never modified
- `updatedAt`: Automatically updated by Prisma on any field change
- `erkennungszeitpunkt`: User-provided, represents actual incident discovery time (critical for regulatory compliance)
- `deletedAt`: Set to current UTC timestamp when soft-deleted; used to filter active incidents in queries

### JSON Structures

#### Playbook Structure (`playbook` column)

```json
{
  "checkedSteps": [
    {
      "stepId": "ransomware_01_isolate_system",
      "checked": true,
      "timestamp": "2026-04-07T14:23:45.123Z"
    },
    {
      "stepId": "ransomware_02_document_impact",
      "checked": true,
      "timestamp": "2026-04-07T14:25:10.456Z"
    }
  ],
  "status": "in_progress"
}
```

**Fields:**
- `checkedSteps[]`: Array of completed playbook steps
  - `stepId`: Unique identifier matching playbook definitions (format: `{incident_type}_{order}_{action}`)
  - `checked`: Boolean indicating completion
  - `timestamp`: ISO 8601 UTC timestamp when step was marked complete
- `status`: Playbook progression state
  - `in_progress`: User actively working through playbook
  - `completed`: All relevant steps marked complete

#### Regulatory Structure (`regulatorische_meldungen` column)

```json
{
  "isg_24h": "2026-04-08T14:30:00.000Z",
  "dsg": false,
  "finma_24h": "2026-04-08T14:30:00.000Z",
  "finma_72h": "2026-04-10T14:30:00.000Z"
}
```

**Fields:**
- `isg_24h`: ISO 8601 UTC deadline for ISG (Swiss Critical Infrastructure Act) notification (24h from detection)
- `dsg`: Boolean flag indicating DSG (Swiss Data Protection Law) applicability
- `finma_24h`: ISO 8601 UTC deadline for FINMA notification if applicable (24h from detection)
- `finma_72h`: ISO 8601 UTC deadline for FINMA escalation if applicable (72h from detection)

**Note:** Deadlines are calculated automatically at incident creation based on `erkennungszeitpunkt` and are informational (not enforced by DB).

#### Metadata Structure (`metadata` column)

```json
{
  "tags": ["critical", "external", "in-investigation"],
  "notes": "Contacted external incident response firm",
  "custom_fields": {
    "business_unit": "Finance",
    "incident_priority": "P1",
    "escalation_level": 3,
    "assigned_to": "john.doe@example.com"
  }
}
```

**Fields:**
- `tags[]`: User-defined labels for incident categorization and filtering
- `notes`: Free-form audit trail and incident notes
- `custom_fields`: Extensible key-value store for organization-specific data

### Indexes for Query Performance

| Index Name | Fields | Type | Purpose | Impact |
|-----------|--------|------|---------|--------|
| `incident_type_idx` | `incident_type` | BTREE | Fast filtering by incident type (common UI filter) | Reduces full-table scans when filtering by type |
| `severity_idx` | `severity` | BTREE | Fast filtering by severity level | Enables quick critical/high incident filtering |
| `createdAt_idx` | `createdAt DESC` | BTREE | Fast sorting by creation date (default sort) | Optimizes incident list sorting by newest-first |
| `erkennungszeitpunkt_idx` | `erkennungszeitpunkt DESC` | BTREE | Fast timeline queries (when was incident detected) | Optimizes compliance deadline calculations |

### Index Design Rationale

1. **incident_type_idx**: Incidents are frequently filtered by type in the UI (dropdown filter). Single-field BTREE sufficient for < 100K incidents.

2. **severity_idx**: Users often prioritize by severity. Separate index allows efficient `severity IN ('critical', 'high')` queries.

3. **createdAt_idx**: Default sort in incident list is newest-first. DESC index optimizes the most common query pattern.

4. **erkennungszeitpunkt_idx**: Required for regulatory deadlines and timeline analysis. Separate from createdAt because detection time (when incident occurred) differs from system creation time.

### Soft Delete Pattern

Incidents are never hard-deleted. Instead, `deletedAt` is set to current timestamp.

**Active Incidents Query:**
```sql
SELECT * FROM Incident WHERE deletedAt IS NULL;
```

**All Incidents (including deleted):**
```sql
SELECT * FROM Incident;
```

**Recently Deleted:**
```sql
SELECT * FROM Incident WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC LIMIT 10;
```

### Scalability Considerations

**Current Capacity:**
- Schema optimized for < 1M incidents
- Index strategy efficient up to 100K incidents
- Connection pooling via Neon manages concurrent queries
- JSONB columns enable flexible extensibility without schema migrations

**Scaling Beyond 100K Incidents:**
1. Consider table partitioning by `incident_type` or date range
2. Archive old incidents (older than 2 years) to separate historical table
3. Add `last_accessed` index for warm/cold storage strategy
4. Monitor index bloat; rebuild quarterly if necessary

**Row Size:**
- Average incident: ~2 KB (metadata varies)
- JSONB playbook: ~500 bytes per 10 steps
- Total table size at 100K incidents: ~200 MB (comfortable within Neon limits)

## Migration Strategy

Migrations are managed via Prisma and tracked in version control.

**Create Initial Schema:**
```bash
npm run prisma:migrate -- --name "initial_incident_schema"
```

**View Migration History:**
```bash
npx prisma migrate status
```

**Rollback (dev only):**
```bash
npx prisma migrate reset  # ⚠️ Drops all data
```

## Data Integrity & Constraints

### Business Rules Enforced at Application Level

Since Prisma doesn't create database constraints for enums, the following are enforced by API validation (Zod schemas):

1. `incident_type` must be one of: `ransomware`, `phishing`, `ddos`, `data_loss`, `other`
2. `severity` must be one of: `critical`, `high`, `medium`, `low`
3. `q1`, `q2`, `q3` must be 0 or 1 (or NULL)
4. `betroffene_systeme` array should not be empty if incident is under investigation
5. `erkennungszeitpunkt` should be ≤ current timestamp

### Future Enhancements

- Add database CHECK constraints for enums (requires manual SQL migration)
- Add UNIQUE constraint on external incident IDs if integrating with SIAG CRM
- Add foreign key relationships if adding related tables (e.g., Comments, Audit Log)

## Example Queries

### Get Active Incidents by Type
```sql
SELECT id, incident_type, severity, createdAt 
FROM Incident 
WHERE deletedAt IS NULL AND incident_type = 'ransomware'
ORDER BY createdAt DESC 
LIMIT 10;
```

### List Critical Incidents Updated in Last 24 Hours
```sql
SELECT id, severity, erkennungszeitpunkt, playbook 
FROM Incident 
WHERE deletedAt IS NULL 
  AND severity = 'critical' 
  AND updatedAt > NOW() - INTERVAL '24 hours'
ORDER BY updatedAt DESC;
```

### Count Incidents by Type (Summary)
```sql
SELECT incident_type, COUNT(*) as count 
FROM Incident 
WHERE deletedAt IS NULL 
GROUP BY incident_type 
ORDER BY count DESC;
```

### Find Incidents Requiring ISG Notification
```sql
SELECT id, erkennungszeitpunkt, (regulatorische_meldungen->>'isg_24h')::timestamp AS isg_deadline
FROM Incident 
WHERE deletedAt IS NULL 
  AND (regulatorische_meldungen->>'isg_24h')::timestamp <= NOW()
ORDER BY isg_deadline ASC;
```

## Backup & Recovery

**Neon Automatic Backups:**
- Daily snapshots retained for 7 days
- Point-in-time recovery available
- Backups stored in separate geographic region

**Manual Backup (Production):**
```bash
pg_dump postgresql://user:password@host/dbname > backup_$(date +%Y%m%d).sql
```

**Restore from Backup:**
```bash
psql postgresql://user:password@host/dbname < backup_YYYYMMDD.sql
```

## Summary

The Incident schema is lean and purpose-built for incident management with:
- **Auditability:** createdAt, updatedAt, deletedAt track all changes
- **Compliance:** Regulatory deadline tracking via JSONB
- **Flexibility:** Custom metadata via JSONB without schema migrations
- **Performance:** 4 strategic indexes for common query patterns
- **Extensibility:** Ready for future features (comments, audit log) via new tables and foreign keys

For questions or schema modifications, consult with the incident management team.
