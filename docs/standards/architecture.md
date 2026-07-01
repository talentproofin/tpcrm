# Architecture Standards

These decisions are **final** and apply to all development.

## Feature-Based Architecture

Every feature must be **independent**.

Every feature owns its own:

```
features/<name>/
├── components/
├── hooks/
├── services/
├── validation/
└── utils/
```

- Shared code belongs **only** in shared directories.
- **Never** place feature-specific code in shared folders.
- **No `src/lib/` directory** — do not allow a catch-all folder. Place helpers in the appropriate shared directory.

## Shared Folder Structure

```
src/
├── app/              # Next.js routes only
├── components/       # Generic reusable UI + shadcn/ui
├── features/         # Independent feature modules
├── hooks/            # Shared custom hooks
├── services/         # Shared infrastructure services
├── utils/            # Shared utility functions
├── constants/        # Global constants and enums
├── types/            # Shared JSDoc type definitions
├── config/           # App configuration and env access
└── middleware/       # Route middleware
```

| Folder | Purpose | Examples |
|--------|---------|----------|
| `components/` | Generic reusable UI only | DataTable, PageHeader, EmptyState |
| `components/ui/` | shadcn/ui primitives | Button, Input, Table |
| `services/` | Shared infrastructure | Supabase clients (M3), AuditLog (M5+) |
| `utils/` | Pure shared helpers | `cn()` for Tailwind class merging |
| `hooks/` | Shared React hooks | `useDebounce` |
| `constants/` | Global constants | Role codes, route paths |
| `types/` | Shared JSDoc typedefs | Cross-feature type definitions |
| `config/` | Configuration | Environment variable access |
| `middleware/` | Request middleware | Route guards (M5+) |

## Shared Components

Only **generic reusable** components belong in `src/components/`.

| Allowed in `src/components/` | Examples |
|-------------------------------|----------|
| Generic UI wrappers | Button, DataTable, PageHeader, SearchBox |
| Standard page states | EmptyState, LoadingSpinner, ConfirmDialog |
| shadcn/ui primitives | `src/components/ui/` |

Everything else belongs inside its feature.

## Services

- Every feature must have its own service layer in `features/<name>/services/`.
- Business logic must **never** exist inside React components.
- Shared infrastructure (e.g., Supabase clients) lives in `src/services/`.

## Validation

- Every form must have its own validation schema in `features/<name>/validation/`.
- **Never** validate directly inside components.

## State Management

Do **not** introduce Redux or Zustand initially.

| State Type | Approach |
|------------|----------|
| Server state | React Query (introduced when needed) |
| Global UI state | React Context — only when truly global |
| Local UI state | `useState` / `useReducer` — keep close to usage |

## Infrastructure Milestones

| Milestone | Scope |
|-----------|-------|
| M2 | Project initialization (Next.js, Tailwind, shadcn, tooling) |
| M3 | Supabase client setup — no auth, no tables |
| M4 | Database design — approved before migrations |
| M5 | Authentication — login, logout, session, protected routes |

## UI Foundation

- Use **shadcn/ui** as the design foundation.
- shadcn `utils` alias points to `src/utils/cn.js` — not `src/lib/`.
- Avoid creating custom components when an existing shadcn component fits.
