# Requirements: F1 Hub

**Defined:** 2026-02-16
**Core Value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Next.js 15 project with App Router, TypeScript, Tailwind CSS initialized and building
- [ ] **INFRA-02**: shadcn/ui configured with dark minimalist theme (dark background, neutral accents, clean typography)
- [ ] **INFRA-03**: Responsive layout with navigation linking to all module routes
- [ ] **INFRA-04**: Landing page (/) with cards for each module showing name, description, and status
- [ ] **INFRA-05**: Disclaimer footer: "Unofficial, not affiliated with Formula 1"

### Data Layer

- [ ] **DATA-01**: Jolpica API client (api.jolpi.ca) with request queuing respecting 4 req/s rate limit
- [ ] **DATA-02**: OpenF1 API client (api.openf1.org) with request queuing respecting 3 req/s rate limit
- [ ] **DATA-03**: TypeScript types for Jolpica responses (Driver, RaceResult, QualifyingResult, Standing, Season, Circuit)
- [ ] **DATA-04**: TypeScript types for OpenF1 responses (CarData, LapData, Position, TeamRadio, Weather)
- [ ] **DATA-05**: React Query provider with staleTime: 24h for historical data, refetchOnWindowFocus: false
- [ ] **DATA-06**: React Query hooks: useDrivers, useDriverResults, useQualifying, useStandings, useSeasons, useRaces
- [ ] **DATA-07**: Zod schemas for API response validation on critical endpoints

### Shared Components

- [ ] **COMP-01**: DriverSelect — autocomplete/search component for ~900 drivers with virtualized dropdown
- [ ] **COMP-02**: SeasonSelect — year picker from 1950 to current season
- [ ] **COMP-03**: RaceSelect — race picker filtered by selected season
- [ ] **COMP-04**: Loading skeletons and error states for all data-fetching components

### Utilities

- [ ] **UTIL-01**: Team color mapping (constructor ID → hex color) for all current and historical teams
- [ ] **UTIL-02**: Lap time formatter (milliseconds → mm:ss.SSS display)
- [ ] **UTIL-03**: Nationality to country flag emoji/icon mapping

### Head-to-Head Module

- [ ] **H2H-01**: Route /head-to-head with two DriverSelect components for choosing drivers to compare
- [ ] **H2H-02**: Comparison card showing stats side-by-side: wins, podiums, poles, titles, races, DNFs, career points
- [ ] **H2H-03**: Best value highlighted (green) in comparison card
- [ ] **H2H-04**: Line chart: points scored per season for both drivers (Recharts)
- [ ] **H2H-05**: Scatter plot: race finish positions over career (Y=position, X=race number)
- [ ] **H2H-06**: Bar chart: qualifying H2H when drivers were teammates in same season
- [ ] **H2H-07**: Shareable URLs: /head-to-head?d1=hamilton&d2=verstappen syncs with component state
- [ ] **H2H-08**: Responsive design: charts and comparison cards adapt to mobile screens
- [ ] **H2H-09**: Computed stats: average finish position, average grid position, DNF rate, points per race

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Quiz Module

- **QUIZ-01**: Procedurally generated questions from Jolpica API data
- **QUIZ-02**: Game modes: guess the driver, higher/lower, guess the race
- **QUIZ-03**: Score tracking with streaks and session best (localStorage)

### Additional Modules

- **RADIO-01**: Team radio catalog with search and filter by driver/team
- **HIST-01**: Interactive F1 historical timeline (1950-present)
- **WTHR-01**: Weather impact analysis correlating conditions with performance
- **TELE-01**: Telemetry visualizer for speed, throttle, brake data (2023+)
- **STRT-01**: Pit strategy simulator with what-if scenarios

### Enhanced Features

- **LIVE-01**: Live timing data via WebSocket/polling during race weekends
- **EXPORT-01**: Export charts as PNG/PDF for sharing

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User authentication / accounts | Pet project, no user management needed |
| Backend / database | All data from free APIs, cached client-side |
| Live betting integration | Legal complexity, reputational risk |
| Social features (comments, forums) | Moderation burden, off-brand for data tool |
| Video playback / highlights | Copyright issues with F1 media |
| Multi-sport expansion | Dilutes focus, different APIs |
| i18n / localization | English only for v1, F1 is inherently English |
| AI strategy simulator | Requires ML backend, too complex for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| DATA-06 | Phase 2 | Pending |
| DATA-07 | Phase 2 | Pending |
| COMP-01 | Phase 3 | Pending |
| COMP-02 | Phase 3 | Pending |
| COMP-03 | Phase 3 | Pending |
| COMP-04 | Phase 3 | Pending |
| UTIL-01 | Phase 3 | Pending |
| UTIL-02 | Phase 3 | Pending |
| UTIL-03 | Phase 3 | Pending |
| H2H-01 | Phase 4 | Pending |
| H2H-02 | Phase 4 | Pending |
| H2H-03 | Phase 4 | Pending |
| H2H-04 | Phase 4 | Pending |
| H2H-05 | Phase 4 | Pending |
| H2H-06 | Phase 4 | Pending |
| H2H-07 | Phase 4 | Pending |
| H2H-08 | Phase 4 | Pending |
| H2H-09 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-16*
*Last updated: 2026-02-16 after roadmap creation*
