# Research: SIAG Incident Response Assistant — Content & UX Findings

**Date:** 2026-04-01
**Scope:** Ransomware incident response for Swiss CISO audience
**Overall confidence:** HIGH (authoritative sources: NCSC CH, CISA, FINMA, NN/G, ENISA)

---

## 1. Step-Wizard UX Under Stress

**Source confidence: HIGH** (NN/Group, Smashing Magazine, UXmatters 2025)

### Core Finding

Stress fundamentally degrades attention, memory, and decision-making. Users under panic revert to fast, intuitive responses — they stop reading, skip steps, and misclick. The UI must compensate for this degraded state by reducing required cognition to near zero.

### Proven Patterns (prioritized for this project)

**Single-action pages**
Each screen presents exactly one question or one action. Target 10–30 seconds per step. No sidebar navigation, no optional tabs.

**Directive language, not informative language**
Bad: "You should consider isolating the affected systems."
Good: "Isolate infected systems NOW — unplug the network cable."
Crisis UX uses imperative mood and present tense. Parallel: LA wildfire apps that switched from "residents should consider evacuating" to "Evacuate now. Fire is approaching your area."

**Progress indicator requirements for stress contexts**
- Always visible: numbered step indicator (e.g., "Step 3 of 6")
- Show completed steps as visually resolved (checkmark, muted color) — relieves anxiety
- Never allow jumping forward arbitrarily; allow going back to review
- Descriptive step labels in the indicator ("Klassifikation"), not just numbers
- Progress bar alone is insufficient — users need to know what comes next

**Smart defaults, never blank forms**
Pre-populate where possible. Pre-select the most common/safe answer. Force an explicit choice only when the decision truly branches.

**No-back-to-menu design**
The user must never have to navigate to a dashboard to continue. Linear flow only. "Weiter" is always the primary CTA.

**Interruptibility with session persistence**
Ransomware incidents last hours. The user will be pulled away mid-wizard. Save state after every step. Show a "Fortsetzen" resume option on re-entry.

**Error states under stress**
- Never block forward progress with validation errors on optional fields
- Critical required fields: inline, immediate error (not on submit)
- Error messages use concrete language: "Bitte gib an, welche Systeme betroffen sind" not "Pflichtfeld"
- Offer an "Ich weiss es nicht" / "Unbekannt" fallback for every required field

**Color discipline**
No red for status/progress (already adopted in brief: navy + white). Use amber/yellow ONLY for warnings, never for decorative elements. Reserve high-contrast only for the single most critical action on the page.

### What to Avoid

- Multi-column layouts — users in panic fixate on one column and miss the other
- Modal overlays requiring confirmation — adds cognitive overhead
- "Are you sure?" dialogs on forward navigation — the user is already sure
- Breadcrumb menus implying the user can jump to any step freely

---

## 2. Ransomware First-Response Checklist (First 2 Hours)

**Source confidence: HIGH** (NCSC Switzerland, CISA StopRansomware Guide, SANS FOR528)

This is the validated content for the "Reaktionsschritte" phase of the wizard. Steps are ordered by urgency.

### Phase 0: Detection confirmed (minutes 0–5)

1. Alert the incident response team and CISO (if not already involved)
2. Activate incident response plan — do not improvise
3. Document time and date of discovery (starts legal reporting clocks)
4. Assign a dedicated incident coordinator — one person owns decisions

### Phase 1: Immediate containment (minutes 5–30)

5. **Isolate infected systems from the network** — unplug the network cable first; disable Wi-Fi adapters. Prioritize cable-unplug over shutdown.
6. **Do NOT power off infected machines** — volatile RAM contains forensic evidence (encryption keys, attacker tools, C2 addresses). Shutdown destroys this permanently.
7. Isolate backup servers and storage from the network immediately — pause all cloud backup replication
8. Block identified attacker IP/URL addresses on firewall and proxy
9. Disable VPN and remote access connections network-wide
10. Isolate virtualization infrastructure (vCenter, ESXi) if virtual machines are affected

### Phase 2: Assess and preserve (minutes 30–90)

