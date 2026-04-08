# UAT Checklist — SIAG Incident Assistant v1.1

**Version:** v1.1.0  
**UAT URL:** https://siag-incident-assistant.vercel.app  
**Tester:** [Consultant Name]  
**Date:** [Date]  
**Status:** [ ] In Progress  [ ] Complete  [ ] Issues Found

---

## Pre-Test Setup

- [ ] Open https://siag-incident-assistant.vercel.app in a fresh browser tab (not incognito)
- [ ] Confirm page loads without errors (check browser console for red errors)
- [ ] Confirm "SIAG Incident Management Assistent" appears in header
- [ ] Confirm dark mode toggle is visible in header
- [ ] Confirm navigation to `/incidents` page works (shows empty list or existing incidents)

---

## Incident Type 1: Ransomware

### 1.1 Wizard Flow

- [ ] Click "Incident erfassen" or equivalent entry button to start wizard
- [ ] **Step 0 (No-Go-Regeln):** Checkbox appears, tick it, click "Weiter"
- [ ] **Step 1 (Einstieg):** "Shit Happens" button visible; click it, click "Weiter"
- [ ] **Step 2 (Vorfall erfassen):**
  - [ ] Select incident type: **Ransomware**
  - [ ] Click "Jetzt" to set detection timestamp (confirm timestamp populates)
  - [ ] Select affected systems (at least 2 checkboxes)
  - [ ] Fill "Erste Erkenntnisse" text field with test content
  - [ ] Click "Weiter"
- [ ] **Step 3 (Klassifikation):**
  - [ ] Answer all 3 classification questions with "Ja"
  - [ ] Confirm severity badge shows "Kritisch" automatically
  - [ ] Click "Weiter"
- [ ] **Step 4 (Reaktion / Playbook):**
  - [ ] Ransomware playbook loads (confirm at least 20 steps visible)
  - [ ] Check off 3–5 steps (verify progress counter increments)
  - [ ] Verify role labels on steps (IT-Leiter, CISO, CEO, Forensik)
  - [ ] Click "Weiter"
- [ ] **Step 5 (Meldepflichten / Kommunikation):**
  - [ ] Answer compliance questions
  - [ ] Verify ISG deadline appears: detection time + 24 hours
  - [ ] Verify DSG deadline appears
  - [ ] Open at least 1 communication template block (confirm content is present)
  - [ ] Click "Weiter"
- [ ] **Step 6 (Dokumentation / Summary):**
  - [ ] All entered data visible in summary
  - [ ] Incident type shows "Ransomware"
  - [ ] All affected systems listed
  - [ ] "Bericht exportieren (PDF)" button visible

### 1.2 PDF Export

- [ ] Click "Bericht exportieren (PDF)" on Step 6
- [ ] PDF downloads or opens in new tab within 30 seconds
- [ ] PDF contains:
  - [ ] SIAG branding (logo or header)
  - [ ] Incident type: Ransomware
  - [ ] Detection timestamp
  - [ ] Affected systems list
  - [ ] Playbook steps and checked items
  - [ ] Compliance deadlines (ISG 24h, DSG)
  - [ ] Professional formatting (readable on A4 print)
- [ ] PDF is printable without content being cut off

### 1.3 Compliance Deadlines

- [ ] ISG deadline = Detection time + 24 hours (verify arithmetic)
- [ ] DSG deadline is present and labeled correctly
- [ ] Deadlines are shown in Swiss timezone format

### 1.4 Resume Functionality

- [ ] Start a NEW Ransomware incident but do NOT submit — stop mid-wizard
- [ ] Navigate to `/incidents` page
- [ ] Confirm the in-progress incident appears in the list
- [ ] Click on it to resume
- [ ] Verify the wizard reloads with previously entered data intact
- [ ] Complete and submit the incident

### 1.5 Incident Persists After Browser Reload

- [ ] After submitting a Ransomware incident, reload the page
- [ ] Navigate to `/incidents`
- [ ] Confirm the incident still appears (persisted to database, not lost on reload)

---

## Incident Type 2: Phishing

### 2.1 Wizard Flow

