# Handover: SIAG Incident Assistant

> Kontextdokument für die finale Übernahme durch die **Swiss GRC AG**, Schwesterfirma der Swiss Infosec AG. Swiss GRC entwickelt und betreibt die SIAG-Kundenplattform, in die dieser Prototyp als Beratungs-Modul überführt wird.
>
> Stand: 2026-04-27 · Verantwortlich Übergabe: Pascal Ammeter (Head Digital Transformation, SIAG) · pascal.ammeter@infosec.ch

## 1. Geschäftskontext (TL;DR)

Der **SIAG Incident Assistant** ist ein Beratungs-Modul für Schweizer Organisationen, das den Incident-Response-Prozess (Detection → Analysis → Containment → Recovery → Lessons Learned) interaktiv begleitet. Zielnutzer: CISOs, Incident Manager, Security-Verantwortliche bei SIAG-Kunden.

Fachliche Differenzierung: Schweizer Regulierungs-Kontext (nDSG-Meldepflicht, FINMA-Vorgaben), Playbook-Logik, Audit-trail-fähig.

## 2. Reifegrad

- **v1.1 freigegeben:** SIGN-OFF.md (vom 2026-04-08) dokumentiert formale Abnahme der ersten Version
- **Stabil:** Core-Workflow, Datenmodell (siehe `docs/DATABASE_SCHEMA.md`), API-Layer
- **Bekannte Schulden:** siehe Abschnitt 7

## 3. Wo lese ich was?

| Frage | Dokument |
|-------|----------|
| Wie starte ich lokal? | `docs/GETTING-STARTED.md` |
| Architektur? | `docs/ARCHITECTURE.md` |
| API-Referenz? | `docs/API.md` + `docs/API_ERROR_CODES.md` |
| Datenbank-Schema? | `docs/DATABASE_SCHEMA.md` (+ ER-Diagramm `.mmd`) |
| Konfiguration? | `docs/CONFIGURATION.md` + `.env.example` |
| Integration in andere Systeme? | `docs/INTEGRATION_GUIDE.md` |
| Security & OWASP? | `docs/OWASP_CHECKLIST.md` + `docs/SECURITY_AUDIT.md` + `SECURITY.md` |
| Performance? | `docs/PERFORMANCE_BENCHMARKS.md` |
| Test-Coverage? | `docs/TEST_COVERAGE.md` + `docs/TESTING.md` |
| Deployment? | `docs/DEPLOYMENT.md` |
| Formale Abnahme v1.1? | `SIGN-OFF.md` |
| Architektur-Entscheidungen? | `docs/decisions/` |

## 4. Tech-Stack auf einen Blick

- **Framework:** Next.js (siehe package.json), TypeScript
- **ORM:** Prisma → Postgres
- **Tests:** existierender Test-Coverage-Report `docs/TEST_COVERAGE.md`
- **Security-Audit:** durchgeführt, dokumentiert in `docs/SECURITY_AUDIT.md` und `docs/OWASP_CHECKLIST.md`

## 5. Sicherheits- und Compliance-Vorgaben

Der Incident Assistant verarbeitet potentiell hochsensible Daten (Incident-Details, Betroffenenkreise). Vor Produktiv-Schaltung verbindlich:

1. RLS-/ACL-Policies in der Datenbank gegen `docs/SECURITY_AUDIT.md` prüfen
2. Audit-Trail für alle Incident-Mutationen aktiv
3. Datenresidenz Schweiz (Hosting in CH-Region)
4. nDSG-Meldepflichten (24h/72h) im Workflow korrekt abgebildet

## 6. Entscheidungen, die Externe nicht ohne Rücksprache umkehren sollten

- Prisma + Postgres als Persistenz — kein Swap auf andere ORMs ohne Architektur-Review
- Audit-Trail darf nicht aus Performance-Gründen reduziert werden
- Schweiz-Compliance-Vorgaben (siehe `docs/SECURITY_AUDIT.md`) sind nicht-verhandelbar

## 7. Bekannte Schulden / offene Punkte

- [ ] Branding für Swiss GRC Kundenplattform-Integration noch nicht angewendet
- [ ] Multi-Tenant-Trennung für Plattform-Kontext finalisieren
- [ ] Feature-Flag-Strategie für progressive Rollout

## 8. Erste 5 Tage als Swiss GRC Entwickler

1. **Tag 1:** `docs/GETTING-STARTED.md` durcharbeiten, lokales Setup, Prisma-Migration anwenden, App lokal laufen.
2. **Tag 2:** `docs/ARCHITECTURE.md` und `docs/DATABASE_SCHEMA.md` lesen, ER-Diagramm visualisieren.
3. **Tag 3:** `SIGN-OFF.md` und `docs/SECURITY_AUDIT.md` durcharbeiten — was ist abgenommen, was offen.
4. **Tag 4:** Test-Coverage-Report (`docs/TEST_COVERAGE.md`) sichten, Tests laufen lassen.
5. **Tag 5:** Walkthrough mit Übergabe-Verantwortlichem.

## 9. Ansprechpartner

- **Übergabe & Fachlich:** Pascal Ammeter (HDT, SIAG) — pascal.ammeter@infosec.ch
- **Swiss GRC AG Entwickler-Lead:** _einzutragen_

## 10. Hinweis zur Commit-Historie

Während der Prototyp-Phase wurde Claude Code als KI-Pair-Programmer eingesetzt. Commits dieser Phase erscheinen daher als Author `Claude Code`. Inhaltlich verantwortet sind alle Änderungen durch Pascal Ammeter.
