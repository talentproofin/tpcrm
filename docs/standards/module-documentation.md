# Module Documentation Standards

Every major module must have documentation that includes the following five sections.

## Required Sections

### 1. Purpose

What the module does and why it exists. Who uses it and what problem it solves.

### 2. Business Rules

All business rules that apply to this module. Reference IDs from [`business-rules.md`](../requirements/business-rules.md) where applicable.

### 3. Acceptance Criteria

Testable conditions that define "done". Written as checkboxes.

Example:
- [ ] User can create a Lead with required fields
- [ ] Lead list paginates at 25 records per page
- [ ] Only the owning executive can edit their Lead

### 4. Future Improvements

Known enhancements deferred to later phases. Prevents scope creep while capturing ideas.

### 5. Known Limitations

Explicit constraints, edge cases not handled, or dependencies on other modules.

## Location

| Document Type | Location |
|---------------|----------|
| Feature spec (pre-implementation) | `docs/specs/<module>.md` |
| Module reference (post-implementation) | `docs/modules/<module>.md` |

## Spec Template

When creating a new spec in `docs/specs/`, use this structure:

```markdown
# <Module Name>

## Purpose
...

## Business Rules
...

## Data Model
...

## Services
...

## UI
...

## Validation
...

## Permissions
...

## Acceptance Criteria
- [ ] ...

## Future Improvements
...

## Known Limitations
...
```
