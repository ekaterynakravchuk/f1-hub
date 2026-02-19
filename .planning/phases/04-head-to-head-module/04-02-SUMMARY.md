---
phase: 04-head-to-head-module
plan: 02
subsystem: ui
tags: [next.js, react-query, recharts, shadcn, url-sync, comparison-card, typescript]

# Dependency graph
requires:
  - phase: 04-head-to-head-module
    plan: 01
    provides: useCareerResults, useCareerQualifying, useCareerStandings, computeStats, computeTeammateH2H, DriverStats type
  - phase: 03-shared-components
    provides: DriverSelect component

provides:
  - /head-to-head page with server component searchParams parsing and Suspense boundary
  - HeadToHeadClient with two-driver selection, URL sync via router.replace, data wiring
  - DriverCompareCard with 10 stat rows, green highlighting on best values, progressive skeleton loading

affects:
  - 04-03 (career charts rendered inside HeadToHeadClient below DriverCompareCard)

# Tech tracking
tech-stack:
  added:
    - recharts: ^2.15.4 (resolved from ^3.7.0 shadcn request)
    - shadcn chart component (src/components/ui/chart.tsx)
    - shadcn tabs component (src/components/ui/tabs.tsx)
  patterns:
    - Next.js 16 searchParams as Promise<{...}> — must await before accessing d1/d2
    - URL sync via router.replace (not push) to avoid history pollution
    - Progressive loading: dataPending gates stats to null, triggering Skeleton rows
    - Standings-dependent stats (titles, career points) get individual Skeleton cells via standingsPending prop
    - officialCareerPoints fallback pattern: use officialCareerPoints when >0, else careerPoints

key-files:
  created:
    - src/components/head-to-head/HeadToHeadClient.tsx
    - src/components/head-to-head/DriverCompareCard.tsx
    - src/components/ui/chart.tsx
    - src/components/ui/tabs.tsx
  modified:
    - src/app/head-to-head/page.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "router.replace used for URL sync (not push) — selecting drivers should not pollute browser history"
  - "dataPending gates entire stats to null, showing skeleton rows — avoids flash of zero-value stats before data loads"
  - "standingsPending flows as prop to DriverCompareCard — allows card-level logic to show per-cell Skeleton for standings-dependent stats only"
  - "officialCareerPoints > 0 fallback to careerPoints — standings may not load before user sees card"
  - "recharts resolved to ^2.15.4 (compatible with shadcn chart) — shadcn chart wraps recharts 2.x"

# Metrics
duration: 26min
completed: 2026-02-19
---

# Phase 4 Plan 02: Head-to-Head Page and Comparison Card Summary

**Head-to-head driver comparison page with URL sync for shareable links, two DriverSelect components, and a 10-stat comparison card with green highlighting and progressive skeleton loading for standings-dependent stats.**

## Performance

- **Duration:** ~26 min (1542s)
- **Started:** 2026-02-19T13:57:43Z
- **Completed:** 2026-02-19T14:23:25Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Installed recharts and shadcn chart/tabs components (recharts ^2.15.4 via npm, chart.tsx and tabs.tsx via shadcn CLI)
- Converted /head-to-head page to Next.js 16 server component with async `searchParams: Promise<{d1?, d2?}>` pattern and Suspense fallback
- Created HeadToHeadClient with useState, useRouter URL sync via `router.replace`, dual driver career data hooks, useMemo stat computation, and driver name/color derivation from useDrivers cache
- Created DriverCompareCard with 10 stat rows (wins, podiums, poles, titles, races, DNFs, career points, avg finish, avg grid, points/race), highlight logic with green text-green-500 font-semibold on best values, per-cell Skeleton for standings-dependent stats while loading, full card skeleton when no stats available

## Task Commits

Each task was committed atomically:

1. **Task 1: Page server component and HeadToHeadClient with URL sync** - `46f587d` (feat)
2. **Task 2: DriverCompareCard with stat highlighting** - `103e7ab` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/app/head-to-head/page.tsx` - Converted to async server component with searchParams parsing and Suspense boundary
- `src/components/head-to-head/HeadToHeadClient.tsx` - Created: client component root with state, URL sync, career data hooks, stat computation, layout
- `src/components/head-to-head/DriverCompareCard.tsx` - Created: two-column stat comparison card with green highlighting and progressive loading
- `src/components/ui/chart.tsx` - Created: shadcn chart component wrapping recharts
- `src/components/ui/tabs.tsx` - Created: shadcn tabs component
- `package.json` - Added recharts dependency
- `package-lock.json` - Updated lockfile

## Decisions Made

- `router.replace` used for URL sync — selecting drivers must not pollute browser history (back button should go to previous page, not previous driver selection)
- `dataPending` gates entire stats to `null`, showing full-card skeleton rows — avoids flash of zero-value stats (e.g., "0 wins") before data loads
- `standingsPending` prop flows to DriverCompareCard — allows per-cell Skeleton for titles and career points only, while other stats already visible
- `officialCareerPoints > 0` fallback: use `officialCareerPoints` from standings when available, fall back to `careerPoints` from race results while standings still loading
- recharts resolved to ^2.15.4 which is the version shadcn chart wraps (shadcn chart uses recharts 2.x API)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- /head-to-head page is fully functional: driver selection, URL sync, comparison card with all 10 stats and progressive loading
- HeadToHeadClient has placeholder comment `{/* Charts will be added in Plan 04-03 */}` — ready for chart integration
- computeTeammateH2H is computed and stored in `_teammateH2H` local variable — ready to pass to teammate H2H section in 04-03
- recharts and chart.tsx available for 04-03 chart components

---
*Phase: 04-head-to-head-module*
*Completed: 2026-02-19*

## Self-Check: PASSED

- FOUND: src/app/head-to-head/page.tsx
- FOUND: src/components/head-to-head/HeadToHeadClient.tsx
- FOUND: src/components/head-to-head/DriverCompareCard.tsx
- FOUND: src/components/ui/chart.tsx
- FOUND: .planning/phases/04-head-to-head-module/04-02-SUMMARY.md
- FOUND commit: 46f587d (Task 1)
- FOUND commit: 103e7ab (Task 2)
