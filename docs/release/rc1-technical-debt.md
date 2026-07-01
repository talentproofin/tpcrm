# TPCRM v1.0 RC1 — Technical Debt

Carried from Milestone 20B plus RC1 audit. No action required for RC1 ship.

| ID | Category | Item | Priority |
|----|----------|------|----------|
| TD-01 | Security | API rate limiting for invite/recovery | Medium |
| TD-02 | Security | Team-scoped manager lead assignment | Low |
| TD-03 | Code | Duplicate `createAuthError` in profileService | Low |
| TD-04 | Code | 9 unused feature barrel `index.js` files | Low |
| TD-05 | Code | Unused `validators.js`, `SETTINGS_ERROR_CODES` | Low |
| TD-06 | Architecture | `useCurrentProfile` in leads feature | Low |
| TD-07 | Architecture | `PaginationControls` in leads feature | Low |
| TD-08 | Architecture | Scattered role permission constants | Low |
| TD-09 | Testing | No E2E or RPC integration tests | Medium |
| TD-10 | Infra | No health check endpoint | Low |
| TD-11 | Infra | Production structured logging | Low |
| TD-12 | Performance | Follow-ups workspace unpaginated | Medium |
| TD-13 | Performance | Per-component role fetches | Low |
| TD-14 | A11y | Incomplete aria-label coverage on icon buttons | Low |
| TD-15 | Tooling | No `eslint-plugin-unused-imports` | Low |

Full detail: [technical-debt.md](../deployment/technical-debt.md)
