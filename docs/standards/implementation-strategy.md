# Implementation Strategy

## Core Rule

**Do NOT build everything together.**

Every module must be **independently implementable**. Complete one module fully before starting the next.

## Module Completion Checklist

Before moving to the next milestone, the current module must have all six deliverables:

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | **Database** | Migrations, RLS policies, indexes |
| 2 | **Services** | Business logic and data access in `features/<module>/services/` |
| 3 | **UI** | Pages and components with loading, empty, and error states |
| 4 | **Validation** | Input schemas in `features/<module>/validation/` |
| 5 | **Testing** | Unit and integration tests for services and validation |
| 6 | **Documentation** | Spec with Purpose, Business Rules, Acceptance Criteria, Future Improvements, Known Limitations |

## Workflow Per Milestone

```
1. Write spec in docs/specs/
2. Get spec approval
3. Implement Database (migration + RLS)
4. Implement Services
5. Implement Validation
6. Implement UI
7. Write Tests
8. Complete Documentation
9. Verify: build, lint, responsive, matches spec
10. Get milestone approval
11. Proceed to next milestone
```

## Independence Rules

- A module's services must not depend on unfinished modules
- Shared infrastructure (`src/services/`, `src/config/`, `src/middleware/`) is built per infrastructure milestone (M3–M5)
- Cross-module references use foreign keys only after both modules are complete
- Dashboard and Report modules read from completed modules — they do not own entity data

## What "Complete" Means

A module is complete when:

- All acceptance criteria in its spec are met
- All six deliverables exist
- Stakeholder approval is obtained
- No TODO comments remain for core functionality
