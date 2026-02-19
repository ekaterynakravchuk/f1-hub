# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-16)

**Core value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.
**Current focus:** Phase 4 - Head-to-Head Module (COMPLETE)

## Current Position

Phase: 4 of 4 (Head-to-Head Module) - COMPLETE
Plan: 3 of 3 complete
Status: All plans complete — project execution finished
Last activity: 2026-02-19 — Completed plan 04-03 (three chart components, full H2H module complete)

Progress: [████████████████████████████████████████████████████████████] 100% (9/9 plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 9.94 minutes
- Total execution time: 1.49 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 7.8m | 3.9m |
| 02 | 2 | 8.2m | 4.1m |
| 03 | 2 | 4.0m | 2.0m |
| 04 | 3 | 88m | 29.3m |

**Recent Completions:**

| Plan | Duration | Tasks | Files | Date |
|------|----------|-------|-------|------|
| 01-01 | 4.65m (279s) | 2 | 13 | 2026-02-16 |
| 01-02 | 3.15m | 2 | 8 | 2026-02-16 |
| 02-01 | 3.0m (177s) | 2 | 8 | 2026-02-19 |
| 02-02 | 5.2m | 2 | 7 | 2026-02-19 |
| 03-01 | 2.2m (130s) | 2 | 13 | 2026-02-19 |
| 03-02 | 1.8m (110s) | 2 | 3 | 2026-02-19 |
| 04-01 | 15m (896s) | 2 | 8 | 2026-02-19 |
| 04-02 | 26m (1542s) | 2 | 7 | 2026-02-19 |
| 04-03 | 47m (2875s) | 2 | 4 | 2026-02-19 |

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
- gcTime: Infinity on useDrivers (02-02): all ~874 drivers are reference data needed across modules, must not be GC'd between navigations
- skipToken over enabled: false (02-02): React Query v5 recommended pattern, provides better TypeScript type narrowing for conditional queries
- fetchQualifying has no Zod validation (02-02): qualifying is not a critical endpoint per RESEARCH.md, shape is simple
- fetchSeasons future-proofs with pagination guard (02-02): only 75 seasons today but >100 case handled to avoid silent future bug
- [Phase 03]: Team colors applied via inline style not Tailwind dynamic classes — Tailwind v4 purges arbitrary dynamic values at build time
- [Phase 03]: formatMillis wraps formatLapTime to handle Jolpica Time.millis string field (string before parsing)
- [Phase 03]: teamMap prop for optional team display in DriverSelect rows — avoids additional API calls inside component, consumers inject context
- [Phase 03]: RaceSelect renders disabled Select (not skeleton) when no season — clearer UX than empty state
- [Phase 04-01]: useCareerStandings uses useQueries + combine for parallel per-season fetching — avoids waterfall when driver has many seasons
- [Phase 04-01]: isDNF classifies "Finished" and "+N Laps" as finishes — all other statuses are DNFs
- [Phase 04-01]: Grid position 0 excluded from avgGridPosition — pit lane starts not representative
- [Phase 04-01]: officialCareerPoints from standings.points totals, careerPoints from summed race points — both available for different use cases
- [Phase 04-02]: router.replace used for URL sync — selecting drivers must not pollute browser history
- [Phase 04-02]: dataPending gates entire stats to null, showing skeleton rows — avoids flash of zero-value stats before data loads
- [Phase 04-02]: standingsPending prop to DriverCompareCard — per-cell Skeleton for standings-dependent stats only
- [Phase 04-02]: officialCareerPoints > 0 fallback to careerPoints — standings may not load before user sees card
- [Phase 04-03]: Same-team drivers get contrasting color (sky-400 #38bdf8 for Driver 2) — avoids identical lines/bars being indistinguishable
- [Phase 04-03]: Chart heights kept compact (line 200px, scatter 220px, bar 180px) — reduces page scroll, all data still readable
- [Phase 04-03]: CareerScatterChart uses native Recharts Tooltip not ChartTooltipContent — ScatterChart payload shape differs from Line/Bar, custom tooltip simpler
- [Phase 04-03]: comparisonReady gate on charts — prevents empty chart flash before data loads (same pattern as comparison card)

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-19 (plan execution)
Stopped at: Completed 04-03-PLAN.md - Three chart components (line, scatter, bar) completing full Head-to-Head module
Resume file: None
