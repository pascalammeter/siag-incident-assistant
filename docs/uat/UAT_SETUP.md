# UAT Environment Setup — SIAG Incident Assistant v1.1

## Overview

This document provides setup instructions for the User Acceptance Testing (UAT) of
SIAG Incident Assistant v1.1. It is intended for the SIAG consultant conducting the
official acceptance test prior to production promotion.

---

## Production URL (UAT Target)

**https://siag-incident-assistant.vercel.app**

This is the live production deployment. UAT is conducted directly against production — no
separate staging environment is required, as the application does not store sensitive
personal data and all incidents created during UAT can be deleted afterward.

---

## What Is Being Tested

v1.1 is a significant upgrade from v1.0 (browser-only prototype). Key new capabilities:

| Feature | v1.0 | v1.1 |
|---------|------|------|
| Incident storage | Browser localStorage (lost on clear) | Persistent PostgreSQL (Neon) |
| Incident types | Ransomware only | Ransomware, Phishing, DDoS, Data Loss |
| Playbooks | 20-step Ransomware | 25-step per type (4 types) |
| PDF export | Browser print dialog | Professional formatted PDF document |
| Incident list | Not available | Sortable, filterable `/incidents` page |
| Dark mode | System preference | Toggle in header |
| Compliance deadlines | ISG/DSG/FINMA auto-calculated | Same, plus FINMA 24/72h |
| Mobile | Responsive | Tested 375px+ |
| Data migration | — | v1.0 localStorage data auto-migrated on first load |

---

## Access Instructions

1. Open **https://siag-incident-assistant.vercel.app** in any modern browser
2. No login required — the wizard is accessible without authentication
3. To view the incident list, click the "Incidents" link in the header navigation
4. All data submitted during UAT is persisted to the production database

**Recommended browsers:** Chrome 120+, Firefox 121+, Safari 17+ (macOS/iOS)

---

## UAT Timeline

| Phase | Duration | What Happens |
|-------|----------|--------------|
| Orientation | 15 min | Review this setup doc, open app, familiarize |
| Functional testing | 90 min | Complete UAT_CHECKLIST.md for all 4 incident types |
| Mobile testing | 20 min | Repeat key steps on mobile device |
| Accessibility audit | 15 min | Keyboard navigation, screen reader, contrast |
| Debrief / sign-off | 30 min | Document findings, provide written sign-off if approved |
| **Total** | **~2.5–3 hours** | |

---

## What to Bring

- Laptop with Chrome or Firefox (for Lighthouse/DevTools if needed)
- Mobile device (iPhone or Android) for mobile testing
- The UAT checklist: [`docs/uat/UAT_CHECKLIST.md`](./UAT_CHECKLIST.md)
- Screen recording software (optional, for documenting issues)

---

## Data Isolation During UAT

- All incidents created during UAT are real records in the production database
- They are soft-deletable — the admin can mark them `deletedAt` after UAT completes
- No personal or sensitive data should be entered; use fictional test data (e.g., "Test AG", test IPs)
- v1.0 localStorage data (if present in the browser) will be auto-migrated on first visit

---

## If You Find a Critical Issue

1. Stop the affected test case
2. Document: which step failed, what was expected, what actually happened (screenshots welcome)
3. Continue testing unrelated functionality
4. Report to the development team before the sign-off meeting

Minor cosmetic issues (alignment, wording) can be logged as post-launch improvements and
do not block sign-off unless they affect core functionality.

---

## Post-UAT Cleanup

After sign-off:

- Development team will tag `v1.1.0` on GitHub
- UAT test incidents will be soft-deleted from the production database
- This document will be archived in `docs/uat/`

---

## Contact

Project: pascalammeter/siag-incident-assistant (GitHub)

For technical issues during UAT, contact the development team directly.
