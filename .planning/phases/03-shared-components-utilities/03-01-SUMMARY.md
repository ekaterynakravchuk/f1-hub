---
phase: 03-shared-components-utilities
plan: 01
subsystem: shared-utilities
tags: [shadcn, utilities, team-colors, lap-time, nationality-flags, skeletons, error-state]
dependency_graph:
  requires: []
  provides:
    - src/components/ui/command.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/select.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/scroll-area.tsx
    - src/lib/utils/teamColors.ts
    - src/lib/utils/formatLapTime.ts
    - src/lib/utils/nationalityFlag.ts
    - src/components/shared/QueryError.tsx
    - src/components/shared/loading/DriverSelectSkeleton.tsx
    - src/components/shared/loading/SeasonSelectSkeleton.tsx
    - src/components/shared/loading/RaceSelectSkeleton.tsx
  affects:
    - Phase 3 Plan 02 (selector components consume all primitives and utilities)
    - Phase 4 Head-to-Head (consumes teamColors, formatLapTime, nationalityFlag directly)
tech_stack:
  added:
    - "@tanstack/react-virtual ^3.13.18 — virtualized list rendering for DriverSelect"
    - "shadcn command — cmdk-backed filterable list primitive"
    - "shadcn popover — Radix Popover for dropdown anchor"
    - "shadcn select — Radix Select for season and race pickers"
    - "shadcn skeleton — shimmer loading placeholder"
    - "shadcn badge — inline label for team name display"
    - "shadcn scroll-area — Radix ScrollArea for overflow content"
  patterns:
    - "Inline style for team colors (not Tailwind dynamic classes — v4 purges at build)"
    - "Static lookup tables for flags and colors (no library overhead for 40/35 entries)"
    - "formatMillis() wraps formatLapTime() for Jolpica string millis fields"
    - "useClient directive on all shared components (consumed by client components)"
key_files:
  created:
    - src/lib/utils/teamColors.ts
    - src/lib/utils/formatLapTime.ts
    - src/lib/utils/nationalityFlag.ts
    - src/components/shared/QueryError.tsx
    - src/components/shared/loading/DriverSelectSkeleton.tsx
    - src/components/shared/loading/SeasonSelectSkeleton.tsx
    - src/components/shared/loading/RaceSelectSkeleton.tsx
    - src/components/ui/command.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/select.tsx
    - src/components/ui/skeleton.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/scroll-area.tsx
  modified: []
decisions:
  - "Applied team colors via inline style not Tailwind dynamic classes — Tailwind v4 purges arbitrary dynamic values at build time"
  - "35 constructor IDs in teamColors covering 2000-2025 era with fallback #64748b (slate-500)"
  - "formatMillis wraps formatLapTime to handle Jolpica Time.millis string field"
  - "40 nationality flags as static lookup table — library overhead unjustified for fixed set"
  - "Skeleton components use use client directive — consumed within client component trees"
metrics:
  duration: "2.2m (130s)"
  completed_date: "2026-02-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 13
  files_modified: 2
---

# Phase 3 Plan 01: Shared Utilities and UI Primitives Summary

**One-liner:** 6 shadcn primitives, @tanstack/react-virtual, and 3 utility modules (team colors, lap time formatter, nationality flags) plus 3 skeleton and 1 error component.

## What Was Built

### Task 1: Install dependencies and create utility modules

Installed 6 shadcn UI primitives via `npx shadcn@latest add` and `@tanstack/react-virtual` via npm. Created three utility modules:

- **`src/lib/utils/teamColors.ts`** — `TEAM_COLORS` Record mapping 35 Jolpica `constructorId` strings to hex colors covering 2000–2025 constructors. `FALLBACK_TEAM_COLOR = "#64748b"`. `getTeamColor(id)` function. Colors applied via `style={{ color: getTeamColor(id) }}` (not Tailwind dynamic classes).

- **`src/lib/utils/formatLapTime.ts`** — `formatLapTime(ms: number)` converts milliseconds to `m:ss.SSS`. Returns "—" for negative/non-finite. `formatMillis(millisStr: string | number)` parses Jolpica's string `Time.millis` field before formatting.

- **`src/lib/utils/nationalityFlag.ts`** — `NATIONALITY_FLAGS` Record with all 40 Jolpica nationality adjective strings mapped to Unicode flag emojis. `getNationalityFlag(nationality?)` returns "🏁" for unknown/undefined. Includes historical mappings: "East German" → 🇩🇪, "Rhodesian" → 🇿🇼.

### Task 2: Create loading skeleton and error state components

Created 4 components in `src/components/shared/`:

- **`loading/DriverSelectSkeleton.tsx`** — `Skeleton className="h-9 w-full rounded-md"`, matches DriverSelect trigger button dimensions.
- **`loading/SeasonSelectSkeleton.tsx`** — `Skeleton className="h-9 w-[120px] rounded-md"`, matches SeasonSelect trigger width.
- **`loading/RaceSelectSkeleton.tsx`** — `Skeleton className="h-9 w-[220px] rounded-md"`, matches RaceSelect trigger width.
- **`QueryError.tsx`** — `AlertCircle` icon + message text + optional "Retry" button. Props: `message?: string` (default "Something went wrong"), `onRetry?: () => void`.

All components are `"use client"` with named exports.

## Verification Results

- `getTeamColor("ferrari")` returns `"#E8002D"` ✓
- `getTeamColor("unknown_team")` returns `"#64748b"` ✓
- `formatLapTime(83421)` returns `"1:23.421"` ✓
- `getNationalityFlag("British")` returns `"🇬🇧"` ✓
- `getNationalityFlag(undefined)` returns `"🏁"` ✓
- TypeScript: zero errors (`npx tsc --noEmit` clean) ✓
- `npm run build` succeeds ✓

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | `3a189b0` | feat(03-01): install shadcn primitives and create utility modules |
| Task 2 | `f195ceb` | feat(03-01): create loading skeleton and error state components |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/lib/utils/teamColors.ts` exists ✓
- `src/lib/utils/formatLapTime.ts` exists ✓
- `src/lib/utils/nationalityFlag.ts` exists ✓
- `src/components/shared/QueryError.tsx` exists ✓
- `src/components/shared/loading/DriverSelectSkeleton.tsx` exists ✓
- `src/components/shared/loading/SeasonSelectSkeleton.tsx` exists ✓
- `src/components/shared/loading/RaceSelectSkeleton.tsx` exists ✓
- `3a189b0` commit exists ✓
- `f195ceb` commit exists ✓
