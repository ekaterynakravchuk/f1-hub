# Roadmap: F1 Hub

## Overview

This roadmap delivers a Formula 1 data visualization web application from foundation to first feature. Phase 1 establishes the Next.js project with UI infrastructure. Phase 2 builds the data layer connecting to Jolpica and OpenF1 APIs with rate-limited clients and React Query hooks. Phase 3 creates reusable components and utilities for driver selection, season selection, and data formatting. Phase 4 implements the Head-to-Head module where users can compare any two drivers side-by-side with interactive visualizations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Setup & Infrastructure** - Next.js 15 project with dark minimalist theme and responsive layout
- [ ] **Phase 2: Data Layer Foundation** - API clients, TypeScript types, React Query provider, and data hooks
- [ ] **Phase 3: Shared Components & Utilities** - Reusable selectors, loading states, and formatting helpers
- [ ] **Phase 4: Head-to-Head Module** - Complete driver comparison feature with charts and shareable URLs

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

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & Infrastructure | 0/2 | Planned | - |
| 2. Data Layer Foundation | 0/2 | Planned | - |
| 3. Shared Components & Utilities | 0/2 | Planned | - |
| 4. Head-to-Head Module | 0/TBD | Not started | - |
