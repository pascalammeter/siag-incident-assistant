---
phase: 11
phase_name: Multi-Type Playbooks + Forms
phase_goal: Support 4 incident types with dedicated playbooks (25-point checklists each), inline form validation with helper text, and improved error feedback
dependencies:
  - Phase 10 (motion + PDF + dark mode + design system)
milestone: v1.1
source: ROADMAP.md
---

# Phase 11 Context — Multi-Type Playbooks + Forms

## Overview

Phase 11 extends the incident response wizard to support 4 distinct incident types, each with a tailored 25-point playbook. Users select the incident type in Step 1, and the wizard immediately loads the correct playbook in Step 4. Form validation is enhanced with onBlur triggers, inline error messages, and helper text for complex inputs.

**Depends on:** Phase 10 (all motion, PDF export, dark mode, and design system complete)

## Requirements (Extracted from ROADMAP)

### M1: Phishing Playbook (25 points)
- M1.1: Create Phishing playbook with 25 steps across 4 phases
- M1.2: Phase 1: Detection (identify phishing indicators, report email)
- M1.3: Phase 2: Containment (block sender, revoke credentials, notify users)
- M1.4: Phase 3: Investigation (log forensics, user interaction tracking)
- M1.5: Phase 4: Communication (stakeholder updates, recovery timeline)

### M2: DDoS Playbook (25 points)
- M2.1: Create DDoS playbook with 25 steps across 4 phases
- M2.2: Phase 1: Detection (traffic analysis, performance degradation, alert response)
- M2.3: Phase 2: Mitigation (ISP notification, rate limiting, DDoS service activation)
- M2.4: Phase 3: Upstream Notification (carrier/upstream provider contact)
- M2.5: Phase 4: Communication (status pages, stakeholder updates, RTO tracking)

### M3: Data Loss Playbook (25 points)
- M3.1: Create Data Loss playbook with 25 steps across 4 phases
- M3.2: Phase 1: Detection (data discovery, scope assessment, exfiltration indicators)
- M3.3: Phase 2: Containment (access revocation, device isolation, account reset)
- M3.4: Phase 3: Investigation (log collection, ransom note analysis, threat actor identification)
- M3.5: Phase 4: Communication (stakeholder notification, ransom decision, law enforcement contact)

### M4: Type Selection & Playbook Loading
- M4.1: Wizard Step 1 includes radio buttons for type selection (Ransomware, Phishing, DDoS, Data Loss, Other)
- M4.2: Step 4 dynamically loads correct playbook based on incident_type from Step 1 state
- M4.3: Playbook can be re-classified if type changes during response (re-load on type change)
- M4.4: "Other" incident type uses generic playbook (25 steps, generic language)

### P2: Form Validation (onBlur + Display)
- P2.1: Validation triggered on field blur (not just submit)
- P2.2: Required fields marked with red asterisk (*) in label
- P2.3: Error messages display immediately below field on validation failure
- P2.4: Error text in red (#CC0033), field border changes to red
- P2.5: Validation cleared on field change/re-blur if error resolved

### P3: Helper Text
- P3.1: Multi-select fields (e.g., affected departments) include helper text with max selection limits
- P3.2: Date fields (e.g., discovery date) include helper text explaining format and constraints
- P3.3: Complex text areas (e.g., description) include placeholder text with character limit indicator
- P3.4: Helper text appears below field in lighter gray, non-intrusive

### P4: Error Handling & Feedback
- P4.1: Save button shows loading spinner while API request in flight
- P4.2: Save button disabled during API request to prevent double-submit
- P4.3: API validation errors (400) mapped to user-friendly field-level messages
- P4.4: Network errors and API failures trigger toast notification with retry option

### P5: Error Message Mapping
- P5.1: Technical Zod errors mapped to user-friendly messages ("Field is required" not "String.required")
- P5.2: API-level errors (validation, database) mapped to field-level feedback or general toast
- P5.3: Common scenarios documented (missing field, invalid format, duplicate entry)
- P5.4: Toast design: dismiss button, dark/light mode awareness, 4-5s auto-dismiss

## Success Criteria

All must be TRUE:

1. ✅ Phishing playbook (25 points) covers detection, containment, investigation, communication with phishing-specific content
2. ✅ DDoS playbook (25 points) covers detection, mitigation, upstream notification, communication with DDoS-specific content
3. ✅ Data Loss playbook (25 points) covers detection, containment, investigation, communication with data loss-specific content
4. ✅ Wizard Step 4 loads correct playbook based on incident_type selected in Step 1; can be re-classified if needed
5. ✅ Form validation triggered on blur (not just submit); error messages display immediately below field with red border; required fields marked with (*)
6. ✅ Helper text below complex inputs (multi-select, date) explains constraints and provides examples
7. ✅ Save button shows loading spinner during API request; disabled to prevent double-submit; error toast appears if request fails
8. ✅ API errors mapped to user-friendly messages (not technical error codes)

## Data Structure

### Playbook Content (in data/playbooks.ts)

```typescript
interface Playbook {
  type: 'ransomware' | 'phishing' | 'ddos' | 'data-loss' | 'other';
  title: string;
  description: string;
  steps: PlaybookStep[];
  sections: PlaybookSection[];
}

interface PlaybookStep {
  number: number;
  section: 'detection' | 'containment' | 'investigation' | 'communication';
  title: string;
  action: string;
  responsible: string;
  timeframe: string;
  dependencies?: number[]; // step numbers that must be completed first
}

interface PlaybookSection {
  name: 'detection' | 'containment' | 'investigation' | 'communication';
  steps: number[]; // indices into steps array
}
```

### Validation Schema (utils/validation.ts)

- Extend existing Zod schemas with type-specific validation
- Helper functions for onBlur validation (debounced, immediate feedback)
- Error message mapping object (Zod code → user-friendly message)

## Wave Structure

- **Wave 1**: 11-01 (Phishing) + 11-02 (DDoS/Data Loss) + 11-03 (Form Validation) — parallel, no conflicts
- **Wave 2**: 11-04 (Error Mapping) — depends on 11-03 completion

## Testing Strategy

- Unit tests for playbook loading logic (type selection → correct playbook)
- Integration tests for form validation (onBlur + error display)
- Integration tests for error mapping (API error → user message)
- E2E: Select type, enter form data, trigger validation error, submit with API error, see toast
- Visual regression: error states, helper text, toast notifications in light/dark modes

## UI/UX Notes

- **Type Selector**: Radio buttons in Step 1, visually distinct, can change at any time
- **Playbook Display**: Table format (from Phase 6 feedback), 25 rows with section headers, progress indicator
- **Error Styling**: Red borders, red text, consistent with design system (#CC0033)
- **Toast**: Bottom-right or top-right, 4-5s auto-dismiss, dark/light aware
- **Loading Spinner**: Same as Phase 10 (Motion), 1s rotation, 12-frame animation
