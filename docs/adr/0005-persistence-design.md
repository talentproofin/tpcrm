# ADR 0005: Persistence Design

**Milestone**: 5 — Persistence Design  
**Status**: Accepted  
**Date**: 2026-07-01

---

## 1. Problem

The approved domain model (M4) defines business entities, rules, and lifecycles in conceptual terms. Before writing migrations or application code, the project needs a **persistence layer design** that maps domain entities to PostgreSQL structures with clear strategies for constraints, indexing, security, and data lifecycle.

Renamed from "Database Design" to **Persistence Design** to emphasize the full storage strategy — not only tables, but RLS, soft delete, archive, audit fields, migrations, and seeding.

---

## 2. Proposed Solution

Document a complete persistence design in `docs/persistence/persistence-design.md`:

- Logical data model (domain-to-storage mapping)
- Physical PostgreSQL model (tables, columns, types — described, not SQL)
- Naming conventions, constraints, indexes, foreign keys
- Enum strategy, audit fields, soft delete, archive
- Row Level Security strategy
- Migration and seed strategy

**No SQL files. No migrations. No implementation.** Approval required before Milestone 6 writes any migration.

---

## 3. Alternative Solutions

### A. Write migrations directly from domain model

Skip formal persistence doc; implement SQL immediately.

**Rejected**: RLS and soft-delete patterns affect every table. Design must be reviewed holistically first.

### B. Use an ORM schema as source of truth

Prisma/Drizzle schema files instead of documentation.

**Rejected**: Project uses Supabase with raw SQL migrations. Documentation-first aligns with SDD workflow.

### C. Single monolithic RLS policy

One policy function for all tables.

**Rejected**: Per-table policies are more maintainable and auditable for 12+ entity tables.

---

## 4. Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Documentation before SQL | Full review without migration rollback risk | Extra milestone before runnable data |
| PostgreSQL enums | Type safety at DB level | Enum changes require migration |
| `deleted_at` soft delete | Uniform trash pattern | Queries must filter deleted rows |
| `auth.users` + `profiles` | Supabase Auth integration | Two sources for user identity |
| Team via `manager_id` | Simple Manager scoping | Flat hierarchy only at launch |

---

## 5. Final Decision

- Persistence design documented in `docs/persistence/`
- Maps all 12 domain entities plus supporting tables (`app_settings`, junction tables)
- Timeline documented as derived view only — no table
- Closed domain decisions OD-01–OD-07 reflected in constraints and RLS
- SQL migrations begin only after M5 approval (M6 or dedicated migration milestone)

---

## 6. Implementation Plan

1. Close OD-01–OD-07 in domain model
2. Add Timeline derived view to domain docs
3. Write `docs/persistence/persistence-design.md`
4. Update roadmap: M5 = Persistence Design
5. Milestone completion report — wait for approval
