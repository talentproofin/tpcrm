# Performance Standards

## Rendering

| Rule | Detail |
|------|--------|
| Server Components by default | Use Server Components whenever possible |
| Client Components only when necessary | Interactivity, browser APIs, or client state |
| Lazy load heavy components | Use `dynamic()` for large client components |
| Memoize expensive calculations | `useMemo` for costly derived data in Client Components |

## Data Loading

| Rule | Detail |
|------|--------|
| Pagination | Never load all records — paginate every list view |
| Debounced search | Debounce all search inputs (minimum 300ms) |
| Selective fetching | Fetch only fields needed for the current view |
| Server-side aggregation | Dashboard and Report metrics computed server-side |

## Client Bundle

- Minimize `"use client"` boundaries — push client boundaries as deep as possible
- Do not import heavy libraries in shared layouts
- Split large feature components into smaller lazy-loaded pieces

## Database

- Index columns used in filters, sorts, and joins
- Use RLS policies that do not cause full table scans
- Paginate at the database level (LIMIT/OFFSET or cursor-based)
