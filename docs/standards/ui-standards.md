# UI Standards

High-level UI rules. **Full specification**: [Design System](../design-system/design-system.md).

## Design Foundation

Use **shadcn/ui** (New York style, Zinc palette) + **Lucide** icons + Tailwind CSS.

See [Design System §20](../design-system/design-system.md#20-component-mapping) for component mapping.

## Design Principles

| Principle | Requirement |
|-----------|-------------|
| Professional | Clean, business-appropriate appearance |
| Minimal | No decorative elements; focus on data and actions |
| Fast | No unnecessary animations or heavy visual effects |
| Responsive | Desktop first, mobile optimized |
| Accessible | Keyboard, focus, semantic HTML, labels |

## Shared vs. Feature Components

| Location | Contains |
|----------|----------|
| `src/components/ui/` | shadcn/ui primitives |
| `src/components/` | PageHeader, EmptyState, LoadingSpinner, ConfirmDialog, DataTable, SearchBox |
| `src/components/layout/` | AppShell, Sidebar, TopBar |
| `features/*/components/` | Feature-specific UI only |

## Mandatory Page States

Loading, Empty, Error, Success, Permission Denied, Not Found.

See [Error Handling](./error-handling.md) and [Design System §13–15](../design-system/design-system.md).

## Layout

Desktop-first application shell with sidebar navigation. See [Design System §18](../design-system/design-system.md#page-layout).

## Accessibility (Required)

| Requirement | Detail |
|-------------|--------|
| Keyboard navigation | All interactive elements reachable |
| Visible focus states | `ring` token on focus |
| Semantic HTML | Correct elements and heading hierarchy |
| Proper labels | Every input has a `<Label>` |

## Avoid

- Unnecessary animations
- Custom components duplicating shadcn/ui
- Color-only status indicators
- Icon-only buttons without `aria-label`
