# TPCRM v1.0 RC1 — Future Improvements

Post-v1.0 enhancements that do not change MVP scope. Ordered by impact.

## High Impact

1. **Automated E2E tests** — Playwright coverage for auth, leads, and admin flows
2. **API rate limiting** — Edge or middleware throttling for email admin endpoints
3. **Shared role context** — Single hook/context to avoid duplicate `getRoleById` fetches
4. **Follow-ups pagination** — Workspace pagination when follow-up volume grows

## Medium Impact

5. **Breadcrumb navigation** — Especially lead detail → list
6. **Column sorting UI** — User-controlled sort on leads and users tables
7. **Health check endpoint** — `/api/health` for uptime monitoring
8. **Structured logging** — Production log drain integration
9. **Bundle analysis** — `@next/bundle-analyzer` before scale-up
10. **ESLint unused-import plugin** — CI dead-code detection

## Low Impact

11. **Consolidate `createAuthError`** — Single source in `auth/utils`
12. **Remove unused barrel `index.js` files** — Or adopt barrel imports consistently
13. **Move `useCurrentProfile` to auth feature** — Reduce cross-feature coupling
14. **Move `PaginationControls` to `components/`** — Shared layout component
15. **Centralize role code constants** — `src/constants/roles.js`
16. **Table captions** — Accessibility improvement for data tables
17. **Migrate `next lint` to ESLint CLI** — Next.js 16 readiness

## Code Quality

18. **Delete `auth/utils/validators.js`** — Fully superseded by Zod (verify no imports first)
19. **Unify lookup registry** — Merge `LOOKUP_TABLES` and `LOOKUP_DEFINITIONS`
20. **Add `onRetry` to UserStatsSummary** — Minor UX polish
