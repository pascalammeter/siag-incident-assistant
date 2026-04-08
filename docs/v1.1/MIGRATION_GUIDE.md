# Migration Guide: v1.0 → v1.1

**For:** SIAG consultants and administrators upgrading from v1.0 to v1.1
**Date:** 2026-04-08

---

## What Changed?

v1.1 adds a **cloud backend** to the v1.0 wizard prototype. Your existing incident data, previously stored only in your browser's local storage, is automatically migrated to secure cloud storage on first load.

**For end users, nothing changes visually.** The wizard looks and works the same.

---

## Automatic Migration

When you open the app after the v1.1 update:

1. The app detects your existing incident data in browser storage
2. It uploads each incident to the cloud database automatically
3. A success notification appears: *"1 Vorfall erfolgreich in die Cloud migriert"*
4. Your data is now backed up in the cloud

**You don't need to do anything.** The migration happens in the background on first load.

---

## What If the Migration Fails?

If your connection is interrupted during migration:

- Your original data is **not deleted** — it stays in local storage
- On the next page load, migration resumes from where it stopped (no duplicates)
- A warning message will appear if migration is incomplete

If migration fails repeatedly, contact your administrator and provide the browser console log (`F12 → Console tab`).

---

## Your Data is Safe

- **Before migration:** a backup copy is saved as `siag-v1-backup` in browser storage
- **After migration:** data is in the Neon cloud database (PostgreSQL, EU region)
- **Local storage:** the original `siag-wizard-state` key is cleared after successful migration; the backup remains for 30 days

To inspect your backup: open browser dev tools (`F12`), go to **Application → Local Storage**, look for `siag-v1-backup`.

---

## New Features in v1.1

### Cloud Storage
- Incidents now persist across devices and browsers
- Data survives browser cache clearing
- Accessible to administrators via the API

### `/incidents` Page
- New page at `/incidents` shows all your stored incidents
- Filter by type (Ransomware, Phishing, DDoS, Data Loss) and severity
- Click any incident to reopen the wizard with full data rehydrated

### More Incident Types
- Phishing, DDoS, and Data Loss playbooks added (25 steps each)
- Ransomware playbook enhanced to 25 steps

### Offline Mode
- If the backend is temporarily unavailable, the wizard still works
- Data is stored locally and syncs when connectivity returns

---

## For Administrators

### Environment Variables Required

Set these in Vercel dashboard → Project Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `DIRECT_URL` | Neon PostgreSQL direct connection (for migrations) |
| `API_KEY` | Secret key for API authentication (`openssl rand -hex 32`) |
| `CORS_ORIGIN` | Allowed frontend origin (`https://siag-incident-assistant.vercel.app`) |

### API Access

The v1.1 API requires an `X-API-Key` header on all requests. The key must match `API_KEY` env var.

Example:
```bash
curl -H "X-API-Key: your-api-key" \
  https://siag-incident-assistant.vercel.app/api/incidents
```

### Database Schema

The database is managed by Prisma. Schema is in `prisma/schema.prisma`. To run migrations:
```bash
npx prisma migrate deploy
```

See `docs/DATABASE_SCHEMA.md` for full field documentation.

---

## Backwards Compatibility

| Feature | v1.0 | v1.1 |
|---------|------|------|
| URL `/` | Wizard | Wizard (unchanged) |
| Wizard steps 1–6 | Same | Same |
| Ransomware playbook | ✅ | ✅ Enhanced |
| localStorage support | Primary | Fallback |
| PDF export | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| Cloud storage | — | ✅ New |
| Multi-incident list | — | ✅ New (`/incidents`) |
| API access | — | ✅ New |

All v1.0 URLs and workflows continue to work in v1.1 without changes.
