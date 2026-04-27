# Phase 16: Playbook + Migration Cleanup — Planning Complete

**Date:** 2026-04-15
**Status:** ✅ Planning Complete — Ready for Execution

## Overview

Phase 16 addresses three high-correctness-impact gaps from the v1.1 audit:

1. **Silent Wrong-Playbook Bug** — getPlaybook() doesn't explicitly handle both 'data_loss' (API) and 'datenverlust' (wizard) strings, risking silent fallback to ransomware for data loss incidents
2. **Dead Code** — migrationService.ts exists but useMigration.ts is the active implementation; creates confusion about source of truth
3. **Weak API Key** — API_KEY in .env files is only 31 chars; fails validation requiring ≥32 chars

## Plans Created

### 16-01-PLAN.md: Fix getPlaybook() Type String Mapping + Dead Code Cleanup

**Objective:** Ensure getPlaybook() correctly handles both wizard-internal ('datenverlust') and API ('data_loss') type strings without silent fallback. Remove dead migrationService.ts and mark useMigration.ts as active.

**Tasks:** 3
- Task 1: Fix getPlaybook() switch to explicitly handle both type strings + log warning for unknowns
- Task 2: Delete src/lib/migrationService.ts; add ACTIVE IMPLEMENTATION marker to useMigration.ts
- Task 3: Add regression test cases for data_loss/datenverlust equivalence and fallback behavior

**Files Modified:**
- src/lib/playbook-data.ts (lines 191-206 — switch statement)
- src/lib/migrationService.ts (delete)
- src/hooks/useMigration.ts (add code comment)
- src/__tests__/playbooks.test.ts (add 3 new test cases)

**Estimated Duration:** 20-30 minutes
**Complexity:** Low (code changes are straightforward, well-defined)

---

### 16-02-PLAN.md: Fix API_KEY Length + Env Docs

**Objective:** Update API_KEY in .env.local and .env.example to meet minimum 32-character requirement. Ensure both files use identical dev key for consistency.

**Tasks:** 3
- Task 1: Generate new 32-char API key using `openssl rand -hex 16`, format as sk_test_{hex}
- Task 2: Update .env.local and .env.example with new key; clarify documentation
- Task 3: Verify both files match and meet requirements

**Files Modified:**
- .env.local (line 12)
- .env.example (line 28, 27, 106 — key value and documentation)

**Estimated Duration:** 10-15 minutes
**Complexity:** Very Low (configuration-only changes, no code)

---

## Wave Structure

Both plans run in **Wave 1 (parallel)** — no file dependencies between them:
- 16-01 modifies src/ (playbooks, hooks, tests)
- 16-02 modifies .env files only

Can execute simultaneously.

---

## Success Criteria

### 16-01 Success
- [ ] getPlaybook() switch explicitly lists both 'data_loss' and 'datenverlust' cases
- [ ] Both cases return DATA_LOSS_PLAYBOOK (verified in code)
- [ ] Default case logs console.warn (visible in logs, not silent)
- [ ] migrationService.ts deleted (confirmed via grep -r)
- [ ] useMigration.ts has ACTIVE IMPLEMENTATION code comment
- [ ] 3 new regression tests added and passing
- [ ] All existing playbook tests pass (no regression)

### 16-02 Success
- [ ] .env.local API_KEY is sk_test_{32_char_hex} = 40 total chars
- [ ] .env.example API_KEY is same value as .env.local
- [ ] Both files have identical API_KEY
- [ ] Documentation explains 32+ char minimum
- [ ] openssl generation command consistent across docs

---

## Requirements Coverage

| Requirement | Plan | Task | Coverage |
|-----------|------|------|----------|
| M3.1–M3.5 | 16-01 | Task 1 | getPlaybook() switch, data_loss case, tests |
| M4.1–M4.4 | 16-01 | Task 1 | getPlaybook() return correctness, no fallback |
| DE1.1 | 16-02 | Task 1-3 | API_KEY ≥32 chars |
| DE5.1–DE5.4 | 16-02 | Task 1-3 | Env configuration, security best practices |

---

## Blockers & Risks

**None identified.** Both plans are:
- Self-contained (no dependencies on other phases)
- Low complexity (straightforward code/config changes)
- Well-scoped (3 tasks each, clear acceptance criteria)
- Independent execution (can run in parallel)

---

## Next Steps

1. Execute 16-01-PLAN.md and 16-02-PLAN.md in parallel (Wave 1)
2. Verify all success criteria met
3. Run `npm test` to confirm no regressions
4. Create execution summaries for each plan
5. Move to Phase 17 (CI/CD + Swagger Polish)

---

## Files Created

- `.planning/phases/16-playbook-migration-cleanup/16-01-PLAN.md`
- `.planning/phases/16-playbook-migration-cleanup/16-02-PLAN.md`
- `.planning/phases/16-playbook-migration-cleanup/PHASE-16-PLANNING-SUMMARY.md` (this file)

---

**Planning Status:** ✅ COMPLETE
**Ready to Execute:** YES
**Execution Start:** Ready for `/gsd-execute-phase 16`
