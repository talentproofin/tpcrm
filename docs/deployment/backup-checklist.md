# Backup Checklist

## Supabase Managed

- [ ] Point-in-time recovery enabled (Pro plan)
- [ ] Daily backups configured
- [ ] Backup retention meets compliance needs
- [ ] Restore procedure tested on staging

## Before Risky Operations

- [ ] Manual backup before migration
- [ ] Manual backup before bulk archive delete
- [ ] Export critical lookup tables if seed will change

## Restore Test (Quarterly)

1. Restore backup to staging project
2. Verify login works
3. Verify lead count matches expectations
4. Document restore duration

## What to Backup

- PostgreSQL database (full)
- Environment variable secrets (separate secure store)
- Migration files (version control)
