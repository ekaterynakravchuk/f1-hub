---
phase: 06-radio-data-layer-audio-hook
plan: 03
subsystem: ui
tags: [react, hooks, audio, ssr, next.js, html-audio]

# Dependency graph
requires:
  - phase: 06-radio-data-layer-audio-hook
    provides: OpenF1 data layer (Plans 01, 02) consumed by Phase 7 Radio UI
provides:
  - SSR-safe useAudioPlayer hook with load/play/pause/stop controls and AudioState type
  - Confirmed next build success (no Audio is not defined SSR crash)
  - CORS smoke test status documented (DEFERRED — requires Vercel deployment)
affects:
  - 07-radio-ui: imports useAudioPlayer for sticky player component
  - phase 7 planning: CORS result determines if /api/radio-proxy is needed

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SSR-safe browser API isolation via useEffect + useRef (never at module scope)
    - Named event listener functions stored as consts for correct removeEventListener cleanup
    - useCallback for stable hook function references

key-files:
  created:
    - src/hooks/useAudioPlayer.ts
  modified: []

key-decisions:
  - "new Audio() isolated inside useEffect with empty deps array — only safe pattern for Next.js App Router SSR"
  - "Named event listener consts (not inline arrows) required so removeEventListener correctly removes them in cleanup"
  - "CORS smoke test deferred — requires Vercel deployment; Phase 7 must handle both direct CDN and proxy cases until verified"
  - "stop() resets currentTime to 0 and sets currentUrl to null — full reset vs pause which retains position"

patterns-established:
  - "Pattern: SSR browser API gate — useEffect + useRef for HTMLAudioElement, typeof window guard as belt-and-suspenders"
  - "Pattern: named handler refs for addEventListener/removeEventListener pairs in cleanup functions"

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 6 Plan 03: SSR-Safe Audio Hook Summary

**SSR-safe useAudioPlayer hook with HTMLAudioElement isolated inside useEffect, confirmed next build success, and CORS smoke test deferred pending Vercel deployment**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T20:21:46Z
- **Completed:** 2026-02-19T20:25:30Z
- **Tasks:** 1 of 2 fully complete (Task 2 is a non-blocking checkpoint awaiting human verification)
- **Files modified:** 1

## Accomplishments

- Created `src/hooks/useAudioPlayer.ts` with `"use client"` directive as first line
- `new Audio()` appears only inside `useEffect(() => {}, [])` — zero SSR-unsafe code paths
- Named event listener functions (onPlaying, onPause, onEnded, onError, onLoadStart, onCanPlay) allow correct removeEventListener cleanup
- `npm run build` succeeds with zero errors — no "Audio is not defined" crash
- `npx tsc --noEmit` passes clean
- Hook exports `AudioState` type and `useAudioPlayer` with `load`, `play`, `pause`, `stop` controls
- CORS smoke test documented as DEFERRED — requires a Vercel preview URL to test from deployed origin

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SSR-safe useAudioPlayer hook and verify build** - `02f995a` (feat)
2. **Task 2: CORS smoke test** - non-blocking checkpoint, awaiting human verification

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/hooks/useAudioPlayer.ts` — SSR-safe audio playback hook with full event coverage and cleanup

## Decisions Made

- `new Audio()` is placed inside `useEffect` with empty dependency array — the only safe pattern for Next.js App Router. A `typeof window === "undefined"` guard is added as belt-and-suspenders even though `useEffect` alone is sufficient.
- Named event listener consts stored in variables before `addEventListener` calls, so `removeEventListener` correctly removes the same function reference in the cleanup return.
- The `canplay` handler uses a functional state update `setState(prev => prev === "loading" ? "paused" : prev)` to avoid overriding a "playing" state if the browser fires `canplay` mid-playback.
- `stop()` resets `currentTime = 0`, sets state to `"idle"`, and clears `currentUrl` — a full reset, distinct from `pause()` which retains position.
- CORS smoke test marked DEFERRED. Phase 7 should be designed to handle both direct CDN URLs and a proxy route until the CORS status is confirmed on a deployed Vercel origin.

## Deviations from Plan

None — plan executed exactly as written. The plan spec and RESEARCH.md pattern were followed precisely. The `canplay` functional state update (`prev === "loading" ? "paused" : prev`) is a minor implementation refinement to match the plan's note "if state was loading, set to paused" without overriding other states.

## Issues Encountered

None. Build succeeded on first attempt.

## CORS Smoke Test — Non-Blocking Checkpoint (Task 2)

**Status: DEFERRED** — No Vercel deployment configured for this project.

**What to do (human action required):**

1. Deploy to Vercel: `vercel deploy` or push to a connected branch
2. Open browser DevTools console on the deployed Vercel URL
3. Run this JavaScript:
```javascript
const a = new Audio("https://livetiming.formula1.com/static/2024/2024-03-09_Saudi_Arabian_Grand_Prix/2024-03-07_Practice_1/TeamRadio/MAXVER01_1_20240307_141852.mp3");
a.play().then(() => console.log("CORS OK — audio plays")).catch(e => console.error("CORS BLOCKED:", e));
```
4. If "CORS OK": Phase 7 can use direct CDN URLs
5. If "CORS BLOCKED": Phase 7 must create `/api/radio-proxy?url=...` before audio player UI

**Impact on Phase 7:** If CORS is blocked, add `/api/radio-proxy` as Task 1 of Phase 7 (server-side streaming proxy). If CORS is OK, use direct `recording_url` values from OpenF1 API.

## Next Phase Readiness

- `useAudioPlayer` hook ready for import in Phase 7 Radio UI client components
- Any component importing `useAudioPlayer` must itself be a client component (or wrapped in one)
- CORS behavior of `livetiming.formula1.com` is the one remaining unknown — Phase 7 should plan for both cases or confirm before building the sticky player UI
- All Phase 6 deliverables complete: OpenF1 data layer (Plans 01, 02), audio hook (Plan 03)

## Self-Check

Files exist:
- `src/hooks/useAudioPlayer.ts` — verified created

Commits exist:
- `02f995a` — verified Task 1 commit

---
*Phase: 06-radio-data-layer-audio-hook*
*Completed: 2026-02-19*
