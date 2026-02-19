# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.
**Current focus:** Milestone v1.1 — Radio module (Phase 6 complete, Phase 7 next)

## Current Position

Phase: 7 of 8 (Radio Catalog UI — in progress)
Plan: 2 of 3 complete
Status: Executing
Last activity: 2026-02-19 — Phase 7 Plan 02 complete (Radio Catalog UI components built)

Progress: [█████░░░░░] ~55% of v1.1

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
| 07 | 01 | 2min | 2 | 6 |
| 07 | 02 | 6min | 2 | 6 |

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
- CORS confirmed OK — HTML Audio elements play F1 CDN MP3s from Vercel without CORS issues (fetch() is blocked but Audio elements work like img tags). Phase 7 uses direct recording_url CDN links, no proxy needed.
- [Phase 07]: timeupdate fires ~4x/second — no debounce added for seek bar smoothness
- [Phase 07]: sessionsByMeeting uses session/meeting/meetingKey key structure to avoid collision with year-scoped sessions key

Key decisions from Phase 07 Plan 02 (v1.1):
- RadioList empty state single message covers pre-selection and zero-results — avoids needing to distinguish "no session" vs "session has no radio" at list level
- SessionBrowser cascades resets via useEffect on dep changes — meetingKey/sessionKey clear before API re-fetch on upstream change
- Team color prepend '#' to OpenF1 team_colour field — returned without # prefix, must be added in UI layer
- useVirtualizer translateY pattern used in RadioList — GPU-composited scroll vs top positioning

### Blockers/Concerns

- ~~Phase 7 CORS~~ — RESOLVED: Audio playback from livetiming.formula1.com works on f1-hub-data.vercel.app (tested 2026-02-19 via Playwright). No /api/radio-proxy needed.
- Phase 8: Position data volume (~20K records per driver per race) must be empirically validated with a real API call to choose between bounded date-window query vs. full per-driver fetch.

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-19 (Phase 7 Plan 02 execution — Radio Catalog UI components complete)
Stopped at: Completed 07-02-PLAN.md — /radio page, RadioClient, SessionBrowser, DriverFilterPills, RadioCard, RadioList built
Resume file: None
