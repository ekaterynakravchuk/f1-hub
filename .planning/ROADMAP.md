# Roadmap: F1 Hub

## Overview

This roadmap delivers a Formula 1 data visualization web application from foundation to first feature. Phase 1 establishes the Next.js project with UI infrastructure. Phase 2 builds the data layer connecting to Jolpica and OpenF1 APIs with rate-limited clients and React Query hooks. Phase 3 creates reusable components and utilities for driver selection, season selection, and data formatting. Phase 4 implements the Head-to-Head module where users can compare any two drivers side-by-side with interactive visualizations.

Phases 6–8 deliver the v1.1 Radio module: a browsable team radio catalog with audio playback and race context powered by the OpenF1 API (2023+ data).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Setup & Infrastructure** - Next.js 15 project with dark minimalist theme and responsive layout
- [ ] **Phase 2: Data Layer Foundation** - API clients, TypeScript types, React Query provider, and data hooks
- [ ] **Phase 3: Shared Components & Utilities** - Reusable selectors, loading states, and formatting helpers
- [ ] **Phase 4: Head-to-Head Module** - Complete driver comparison feature with charts and shareable URLs
- [ ] **Phase 5: Quiz Module** - Procedurally generated F1 trivia with game modes and score tracking
- [ ] **Phase 6: Radio Data Layer & Audio Hook** - OpenF1 radio endpoints, React Query hooks, timestamp correlation utility, and SSR-safe audio hook
- [ ] **Phase 7: Radio Catalog UI** - Session browser, chronological radio list with driver identity, sticky audio player, driver filter, and navigation wiring
- [ ] **Phase 8: Race Context Enrichment** - Lap number and driver position badges per radio message, Race Control event overlay and proximity indicators

## Phase Details

### Phase 1: Project Setup & Infrastructure
**Goal**: Users can navigate to a styled landing page that lists available modules
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. User can view a dark-themed landing page with clean typography and generous whitespace
  2. User can see cards for each planned module showing name and description
  3. User can navigate between pages using a responsive navigation menu that works on mobile and desktop
  4. User can see a disclaimer footer stating "Unofficial, not affiliated with Formula 1"
  5. Developer can run build process without errors using Next.js 15 with TypeScript and Tailwind CSS
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Initialize Next.js 15 project with shadcn/ui, TanStack Query, next-themes, and provider wiring
- [ ] 01-02-PLAN.md — Build landing page with responsive navigation, module cards, and disclaimer footer

### Phase 2: Data Layer Foundation
**Goal**: Application can fetch and cache F1 data from both APIs with proper rate limiting
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07
**Success Criteria** (what must be TRUE):
  1. Developer can import API client functions that respect Jolpica rate limits (4 req/s) and OpenF1 rate limits (3 req/s)
  2. Developer can use TypeScript types that match Jolpica response structure (Driver, RaceResult, QualifyingResult, Standing, Season, Circuit)
  3. Developer can use TypeScript types that match OpenF1 response structure (CarData, LapData, Position, TeamRadio, Weather)
  4. Developer can use React Query hooks (useDrivers, useDriverResults, useQualifying, useStandings, useSeasons, useRaces) that return cached data
  5. Application validates critical API responses using Zod schemas and handles validation errors gracefully
**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md — Rate-limited API clients (Jolpica + OpenF1), TypeScript types, Zod schemas, query key factory, QueryProvider retry config
- [ ] 02-02-PLAN.md — React Query hooks (useDrivers, useDriverResults, useQualifying, useStandings, useSeasons, useRaces) with endpoint functions

### Phase 3: Shared Components & Utilities
**Goal**: Developers can use reusable components and helpers that handle common F1 data patterns
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, UTIL-01, UTIL-02, UTIL-03
**Success Criteria** (what must be TRUE):
  1. User can search and select from approximately 900 F1 drivers using an autocomplete component with virtualized dropdown
  2. User can pick any season from 1950 to current year using a year picker component
  3. User can select a specific race from the chosen season using a race picker that filters by season
  4. User sees loading skeletons while data fetches and clear error messages when data fails to load
  5. Developer can apply team colors to visualizations using constructor ID to hex color mapping
  6. Developer can format lap times from milliseconds to readable mm:ss.SSS format
  7. Developer can display country flags or icons using nationality identifiers
**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — Install shadcn primitives, @tanstack/react-virtual, utility modules (team colors, lap time formatter, nationality flags), and loading/error components
- [ ] 03-02-PLAN.md — SeasonSelect, RaceSelect, and DriverSelect components with virtualization and single/multi-select modes

