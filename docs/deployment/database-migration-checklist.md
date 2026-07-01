# Database Migration Checklist

## Before Migrating

- [ ] Review new SQL in `supabase/migrations/`
- [ ] Confirm migration timestamp ordering
- [ ] Backup production database
- [ ] Test migration on staging with production-like data

## Apply Migration

```bash
supabase db push
```

Or apply files manually in timestamp order.

## Verify

- [ ] No migration errors in output
- [ ] `app_settings.schema_version` updated
- [ ] RLS policies active on new/changed tables
- [ ] RPC `GRANT EXECUTE` present for new functions
- [ ] Application smoke test passes

## Rollback Plan

- Document whether migration is reversible
- If not reversible, ensure backup exists before apply

## Migration Index

| Migration | Milestone |
|-----------|-----------|
| `20250701130000` | Database foundation |
| `20250701140000` | Profiles |
| `20250701170000` | Leads |
| `20250701210000` | Contacts |
| `20250701220000` | Demos + audit logs |
| `20250701240000` | User management |
| `20250701250000` | User management refinement |
| `20250701260000` | System administration |
| `20250701270000` | Organization settings refinement |
| `20250701280000` | Production security hardening |
