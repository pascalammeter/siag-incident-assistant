# Phase 16: Playbook + Migration Cleanup

**Phase:** 16-playbook-migration-cleanup  
**Status:** ⏳ Planned (2026-04-15) — Ready for execution  
**Plans:** 2/2 (both ready for execution)  
**Wave Structure:** Wave 1 (parallel)

## What This Phase Does

Phase 16 is a **gap closure phase** addressing three small but high-correctness-impact issues from the v1.1 audit:

1. **M3/M4 Playbook Routing** — Fix silent wrong-playbook selection for data_loss incidents
2. **GAP-3 Dead Code** — Remove unused migrationService.ts, clarify active migration path
3. **DE1.1 API Key Security** — Enforce minimum 32-character API_KEY requirement

## Files in This Directory

### Execution Plans
- **16-01-PLAN.md** (287 lines)
  - Fix getPlaybook() type string mapping (both 'data_loss' and 'datenverlust')
  - Remove dead migrationService.ts
  - Add regression tests
  - Estimated: 20-30 minutes

- **16-02-PLAN.md** (304 lines)
  - Generate and update API_KEY to ≥32 characters
  - Ensure .env.local and .env.example consistency
  - Update documentation with security best practices
  - Estimated: 10-15 minutes

### Planning Documentation
- **PHASE-16-PLANNING-SUMMARY.md** (125 lines)
  - Overview of phase goals and plans
  - Success criteria and verification checklist
  - Requirements mapping
  - Risk analysis

- **README.md** (this file)
  - Index and quick reference

## Quick Start

To execute Phase 16:

```bash
# Run both plans in parallel (Wave 1)
/gsd-execute-phase 16

# Or run individual plans
/gsd-execute-plan .planning/phases/16-playbook-migration-cleanup/16-01-PLAN.md
/gsd-execute-plan .planning/phases/16-playbook-migration-cleanup/16-02-PLAN.md
```

## Success Criteria

### 16-01: getPlaybook() + Dead Code Cleanup
- ✅ getPlaybook() handles both 'data_loss' and 'datenverlust' strings
- ✅ Both map to same Data Loss playbook (no silent fallback)
- ✅ migrationService.ts deleted; grep confirms no imports
- ✅ useMigration.ts marked as ACTIVE IMPLEMENTATION
- ✅ 3 new regression tests added and passing
- ✅ All existing playbook tests pass

### 16-02: API_KEY + Env Configuration
- ✅ API_KEY in .env.local ≥32 characters (sk_test_-prefixed)
- ✅ API_KEY in .env.example matches .env.local
- ✅ Both files identical for dev consistency
- ✅ Documentation explains 32+ character requirement
- ✅ Security best practices documented

## Requirements Addressed

| ID | Category | Title | Plan |
|:---|:---------|:------|:-----|
| M3.1–M3.5 | Playbooks | Data Loss playbook routing | 16-01 |
| M4.1–M4.4 | Playbooks | Multi-type support completeness | 16-01 |
| DE1.1 | Deployment | API key security | 16-02 |
| DE5.1–DE5.4 | Deployment | Environment configuration | 16-02 |

## Execution Timeline

**Wave 1 (Parallel)** — Both plans can run simultaneously
- Plan 16-01: 20-30 min (code + tests)
- Plan 16-02: 10-15 min (config + docs)
- **Total:** ~30 minutes (parallel execution)

## Key Code Changes

### 16-01 Changes

**File:** src/lib/playbook-data.ts (lines 191-206)
```typescript
export const getPlaybook = (type: string): Playbook => {
  switch (type) {
    case 'ransomware':
      return RANSOMWARE_PLAYBOOK
    case 'phishing':
      return IMPORTED_PHISHING_PLAYBOOK
    case 'ddos':
      return DDOS_PLAYBOOK
    case 'data_loss':
      return DATA_LOSS_PLAYBOOK
    case 'datenverlust':
      return DATA_LOSS_PLAYBOOK
    default:
      console.warn(`[getPlaybook] Unknown incident type "${type}", falling back to ransomware playbook`)
      return RANSOMWARE_PLAYBOOK
  }
}
```

**File:** src/hooks/useMigration.ts (line 2-6, docstring)
```typescript
/**
 * useMigration() Hook — ACTIVE IMPLEMENTATION
 * Orchestrates v1.0 → v1.1 data migration on app load
 * 
 * NOTE: This is the active migration implementation.
 * src/lib/migrationService.ts is deprecated and deleted.
 * ...
 */
```

**File:** src/lib/migrationService.ts
- **Action:** DELETE (dead code, not imported anywhere)

**File:** src/__tests__/playbooks.test.ts
- **Action:** ADD 3 new test cases (lines 143-175)

### 16-02 Changes

**File:** .env.local (line 12)
```env
API_KEY="sk_test_3a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d"
```
(Generated: `openssl rand -hex 16`)

**File:** .env.example (lines 28, 27, 106)
- Line 28: Update API_KEY value (matches .env.local)
- Line 27: Simplify generation command
- Line 106: Fix openssl command (hex 16, not 32)

## Testing

After execution:

```bash
# Run playbook tests
npm test -- --run src/__tests__/playbooks.test.ts

# Verify API_KEY length
grep "^API_KEY=" .env.local | wc -c  # Should be ~47 (40 chars + quotes + newline)

# Verify migrationService is gone
grep -r "migrationService" src/ 2>/dev/null | wc -l  # Should be 0
```

## Dependencies

- **Depends on:** Phase 13 (gap closure phase)
- **Blocks:** Phase 17 (CI/CD + Swagger Polish)
- **Independent of:** Phase 14, Phase 15

## Next Phase

After Phase 16 completes, proceed to:
- **Phase 17: CI/CD + Swagger Polish** — Verify GitHub Actions CI gates, expose Swagger/OpenAPI via App Router

---

**Planning Complete:** 2026-04-15  
**Ready for Execution:** ✅ YES  
**Estimated Duration:** 30 minutes  
**Complexity:** Low  
