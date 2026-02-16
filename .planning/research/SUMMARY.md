# Project Research Summary

**Project:** F1 Hub
**Domain:** F1 Data Visualization Web Application
**Researched:** 2026-02-16
**Confidence:** HIGH

## Executive Summary

F1 Hub is a client-side data visualization web application that combines historical F1 statistics (1950-present via Jolpica API) with modern telemetry data (2023+ via OpenF1 API). Expert developers in this domain build modular, performance-optimized Next.js applications using the App Router, server components for initial data, TanStack Query for client-side caching, and a mix of Recharts (for standard visualizations) and D3.js (for complex custom charts). The architecture emphasizes feature-scoped modules with shared services, avoiding tight coupling while maintaining consistency across visualization components.

The recommended approach is to build on Next.js 15.5.9 with React 19, TypeScript 5.5+, and Tailwind CSS 4.1, using shadcn/ui for UI primitives. The application should start with foundation-level infrastructure (API clients, data hooks, shared components) before building independent feature modules (Head-to-Head, Quiz, Telemetry, etc.). Each module operates independently but shares common data fetching hooks and UI components. This modular architecture allows parallel development once the foundation is established and makes features easy to add, remove, or refactor without affecting others.

Key risks include API rate limiting (Jolpica: 4 req/s; OpenF1: 3 req/s), chart performance degradation with large datasets (>1000 data points), data inconsistencies between overlapping APIs (2023-2024 data), and Next.js fetch caching conflicts with React Query. Mitigation strategies include implementing request queuing from day one, data sampling for charts, establishing data source priority (OpenF1 for 2023+, Jolpica for historical), and disabling Next.js fetch caching for client-side queries. The build order must prioritize the data layer foundation to avoid architectural retrofitting later.

## Key Findings

### Recommended Stack

F1 Hub should use modern, battle-tested technologies with proven patterns for data visualization applications. Next.js 15.5.9 (App Router) provides the framework foundation with React 19 for server components and improved TypeScript inference. Tailwind CSS 4.1 delivers 5-100x faster builds than v3 with modern CSS features. The visualization layer combines Recharts 3.7.0+ for standard charts (head-to-head, quiz results, weather impact) with D3.js 7.9.0 for complex custom visualizations (telemetry, strategy simulator). TanStack Query 5.90.21+ handles client-side data fetching with automatic request deduplication and caching.

**Core technologies:**
- **Next.js 15.5.9 + React 19:** Framework with App Router for route-based modules, Server Components for initial data loading, 40% faster page loads vs Pages Router
- **TypeScript 5.5+ (strict mode):** Type-safe development with improved React 19 type inference; essential for large codebase maintainability
- **Tailwind CSS 4.1 + shadcn/ui:** Utility-first styling with copy-paste UI components built on Radix UI primitives; industry standard for dark minimalist designs
- **TanStack Query 5.90.21+:** Async state management with automatic deduplication, suspense support, and built-in devtools; critical for API orchestration
- **Recharts 3.7.0+ / D3.js 7.9.0:** Declarative React charts for standard visualizations + low-level SVG manipulation for complex custom charts
- **Vitest + Playwright:** Unit testing (10-20x faster than Jest) and E2E testing for async Server Components
- **Zod:** Runtime validation bridging compile-time types and runtime API response validation
- **date-fns:** Functional, tree-shakeable date manipulation for race dates and session times
- **Vercel:** Zero-config deployment with automatic preview environments and global CDN

**What to avoid:**
- Moment.js (deprecated), CSS-in-JS (RSC incompatibility), Pages Router (legacy), Create React App (unmaintained), jQuery with React (DOM conflicts)

### Expected Features

Research reveals clear tiers of features based on competitor analysis and user expectations in the F1 analytics domain.

**Must have (table stakes):**
- **Historical data access (1950-present):** Every F1 platform provides comprehensive archives; users expect this as baseline
- **Driver/constructor standings and race results:** Core stats users check constantly during season
- **Dark mode with system preference detection:** 60% of users prefer dark mode; reduces eye strain by 80%; critical UX expectation in 2026
- **Mobile responsive design:** F1 fans check stats on phones during race weekends
- **Basic telemetry visualization:** Speed, throttle, brake charts differentiate from basic stats sites; table stakes for modern F1 apps
- **Lap comparison charts and tyre strategy:** Essential race narrative elements; standard across all competitors
- **Team color coding:** Visual consistency with F1 branding aids quick identification
- **Fast load times (<2s initial):** Data-heavy apps must optimize; users won't wait

