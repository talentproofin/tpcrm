# Persistence Design

PostgreSQL persistence layer for TalentProof Sales CRM via Supabase.

**Milestone**: 5 — Persistence Design  
**Status**: Revised — identity architecture update (awaiting approval)  
**Scope**: Design only — **no SQL, no migrations, no implementation**

**Revision (Identity)**: Separates Supabase Auth from CRM business identity. Profiles are admin-provisioned only. MVP permissions live in application code, not database tables.

**Source of truth**: [Domain Model](../domain/domain-model.md) (M4, approved)

---

## Document Index

| Section | Content |
|---------|---------|
| [1. Overview](#1-overview) | Purpose and design principles |
| [2. Logical Data Model](#2-logical-data-model) | Domain-to-storage mapping |
| [3. Physical PostgreSQL Model](#3-physical-postgresql-model) | Tables, columns, types |
| [4. Naming Conventions](#4-naming-conventions) | Database naming rules |
| [5. Constraints](#5-constraints) | Business rules as DB constraints |
| [6. Foreign Keys](#6-foreign-keys) | Relationship enforcement |
| [7. Enum Strategy](#7-enum-strategy) | PostgreSQL enum types |
| [8. Audit Fields](#8-audit-fields) | Standard metadata columns |
| [9. Soft Delete Strategy](#9-soft-delete-strategy) | Trash pattern |
| [10. Archive Strategy](#10-archive-strategy) | Lead archive pattern |
| [11. Index Strategy](#11-index-strategy) | Query performance |
| [12. Row Level Security](#12-row-level-security) | RLS policies |
| [13. Migration Strategy](#13-migration-strategy) | Versioned schema changes |
| [14. Seed Strategy](#14-seed-strategy) | Development bootstrap data |
| [15. Derived Views](#15-derived-views) | Timeline (no table) |
| [16. Entity Diagram](#16-entity-diagram) | Physical ER diagram |
| [17. Identity & Authentication Flow](#17-identity--authentication-flow) | Login, profile gate, access denied |
| [18. MVP Permission Matrix](#18-mvp-permission-matrix-application) | Role capabilities in code (V2 = DB permissions) |

---

## 1. Overview

### Purpose

Define how approved domain entities are stored in PostgreSQL so that migrations (post-approval), RLS policies, and feature services implement a single coherent persistence layer.

### Design Principles

| Principle | Application |
|-----------|-------------|
| Domain traceability | Every table maps to a domain entity |
| Auth vs business identity | `auth.users` for credentials; `profiles` for CRM business identity (separate PKs) |
| Admin-provisioned profiles | Profiles created by Admin only — never auto-created at login |
| RLS by default | Every application table has RLS enabled |
| Soft delete for recoverable entities | `deleted_at` column — not for Activity or AuditLog |
| Archive via outcome | Lead `outcome` + `archived_at` — separate from trash |
| Audit columns on mutable tables | `created_at`, `updated_at`, `created_by`, `updated_by` |
| Immutable logs | Activity and AuditLog are append-only |
| No Timeline table | Chronological view derived at query time |

### Auth Integration

| Layer | Storage |
|-------|---------|
| Credentials | `auth.users` (Supabase managed) |
| CRM business identity | `profiles` table — separate from auth |
| Auth link | `profiles.auth_user_id` → `auth.users.id` (nullable until linked) |
| Business identity PK | `profiles.profile_id` — referenced by all business tables |
| Role | `profiles.role_id` → `roles` (assigned by Admin only) |
| Permissions (MVP) | Application code matrix by role code — **not** database tables |
| Permissions (V2) | `permissions` + `role_permissions` tables (deferred) |

### Identity Rules

| Rule | Detail |
|------|--------|
| No auto-create at login | Authentication may succeed without a profile; CRM access requires an existing active profile |
| Admin creates profiles | Only Admin provisions profiles and assigns roles |
| No default role | New auth users do not receive a role until Admin assigns one |
| Business FKs | All business tables reference `profiles.profile_id`, never `auth.users.id` |

---

## 2. Logical Data Model

Logical entities and their persistence mapping.

| Domain Entity | Logical Store | Notes |
|---------------|---------------|-------|
| User | `profiles` + `auth.users` | Auth credentials separate from business identity |
| Role | `roles` | Reference data |
| Permission (MVP) | Application code | Role capability matrix in `src/features/auth/config/` |
| Permission (V2) | `permissions` + `role_permissions` | Deferred — fine-grained DB permissions |
| Lead | `leads` | Aggregate root |
| Contact | `contacts` | Child of Lead |
| Activity | `activities` | Append-only |
| FollowUp | `follow_ups` | Child of Activity; 1:N |
| Demo | `demos` | Child of Lead |
| Task | `tasks` | Optional Lead link |
| Report | `reports` | Generated artifacts |
| Notification | `notifications` | Per-user alerts |
| AuditLog | `audit_logs` | Append-only |
| App config | `app_settings` | Timezone, retention, etc. |
| Timeline | *(derived)* | **No table** — query union |

### Logical Relationships

```
auth.users 1──0..1 profiles (via auth_user_id)
profiles N──1 roles
profiles N──1 profiles (manager_profile_id, self-ref for team)

profiles 1──N leads (owner_profile_id)
profiles 1──N leads (assigned_to_profile_id, nullable)
leads 1──N contacts
leads 1──N activities
leads 1──N demos
leads 1──N tasks
activities 1──N follow_ups
profiles 1──N follow_ups (assigned_to_profile_id)
profiles 1──N tasks (assigned_to_profile_id)
profiles 1──N notifications (recipient_profile_id)
profiles 1──N reports (recipient_profile_id)
profiles 1──N audit_logs (actor_profile_id)
```

---

## 3. Physical PostgreSQL Model

### 3.1 `roles`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | Primary key |
| code | text | NOT NULL | Unique role code (`ceo`, `admin`, etc.) |
| name | text | NOT NULL | Display name |
| description | text | YES | Role description |
| created_at | timestamptz | NOT NULL | Audit |
| updated_at | timestamptz | NOT NULL | Audit |

### 3.2 `permissions` (V2 — deferred)

> **MVP**: Permissions are enforced via the [application permission matrix](#18-mvp-permission-matrix-application). Database permission tables are **not** created in the identity foundation milestone.

Planned for V2:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | Primary key |
| code | text | NOT NULL | Unique (`lead:create`) |
| resource | text | NOT NULL | Resource name |
| action | text | NOT NULL | Action name |
| description | text | YES | Human-readable |
| created_at | timestamptz | NOT NULL | Audit |

### 3.3 `role_permissions` (V2 — deferred)

> **MVP**: Role capabilities defined in code. Junction table deferred to V2.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| role_id | uuid | PK, FK | → `roles.id` |
| permission_id | uuid | PK, FK | → `permissions.id` |

### 3.4 `profiles`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| profile_id | uuid | PK | Business identity primary key (`gen_random_uuid()`) |
| auth_user_id | uuid | YES, FK, UNIQUE | → `auth.users.id` — set when Admin links auth account |
| email | text | NOT NULL | Denormalized from auth or entered by Admin |
| display_name | text | NOT NULL | |
| phone | text | YES | |
| role_id | uuid | NOT NULL, FK | → `roles.id` — assigned by Admin only |
| manager_profile_id | uuid | YES, FK | → `profiles.profile_id` (team hierarchy) |
| status | user_status | NOT NULL | `invited`, `active`, `deactivated` |
| deleted_at | timestamptz | YES | Soft delete |
| deleted_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |
| created_at | timestamptz | NOT NULL | Audit |
| updated_at | timestamptz | NOT NULL | Audit |
| created_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |
| updated_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |

**Activation rule**: A user may authenticate via Supabase Auth, but CRM access requires a profile with `status = active` and a valid `role_id`. Profiles are created by Admin — never auto-created at login.

### 3.5 `app_settings`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| key | text | PK | Setting key |
| value | jsonb | NOT NULL | Setting value |
| description | text | YES | |
| updated_at | timestamptz | NOT NULL | |
| updated_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |

**Seed keys**: `organization_timezone` (default `Asia/Kolkata`), `trash_retention_days` (default `30`)

### 3.6 `leads`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| title | text | NOT NULL | |
| owner_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| assigned_to_profile_id | uuid | YES, FK | → `profiles.profile_id` (reassignment) |
| status | lead_status | NOT NULL | `active`, `in_progress`, `trashed` |
| outcome | lead_outcome | YES | `won`, `lost`, `archived` — set when closing |
| source | text | YES | |
| priority | lead_priority | YES | `low`, `medium`, `high` |
| notes | text | YES | |
| archived_at | timestamptz | YES | Set when outcome is set |
| deleted_at | timestamptz | YES | Soft delete (trash) |
| deleted_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL | |
| created_by_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| updated_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |

**Archive rule**: When `outcome` is set (`won`, `lost`, or `archived`), `archived_at` is set and Lead is in Archive.

### 3.7 `contacts`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| lead_id | uuid | NOT NULL, FK | → `leads.id` |
| first_name | text | NOT NULL | |
| last_name | text | NOT NULL | |
| email | text | YES | |
| phone | text | YES | |
| job_title | text | YES | |
| is_primary | boolean | NOT NULL | Default false |
| deleted_at | timestamptz | YES | |
| deleted_by_profile_id | uuid | YES, FK | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL | |
| created_by_profile_id | uuid | NOT NULL, FK | |
| updated_by_profile_id | uuid | YES, FK | |

### 3.8 `activities`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| lead_id | uuid | NOT NULL, FK | → `leads.id` |
| type | activity_type | NOT NULL | Enum |
| description | text | NOT NULL | |
| occurred_at | timestamptz | NOT NULL | |
| created_by_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| created_at | timestamptz | NOT NULL | Immutable — no `updated_at` |

**No soft delete. No update after insert** (append-only, BR-ACT-01).

### 3.9 `follow_ups`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| activity_id | uuid | NOT NULL, FK | → `activities.id` |
| lead_id | uuid | NOT NULL, FK | → `leads.id` (denormalized) |
| assigned_to_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| due_at | timestamptz | NOT NULL | Stored UTC; evaluated in org timezone |
| notes | text | YES | |
| status | follow_up_status | NOT NULL | `pending`, `completed`, `overdue` |
| completed_at | timestamptz | YES | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL | |
| created_by_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| updated_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |

**Multiple FollowUps per Activity** (OD-07). Minimum 1 at Activity creation.

### 3.10 `demos`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| lead_id | uuid | NOT NULL, FK | |
| scheduled_at | timestamptz | NOT NULL | |
| status | demo_status | NOT NULL | |
| notes | text | YES | |
| created_by_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| deleted_at | timestamptz | YES | |
| deleted_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL | |
| updated_by_profile_id | uuid | YES, FK | → `profiles.profile_id` |

### 3.11 `tasks`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| lead_id | uuid | YES, FK | Optional |
| assigned_to_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| title | text | NOT NULL | |
| description | text | YES | |
| status | task_status | NOT NULL | |
| due_at | timestamptz | YES | |
| completed_at | timestamptz | YES | |
| deleted_at | timestamptz | YES | |
| deleted_by_profile_id | uuid | YES, FK | |
| created_at | timestamptz | NOT NULL | |
| updated_at | timestamptz | NOT NULL | |
| created_by_profile_id | uuid | NOT NULL, FK | |
| updated_by_profile_id | uuid | YES, FK | |

### 3.12 `reports`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| type | report_type | NOT NULL | |
| recipient_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| period_start | timestamptz | NOT NULL | |
| period_end | timestamptz | NOT NULL | |
| delivery_channel | report_delivery | NOT NULL | `email`, `in_app` |
| summary | jsonb | NOT NULL | Aggregated metrics payload |
| generated_at | timestamptz | NOT NULL | |
| created_at | timestamptz | NOT NULL | |

### 3.13 `notifications`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| recipient_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| type | notification_type | NOT NULL | |
| title | text | NOT NULL | |
| body | text | YES | |
| status | notification_status | NOT NULL | `unread`, `read` |
| entity_type | text | YES | Reference entity |
| entity_id | uuid | YES | Reference id |
| read_at | timestamptz | YES | |
| created_at | timestamptz | NOT NULL | |

### 3.14 `audit_logs`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | PK | |
| actor_profile_id | uuid | NOT NULL, FK | → `profiles.profile_id` |
| action | audit_action | NOT NULL | Enum |
| entity_type | text | NOT NULL | |
| entity_id | uuid | NOT NULL | |
| metadata | jsonb | YES | Change summary |
| created_at | timestamptz | NOT NULL | Immutable |

**Append-only. No update. No delete. No RLS delete policy.**

---

## 4. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case, plural | `follow_ups`, `audit_logs` |
| Columns | snake_case | `owner_profile_id`, `due_at` |
| Primary keys | `profile_id` or `id` (uuid) | `profile_id` on profiles; `id` on other tables |
| Foreign keys | `{entity}_profile_id` or `{entity}_id` | `lead_id`, `owner_profile_id` |
| Profile FK target | `profiles.profile_id` | All business identity references |
| Enums | snake_case type name | `lead_outcome` |
| Enum values | snake_case | `in_progress` |
| Indexes | `idx_{table}_{columns}` | `idx_leads_owner_profile_id` |
| Unique constraints | `uq_{table}_{column}` | `uq_roles_code` |
| Check constraints | `chk_{table}_{rule}` | `chk_leads_outcome_archived` |
| RLS policies | `{table}_{operation}_{scope}` | `leads_select_own` |

FollowUp maps to table `follow_ups` (canonical entity name in docs/code: FollowUp).

---

## 5. Constraints

### Primary Keys

All tables use `uuid` primary key with `gen_random_uuid()` default at migration time.

### Unique Constraints

| Table | Column(s) | Rule |
|-------|-----------|------|
| roles | code | One row per role |
| profiles | email | Unique among non-deleted (where `deleted_at IS NULL`) |
| profiles | auth_user_id | Unique when not null |
| app_settings | key | One row per setting |

### Check Constraints

| Table | Constraint | Rule |
|-------|-----------|------|
| leads | outcome requires archived_at | If `outcome` IS NOT NULL then `archived_at` IS NOT NULL |
| leads | archived implies outcome | If `archived_at` IS NOT NULL then `outcome` IS NOT NULL |
| leads | trashed vs archived | `status` = `trashed` implies `outcome` IS NULL |
| activities | no soft delete | `deleted_at` column does not exist |
| follow_ups | due after activity | `due_at` validated at application layer |
| contacts | one primary per lead | Partial unique index: one `is_primary = true` per `lead_id` where not deleted |

### Business Rule Constraints

| Rule ID | Enforcement |
|---------|-------------|
| BR-ACT-01 | No DELETE on `activities`; no `deleted_at` column |
| BR-ACT-02 | Application transaction: ≥1 `follow_ups` row per new `activities` row |
| BR-LEAD-04 / OD-02 | `outcome` ∈ {won, lost, archived} triggers `archived_at` |
| BR-DATA-01 / OD-04 | `deleted_at` + 30-day retention enforced by scheduled job |
| BR-FU-01 / OD-03 | Overdue job compares `due_at` in org timezone |
| OD-05 | RLS: Manager UPDATE on team leads; no permanent DELETE for Manager |
| OD-07 | FK allows multiple `follow_ups` per `activity_id` |

---

## 6. Foreign Keys

| Child Table | Column | Parent | On Delete |
|-------------|--------|--------|-----------|
| profiles | auth_user_id | auth.users | SET NULL |
| profiles | role_id | roles | RESTRICT |
| profiles | manager_profile_id | profiles | SET NULL |
| leads | owner_profile_id | profiles | RESTRICT |
| leads | assigned_to_profile_id | profiles | SET NULL |
| contacts | lead_id | leads | RESTRICT |
| activities | lead_id | leads | RESTRICT |
| follow_ups | activity_id | activities | RESTRICT |
| follow_ups | lead_id | leads | RESTRICT |
| follow_ups | assigned_to_profile_id | profiles | RESTRICT |
| demos | lead_id | leads | RESTRICT |
| tasks | lead_id | leads | SET NULL |
| tasks | assigned_to_profile_id | profiles | RESTRICT |
| notifications | recipient_profile_id | profiles | CASCADE |
| reports | recipient_profile_id | profiles | RESTRICT |
| audit_logs | actor_profile_id | profiles | RESTRICT |

**RESTRICT** on Lead children prevents orphan records while Lead is active. Soft-deleted Leads retain children until restored or permanently deleted by Admin.

---

## 7. Enum Strategy

Use PostgreSQL `CREATE TYPE` enums for fixed domain values. Application constants in `src/constants/` mirror enum values.

| Enum Type | Values |
|-----------|--------|
| `user_status` | `invited`, `active`, `deactivated` |
| `lead_status` | `active`, `in_progress`, `trashed` |
| `lead_outcome` | `won`, `lost`, `archived` |
| `lead_priority` | `low`, `medium`, `high` |
| `activity_type` | `call`, `email`, `meeting`, `note`, `linkedin`, `other` |
| `follow_up_status` | `pending`, `completed`, `overdue` |
| `demo_status` | `scheduled`, `completed`, `cancelled`, `no_show` |
| `task_status` | `pending`, `in_progress`, `completed`, `cancelled` |
| `report_type` | `daily_ceo`, `pipeline`, `activity`, `custom` |
| `report_delivery` | `email`, `in_app` |
| `notification_type` | `followup_overdue`, `task_due`, `demo_reminder`, `system` |
| `notification_status` | `unread`, `read` |
| `audit_action` | `created`, `updated`, `soft_deleted`, `restored`, `permanent_deleted`, `archived`, `role_changed`, `login`, `logout` |

### Enum Change Policy

1. Add new value via `ALTER TYPE ... ADD VALUE` migration
2. Never remove enum values in production — deprecate in application
3. Document enum changes in migration comments

---

## 8. Audit Fields

### Standard Columns (mutable entities)

| Column | Purpose |
|--------|---------|
| `created_at` | Row creation timestamp (timestamptz, UTC) |
| `updated_at` | Last modification (auto-updated via trigger) |
| `created_by_profile_id` | `profiles.profile_id` of creator |
| `updated_by_profile_id` | `profiles.profile_id` of last editor |

**Applies to**: profiles, leads, contacts, follow_ups, demos, tasks

### Append-Only Tables

| Table | Audit approach |
|-------|----------------|
| activities | `created_at`, `created_by_profile_id` only |
| audit_logs | `created_at` only |
| reports | `generated_at`, `created_at` |
| notifications | `created_at`; `read_at` on status change |

### Triggers (planned at migration)

- `updated_at` auto-set on UPDATE for tables with that column
- AuditLog insertion via service layer on domain mutations

---

## 9. Soft Delete Strategy

### Pattern

| Column | Type | Purpose |
|--------|------|---------|
| `deleted_at` | timestamptz | NULL = active; set = in Trash |
| `deleted_by` | uuid | Who soft-deleted |

### Applies To

`profiles`, `leads`, `contacts`, `demos`, `tasks`

### Does Not Apply To

`activities` (BR-ACT-01), `audit_logs` (immutable), `reports`, `notifications` (hard lifecycle)

### Query Convention

All SELECT policies and application queries filter `deleted_at IS NULL` unless querying Trash explicitly.

### Retention (OD-04)

- Trash retention: **30 days** (`app_settings.trash_retention_days`)
- Scheduled job flags records past retention for Admin review
- Only Admin with `trash:permanent_delete` can hard-delete
- Admin can restore at any time within retention

### Restore

Restore sets `deleted_at = NULL`, `deleted_by = NULL`, reverts `leads.status` from `trashed` to previous status (stored in `metadata` or application state).

---

## 10. Archive Strategy

### Lead Archive (OD-02, BR-LEAD-04)

| Field | Purpose |
|-------|---------|
| `outcome` | `won`, `lost`, or `archived` |
| `archived_at` | Timestamp when Lead closed |

**Rules**:

- Setting any outcome sets `archived_at` and removes Lead from active pipeline
- Archived Leads are read-only for most Roles (except Admin)
- Archived Leads cannot receive new Activities, Contacts, or Demos (VR-X01, VR-X02)
- Archive is **separate from Trash** — archived Leads have `deleted_at IS NULL`

### Views (application layer, not tables)

| View | Filter |
|------|--------|
| Active pipeline | `outcome IS NULL AND deleted_at IS NULL` |
| Archive | `outcome IS NOT NULL AND deleted_at IS NULL` |
| Trash | `deleted_at IS NOT NULL` |

---

## 11. Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| profiles | `(role_id)` | Role-based queries |
| profiles | `(manager_profile_id)` | Team hierarchy |
| profiles | `(auth_user_id)` UNIQUE | Auth lookup at login |
| profiles | `(email)` | Lookup |
| profiles | `(deleted_at)` WHERE NULL | Active users |
| leads | `(owner_profile_id)` | Owner's pipeline |
| leads | `(assigned_to_profile_id)` | Assigned leads |
| leads | `(status)` | Pipeline filters |
| leads | `(outcome)` WHERE NOT NULL | Archive queries |
| leads | `(archived_at)` | Archive sorting |
| leads | `(deleted_at)` WHERE NULL | Active leads |
| leads | `(created_at DESC)` | Recent leads |
| contacts | `(lead_id)` | Lead detail |
| activities | `(lead_id, occurred_at DESC)` | Activity log, Timeline |
| follow_ups | `(assigned_to_profile_id, status)` | My follow-ups |
| follow_ups | `(lead_id)` | Lead follow-ups |
| follow_ups | `(due_at)` WHERE status = pending | Overdue job |
| follow_ups | `(activity_id)` | Activity follow-ups |
| demos | `(lead_id)` | Lead demos |
| demos | `(scheduled_at)` | Upcoming demos |
| tasks | `(assigned_to_profile_id, status)` | My tasks |
| tasks | `(lead_id)` | Lead tasks |
| notifications | `(recipient_profile_id, status)` | Unread count |
| reports | `(recipient_profile_id, generated_at DESC)` | Report history |
| audit_logs | `(entity_type, entity_id)` | Entity audit trail |
| audit_logs | `(actor_profile_id, created_at DESC)` | User actions |
| audit_logs | `(created_at DESC)` | Recent audit |

---

## 12. Row Level Security

RLS **enabled on all tables**. Default deny; explicit policies grant access.

### Helper Functions (planned)

| Function | Returns | Purpose |
|----------|---------|---------|
| `auth.profile_id()` | uuid | Current user's `profiles.profile_id` (resolved via `auth_user_id = auth.uid()`) |
| `auth.user_role()` | text | Current user's role code |
| `auth.has_capability(key)` | boolean | MVP capability check (wraps application matrix) |
| `auth.is_admin()` | boolean | Admin shortcut |
| `auth.is_manager_of(profile_id)` | boolean | Team scope for Manager |

### Policy Matrix (summary)

| Table | CEO | Admin | Manager | BDE/Marketing/Recruiter |
|-------|-----|-------|---------|------------------------|
| profiles | read all | full | read team | read self |
| leads | read all | full | read/edit/reassign team (OD-05) | CRUD own |
| contacts | read all | full | team leads | own leads |
| activities | read all | read all | team leads | own leads |
| follow_ups | read all | read all | team | own + assigned |
| demos | read all | full | team | own leads |
| tasks | read all | full | team | own + assigned |
| reports | read own | full | read team | read own |
| notifications | own | own | own | own |
| audit_logs | read all | read all | — | — |
| app_settings | read | full | read | read |

### Key RLS Rules

| Rule | Policy |
|------|--------|
| OD-01 | INSERT on leads: role ∈ {admin, manager, bde, marketing, recruiter} |
| OD-05 | Manager: SELECT/UPDATE team leads via `manager_profile_id` chain; no DELETE |
| BR-ACT-01 | No DELETE policy on activities for any role |
| BR-DATA-01 | Trash visible only to Admin; restore/permanent_delete Admin only |
| Archive | UPDATE on archived leads denied except Admin read |
| Service role | Edge functions use service role for scheduled jobs only |

---

## 13. Migration Strategy

### Principles

| Principle | Detail |
|-----------|--------|
| One migration per logical change | `supabase/migrations/YYYYMMDDHHMMSS_description.sql` |
| Idempotent where possible | Use `IF NOT EXISTS` for extensions, types |
| Order | enums → tables → indexes → FKs → RLS → triggers → seed |
| No data migration in schema migrations | Data backfills in separate migration |
| Review before apply | M5 approved design → M6+ writes first migration |

### Planned Migration Phases

| Phase | Milestone | Content |
|-------|-----------|---------|
| 1 | M8 (Identity) | `user_status` enum, `roles`, `profiles`, RLS base for identity tables |
| 2 | M9 (User Management) | Admin profile CRUD; link `auth_user_id`; role assignment |
| 3 | M10+ | `app_settings`, leads, contacts, activities, follow_ups, demos, tasks per feature |
| 4 | M16+ | reports, notifications |
| 5 | M10+ | audit_logs |
| V2 | Post-MVP | `permissions`, `role_permissions` tables; migrate matrix to DB |

### Rollback

- Forward-only migrations in production
- Destructive changes require explicit ADR and stakeholder approval
- Development: `supabase db reset` for clean slate

---

## 14. Seed Strategy

### Environment Scope

| Environment | Seed approach |
|-------------|---------------|
| Local development | Roles via `supabase/seed.sql`; profiles created by Admin (not seeded automatically) |
| Staging | Roles only; Admin-provisioned profiles |
| Production | Roles only; no test data |

### Seed Order (MVP)

1. `roles` (6 roles)
2. `app_settings` (timezone `Asia/Kolkata`, trash retention 30) — when settings milestone ships
3. Development only: Admin-created sample profiles and domain data

> **No permission seed in MVP.** Role capabilities are defined in application code ([§18](#18-mvp-permission-matrix-application)).

### Reference Seed Data

**Roles** (required):

| Code | Name |
|------|------|
| `ceo` | CEO |
| `admin` | Admin |
| `manager` | Manager |
| `bde` | Business Development Executive |
| `marketing` | Marketing Executive |
| `recruiter` | Recruiter |

**Profiles**: Created by Admin via User Management — **not** auto-created at login. Each profile receives `role_id` at creation time.

**Default app_settings** (when implemented):

| key | value |
|-----|-------|
| organization_timezone | `Asia/Kolkata` |
| trash_retention_days | `30` |

**Development users** (local only): Admin creates Supabase Auth users and links them to profiles via User Management — not committed.

### MVP Capability Highlights (OD-01, OD-05)

See [§18 MVP Permission Matrix](#18-mvp-permission-matrix-application) for the full application-level matrix.

| Role | lead:create | lead:update (team) | trash:permanent_delete |
|------|-------------|-------------------|------------------------|
| admin | ✓ | ✓ all | ✓ |
| manager | ✓ | ✓ team | ✗ |
| bde | ✓ | ✓ own | ✗ |
| marketing | ✓ | ✓ own | ✗ |
| recruiter | ✓ | ✓ own | ✗ |
| ceo | ✗ | ✗ | ✗ |

---

## 15. Derived Views

### Timeline View (not a table)

**Type**: Derived read model — application query union  
**Purpose**: Chronological view of all engagement on a Lead  
**Storage**: None

**Sources** (unioned by `occurred_at` / `due_at` / `scheduled_at`):

| Source | Sort field | Event type |
|--------|-----------|------------|
| activities | `occurred_at` | activity |
| follow_ups | `due_at` | follow_up |
| demos | `scheduled_at` | demo |
| tasks | `due_at` or `created_at` | task |

**Access**: Feature query in `features/leads/` or shared service — not a PostgreSQL materialized view at launch (may add later for performance).

**Domain reference**: [Timeline View](../domain/domain-model.md#11-timeline-view-derived)

### Dashboard (OD-06)

Primary reporting interface — aggregates from leads, activities, follow_ups, demos, tasks. No `dashboard` table. Email Report is a scheduled summary via `reports` table. Manual export reads same aggregates.

---

## 16. Entity Diagram

```mermaid
erDiagram
    auth_users ||--o| profiles : links
    roles ||--o{ profiles : assigns
    profiles ||--o{ profiles : manages
    profiles ||--o{ leads : owns
    profiles ||--o{ leads : assigned
    leads ||--o{ contacts : has
    leads ||--o{ activities : has
    leads ||--o{ demos : has
    leads ||--o{ tasks : has
    activities ||--o{ follow_ups : has
    profiles ||--o{ follow_ups : assigned
    profiles ||--o{ tasks : assigned
    profiles ||--o{ notifications : receives
    profiles ||--o{ reports : receives
    profiles ||--o{ audit_logs : performs
```

---

## 17. Identity & Authentication Flow

Authentication (Supabase Auth) and CRM access (profile gate) are **separate steps**.

### Flow

```
Login (email + password)
        ↓
Supabase Auth succeeds?
        ├─ No  → Show auth error
        └─ Yes → Load profile by auth_user_id
                        ↓
                 Profile exists AND status = active?
                        ├─ No  → Access Denied
                        │         "Your account has not been activated.
                        │          Please contact your administrator."
                        └─ Yes → Load role (from profiles.role_id)
                                      ↓
                                 Load capabilities (from application matrix)
                                      ↓
                                 Redirect to Dashboard
```

### Access Denied

| Condition | Auth result | CRM access |
|-----------|-------------|------------|
| Invalid credentials | Fail | Denied |
| Valid auth, no profile | Success | Denied — Access Denied page |
| Valid auth, profile `invited` | Success | Denied — not yet activated |
| Valid auth, profile `deactivated` | Success | Denied — not active |
| Valid auth, active profile, no role | Success | Denied — friendly role error |
| Valid auth, active profile, valid role | Success | Granted |

### Provisioning (Admin only)

1. Admin creates a profile in User Management (assigns `role_id`, `status`)
2. Admin links `auth_user_id` when the user registers or is invited in Supabase Auth
3. User logs in — profile gate passes — CRM access granted

**Never**: auto-create profile at login, default role assignment, or self-registration.

---

## 18. MVP Permission Matrix (Application)

MVP enforces role capabilities in **application code**, not database tables.

### Location (planned)

```
src/features/auth/config/permissionMatrix.js
```

### Capability keys (MVP)

Coarse capabilities derived from domain model and OD-01 / OD-05:

| Capability | Description |
|------------|-------------|
| `lead:create` | Create leads (OD-01) |
| `lead:read_own` | Read own leads |
| `lead:read_team` | Read team leads (Manager) |
| `lead:read_all` | Read all leads (CEO, Admin) |
| `lead:update_own` | Update own leads |
| `lead:update_team` | Update team leads (OD-05) |
| `lead:update_all` | Update any lead (Admin) |
| `lead:reassign` | Reassign leads (Manager, Admin) |
| `lead:archive` | Set lead outcome |
| `user:manage` | Create/update/deactivate profiles (Admin) |
| `trash:read` | View trash |
| `trash:restore` | Restore from trash (Admin) |
| `trash:permanent_delete` | Permanent delete (Admin) |
| `report:read` | View own reports |
| `report:read_all` | View all reports (CEO, Admin) |
| `report:export` | Export reports |
| `auditlog:read` | View audit logs (CEO, Admin) |
| `settings:read` | View settings |
| `settings:update` | Update settings (Admin) |

### Role → Capability Matrix

| Capability | CEO | Admin | Manager | BDE | Marketing | Recruiter |
|------------|:---:|:-----:|:-------:|:---:|:---------:|:---------:|
| `lead:create` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lead:read_own` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lead:read_team` | | ✓ | ✓ | | | |
| `lead:read_all` | ✓ | ✓ | | | | |
| `lead:update_own` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `lead:update_team` | | ✓ | ✓ | | | |
| `lead:update_all` | | ✓ | | | | |
| `lead:reassign` | | ✓ | ✓ | | | |
| `lead:archive` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `user:manage` | | ✓ | | | | |
| `trash:read` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `trash:restore` | | ✓ | | | | |
| `trash:permanent_delete` | | ✓ | | | | |
| `report:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `report:read_all` | ✓ | ✓ | | | | |
| `report:export` | ✓ | ✓ | | | | |
| `auditlog:read` | ✓ | ✓ | | | | |
| `settings:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `settings:update` | | ✓ | | | | |

### V2 Migration Path

When fine-grained permissions are needed:

1. Add `permissions` and `role_permissions` tables
2. Seed from this matrix
3. Replace `auth.has_capability()` internals with DB lookups
4. Keep application matrix as fallback during transition

---

## Approval Checklist

- [ ] Logical model maps all domain entities
- [ ] Auth identity separated from business identity (`profile_id` / `auth_user_id`)
- [ ] No auto-create profile at login; Admin provisioning documented
- [ ] MVP permissions in application code; V2 DB permissions deferred
- [ ] Physical model supports OD-01 through OD-07
- [ ] Business tables reference `profiles.profile_id`
- [ ] Soft delete and archive strategies clear
- [ ] RLS matrix approved
- [ ] Login → profile gate → dashboard flow approved
- [ ] Migration and seed phases acceptable
- [ ] Timeline remains derived (no table)
- [ ] Ready for identity milestone implementation (post-approval)
