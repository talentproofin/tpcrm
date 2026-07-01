# Release Checklist

## Before Release

- [ ] All milestones for release scope complete
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run verify:env` passes locally with production-like env
- [ ] Manual QA smoke tests pass
- [ ] Database migrations reviewed and ordered
- [ ] Changelog / release notes drafted

## Release Steps

1. Tag release in version control
2. Apply database migrations to production
3. Verify `schema_version` in System Information
4. Deploy application
5. Run post-deploy smoke tests
6. Monitor logs for 30 minutes

## After Release

- [ ] Confirm no elevated error rate
- [ ] Admin can sign in and access Settings
- [ ] Document any incidents
