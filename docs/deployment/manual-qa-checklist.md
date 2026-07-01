# Manual QA Checklist

Complete regression checklist for production readiness.

## Authentication

- [ ] Unauthenticated user redirected to `/login`
- [ ] Valid login reaches dashboard
- [ ] Invalid credentials show error
- [ ] Invited user activates on first login
- [ ] Inactive/suspended user cannot access dashboard
- [ ] Logout clears session

## Users (Admin)

- [ ] Admin can list users
- [ ] Admin can invite user
- [ ] Admin can edit user role/status
- [ ] Admin cannot deactivate self
- [ ] Resend invite works
- [ ] Password recovery email works
- [ ] CEO/Manager see appropriate access restrictions

## Leads

- [ ] List loads with pagination
- [ ] Create lead with validation
- [ ] Duplicate detection works
- [ ] Edit lead
- [ ] Soft delete (trash)
- [ ] Trashed filter works
- [ ] Lead detail loads

## Contacts

- [ ] Add contact on lead
- [ ] Edit contact
- [ ] Archive contact
- [ ] Primary contact sync

## Activities

- [ ] Log activity on lead
- [ ] Activity types/outcomes display
- [ ] Follow-up created when required

## Follow-ups

- [ ] Workspace loads
- [ ] Complete follow-up
- [ ] Reschedule follow-up
- [ ] Filters work

## Demos

- [ ] Schedule demo
- [ ] Complete with outcome
- [ ] Cancel demo
- [ ] Reschedule in-place
- [ ] Internal notes saved

## Dashboard

- [ ] CEO dashboard metrics load
- [ ] Manager dashboard scoped to team
- [ ] Executive dashboard scoped to self
- [ ] Loading and error states display

## Reports

- [ ] Daily report accessible to authorized roles
- [ ] Unauthorized roles blocked

## Settings

### Organization (Admin)

- [ ] Load/save business information
- [ ] Load/save system settings
- [ ] Timezone change requires confirmation
- [ ] CEO read-only

### Lookups (Admin)

- [ ] CRUD lookups
- [ ] Archive blocked when in use
- [ ] Reorder works

### Archive (Admin)

- [ ] List archived leads/contacts/demos
- [ ] Restore works
- [ ] Permanent delete with confirmation
- [ ] Dependency errors shown

### System Information

- [ ] Version, environment, counts display
- [ ] Node and Next.js versions shown

## Cross-cutting

- [ ] All pages show loading skeleton
- [ ] Empty states display correctly
- [ ] Error states include retry where applicable
- [ ] Dialogs keyboard accessible (Escape, focus trap)
- [ ] Forms validate before submit
