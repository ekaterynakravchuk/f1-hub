---
phase: 07-radio-catalog-ui
plan: 01
subsystem: api
tags: [react-query, openf1, hooks, audio, typescript]

# Dependency graph
requires:
  - phase: 06-radio-data-layer
    provides: useAudioPlayer hook, OpenF1 endpoints/hooks, types

provides:
  - useAudioPlayer extended with currentTime, duration, and seek
  - fetchDrivers(sessionKey) endpoint function
  - fetchSessionsByMeeting(meetingKey) endpoint function
  - openf1Keys.drivers and openf1Keys.sessionsByMeeting query key generators
  - useOpenF1Drivers(sessionKey) React Query hook
  - useOpenF1SessionsByMeeting(meetingKey) React Query hook
  - formatAudioTime(seconds) utility

affects:
  - 07-02 (RadioClient component uses useOpenF1Drivers, useOpenF1SessionsByMeeting)
  - 07-03 (StickyPlayer uses seek, currentTime, duration from useAudioPlayer)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - skipToken pattern for conditional React Query fetches (sessionKey ?? 0 with skipToken)
    - Named event listener consts for proper removeEventListener cleanup
    - staleTime: Infinity for historical OpenF1 data

key-files:
  created:
    - src/hooks/useOpenF1Drivers.ts
    - src/hooks/useOpenF1SessionsByMeeting.ts
    - src/lib/utils/radio.ts
  modified:
    - src/hooks/useAudioPlayer.ts
    - src/lib/api/openf1/endpoints.ts
    - src/lib/api/openf1/query-keys.ts

key-decisions:
  - "timeupdate fires ~4x/second — no debounce added, acceptable for seek bar smoothness"
  - "formatAudioTime placed at src/lib/utils/radio.ts alongside radio/ subdirectory — not in radio/ since it is audio-player utility, not radio context utility"
  - "sessionsByMeeting uses ['openf1', 'sessions', 'meeting', meetingKey] key to avoid collision with year-scoped sessions key ['openf1', 'sessions', year]"

patterns-established:
  - "Audio time events: onTimeUpdate and onDurationChange as named consts registered in useEffect alongside existing audio state listeners"
  - "stop() now resets currentTime and duration to 0 explicitly via state setters in addition to setting audioRef.currentTime"

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 7 Plan 01: Data Layer Gaps Summary

**Extended useAudioPlayer with seek/time tracking, added fetchDrivers + fetchSessionsByMeeting endpoints/hooks, and formatAudioTime utility — enabling Radio Catalog UI components in plans 02-03**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T21:03:59Z
- **Completed:** 2026-02-19T21:05:54Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Extended useAudioPlayer with currentTime, duration state and seek callback using named event listeners (timeupdate/durationchange)
- Added fetchDrivers and fetchSessionsByMeeting to endpoints.ts with proper OpenF1Driver type import
- Created useOpenF1Drivers and useOpenF1SessionsByMeeting hooks following skipToken pattern with staleTime: Infinity
- Added openf1Keys.drivers and openf1Keys.sessionsByMeeting key generators with collision-safe key structure
- Created formatAudioTime utility returning "m:ss" format with guard for NaN/Infinity/negative inputs

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend useAudioPlayer with currentTime, duration, and seek** - `8873723` (feat)
2. **Task 2: Add drivers/sessions-by-meeting endpoints, hooks, and formatAudioTime** - `2614b12` (feat)

## Files Created/Modified
- `src/hooks/useAudioPlayer.ts` - Extended with currentTime, duration state, seek callback, timeupdate/durationchange listeners
- `src/lib/api/openf1/endpoints.ts` - Added fetchDrivers and fetchSessionsByMeeting functions
- `src/lib/api/openf1/query-keys.ts` - Added openf1Keys.drivers and openf1Keys.sessionsByMeeting key generators
- `src/hooks/useOpenF1Drivers.ts` - New React Query hook for driver roster per session
- `src/hooks/useOpenF1SessionsByMeeting.ts` - New React Query hook for sessions filtered by meeting_key
- `src/lib/utils/radio.ts` - New formatAudioTime(seconds) utility

## Decisions Made
- timeupdate fires ~4x/second — no debounce added per plan specification; acceptable for seek bar smoothness
- formatAudioTime placed at src/lib/utils/radio.ts (not inside radio/ subdirectory) since it is an audio player utility, not a radio context enrichment utility
- sessionsByMeeting uses ['openf1', 'sessions', 'meeting', meetingKey] key structure to avoid collision with year-scoped ['openf1', 'sessions', year] key

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All data layer dependencies for plans 02 and 03 are now in place
- RadioClient component can use useOpenF1Drivers for driver names/team colors and useOpenF1SessionsByMeeting for session type selector
- StickyPlayer component can use currentTime, duration, and seek from useAudioPlayer for seek bar and elapsed time display
- No blockers identified

---
*Phase: 07-radio-catalog-ui*
*Completed: 2026-02-19*