11. Identify which systems are affected — document list
12. Determine if data exfiltration has occurred (check firewall outbound logs)
13. Back up all log files BEFORE any remediation (firewall, proxy, email server, AD)
14. Take memory captures (RAM dumps) of live infected systems before any shutdown
15. Identify the ransomware variant — check ransom note, encrypted file extensions, nomoreransom.org
16. Identify patient zero — how did the attacker get in?

### Phase 3: Escalation and notification (minutes 60–120)

17. Notify executive management and legal counsel
18. Contact cantonal police to file a criminal complaint
19. Engage external forensic IR firm if internal capacity is insufficient
20. Begin legal notification clock assessment (see Section 5)
21. Do NOT contact the attackers without legal counsel present

### Phase 4: Recovery preparation (hours 2+)

22. Verify backup integrity — are backups clean and unencrypted?
23. Identify a clean rebuild path for critical systems
24. Prepare stakeholder communications (internal, customers, media)
25. Check nomoreransom.org for known decryptors before considering payment

---

## 3. Incident Severity Classification

**Source confidence: HIGH** (incident.io, Atlassian, SOC frameworks)

### Recommended Schema: 3-Level (not 4, not P-codes)

For a stressed CISO with no time to debate, three levels with one-sentence criteria are optimal. Use plain German labels, not codes.

| Level | Label | Trigger Criteria | Response |
|-------|-------|-----------------|----------|
| **Kritisch** | Business-critical systems encrypted OR data exfiltration confirmed OR operations halted | Immediate all-hands, CEO notification, external IR firm, 24h reporting clock |
| **Hoch** | Partial systems affected, operations degraded but not stopped, no confirmed exfiltration | Internal IR team activation, legal counsel on standby, monitoring escalation |
| **Mittel** | Single endpoint affected, isolated, no spread evidence, no exfiltration | Internal remediation, documented, monitoring for spread |

### Classification Decision Tree for the Wizard

Ask the user these three binary questions in sequence:

1. "Sind kritische Geschäftssysteme verschlüsselt oder ausser Betrieb?" (Yes → Kritisch)
2. "Gibt es Hinweise auf Datenabfluss?" (Yes → mindestens Hoch)
3. "Hat sich die Infektion auf mehr als einen Rechner ausgebreitet?" (Yes → mindestens Hoch)

If all three are No → Mittel. Any Yes to Q1 → immediately Kritisch regardless of Q2/Q3.

### Criteria That Automatically Escalate to Kritisch

- Ransom note found on systems
- Backup systems also encrypted
- Attacker communicates directly (data leak threat)
- Financial systems (ERP, banking) affected
- Patient/customer PII confirmed exfiltrated

---

## 4. No-Go List for Ransomware (First Minutes)

**Source confidence: HIGH** (NCSC Switzerland, CISA, multiple IR experts)

These must be displayed prominently in the UI — ideally as a dedicated interstitial screen at the start of the wizard, before the user takes any action. Use high-contrast warning styling (amber, not red).

### Critical No-Gos

| # | Do NOT | Why |
|---|--------|-----|
| 1 | **Systeme ausschalten oder neu starten** | RAM-Inhalt wird unwiederbringlich gelöscht — Verschlüsselungsschlüssel, Angreifer-Tools, C2-Adressen gehen verloren |
| 2 | **Lösegeld zahlen** | Keine Garantie auf Entschlüsselung. Zahlung finanziert weitere Angriffe. Kann Sanktionsverstösse auslösen |
| 3 | **Angreifer direkt kontaktieren** | Ohne Rechtsberatung und Strategie. Verhandlungen geben dem Angreifer Informationen und Zeit |
| 4 | **Betroffene Systeme bereinigen oder neu aufsetzen** | Vor der forensischen Sicherung — zerstört Beweise für Strafverfolgung und Versicherung |
| 5 | **Logs, Dateien oder den Erpressungsbrief löschen** | Alle sind Beweismittel. Aufbewahren, kopieren, nicht verändern |
| 6 | **Infektion intern vertuschen** | Verschlimmert Haftung, verhindert rechtzeitige Meldung, verletzt DSG/ISG-Pflichten |
| 7 | **Backup-Systeme ans Netz lassen** | Ransomware sucht aktiv nach Backups — sofort isolieren |
| 8 | **Mit normaler Arbeit weitermachen** | Angreifer haben möglicherweise noch aktiven Zugang — jede Aktivität kann neue Systeme infizieren |

