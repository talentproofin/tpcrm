# ADR 0004: Domain Modeling Before Database Design

**Milestone**: 4 — Domain Modeling  
**Status**: Accepted  
**Date**: 2026-07-01

---

## 1. Problem

Implementing PostgreSQL tables before understanding the business domain risks:

- Schema that does not match real workflows
- Missing relationships discovered late in development
- Business rules enforced only in application code with no domain clarity
- Rework of migrations, RLS policies, and features

The approved roadmap originally placed Database Design at Milestone 4. Stakeholder direction changed: **the business domain must be fully modeled before any PostgreSQL design**.

---

## 2. Proposed Solution

Create a complete **business domain model** as documentation in `docs/domain/`:

- Entity definitions with responsibilities
- Relationships and cardinality
- Lifecycles and state transitions
- Business rules and validation rules (domain level, not code)
- Entity relationship diagram
- Sequence diagrams for key workflows
- Future extensibility considerations

**No SQL, no Supabase tables, no migrations, no implementation.**

Database Design becomes **Milestone 5** after domain model approval.

---

## 3. Alternative Solutions

### A. Design database directly from requirements

Skip formal domain model; write `database-design.md` with tables immediately.

**Rejected**: Requirements list rules but not full entity behavior, lifecycles, or transition rules. High rework risk.

### B. Domain model inside feature specs

Each feature spec defines its own entities independently.

**Rejected**: Cross-entity relationships (Activity + FollowUp, Lead archive) span modules. A single domain model ensures consistency.

### C. Use UML tool / external diagramming only

Visual diagrams without structured documentation.

**Rejected**: Diagrams alone do not capture validation rules, lifecycles, or extensibility. Mermaid in docs keeps everything version-controlled.

---

## 4. Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Documentation-only milestone | Zero implementation risk; full stakeholder review | No runnable output |
| Proposed answers to open questions | Unblocks future milestones | Requires stakeholder confirmation |
| Single `domain-model.md` | One review artifact | Long document |
| Dashboard/Settings excluded as entities | Focus on core domain entities | Views/config modeled later |

---

## 5. Final Decision

- Milestone 4 delivers `docs/domain/domain-model.md` (comprehensive) and supporting index
- Twelve core entities modeled: User, Role, Permission, Lead, Contact, Activity, FollowUp, Demo, Task, Report, Notification, AuditLog
- Open questions documented as **Proposed** with explicit approval needed
- Database Design moves to Milestone 5
- All subsequent milestones shift by one (19 total)

---

## 6. Implementation Plan

1. Write `docs/domain/README.md` — index
2. Write `docs/domain/domain-model.md` — all deliverables
3. Update `docs/roadmap.md` — M4 Domain Modeling, shift M5+ 
4. Update `docs/phased-implementation-plan.md`, `docs/requirements/modules.md`, `docs/specs/README.md`
5. Update `docs/adr/README.md` index
6. Milestone completion report — wait for approval

**Verification**: No code changes. Documentation completeness review only.