**Should have (differentiators):**
- **Procedurally generated quiz from API data:** Unique feature vs static quizzes on PlanetF1/Sporcle; always fresh content using Jolpica data
- **Head-to-head with teammate context:** More insightful than all-time comparisons; Formula1points.com model
- **Weather impact analysis:** Correlate OpenF1 weather data with lap times; strategic insight demonstrated by Big Data F1 Weather Project
- **Fuel-corrected lap times:** TracingInsights feature; adds analytical depth by adjusting for fuel load
- **Interactive track map with mini-sectors:** Visual breakdown of performance zones; TracingInsights's 25 mini-sector model
- **Real-time race position evolution (animated):** Engaging storytelling from historical data; high engagement per F1-Visualization

**Defer (v2+):**
- **AI strategy simulator:** High complexity ML models (reinforcement learning); defer until data pipeline proven
- **Team radio searchable catalog:** Data sourcing needs validation; API availability unclear
- **Interactive F1 historical timeline:** Large UX effort better suited for dedicated module post-MVP
- **Live timing data:** High complexity WebSocket architecture; not essential for v1 (historical data provides value)
- **Era-normalized driver comparisons:** Complex statistical modeling; academic feature for later versions

**Anti-features (explicitly avoid):**
- Live betting, social features (comments/forums), real-time collaborative viewing, fantasy league management, video playback, cryptocurrency/NFT features

### Architecture Approach

The recommended architecture follows a feature-scoped modular pattern where each route module (Head-to-Head, Quiz, Radio, etc.) is independent with its own components and logic, but shares common services via a data fetching layer and UI component library. This creates clear boundaries that prevent tight coupling while maintaining consistency across the application.

**Major components:**
1. **Route Modules (app/):** Feature-specific pages using Next.js App Router with private `_components/` folders for module-specific UI; each module is independent
2. **Shared Components (components/):** Global UI elements (DriverSelect, SeasonSelect, shadcn/ui primitives, chart wrappers) used across multiple modules
3. **Data Fetching Layer (lib/hooks/):** Custom TanStack Query hooks per data domain (useDrivers, useRaces, useTelemetry) that encapsulate query keys and caching logic
4. **API Client Layer (lib/api/):** HTTP clients for Jolpica and OpenF1 with error handling and type safety, consumed by hooks layer
5. **Query Cache (TanStack Query):** Client-side data cache with automatic invalidation and request deduplication managed via QueryClientProvider

**Key architectural patterns:**
- **Feature-scoped modules with shared services:** Modules don't depend on each other but share hooks/components via well-defined interfaces
- **TanStack Query custom hooks:** Wrap useQuery in domain-specific hooks (useDrivers, useRaces) for consistent query keys and type safety
- **Composable selector components:** Reusable DriverSelect/SeasonSelect components handle their own data fetching with controlled interface
- **Client-only app with QueryClientProvider:** Since this is client-side only, wrap app in providers at root layout; mark interactive pages as client components
- **Recharts component wrappers:** Consistent theming and responsive behavior across all charts via shared wrapper components

**Critical anti-patterns to avoid:**
- Shared service layer with high fan-in (use custom hooks instead)
- Direct API calls in components (bypass TanStack Query cache)
- Collocating shared components in app/ route folders
- Inconsistent query keys (centralize in custom hooks)
- Over-engineering with Route Handlers for client-side-only app

### Critical Pitfalls

1. **Naive rate limit handling causes 429 cascades:** Jolpica (4 req/s, 500 req/hour) and OpenF1 (3 req/s, 30 req/min) rate limits are easily exceeded with "fetch all" approaches (900 drivers = 900 requests). Solution: Implement request queuing (bottleneck, p-queue), batch API calls using efficient endpoints, use pagination/limits, monitor request counts, and implement exponential backoff on 429s starting at 5s.

2. **Misunderstanding staleTime: Infinity leads to stale data:** Historical F1 data seems immutable but APIs correct errors and backfill data. With staleTime: Infinity, caches never update even when providers fix data. Solution: Use finite staleTime (24 hours), implement manual invalidation triggers, version cache keys with API update timestamps, and distinguish truly immutable data (pre-2020 verified seasons).

