# Design System

UI foundation for TalentProof Sales CRM.

**Milestone**: 6 — Design System  
**Status**: Awaiting approval  
**Scope**: Documentation and reusable UI standards only — **no authentication, no business pages, no feature code**

**Foundation**: [shadcn/ui](https://ui.shadcn.com/) (New York style, Zinc base) + [Lucide](https://lucide.dev/) icons + Tailwind CSS

---

## Document Index

| Section | Content |
|---------|---------|
| [1. Principles](#1-principles) | Design values |
| [2. Typography](#2-typography) | Type scale and usage |
| [3. Color Palette](#3-color-palette) | Semantic colors and tokens |
| [4. Spacing](#4-spacing) | Spacing scale and layout rhythm |
| [5. Icon Usage](#5-icon-usage) | Lucide icon rules |
| [6. Buttons](#6-buttons) | Variants and usage |
| [7. Inputs](#7-inputs) | Form controls |
| [8. Tables](#8-tables) | Data tables |
| [9. Forms](#9-forms) | Form layout and validation display |
| [10. Dialogs](#10-dialogs) | Modals and confirmations |
| [11. Cards](#11-cards) | Content containers |
| [12. Badges](#12-badges) | Status indicators |
| [13. Empty States](#13-empty-states) | No-data patterns |
| [14. Loading States](#14-loading-states) | Skeleton and spinner |
| [15. Error States](#15-error-states) | Error, permission denied, not found |
| [16. Toasts](#16-toasts) | Transient feedback |
| [17. Dashboard Widgets](#17-dashboard-widgets) | Metric cards and summaries |
| [18. Page Layout](#18-page-layout) | Shell and page structure |
| [19. Responsive Breakpoints](#19-responsive-breakpoints) | Breakpoint behavior |
| [20. Component Mapping](#20-component-mapping) | shadcn/ui component reference |

---

## 1. Principles

| Principle | Application |
|-----------|-------------|
| Professional | Business-appropriate; no decorative UI |
| Minimal | Data and actions first; remove visual noise |
| Classic | Timeless patterns over trends |
| Fast | No unnecessary animations |
| Desktop first | Full-width tables and multi-column layouts default |
| Mobile optimized | Collapsible nav, stacked layouts on small screens |
| Accessible | WCAG-minded contrast, focus, labels, keyboard |
| Consistent | One design system — every module follows this document |

### What to Avoid

- Heavy gradients, glassmorphism, decorative backgrounds
- Fancy hover animations and transitions
- Custom components when shadcn/ui covers the need
- Inline styles that bypass design tokens
- Icon-only buttons without `aria-label`

---

## 2. Typography

### Font Stack

| Role | Font | Fallback |
|------|------|----------|
| UI / Body | `Inter` | `system-ui`, `sans-serif` |
| Monospace (codes, IDs) | `ui-monospace` | `SFMono-Regular`, `monospace` |

Inter is loaded via `next/font` when layout is implemented (M7+). Until then, system sans-serif is acceptable in development.

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400 | Captions, table metadata, badge text |
| `text-sm` | 14px | 20px | 400 | Body default, table cells, form labels |
| `text-base` | 16px | 24px | 400 | Primary body, dialog content |
| `text-lg` | 18px | 28px | 500 | Section headings, card titles |
| `text-xl` | 20px | 28px | 600 | Page subheadings |
| `text-2xl` | 24px | 32px | 600 | Page titles |
| `text-3xl` | 30px | 36px | 700 | Dashboard headline metrics (sparingly) |

### Usage Rules

| Element | Style |
|---------|-------|
| Page title | `text-2xl font-semibold tracking-tight` |
| Page description | `text-sm text-muted-foreground` |
| Section title | `text-lg font-medium` |
| Table header | `text-sm font-medium text-muted-foreground` |
| Form label | `text-sm font-medium` |
| Helper text | `text-xs text-muted-foreground` |
| Error text | `text-sm text-destructive` |

### Hierarchy

One `h1` per page. Use semantic heading levels (`h1`–`h4`) — do not skip levels for styling.

---

## 3. Color Palette

Built on **shadcn/ui Zinc** theme. All colors use HSL CSS variables in `src/app/globals.css`.

### Core Tokens

| Token | Purpose | Light Mode |
|-------|---------|------------|
| `--background` | Page background | White |
| `--foreground` | Primary text | Near black |
| `--card` | Card surface | White |
| `--card-foreground` | Card text | Near black |
| `--primary` | Primary actions | Dark zinc |
| `--primary-foreground` | Text on primary | White |
| `--secondary` | Secondary actions | Light gray |
| `--secondary-foreground` | Text on secondary | Dark |
| `--muted` | Muted backgrounds | Light gray |
| `--muted-foreground` | Secondary text | Medium gray |
| `--accent` | Hover highlights | Light gray |
| `--destructive` | Errors, delete | Red |
| `--border` | Borders, dividers | Light gray |
| `--input` | Input borders | Light gray |
| `--ring` | Focus ring | Dark zinc |

### Semantic Extension Tokens (documented — add to globals.css at implementation)

| Token | HSL (proposed) | Usage |
|-------|----------------|-------|
| `--success` | 142 76% 36% | Won leads, completed tasks |
| `--success-foreground` | 0 0% 100% | Text on success |
| `--warning` | 38 92% 50% | Overdue follow-ups, pending actions |
| `--warning-foreground` | 0 0% 0% | Text on warning |
| `--info` | 217 91% 60% | Informational badges, tips |
| `--info-foreground` | 0 0% 100% | Text on info |

### Domain Status Colors

| Domain Status | Badge Variant | Color |
|---------------|---------------|-------|
| Active / Pending | `secondary` | Muted |
| Won | `success` (custom) | Green |
| Lost | `destructive` | Red |
| Archived | `outline` | Border only |
| Overdue FollowUp | `warning` (custom) | Amber |
| Completed | `success` (custom) | Green |
| Trashed | `destructive` outline | Red muted |

### Contrast

- Body text on background: minimum 4.5:1
- Large text (18px+): minimum 3:1
- Never rely on color alone — pair with text or icon

---

## 4. Spacing

### Base Unit

**4px** — Tailwind default spacing scale.

### Scale Reference

| Token | Value | Common Use |
|-------|-------|------------|
| `1` | 4px | Tight icon gaps |
| `2` | 8px | Inline element gaps |
| `3` | 12px | Form field internal padding |
| `4` | 16px | Standard component padding |
| `6` | 24px | Section gaps |
| `8` | 32px | Page section separation |
| `12` | 48px | Major layout blocks |

### Layout Rhythm

| Context | Spacing |
|---------|---------|
| Between form fields | `space-y-4` (16px) |
| Page header to content | `mt-6` (24px) |
| Card internal padding | `p-6` (24px) |
| Table cell padding | `px-4 py-3` |
| Sidebar item padding | `px-3 py-2` |
| Page outer margin (desktop) | `p-6` to `p-8` |
| Grid gap (dashboard) | `gap-4` to `gap-6` |

### Max Widths

| Context | Max Width |
|---------|-----------|
| Form (single column) | `max-w-lg` (512px) |
| Form (two column) | `max-w-2xl` (672px) |
| Page content area | Fluid within shell |
| Dialog | `max-w-lg` default; `max-w-2xl` for complex forms |

---

## 5. Icon Usage

### Library

**Lucide React** exclusively (`lucide-react`). Configured in `components.json`.

### Size Scale

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 16px | `h-4 w-4` |
| Button icon | 16px | `h-4 w-4` |
| Navigation | 20px | `h-5 w-5` |
| Empty state | 48px | `h-12 w-12` |
| Dashboard widget | 20px | `h-5 w-5` |

### Rules

| Rule | Detail |
|------|--------|
| One library | Lucide only — no mixing icon sets |
| Decorative icons | `aria-hidden="true"` |
| Icon-only buttons | Require `aria-label` |
| Status icons | Pair with text label or `aria-label` |
| Color | `text-muted-foreground` default; semantic colors for status |

### Common Icons

| Action / Entity | Icon |
|-----------------|------|
| Lead | `Building2` or `Target` |
| Contact | `User` |
| Activity | `Activity` |
| FollowUp | `CalendarClock` |
| Demo | `Presentation` |
| Task | `CheckSquare` |
| Report | `BarChart3` |
| Notification | `Bell` |
| Settings | `Settings` |
| Trash | `Trash2` |
| Archive | `Archive` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Search | `Search` |
| Filter | `Filter` |
| Export | `Download` |
| Loading | `Loader2` (with `animate-spin`) |

---

## 6. Buttons

### shadcn Component

`Button` from `@/components/ui/button`

### Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary action (one per section) |
| `secondary` | Secondary actions |
| `outline` | Tertiary, cancel-adjacent actions |
| `ghost` | Toolbar, table row actions |
| `destructive` | Delete, permanent remove |
| `link` | Inline navigation-style actions |

### Sizes

| Size | Usage |
|------|-------|
| `default` | Standard forms and pages |
| `sm` | Table toolbars, compact areas |
| `lg` | Hero CTAs (rare in CRM) |
| `icon` | Icon-only actions |

### Rules

| Rule | Detail |
|------|--------|
| One primary per view | Single `default` button per action group |
| Label | Verb + noun: "Create Lead", "Export Report" |
| Loading | Disable button + `Loader2` spinner; keep label |
| Destructive | Confirm via Dialog before irreversible actions |
| Order | Destructive left or separated; primary right in dialogs |

---

## 7. Inputs

### shadcn Components

`Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Label`

### Standards

| Rule | Detail |
|------|--------|
| Labels | Every input has visible `<Label>` linked via `htmlFor` |
| Placeholder | Hint only — not a substitute for labels |
| Required | Asterisk on label + `aria-required` |
| Disabled | `disabled` attribute + visual muted state |
| Error | Red border (`border-destructive`) + error message below |
| Width | Full width in forms (`w-full`) |
| Height | Default shadcn height — do not customize per field |

### Input Types

| Data | Component |
|------|-----------|
| Short text | `Input` type="text" |
| Email | `Input` type="email" |
| Phone | `Input` type="tel" |
| Date/time | Date picker (shadcn `Calendar` + `Popover`) |
| Long text | `Textarea` |
| Enum selection | `Select` or `RadioGroup` |
| Boolean | `Checkbox` or `Switch` |
| Search | `Input` with leading `Search` icon |

---

## 8. Tables

### shadcn Component

`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

### DataTable Pattern (shared component — M7+)

Wrapper in `src/components/DataTable` composing shadcn Table with:

| Feature | Standard |
|---------|----------|
| Pagination | Required — never load all rows |
| Sorting | Column headers where applicable |
| Row actions | `ghost` icon buttons in last column |
| Selection | Checkbox column when bulk actions needed |
| Empty | Delegate to EmptyState component |
| Loading | Skeleton rows |
| Density | `text-sm`, `px-4 py-3` cells |
| Sticky header | On long scroll lists |
| Responsive | Horizontal scroll on mobile (`overflow-x-auto`) |

### Column Guidelines

| Column Type | Alignment | Format |
|-------------|-----------|--------|
| Text | Left | Truncate with tooltip if long |
| Number | Right | Locale-formatted |
| Date | Left | Relative + absolute tooltip |
| Status | Left | Badge component |
| Actions | Right | Icon button group |

---

## 9. Forms

### Layout

| Form Type | Layout |
|-----------|--------|
| Simple CRUD | Single column, `max-w-lg` |
| Complex entity | Two columns on `lg+`, single on mobile |
| Inline filter | Horizontal row, wraps on mobile |
| Dialog form | Single column inside dialog |

### Structure

```
Form
├── FormHeader (title + description)
├── FormFields (space-y-4)
│   ├── FormField (Label + Input + error)
│   └── ...
└── FormActions (flex justify-end gap-2)
    ├── Cancel (outline)
    └── Submit (default)
```

### Validation Display

| State | UI |
|-------|-----|
| Field error | Red border + `text-sm text-destructive` below field |
| Form error | Alert at top of form |
| Submitting | Disable all fields + loading button |
| Success | Toast + redirect or inline confirmation |

### shadcn

Use `Form` component with react-hook-form when Client Components are needed (M7+).

---

## 10. Dialogs

### shadcn Components

`Dialog`, `AlertDialog`

### When to Use

| Component | Use Case |
|-----------|----------|
| `Dialog` | Create/edit forms, detail previews |
| `AlertDialog` | Destructive confirmations, irreversible actions |

### Standards

| Rule | Detail |
|------|--------|
| Title | Clear action: "Delete Lead" |
| Description | Explain consequences |
| Actions | Cancel (outline) + Confirm (default or destructive) |
| Focus trap | Default shadcn behavior |
| Close | X button + Escape + Cancel |
| Width | `sm:max-w-lg` default |

### ConfirmDialog Pattern (shared — M7+)

`src/components/ConfirmDialog` — wraps `AlertDialog` with consistent copy and button order.

---

## 11. Cards

### shadcn Components

`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Usage

| Context | Structure |
|---------|-----------|
| Dashboard widget | Header (title + icon) + Content (metric) + optional Footer (trend) |
| Detail panel | Header (entity name) + Content (fields) |
| Filter panel | Content only, compact padding `p-4` |
| List item | Horizontal card on mobile instead of table row |

### Standards

| Rule | Detail |
|------|--------|
| Border | Default card border — no custom shadows |
| Padding | `p-6` content areas |
| Elevation | No drop shadows — border only (minimal) |
| Clickable cards | Entire card clickable only with clear affordance |

---

## 12. Badges

### shadcn Component

`Badge`

### Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary status |
| `secondary` | Neutral status |
| `outline` | Archived, inactive |
| `destructive` | Lost, error, trashed |

### Custom Variants (add at implementation)

| Variant | Usage |
|---------|-------|
| `success` | Won, completed |
| `warning` | Overdue, pending attention |

### Domain Mapping

| Entity Status | Badge |
|---------------|-------|
| Lead: active | `secondary` "Active" |
| Lead: won | `success` "Won" |
| Lead: lost | `destructive` "Lost" |
| Lead: archived | `outline` "Archived" |
| FollowUp: pending | `secondary` "Pending" |
| FollowUp: overdue | `warning` "Overdue" |
| FollowUp: completed | `success` "Completed" |
| Task: in_progress | `default` "In Progress" |
| Demo: scheduled | `secondary` "Scheduled" |

---

## 13. Empty States

### Pattern (shared `EmptyState` — M7+)

```
┌─────────────────────────────────┐
│          [Icon 48px]            │
│       No leads yet              │
│   Create your first lead to     │
│   start building your pipeline. │
│       [ Primary Action ]        │
└─────────────────────────────────┘
```

### Standards

| Rule | Detail |
|------|--------|
| Icon | Lucide, `h-12 w-12 text-muted-foreground` |
| Title | `text-lg font-medium` |
| Description | `text-sm text-muted-foreground`, max 2 lines |
| Action | Primary button when user can act |
| Centered | `flex flex-col items-center justify-center py-12` |

### Copy Guidelines

- State what is empty: "No contacts yet"
- Suggest action: "Add a contact to this lead"
- Never blame the user

---

## 14. Loading States

### Patterns

| Context | Pattern |
|---------|---------|
| Full page | Centered `Loader2` spinner + "Loading..." |
| Table | 5 skeleton rows (`Skeleton` component) |
| Card / widget | Skeleton matching content shape |
| Button action | Spinner inside button, disabled |
| Inline refresh | Small spinner replacing icon |

### shadcn Component

`Skeleton` for content placeholders; `Loader2` icon with `animate-spin` for spinners.

### Rules

| Rule | Detail |
|------|--------|
| No blank screens | Always show skeleton or spinner |
| Preserve layout | Skeleton matches final content dimensions |
| Minimum duration | Avoid flash — 200ms minimum display (optional) |
| No blocking overlay | Unless full-page initial load |

### LoadingSpinner Pattern (shared — M7+)

`src/components/LoadingSpinner` — sized variants `sm`, `md`, `lg`.

---

## 15. Error States

### Mandatory States (per error-handling standards)

| State | Pattern |
|-------|---------|
| **Error** | Alert (destructive) + message + Retry button |
| **Permission Denied** | Centered icon `ShieldX` + "Access denied" + back link |
| **Not Found** | Centered icon `FileQuestion` + "Not found" + back link |
| **Success** | Toast (green/success) or inline Alert |
| **Empty** | EmptyState (see §13) |
| **Loading** | Loading state (see §14) |

### Error Alert

```text
[AlertCircle icon] Something went wrong
{description}
[Retry button]
```

### shadcn

`Alert`, `AlertTitle`, `AlertDescription` with `variant` destructive for errors.

### Copy

- User-friendly — no stack traces or error codes in UI
- Actionable — offer Retry or support path
- Log technical details server-side only

---

## 16. Toasts

### shadcn Component

`Sonner` (toast library integrated with shadcn)

### Variants

| Type | Usage |
|------|-------|
| Success | "Lead created", "FollowUp completed" |
| Error | "Failed to save changes" |
| Info | "Export started" |
| Warning | "Session expiring soon" |

### Rules

| Rule | Detail |
|------|--------|
| Duration | 4s default; 8s for errors |
| Position | Bottom-right (desktop), top (mobile) |
| Action | Optional undo/retry link |
| Limit | One toast at a time for same action |
| No toast for | Page-level errors (use Alert instead) |

---

## 17. Dashboard Widgets

Dashboard is the **primary reporting interface** (OD-06). Widgets are layout compositions — not domain entities.

### Widget Types

| Type | Content | Layout |
|------|---------|--------|
| Metric card | Single number + label + trend | `Card` 1/4 width on desktop |
| List widget | Top N items (overdue follow-ups) | `Card` half width |
| Chart widget | Bar/line chart (pipeline) | `Card` half or full width |
| Activity feed | Recent activities | `Card` full width |

### Metric Card Anatomy

```
┌─────────────────────────┐
│ [icon]  Label      ↑ 12%│
│                         │
│  42                     │
│  vs. 38 last period     │
└─────────────────────────┘
```

### Standards

| Rule | Detail |
|------|--------|
| Grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Number | `text-3xl font-bold` |
| Label | `text-sm text-muted-foreground` |
| Trend | Green up / red down with `text-success` / `text-destructive` |
| Loading | Skeleton card matching dimensions |
| Empty | "No data for this period" in card body |
| Role-based | CEO sees org-wide; BDE sees own metrics |

### Chart Colors

Use `--chart-1` through `--chart-5` from globals.css. Maximum 5 series per chart.

---

## 18. Page Layout

### Application Shell (M7+)

```
┌──────────────────────────────────────────────────┐
│ TopBar (logo, search, notifications, user menu)   │
├──────────┬───────────────────────────────────────┤
│          │  PageHeader (title, description,      │
│ Sidebar  │               actions)                 │
│ (nav)    │  ─────────────────────────────────     │
│          │  Filters / toolbar (optional)          │
│          │  ─────────────────────────────────     │
│          │  Main content                          │
│          │                                        │
│          │  Pagination (if list)                  │
└──────────┴───────────────────────────────────────┘
```

### Components (shared — M7+)

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppShell` | `src/components/layout/` | Sidebar + main area |
| `Sidebar` | `src/components/layout/` | Navigation links |
| `TopBar` | `src/components/layout/` | Global actions |
| `PageHeader` | `src/components/` | Title + description + actions |

### PageHeader Pattern

```
[Title text-2xl]                    [Action buttons]
[Description text-sm muted]
```

### Content Area

| Rule | Detail |
|------|--------|
| Padding | `p-6` desktop, `p-4` mobile |
| Background | `bg-background` |
| Max width | Fluid — tables use full width |
| Scroll | Main content scrolls; sidebar fixed |

### Navigation

- Group by module: Dashboard, Leads, Contacts, Activities, etc.
- Active state: `bg-accent text-accent-foreground`
- Role-based items hidden when no permission

---

## 19. Responsive Breakpoints

Tailwind default breakpoints — **do not customize** unless ADR approved.

| Breakpoint | Min Width | Layout Behavior |
|------------|-----------|-----------------|
| default | 0px | Mobile: single column, hamburger nav |
| `sm` | 640px | Slightly wider padding |
| `md` | 768px | Two-column forms possible |
| `lg` | 1024px | Sidebar visible; dashboard 4-column grid |
| `xl` | 1280px | Full desktop layout |
| `2xl` | 1536px | Wider content padding |

### Mobile Rules

| Element | Mobile Behavior |
|---------|-----------------|
| Sidebar | Hidden — `Sheet` drawer from hamburger |
| Tables | Horizontal scroll wrapper |
| Dashboard grid | 1 column |
| Dialogs | Full width with margin |
| Form actions | Full-width stacked buttons |
| Page title | `text-xl` (slightly smaller) |

### Desktop Rules

| Element | Desktop Behavior |
|---------|------------------|
| Sidebar | Fixed 240px width |
| Tables | Full width with all columns |
| Dashboard | 4-column metric grid |
| Forms | Two columns for related fields |
| Dialogs | Centered, max-width constrained |

---

## 20. Component Mapping

### shadcn/ui Components to Install (per feature need)

Install via `npx shadcn@latest add <component>` when implementing M7+.

| Design System Element | shadcn Component | Priority |
|----------------------|------------------|----------|
| Button | `button` | M7 |
| Input | `input`, `label`, `textarea` | M7 |
| Select | `select` | M7 |
| Table | `table` | M8+ |
| Form | `form` | M7 |
| Dialog | `dialog`, `alert-dialog` | M7 |
| Card | `card` | M8 |
| Badge | `badge` | M8 |
| Skeleton | `skeleton` | M7 |
| Alert | `alert` | M7 |
| Toast | `sonner` | M7 |
| Checkbox | `checkbox` | M7 |
| Switch | `switch` | M17 |
| Dropdown | `dropdown-menu` | M7 |
| Sheet | `sheet` | M7 (mobile nav) |
| Separator | `separator` | M7 |
| Tabs | `tabs` | M8+ |
| Calendar | `calendar` | M11+ |
| Popover | `popover` | M11+ |
| Avatar | `avatar` | M7 |

### Shared Wrappers (implement per standards when needed)

| Wrapper | Location | Milestone |
|---------|----------|-----------|
| `PageHeader` | `src/components/PageHeader` | M7 |
| `EmptyState` | `src/components/EmptyState` | M7 |
| `LoadingSpinner` | `src/components/LoadingSpinner` | M7 |
| `ConfirmDialog` | `src/components/ConfirmDialog` | M7 |
| `DataTable` | `src/components/DataTable` | M8 |
| `SearchBox` | `src/components/SearchBox` | M8 |
| `AppShell` | `src/components/layout/AppShell` | M7 |

---

## Approval Checklist

- [ ] Typography scale approved
- [ ] Color palette and semantic tokens approved
- [ ] Component standards align with shadcn/ui
- [ ] Page states (empty, loading, error) defined
- [ ] Dashboard widget patterns approved
- [ ] Page layout and breakpoints approved
- [ ] Ready for Milestone 7 (Authentication)
