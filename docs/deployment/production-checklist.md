# Production Checklist

Use before first production launch and before each major release.

## Infrastructure

- [ ] Supabase production project provisioned
- [ ] All migrations applied (`schema_version` matches latest)
- [ ] RLS enabled on all application tables
- [ ] Service role key stored in secrets manager (not in repo)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] HTTPS enforced

## Application

- [ ] `npm run verify:env` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Middleware redirects unauthenticated users to `/login`
- [ ] Admin API routes require active admin session

## Security

- [ ] Profile privilege escalation trigger active
- [ ] Audit log actor validation active
- [ ] Audit logs readable by Admin/CEO only
- [ ] No secrets in client bundle
- [ ] `.env.local` not committed

## Data

- [ ] Seed lookup data present
- [ ] Admin user created and tested
- [ ] Backup strategy documented and tested

## Monitoring

- [ ] Error logging configured (`LOG_LEVEL=warn` or `error`)
- [ ] Supabase dashboard alerts enabled
- [ ] Smoke test completed (see Manual QA Checklist)

## Sign-off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| Product | | |
