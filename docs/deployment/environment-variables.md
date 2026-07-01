# Environment Variables

Copy `.env.example` to `.env.local` for local development.

## Required

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Service role key for admin user APIs |

## Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL (must be valid http/https) |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `NODE_ENV` | `development` | Set by hosting platform in production |

## Security Rules

- **Never** prefix secrets with `NEXT_PUBLIC_`
- **Never** import `SUPABASE_SERVICE_ROLE_KEY` in Client Components
- `createAdminSupabaseClient()` is guarded with `server-only`
- Validate configuration: `npm run verify:env`

## Production Example

```env
NEXT_PUBLIC_APP_URL=https://crm.talentproof.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LOG_LEVEL=warn
```

## Startup Validation

- `getSupabaseConfig()` throws if URL or anon key missing
- `getSupabaseServiceRoleKey()` throws if service role key missing
- `env.appUrl` validates URL format at module load
- Middleware refreshes auth session on each request
