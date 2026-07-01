# Data Flow

## Request Flow (Protected Page)

```
User Browser
    │
    ▼
middleware/ ─── unauthenticated? ──► redirect to /login
    │
    ▼
app/(dashboard)/<route>/page.js
    │
    ├── Server Component ──► features/<module>/services/ ──► services/supabase/ (server)
    │
    └── Client Component ──► features/<module>/hooks/ ──► services/supabase/ (browser)
```

## Mutation Flow

```
UI Event (form submit, button click)
    │
    ▼
features/<module>/validation/ ─── invalid? ──► show error
    │
    ▼
features/<module>/services/
    │
    ├── AuditLog written (important actions)
    │
    ▼
Supabase (insert/update/delete) with RLS
    │
    ▼
Revalidate path / update client cache
    │
    ▼
UI reflects new state (loading → success/error)
```

## Authentication Flow

```
Login form (features/auth/components/)
    │
    ▼
features/auth/validation/ ──► features/auth/services/
    │
    ▼
services/supabase/ ──► Supabase Auth (signInWithPassword)
    │
    ├── success ──► set session cookie ──► redirect to /dashboard
    │
    └── failure ──► display error
```

## Activity + FollowUp Flow

Per **BR-ACT-01** and **BR-ACT-02**, creating an Activity always creates a linked FollowUp:

```
Create Activity (UI)
    │
    ▼
features/activities/validation/ (Activity + FollowUp data)
    │
    ▼
features/activities/services/ ──► transaction:
    1. Insert Activity (permanent record)
    2. Insert linked FollowUp
    │
    ▼
services/audit/ ──► AuditLog entry
    │
    ▼
FollowUp scheduler checks due dates (M9)
    │
    └── past due ──► mark overdue (BR-FU-01)
```

## Lead Lifecycle Flow

```
Create Lead (executive-owned, BR-LEAD-01)
    │
    ├── Add Contacts (BR-LEAD-02)
    ├── Schedule Demos (BR-LEAD-03)
    ├── Log Activities (+ FollowUps)
    │
    ▼
Lead marked completed
    │
    ▼
Move to Archive (BR-LEAD-04)
```

## Trash Flow

```
User deletes record
    │
    ▼
Soft delete within entity module (status = deleted)
    │
    ▼
Admin reviews Trash (BR-DATA-01)
    │
    ├── Restore
    └── Permanent delete (policy TBD)
```

## CEO Daily Report Flow

```
Scheduled trigger (8 PM daily, BR-RPT-01)
    │
    ▼
supabase/functions/ or external cron
    │
    ▼
features/reports/services/ ──► aggregate Report data
    │
    ▼
Send email to CEO
    │
    ▼
features/notifications/services/ ──► optional in-app Notification
```

## Notification Flow

```
CRM event occurs (e.g., overdue FollowUp, new Task)
    │
    ▼
features/notifications/services/ ──► create Notification
    │
    ▼
User sees Notification in UI (bell icon, list)
```
