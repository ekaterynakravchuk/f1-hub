---
phase: 04-head-to-head-module
plan: "03"
subsystem: ui
tags: [recharts, react, charts, data-viz, head-to-head]

# Dependency graph
requires:
  - phase: 04-02
    provides: HeadToHeadClient, DriverCompareCard, URL sync, career data hooks
  - phase: 04-01
    provides: computeStats, computeTeammateH2H, useCareerResults, useCareerQualifying, useCareerStandings

provides:
  - PointsPerSeasonChart: dual-line Recharts chart showing points scored per season for both drivers
  - CareerScatterChart: scatter plot of all career race finish positions with reversed Y-axis (P1 at top)
  - TeammateQualifyingChart: grouped bar chart of qualifying H2H by season with "never teammates" fallback
  - Completed HeadToHeadClient: data transformations + all 3 charts integrated below comparison card
  - Full Head-to-Head module: H2H-01 through H2H-09 requirements satisfied

affects: [future-phases, portfolio-showcase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useMemo data transformation before chart props — keeps chart components pure and prop-driven
    - ChartContainer wraps ResponsiveContainer — all charts are automatically responsive via shadcn chart primitive
    - Contrasting color fallback for same-team drivers — sky-400 (#38bdf8) assigned to Driver 2 when colors match

key-files:
  created:
    - src/components/head-to-head/PointsPerSeasonChart.tsx
    - src/components/head-to-head/CareerScatterChart.tsx
    - src/components/head-to-head/TeammateQualifyingChart.tsx
  modified:
    - src/components/head-to-head/HeadToHeadClient.tsx

key-decisions:
  - "Same-team drivers get contrasting color (sky-400 #38bdf8 for Driver 2) — avoids identical lines/bars being indistinguishable"
  - "Chart heights kept compact (line 200px, scatter 220px, bar 180px) — reduces page scroll length, all data still readable"
  - "comparisonReady gate on charts — prevents empty chart flash before data loads (same pattern as comparison card)"
  - "noTeammateSeasons prop drives TeammateQualifyingChart branching — component handles own empty state, no conditional wrapping in parent"
  - "CareerScatterChart uses native Recharts Tooltip (not ChartTooltipContent) — ScatterChart payload shape differs from Line/Bar, custom tooltip simpler"

patterns-established:
  - "All Recharts components have 'use client' at top — required because Recharts uses browser APIs, SSR crashes without this"
  - "ChartContainer className='min-h-[Npx] w-full' — minimum height prevents zero-size render, w-full enables ResponsiveContainer"
  - "useMemo transforms in HeadToHeadClient, not inside chart components — charts stay pure/dumb, parent owns data shape"

# Metrics
duration: 47min
completed: 2026-02-19
---

# Phase 4 Plan 3: Head-to-Head Charts Summary

**Three Recharts chart components (line, scatter, bar) integrated into the Head-to-Head page completing all H2H requirements — points-per-season, career finish positions, and teammate qualifying comparison with same-team contrast color fix.**

## Performance

- **Duration:** 47 min (includes checkpoint + user verification round-trip)
- **Started:** 2026-02-19T15:08:22Z
- **Completed:** 2026-02-19T15:16:17Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 4

## Accomplishments

- `PointsPerSeasonChart`: line chart with two colored lines per driver, `connectNulls` for careers with seasonal gaps, themed tooltip via `ChartTooltipContent`
- `CareerScatterChart`: scatter plot of every career race result, Y-axis reversed so P1 is at top (domain 1-25), custom tooltip showing driver name + race index + position
- `TeammateQualifyingChart`: grouped bar chart by season aggregating qualifying head-to-head wins; renders "These drivers were never teammates" message when `noTeammateSeasons` is true
- `HeadToHeadClient` updated with three `useMemo` data transformations (points merge, scatter map, teammate bar aggregate) and all charts wired in below `DriverCompareCard`
- Post-checkpoint fix: same-team driver color contrast (sky-400 for Driver 2) and compact chart heights — both applied in `d4edb33`

## Task Commits

1. **Task 1: Create three chart components and integrate into HeadToHeadClient** - `2f8643a` (feat)
2. **Post-checkpoint fix: contrast color and compact heights** - `d4edb33` (fix)

## Files Created/Modified

- `src/components/head-to-head/PointsPerSeasonChart.tsx` — Line chart: dual driver lines, seasons on X axis, points on Y axis
- `src/components/head-to-head/CareerScatterChart.tsx` — Scatter plot: career race positions with reversed Y-axis, custom tooltip
- `src/components/head-to-head/TeammateQualifyingChart.tsx` — Bar chart: qualifying H2H by season when teammates, "never teammates" fallback
- `src/components/head-to-head/HeadToHeadClient.tsx` — Added 3 chart imports, 3 useMemo transforms, chart rendering below comparison card

## Decisions Made

- **Same-team contrast color**: When both drivers share a team color (e.g., two Mercedes drivers), Driver 2 receives sky-400 (`#38bdf8`) to make chart lines/bars distinguishable. Applied in `HeadToHeadClient.getDriverColor`.
- **Compact chart heights**: Line 200px, scatter 220px, bar 180px — reduced from initial 300/350/250px after user verification found the page too tall.
- **`comparisonReady` gates charts**: Charts only render once all career data has loaded, preventing empty chart flash (same pattern already in use for DriverCompareCard).
- **`noTeammateSeasons` prop on TeammateQualifyingChart**: Component handles its own empty state branch — parent passes boolean derived from `teammateH2H.teammateSeasonsFound.length === 0`.
- **Native Recharts Tooltip for ScatterChart**: `ChartTooltipContent` is designed for named-series payloads (Line/Bar); ScatterChart payload shape differs, so a custom JSX tooltip renders driver name + position cleanly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Post-checkpoint user feedback] Same-team driver color contrast**
- **Found during:** Task 2 checkpoint verification
- **Issue:** When both selected drivers share the same team color (e.g., Hamilton vs Rosberg both on Mercedes), all chart lines and bars rendered in identical teal — indistinguishable
- **Fix:** In `HeadToHeadClient`, after computing both colors, if `d1Color === d2Color`, override `d2Color` to `#38bdf8` (Tailwind sky-400)
- **Files modified:** `src/components/head-to-head/HeadToHeadClient.tsx`
- **Committed in:** `d4edb33`

**2. [Post-checkpoint user feedback] Compact chart heights**
- **Found during:** Task 2 checkpoint verification
- **Issue:** Initial chart heights (300/350/250px) made the page excessively tall, requiring heavy scrolling to see all charts
- **Fix:** Reduced `min-h` className in all three chart components: line 200px, scatter 220px, bar 180px
- **Files modified:** `PointsPerSeasonChart.tsx`, `CareerScatterChart.tsx`, `TeammateQualifyingChart.tsx`
- **Committed in:** `d4edb33`

---

**Total deviations:** 2 post-checkpoint fixes (user feedback during verification)
**Impact on plan:** Both fixes improve UX quality. No scope creep — charts, data flows, and "never teammates" logic all matched plan exactly.

## Issues Encountered

None during automated implementation. Two UX improvements surfaced during human verification and were applied cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Head-to-Head module is complete: all 9 requirements (H2H-01 through H2H-09) are satisfied and user-verified
- Phase 4 (Head-to-Head Module) is fully complete — all 3 plans executed
- The full project (Phases 1-4) is now complete: foundation, data layer, race explorer, and H2H comparison are all shipped
- No blockers for any future phases

---
*Phase: 04-head-to-head-module*
*Completed: 2026-02-19*
