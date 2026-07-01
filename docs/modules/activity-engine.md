# Activity Engine

**Milestone**: 12A — Activity Engine Refinement  
**Status**: Approved refinement  
**Scope**: Lookup data, validation, activity metadata

---

## Business Context

TPCRM is an **activity tracking CRM**. Executives perform communication outside the system (phone, WhatsApp, email, LinkedIn, etc.). The CRM records that an interaction occurred — it does **not** send messages or requests.

Each manual interaction is logged as its own **Activity** with a type, outcome, remark, performer, optional direction, and a mandatory next follow-up.

---

## Activity Types

| Code | Name |
|------|------|
| `phone_call` | Phone Call |
| `whatsapp` | WhatsApp |
| `email` | Email |
| `linkedin` | LinkedIn |
| `demo` | Demo |
| `meeting` | Meeting |
| `note` | Note |

Types are fixed for MVP. Do not conflate type with outcome (e.g. no `email_sent` outcome — use type **Email** + outcome **Sent**).

---

## Activity Outcomes (by type)

Outcomes represent the **result of that specific interaction**. Each outcome is scoped to one activity type via `activity_outcomes.activity_type_id`.

### Phone Call

- Connected
- Not Answered
- Busy
- Switch Off
- Wrong Number
- Interested
- Not Interested
- Callback Requested

### WhatsApp

- Sent

### Email

- Sent

### LinkedIn

- Connection Request Sent

### Demo

- Scheduled
- Completed
- Cancelled
- Rescheduled

### Meeting

- Completed

### Note

- Recorded

### Deprecated codes (inactive)

Do not use: `email_sent`, `whatsapp_sent`, `linkedin_request_sent`, `demo_scheduled`, `demo_completed` — these duplicated activity type semantics.

---

## Validation Rules

1. **Type–outcome pairing**: `activityOutcomeId` must belong to the selected `activityTypeId` (lookup `activity_type_id` match).
2. **Allowed codes**: Outcome code must appear in the static allow-list for that type code (`ACTIVITY_TYPE_OUTCOME_CODES` in application code).
3. **UI filtering**: Outcome dropdown only shows outcomes for the selected type; changing type clears the outcome.
4. **Database**: RPC `create_activity_with_followup` rejects mismatched type/outcome pairs.

### Invalid examples (rejected)

| Activity type | Invalid outcome |
|---------------|-----------------|
| Phone Call | Scheduled, Sent, Busy (from another type’s context) |
| Email | Busy, Connected, Interested |
| LinkedIn | Connected, Not Answered |
| Demo | Interested, Callback Requested |
| Meeting | Scheduled (demo outcome) |

---

## Activity Direction (metadata)

| Field | Detail |
|-------|--------|
| Column | `activities.direction` |
| Type | `activity_direction` enum |
| Values | `outbound`, `inbound` |
| Required | No (optional in database) |
| Default | **Outbound** (application default) |

Direction indicates whether the interaction was initiated outbound or received inbound. It does not affect follow-up or outcome validation.

---

## Application References

| Concern | Location |
|---------|----------|
| Outcome allow-list | `src/features/activities/constants/outcomes.js` |
| Direction constants | `src/features/activities/constants/direction.js` |
| Validation schema | `src/features/activities/validation/createActivitySchema.js` |
| Seed data | `supabase/seed.sql` (type-scoped outcome inserts) |

---

## Out of scope (M12A)

- Database schema changes (already applied in prior migrations)
- Service / RPC changes
- Lead or follow-up architecture changes
- Automated sending of email, WhatsApp, or LinkedIn messages
