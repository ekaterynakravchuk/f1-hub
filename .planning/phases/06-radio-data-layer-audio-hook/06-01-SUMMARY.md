---
phase: 06-radio-data-layer-audio-hook
plan: 01
subsystem: api
tags: [openf1, react-query, tanstack-query, typescript, hooks, data-fetching]

# Dependency graph
requires:
  - phase: 02-jolpica-data-layer
    provides: "Established pattern: jolpikaKeys, jolpikaFetch, useRaces skipToken/staleTime:Infinity pattern"
  - phase: 06-radio-data-layer-audio-hook (internal)
    provides: "openf1Fetch client with rate-limited TokenBucketQueue"
provides:
  - "6 typed fetch functions for OpenF1 endpoints (teamRadio, raceControl, sessions, meetings, driverLaps, positions)"
  - "openf1Keys query-key factory with session-scoped hierarchical keys"
  - "3 new OpenF1 type interfaces (OpenF1RaceControl, OpenF1Session, OpenF1Meeting)"
  - "6 React Query hooks with skipToken pattern and staleTime: Infinity"
affects:
  - "07-radio-ui"
  - "08-lap-position-overlay"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "skipToken instead of enabled:false for conditional React Query fetches"
    - "staleTime: Infinity for immutable historical OpenF1 data"
    - "Session-scoped query keys: ['openf1', sessionKey, domain] enables bulk session cache invalidation"
    - "Always filter position/lap data by driverNumber to avoid 100K+ record responses"

key-files:
  created:
    - src/lib/api/openf1/endpoints.ts
    - src/lib/api/openf1/query-keys.ts
    - src/hooks/useTeamRadio.ts
    - src/hooks/useRaceControl.ts
    - src/hooks/useOpenF1Sessions.ts
    - src/hooks/useOpenF1Meetings.ts
    - src/hooks/useDriverLaps.ts
    - src/hooks/usePositions.ts
  modified:
    - src/lib/api/openf1/types.ts

key-decisions:
  - "Session-scoped query keys place sessionKey at position 1 so invalidateQueries({ queryKey: ['openf1', sessionKey] }) clears all session data at once"
  - "fetchPositions always requires driverNumber — full session position data exceeds 100K records per session"
  - "openf1Keys.sessions/meetings use year-scoped keys (not session-scoped) since they are year-level queries"

patterns-established:
  - "OpenF1 hook pattern: skipToken when param undefined, staleTime:Infinity, openf1Keys factory"
  - "Two-param hooks (driverLaps, positions): both params must be truthy to enable fetch"

# Metrics
duration: 7min
completed: 2026-02-19
---

# Phase 6 Plan 01: OpenF1 Data Layer Summary

**Six typed fetch functions and six React Query hooks for OpenF1 endpoints, with session-scoped query keys enabling bulk cache invalidation per race session**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T20:21:39Z
- **Completed:** 2026-02-19T20:28:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Extended `types.ts` with OpenF1RaceControl, OpenF1Session, OpenF1Meeting interfaces (verified against API docs)
- Created `endpoints.ts` with 6 typed async fetch functions all calling `openf1Fetch` from the existing client
- Created `query-keys.ts` with hierarchical `openf1Keys` factory — session-scoped keys at position 1 enable single-call invalidation for an entire race session
- Created 6 React Query hooks following the exact `useRaces.ts` pattern: `skipToken` for undefined params, `staleTime: Infinity` for immutable data

## Task Commits

1. **Task 1: Add new types, create endpoints.ts, and create query-keys.ts** - `dab7639` (feat)
2. **Task 2: Create six React Query hooks** - `4ac21db` (feat)

## Files Created/Modified

- `src/lib/api/openf1/types.ts` - Added OpenF1RaceControl, OpenF1Session, OpenF1Meeting interfaces
- `src/lib/api/openf1/endpoints.ts` - 6 typed fetch functions: fetchTeamRadio, fetchRaceControl, fetchSessions, fetchMeetings, fetchDriverLaps, fetchPositions
- `src/lib/api/openf1/query-keys.ts` - openf1Keys factory with 6 session-scoped/year-scoped key generators
- `src/hooks/useTeamRadio.ts` - React Query hook, sessionKey param
- `src/hooks/useRaceControl.ts` - React Query hook, sessionKey param
- `src/hooks/useOpenF1Sessions.ts` - React Query hook, year param
- `src/hooks/useOpenF1Meetings.ts` - React Query hook, year param
- `src/hooks/useDriverLaps.ts` - React Query hook, sessionKey + driverNumber params
- `src/hooks/usePositions.ts` - React Query hook, sessionKey + driverNumber params

## Decisions Made

- Session-scoped query keys place `sessionKey` at array position 1 so `invalidateQueries({ queryKey: ['openf1', sessionKey] })` clears all data for a session in one call
- `fetchPositions` always requires `driverNumber` — full session position data can exceed 100K records (research finding: ~20K per driver per race)
- Year-level queries (sessions, meetings) use `['openf1', 'sessions', year]` pattern — not session-scoped since they are year-level aggregations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full OpenF1 data layer ready for Phase 7 (Radio UI) and Phase 8 (Lap/Position overlay)
- All 6 hooks importable with correct TypeScript types
- TypeScript compilation and Next.js production build both pass with zero errors
- CORS behavior of `livetiming.formula1.com` CDN still needs smoke-testing on Vercel (documented blocker in STATE.md)

## Self-Check: PASSED

All 9 expected files confirmed to exist. Both task commits (dab7639, 4ac21db) verified in git log.

---
*Phase: 06-radio-data-layer-audio-hook*
*Completed: 2026-02-19*
