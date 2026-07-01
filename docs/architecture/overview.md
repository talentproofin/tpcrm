# Architecture Overview

## Quality Bar

Production-quality application designed for **5+ years of maintainability**.

Optimize for readability, scalability, maintainability, and performance — not development speed.

## Architectural Style

**Feature-Based Architecture** — every feature is independent.

### Shared Directories

```
src/
├── app/            # Routes only
├── components/     # Generic reusable UI
├── features/       # Independent feature modules
├── hooks/          # Shared hooks
├── services/       # Shared infrastructure (Supabase, AuditLog)
├── utils/          # Shared utilities (cn, helpers)
├── constants/      # Global constants
├── types/          # Shared JSDoc types
├── config/         # App configuration
└── middleware/     # Route middleware
```

**No `src/lib/`** — helpers belong in `utils/`, `services/`, `config/`, or `types/`.

### Feature Module Pattern

```
features/<name>/
├── components/
├── hooks/
├── services/
├── validation/
└── utils/
```

### Layer Model

```
Presentation     →  app/, components/, features/*/components/
Application      →  features/*/hooks/
Domain           →  features/*/services/, features/*/validation/
Infrastructure   →  src/services/, src/config/, supabase/
```

## Infrastructure Milestone Sequence

| Milestone | Focus |
|-----------|-------|
| M2 | Next.js, Tailwind, shadcn, tooling |
| M3 | Supabase client — no auth, no tables |
| M4 | Database design — tables, RLS, indexes, seed strategy |
| M5 | Authentication — login, logout, session, protected routes |

Feature modules begin at **Milestone 6** (User Management).

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No `src/lib/` | Prevents catch-all directory; forces intentional placement |
| Supabase before auth | Client infrastructure ready before auth milestone |
| DB design before migrations | Schema approved in M4 before any SQL |
| shadcn utils → `src/utils/cn.js` | Standard utility location |

## Standards

All standards: [`docs/standards/`](../standards/project-standards.md).

Milestone workflow: [`docs/standards/development-workflow.md`](../standards/development-workflow.md).
