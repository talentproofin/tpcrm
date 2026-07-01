# TalentProof Sales CRM — Documentation

This directory is the single source of truth for Spec-Driven Development (SDD).

## How to Use These Docs

1. Read requirements and standards before designing or implementing any feature.
2. Write an ADR in `adr/` before each milestone implementation.
3. Write or update a feature spec in `specs/` before writing code.
3. Get spec approval before implementation begins.
4. Complete all six module deliverables before moving to the next milestone.
5. Update specs when requirements change.

## Documentation Index

### Requirements

| Document | Purpose |
|----------|---------|
| [Overview](./requirements/overview.md) | Project purpose, users, and scope |
| [Business Rules](./requirements/business-rules.md) | Domain rules and constraints |
| [User Roles](./requirements/user-roles.md) | Role definitions and permissions |
| [Modules](./requirements/modules.md) | Core module inventory and dependencies |

### Architecture

| Document | Purpose |
|----------|---------|
| [Overview](./architecture/overview.md) | Feature-based architecture |
| [Folder Structure](./architecture/folder-structure.md) | Directory layout and rationale |
| [Data Flow](./architecture/data-flow.md) | Request and data flow patterns |

### Standards

| Document | Purpose |
|----------|---------|
| [Project Standards](./standards/project-standards.md) | Quality bar and guiding principles |
| [Architecture](./standards/architecture.md) | Feature independence, shared structure (final) |
| [Naming](./standards/naming.md) | Canonical entity names |
| [Coding Standards](./standards/coding-standards.md) | File structure and layer rules |
| [UI Standards](./standards/ui-standards.md) | shadcn/ui foundation, shared components |
| [Error Handling](./standards/error-handling.md) | Mandatory page states |
| [State Management](./standards/state-management.md) | React Query, Context, local state |
| [Performance](./standards/performance.md) | Rendering and data-loading rules |
| [Security](./standards/security.md) | Auth, validation, RLS, AuditLog |
| [Module Documentation](./standards/module-documentation.md) | Required sections per module |
| [Implementation Strategy](./standards/implementation-strategy.md) | Module completion checklist |
| [Development Workflow](./standards/development-workflow.md) | ADR + milestone process |
| [ADR](./adr/README.md) | Architecture Decision Records |

### Design System

| Document | Purpose |
|----------|---------|
| [Design System](./design-system/design-system.md) | Typography, colors, components, layout (M6) |

### Domain & Persistence

| Document | Purpose |
|----------|---------|
| [Domain Model](./domain/domain-model.md) | Business entities, rules, diagrams (M4) |
| [Persistence Design](./persistence/persistence-design.md) | PostgreSQL design (M5) |
| [ADR](./adr/README.md) | Architecture Decision Records |

### Planning

| Document | Purpose |
|----------|---------|
| [Roadmap](./roadmap.md) | 16-milestone TODO list |
| [Phased Implementation Plan](./phased-implementation-plan.md) | Delivery phases and dependencies |

### Feature Specs & Module Docs

| Location | Purpose |
|----------|---------|
| `specs/` | Pre-implementation feature specifications |
| `modules/` | Post-implementation module reference documentation |

## Conventions

- One module per milestone.
- Every module delivers: Database, Services, UI, Validation, Testing, Documentation.
- Use canonical entity names: Lead, Contact, Activity, FollowUp, Demo, Task, User, Role, Permission, Dashboard, Report, Notification, AuditLog.
- Specs must reference relevant business rules and roles.
