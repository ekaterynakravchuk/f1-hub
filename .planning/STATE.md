# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.
**Current focus:** Phase 2 - Data Layer Foundation

## Current Position

Phase: 2 of 4 (Data Layer Foundation)
Plan: 1 of 2 in current phase
Status: Executing
Last activity: 2026-02-19 — Completed plan 02-01 (API clients, types, schemas, query keys)

Progress: [██████████████████████████████] 75% (3/4 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 3.77 minutes
- Total execution time: 0.19 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 7.8m | 3.9m |
| 02 | 1 | 3.0m | 3.0m |

**Recent Completions:**

| Plan | Duration | Tasks | Files | Date |
|------|----------|-------|-------|------|
| 01-01 | 4.65m (279s) | 2 | 13 | 2026-02-16 |
| 01-02 | 3.15m | 2 | 8 | 2026-02-16 |
| 02-01 | 3.0m (177s) | 2 | 8 | 2026-02-19 |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- React Query only (no localStorage/server cache): Simplicity for pet project, historical data is immutable so in-memory cache with staleTime: Infinity is sufficient
- Client-side data fetching only: No backend needed, APIs are public and free, reduces infrastructure complexity
- Dark minimalist design (not F1 branded): Portfolio piece needs clean and professional look, team colors for data viz only
- shadcn/ui over other component libraries: Copy-paste components, full control, works well with Tailwind, good dark theme support
- Next.js 16 instead of 15 (01-01): create-next-app@latest installed v16, provides better performance and features
- src/ directory structure (01-01): create-next-app default, provides separation of app code from config
- Tailwind CSS v4 (01-01): Latest version with CSS-first configuration
- oklch color space (01-01): shadcn/ui v3.8.5 default, perceptually uniform colors for dark mode
- staleTime: Infinity for React Query (01-01): Historical F1 data is immutable, no need for refetching
- Hand-rolled TokenBucketQueue over p-queue (02-01): p-queue is pure ESM/Node.js, uncertain browser compat; 30 lines of TS simpler and fully controlled
- Soft-fail Zod safeParse pattern (02-01): never throw on API schema drift, log warning in dev, return raw data as-is in production
- CURRENT_SEASON_STALE_TIME = 5 min (02-01): balances freshness vs API load for current-season data
- Zod validates only 3 critical endpoints (02-01): Drivers, Results, Standings — skip simpler Season/Race shapes
- retry: 2 global in QueryProvider (02-01): consistent silent retry behavior across all hooks with exponential backoff
- OpenF1 client created now as base infrastructure (02-01): hooks deferred to later phases per ROADMAP

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-19 (plan execution)
Stopped at: Completed 02-01-PLAN.md - API clients, types, Zod schemas, query keys
Resume file: None
