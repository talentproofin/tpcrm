# Business Rules

These rules govern domain behavior across all modules. Feature specs must comply with them.

Domain decisions OD-01 through OD-07 are **closed**. See [domain model](../domain/domain-model.md#closed-domain-decisions-approved).

## Lead Rules

| Rule | Description |
|------|-------------|
| BR-LEAD-01 | Admin, Manager, BDE, Marketing Executive, and Recruiter can create Leads (OD-01) |
| BR-LEAD-02 | One Lead can have multiple Contacts |
| BR-LEAD-03 | One Lead can have multiple Demos |
| BR-LEAD-04 | Leads with outcome Won, Lost, or Archived move to Archive (OD-02) |

## Activity Rules

| Rule | Description |
|------|-------------|
| BR-ACT-01 | Every Activity must be stored permanently |
| BR-ACT-02 | Every Activity must include at least one FollowUp; multiple allowed (OD-07) |

## FollowUp Rules

| Rule | Description |
|------|-------------|
| BR-FU-01 | Missed FollowUps become overdue (organization timezone, default Asia/Kolkata) (OD-03) |

## Data Lifecycle Rules

| Rule | Description |
|------|-------------|
| BR-DATA-01 | Admin manages Trash; 30-day retention (OD-04) |

## Manager Rules

| Rule | Description |
|------|-------------|
| BR-MGR-01 | Manager can read, edit, and reassign team Leads; cannot permanently delete (OD-05) |

## Reporting Rules

| Rule | Description |
|------|-------------|
| BR-RPT-01 | Dashboard is primary reporting; CEO receives daily email summary at 8 PM; manual export available (OD-06) |

## Audit Rules

| Rule | Description |
|------|-------------|
| BR-AUDIT-01 | Important actions produce AuditLog entries |

## Domain Model

Full entity definitions: [`docs/domain/domain-model.md`](../domain/domain-model.md)

## Persistence Design

Storage mapping: [`docs/persistence/persistence-design.md`](../persistence/persistence-design.md)
