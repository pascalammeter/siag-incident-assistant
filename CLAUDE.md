# SIAG Incident Management Assistent

## Language

- **Code, commits, comments, file names:** English
- **User-facing content, wizard text, playbook labels, UI copy:** German (Swiss German register — professional, concise, no anglicisms)
- **Planning files and responses to the user:** German unless the user writes in English first

## Workflow

All structured development work goes through GSD skills. Never edit source files directly without a plan.

- Start new work: `/gsd-next` or `/gsd-plan-phase`
- Execute a plan: `/gsd-execute-phase`
- Verify completion: `/gsd-verify-work`
- Quick fixes (1–3 files, no plan needed): `/gsd-fast`
- Hotfix: `/gsd-quick`

Do not create commits outside of GSD execution unless the user explicitly asks.

## Design System

All UI output must follow the SIAG design system. Invoke the `siag-design` skill before writing any HTML, CSS, or React components. Non-negotiables:

- Inter font for all app/dashboard outputs
- Background `#f0f2f5`, surface `#fff`
- Floating Red Pill Navbar as the signature nav element
- `#CC0033` only for: navbar, CTAs, accent bars, alert badges
- Cards use box-shadow only — no borders
- WCAG AA contrast everywhere

## Commit Format

Conventional Commits: `<type>(<scope>): <subject>` — max 72 chars, lowercase, imperative mood.

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

## Architecture Facts

- **Active API:** App Router routes at `/app/api/` — these are what Vercel serves
- **Legacy API:** Express routes at `/src/api/` — not served in production, kept for reference
- **Playbook phase IDs:** German labels (e.g. `Erkennung`, `Eindämmung`) — must match exactly in tests and UI
- **Wizard state:** localStorage-first; backend sync is partial (v1.2 gap work in progress)

## Testing

- Test runner: Vitest
- Run tests: `npm test`
- All new API routes need corresponding tests before the plan is marked complete
- Integration tests use native fetch with `server?.close()` teardown — no mock databases
