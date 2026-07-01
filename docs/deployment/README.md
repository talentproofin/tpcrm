# TPCRM Deployment Guide

Production deployment guide for TalentProof CRM.

## Prerequisites

- Node.js 20 LTS or newer
- Supabase project (PostgreSQL 15+)
- Environment variables configured (see [Environment Variables](./environment-variables.md))

## Build

```bash
npm ci
cp .env.example .env.local   # configure for target environment
npm run verify:env
npm run lint
npm run build
```

## Database Migrations

Apply migrations in order from `supabase/migrations/`:

```bash
supabase db push
# or apply SQL files manually in timestamp order
```

See [Database Migration Checklist](./database-migration-checklist.md).

## Deploy Application

### Vercel (recommended)

1. Connect repository
2. Set environment variables in project settings
3. Deploy from `main` branch
4. Verify `/login` and `/dashboard` after deploy

### Self-hosted

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_APP_URL` to the public URL.

## Post-deploy Verification

1. Sign in as Admin
2. Confirm dashboard loads
3. Open Settings → System Information
4. Verify migration version matches latest migration
5. Run [Manual QA Checklist](./manual-qa-checklist.md) smoke tests

## Related Documents

| Document | Purpose |
|----------|---------|
| [Environment Variables](./environment-variables.md) | Required configuration |
| [Production Checklist](./production-checklist.md) | Pre-launch checklist |
| [Release Checklist](./release-checklist.md) | Release process |
| [Rollback Checklist](./rollback-checklist.md) | Rollback procedure |
| [Backup Checklist](./backup-checklist.md) | Database backup |
| [Architecture Diagram](./architecture-diagram.md) | System overview |
| [Database Diagram](./database-diagram.md) | Schema overview |
