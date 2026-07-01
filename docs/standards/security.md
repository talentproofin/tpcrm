# Security Standards

## Secrets

- **Never expose secrets** in client-side code, git, or documentation
- Store credentials in environment variables only
- Use `.env.local` for local development (never committed)

## Input Validation

- **Validate every request** — client-side for UX, server-side for security
- All mutations pass through `validation/` schemas before reaching `services/`
- Reject invalid input with clear error messages

## Database Security

- **Row Level Security (RLS)** enabled on every table
- Policies enforce Role and Permission checks at the database level
- Never rely on UI-only access control

## Authorization

- **Role-based permissions** checked in middleware, services, and RLS
- Permission matrix defined in User Management spec (Milestone 4)
- Deny by default — explicit grant required

## Audit

- **Audit important actions** — create, update, delete, role changes, permission changes
- Audit entries stored as `AuditLog` records
- AuditLog is append-only (no update or delete)

## Authentication

- Supabase Email & Password authentication
- Session managed via secure HTTP-only cookies
- Protected routes enforced in `src/middleware/`