- [ ] Start new incident, select type: **Phishing**
- [ ] Step 2: Fill phishing-specific fields:
  - [ ] Sender email or domain field
  - [ ] Subject line or attack description
  - [ ] Number of affected users (if present)
- [ ] Step 3: Complete classification
- [ ] **Step 4 (Phishing Playbook):**
  - [ ] Playbook loads with Phishing-specific steps (detection/containment/communication)
  - [ ] Steps include email blocking, user notification, credential reset
  - [ ] Roles include: IT, CISO, HR, Legal (check at least 1 Legal or HR step)
  - [ ] Check off 3–5 steps
- [ ] Step 5: Compliance deadlines appear (DSG notification if personal data affected)
- [ ] Step 6: Summary shows "Phishing" incident type

### 2.2 Phishing PDF Export

- [ ] Export PDF from Step 6
- [ ] PDF includes phishing-specific content (sender, affected users, indicators)
- [ ] PDF is correctly formatted

---

## Incident Type 3: DDoS

### 3.1 Wizard Flow

- [ ] Start new incident, select type: **DDoS**
- [ ] Step 2: Fill DDoS-specific fields:
  - [ ] Attack characteristics (source IPs, attack type)
  - [ ] Affected services / systems
- [ ] Step 3: Complete classification
- [ ] **Step 4 (DDoS Playbook):**
  - [ ] Playbook loads with DDoS-specific steps
  - [ ] Steps include: upstream ISP notification, mitigation, traffic scrubbing
  - [ ] Check off 3–5 steps
- [ ] Step 5: Compliance deadlines appear as relevant
- [ ] Step 6: Summary shows "DDoS" incident type

### 3.2 DDoS PDF Export

- [ ] Export PDF from Step 6
- [ ] PDF includes network attack details (source IPs, attack type, timeline)

---

## Incident Type 4: Data Loss

### 4.1 Wizard Flow

- [ ] Start new incident, select type: **Data Loss**
- [ ] Step 2: Fill Data Loss-specific fields:
  - [ ] Data classification (personal data? financial? health?)
  - [ ] Affected systems / data stores
  - [ ] Number of affected individuals (if applicable)
- [ ] Step 3: Complete classification (severity)
- [ ] **Step 4 (Data Loss Playbook):**
  - [ ] Playbook loads with Data Loss-specific steps
  - [ ] Steps include: data classification, containment, legal/regulatory notification, customer notification
  - [ ] Roles include Legal, CISO
  - [ ] Check off 3–5 steps
- [ ] **Step 5 (Meldepflichten):**
  - [ ] FINMA deadline appears (24 hours for critical financial data breaches)
  - [ ] FINMA 72-hour deadline for lower severity (verify logic is correct)
  - [ ] DSG notification deadline appears
  - [ ] ISG deadline appears if applicable
- [ ] Step 6: Summary shows "Data Loss" incident type

### 4.2 FINMA Compliance Verification

- [ ] For a critical Data Loss: FINMA deadline = Detection time + 24 hours
- [ ] For a lower severity Data Loss: FINMA deadline = Detection time + 72 hours
- [ ] DSG notification deadline is separately shown (15 days)

### 4.3 Data Loss PDF Export

- [ ] Export PDF from Step 6
- [ ] PDF includes data classification details, affected individuals count, regulatory deadlines

---

## Incident List Page (/incidents)

- [ ] Navigate to `/incidents`
- [ ] All 4 test incidents appear in the list
- [ ] Incident type filter works (filter by "Ransomware" → only Ransomware shows)
- [ ] Severity filter works
- [ ] Sorting works (by date, type, or severity)
- [ ] Clicking an incident opens the detail view or resumes wizard correctly
- [ ] Delete (soft-delete) works — incident disappears from list after confirmation

---

## Mobile Testing

### Device: [Tester's mobile device — iPhone / Android]

