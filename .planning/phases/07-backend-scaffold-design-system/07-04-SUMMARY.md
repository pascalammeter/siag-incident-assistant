---
phase: 07
plan: 04
title: Fix Critical Security Issues (CR-01 & CR-02)
subsystem: backend
tags: [security, vulnerability-fix, authentication, type-safety]
status: complete
completed_date: 2026-04-07
duration_minutes: 8
key_files:
  - src/utils/auth.ts
  - src/api/swagger.ts
---

# Phase 7 Plan 04: Fix Critical Security Issues Summary

**Objective:** Fix 2 critical security vulnerabilities identified in code review.

**One-liner:** Fixed timing attack in API key validation using constant-time comparison, and added proper Express type annotations to Swagger handler.

## Tasks Completed

### Task 1: CR-01 - Fix Timing Attack in API Key Validation

**File:** `src/utils/auth.ts`

**Problem:** Used `===` operator for API key comparison, vulnerable to timing attacks where attackers can infer valid key by measuring response time differences.

**Fix Applied:**
- Imported `timingSafeEqual` from Node.js `crypto` module
- Replaced direct string comparison with `timingSafeEqual()` for constant-time comparison
- Wrapped API keys in `Buffer.from()` for proper comparison

**Code Changes:**
```typescript
// Before (vulnerable)
if (!apiKey || apiKey !== process.env.API_KEY) {

// After (secure)
import { timingSafeEqual } from 'crypto';
const isValidKey = apiKey && expectedKey && timingSafeEqual(
  Buffer.from(String(apiKey)),
  Buffer.from(expectedKey)
);
if (!isValidKey) {
```

**Commit:** 2ea7607

### Task 2: CR-02 - Fix Untyped Express Handler Parameters

**File:** `src/api/swagger.ts`

**Problem:** Handler function used `any` types for request and response parameters, bypassing TypeScript type safety.

**Fix Applied:**
- Added `Request, Response` to Express import
- Replaced `(_req: any, res: any)` with `(_req: Request, res: Response): void`
- Proper type annotation ensures compile-time safety

**Code Changes:**
```typescript
// Before (untyped)
export const swaggerJson = (_req: any, res: any) => {

// After (typed)
import { Request, Response } from 'express';
export const swaggerJson = (_req: Request, res: Response): void => {
```

**Commit:** 2ea7607

## Verification

✅ Both files edited and committed
✅ Security fixes applied according to specification
✅ TypeScript types properly imported and used
✅ Return type annotation added for clarity

## Impact

- **Security:** Eliminates timing attack vector on API key validation
- **Type Safety:** Removes unsafe `any` types, enabling TypeScript to catch future errors
- **Compliance:** Addresses critical security findings from code review

## No Deviations

Plan executed exactly as specified. Both vulnerabilities fixed atomically in single commit.
