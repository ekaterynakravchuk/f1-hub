# Requirements: F1 Hub

**Defined:** 2026-02-16
**Core Value:** Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.

## v1.0 Requirements (Complete)

### Infrastructure

- [x] **INFRA-01**: Next.js project with App Router, TypeScript, Tailwind CSS initialized and building
- [x] **INFRA-02**: shadcn/ui configured with dark minimalist theme
- [x] **INFRA-03**: Responsive layout with navigation linking to all module routes
- [x] **INFRA-04**: Landing page (/) with cards for each module
- [x] **INFRA-05**: Disclaimer footer: "Unofficial, not affiliated with Formula 1"

### Data Layer

- [x] **DATA-01**: Jolpica API client with request queuing respecting 4 req/s rate limit
- [x] **DATA-02**: OpenF1 API client with request queuing respecting 3 req/s rate limit
- [x] **DATA-03**: TypeScript types for Jolpica responses
- [x] **DATA-04**: TypeScript types for OpenF1 responses
- [x] **DATA-05**: React Query provider with staleTime: Infinity for historical data
- [x] **DATA-06**: React Query hooks: useDrivers, useDriverResults, useQualifying, useStandings, useSeasons, useRaces
- [x] **DATA-07**: Zod schemas for API response validation on critical endpoints

### Shared Components

- [x] **COMP-01**: DriverSelect — autocomplete/search component with virtualized dropdown
- [x] **COMP-02**: SeasonSelect — year picker from 1950 to current season
- [x] **COMP-03**: RaceSelect — race picker filtered by selected season
- [x] **COMP-04**: Loading skeletons and error states for all data-fetching components

### Utilities

- [x] **UTIL-01**: Team color mapping (constructor ID to hex color)
- [x] **UTIL-02**: Lap time formatter (milliseconds to mm:ss.SSS display)
- [x] **UTIL-03**: Nationality to country flag emoji/icon mapping

### Head-to-Head Module

- [x] **H2H-01**: Route /head-to-head with two DriverSelect components
- [x] **H2H-02**: Comparison card showing stats side-by-side
- [x] **H2H-03**: Best value highlighted (green) in comparison card
- [x] **H2H-04**: Line chart: points scored per season for both drivers
- [x] **H2H-05**: Scatter plot: race finish positions over career
- [x] **H2H-06**: Bar chart: qualifying H2H when drivers were teammates
- [x] **H2H-07**: Shareable URLs: /head-to-head?d1=hamilton&d2=verstappen
- [x] **H2H-08**: Responsive design: charts and comparison cards adapt to mobile
- [x] **H2H-09**: Computed stats: average finish, average grid, DNF rate, points per race

### Quiz Module

- [x] **QUIZ-01**: Procedurally generated questions from Jolpica API data
- [x] **QUIZ-02**: Game modes: guess the driver, higher/lower, guess the race
- [x] **QUIZ-03**: Score tracking with streaks and session best (localStorage)

## v1.1 Requirements

Requirements for the Radio module. Each maps to roadmap phases.

### Radio Data Layer

- [ ] **RDATA-01**: Developer can fetch team radio recordings from OpenF1 /team_radio endpoint with TypeScript types
- [ ] **RDATA-02**: Developer can fetch Race Control events from OpenF1 /race_control endpoint with TypeScript types
- [ ] **RDATA-03**: Developer can fetch session and meeting lists from OpenF1 /sessions and /meetings endpoints
- [ ] **RDATA-04**: Developer can use React Query hooks (useTeamRadio, useRaceControl, useOpenF1Sessions, useOpenF1Meetings, useDriverLaps, usePositions) with staleTime: Infinity
- [ ] **RDATA-05**: Developer can correlate radio message timestamps to lap numbers and driver positions using binary search utility

### Session Browsing

- [ ] **SESS-01**: User can select a season year (2023+) to browse available races
- [ ] **SESS-02**: User can select a specific race (meeting) from the chosen season
- [ ] **SESS-03**: User can select a session type (Race, Qualifying, Sprint, Practice) for the chosen race
- [ ] **SESS-04**: User can filter radio messages by a specific driver within the selected session

### Audio Playback

- [ ] **AUDIO-01**: User can play and pause team radio recordings using an audio player
- [ ] **AUDIO-02**: User can seek/scrub through a radio recording using a progress slider
- [ ] **AUDIO-03**: User can continue scrolling the radio list while a sticky audio player remains visible and playing

### Radio Catalog

- [ ] **RADIO-01**: User can see a chronological list of all radio messages for the selected session (or filtered by driver)
- [ ] **RADIO-02**: User can see driver name and team color for each radio message
- [ ] **RADIO-03**: User can see the lap number when each radio message was sent
- [ ] **RADIO-04**: User can see the driver's race position when each radio message was sent

