# Project Standards

TalentProof Sales CRM is a **production-quality** application designed to remain maintainable for at least **5 years**.

## Guiding Principles

| Principle | Description |
|-----------|-------------|
| Readability | Code must be easy to read and reason about |
| Scalability | Architecture must support growth in users, data, and features |
| Maintainability | Clear structure, consistent patterns, minimal coupling |
| Performance | Fast by design — Server Components, pagination, lazy loading |

**Do not optimize for speed of development.** Optimize for long-term quality.

## Standard Documents

| Document | Purpose |
|----------|---------|
| [ADR](../adr/README.md) | Architecture Decision Records — required at start of every milestone |
| [Architecture](./architecture.md) | Feature independence, shared structure, services, validation |
| [Naming](./naming.md) | Canonical entity names |
| [Coding Standards](./coding-standards.md) | File structure, layer rules, 300-line limit |
| [UI Standards](./ui-standards.md) | shadcn/ui foundation, shared components |
| [Error Handling](./error-handling.md) | Mandatory page states |
| [State Management](./state-management.md) | React Query, Context, local state |
| [Performance](./performance.md) | Server Components, pagination, lazy loading |
| [Security](./security.md) | Auth, validation, RLS, AuditLog |
| [Module Documentation](./module-documentation.md) | Required sections per module |
| [Implementation Strategy](./implementation-strategy.md) | Module completion checklist |
| [Development Workflow](./development-workflow.md) | 8-step milestone workflow |

## Architecture Summary

- **Feature-Based Architecture** — every feature is independent
- Every feature owns: `components/`, `hooks/`, `services/`, `validation/`, `utils/`
- Shared code only in shared directories — never feature-specific code in shared folders
- Business logic never in React components
- Validation never in components
- Authentication is its own milestone — not mixed with initialization
- Database design approved before any migrations

See [Architecture Standards](./architecture.md).
