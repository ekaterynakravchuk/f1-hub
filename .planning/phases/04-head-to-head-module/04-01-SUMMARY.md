---
phase: 04-head-to-head-module
plan: 01
subsystem: api
tags: [react-query, jolpica, typescript, hooks, pagination, statistics]

# Dependency graph
requires:
  - phase: 02-data-layer-foundation
    provides: jolpikaFetch client, JolpikaRace/JolpikaDriverStanding types, endpoint pattern, query key factory

provides:
  - fetchCareerResults, fetchCareerQualifying, fetchDriverSeasons, fetchDriverSeasonStanding endpoint functions with pagination
  - careerResults, careerQualifying, driverSeasons, driverSeasonStanding query key generators
  - useCareerResults, useCareerQualifying, useDriverSeasons, useCareerStandings React Query hooks
  - computeStats pure function deriving 13 career stat fields from raw Jolpica data
  - computeTeammateH2H pure function computing qualifying H2H across shared team seasons

affects:
  - 04-02 (H2H comparison card UI consumes hooks and computeStats)
  - 04-03 (career charts consume pointsPerSeason from computeStats)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useQueries with combine option for parallel per-season data fetching
    - skipToken guard on career hooks (single driverId parameter instead of two)
    - Paginated career fetch using parseResultsResponse on first page then raw fetch for subsequent pages
    - isDNF utility: "Finished" and "+N Laps" are finishes, everything else is a DNF

key-files:
  created:
    - src/hooks/useCareerResults.ts
    - src/hooks/useCareerQualifying.ts
    - src/hooks/useDriverSeasons.ts
    - src/hooks/useCareerStandings.ts
    - src/lib/utils/computeStats.ts
    - src/lib/utils/computeTeammateH2H.ts
  modified:
    - src/lib/api/jolpica/endpoints.ts
    - src/lib/api/jolpica/query-keys.ts

key-decisions:
  - "useCareerStandings uses useQueries + combine pattern for parallel per-season fetching — avoids sequential waterfall when driver has many seasons"
  - "fetchCareerResults uses parseResultsResponse on first page only (Zod validation), raw MRData access on subsequent pages — consistent with existing paginated fetchAllDrivers pattern"
  - "isDNF classifies 'Finished' and '+N Laps' as finishes — all other statuses (Retired, Accident, DNF, etc.) are DNFs"
  - "Grid position 0 excluded from avgGridPosition — pit lane starts are not representative grid positions"
  - "officialCareerPoints derived from standings.points (per-season totals) rather than summing race points — standings are authoritative per Jolpica"

patterns-established:
  - "Career hooks follow skipToken pattern with single driverId param: driverId ? () => fetchFn(driverId) : skipToken"
  - "useCareerStandings: useDriverSeasons provides season list, useQueries fetches per-season in parallel, combine merges results"
  - "Pure stat utilities: no React imports, accepts raw JolpikaRace[] + JolpikaDriverStanding[] arrays, returns typed interface"

# Metrics
duration: 15min
completed: 2026-02-19
---

# Phase 4 Plan 01: Career Data Infrastructure Summary

**Paginated career endpoint functions, React Query hooks with useQueries parallel fetching, and pure stat computation utilities (computeStats + computeTeammateH2H) forming the complete data pipeline for the Head-to-Head module.**

## Performance

- **Duration:** ~15 min (896s)
- **Started:** 2026-02-19T17:46:07Z
- **Completed:** 2026-02-19T18:01:07Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added 4 career endpoint functions to endpoints.ts with full pagination (Hamilton has 380 races = 4 pages handled automatically)
- Created 4 React Query hooks including useCareerStandings using useQueries + combine for parallel per-season championship standing fetches
- Implemented computeStats deriving 13 stat fields (wins, podiums, poles, titles, races, DNFs, dnfRate, careerPoints, officialCareerPoints, avgFinish/Grid, pointsPerRace, pointsPerSeason) from raw career data
- Implemented computeTeammateH2H identifying shared team seasons via constructorId matching and computing qualifying H2H record

## Task Commits

Each task was committed atomically:

1. **Task 1: Add career endpoint functions and query keys** - `b3c71e8` (feat)
2. **Task 2: Create stat computation utilities** - `aa80e6e` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/lib/api/jolpica/endpoints.ts` - Added fetchCareerResults, fetchCareerQualifying, fetchDriverSeasons, fetchDriverSeasonStanding
- `src/lib/api/jolpica/query-keys.ts` - Added careerResults, careerQualifying, driverSeasons, driverSeasonStanding keys
- `src/hooks/useCareerResults.ts` - Created: useCareerResults hook with skipToken/staleTime: Infinity
- `src/hooks/useCareerQualifying.ts` - Created: useCareerQualifying hook with skipToken/staleTime: Infinity
- `src/hooks/useDriverSeasons.ts` - Created: useDriverSeasons hook fetching all seasons for a driver
- `src/hooks/useCareerStandings.ts` - Created: useCareerStandings using useQueries + combine for parallel season standing fetches
- `src/lib/utils/computeStats.ts` - Created: DriverStats interface and computeStats pure function
- `src/lib/utils/computeTeammateH2H.ts` - Created: TeammateH2HSummary interface and computeTeammateH2H pure function

## Decisions Made

- useCareerStandings uses useQueries + combine pattern for parallel per-season fetching — avoids sequential waterfall when driver has many seasons (e.g., Hamilton at 19 seasons)
- fetchCareerResults uses parseResultsResponse on first page only (Zod validation), raw MRData access on subsequent pages — consistent with existing paginated fetchAllDrivers pattern
- isDNF classifies "Finished" and "+N Laps" as finishes — all other statuses are DNFs (handles edge cases like "Disqualified", "Accident", "Retired", etc.)
- Grid position 0 excluded from avgGridPosition — pit lane starts are not representative grid positions
- officialCareerPoints derived from standings.points (per-season totals) rather than summing race points — standings are authoritative

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Career data pipeline complete and TypeScript-verified
- useCareerResults + useCareerQualifying + useCareerStandings + computeStats ready for consumption by comparison card component (plan 04-02)
- computeTeammateH2H ready for teammate qualifying comparison UI
- All hooks follow skipToken pattern — safe to call with undefined driverId during initial render

---
*Phase: 04-head-to-head-module*
*Completed: 2026-02-19*

## Self-Check: PASSED

- FOUND: src/hooks/useCareerResults.ts
- FOUND: src/hooks/useCareerQualifying.ts
- FOUND: src/hooks/useDriverSeasons.ts
- FOUND: src/hooks/useCareerStandings.ts
- FOUND: src/lib/utils/computeStats.ts
- FOUND: src/lib/utils/computeTeammateH2H.ts
- FOUND: .planning/phases/04-head-to-head-module/04-01-SUMMARY.md
- FOUND commit: b3c71e8 (Task 1)
- FOUND commit: aa80e6e (Task 2)
