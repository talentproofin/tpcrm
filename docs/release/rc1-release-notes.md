# TPCRM v1.0 Release Candidate 1 (RC1)

**Release date:** TBD  
**Version:** 1.0.0-rc.1  
**Codename:** TalentProof CRM MVP

---

## Overview

First release candidate of the TalentProof internal Sales CRM. Feature-complete MVP covering lead management, activities, follow-ups, demos, contacts, user administration, dashboards, reports, and system settings.

---

## What's Included

### Core CRM
- Lead pipeline: create, edit, duplicate detection, soft delete, trash filter
- Contact management on lead detail
- Activity logging with outcomes and follow-up integration
- Follow-up workspace with filters and quick complete
- Demo lifecycle: schedule, complete, cancel, reschedule in-place

### Administration
- User management: invite, edit, deactivate, resend invite, password recovery
- Organization settings: business info + system defaults
- Lookup management: CRUD, archive, reorder
- Archive management: restore and permanent delete
- System information dashboard

### Dashboards & Reports
- Role-based dashboards (CEO, Manager, Executive)
- Daily report for authorized roles

### Security & Infrastructure
- Supabase Auth + PostgreSQL with RLS
- Middleware route protection
- Production security hardening (profile guard, audit integrity)
- Environment validation (`npm run verify:env`)

---

## Roles

| Role | Access |
|------|--------|
| Admin | Full access including settings write and user management |
| CEO | Read-only settings, full dashboard, user list |
| Manager | Team-scoped data, user list (no write) |
| Executive | Own data, follow-ups, leads |

---

## Upgrade Notes

1. Apply all migrations through `20250701280000_production_security_hardening.sql`
2. Set environment variables per [environment-variables.md](../deployment/environment-variables.md)
3. Run `npm run verify:env` before deploy
4. Complete [manual QA checklist](../deployment/manual-qa-checklist.md)

---

## Known Limitations

See [rc1-known-issues.md](./rc1-known-issues.md).

---

## Documentation

- [Deployment Guide](../deployment/README.md)
- [Production Checklist](../deployment/production-checklist.md)
- [Architecture Diagram](../deployment/architecture-diagram.md)
