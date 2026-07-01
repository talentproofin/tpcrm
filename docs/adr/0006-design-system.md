# ADR 0006: Design System Before Authentication

**Milestone**: 6 — Design System  
**Status**: Accepted  
**Date**: 2026-07-01

---

## 1. Problem

Authentication and feature modules will introduce many UI surfaces. Without a documented design system, each milestone risks inconsistent typography, spacing, component usage, and page states — undermining the professional, minimal CRM experience defined in project standards.

Implementing authentication (previously M6) before UI foundations would force ad-hoc styling decisions in login pages and shells that later modules must undo.

---

## 2. Proposed Solution

Create a **Design System** as documentation in `docs/design-system/` defining:

- Design tokens (typography, color, spacing, breakpoints)
- Component standards mapped to shadcn/ui primitives
- Patterns for forms, tables, dialogs, cards, badges
- Mandatory state patterns (empty, loading, error, toast)
- Page layout and dashboard widget conventions

**Documentation and reusable UI standards only** — no authentication, no business pages, no feature modules.

Authentication moves to **Milestone 7**.

---

## 3. Alternative Solutions

### A. Define UI per feature milestone

Each module defines its own component usage.

**Rejected**: Guaranteed inconsistency; violates shared component architecture.

### B. Implement all shared components in code now

Build EmptyState, DataTable, etc. in `src/components/` during M6.

**Rejected**: User scope is documentation and standards only; component implementation follows in feature milestones using these standards.

### C. Adopt a third-party design system (MUI, Ant)

Replace shadcn/ui with a full component library.

**Rejected**: Project already committed to shadcn/ui + Tailwind in M2.

---

## 4. Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Docs-only milestone | Fast review; no code churn | Components not visually verifiable until M7+ |
| shadcn/ui mapping | Consistent with installed stack | Tied to shadcn component API |
| Zinc palette | Professional, minimal | Limited brand customization at launch |
| Desktop-first layout | Optimized for data-heavy CRM | Mobile patterns documented separately |

---

## 5. Final Decision

- Milestone 6 delivers `docs/design-system/design-system.md` (comprehensive)
- Maps all UI patterns to shadcn/ui + Lucide icons
- Defines semantic tokens extending existing `globals.css` variables
- Authentication deferred to Milestone 7
- All subsequent milestones reference design system for UI work

---

## 6. Implementation Plan

1. Write `docs/design-system/design-system.md`
2. Update `docs/standards/ui-standards.md` to reference design system
3. Update roadmap (M6 Design System, shift M7+)
4. Milestone completion report — wait for approval

**Verification**: Documentation completeness review. No application code changes.
