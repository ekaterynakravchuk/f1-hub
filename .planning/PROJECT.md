# F1 Hub

## What This Is

A web application for Formula 1 fans featuring interactive data analysis tools. A collection of modules on a single site: driver comparison (Head-to-Head), F1 quiz, team radio catalog, interactive F1 history, weather impact analysis, telemetry visualizer, and strategy simulator. Built as a portfolio/pet project with free open APIs.

## Core Value

Users can explore and compare F1 data interactively — any driver, any season, any stat — in one place with beautiful visualizations.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Next.js 15 project with App Router, TypeScript, Tailwind CSS, shadcn/ui
- [ ] Dark minimalist theme with clean typography, neutral accents, generous whitespace
- [ ] Landing page as hub with cards linking to each module
- [ ] Responsive navigation with links to all modules
- [ ] API clients for Jolpica (api.jolpi.ca) and OpenF1 (api.openf1.org) with rate limiting
- [ ] TypeScript types for both API responses (Driver, RaceResult, LapData, CarData, etc.)
- [ ] React Query provider with staleTime: Infinity for historical data
- [ ] React Query hooks: useDrivers, useRaceResults, useQualifying, useStandings
- [ ] Shared UI components: DriverSelect (autocomplete ~900 drivers), SeasonSelect, RaceSelect, Loader/Skeleton
- [ ] Utility helpers: team colors, lap time formatting, nationality flags
- [ ] Head-to-Head module (/head-to-head): compare two drivers side-by-side with stats and charts
- [ ] Shareable URLs for Head-to-Head (/head-to-head?d1=hamilton&d2=verstappen)
- [ ] Recharts visualizations: points by season, race results scatter, qualifying H2H bars
- [ ] Quiz module (/quiz): procedurally generated questions from API data
- [ ] Quiz modes: guess the driver, higher/lower, guess the race
- [ ] Disclaimer: "Unofficial, not affiliated with Formula 1"

### Out of Scope

- User authentication/accounts — pet project, no need for user management
- Backend/database — all data from APIs, cached client-side via React Query
- Real-time live timing — OpenF1 has live data but v1 focuses on historical analysis
- Mobile native app — web-first, responsive design only
- Monetization — non-commercial use of APIs
- i18n/localization — English only for v1

## Context

**Data sources:**
- **Jolpica API** (api.jolpi.ca) — Historical F1 data from 1950: results, qualifying, championships, drivers, constructors, circuits. Rate limit: 4 req/s, 500 req/hour. Successor to Ergast API.
- **OpenF1 API** (api.openf1.org) — Telemetry, pit stops, team radio, weather, positions, overtakes from 2023 onward. Rate limit: 3 req/s, 30 req/min.

**Caching strategy:** React Query with staleTime: Infinity for historical data (immutable). Short staleTime for current season data. No persistent cache (localStorage/server) — in-memory only.

**Design:** Dark minimalist — dark backgrounds, clean sans-serif typography, neutral/subtle accents, generous whitespace. Team colors used for data visualization only. No F1 branding colors — keep it neutral and elegant.

**Modules planned (7 total, 3 in v1.0):**
1. Head-to-Head — driver comparison (v1.0)
2. Quiz — procedural F1 trivia (v1.0)
3. Radio — team radio catalog (v1.1)
4. History — interactive F1 timeline (v1.1)
5. Weather — weather impact analysis (v1.2)
6. Telemetry — telemetry visualizer (v1.2)
7. Strategy — pit strategy simulator (v1.3)

## Constraints

- **Tech stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query v5, Recharts, D3.js — chosen, non-negotiable
- **Hosting**: Vercel — free tier, optimized for Next.js
- **API rate limits**: Jolpica 4 req/s / 500 req/hr, OpenF1 3 req/s / 30 req/min — must respect with client-side throttling
- **Data availability**: OpenF1 data only from 2023 — telemetry/radio features limited to recent seasons
- **No server-side state**: All data fetched client-side, no database, no server cache

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Query only (no localStorage/server cache) | Simplicity for pet project, historical data is immutable so in-memory cache with staleTime: Infinity is sufficient | — Pending |
| Client-side data fetching only | No backend needed, APIs are public and free, reduces infrastructure complexity | — Pending |
| Dark minimalist design (not F1 branded) | Portfolio piece — needs to look clean and professional, not like an F1 knockoff. Team colors for data viz only | — Pending |
| English only | F1 is inherently international/English, simplifies development | — Pending |
| shadcn/ui over other component libraries | Copy-paste components, full control, works well with Tailwind, good dark theme support | — Pending |

---
*Last updated: 2026-02-16 after initialization*
