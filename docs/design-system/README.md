# Design System

UI foundation documentation for TalentProof Sales CRM.

**Milestone 6** — Documentation and standards only. No business pages.

| Document | Purpose |
|----------|---------|
| [Design System](./design-system.md) | Complete UI specification |

## ADR

| ADR | Title |
|-----|-------|
| [0006](../adr/0006-design-system.md) | Design System Before Authentication |

## Related

| Document | Purpose |
|----------|---------|
| [UI Standards](../standards/ui-standards.md) | High-level UI rules |
| [Error Handling](../standards/error-handling.md) | Mandatory page states |
| [Accessibility](../standards/ui-standards.md#accessibility-required) | A11y requirements |

## Rules

- All feature UI must follow this design system
- Use shadcn/ui primitives — do not reinvent components
- Shared wrappers live in `src/components/` per component mapping
