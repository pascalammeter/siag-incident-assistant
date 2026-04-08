# v1.0 & v1.1 Data Coexistence

**Date:** 2026-04-08

---

## Coexistence Strategy

v1.0 and v1.1 use the same domain (`siag-incident-assistant.vercel.app`). There is no separate staging URL for v1.0 — v1.1 *is* the upgraded deployment on the same domain.

The coexistence approach is therefore **in-browser storage isolation**:

| Storage Layer | v1.0 Key | v1.1 Key | Collision Risk |
|--------------|----------|----------|---------------|
| localStorage (wizard state) | `siag-wizard-state` | `siag-incidents` (list cache) | None — different keys |
| localStorage (single incident) | N/A | `siag-incident-{id}` | None — keyed by UUID |
| localStorage (migration flags) | N/A | `siag-migration-completed`, `siag-migration-cursor` | None — new keys |
| Database | N/A | Neon PostgreSQL | N/A — v1.0 had no DB |

---

## Migration Flow on First v1.1 Load

When a user visits the app after the v1.1 deployment:

1. `MigrationInitializer` component mounts (renders null, side-effect only)
2. `useMigration()` hook fires once on mount (guarded by `hasRunRef`)
3. `MigrationService.run()` is called:
   - Reads `siag-wizard-state` from localStorage
   - If found: transforms and uploads to API
   - If not found: marks migration as complete, no-op
4. After migration: `siag-wizard-state` is deleted; `siag-v1-backup` retains a copy
5. `siag-migration-completed = 'true'` prevents re-runs on subsequent loads

---

## v1.0 Data Safety

**v1.0 data is never destroyed without backup.** The migration sequence:

1. `MigrationService.backupV1State()` — writes `siag-v1-backup` with timestamp
2. API upload — creates new incident in database
3. `MigrationService.clearV1State()` — removes `siag-wizard-state` only after upload succeeds

If the API upload fails (network/server error):
- `siag-wizard-state` is NOT deleted
- `siag-migration-pending = 'true'` is set
- Next app load retries from `siag-migration-cursor` (last-uploaded index)

---

## Preventing Double-Upload

The cursor mechanism prevents duplicate uploads on retry:

```
siag-migration-cursor = "0"   // Last successfully uploaded index
```

On retry, `MigrationService.run()` starts from `cursor + 1`, skipping already-uploaded incidents. Combined with the `siag-migration-completed` flag, incidents are guaranteed to be uploaded at most once.

---

## v1.0 Browser History Behavior

If a user bookmarks `/` in v1.0 and later loads v1.1:
- URL still works (no redirect needed)
- The wizard loads fresh at Step 1 (since `siag-wizard-state` was cleared after migration)
- User can create new incidents, which save to API

If the user loads v1.0 from browser cache (unlikely — Vercel serves latest always):
- v1.0 reads `siag-wizard-state`, which is cleared after migration
- Wizard starts fresh at Step 1 (no data loss — data is in DB)
- This is acceptable: v1.0 would only show an empty wizard

---

## New Incidents in v1.1

New incidents created in v1.1 go directly to the API:
- Primary path: POST /api/incidents → Neon DB → returns UUID
- Fallback path (API down): creates with `temp-{timestamp}` ID in localStorage
  - These temp incidents are NOT auto-migrated (no `siag-wizard-state` key)
  - They appear in `/incidents` list from localStorage cache
  - When API comes back online, user must manually re-submit (known limitation)

---

## Summary

| Scenario | Outcome |
|----------|---------|
| v1.0 user opens v1.1 for first time | Migration runs, v1.0 incident uploaded to DB |
| v1.0 data survives migration | ✅ Backup in `siag-v1-backup` for 30 days |
| Double-upload prevented | ✅ Cursor + completed flag |
| v1.0 URL bookmarks still work | ✅ `/` unchanged |
| API offline, new incidents | Saved to localStorage (temp ID) |
| v1.0 + v1.1 on same domain | ✅ Different localStorage keys, no collision |
