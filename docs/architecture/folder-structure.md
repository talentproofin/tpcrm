# Folder Structure

This document explains the purpose of every directory. Do not create folders beyond this structure unless a spec explicitly requires it.

**There is no `src/lib/` directory.**

## Top-Level Layout

```
tpcrm/
├── docs/                  # SDD documentation (source of truth)
├── src/                   # All application code
├── public/                # Static assets
├── supabase/              # Database migrations and edge functions
├── .cursor/               # AI development rules
└── README.md              # Project entry point
```

## `/src` — Application Code

```
src/
├── app/                   # Next.js App Router (routes and layouts only)
├── components/            # Generic reusable UI + shadcn/ui
├── features/              # Independent feature modules
├── hooks/                 # Shared custom hooks
├── services/              # Shared infrastructure services
├── utils/                 # Shared utility functions
├── constants/             # Global constants and enums
├── types/                 # Shared JSDoc type definitions
├── config/                # App configuration and environment access
└── middleware/            # Route protection and request middleware
```

### `/src/app` — Routes Only

Routes import from `features/`. No business logic in `app/`.

| Path | Purpose |
|------|---------|
| `app/(auth)/` | Public routes — pages added in M5 |
| `app/(dashboard)/` | Protected routes — pages added per module |
| `app/api/` | API route handlers (when Server Actions are insufficient) |
| `app/layout.js` | Root layout |
| `app/globals.css` | Global styles and Tailwind imports |

### `/src/components` — Generic Reusable UI Only

| Path | Purpose |
|------|---------|
| `components/ui/` | shadcn/ui primitives |
| `components/` | Generic reusable: DataTable, PageHeader, SearchBox, EmptyState, LoadingSpinner, ConfirmDialog |

**Never place feature-specific components here.**

### `/src/features` — Feature Modules (Created Per Milestone)

The `features/` directory exists as a placeholder. **Feature subfolders are created only when that feature's milestone begins** — not during infrastructure milestones.

When created, each feature follows:

```
features/<name>/
├── components/
├── hooks/
├── services/
├── validation/
└── utils/
```

| Folder | Entity | Milestone |
|--------|--------|-----------|
| `features/auth/` | Authentication | M5 |
| `features/users/` | User, Role, Permission | M6 |
| `features/dashboard/` | Dashboard | M7 |
| `features/leads/` | Lead | M8 |
| `features/contacts/` | Contact | M9 |
| `features/activities/` | Activity | M10 |
| `features/followUps/` | FollowUp | M11 |
| `features/demos/` | Demo | M12 |
| `features/tasks/` | Task | M13 |
| `features/reports/` | Report | M14 |
| `features/notifications/` | Notification | M15 |
| `features/settings/` | Settings | M16 |

### `/src/services` — Shared Infrastructure

| Path | Purpose | Milestone |
|------|---------|-----------|
| `services/supabase/` | Browser, server, middleware client factories | M3 |
| `services/logging/` | Structured logger | M3 |
| `services/infrastructure/` | `createService` factory pattern | M3 |
| `services/index.js` | Infrastructure barrel export | M3 |

### `/src/utils` — Shared Utilities

| File | Purpose |
|------|---------|
| `utils/cn.js` | Tailwind class merging (shadcn/ui) |

### `/src/types` — Shared Types

JSDoc type definitions shared across features.

### `/src/hooks` — Shared Hooks

Reusable hooks not tied to a single feature.

### `/src/constants` — Global Constants

Role codes, status enums, route paths.

### `/src/config` — App Configuration

Environment variable access (`config/env.js`). No secrets in code.

### `/src/middleware` — Request Middleware

Authentication and role-based route guards (M5+).

## `/docs`

| Path | Purpose |
|------|---------|
| `docs/requirements/` | Business requirements |
| `docs/architecture/` | Technical architecture |
| `docs/standards/` | Project standards (final decisions) |
| `docs/specs/` | Pre-implementation feature specs |
| `docs/modules/` | Post-implementation module docs |
| `docs/roadmap.md` | Milestone TODO roadmap |

## `/public`

Static files: favicon, logos, OG images.

## `/supabase`

| Path | Purpose |
|------|---------|
| `supabase/migrations/` | Versioned SQL schema changes (M4+ after design approval) |
| `supabase/functions/` | Edge Functions |

## `/docs`

Database tables are **designed in Milestone 4** and migrated only after approval.
