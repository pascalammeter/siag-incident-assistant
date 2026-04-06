---
phase: 07-backend-scaffold-design-system
plan: 01a
title: Express Scaffold + TypeScript Configuration
description: Initialize Express app with TypeScript strict mode, configure directory structure, and create npm scripts
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - src/api/index.ts
  - src/middleware/errorHandler.ts
  - src/types.ts
  - src/utils/cors.ts
  - src/utils/auth.ts
  - src/utils/error.ts
autonomous: true
requirements:
  - B1.1
  - B1.2
  - B1.3
  - B1.4
  - B1.5
must_haves:
  truths:
    - "Express app runs locally on localhost:3000 with `npm run dev:backend`"
    - "TypeScript strict mode enabled and builds without errors"
    - "src/ directory structure created with api/, middleware/, and utils"
    - "npm scripts configured: dev:backend, type-check, prisma:generate"
  artifacts:
    - path: src/api/index.ts
      provides: Express app entry point with middleware setup
      contains: "express()"
    - path: tsconfig.json
      provides: TypeScript strict mode configuration
      contains: '"strict": true'
    - path: src/middleware/errorHandler.ts
      provides: Global error handler middleware
      contains: "errorHandler"
    - path: src/types.ts
      provides: Shared TypeScript type definitions
      contains: "IncidentType"
  key_links:
    - from: package.json
      to: src/api/index.ts
      via: "dev:backend script entry point"
      pattern: 'ts-node|tsx'
    - from: tsconfig.json
      to: src/
      via: TypeScript compilation
      pattern: '"strict": true'
---

## Context

**Phase Goal:** Establish backend infrastructure and SIAG design tokens as foundation for all subsequent phases.

**This Plan Accomplishes:**
- Scaffolds Express.js server with TypeScript strict mode enabled
- Creates server-safe directory structure following Vercel Functions conventions
- Sets up npm scripts for development and type checking
- Provides foundation for Phase 01b (Prisma ORM Setup) and Phase 03 (Design System)

**Why This Matters:**
All subsequent phases depend on a working Express app. This plan creates the scaffold quickly so the team can move on to database setup (01b) and design system (03) in parallel.

**Output:**
- Express server running locally on localhost:3000
- TypeScript project with strict type checking enabled
- Ready for Phase 01b (add Prisma ORM) and Phase 03 (add design system)

---

## Execution Context

@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/07-backend-scaffold-design-system/07-RESEARCH.md

---

## Tasks

<task type="auto">
  <name>Task 1: Install backend dependencies (Express, TypeScript)</name>
  <files>package.json</files>
  <action>
Add backend dependencies to package.json:

Express + TypeScript:
```bash
npm install express@5.2.1
npm install -D @types/express @types/node typescript ts-node
```

Utility libraries:
```bash
npm install dotenv@16
npm install -D concurrently
```

Verify installations:
```bash
npm list express typescript
```

The installed versions are the standard stack verified in 07-RESEARCH.md. Preserve existing Next.js config.
  </action>
  <verify>
    <automated>npm list express typescript | grep -E "express|typescript" && echo "✓ Dependencies installed" || echo "✗ Dependencies missing"</automated>
  </verify>
  <done>Express and TypeScript dependencies installed in package.json</done>
</task>

<task type="auto">
  <name>Task 2: Configure TypeScript strict mode</name>
  <files>tsconfig.json</files>
  <action>
Update tsconfig.json to enable strict mode for both Next.js frontend and new backend code.

Read the existing tsconfig.json and update with strict mode settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "app", "components", "lib", "prisma"],
  "exclude": ["node_modules", ".next", "dist"]
}
```

Verify: Run `npx tsc --noEmit` to check for type errors with strict mode enabled.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -q "error TS" && echo "✗ Type errors found" || echo "✓ TypeScript strict mode OK"</automated>
  </verify>
  <done>TypeScript strict mode enabled; tsconfig.json updated with proper path aliases and strict flags</done>
</task>

<task type="auto">
  <name>Task 3: Create backend directory structure and stub files</name>
  <files>
    - src/api/index.ts
    - src/middleware/errorHandler.ts
    - src/types.ts
    - src/utils/cors.ts
    - src/utils/auth.ts
    - src/utils/error.ts
  </files>
  <action>
Create the backend directory structure following Vercel Functions conventions.

**Create directories:**
```bash
mkdir -p src/{api,middleware,utils}
```

**Create stub files:**

1. **src/types.ts** — Shared TypeScript types
```typescript
export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface APIError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}
```

2. **src/middleware/errorHandler.ts** — Global error handler
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

3. **src/utils/cors.ts** — CORS helper
```typescript
export const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
});
```

4. **src/utils/auth.ts** — API key validation
```typescript
import { Request, Response, NextFunction } from 'express';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  
  next();
};
```

5. **src/utils/error.ts** — Error response formatter
```typescript
export const formatErrorResponse = (message: string, details?: any) => ({
  error: message,
  ...(details && { details }),
});

