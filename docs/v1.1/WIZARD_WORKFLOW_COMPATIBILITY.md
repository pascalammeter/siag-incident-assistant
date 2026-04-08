# Wizard Workflow Compatibility Test — v1.1

**Audit Date:** 2026-04-08
**Scope:** End-to-end verification that v1.0 wizard workflows function identically in v1.1

---

## Step Structure (Unchanged from v1.0)

| Step | Component | Route | Status |
|------|-----------|-------|--------|
| Step 1 | `Step1Einstieg.tsx` | `/` (initial render) | ✅ Unchanged |
| Step 2 | `Step2Erfassen.tsx` | `/` (wizard state) | ✅ Unchanged |
| Step 3 | `Step3Klassifikation.tsx` | `/` (wizard state) | ✅ Unchanged |
| Step 4 | `Step4Reaktion.tsx` | `/` (wizard state) | ✅ Unchanged |
| Step 5 | `Step5Kommunikation.tsx` | `/` (wizard state) | ✅ Unchanged |
| Step 6 | `Step6Dokumentation.tsx` | `/` (wizard state) | ✅ Unchanged |
| Interstitial | `StepInterstitial.tsx` | `/` (between steps) | ✅ Unchanged |

All wizard steps remain client-side state — no URL segment changes.

---

## Supported Incident Types (All 4 v1.1 Playbooks)

| Incident Type | v1.0 | v1.1 | Notes |
|--------------|------|------|-------|
| Ransomware | ✅ | ✅ | Core v1.0 type; playbook enhanced in v1.1 |
| Phishing | Partial | ✅ | Full 25-step playbook added in Phase 11 |
| DDoS | Partial | ✅ | Full 25-step playbook added in Phase 11 |
| Data Loss | Partial | ✅ | Full 25-step playbook added in Phase 11 |

---

## End-to-End Test Plan

### Test Case 1: Full Ransomware Workflow

**Precondition:** App loaded at `/`, no prior localStorage data

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/` | Step 1 (Einstieg) loads with SIAG branding |
| 2 | Confirm no-go screen | Step 2 (Erfassen) opens |
| 3 | Fill Step 2: Erkennungszeitpunkt, Systeme, Erkannt durch | Fields accept input; validation inline |
| 4 | Click "Weiter" | Step 3 (Klassifikation) opens |
| 5 | Select Q1=Ja, Q2=Nein, Q3=Unbekannt | Incident type auto-set to Ransomware; severity computed |
| 6 | Click "Weiter" | Step 4 (Reaktion / Playbook) opens |
| 7 | Check 5+ playbook steps | Checkboxes respond; progress shown |
| 8 | Click "Weiter" | Step 5 (Kommunikation) opens |
| 9 | Set Kritische Infrastruktur=Ja, Personendaten=Nein | Compliance deadlines shown (ISG 24h) |
| 10 | Click "Weiter" | Step 6 (Dokumentation / Summary) opens |
| 11 | Review summary, click submit | Incident saved; API call to POST /api/incidents |
| 12 | Navigate to `/incidents` | New incident appears in list |
| 13 | Click incident in list | Wizard rehydrates from API (GET /api/incidents/:id) |
| 14 | Modify a field, click save | PATCH /api/incidents/:id updates incident |

**Expected outcome:** All 14 steps complete without errors; incident stored in Neon DB.

### Test Case 2: localStorage Fallback

**Precondition:** API unreachable (no DB connection or offline)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `/` without API | Warning shown: "Backend unavailable — using local storage" |
| 2 | Complete wizard flow | Incident created in localStorage (temp ID with `temp-` prefix) |
| 3 | Reload page | Incident still present (read from localStorage) |
| 4 | Navigate to `/incidents` | Incident shown from localStorage cache |

**Expected outcome:** Full wizard flow works offline; data persists on reload.

### Test Case 3: v1.0 localStorage Migration

**Precondition:** Browser has v1.0 `siag-wizard-state` in localStorage

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Load app with v1.0 localStorage | MigrationInitializer runs useMigration() on mount |
| 2 | Migration detects v1.0 state | `migrateIncidents()` transforms to v1.1 schema |
| 3 | API call: POST /api/incidents | v1.0 incident uploaded; cursor saved |
| 4 | Migration completes | Toast: "1 Vorfall erfolgreich in die Cloud migriert" |
| 5 | v1.0 key removed | `siag-wizard-state` deleted; backup in `siag-v1-backup` |
| 6 | Navigate to `/incidents` | Migrated incident appears in list |
| 7 | Reload page | Migration skipped (COMPLETED flag set) |

**Expected outcome:** Single-run migration with no duplicate uploads; v1.0 data preserved in backup key.

### Test Case 4: All 4 Incident Types

For each of Ransomware, Phishing, DDoS, Data Loss:
- Complete wizard through Step 6
- Verify playbook has incident-type-specific steps (25 steps each)
- Verify compliance logic correct (ISG, DSG, FINMA flags)
- Verify incident saved correctly

---

## Compliance Deadline Logic (Unchanged from v1.0)

| Regulation | Trigger | Deadline |
|-----------|---------|----------|
| ISG (Information Security Act) | `kritischeInfrastruktur = ja` | 24 hours from detection |
| DSG (Data Protection Act) | `personendatenBetroffen = ja` | 72 hours from detection |
| FINMA | `reguliertesUnternehmen = ja` | 24h initial, 72h full report |

All compliance deadlines are calculated client-side in the wizard and stored in `regulatorische_meldungen` JSONB field.

---

## Verification Status

| Test | Status | Notes |
|------|--------|-------|
| Step navigation (1-6) | ✅ Code verified | All step components exist, WizardShell orchestrates |
| localStorage fallback | ✅ Code verified | `useIncident()` has `shouldFallback()` guard |
| Migration flow | ✅ Code verified | `MigrationService.run()` + cursor tracking |
| API persistence | ✅ Code verified | POST/PATCH routes wired through IncidentService |
| All 4 incident types | ✅ Code verified | Playbook data exists for all 4 types in `src/lib/playbooks/` |
| Compliance deadlines | ✅ Code verified | Logic in Step5Kommunikation |