### Race Context

- [ ] **RCTX-01**: User can see Race Control events (Safety Car, red/yellow flags, incidents) overlaid on the radio timeline
- [ ] **RCTX-02**: User can see which Race Control event occurred near a radio message (proximity indicator)

### Navigation

- [ ] **NAV-01**: User can navigate to /radio from the landing page via a module card
- [ ] **NAV-02**: User can navigate to /radio from the site navigation menu

## v2 Requirements (Future)

### Radio Community Features

- **COMM-01**: User can tag radio messages (funny, angry, strategic, celebration)
- **COMM-02**: User can vote for best radio moments
- **COMM-03**: User can see top-voted radio moments per season
- **COMM-04**: User can see a "Radio of the Day" featured moment

### Radio Enhanced Playback

- **PLAY-01**: User can adjust playback speed (0.5x, 1x, 1.5x, 2x)
- **PLAY-02**: User can see audio waveform visualization during playback

### Radio Search

- **SRCH-01**: User can search radio messages by transcript text (requires AI transcription)

### Additional Modules

- **HIST-01**: Interactive F1 historical timeline (1950-present)
- **WTHR-01**: Weather impact analysis correlating conditions with performance
- **TELE-01**: Telemetry visualizer for speed, throttle, brake data (2023+)
- **STRT-01**: Pit strategy simulator with what-if scenarios

### Enhanced Features

- **LIVE-01**: Live timing data via WebSocket/polling during race weekends
- **EXPORT-01**: Export charts as PNG/PDF for sharing

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication / accounts | Pet project, no user management needed |
| Backend / database | All data from free APIs, cached client-side |
| Radio tags/voting | Requires Supabase backend, deferred to future |
| Radio of the Day | Requires backend curation logic |
| Audio transcription/search | Requires AI transcription service, no budget |
| Live radio streaming | Requires paid OpenF1 API tier for real-time data |
| Waveform visualization | Requires Web Audio API + CORS headers from F1 CDN — unconfirmed |
| Playback speed control | Low priority for v1.1, deferred to v2 |
| Video playback / highlights | Copyright issues with F1 media |
| Multi-sport expansion | Dilutes focus, different APIs |
| i18n / localization | English only, F1 is inherently English |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| DATA-01 | Phase 2 | Complete |
| DATA-02 | Phase 2 | Complete |
| DATA-03 | Phase 2 | Complete |
| DATA-04 | Phase 2 | Complete |
| DATA-05 | Phase 2 | Complete |
| DATA-06 | Phase 2 | Complete |
| DATA-07 | Phase 2 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| UTIL-01 | Phase 3 | Complete |
| UTIL-02 | Phase 3 | Complete |
| UTIL-03 | Phase 3 | Complete |
| H2H-01 | Phase 4 | Complete |
| H2H-02 | Phase 4 | Complete |
| H2H-03 | Phase 4 | Complete |
| H2H-04 | Phase 4 | Complete |
| H2H-05 | Phase 4 | Complete |
| H2H-06 | Phase 4 | Complete |
| H2H-07 | Phase 4 | Complete |
| H2H-08 | Phase 4 | Complete |
| H2H-09 | Phase 4 | Complete |
| QUIZ-01 | Phase 5 | Complete |
| QUIZ-02 | Phase 5 | Complete |
| QUIZ-03 | Phase 5 | Complete |

### v1.1 (Current)

| Requirement | Phase | Status |
|-------------|-------|--------|
| RDATA-01 | — | Pending |
| RDATA-02 | — | Pending |
| RDATA-03 | — | Pending |
| RDATA-04 | — | Pending |
| RDATA-05 | — | Pending |
| SESS-01 | — | Pending |
| SESS-02 | — | Pending |
| SESS-03 | — | Pending |
| SESS-04 | — | Pending |
| AUDIO-01 | — | Pending |
| AUDIO-02 | — | Pending |
| AUDIO-03 | — | Pending |
| RADIO-01 | — | Pending |
| RADIO-02 | — | Pending |
| RADIO-03 | — | Pending |
| RADIO-04 | — | Pending |
| RCTX-01 | — | Pending |
| RCTX-02 | — | Pending |
| NAV-01 | — | Pending |
| NAV-02 | — | Pending |

**Coverage:**
- v1.0 requirements: 31 total (31 complete)
- v1.1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 20

---
*Requirements defined: 2026-02-16*
*Last updated: 2026-02-19 after milestone v1.1 requirements definition*
