# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.
**Current focus:** Milestone v1.1 — Radio module (Phase 6 complete, Phase 7 next)

## Current Position

Phase: 6 of 8 (Radio Data Layer & Audio Hook — complete)
Plan: 3 of 3 complete
Status: Phase 6 complete — ready for Phase 7
Last activity: 2026-02-19 — Phase 6 Plan 03 complete (SSR-safe useAudioPlayer hook)

Progress: [███░░░░░░░] ~30% of v1.1

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 11
- Average duration: 8.55 minutes
- Total execution time: 1.57 hours

**v1.1 execution:**
| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 06 | 01 | 7min | 2 | 9 |
| 06 | 02 | 5min | 3 | 5 |
| 06 | 03 | 4min | 1 | 1 |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key decisions from v1.0 affecting v1.1:

- OpenF1 client already created as base infrastructure (Phase 2) — Radio module will use it
- Hand-rolled TokenBucketQueue for rate limiting — OpenF1 3 req/s limit applies; 30 req/min is the binding constraint for radio browsing
- staleTime: Infinity for historical data — radio recordings are immutable; query keys must be scoped per-session to prevent re-fetch on driver filter changes
- Client-side data fetching only — no backend, all from OpenF1 API directly
- Dark minimalist design — Radio UI must follow same patterns as existing modules
- Session-scoped query keys: ['openf1', sessionKey, domain] — sessionKey at position 1 enables bulk cache invalidation per session (06-01)
- fetchPositions always requires driverNumber — full session position data exceeds 100K records; always filter by driver (06-01)

Key decisions from Phase 6 Plans 02-03 (v1.1):
- new Audio() must be inside useEffect with empty deps — only SSR-safe pattern in Next.js App Router (06-03)
- Named event listener consts required for removeEventListener to work correctly in cleanup (06-03)
- CORS test deferred — Phase 7 must handle both direct CDN URL case and proxy case until confirmed on Vercel (06-03)

### Blockers/Concerns

- Phase 7: CORS behavior of livetiming.formula1.com CDN must be smoke-tested on deployed Vercel origin before building sticky player UI. If blocked, implement /api/radio-proxy as first task of Phase 7. Test: open DevTools console on Vercel preview URL and run: const a = new Audio("https://livetiming.formula1.com/static/2024/2024-03-09_Saudi_Arabian_Grand_Prix/2024-03-07_Practice_1/TeamRadio/MAXVER01_1_20240307_141852.mp3"); a.play().then(() => console.log("CORS OK")).catch(e => console.error("CORS BLOCKED:", e));
- Phase 8: Position data volume (~20K records per driver per race) must be empirically validated with a real API call to choose between bounded date-window query vs. full per-driver fetch.

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-19 (Phase 6 execution — all 3 plans complete)
Stopped at: Completed 06-03-PLAN.md — useAudioPlayer hook done, CORS test deferred, Phase 6 fully complete
Resume file: None
