# TPCRM v1.0 RC1 — Known Issues

Issues accepted for RC1 release. None block staging deployment.

## Security

| ID | Issue | Severity | Workaround |
|----|-------|----------|------------|
| SEC-01 | No rate limiting on invite/recovery API routes | Medium | Admin-only access; monitor abuse |
| SEC-02 | `profiles_select_active` exposes all active profiles to authenticated users | Low | Required for owner assignment dropdowns |
| SEC-03 | Managers can assign lead owner to any profile | Low | Business rule; RLS allows manager insert |

## UX / Consistency

| ID | Issue | Severity | Workaround |
|----|-------|----------|------------|
| UX-01 | No breadcrumb navigation on any page | Low | Dashboard nav + browser back |
| UX-02 | Lead detail Follow-ups panel shows placeholder | Low | Use Follow-ups workspace |
| UX-03 | `UserStatsSummary` error state has no retry button | Low | Refresh page |
| UX-04 | Settings error retry uses full page reload | Low | Acceptable |
| UX-05 | No column sort UI on tables | Low | Fixed server-side ordering |

## Accessibility

| ID | Issue | Severity |
|----|-------|----------|
| A11Y-01 | Limited `aria-label` on some icon-only action buttons | Low |
| A11Y-02 | Not all data tables have explicit `caption` elements | Low |

## Performance

| ID | Issue | Severity |
|----|-------|----------|
| PERF-01 | Middleware adds ~92 kB to edge bundle | Low |
| PERF-02 | Follow-ups workspace loads all matching items (no pagination) | Medium at scale |
| PERF-03 | Role fetched independently in multiple components per page | Low |

## Infrastructure

| ID | Issue | Severity |
|----|-------|----------|
| INF-01 | No automated E2E test suite | Medium |
| INF-02 | No `/api/health` endpoint | Low |
| INF-03 | Edge runtime warning for Supabase in middleware (build warning) | Low |

## Build

| ID | Issue | Severity |
|----|-------|----------|
| BUILD-01 | `next lint` deprecated warning (Next.js 16 migration pending) | Low |
