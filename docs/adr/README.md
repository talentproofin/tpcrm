# Architecture Decision Records (ADR)

Every milestone must begin with an Architecture Decision Record before implementation.

## ADR Template

| Section | Purpose |
|---------|---------|
| **Problem** | What needs to be solved and why |
| **Proposed Solution** | The chosen approach |
| **Alternative Solutions** | Other options considered |
| **Trade-offs** | Costs and benefits of the decision |
| **Final Decision** | What was decided and why |
| **Implementation Plan** | Files, steps, and verification |

## Index

| ADR | Milestone | Title | Status |
|-----|-----------|-------|--------|
| [0003](./0003-supabase-infrastructure-layer.md) | M3 | Supabase Infrastructure Layer | Accepted |
| [0004](./0004-domain-modeling.md) | M4 | Domain Modeling Before Database Design | Accepted |
| [0005](./0005-persistence-design.md) | M5 | Persistence Design | Accepted |
| [0006](./0006-design-system.md) | M6 | Design System Before Authentication | Accepted |

## Location

ADRs live in `docs/adr/` and are numbered sequentially: `000N-<short-title>.md`.

## Rules

- Write the ADR before writing implementation code.
- Update the ADR if the decision changes during implementation.
- Reference the ADR in the milestone completion report.