### Phase 4: Head-to-Head Module
**Goal**: Users can compare any two F1 drivers side-by-side with statistics and interactive visualizations
**Depends on**: Phase 3
**Requirements**: H2H-01, H2H-02, H2H-03, H2H-04, H2H-05, H2H-06, H2H-07, H2H-08, H2H-09
**Success Criteria** (what must be TRUE):
  1. User can select two drivers and see side-by-side comparison cards showing wins, podiums, poles, titles, races, DNFs, career points with best values highlighted in green
  2. User can view a line chart showing points scored per season for both selected drivers
  3. User can view a scatter plot showing race finish positions over each driver's career
  4. User can view a bar chart comparing qualifying performance when both drivers were teammates in the same season
  5. User can see computed statistics including average finish position, average grid position, DNF rate, and points per race
  6. User can share comparisons via URL (e.g., /head-to-head?d1=hamilton&d2=verstappen) that automatically loads the selected drivers
  7. User can view all comparison cards and charts on mobile devices with responsive layout
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Quiz Module
**Goal**: Users can play procedurally generated F1 trivia games with multiple modes and track their scores
**Depends on**: Phase 4
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03
**Success Criteria** (what must be TRUE):
  1. User can play "Guess the Driver" mode — given career stats, guess which driver it is from multiple choices
  2. User can play "Higher or Lower" mode — compare two drivers on a stat and guess which is higher
  3. User can play "Guess the Race" mode — given race details, guess the Grand Prix
  4. User can see their current score, streak, and session best score
  5. User can start a new game and scores persist during the browser session via localStorage
  6. Questions are procedurally generated from Jolpica API data, different each playthrough
  7. User can navigate to /quiz and select a game mode
**Plans:** 2 plans

Plans:
- [ ] 05-01-PLAN.md — useLocalStorage hook, Fisher-Yates shuffle utility, and 3 pure question generator functions (guess driver, higher/lower, guess race)
- [ ] 05-02-PLAN.md — QuizClient FSM with useReducer, ModeSelect, 3 game mode components, ScoreBoard, and /quiz page integration

### Phase 6: Radio Data Layer & Audio Hook
**Goal**: Developers can fetch all radio-related data from OpenF1, correlate timestamps to lap context, and safely instantiate audio in a Next.js SSR environment
**Depends on**: Phase 5
**Requirements**: RDATA-01, RDATA-02, RDATA-03, RDATA-04, RDATA-05
**Success Criteria** (what must be TRUE):
  1. Developer can import typed fetch functions for /team_radio, /race_control, /sessions, /meetings, /laps, and /position endpoints and receive correctly typed responses
  2. Developer can use six React Query hooks (useTeamRadio, useRaceControl, useOpenF1Sessions, useOpenF1Meetings, useDriverLaps, usePositions) all caching with staleTime: Infinity and scoped per-session query keys
  3. Developer can call correlateRadioContext(radio, laps, positions) and receive the nearest preceding lap number and driver position for each radio message via binary search
  4. Developer can use the useAudioPlayer hook in any Next.js page without triggering a build-time SSR crash, confirmed by a successful next build output
  5. A real team radio recording_url plays successfully from the deployed Vercel origin, confirming the F1 CDN does not block cross-origin audio playback
**Plans:** TBD

### Phase 7: Radio Catalog UI
**Goal**: Users can browse, filter, and listen to team radio recordings for any 2023+ session using a virtualized list and a sticky audio player
**Depends on**: Phase 6
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, AUDIO-01, AUDIO-02, AUDIO-03, RADIO-01, RADIO-02, NAV-01, NAV-02
**Success Criteria** (what must be TRUE):
  1. User can select a season (2023+), a race meeting, and a session type in sequence, with each selector appearing only after the previous selection is made
  2. User can filter the radio list to a single driver using pill toggles, and the list updates without re-fetching data from the API
  3. User can see a chronological list of all radio messages showing driver name and team color accent for each entry
  4. User can tap a radio card to start playback, tap again to pause, and see a seek bar and elapsed/total time in a sticky player that stays visible while scrolling
  5. User can navigate to /radio from both the site navigation menu and the landing page module card
**Plans:** TBD

### Phase 8: Race Context Enrichment
**Goal**: Users can see the lap number and driver position for each radio message, and see Race Control events overlaid on the radio timeline
**Depends on**: Phase 7
**Requirements**: RADIO-03, RADIO-04, RCTX-01, RCTX-02
**Success Criteria** (what must be TRUE):
  1. User can see the lap number when each radio message was sent, displayed as a badge on the radio card
  2. User can see the driver's race position (e.g., P3) when each radio message was sent, displayed as a badge on the radio card
  3. User can see Race Control events (Safety Car deployments, red flags, yellow flags, DRS enabled/disabled) displayed chronologically on the radio timeline
  4. User can see a proximity indicator on a radio card when a Race Control event occurred within 30 seconds of that transmission
**Plans:** TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & Infrastructure | 0/2 | Planned | - |
| 2. Data Layer Foundation | 0/2 | Planned | - |
| 3. Shared Components & Utilities | 0/2 | Planned | - |
| 4. Head-to-Head Module | 0/TBD | Not started | - |
| 5. Quiz Module | 0/2 | Planned | - |
| 6. Radio Data Layer & Audio Hook | 0/TBD | Not started | - |
| 7. Radio Catalog UI | 0/TBD | Not started | - |
| 8. Race Context Enrichment | 0/TBD | Not started | - |