3. **Client-side fetching breaks Next.js App Router benefits:** Using useEffect + fetch or React Query in all Client Components negates streaming/SSR advantages, causing layout shifts and poor Lighthouse scores. Solution: Default to Server Components for data fetching, pass server data as initialData to React Query in Client Components, use Suspense boundaries, and set refetchOnMount: false for server-hydrated queries.

4. **Chart re-renders kill performance with large datasets:** Recharts/D3 re-render on every parent update when rendering thousands of data points (all race results for 900 drivers), causing 1-3 second freezes and memory leaks from uncleaned D3 listeners. Solution: Memoize data arrays and dataKey functions, wrap charts in React.memo, implement data sampling (LTTB algorithm) for >1000 points, clean up D3 listeners in useEffect cleanup.

5. **API data inconsistencies between Jolpica and OpenF1:** Overlapping 2023-2024 data has documented discrepancies (incorrect lap times in Jolpica vs Ergast), causing conflicting race results. Solution: Establish data source priority (OpenF1 for 2023+ telemetry, Jolpica for pre-2023 historical), implement data validation, monitor Jolpica GitHub issues for corrections, document data source per field.

6. **Next.js fetch caching conflicts with React Query:** Next.js 15 caches fetch() by default even in Client Components; React Query's invalidateQueries doesn't clear Next.js's fetch cache, causing persistent stale data. Solution: Add cache: 'no-store' to all API fetch calls, use router.refresh() after mutations, or set fetchCache: 'default-no-store' globally in next.config.js.

## Implications for Roadmap

Based on research, suggested phase structure that addresses dependencies and mitigates pitfalls:

### Phase 1: Data Layer Foundation
**Rationale:** All features depend on API integration, data fetching hooks, and caching infrastructure. Building this foundation first prevents architectural retrofitting and addresses critical pitfalls (rate limiting, fetch caching) before features depend on flawed patterns.

**Delivers:**
- Next.js 15 + TypeScript + Tailwind + shadcn/ui project structure
- API clients (jolpica.ts, openf1.ts) with rate limiting and error handling
- TanStack Query configuration with QueryClientProvider
- Core data hooks (useDrivers, useSeasons, useRaces, useTelemetry, useWeather)
- Request queuing to prevent rate limit cascades
- Fetch cache configuration (cache: 'no-store' pattern)

**Addresses (from FEATURES.md):**
- Fast load times (<2s) via proper caching strategy
- Foundation for all table stakes features (historical data, standings, results)

**Avoids (from PITFALLS.md):**
- Pitfall 1: Rate limit handling implemented from day one
- Pitfall 2: staleTime configuration established (24h for historical, 5min for recent)
- Pitfall 3: Server Component pattern for initial data loading
- Pitfall 5: Data source priority defined (OpenF1 for 2023+, Jolpica for historical)
- Pitfall 6: Next.js fetch cache disabled for client queries

### Phase 2: Shared Components & UI Infrastructure
**Rationale:** Selector components (DriverSelect, SeasonSelect, RaceSelect) and chart wrappers are dependencies for all feature modules. Build these before individual features to ensure consistency and prevent duplication.

**Delivers:**
- shadcn/ui primitives (Button, Card, Select, Input, Tabs)
- Composable selector components with data fetching
- Recharts wrapper components with theming and responsive behavior
- Layout components (Header, Navigation, Footer)
- Dark mode implementation with system preference detection

**Addresses (from FEATURES.md):**
- Dark mode (table stakes; 60% user preference)
- Team color coding (table stakes for visual consistency)
- Mobile responsive design (foundation for all modules)

**Uses (from STACK.md):**
- shadcn/ui + Radix UI for accessible primitives
- Tailwind CSS 4.1 for utility-first styling
- TanStack Query hooks for selector data fetching

**Avoids (from PITFALLS.md):**
- Pitfall 4: Chart wrappers implement memoization and performance patterns from start

### Phase 3: First Module - Head-to-Head Comparison
**Rationale:** Simplest module to validate architecture end-to-end. Uses only historical data (no complex telemetry), relies on shared selectors built in Phase 2, and demonstrates full data flow (API → hooks → cache → UI). Success here validates patterns for remaining modules.

