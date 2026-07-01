# Coding Standards

## File Responsibility

- **One responsibility per file**
- Keep components small and focused
- **Avoid files larger than 300 lines** whenever practical — split when approaching this limit

## Composition

- Prefer composition over large monolithic components
- Extract reusable logic into hooks, services, or utils
- Avoid duplicated code — share via shared directories only

## Feature Independence

Every feature under `src/features/` must be independent and contain:

```
features/<name>/
├── components/     # Feature-specific UI only
├── hooks/          # Data fetching and mutation hooks
├── services/       # Business logic and data access
├── validation/     # Input validation schemas
└── utils/          # Feature-specific utilities
```

**Never place feature-specific code in shared folders.**

## Layer Rules

| Layer | Responsibility | Must Not |
|-------|---------------|----------|
| `components/` | Render UI, handle user events | Contain business logic, validation, or DB calls |
| `hooks/` | Connect UI to services, manage client state | Contain validation schemas or business logic |
| `services/` | Business logic, data access | Import UI components |
| `validation/` | Input validation rules | Perform database operations or render UI |
| `utils/` | Pure helper functions | Have side effects |

## Business Logic

- Business logic must **never** exist inside React components.
- Every form must have its own validation schema in `validation/`.
- **Never** validate directly inside components.

## Shared Code Locations

| Need | Location |
|------|----------|
| shadcn/ui primitives | `src/components/ui/` |
| Generic reusable UI | `src/components/` |
| Shared hooks | `src/hooks/` |
| Shared infrastructure services | `src/services/` |
| General utilities (e.g., `cn()`) | `src/utils/` |
| Global constants | `src/constants/` |
| Shared JSDoc types | `src/types/` |
| App configuration | `src/config/` |
| Route middleware | `src/middleware/` |

**Do not use `src/lib/`.** There is no catch-all directory.

## JavaScript

This project uses JavaScript (not TypeScript). Use JSDoc comments for complex function signatures. Shared types live in `src/types/`.
