# User Roles

## Role Inventory

| Role | Code | Primary Responsibilities |
|------|------|--------------------------|
| CEO | `ceo` | Executive visibility; Dashboard and Reports; daily email summary |
| Admin | `admin` | User management; Trash management; Lead creation; Settings |
| Manager | `manager` | Team oversight; create Leads; read, edit, reassign team Leads (OD-05) |
| Business Development Executive | `bde` | Create and manage own Leads, Contacts, Activities |
| Marketing Executive | `marketing` | Create and manage own Leads; marketing Activities |
| Recruiter | `recruiter` | Create and manage own Leads; recruitment Activities |

## Lead Creation (OD-01, Approved)

Roles permitted to create Leads: **Admin, Manager, BDE, Marketing Executive, Recruiter**.

CEO cannot create Leads by default.

## Known Constraints

- **BR-LEAD-01 / OD-01**: Lead creation roles as above
- **BR-MGR-01 / OD-05**: Manager read, edit, reassign team Leads — no permanent delete
- **BR-DATA-01 / OD-04**: Only Admin manages Trash (30-day retention)
- **BR-RPT-01 / OD-06**: Dashboard primary; CEO email summary at 8 PM

## Permission Matrix

Defined in [Persistence Design — RLS](../persistence/persistence-design.md#12-row-level-security).

## Authentication

- All Users authenticate via Supabase Email & Password
- Role assignment via `profiles.role_id` (M6+)