**Delivers:**
- Head-to-head driver comparison page
- Comparison charts using Recharts wrappers
- Driver stats cards with teammate context
- Module-specific calculations (lib logic)

**Addresses (from FEATURES.md):**
- Head-to-head with context (differentiator vs competitors)
- Driver standings and results (table stakes)
- Lap comparison charts (table stakes)

**Implements (from ARCHITECTURE.md):**
- Feature-scoped module pattern (app/head-to-head with _components/)
- Custom hooks consumption (useDrivers, useRaces)
- Shared component usage (DriverSelect, SeasonSelect)

**Avoids (from PITFALLS.md):**
- Pitfall 4: Chart performance validated with teammate comparisons (<1000 points)
- Validates all Phase 1 pitfall mitigations work correctly

### Phase 4: Procedural Quiz Module
**Rationale:** Unique differentiator feature with moderate complexity. Depends on historical data hooks from Phase 1 but introduces new patterns (question generation algorithm, game state management). Independent from other modules, can be built in parallel with others.

**Delivers:**
- Procedural quiz generator using Jolpica data
- Question generation algorithm with difficulty scaling
- Quiz UI with lives system and scoring
- Dynamic trivia from real API data

**Addresses (from FEATURES.md):**
- Procedurally generated quiz (unique differentiator vs static competitors)
- Session filtering for quiz question variety
- Persistent user preferences (quiz settings, high scores)

**Uses (from STACK.md):**
- Zod for quiz configuration validation
- localStorage for high scores and preferences
- date-fns for historical date-based questions

### Phase 5: Basic Telemetry Visualization
**Rationale:** Introduces OpenF1 API integration and chart performance challenges. Telemetry data (2023+) is larger and more complex than historical stats. This phase must implement data sampling and performance optimizations before building more complex visualizations.

**Delivers:**
- Basic telemetry charts (speed, throttle, brake)
- OpenF1 API integration via useTelemetry hook
- Data sampling for large datasets (LTTB algorithm)
- Driver comparison overlays for same session

**Addresses (from FEATURES.md):**
- Basic telemetry visualization (table stakes for modern F1 app)
- Session filtering (Race/Quali/Practice)
- Tyre strategy visualization (table stakes)

**Uses (from STACK.md):**
- OpenF1 API for telemetry data (2023+)
- Recharts for standard telemetry line charts
- TanStack Query with 5min staleTime for recent data

**Avoids (from PITFALLS.md):**
- Pitfall 4: Implements data sampling for >1000 telemetry points
- Pitfall 5: Uses OpenF1 as primary for 2023+ data (establishes pattern)

### Phase 6: Weather Impact Analysis
**Rationale:** Introduces data correlation between APIs (OpenF1 weather + Jolpica lap times). Moderate complexity with clear value proposition. Can be built in parallel with other modules once Phase 1 foundation exists.

**Delivers:**
- Weather impact correlation visualizations
- Performance analysis by weather conditions
- Combined OpenF1weather + Jolpica lap time data
- Weather-adjusted performance metrics

**Addresses (from FEATURES.md):**
- Weather impact analysis (differentiator; strategic insight)
- Qualifying vs race pace split (weather affects differently)

**Uses (from STACK.md):**
- Multiple TanStack Query hooks (useWeather, useRaces)
- Data merging logic in module-specific lib/
- Recharts for correlation scatter plots

**Avoids (from PITFALLS.md):**
- Pitfall 5: Implements data validation when joining APIs

### Phase 7: Interactive History Timeline
**Rationale:** Complex UX effort best suited after core analytics modules proven. Uses historical data infrastructure from Phase 1 but requires significant UI/UX investment. Not on critical path for MVP validation.

**Delivers:**
- Chronological F1 history exploration UI
- Era milestones and championship narrative
- Interactive timeline component
- Educational historical context

**Addresses (from FEATURES.md):**
- Interactive F1 historical timeline (differentiator; educational + nostalgic)
- Year/season selector (enhanced version)

**Uses (from STACK.md):**
- date-fns for timeline date calculations
- Custom D3.js visualization for timeline
- Jolpica comprehensive historical data (1950+)

### Future Phases (v2+):
- **Live Timing Module:** High complexity WebSocket architecture; defer until v1 validated
- **AI Strategy Simulator:** ML models require compute infrastructure; defer until data pipeline proven
- **Team Radio Catalog:** Pending data source validation; API availability unclear
- **Advanced Telemetry (D3 custom):** Complex multi-series visualizations after basic telemetry proven

