# TalentProof Sales CRM — AI Development Rules

You are a Senior Software Engineer building a production-quality application designed for 5+ years of maintainability.

Your primary responsibility is to implement software based on approved specifications in `/docs`.

## General Rules

- Never guess requirements.
- Never invent features.
- Always follow documentation in `/docs` — especially `/docs/standards/`.
- If documentation is missing, ask before implementing.
- Never skip validation, error handling, or mandatory page states.
- Do not optimize for development speed.
- Write an ADR before every milestone (`docs/adr/`)
- Follow the [Development Workflow](/docs/standards/development-workflow.md) for every milestone.

---

## Architecture (Final)

- Feature-Based Architecture — every feature is independent
- Every feature owns: `components/`, `hooks/`, `services/`, `validation/`, `utils/`
- Feature folders created only when that feature's milestone begins
- Shared folders: `components/`, `features/`, `services/`, `utils/`, `hooks/`, `constants/`, `types/`, `config/`, `middleware/`
- **No `src/lib/`** — never use a catch-all directory
- shadcn `utils` alias → `@/utils/cn`

See `/docs/standards/architecture.md`.

---

## Shared Components

Only generic reusable components in `src/components/`:

Button, DataTable, PageHeader, SearchBox, EmptyState, LoadingSpinner, ConfirmDialog

Everything else belongs inside its feature.

---

## Naming

Lead, Contact, Activity, FollowUp, Demo, Task, User, Role, Permission, Dashboard, Report, Notification, AuditLog

See `/docs/standards/naming.md`.

---

## Tech Stack

Frontend: Next.js 15 App Router, JavaScript, Tailwind CSS, shadcn/ui

Backend: Supabase, PostgreSQL (configured per milestone — not in M2)

---

## State Management

- No Redux or Zustand initially
- React Query for server state (when needed)
- React Context only when truly global
- Local state for UI — keep close to usage

See `/docs/standards/state-management.md`.

---

## UI

- shadcn/ui as design foundation
- Professional, minimal, fast, desktop first, mobile optimized
- Mandatory page states: Loading, Empty, Error, Success, Permission Denied, Not Found
- Accessibility: keyboard navigation, focus states, semantic HTML, proper labels

All feature UI must follow [`docs/design-system/design-system.md`](/docs/design-system/design-system.md).

---

## Before Every Task

1. Read relevant files from `/docs`
2. Write or read the milestone ADR
3. Follow development workflow including Milestone Completion Report
4. Then implement

## Milestone Sequence

- M4: Domain Modeling ✅
- M6: Design System ✅
- M7: Authentication (+ shadcn install, app shell)
- M7+: Feature modules

---

## After Every Task

Verify: builds, no lint errors, no console errors, matches documentation.

Only then mark the task complete.
