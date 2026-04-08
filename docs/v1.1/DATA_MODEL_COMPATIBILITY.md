# Data Model & API Compatibility — v1.0 → v1.1

**Audit Date:** 2026-04-08

---

## v1.0 Data Shape (localStorage)

In v1.0, all incident data was stored in a single localStorage key `siag-wizard-state` as a flat wizard state object:

```json
{
  "currentStep": 3,
  "noGoConfirmed": true,
  "erfassen": {
    "erkennungszeitpunkt": "2026-04-08T10:00:00Z",
    "erkannt_durch": "IT Team",
    "betroffene_systeme": ["ERP-System", "Mail-Server"],
    "erste_auffaelligkeiten": "Dateien verschlüsselt",
    "loesegeld_meldung": true
  },
  "klassifikation": {
    "q1SystemeBetroffen": "ja",
    "q2PdBetroffen": "nein",
    "q3AngreiferAktiv": "unbekannt",
    "incidentType": "ransomware",
    "severity": "KRITISCH"
  },
  "reaktion": {
    "completedSteps": ["isolate-network", "notify-it-lead"]
  },
  "kommunikation": {
    "kritischeInfrastruktur": "ja",
    "personendatenBetroffen": "nein",
    "reguliertesUnternehmen": "nein"
  }
}
```

---

## v1.1 Data Shape (API / Prisma)

The v1.1 API stores incidents in PostgreSQL with the following shape (as returned by all API endpoints):

```json
{
  "id": "uuid-v4",
  "createdAt": "2026-04-08T10:00:00Z",
  "updatedAt": "2026-04-08T10:05:00Z",
  "deletedAt": null,

  "erkennungszeitpunkt": "2026-04-08T10:00:00Z",
  "erkannt_durch": "IT Team",
  "betroffene_systeme": ["ERP-System", "Mail-Server"],
  "erste_erkenntnisse": "Dateien verschlüsselt",

  "incident_type": "ransomware",
  "q1": 1,
  "q2": 0,
  "q3": null,
  "severity": "critical",

  "playbook": {
    "checkedSteps": [
      { "stepId": "isolate-network", "checked": true, "timestamp": "2026-04-08T10:01:00Z" }
    ],
    "status": "in_progress"
  },

  "regulatorische_meldungen": {
    "isg_24h": "2026-04-09T10:00:00Z",
    "dsg": false,
    "finma_24h": null,
    "finma_72h": null
  },

  "metadata": {
    "tags": ["v1.0-migrated"],
    "notes": "Auto-migrated from v1.0 localStorage",
    "custom_fields": {
      "loesegeld_meldung": true,
      "kritischeInfrastruktur": "ja"
    }
  }
}
```

---

## Field-by-Field Mapping

| v1.0 Field | v1.1 Field | Transform |
|-----------|-----------|-----------|
| `erfassen.erkennungszeitpunkt` | `erkennungszeitpunkt` | Direct copy (ISO8601 string) |
| `erfassen.erkannt_durch` | `erkannt_durch` | Direct copy |
| `erfassen.betroffene_systeme` | `betroffene_systeme` | Direct copy (string array) |
| `erfassen.erste_auffaelligkeiten` | `erste_erkenntnisse` | Renamed field (content preserved) |
| `klassifikation.incidentType` | `incident_type` | Enum normalize: `datenverlust` → `data_loss`, `unbefugter-zugriff` → `other` |
| `klassifikation.severity` | `severity` | Uppercase to lowercase: `KRITISCH` → `critical`, `HOCH` → `high` |
| `klassifikation.q1SystemeBetroffen` | `q1` | `ja` → `1`, `nein` → `0`, `unbekannt` → `null` |
| `klassifikation.q2PdBetroffen` | `q2` | Same as q1 |
| `klassifikation.q3AngreiferAktiv` | `q3` | Same as q1 |
| `reaktion.completedSteps` | `playbook.checkedSteps` | Array of step IDs → structured objects with `checked: true` |
| `erfassen.loesegeld_meldung` | `metadata.custom_fields.loesegeld_meldung` | Preserved in metadata |
| `kommunikation.kritischeInfrastruktur` | `metadata.custom_fields.kritischeInfrastruktur` | Preserved in metadata |
| `kommunikation.personendatenBetroffen` | `metadata.custom_fields.personendatenBetroffen` | Preserved in metadata |
| `kommunikation.reguliertesUnternehmen` | `metadata.custom_fields.reguliertesUnternehmen` | Preserved in metadata |

---

## Backwards Compatibility Status

### Frontend Compatibility: FULL ✅

- `useIncident()` hook provides the same interface as v1.0's `useWizard()` — `createIncident`, `getIncident`, `updateIncident`, `deleteIncident`, `listIncidents`
- localStorage fallback activates automatically if API is unreachable
- `isOffline` flag indicates fallback mode to the UI

### Data Model: ALL v1.0 FIELDS PRESERVED ✅

| Required Field | Prisma Column | Present in v1.1 |
|---------------|--------------|-----------------|
| `id` | `id` (UUID) | ✅ Auto-generated |
| `incident_type` | `incident_type` | ✅ With enum normalization |
| `severity` | `severity` | ✅ With case normalization |
| `erkennungszeitpunkt` | `erkennungszeitpunkt` | ✅ |
| `erkannt_durch` | `erkannt_durch` | ✅ |
| `betroffene_systeme` | `betroffene_systeme` | ✅ |
| `erste_erkenntnisse` | `erste_erkenntnisse` | ✅ (renamed from `erste_auffaelligkeiten`) |
| `playbook_steps` | `playbook.checkedSteps` | ✅ In JSONB, richer structure |
| Compliance deadlines | `regulatorische_meldungen` | ✅ In JSONB |
| `created_at` | `createdAt` | ✅ |
| `updated_at` | `updatedAt` | ✅ |

### API Error Format

All v1.1 API errors return a consistent JSON structure:

```json
{ "error": "Error message", "details": [] }
```

For validation errors:
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "incident_type", "message": "Invalid enum value" }
  ]
}
```

---

## Breaking Changes: NONE

No breaking changes were introduced. v1.0 had no public API — it was purely localStorage-based. v1.1 is additive only.
