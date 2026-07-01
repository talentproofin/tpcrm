# Rollback Checklist

## When to Rollback

- Critical authentication failure
- Data corruption risk
- Widespread 500 errors after deploy
- Failed migration with partial apply

## Application Rollback

1. Redeploy previous known-good build/tag
2. Verify `/login` and `/dashboard`
3. Confirm middleware and API routes respond

## Database Rollback

> Prefer forward-fix migrations over destructive rollback.

1. **Do not** drop tables in production without backup
2. If migration failed mid-apply, restore from backup (see Backup Checklist)
3. If migration applied but buggy, create a corrective forward migration
4. Update `schema_version` only via migration scripts

## Post-rollback

- [ ] Notify stakeholders
- [ ] Root cause documented
- [ ] Fix planned before re-release
