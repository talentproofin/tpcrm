# Development Workflow

For **every future milestone**, follow this order. Never skip a step.

## Workflow Steps

### 0. Architecture Decision Record (ADR)

Before any implementation, write an ADR in `docs/adr/` containing:

1. Problem
2. Proposed Solution
3. Alternative Solutions
4. Trade-offs
5. Final Decision
6. Implementation Plan

See [ADR README](../adr/README.md).

### 1. Goal

State what the milestone achieves and what "done" looks like.

### 2. Files That Will Be Created

List every file and directory that will be created or modified.

### 3. Dependencies

List dependencies on other modules, packages, environment variables, or approvals.

### 4. Risks

Identify what could go wrong and how to mitigate it.

### 5. Implementation

Write the code. Follow all standards in `docs/standards/`.

### 6. Self Review

Review your own work against:

- Acceptance criteria in the spec
- Coding standards
- No feature-specific code in shared folders
- No business logic in components
- All mandatory page states handled (where applicable)

### 7. Testing Checklist

Verify:

- [ ] Project builds successfully
- [ ] No lint errors
- [ ] No console errors
- [ ] Functionality matches spec
- [ ] Desktop responsive (where applicable)
- [ ] Mobile responsive (where applicable)

### 8. Wait for Approval

Stop and wait for stakeholder approval before starting the next milestone.

---

## Milestone Completion Report (Required)

Every milestone must end with this format before requesting approval:

### Implementation Summary

Brief description of what was built and how it meets the goal.

### Files Created

List of all files and directories created or modified.

### Dependencies Added

New npm packages, environment variables, or external services introduced.

### Known Risks

Issues, limitations, or areas requiring attention in future milestones.

### Future Improvements

Enhancements deferred to later milestones.

### Verification

Automated checks run and their results (build, lint, format, tests).

### Manual Testing Checklist

- [ ] Step-by-step manual tests performed
- [ ] Edge cases checked
- [ ] No console errors in browser (where applicable)

### Ready for Review

Confirm the milestone is complete and awaiting stakeholder approval.

---

## Module Deliverables

When implementing a feature module (Milestone 6+), also ensure all six deliverables are complete:

1. Database
2. Services
3. UI
4. Validation
5. Testing
6. Documentation

See [Implementation Strategy](./implementation-strategy.md).
