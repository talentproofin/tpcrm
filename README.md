# TalentProof Sales CRM (TPCRM)

Internal Sales CRM for TalentProof.

## Status

**MVP complete** — production readiness audit (Milestone 20B) applied.

## Tech Stack

- Next.js 15 (App Router)
- JavaScript + JSDoc
- Tailwind CSS + shadcn/ui
- Supabase (Auth, PostgreSQL, RLS)
- Zod validation

## Getting Started

```bash
npm install
cp .env.example .env.local   # configure Supabase keys
npm run verify:env
npm run dev
```

## Quality Commands

```bash
npm run lint
npm run build
npm run verify:infra
npm run verify:env
```

## Project Structure

```
src/
├── app/              # Routes (dashboard, auth, API)
├── components/       # Shared UI
├── features/         # Feature modules
├── services/         # Infrastructure (Supabase, logging)
├── config/           # Environment configuration
├── constants/        # Global constants
├── utils/            # Shared utilities
└── middleware.js     # Auth session + route protection
```

## Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](./docs/deployment/README.md) | Production deployment |
| [Environment Variables](./docs/deployment/environment-variables.md) | Configuration |
| [Production Checklist](./docs/deployment/production-checklist.md) | Pre-launch checklist |
| [Manual QA](./docs/deployment/manual-qa-checklist.md) | Full regression checklist |
| [Architecture](./docs/deployment/architecture-diagram.md) | System diagram |
| [Database](./docs/deployment/database-diagram.md) | Schema diagram |
| [Technical Debt](./docs/deployment/technical-debt.md) | Known follow-ups |
| [Domain Model](./docs/domain/domain-model.md) | Business entities |
| [Persistence](./docs/persistence/persistence-design.md) | Database design |
| [Standards](./docs/standards/project-standards.md) | Coding standards |

## Path Aliases

`@/*` → `src/*`

## Security

- Row Level Security on all application tables
- Service role key server-only (`server-only` guard on admin client)
- Middleware enforces authentication on protected routes
- Admin API routes require active admin session