### UI Recommendation

Display this list as a full-screen interstitial between "Vorfall erfassen" and "Klassifikation". Large font, numbered list, amber left-border for each item. One-click confirmation: "Ich habe diese Hinweise gelesen." No option to skip.

---

## 5. Swiss Legal Reporting Obligations

**Source confidence: HIGH** (NCSC/BACS official page, privacydesk.ch, FINMA official, FDPIC guidelines)

Three independent obligations apply simultaneously. They do not replace each other.

### Obligation 1: ISG — Informationssicherheitsgesetz (Critical Infrastructure)

**In force:** 1 April 2025
**Sanktionen ab:** 1 October 2025 (CHF bis 100'000)

| Item | Detail |
|------|--------|
| Who must report | Critical infrastructure operators: energy, water, transport, telecom, hospitals, financial market infrastructure, cantonal/municipal authorities, universities, cloud providers, hardware/software manufacturers |
| Trigger | Attack that threatens operations, involves data manipulation/unauthorized access, includes ransom/extortion |
| Deadline | **24 hours after detection** — initial report can be incomplete |
| Follow-up | Full report within **14 days** |
| How to report | NCSC Cyber Security Hub (online form) or email with NCSC template |
| NCSC form | https://www.ncsc.admin.ch |

**Key nuance:** The 24-hour clock starts at detection (= the moment you know it happened), not at the time of the attack itself.

### Obligation 2: DSG/FADP — Federal Act on Data Protection

**In force:** September 2023

| Item | Detail |
|------|--------|
| Who must report | Any data controller (private or public) processing personal data |
| Trigger | Data security breach "likely to result in a high risk to the personality or fundamental rights" of affected persons. Ransomware with PII access = almost certainly triggers this. |
| Deadline | "As soon as possible" — no explicit hours defined. GDPR-equivalent urgency expected. |
| Who to report | FDPIC (Federal Data Protection and Information Commissioner) via DataBreach online portal |
| Affected persons | Must also be notified individually if their protection requires it |

**Key nuance:** The threshold is "high risk" (higher than GDPR's "risk"). Encrypted PII in a ransomware attack almost always meets this threshold. FDPIC can also order notification of affected persons.

### Obligation 3: FINMA (Banks and Financial Institutions Only)

| Item | Detail |
|------|--------|
| Who must report | Banks (Banking Act), insurance companies (Insurance Supervision Act), financial market infrastructures (FMIA) |
| Trigger | Cyber attacks of "substantial importance" — attacks on critical functions that cause failure or malfunction |
| Initial deadline | **24 hours** — informal report to FINMA key account manager (email, phone), including criticality assessment |
| Full report deadline | **72 hours** — comprehensive report |
| Out-of-hours | "Serious" severity incidents must also be reported outside business hours within 24h |
| Note | FINMA obligation is independent of ISG obligation — both may apply simultaneously |

### Reporting Decision Tree for the Wizard ("Kommunikation" step)

Ask in sequence:

1. "Ist Ihre Organisation Teil der kritischen Infrastruktur der Schweiz?" → Yes: **ISG 24h-Meldung an NCSC erforderlich**
2. "Wurden personenbezogene Daten verschlüsselt, gestohlen oder zugänglich gemacht?" → Yes: **DSG-Meldung an EDÖB erforderlich**
3. "Ist Ihre Organisation von FINMA reguliert (Bank, Versicherung, FMI)?" → Yes: **FINMA 24h-Meldung erforderlich + 72h-Vollbericht**

Generate a pre-filled notification summary the user can copy/export.

### Practical Timing Reference

| Hour | Action |
|------|--------|
| 0 | Attack detected |
| 0–1 | Isolate systems, activate IR team |
| 1–4 | Assess scope, classify severity |
| By hour 24 | ISG report to NCSC (if applicable) + FINMA initial report (if applicable) |
| As soon as possible | DSG/FADP report to FDPIC (if PII affected) |
| Day 14 | Complete ISG detailed report |
| Day 72 (hours) | FINMA full report |

---

## 6. UX Implications for Each Wizard Step

Direct mapping of research findings to the 6 prototype steps:

### Step 1: Einstieg
- Show the No-Go list as an interstitial before anything else
- "Bist du bereit?" confirmation button — large, calm, not alarming
- Brief one-sentence explanation of what the wizard does ("Ich führe dich Schritt für Schritt durch die nächsten Stunden")

### Step 2: Vorfall erfassen
- 3–4 fields maximum: Datum/Uhrzeit, betroffene Systeme (multiselect), erste Symptome (text), wer hat es entdeckt
- "Unbekannt" option on every field — do not block progress
- Auto-timestamp "Jetzt" button for discovery time (starts legal clock)

### Step 3: Klassifikation
- Three binary yes/no questions (see Section 3 above)
- Auto-derive severity level from answers
- Show resulting severity level with a brief explanation ("Das bedeutet: Sofortmassnahmen erforderlich")
- Allow manual override with reason field

### Step 4: Reaktionsschritte
- Render as a checklist derived from Section 2 above, filtered by severity level
- Kritisch = all 25 steps; Mittel = subset (steps 1–16)
- Each item has a checkbox + optional notes field
- Checked items move to "Erledigt" section
- Red-bordered unchecked critical items if user tries to proceed
- "Externe IR-Firma beauftragen" step should include a pre-filled call-to-action (SIAG contact)

### Step 5: Kommunikation
- Run the three-question reporting decision tree (Section 5)
- Output: auto-generated list of required reports with deadlines
- Show countdown: "Noch X Stunden bis zur NCSC-Meldepflicht"
- Draft notification text the user can copy — pre-filled from Step 2 data
- Links to: NCSC Cyber Security Hub, EDÖB DataBreach portal, FINMA contact

### Step 6: Dokumentation
- Auto-generate incident report PDF from all wizard inputs
- Timeline reconstruction from timestamps entered in earlier steps
- Export: PDF + JSON (for insurance, legal, police)
- "Neuen Vorfall starten" button — not "Schliessen" (implies incompleteness)

---

## 7. Sources

- [NCSC Switzerland — Ransomware](https://www.ncsc.admin.ch/ncsc/en/home/infos-fuer/infos-unternehmen/vorfall-was-nun/ransomware.html)
- [NCSC Switzerland — Meldepflicht ab 1. April 2025](https://www.ncsc.admin.ch/ncsc/en/home/aktuell/im-fokus/2025/meldepflicht-2025.html)
- [Privacy Desk Suisse — New Mandatory Notification April 2025](https://privacydesk.ch/en/new-mandatory-notification-of-cyberattacks-what-changes-from-april-1-2025/)
- [FDPIC — Guidelines on Data Breaches](https://www.edoeb.admin.ch/en/guidelines-data-breach)
- [FINMA Cyber Risk Obligations — VISCHER](https://www.vischer.com/en/knowledge/blog/cyber-security-obligations-for-financial-services-providers-in-switzerland-40184/)
- [CISA — StopRansomware Guide (October 2023, updated 2025)](https://www.cisa.gov/stopransomware/ive-been-hit-ransomware)
- [SANS Institute — FOR528 Ransomware and Cyber Extortion](https://www.sans.org/mlp/ransomware/)
- [NN/Group — Wizards: Definition and Design Recommendations](https://www.nngroup.com/articles/wizards/)
- [Smashing Magazine — Designing For Stress And Emergency (2025)](https://www.smashingmagazine.com/2025/11/designing-for-stress-emergency/)
- [UXmatters — UX Design for Crisis Situations (March 2025)](https://www.uxmatters.com/mt/archives/2025/03/ux-design-for-crisis-situations-lessons-from-the-los-angeles-wildfires.php)
- [incident.io — Designing Your Incident Severity Levels](https://incident.io/blog/designing-your-incident-severity-levels)
- [Compliancehub.wiki — Switzerland 24-Hour Cyberattack Reporting](https://www.compliancehub.wiki/switzerlands-new-24-hour-cyberattack-reporting-mandate/)
