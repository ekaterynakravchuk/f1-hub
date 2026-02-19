---
phase: 02-data-layer-foundation
plan: 01
subsystem: api
tags: [jolpica, openf1, react-query, zod, rate-limiting, typescript, token-bucket]

# Dependency graph
requires:
  - phase: 01-project-setup-infrastructure
    provides: QueryProvider, Next.js app, TypeScript config, src/ structure
provides:
  - TokenBucketQueue class (pure TS rate limiter, browser-safe)
  - jolpikaFetch: rate-limited Jolpica fetch wrapper (4 req/s)
  - openf1Fetch: rate-limited OpenF1 fetch wrapper (3 req/s)
  - All Jolpica TypeScript types (13 interfaces/types)
  - All OpenF1 TypeScript types (6 interfaces)
  - CURRENT_SEASON_STALE_TIME constant (5 min)
  - jolpikaKeys query key factory (6 generators)
  - Zod schemas for 3 critical endpoints (soft-fail safeParse)
  - QueryProvider with retry: 2 and exponential backoff
affects:
  - 02-02-data-hooks (direct dependency on all exports)
  - 03-driver-explorer (uses jolpikaFetch, types, hooks)
  - 04-head-to-head (uses results types, schemas)

# Tech tracking
tech-stack:
  added: [zod@4.3.6]
  patterns:
    - Token bucket rate limiter (hand-rolled, no npm deps)
    - Soft-fail Zod safeParse with dev-only warnings
    - Query key factory pattern for hierarchical cache keys
    - Exponential backoff: Math.min(1000 * 2 ** attempt, 30_000)

key-files:
  created:
    - src/lib/api/rate-limiter.ts
    - src/lib/api/jolpica/client.ts
    - src/lib/api/jolpica/types.ts
    - src/lib/api/jolpica/schemas.ts
    - src/lib/api/jolpica/query-keys.ts
    - src/lib/api/openf1/client.ts
    - src/lib/api/openf1/types.ts
  modified:
    - src/components/providers/query-provider.tsx

key-decisions:
  - "Hand-rolled TokenBucketQueue over p-queue: pure TS, no ESM/browser compat issues, 30 lines"
  - "Soft-fail Zod safeParse: API schema drift logs dev warning, never throws in production"
  - "CURRENT_SEASON_STALE_TIME = 5 min: balance freshness vs API load for current-season data"
  - "Zod validates only 3 critical endpoints (Drivers, Results, Standings): skip simpler Season/Race shapes"
  - "retry: 2 in QueryProvider (3 total attempts): silent exponential backoff per locked user decision"
  - "OpenF1 client created now as base infrastructure; hooks deferred to later phases"

patterns-established:
  - "Pattern: All API fetches must route through rate-limited client (jolpikaFetch or openf1Fetch)"
  - "Pattern: Query keys always use jolpikaKeys factory — never inline strings"
  - "Pattern: Zod safeParse for soft-fail validation — import parseXxx functions, not schemas directly"
  - "Pattern: staleTime: Infinity for historical data; CURRENT_SEASON_STALE_TIME for current season"

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 2 Plan 1: API Clients, Types, Schemas, and Query Keys Summary

**Token-bucket rate-limited fetch wrappers for Jolpica (4 req/s) and OpenF1 (3 req/s), complete TypeScript types for both APIs, Zod v4 soft-fail schemas for 3 critical endpoints, query key factory, and QueryProvider updated with retry/exponential backoff.**

## Performance

- **Duration:** ~3 min (177s)
- **Started:** 2026-02-19T10:16:37Z
- **Completed:** 2026-02-19T10:19:34Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Complete API infrastructure layer established: all 8 files in place, TypeScript compiles cleanly, `npm run build` passes
- Rate limiter class uses token bucket pattern: starts full, refills 1 token per interval, queues excess requests transparently to callers
- Zod v4 soft-fail validation on 3 critical endpoints; dev-only warnings prevent silent production breakage

## Task Commits

Each task was committed atomically:

1. **Task 1: Rate limiter, API clients, TypeScript types, query key factory** - `75c46cc` (feat)
2. **Task 2: Zod schemas and QueryProvider retry config** - `4893061` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `src/lib/api/rate-limiter.ts` - TokenBucketQueue class: configurable req/s, token bucket refill, Promise queue
- `src/lib/api/jolpica/client.ts` - jolpikaFetch: 4 req/s rate-limited wrapper, JOLPIKA_RATE_LIMIT/HTTP error handling
- `src/lib/api/jolpica/types.ts` - 13 exports: all Jolpica entity interfaces + MRData response wrappers + CURRENT_SEASON_STALE_TIME
- `src/lib/api/jolpica/schemas.ts` - Zod v4 schemas for Drivers/Results/Standings responses; 3 soft-fail parse functions
- `src/lib/api/jolpica/query-keys.ts` - jolpikaKeys factory with 6 generators (all, drivers, driverResults, qualifying, standings, seasons, races)
- `src/lib/api/openf1/client.ts` - openf1Fetch: 3 req/s rate-limited wrapper, base infrastructure for later phases
- `src/lib/api/openf1/types.ts` - 6 OpenF1 interfaces: Driver, LapData, CarData, Position, TeamRadio, Weather
- `src/components/providers/query-provider.tsx` - Added retry: 2 and retryDelay exponential backoff

## Decisions Made

- Hand-rolled `TokenBucketQueue` over `p-queue`: p-queue is pure ESM/Node.js, uncertain browser compat; 30 lines of TS is simpler and fully controlled
- Soft-fail Zod `safeParse` pattern: never throw on API schema drift, log warning in dev, return raw data as-is in production
- `CURRENT_SEASON_STALE_TIME = 5 * 60 * 1000`: 5 minutes balances freshness vs API load (current standings update after race weekends, ~2 weeks apart)
- Zod coverage limited to 3 critical endpoints: Drivers (many downstream deps), Results (core H2H data), Standings (charts). Seasons/Races shapes are simpler and lower-risk.
- `retry: 2` in QueryProvider global defaultOptions (not per-hook): consistent silent retry behavior across all hooks
- OpenF1 client and types created now; hooks deferred to later phases per ROADMAP

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `JOLPIKA_BASE_URL` typo in client.ts template literal**
- **Found during:** Task 1 (rate limiter and API clients)
- **Issue:** Used `JOLPIKA_BASE_URL` (with K) in the fetch URL template literal instead of the exported `JOLPICA_BASE_URL` (with C), causing TypeScript error TS2552
- **Fix:** Corrected the variable name in the template literal to match the exported constant
- **Files modified:** src/lib/api/jolpica/client.ts
- **Verification:** `npx tsc --noEmit` passed with zero errors after fix
- **Committed in:** 75c46cc (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - typo bug)
**Impact on plan:** Necessary correctness fix; no scope change.

## Issues Encountered

- `npm install zod@^4` reported "up to date" — Zod was already in package.json and node_modules from initial project setup (shadcn dependency). No action required.

## User Setup Required

None - no external service configuration required. All APIs are public free-tier with no auth.

## Next Phase Readiness

- All exports are ready for plan 02-02 (React Query hooks): `jolpikaFetch`, `openf1Fetch`, all types, `jolpikaKeys`, parse functions
- Hooks must use `jolpikaKeys` factory (never inline strings) and route through `jolpikaFetch`/`openf1Fetch`
- `CURRENT_SEASON_STALE_TIME` available for import in any hook that queries current season data
- No blockers

---
*Phase: 02-data-layer-foundation*
*Completed: 2026-02-19*
