# ADR 0003: Supabase Infrastructure Layer

**Milestone**: 3 — Supabase Setup  
**Status**: Accepted  
**Date**: 2026-07-01

---

## 1. Problem

The application requires a persistent data layer via Supabase (PostgreSQL). Multiple parts of the Next.js App Router stack need Supabase access — Server Components, Client Components, and (later) middleware — each with different client construction rules.

Without a centralized infrastructure layer:

- Supabase clients would be duplicated across features
- Environment variables would be read and validated inconsistently
- There would be no shared pattern for logging, errors, or service structure
- Authentication and business features would leak infrastructure concerns into feature code

The objective is **not** to configure Supabase in isolation. The objective is to build a **reusable Supabase infrastructure layer** that all future milestones consume.

---

## 2. Proposed Solution

Create a dedicated infrastructure layer under `src/services/` and `src/config/`:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Environment validation | `src/config/env.js`, `src/config/validateEnv.js` | Centralized, fail-fast env access |
| Supabase clients | `src/services/supabase/` | Browser, server, and middleware client factories |
| Service infrastructure | `src/services/infrastructure/` | Reusable `createService` pattern for consistent errors and logging |
| Logging | `src/services/logging/` | Structured logger with levels |
| Constants | `src/constants/` | App, logging, and Supabase config key names |

Clients are created via factory functions — not singletons at module scope — so each request gets a fresh server client with current cookies (required for SSR).

Environment validation runs when a client is requested, not at build time, so CI builds succeed without `.env.local`.

---

## 3. Alternative Solutions

### A. Single Supabase client file

One `supabase.js` exporting a shared client.

**Rejected**: Server and browser clients have different construction requirements in Next.js App Router. A singleton breaks cookie-based session handling in M5.

### B. Feature-owned Supabase clients

Each feature creates its own Supabase import.

**Rejected**: Violates DRY and feature independence principles. Infrastructure must be shared; business logic must be in features.

### C. Env validation at build time (Zod schema imported in `next.config`)

Validate all env vars during `next build`.

**Rejected**: Prevents building without a full `.env.local`. Validation at client-creation time is sufficient for M3.

### D. Install React Query in M3

Add TanStack Query alongside Supabase clients.

**Rejected**: Out of scope for M3. Server state management is introduced when authentication and data fetching begin (M5+).

---

## 4. Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Lazy env validation | Build succeeds without Supabase credentials | Runtime error if env missing when client is first used |
| Factory functions over singletons | Correct SSR cookie handling | Slightly more verbose client creation |
| No auth in M3 | Clean separation of concerns | Clients cannot be fully tested against live auth until M5 |
| No feature folders | No premature structure | Feature folders created per milestone adds setup step later |
| Custom logger vs. library | Zero extra dependencies, full control | Less feature-rich than pino/winston |

---

## 5. Final Decision

Build a **reusable Supabase infrastructure layer** with:

1. `@supabase/supabase-js` and `@supabase/ssr` as dependencies
2. Three client factories: `browser`, `server`, `middleware`
3. Centralized env validation in `src/config/`
4. `createService` infrastructure pattern in `src/services/infrastructure/`
5. Structured logging in `src/services/logging/`
6. Constants structure in `src/constants/`

**Explicitly excluded from M3:**

- Authentication
- Database tables and migrations
- Business logic
- Feature folders
- Business API wrappers

---

## 6. Implementation Plan

### Files to Create

```
src/config/
  validateEnv.js       # Env validation helpers
  env.js               # Updated centralized env access

src/constants/
  app.js               # App-wide constants
  logging.js           # Log level constants
  supabase.js          # Supabase env key names
  index.js             # Barrel export

src/services/
  supabase/
    browser.js         # createBrowserSupabaseClient()
    server.js          # createServerSupabaseClient()
    middleware.js      # createMiddlewareSupabaseClient()
    index.js
  logging/
    logger.js          # Structured logger
    index.js
  infrastructure/
    createService.js   # Reusable service factory
    index.js
  index.js             # Infrastructure barrel export

.env.example           # Add Supabase env vars
```

### Files to Remove

- All subfolders under `src/features/` (premature — created per feature milestone)

### Dependencies

- `@supabase/supabase-js`
- `@supabase/ssr`

### Verification

- `npm run build` passes without `.env.local`
- `npm run lint` passes
- Importing and calling client factories with valid env does not throw
- Importing client factories without env throws a clear validation error

### Manual Testing

- Set `.env.local` with Supabase credentials
- Import browser client in a temporary script or Node context
- Confirm validation error message when vars are missing
