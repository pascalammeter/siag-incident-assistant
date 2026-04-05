<!-- gsd:generated -->
# Getting Started

## Prerequisites

- **Node.js** 18 or later
- **npm** (bundled with Node.js)
- **Git**

## Clone and Install

```bash
git clone https://github.com/pascalammeter/siag-incident-assistant.git
cd siag-incident-assistant
npm install
```

## Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads on file changes.

## Run the Tests

```bash
npm test
```

Runs all 74 tests via Vitest in watch mode. To run once without watch:

```bash
npx vitest run
```

## Build a Static Export

```bash
npm run build
```

Generates a static site in the `out/` directory. This is what Vercel deploys. To preview the build locally:

```bash
npx serve out
```

## Using the Wizard

The application is a 7-screen incident-response wizard (Step 0 = No-Go interstitial, Steps 1–6 = wizard flow):

| Step | Screen | Purpose |
|------|--------|---------|
| 0 | Vorbereitung | Confirm No-Go rules before starting |
| 1 | Einstieg | Incident acknowledgement ("Shit Happens" button) |
| 2 | Erfassen | Capture incident details: timestamp, affected systems, type |
| 3 | Klassifikation | Answer 3 triage questions → automatic severity (KRITISCH / HOCH / MITTEL) |
| 4 | Reaktion | Work through the ransomware response playbook |
| 5 | Kommunikation | Answer notification obligation questions; generate communication templates |
| 6 | Dokumentation | View complete incident summary; print/export as PDF |

**Recommended walkthrough (ca. 5–8 minutes):** Answer all three classification questions with "Ja" to trigger the KRITISCH path and see the full Swiss legal deadline display.

State is automatically saved to `localStorage` and survives page refreshes. To start fresh, clear site data in your browser's developer tools.

## Project Structure at a Glance

```
src/
├── app/           — Next.js App Router entry (layout, page, styles)
├── components/
│   └── wizard/    — All wizard components (shell, steps, context)
└── lib/           — Shared logic (types, schemas, playbook data, templates)
docs/              — Project documentation
.planning/         — GSD workflow state (phases, plans, requirements)
```

See [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) for a full component and data-flow breakdown.