- [ ] Open https://siag-incident-assistant.vercel.app on mobile
- [ ] Page loads without horizontal scrolling required
- [ ] "Incident erfassen" button is tappable (minimum 44px touch target)
- [ ] Wizard steps are readable on small screen (375px viewport)
- [ ] All form fields are accessible and tappable
- [ ] Dark mode toggle works on mobile
- [ ] Playbook scrolls smoothly without lag
- [ ] PDF export initiated from mobile browser (download or new tab)
- [ ] `/incidents` page loads and scrolls correctly on mobile

### Slow Network Simulation (Chrome DevTools → Network → 3G)

- [ ] App loads in under 5 seconds on 3G
- [ ] Spinner or loading indicator visible while API calls are in progress
- [ ] Incident save completes within 10 seconds on 3G
- [ ] Error message appears (not blank screen) if request times out

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all form fields on wizard Step 2 — all are reachable
- [ ] Enter key activates focused buttons (Weiter, checkboxes)
- [ ] Focus ring (outline) is visible on focused elements
- [ ] Tab order is logical (top-to-bottom, left-to-right)
- [ ] Escape key closes any open modal or dropdown

### Screen Reader (VoiceOver on Mac: Cmd+F5, or NVDA on Windows)

- [ ] Page title is read: "SIAG Incident Management Assistent"
- [ ] Form labels are associated with their inputs (label for= association)
- [ ] Buttons have descriptive names (not just "Button" or "Click me")
- [ ] Error messages are announced when validation fails
- [ ] Playbook step checkboxes are labeled with step content

### Color Contrast (WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/)

- [ ] Primary text on light background: ≥4.5:1 contrast ratio
- [ ] Primary text in dark mode: ≥4.5:1 contrast ratio on dark background
- [ ] SIAG red (#CC0033) on white: verify meets 3:1 for large text (logo)
- [ ] Severity badge "Kritisch" (red): text is readable
- [ ] Warning/compliance deadline colors: readable at normal text size

---

## Dark Mode

- [ ] Toggle dark mode from the header
- [ ] All wizard steps render correctly in dark mode
- [ ] PDF export still produces a light-background document in dark mode
- [ ] Playbook checkboxes are visible in dark mode
- [ ] Incident list page renders correctly in dark mode
- [ ] Toggle back to light mode — layout reverts cleanly

---

## Data Migration (if v1.0 data present in browser)

_Skip if no v1.0 localStorage data exists in the test browser._

- [ ] If `siag-wizard-state` key exists in localStorage (DevTools → Application → Storage)
- [ ] On first v1.1 load, migration toast appears
- [ ] After reload, v1.0 data is visible in `/incidents` list
- [ ] `siag-wizard-state` key is removed from localStorage after migration
- [ ] `siag-v1-backup` key exists as safety backup (30-day retention)

---

## Performance Spot Check

- [ ] App initial load: under 3 seconds on typical office WiFi
- [ ] Wizard "Weiter" between steps: under 1 second (step transitions are instant)
- [ ] Incident list load (0–10 incidents): under 2 seconds
- [ ] PDF generation: under 30 seconds for a complete incident

---

## Overall Assessment

| Category | Pass / Fail / Partial | Notes |
|----------|-----------------------|-------|
| Ransomware workflow | | |
| Phishing workflow | | |
| DDoS workflow | | |
| Data Loss workflow | | |
| PDF export quality | | |
| FINMA/ISG/DSG compliance logic | | |
| Mobile usability | | |
| Accessibility (keyboard) | | |
| Accessibility (screen reader) | | |
| Color contrast | | |
| Dark mode | | |
| Incident list + resume | | |
| Data migration | | |

---

## Issues Found

| # | Description | Severity | Steps to Reproduce |
|---|-------------|----------|--------------------|
| 1 | | | |
| 2 | | | |

**Severity scale:**
- **Critical** — blocks core workflow, must fix before sign-off
- **Major** — significantly impacts usability, should fix
- **Minor** — cosmetic or low-impact, can be deferred to v1.1.x

---

## UAT Outcome

- [ ] **PASS** — all critical and major items passed; recommend production promotion to v1.1.0
- [ ] **PASS WITH CONDITIONS** — [list conditions below]
- [ ] **FAIL** — critical issues found; re-test required after fixes

**Tester sign-off:** See `SIGN-OFF.md` at project root.
