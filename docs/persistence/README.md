# Persistence Design

PostgreSQL persistence layer design for TalentProof Sales CRM.

**Milestone 5** — Approved. Migrations begin at M7.

| Document | Purpose |
|----------|---------|
| [Persistence Design](./persistence-design.md) | Complete persistence layer specification |

## ADR

| ADR | Title |
|-----|-------|
| [0005](../adr/0005-persistence-design.md) | Persistence Design |

## Rules

- Every table traces to a [domain entity](../domain/domain-model.md)
- Timeline is a derived view — no table
- Migrations written only after persistence design approval