export const formatSuccessResponse = <T>(data: T) => ({
  data,
});
```

All files are minimal stubs; middleware will be expanded in Phase 01b and Phase 03.
  </action>
  <verify>
    <automated>test -d src/api && test -d src/middleware && test -d src/utils && test -f src/types.ts && echo "✓ Directory structure created" || echo "✗ Missing directories or files"</automated>
  </verify>
  <done>Backend directory structure created; stub files in place for middleware, utils, and types</done>
</task>

<task type="auto">
  <name>Task 4: Create Express app entry point with middleware</name>
  <files>src/api/index.ts</files>
  <action>
Create the Express app entry point with TypeScript, middleware setup, and CORS headers for Vercel Functions.

**src/api/index.ts:**
```typescript
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { getCorsHeaders } from '@/utils/cors';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS headers
app.use((req: Request, res: Response, next: NextFunction) => {
  const corsHeaders = getCorsHeaders();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes placeholder (to be implemented in Phase 01b and 02)
app.get('/api/incidents', async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 02' });
});

app.post('/api/incidents', async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 02' });
});

// Swagger UI placeholder (to be implemented in Phase 03)
app.get('/api-docs', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Swagger UI not yet configured — coming in Phase 03' });
});

// Error handler (last middleware)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
  });
}

// For Vercel Functions (serverless)
export default app;
```

**Key design decisions:**
- Follows Vercel Functions conventions (export default app)
- CORS headers set for Vercel CDN + frontend
- Health check endpoint for deployment verification
- Stubbed API routes (to be implemented in Phase 02)
- Stub Swagger endpoint (to be implemented in Phase 03)
  </action>
  <verify>
    <automated>grep -q "export default app" src/api/index.ts && grep -q "express()" src/api/index.ts && echo "✓ Express app created" || echo "✗ Express setup incomplete"</automated>
  </verify>
  <done>Express app entry point created with middleware, CORS, and placeholder routes</done>
</task>

<task type="auto">
  <name>Task 5: Add npm dev scripts for Express</name>
  <files>package.json</files>
  <action>
Update package.json with scripts to run Express backend and Next.js frontend.

**Update scripts section in package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:backend": "ts-node -P tsconfig.json src/api/index.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit"
  }
}
```

**Usage:**
- `npm run dev` — Next.js frontend only (localhost:3000)
- `npm run dev:backend` — Express backend (localhost:3000 during dev)
- `npm run dev:all` — Both frontend + backend concurrently
- `npm run type-check` — Check TypeScript compilation

For Phase 7 verification, we only need `npm run dev:backend` to work.
  </action>
  <verify>
    <automated>grep -q "dev:backend" package.json && grep -q "type-check" package.json && echo "✓ Dev scripts updated" || echo "✗ Scripts incomplete"</automated>
  </verify>
  <done>npm scripts updated with Express dev and type checking support</done>
</task>

<task type="auto">
  <name>Task 6: Verify and commit Phase 07-01a completion</name>
  <files>
    - package.json
    - tsconfig.json
    - src/api/index.ts
    - src/middleware/errorHandler.ts
    - src/types.ts
    - src/utils/
  </files>
  <action>
Run final verification and commit all Phase 07-01a changes.

**Verification checks:**
```bash
# 1. TypeScript compiles
npx tsc --noEmit

# 2. Dependencies are installed
npm list express typescript

# 3. Files exist and have content
test -f src/api/index.ts && test -f src/types.ts && echo "✓ All files present"

# 4. Express starts without errors
npm run dev:backend &
sleep 2
curl http://localhost:3000/health
kill %1
```

**Commit:**
```bash
git add -A
git commit -m "feat(07-01a): express scaffold + typescript configuration

- Install Express 5.2.1 and TypeScript with strict mode
- Create Express app entry point with middleware (CORS, error handler)
- Create directory structure: src/{api,middleware,utils,types}
- Configure TypeScript strict mode, path aliases (@/*)
- Add npm scripts: dev:backend, type-check, dev:all
- Environment setup: dotenv for .env.local

STATUS: Express ready on localhost:3000; ready for Phase 01b (Prisma ORM)
"
```
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | grep -q "error TS" && echo "✗ Type errors" || (test -f src/api/index.ts && echo "✓ Phase 07-01a ready")</automated>
  </verify>
  <done>Express scaffold created and committed; ready for Phase 01b Prisma setup</done>
</task>

</tasks>

---

## Threat Model

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-01 | Information Disclosure | Express app misconfiguration | mitigate | Environment variables for secrets via .env.local (gitignored); default CORS_ORIGIN for localhost only in dev |
| T-07-02 | Denial of Service | Unprotected Express endpoints | mitigate | Rate limiting configured in Phase 01b; health check protected by CORS |
| T-07-03 | Access Control | No authentication yet | accept | Phase 01b adds API key middleware; full auth scope deferred |

---

## Verification

After Phase 07-01a completion:
- [ ] `npx tsc --noEmit` returns no type errors
- [ ] `npm list express typescript` shows correct versions
- [ ] `npm run dev:backend` starts Express on localhost:3000
- [ ] `curl http://localhost:3000/health` returns `{"status":"ok"}`
- [ ] All stub files created (errorHandler, cors, auth, error, types)
- [ ] npm scripts include dev:backend and type-check

---

## Success Criteria

Phase 07-01a is complete when:
1. Express app runs on localhost:3000 with `npm run dev:backend`
2. TypeScript strict mode enabled and builds without errors
3. Directory structure created: src/{api,middleware,utils}
4. All stub files in place for Phase 01b expansion
5. npm scripts configured for development workflow

---

## Next Plan

**Phase 07-01b: Prisma ORM Initialization** — Install @prisma/client, initialize schema, create serverless-safe PrismaClient singleton, configure .env.local with database placeholders.