### Phase Ordering Rationale

- **Foundation first (Phase 1-2):** API clients, data hooks, and shared components are dependencies for all feature modules. Building these first prevents architectural retrofitting and addresses critical pitfalls before features depend on flawed patterns.

- **Validation before scale (Phase 3):** Head-to-Head is the simplest module using only historical data. Success here validates the entire architecture (API → hooks → cache → UI) before building more complex modules.

- **Complexity escalation (Phase 4-6):** Quiz adds algorithmic complexity, Telemetry adds performance challenges, Weather adds multi-API correlation. Each phase introduces one new complexity dimension while building on established patterns.

- **Parallel development after Phase 2:** Once foundation exists, modules are independent. Phases 4-6 can be built simultaneously by different developers since they don't depend on each other.

- **Defer infrastructure-heavy features:** Live timing (WebSocket), AI simulator (ML compute), and team radio (data sourcing) require significant infrastructure investment. Better to validate core value proposition first.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 5 (Telemetry):** Data sampling algorithms (LTTB vs simple interval), OpenF1 API session_key structure, optimal chart rendering for 10K+ points
- **Phase 7 (Timeline):** D3.js timeline visualization patterns, best practices for chronological UI at decade scale, accessibility for complex interactive timelines
- **Future: AI Strategy Simulator:** Reinforcement learning model architectures for pit strategy, training data requirements, feasibility of client-side inference

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** TanStack Query + Next.js integration well-documented in official docs
- **Phase 2 (Components):** shadcn/ui patterns are standardized with copy-paste implementations
- **Phase 3 (Head-to-Head):** Standard comparison visualizations; well-documented Recharts patterns
- **Phase 4 (Quiz):** Game state management is standard React pattern; algorithm logic straightforward

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies verified with official docs, package versions confirmed via GitHub releases. Next.js 15, React 19, TanStack Query v5, Tailwind v4 patterns well-documented. |
| Features | MEDIUM | Based on competitor analysis via web search; table stakes vs differentiators identified through 10+ competitor platforms. API availability verified (Jolpica, OpenF1) but feature priority reflects inference from competitive positioning. |
| Architecture | HIGH | Next.js App Router patterns from official docs, TanStack Query integration patterns from official guides, modular architecture validated by multiple architectural pattern sources. Feature-scoped modules are industry best practice. |
| Pitfalls | MEDIUM-HIGH | Rate limiting documented in official API docs (HIGH). React Query caching pitfalls documented by maintainers (HIGH). Chart performance and data inconsistencies based on community reports and GitHub issues (MEDIUM). Next.js fetch caching from official Vercel guidance (HIGH). |

**Overall confidence:** HIGH

The stack and architecture are verified with official sources. Features are inferred from competitor analysis but API capabilities are confirmed. Pitfalls are documented in official sources (rate limits, fetch caching) or community-validated (chart performance, data inconsistencies). The recommended approach is sound and well-supported by research.

### Gaps to Address

