# Phased Implementation Plan

20 milestones grouped into delivery phases.

---

## Phase 0–2 — Foundation (M1–M3) ✅

Planning, development environment, Supabase infrastructure.

---

## Phase 3 — Domain & Persistence (M4–M5) ✅

Domain model and PostgreSQL persistence design.

---

## Phase 4 — Design System (Milestone 6)

**Goal**: UI foundation before any user-facing features

- Typography, color, spacing, components, layout, breakpoints
- Documentation only — no business pages

```
M5 ──► M6 (Design System)
```

---

## Phase 5 — Authentication (Milestone 7)

Login, logout, session, protected routes, initial migrations, app shell.

```
M6 ──► M7 (Auth + layout + shadcn install)
```

---

## Phase 6 — Identity & Visibility (Milestones 8–9)

| Milestone | Module |
|-----------|--------|
| M8 | User Management |
| M9 | Dashboard |

---

## Phase 7 — Core CRM (Milestones 10–11)

| Milestone | Module |
|-----------|--------|
| M10 | Lead Management |
| M11 | Contact Management |

---

## Phase 8 — Sales Workflow (Milestones 12–15)

| Milestone | Module |
|-----------|--------|
| M12 | Activity Management |
| M13 | FollowUp Management |
| M14 | Demo Management |
| M15 | Task Management |

---

## Phase 9 — Intelligence (Milestones 16–17)

| Milestone | Module |
|-----------|--------|
| M16 | Reports |
| M17 | Notifications |

---

## Phase 10 — Configuration (Milestone 18)

| Milestone | Module |
|-----------|--------|
| M18 | Settings |

---

## Phase 11 — Quality & Launch (Milestones 19–20)

| Milestone | Focus |
|-----------|-------|
| M19 | Testing |
| M20 | Deployment |

---

## Decision Log

| # | Decision | Status |
|---|----------|--------|
| D1 | Design System before Authentication (M6 → M7) | Approved |
| D2 | shadcn/ui New York + Zinc + Lucide | Approved |
| D3 | Docs-only design system; components at M7+ | Approved |
| D4 | Dashboard primary reporting (OD-06) | Approved |
