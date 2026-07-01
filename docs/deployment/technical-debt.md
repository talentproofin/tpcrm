# Remaining Technical Debt

Tracked items deferred from Milestone 20B. No new features required.

## Security

| Item | Priority | Notes |
|------|----------|-------|
| API rate limiting for invite/recovery emails | Medium | In-memory limit insufficient for multi-instance; use edge rate limiter or Supabase Auth quotas |
| `profiles_select_active` broad exposure | Low | All active profiles visible to authenticated users for assignment dropdowns |
| Manager lead owner assignment | Low | Managers can assign any owner; consider team-scoped constraint |
| CEO archive visibility policies | Low | CEO can SELECT all leads/contacts/demos for archive UI |

## Code Quality

| Item | Priority | Notes |
|------|----------|-------|
| Unused feature barrel `index.js` files | Low | Safe to delete or adopt consistently |
| `useCurrentProfile` in leads feature | Low | Move to `features/auth/hooks` when refactoring allowed |
| `PaginationControls` in leads feature | Low | Move to `components/` when refactoring allowed |
| Centralized role constants | Low | Role codes duplicated across permission modules |
| `eslint-plugin-unused-imports` | Low | Add to CI for dead import detection |

## Performance

| Item | Priority | Notes |
|------|----------|-------|
| Dashboard parallel queries | Low | Already batched; monitor under load |
| Lookup `getAllLookups` on heavy pages | Low | Consider caching per session |
| Bundle analysis | Low | Run `@next/bundle-analyzer` before scale |

## Testing

| Item | Priority | Notes |
|------|----------|-------|
| Automated E2E tests | Medium | Manual QA checklist covers MVP; add Playwright post-launch |
| RPC integration tests | Medium | Test migrations against local Supabase |

## Infrastructure

| Item | Priority | Notes |
|------|----------|-------|
| Structured production logging | Low | Integrate with hosted log drain |
| Health check endpoint | Low | Optional `/api/health` for uptime monitoring |
