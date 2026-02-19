---
phase: 03-shared-components-utilities
plan: 02
subsystem: ui
tags: [react, shadcn, tanstack-virtual, combobox, select, virtualization, autocomplete]

requires:
  - phase: 03-01
    provides: shadcn primitives (Command, Popover, Select, Badge, Skeleton), utility modules (nationalityFlag, formatLapTime, teamColors), skeleton/error components
  - phase: 02-02
    provides: useDrivers, useSeasons, useRaces hooks; JolpikaDriver type
provides:
  - src/components/shared/SeasonSelect.tsx
  - src/components/shared/RaceSelect.tsx
  - src/components/shared/DriverSelect.tsx
affects:
  - Phase 4 Head-to-Head (composes all 3 selectors for driver/season/race picking)

tech-stack:
  added: []
  patterns:
    - "Virtualized Command+Popover dropdown for large datasets (shouldFilter=false + manual useMemo filter)"
    - "Cascading select: RaceSelect disabled when no season prop, useRaces skipToken handles undefined"
    - "teamMap prop pattern for optional context injection without additional API calls"
    - "useFlushSync: false in useVirtualizer for React 19 compatibility"

key-files:
  created:
    - src/components/shared/SeasonSelect.tsx
    - src/components/shared/RaceSelect.tsx
    - src/components/shared/DriverSelect.tsx
  modified: []

key-decisions:
  - "teamMap prop for optional team display in DriverSelect rows — avoids additional API calls inside component, consumers (Phase 4) inject context"
  - "CommandList as outer container with inner manual scroll div for virtualizer — avoids cmdk internal scroll conflict with useVirtualizer"
  - "RaceSelect renders disabled shadcn Select (not skeleton) when no season — clearer UX than empty state"

patterns-established:
  - "Controlled components throughout — no internal default values, consumer (Phase 4) manages all state"
  - "isPending (not isLoading) for TanStack Query v5 loading checks"

duration: 1.8m (110s)
completed: 2026-02-19
---

# Phase 3 Plan 02: Selector Components Summary

**Virtualized DriverSelect (874 drivers, single/multi-select), SeasonSelect (76 seasons descending), and RaceSelect (cascades from season prop) consuming Phase 2 hooks.**

## Performance

- **Duration:** ~1.8 min (110s)
- **Started:** 2026-02-19T12:16:43Z
- **Completed:** 2026-02-19T12:18:33Z
- **Tasks:** 2
- **Files modified:** 3 created

## Accomplishments

- SeasonSelect: controlled shadcn Select rendering 76 seasons in descending order (2025 first, 1950 last) with loading skeleton and error state
- RaceSelect: cascades from season prop — disabled state when no season, fetches up to 24 races per season via useRaces
- DriverSelect: virtualized Command+Popover autocomplete for ~874 drivers with configurable single/multi-select, nationality flags, optional teamMap, React 19-compatible (useFlushSync: false)

## Task Commits

Each task was committed atomically:

1. **Task 1: SeasonSelect and RaceSelect** - `ae4f062` (feat)
2. **Task 2: DriverSelect with virtualization** - `714691b` (feat)

## Files Created/Modified

- `src/components/shared/SeasonSelect.tsx` — Controlled season picker, descending sort, loading/error states via useSeasons hook
- `src/components/shared/RaceSelect.tsx` — Race picker cascading from season prop, disabled when no season, loading/error states via useRaces hook
- `src/components/shared/DriverSelect.tsx` — Virtualized driver autocomplete with single/multi-select, nationality flags, optional teamMap for team badges

## Decisions Made

- **teamMap prop for team display:** DriverSelect accepts optional `Record<driverId, teamDisplayName>` from consumers rather than making additional API calls internally. Phase 4 can inject team context when needed. Without teamMap, only flag + name shown.
- **Virtualized inner scroll div inside CommandList:** CommandList provides outer cmdk container; inner `div ref={listRef}` with explicit `height: 300px` is the virtualizer's scroll element. This avoids conflict between cmdk's own scroll management and react-virtual's scroll tracking.
- **RaceSelect disabled Select (not skeleton) when no season:** Shows a disabled `<Select>` with placeholder "Select season first" — clearer UX than a loading skeleton since there's nothing to load yet.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 selector components ready for Phase 4 Head-to-Head composition
- DriverSelect supports teamMap injection — Phase 4 can pass `{ [driverId]: constructorName }` for team context
- SeasonSelect + RaceSelect form a complete cascading selector pair
- All components are controlled — Phase 4 manages state externally

## Self-Check: PASSED

- `src/components/shared/SeasonSelect.tsx` exists
- `src/components/shared/RaceSelect.tsx` exists
- `src/components/shared/DriverSelect.tsx` exists
- `ae4f062` commit exists (SeasonSelect + RaceSelect)
- `714691b` commit exists (DriverSelect)
- TypeScript: zero errors (`npx tsc --noEmit` clean)
- Build: `npm run build` succeeds

---
*Phase: 03-shared-components-utilities*
*Completed: 2026-02-19*
