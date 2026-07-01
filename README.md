# TalentProof Sales CRM

Internal Sales CRM built for TalentProof.

## Status

**Milestone 6 complete** — design system documented. **Awaiting approval before Milestone 7 (Authentication).**

## Quality Bar

Production quality. Designed for 5+ years of maintainability.

## Tech Stack

- Next.js 15 (App Router)
- JavaScript
- Tailwind CSS
- shadcn/ui
- ESLint + Prettier
- Supabase (Milestone 3 ✅)
- PostgreSQL (Persistence Design M5)

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
npm run lint
npm run verify:infra
```

## Project Structure

```
src/
├── app/              # Next.js routes
├── components/       # Generic reusable UI + shadcn/ui
├── features/         # Independent feature modules
├── hooks/            # Shared hooks
├── services/         # Shared infrastructure (Supabase in M3)
├── utils/            # Shared utilities (cn.js)
├── constants/        # Global constants
├── types/            # Shared JSDoc types
├── config/           # App configuration
└── middleware/       # Route middleware (M6+)
```

**No `src/lib/`** — helpers live in `utils/`, `services/`, `config/`, or `types/`.

## Documentation

| Document | Description |
|----------|-------------|
| [Standards](./docs/standards/project-standards.md) | Architecture, naming, coding |
| [Domain Model](./docs/domain/domain-model.md) | Business entities, rules, Timeline view |
| [Design System](./docs/design-system/design-system.md) | UI foundation (M6) |
| [Persistence Design](./docs/persistence/persistence-design.md) | PostgreSQL design |
| [Roadmap](./docs/roadmap.md) | 20-milestone plan |
| [ADR](./docs/adr/README.md) | Architecture Decision Records |

## Path Aliases

`@/*` → `src/*` | shadcn `utils` → `@/utils/cn`
