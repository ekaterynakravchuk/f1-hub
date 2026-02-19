---
phase: 02-data-layer-foundation
plan: 02
subsystem: api
tags: [react-query, jolpica, hooks, skiptoken, pagination, typescript]

# Dependency graph
requires:
  - phase: 02-01-data-layer-foundation
    provides: jolpikaFetch, jolpikaKeys, Jolpica types/schemas, QueryProvider with retry config
provides:
  - fetchAllDrivers: paginates all ~874 drivers eagerly (PAGE_SIZE=100)
  - fetchDriverResults: fetches race results with Zod validation
  - fetchQualifying: fetches qualifying results (no Zod, per RESEARCH.md)
  - fetchStandings: fetches driver standings with Zod validation
  - fetchSeasons: fetches all seasons with future-proof pagination
  - fetchRaces: fetches races for a given season
  - useDrivers hook with gcTime: Infinity (reference data, never GC)
  - useDriverResults hook with skipToken when driverId or season undefined
  - useQualifying hook with skipToken when driverId or season undefined
  - useStandings hook with skipToken when season undefined
  - useSeasons hook with staleTime: Infinity
  - useRaces hook with skipToken when season undefined
affects:
  - 03-driver-explorer (consumes useDrivers, useDriverResults, useQualifying, useSeasons, useRaces)
  - 04-head-to-head (consumes useDriverResults, useQualifying, useStandings)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - skipToken pattern for conditionally disabled queries (undefined params = no fetch)
    - driversQueryOptions exported alongside hook for potential server-side prefetching
    - Pagination loop pattern for eager-loading paginated reference data
    - gcTime: Infinity on useDrivers to prevent GC of large reference dataset

key-files:
  created:
    - src/lib/api/jolpica/endpoints.ts
    - src/hooks/useDrivers.ts
    - src/hooks/useDriverResults.ts
    - src/hooks/useQualifying.ts
    - src/hooks/useStandings.ts
    - src/hooks/useSeasons.ts
    - src/hooks/useRaces.ts
  modified: []

key-decisions:
  - "gcTime: Infinity on useDrivers: all ~874 drivers are reference data needed across modules, must not be GC'd between page navigations"
  - "skipToken over enabled: false: skipToken is React Query v5 recommended pattern, provides better type narrowing"
  - "fetchQualifying has no Zod validation: qualifying is not a critical endpoint per RESEARCH.md, shape is simple"
  - "fetchSeasons future-proofs with pagination: only 75 seasons but pagination guard added for >100 case"

patterns-established:
  - "Pattern: Hooks with optional params use skipToken — never call API with empty string params"
  - "Pattern: All endpoint functions in one file (endpoints.ts) — hooks are thin wrappers, logic lives in fetch functions"
  - "Pattern: Export queryOptions alongside hook for prefetching capability (driversQueryOptions, seasonsQueryOptions)"

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 2 Plan 2: React Query Hooks for Jolpica F1 Data Summary

**Six React Query hooks (useDrivers, useDriverResults, useQualifying, useStandings, useSeasons, useRaces) wired to 6 endpoint fetch functions with rate-limiting, Zod validation, skipToken disabled-query pattern, and eager pagination for all ~874 F1 drivers.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-19T10:22:16Z
- **Completed:** 2026-02-19T10:27:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Complete public data API for downstream modules: all 6 hooks importable, TypeScript-correct, zero TS errors
- fetchAllDrivers eagerly paginates all ~874 drivers in a sequential loop (PAGE_SIZE=100), validated with Zod on first page, assembled into flat array
- skipToken pattern prevents empty API calls when required params are undefined — correct React Query v5 approach for conditional queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Endpoint functions and hooks for drivers, seasons, and races** - `8baa626` (feat)
2. **Task 2: Hooks for driver results, qualifying, and standings** - `414a2e0` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/lib/api/jolpica/endpoints.ts` - 6 fetch functions routing through jolpikaFetch; fetchAllDrivers paginates, fetchDriverResults/fetchStandings use Zod validation
- `src/hooks/useDrivers.ts` - useDrivers with gcTime: Infinity and exported driversQueryOptions; fetches all ~874 drivers once per session
- `src/hooks/useSeasons.ts` - useSeasons with staleTime: Infinity and exported seasonsQueryOptions
- `src/hooks/useRaces.ts` - useRaces accepts optional season, skipToken when undefined
- `src/hooks/useDriverResults.ts` - useDriverResults accepts optional driverId + season, skipToken when either undefined
- `src/hooks/useQualifying.ts` - useQualifying accepts optional driverId + season, skipToken when either undefined
- `src/hooks/useStandings.ts` - useStandings accepts optional season, skipToken when undefined

## Decisions Made

- `gcTime: Infinity` on `useDrivers`: all ~874 drivers are reference data used across multiple modules. Without this, React Query would GC the cache between navigations and re-fetch ~9 API calls.
- `skipToken` over `enabled: false`: React Query v5 recommended pattern — provides better TypeScript type narrowing (data is `T | undefined` only when disabled, not always)
- No Zod on `fetchQualifying`: consistent with RESEARCH.md decision — qualifying endpoint has simpler shape and is not in the critical path
- Future-proof pagination in `fetchSeasons`: only 75 seasons today but added guard for `total > 100` case to avoid a silent bug in ~25 years

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. All Jolpica APIs are public free-tier with no authentication.

## Next Phase Readiness

- All 6 hooks are importable and ready for consumption by Phase 3 (Driver Explorer) and Phase 4 (Head-to-Head)
- useDrivers eagerly loads all drivers — downstream components can filter/search without additional API calls
- useDriverResults and useQualifying both accept undefined params safely via skipToken
- No blockers

---
*Phase: 02-data-layer-foundation*
*Completed: 2026-02-19*

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (8baa626, 414a2e0) confirmed in git log.
