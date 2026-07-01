# Error Handling Standards

Every page must support all of the following states. These are **mandatory**.

| State | When | Requirement |
|-------|------|-------------|
| **Loading** | Data is being fetched | Skeleton or spinner — never a blank screen |
| **Empty** | No data exists | Clear message with suggested action |
| **Error** | Request or operation failed | User-friendly message with retry option |
| **Success** | Operation completed | Confirmation feedback where appropriate |
| **Permission Denied** | User lacks access | Clear message; no data leakage |
| **Not Found** | Resource does not exist | 404-style message with navigation option |

## Implementation

- Use shared components from `src/components/` where applicable (LoadingSpinner, EmptyState, etc.).
- Handle states in feature components — not inline ad-hoc markup.
- Server Components should handle loading/error at the page level where possible.
- Client Components should handle interactive error/retry flows.

## Forms

- Display validation errors from `validation/` schemas.
- Display server errors separately from validation errors.
- Disable submit during in-flight requests.
