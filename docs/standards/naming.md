# Naming Conventions

Use **consistent naming everywhere** — in documentation, database tables, code, UI labels, and file names.

## Canonical Entity Names

Always use these exact names. Never use synonyms or inconsistent variants.

| Entity | Use | Never Use |
|--------|-----|-----------|
| Lead | Lead | lead record, prospect, opportunity |
| Contact | Contact | person, contact person |
| Activity | Activity | activity log entry, event |
| FollowUp | FollowUp | follow-up, follow_up, followup |
| Demo | Demo | demonstration, meeting |
| Task | Task | todo, to-do |
| User | User | account, member |
| Role | Role | user type, user role type |
| Permission | Permission | access right, privilege |
| Dashboard | Dashboard | home, overview page |
| Report | Report | reporting, analytics |
| Notification | Notification | alert, message |
| AuditLog | AuditLog | audit, log entry, history |

## Code Naming

| Context | Convention | Example |
|---------|------------|---------|
| React components | PascalCase | `LeadList.jsx`, `FollowUpCard.jsx` |
| Files (non-component) | camelCase | `leadService.js`, `followUpValidation.js` |
| Functions | camelCase | `createLead`, `getOverdueFollowUps` |
| Constants | UPPER_SNAKE_CASE | `LEAD_STATUS_ACTIVE` |
| Database tables | snake_case | `leads`, `follow_ups`, `audit_logs` |
| Database columns | snake_case | `lead_id`, `follow_up_date` |
| Feature folders | camelCase (multi-word) or lowercase (single) | `features/leads/`, `features/followUps/` |
| Route paths | kebab-case | `/follow-ups`, `/audit-logs` |

## Feature Folder Mapping

| Entity | Feature Folder |
|--------|---------------|
| Authentication | `features/auth/` |
| Dashboard | `features/dashboard/` |
| User / Role / Permission | `features/users/` |
| Lead | `features/leads/` |
| Contact | `features/contacts/` |
| Activity | `features/activities/` |
| FollowUp | `features/followUps/` |
| Demo | `features/demos/` |
| Task | `features/tasks/` |
| Report | `features/reports/` |
| Notification | `features/notifications/` |
| Settings | `features/settings/` |

`AuditLog` is a cross-cutting concern. Audit logic lives in `src/services/audit/` and is consumed by all features.

## UI Labels

Display names in the UI may use spaces for readability (e.g., "Follow Up"), but code, database, and documentation must use the canonical names above.
