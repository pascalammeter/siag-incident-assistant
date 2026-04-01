# STATE.md — SIAG Incident Management Assistent

*Stand: 2026-04-01 | Initialisiert*

## Current Phase
**Bereit für Phase 1** — Projekt initialisiert, Planung abgeschlossen.

## Phase Status

| Phase | Titel | Status |
|-------|-------|--------|
| 1 | Project Foundation | ⬜ Bereit |
| 2 | Wizard Engine | ⬜ Ausstehend |
| 3 | Screens 0–3 (Triage) | ⬜ Ausstehend |
| 4 | Screens 4–5 (Response) | ⬜ Ausstehend |
| 5 | Screen 6 + Polish | ⬜ Ausstehend |
| 6 | Deployment & Review | ⬜ Ausstehend |

## Key Decisions
- Stack: Next.js 15, TypeScript, Tailwind v4, react-hook-form + Zod, useReducer + Context
- Deployment: Vercel static export (`output: 'export'`)
- No vercel.json needed
- Wizard-Komponenten ohne next/* Imports (Plattform-Kompatibilität)
- Tailwind v4: @theme{} in globals.css, kein tailwind.config.js

## Source Assets (Workshop)
- HTML-Prototypen: `../HDT/workshop/Gruppe Incident Management/Phase 4 - Prototyp/`
- UseCase-Spec: `../HDT/spezifikation_kundenplattform/usecase_incident_management/USECASE-IM-V0.1.md`

## Next Step
```
/gsd:plan-phase 1
```
