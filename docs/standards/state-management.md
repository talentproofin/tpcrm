# State Management Standards

Do **not** introduce Redux or Zustand initially.

## Approved Approaches

| State Type | Tool | When to Use |
|------------|------|-------------|
| Server state | React Query | Data from Supabase/API — introduced when server data fetching begins (Milestone 3+) |
| Global UI state | React Context | Only when truly global (e.g., theme, sidebar collapse) |
| Local UI state | `useState` / `useReducer` | Form inputs, toggles, modals — default choice |

## Rules

- Keep state as close as possible to where it is used.
- Do not lift state unless multiple siblings need it.
- Feature server state lives in `features/<name>/hooks/` using React Query.
- Never store server data in React Context when React Query is appropriate.

## What Not to Use (Initially)

- Redux
- Zustand
- Global state libraries without explicit approval

## Introduction Timeline

| Tool | Introduced |
|------|-----------|
| React Query | Milestone 3 (Authentication) or when first server data fetching is needed |
| React Context | When a truly global UI concern arises |
