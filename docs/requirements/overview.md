# Requirements Overview

## Project Name

**TalentProof Sales CRM**

## Purpose

Build a production-quality internal Sales CRM for TalentProof to manage Leads, Contacts, Activities, FollowUps, Demos, Tasks, Reports, and Notifications for the sales and business development team.

## Quality Bar

| Attribute | Requirement |
|-----------|-------------|
| Quality | Production quality |
| Maintainability | Designed for 5+ years |
| Priority | Readability, scalability, maintainability, performance |
| Not a priority | Speed of development |

## Expected Users

| Role | Description |
|------|-------------|
| CEO | Executive oversight; receives automated daily Report email |
| Admin | System administration; trash management for deleted records |
| Manager | Team oversight and pipeline management |
| Business Development Executive | Creates and manages own Leads |
| Marketing Executive | Marketing-related Lead and Activity management |
| Recruiter | Recruitment-related Lead and Activity management |

## Technology Stack

### Frontend

- Next.js 15 (App Router)
- JavaScript
- Tailwind CSS
- shadcn/ui

### Backend

- Supabase
- PostgreSQL

### Authentication

- Supabase Email & Password

## Architecture Principles

- Clean Architecture
- Feature-Based Architecture
- Modular Design
- Reusable Components
- Performance First
- One module at a time — independently implementable

## UI Style

- Professional
- Minimal
- Fast
- Desktop first, mobile optimized
- Accessibility friendly
- Data-focused
- No unnecessary animations

## Core Modules

1. Authentication
2. User Management
3. Dashboard
4. Lead Management
5. Contact Management
6. Activity Management
7. FollowUp Management
8. Demo Management
9. Task Management
10. Reports
11. Notifications
12. Settings

## Standards

All naming, coding, UI, performance, and security standards are defined in [`docs/standards/`](../standards/project-standards.md).

## Out of Scope (Milestone 1)

- Application code
- Package installation
- Next.js initialization
- Database schema implementation
- UI implementation
