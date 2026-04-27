# Deployment Guide

## Overview

siag-incident-assistant is deployed to **Vercel** with automatic CI/CD from GitHub. Database state is managed via Neon PostgreSQL.

## Prerequisites

1. **GitHub Account** — push access to the repository
2. **Vercel Account** — connected to your GitHub
3. **Neon Account** — PostgreSQL database (https://console.neon.tech)
4. **Vercel Token** — for CI/CD authentication

## Automatic Deployment

On every push to `main` branch:

1. GitHub Actions runs CI (tests, linting)
2. Vercel detects push and deploys to production
3. Prisma migrations auto-run during deployment (if schema changed)
4. Environment variables loaded from Vercel project settings

## Environment Setup in Vercel

Add these secrets to your Vercel project (Settings → Environment Variables):

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | PostgreSQL connection string | From Neon console |
| `DIRECT_URL` | PostgreSQL direct URL (no pooling) | Required by Prisma migrate |
| `API_KEY` | `sk_live_...` | Production API key |
| `CORS_ORIGIN` | `https://yourdomain.vercel.app` | Allow browser requests |
| `NODE_ENV` | `production` | — |

## Database Migrations

Prisma migrations run automatically during deployment:

```bash
# Manual migration trigger (if needed)
npm run prisma:migrate:deploy
```

To rollback a failed migration:

```bash
# Create rollback migration
npx prisma migrate resolve --rolled-back {migration_name}
```

## Monitoring & Health

Check deployment health:

```bash
curl https://siag-incident-assistant.vercel.app/api/health
```

View logs in Vercel dashboard → Deployments → Logs.

## Rollback Procedure

If a deployment fails:

1. Go to Vercel project dashboard
2. Click **Deployments** tab
3. Select the last known-good deployment
4. Click **Redeploy**

## Performance

- Static assets: cached on Vercel Edge Network
- API routes: served from compute region nearest to request
- Database: Neon provides connection pooling for efficient queries

## Security Checklist

- ✅ Rotate API keys regularly
- ✅ Use separate keys for staging/production
- ✅ Review GitHub Secrets regularly
- ✅ Monitor Vercel Analytics for suspicious traffic
- ✅ Keep Node.js and dependencies updated

See [SECURITY.md](../SECURITY.md) for full security audit.
