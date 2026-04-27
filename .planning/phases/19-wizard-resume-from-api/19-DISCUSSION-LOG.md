# Phase 19: Wizard Resume from API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 19-wizard-resume-from-api
**Areas discussed:** Wizard-Route, Ladezustand, Startschritt, Fehlerbehandlung

---

## Wizard-Route

| Option | Description | Selected |
|--------|-------------|----------|
| /wizard Seite erstellen | `src/app/wizard/page.tsx` liest `searchParams.incident`, übergibt ID an WizardShell. Root `/` bleibt für neue Incidents. Saubere Trennung New vs. Resume. | ✓ |
| Root-Seite erweitern | `src/app/page.tsx` liest `?incident=` aus searchParams. Kein neuer Route-Pfad, aber `/` vermischt New und Resume. | |

**User's choice:** `/wizard` Seite erstellen
**Notes:** `IncidentList.tsx` verweist bereits auf `/wizard?incident=xxx` — die neue Route schließt diesen bestehenden Link.

---

## Ladezustand

| Option | Description | Selected |
|--------|-------------|----------|
| Spinner bis Daten geladen | WizardShell zeigt Ladeindikator bis `getIncident()` zurückkommt. Keine halben Zustände. | ✓ |
| Sofort rendern, still lesen | localStorage-Daten sofort rendern, dann API-Antwort überschreibt Zustand. Schneller, aber Flackern möglich. | |
| Leerer Wizard sofort | API-Daten füllen leere Felder nach Fetch. Kurz leere Felder sichtbar. | |

**User's choice:** Spinner bis Daten geladen
**Notes:** Konsistenz mit bestehendem `isHydrated`-Guard in WizardContext.

---

## Startschritt

| Option | Description | Selected |
|--------|-------------|----------|
| Schritt 0 — Interstitial | Wie bisher: Nutzer sieht Einstiegsscreen, Daten vorausgefüllt. | |
| Schritt 1 — Einstieg | Splash-Screen überspringen, direkt zum ersten Formularschritt. | ✓ |
| Letzter gespeicherter Schritt | Wizard springt direkt dorthin, wo Nutzer aufgehört hat. | |

**User's choice:** Schritt 1 — Einstieg
**Notes:** Interstitial ist beim Resume-Flow irrelevant; Nutzer kennt den Prozess bereits.

---

## Fehlerbehandlung

| Option | Description | Selected |
|--------|-------------|----------|
| Fallback localStorage + Toast | `useIncident.getIncident()` fällt auf localStorage zurück, Toast informiert. | ✓ |
| Fehlermeldung anzeigen | Error-State im Wizard, Nutzer navigiert zurück zur Liste. Kein stiller Fallback. | |
| Leerer Wizard + Toast | API-Fehler → leerer Wizard, Toast informiert. Kein localStorage-Fallback. | |

**User's choice:** Fallback localStorage + Toast
**Notes:** Konsistent mit Phase-9-Fallback-Kette (API → localStorage → leerer Zustand).

---

## Claude's Discretion

- Exaktes Mapping der API `Incident`-Felder auf `WizardState`-Step-Keys
- Ob `WizardProvider` direkt mit `incidentId`-Prop erweitert wird oder ein separater Wrapper verwendet wird
- Genaue Toast-Nachrichtentexte (German, stress-resistant)

## Deferred Ideas

- Auto-save bei jedem Schritt (intermediate saves — neuer Scope)
- "Resume from last step" (Nutzer wählte Schritt 1)
- Loading-Skeleton pro Wizard-Schritt