**API data corrections timeline:** Research identified that Jolpica has documented data inconsistencies and ongoing corrections. During implementation, monitor [Jolpica GitHub issues](https://github.com/jolpica/jolpica-f1/issues) for data correction announcements and implement cache invalidation strategy accordingly. Consider implementing a "last verified" timestamp per data domain.

**OpenF1 session_key structure:** While OpenF1 API is documented, the exact structure for correlating sessions across endpoints (telemetry, weather, positions) needs validation during Phase 5 (Telemetry) implementation. Research confirmed the API exists but detailed integration patterns need hands-on validation.

**Data sampling algorithm selection:** Research identified LTTB (Largest Triangle Three Buckets) as the algorithm for downsampling chart data, but threshold values and performance characteristics need validation with actual F1 telemetry datasets. Phase 5 should include performance testing with 10K+ point datasets to tune sampling parameters.

**Team radio data source:** Research found multiple platforms (F1 Radio Replay, Formula Live Pulse) with team radio archives but no clear public API. This feature (deferred to v2+) needs data source validation before planning. May require manual aggregation or partnership discussions.

**Dark mode color palette for charts:** While dark mode is table stakes, research didn't identify F1-specific color palette guidelines for dark themes. Phase 2 should research F1 official brand colors and validate contrast ratios for accessibility in dark mode, especially for team color coding.

## Sources

### PRIMARY (HIGH confidence - official docs)

**Stack & Technology:**
- [Next.js 15 Official Release](https://nextjs.org/blog/next-15) — React 19 support, Turbopack, App Router features
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — Official folder organization
- [Next.js Data Fetching Guide](https://nextjs.org/docs/app/getting-started/fetching-data) — Server Component patterns
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — Performance improvements, breaking changes
- [TanStack Query v5 Announcement](https://tanstack.com/blog/announcing-tanstack-query-v5) — v5 features, gcTime rename
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) — February 2026 unified Radix package
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — TypeScript requirements
- [Zod Official Documentation](https://zod.dev/) — Runtime validation API
- [Vitest Next.js Guide](https://nextjs.org/docs/app/guides/testing/vitest) — Official integration

**APIs:**
- [Jolpica F1 API Rate Limits](https://github.com/jolpica/jolpica-f1/blob/main/docs/rate_limits.md) — 4 req/s, 500 req/hour limits
- [OpenF1 API Documentation](https://openf1.org/) — Live timing and telemetry endpoints
- [Jolpica Data Correction: Incorrect lap times](https://github.com/jolpica/jolpica-f1/issues/103) — Documented inconsistencies

**Pitfalls:**
- [Common mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — Official Vercel guidance
- [React Query: staleTime vs cacheTime Discussion](https://github.com/TanStack/query/discussions/1685) — Maintainer clarifications
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/) — Official optimization docs

### SECONDARY (MEDIUM confidence - community patterns)

**Architecture:**
- [The Ultimate Next.js App Router Architecture](https://feature-sliced.design/blog/nextjs-app-router-guide) — Feature-sliced design patterns
- [Building a Fully Hydrated SSR App with Next.js App Router and TanStack Query](https://sangwin.medium.com/building-a-fully-hydrated-ssr-app-with-next-js-app-router-and-tanstack-query-5970aaf822d2) — Integration patterns
- [Building the Future of Scalable Applications In NextJS](https://medium.com/@priyanklad52/building-the-future-of-scalable-applications-in-nextjs-a-modular-approach-to-architecture-89d811231f81) — Modular architecture approach

**Features & Competitors:**
- [MultiViewer](https://multiviewer.app) — Live timing platform
- [TracingInsights](https://tracinginsights.com) — Mini-sectors, fuel correction
- [F1Stats.app](https://www.f1stats.app) — Historical visualizations
- [Formula1points.com](https://www.formula1points.com/head-to-head) — Driver comparisons
- [RaceMate Tyre Strategy Simulator](https://racemate.io/tyre-strategy-simulator/) — Interactive pit strategy
- [Big Data F1 Weather Project](https://medium.com/@marchaland.paul/%EF%B8%8F-big-data-f1-weather-project-analyzing-the-impact-of-weather-conditions-on-formula-1-d8f28a646446) — Weather impact methodology

**Pitfalls:**
- [Pitfalls of React Query](https://nickb.dev/blog/pitfalls-of-react-query/) — StaleTime issues
- [App Router pitfalls](https://imidef.com/en/2026-02-11-app-router-pitfalls) — Practical examples
- [Recharts Large Dataset Issues](https://github.com/recharts/recharts/issues/1146) — Community performance reports
- [Jolpica Discussion: How to prevent HTTP 429](https://github.com/jolpica/jolpica-f1/discussions/80) — Rate limit best practices

**UX Research:**
- [Data Visualization UX Best Practices](https://www.designstudiouiux.com/blog/data-visualization-ux-best-practices/) — Dark mode adoption (60%)
- [Dark Mode in Data Visualisation](https://careers.expediagroup.com/blog/dark-mode-in-data-visualisation-should-we-turn-the-lights-out/) — Eye strain reduction

### TERTIARY (Package versions from releases)
- [Next.js Releases](https://github.com/vercel/next.js/releases) — v15.5.9 confirmed
- [TanStack Query Releases](https://github.com/tanstack/query/releases) — v5.90.21 latest
- [Recharts GitHub](https://github.com/recharts/recharts) — v3.7.0 latest
- [D3.js Releases](https://github.com/d3/d3/releases) — v7.9.0 latest

---
*Research completed: 2026-02-16*
*Ready for roadmap: yes*
