# Architecture Diagram

```mermaid
flowchart TB
  subgraph Client
    Browser[Next.js Client Components]
  end

  subgraph Edge
    MW[Next.js Middleware]
  end

  subgraph AppServer[Next.js App Router]
    Pages[Dashboard Pages]
    API[Admin API Routes]
    SSR[Server Components]
  end

  subgraph Services
    AuthClient[Auth Browser Client]
    ServerClient[Auth Server Client]
    AdminClient[Service Role Client]
    FeatureServices[Feature Services]
  end

  subgraph Supabase
    Auth[Supabase Auth]
    DB[(PostgreSQL + RLS)]
    RPC[Security Definer RPCs]
  end

  Browser --> MW
  MW --> Pages
  Browser --> AuthClient
  AuthClient --> Auth
  AuthClient --> DB
  Pages --> FeatureServices
  FeatureServices --> AuthClient
  API --> ServerClient
  API --> AdminClient
  ServerClient --> Auth
  ServerClient --> RPC
  AdminClient --> Auth
  RPC --> DB
  DB --> RPC
```

## Layers

| Layer | Responsibility |
|-------|----------------|
| Middleware | Session refresh, route protection |
| Client Components | UI, form validation, read via anon client |
| API Routes | Admin-only auth operations (invite, recovery) |
| RPCs | Privileged mutations, audit logging |
| RLS | Row-level data access per role |

## Security Boundaries

- Anon key + RLS for standard CRM operations
- Service role **only** in server API routes for Supabase Auth admin
- Admin mutations via `SECURITY DEFINER` RPCs with explicit guards
