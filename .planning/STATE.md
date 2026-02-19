# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.
**Current focus:** Milestone v1.1 — Radio module (Phase 6 in progress)

## Current Position

Phase: 6 of 8 (Radio Data Layer & Audio Hook — in progress)
Plan: 1 of 3 complete
Status: Executing
Last activity: 2026-02-19 — Phase 6 Plan 01 complete (OpenF1 data layer)

Progress: [█░░░░░░░░░] ~10% of v1.1

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 11
- Average duration: 8.55 minutes
- Total execution time: 1.57 hours

**v1.1 execution:**
| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 06 | 01 | 7min | 2 | 9 |

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

### Blockers/Concerns

- Phase 6: CORS behavior of livetiming.formula1.com CDN must be smoke-tested on deployed Vercel origin (not localhost) before Phase 7 begins. If blocked, a server-side audio proxy route is required (~1–2 days rework).
- Phase 8: Position data volume (~20K records per driver per race) must be empirically validated with a real API call to choose between bounded date-window query vs. full per-driver fetch.

### Pending Todos

None.

## Session Continuity

Last session: 2026-02-19 (Phase 6 Plan 01 execution)
Stopped at: Completed 06-01-PLAN.md — OpenF1 data layer (types, endpoints, query-keys, 6 hooks)
Resume file: None
