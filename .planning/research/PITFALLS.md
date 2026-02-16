# Pitfalls Research

**Domain:** F1 Data Visualization Web Application
**Researched:** 2026-02-16
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Naive Rate Limit Handling Causes 429 Cascades

**What goes wrong:**
Applications hit rate limits (Jolpica: 4 req/s, 500 req/hour; OpenF1: 3 req/s, 30 req/min) and either fail silently or retry aggressively, triggering longer blocks. With ~900 drivers in the dataset, naive "fetch all" approaches exceed hourly limits within minutes, especially when users navigate between pages or components remount.

**Why it happens:**
Developers underestimate the cumulative request volume. For example, fetching individual driver results for all 900 drivers = 900 requests, exceeding Jolpica's hourly limit. React Query's default retry behavior (3 retries with exponential backoff) compounds the problem when rate limits are hit, as failed requests retry immediately on component remount.

**How to avoid:**
1. **Batch API calls using efficient endpoints:** Use `2024/drivers/hamilton/results.json` (1 request) instead of querying each round individually (23+ requests for a season)
2. **Implement request queuing:** Use a rate limiter library (e.g., bottleneck, p-queue) to enforce 3 req/s max for OpenF1, 4 req/s for Jolpica
3. **Use pagination/limits:** Jolpica supports `?limit=100&offset=0` for batch retrieval
4. **Monitor request counts:** Track requests per second and per hour in client-side state
5. **Exponential backoff on 429:** Detect HTTP 429 responses and implement increasing delays (start at 5s, double each retry, max 60s)

**Warning signs:**
- Console errors with "429 Too Many Requests"
- Multiple rapid retries visible in Network tab
- Users reporting "data not loading" intermittently
- Request count approaching 500 within first hour of testing
- Components making identical API calls on each render

**Phase to address:**
Phase 1 (Data Layer Foundation) - Implement request queuing and batching strategy before building UI components that trigger multiple fetches.

---

### Pitfall 2: Misunderstanding `staleTime: Infinity` Leads to Stale Data After Corrections

**What goes wrong:**
Historical F1 data rarely changes, so setting `staleTime: Infinity` seems correct. However, Jolpica has documented data inconsistencies (e.g., incorrect lap times in 2024 races vs Ergast). When API providers fix data, client caches never update because React Query considers the data "fresh forever." Users see outdated race results, incorrect lap times, or missing driver stats indefinitely.

**Why it happens:**
Developers conflate "historical data" with "immutable data." F1 APIs correct errors, update missing data, and backfill telemetry. With `staleTime: Infinity`, React Query never refetches unless explicitly invalidated. The cache persists across sessions if using persistence plugins, compounding the staleness.

**How to avoid:**
1. **Use aggressive but finite staleTime:** Set `staleTime: 1000 * 60 * 60 * 24` (24 hours) instead of Infinity
2. **Implement manual invalidation triggers:** Provide a "Refresh Data" button that calls `queryClient.invalidateQueries(['drivers'])`
3. **Version cache keys:** Include API update timestamps in query keys: `['drivers', '2024', lastUpdated]`
4. **Monitor for data corrections:** Track Jolpica GitHub issues for data correction announcements and invalidate affected queries
5. **Set reasonable gcTime (formerly cacheTime):** Use `gcTime: 1000 * 60 * 60` (1 hour) so inactive queries are eventually garbage collected
6. **Distinguish truly immutable data:** Only use `staleTime: Infinity` for data that mathematically cannot change (e.g., race results from 1950 after verification period ends)

**Warning signs:**
- Users reporting different data than official F1 records
- Bug reports with "data doesn't match [official source]"
- Lap times differing from Ergast/official timing
- Data inconsistencies between app and F1 website
- Cache size growing unbounded in browser DevTools
- Multiple observers with different staleTime values causing unpredictable refetch behavior

**Phase to address:**
Phase 1 (Data Layer Foundation) - Establish caching strategy with proper staleTime/gcTime before implementing features.

---

### Pitfall 3: Client-Side Fetching in Next.js 15 App Router Breaks Streaming & SSR Benefits

**What goes wrong:**
Developers use `useEffect` + `fetch` or React Query in Client Components marked with `'use client'`, negating Next.js App Router's performance advantages. Data fetches happen after hydration, causing layout shifts, delayed rendering, and poor Lighthouse scores. For a driver comparison page, this means showing skeleton loaders for seconds while fetching ~900 driver records client-side, when the data could have been server-rendered.

**Why it happens:**
Migration patterns from Pages Router or React SPA habits carry over. Developers don't realize Server Components can fetch data directly without Route Handlers. React Query's documentation primarily shows client-side examples, leading developers to reflexively add `'use client'` to components that fetch data.

**How to avoid:**
1. **Default to Server Components:** Fetch data in Server Components unless interactivity requires client-side (filters, real-time updates)
2. **Use Server Actions for mutations:** Call Server Actions directly from Client Components instead of creating API Route Handlers
3. **Hydrate with initial data:** Pass server-fetched data as `initialData` to React Query in Client Components:
   ```typescript
   const { data } = useQuery({
     queryKey: ['drivers'],
     queryFn: fetchDrivers,
     initialData: serverDrivers, // from Server Component
     staleTime: 1000 * 60 * 60
   })
   ```
4. **Avoid refetch on mount before hydration:** Set `refetchOnMount: false` for server-hydrated queries to prevent double-fetching
5. **Use Suspense boundaries:** Wrap async Server Components in `<Suspense>` for progressive rendering

**Warning signs:**
- Waterfall of client-side fetches in Network tab after page load
- Content appearing after 1-2s delay (post-hydration)
- Lighthouse Performance score < 80
- "Cumulative Layout Shift" warnings in DevTools
- Creating `/api/drivers` Route Handlers for simple data fetching
- Every data-fetching component starts with `'use client'`

**Phase to address:**
Phase 1 (Data Layer Foundation) - Establish Server Component pattern for initial data loading, transition to Client Components only for interactive features in later phases.

---

### Pitfall 4: Chart Re-renders Kill Performance with Large Datasets

**What goes wrong:**
Recharts or D3.js charts re-render on every parent component update when rendering thousands of data points (e.g., all race results for 900 drivers = tens of thousands of rows). Each re-render recalculates scales, axes, and data points. With filters or state changes, the UI becomes unresponsive, causing 1-3 second freezes. Memory leaks occur if D3 event listeners aren't cleaned up on unmount.

**Why it happens:**
Chart components receive new object/function references as props on each render. Without `useMemo`/`useCallback`, React treats props as changed, triggering full chart re-renders. Recharts internally uses D3, and for datasets >10,000 points, DOM manipulation becomes expensive. D3's data binding keeps references to old data in `__on` properties, causing memory leaks. Developers don't realize that passing `dataKey` as an inline function forces Recharts to recalculate all points.

**How to avoid:**
1. **Memoize data arrays:** Wrap filtered/processed data in `useMemo`:
   ```typescript
   const chartData = useMemo(() =>
     drivers.filter(d => d.year === selectedYear)
   , [drivers, selectedYear])
   ```
2. **Memoize dataKey functions:** Use `useCallback` for dataKey props:
   ```typescript
   const getPosition = useCallback((d) => d.position, [])
   ```
3. **Wrap charts in React.memo:** Prevent unnecessary re-renders when parent updates unrelated state
4. **Implement data sampling:** For >1000 points, use downsampling (LTTB algorithm) to reduce visual data while maintaining shape
5. **Clean up D3 listeners:** In `useEffect` cleanup, remove all event listeners and transitions:
   ```typescript
   useEffect(() => {
     const svg = d3.select(svgRef.current)
     // ... D3 setup
     return () => {
       svg.selectAll('*').remove()
       svg.on('.', null) // Remove all listeners
     }
   }, [data])
   ```
6. **Use Recharts v2.10+:** Includes performance optimizations for large datasets and axis tick measurements

**Warning signs:**
- UI freezes when changing filters or year selection
- Browser DevTools showing "Long Task" warnings >50ms
- Memory usage increasing on each chart render/unmount
- Frame rate dropping below 30fps during interactions
- Network tab showing chart renders blocking API calls
- React DevTools Profiler showing chart component render times >100ms

**Phase to address:**
Phase 2 (Visualization Layer) - Establish performance patterns before building complex multi-chart dashboards. Implement data sampling early.

---

### Pitfall 5: API Data Inconsistencies Between Jolpica and OpenF1 Cause Data Integrity Issues

**What goes wrong:**
Jolpica (historical data since 1950) and OpenF1 (telemetry from 2023+) have overlapping data for 2023-2024, but with documented inconsistencies (e.g., incorrect lap times in Jolpica vs Ergast). Applications displaying mixed data show conflicting race results, lap times, or driver positions for the same race. Database schema differences between Ergast (Jolpica's predecessor) and Jolpica's evolving model cause breaking changes in data structure.

**Why it happens:**
Jolpica is transitioning from Ergast's database model to a new structure, causing temporary data quality issues. OpenF1 sources data differently (official F1 live timing) than Jolpica (historical records), leading to reconciliation gaps. Developers assume "same race = same data" without validating cross-API consistency. No single source of truth exists for 2023-2024 data.

**How to avoid:**
1. **Establish data source priority:** Use OpenF1 as primary for 2023+ telemetry, Jolpica for pre-2023 historical data
2. **Version API responses:** Track which API version returned cached data, invalidate on API updates
3. **Implement data validation:** Cross-check critical data (race winners, lap times) between APIs and flag discrepancies
4. **Monitor Jolpica GitHub issues:** Subscribe to data correction issues (https://github.com/jolpica/jolpica-f1/issues) and invalidate affected caches
5. **Use conservative data joins:** When combining APIs, prefer OpenF1 for overlapping periods and clearly indicate data source in UI
6. **Document data source per field:** Track which API populated each data field for debugging inconsistencies
7. **Set up data reconciliation jobs:** Periodically compare overlapping data and log discrepancies

**Warning signs:**
- Different lap times shown for same driver/lap when comparing views
- Race results not matching official F1 records
- Telemetry gaps for recent races where both APIs should have data
- User bug reports with "data doesn't match [official source]"
- Breaking changes in API responses after Jolpica updates
- Null/undefined values in fields that should be populated

**Phase to address:**
Phase 1 (Data Layer Foundation) - Define data source strategy and validation logic before building dependent features.

---

### Pitfall 6: Forgetting to Disable Next.js Fetch Caching for Client-Side React Query

**What goes wrong:**
Next.js 15 App Router caches `fetch()` requests by default, even in Client Components. When React Query makes client-side fetches, Next.js caches them indefinitely. React Query's cache invalidation doesn't clear Next.js's fetch cache, causing stale data to persist across component remounts, page navigations, and even hard refreshes. Users see outdated race results despite React Query showing "refetching."

**Why it happens:**
Next.js extends the global `fetch()` API with default caching (`force-cache`). Developers don't realize this affects client-side fetches, not just Server Components. React Query's `queryClient.invalidateQueries()` only clears its own cache, leaving Next.js's fetch cache untouched. This creates two layers of caching that work against each other.

**How to avoid:**
1. **Disable fetch caching for dynamic data:** Add `cache: 'no-store'` to all API fetch calls:
   ```typescript
   const response = await fetch(url, { cache: 'no-store' })
   ```
2. **Use revalidate tags:** For Server Components, use `next.revalidate` instead of manual cache control
3. **Configure React Query fetch function:** Wrap fetch with no-cache default:
   ```typescript
   const queryFn = async () => {
     const res = await fetch(url, { cache: 'no-store' })
     return res.json()
   }
   ```
4. **Use Router cache revalidation:** Call `router.refresh()` after mutations to clear Next.js router cache
5. **Opt out globally if needed:** In `next.config.js`, set `fetchCache: 'default-no-store'` for app-wide no-cache default

**Warning signs:**
- Data not updating after `queryClient.invalidateQueries()`
- Seeing old data immediately after hard refresh
- Network tab not showing requests React Query claims to be making
- Race conditions where some components show new data, others show old
- Cache invalidation working in development but not production
- Stale data persisting across full page reloads

**Phase to address:**
Phase 1 (Data Layer Foundation) - Configure fetch caching behavior before implementing React Query integration.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fetching all 900 drivers at once | Simple implementation, single request | Exceeds rate limits, slow initial load, memory issues | Never - always paginate or filter |
| Using `staleTime: Infinity` without invalidation strategy | Minimal API calls, faster perceived performance | Permanently stale data, no way to fix corrections | Only for verified immutable data (pre-2020 seasons after validation) |
| Client-side fetching in all components | Familiar React patterns, easier debugging | Poor performance, SEO issues, high server costs | Never in App Router - use Server Components |
| Inline functions for chart dataKey props | Cleaner JSX, less boilerplate | Every parent render triggers full chart recalculation | Never for charts with >100 data points |
| Ignoring rate limit headers | Faster development, no error handling needed | Production outages, temporary API bans | Never - implement from day 1 |
| Skipping data validation between APIs | Simpler data layer, faster implementation | Silent data corruption, user trust issues | Never for critical race results/statistics |
| Using localStorage for large datasets | Simple browser API, synchronous access | 5-10MB limit, blocks main thread | Only for user preferences, not data caching |
| Skipping D3 cleanup in useEffect | Shorter component code | Memory leaks, degrading performance over time | Never - always clean up listeners |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Jolpica API | Using `.../drivers.json` to fetch all 900 drivers (hits rate limit) | Use filters: `.../2024/drivers.json` or pagination with `?limit=100&offset=0` |
| OpenF1 API | Fetching session data without date range filters | Always include `session_key` or `date>2024-01-01` to limit response size |
| React Query + Next.js | Not passing `initialData` from Server Components | Hydrate client queries with server data to prevent refetch waterfall |
| Recharts + Large Data | Passing raw API response with thousands of records | Sample data to max 500-1000 points using LTTB or simple interval sampling |
| Jolpica + OpenF1 overlap | Assuming 2023-2024 data is identical between APIs | Prefer OpenF1 for 2023+, validate discrepancies, clearly indicate source |
| React Query persistence | Using localStorage for all race data since 1950 | Use IndexedDB for large datasets, localStorage only for small metadata |
| Rate limit retries | Using React Query default retry (3 attempts, immediate) | Detect 429, implement exponential backoff (5s → 10s → 20s → 40s) |
| D3 + React re-renders | Creating new D3 selections on every render | Memoize selectors, use refs for DOM nodes, clean up in useEffect return |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading full driver dataset on page load | Slow initial render, high memory | Lazy load data, implement virtual scrolling | >500 drivers in dropdown |
| No chart data sampling | Choppy animations, unresponsive filters | Implement LTTB downsampling or interval sampling to max 1000 points | >2000 data points |
| Fetching nested race data sequentially | Long loading times, progress bar stuck | Use `Promise.all()` for parallel fetches within rate limits | >10 sequential fetches |
| Storing entire API response cache in memory | Tab crashes, browser slowdown | Use IndexedDB for persistence, implement cache size limits | Cache >50MB |
| Re-creating chart components on filter change | Lag between filter selection and render | Memoize chart component, only pass changed data | Charts with >500 points |
| Synchronous localStorage operations | UI freezes during cache writes | Use IndexedDB with async operations or defer writes | Caching >1MB data |
| No request deduplication | Multiple identical parallel requests | Use React Query's automatic deduplication or request queue | Concurrent navigation |
| Infinite scroll without windowing | Memory leak, slowing scroll | Implement virtual scrolling with react-window or @tanstack/react-virtual | >200 items rendered |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API keys in client-side code | Rate limit exhaustion via API key theft | Use serverless functions or Route Handlers to proxy API calls with server-side keys |
| No request rate limiting on client | Malicious users can exhaust API quota | Implement client-side queue + server-side verification of request counts |
| Trusting API data without sanitization | XSS via malicious driver names or team data | Sanitize all API responses, especially text fields displayed in UI |
| Caching sensitive user preferences in localStorage | Data persists across sessions, visible in DevTools | Use httpOnly cookies or session storage for sensitive preferences |
| No CORS validation on API requests | API keys leaked via CORS misconfiguration | Verify API requests come from authorized domains, use env-specific origins |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading states for data-heavy charts | Users see blank screen for 2-5s, assume page broken | Show skeleton loaders or placeholder charts with "Loading..." message |
| Not indicating data source (Jolpica vs OpenF1) | Users distrust conflicting data between views | Display data source badge and last updated timestamp on all visualizations |
| No error recovery for rate limit hits | App breaks with no explanation, users refresh (making it worse) | Show friendly "Too many requests, retrying in 30s..." with countdown |
| Showing all 900 drivers in single dropdown | Dropdown lag, difficult to find specific driver | Implement search/autocomplete with virtualized list rendering |
| No indication of stale cached data | Users see outdated results, file bug reports | Show "Last updated: 2 hours ago" with manual refresh option |
| Chart animations with large datasets | Janky animations hurt perceived performance | Disable animations for >1000 points or use CSS transitions instead |
| No feedback during data invalidation | Users click "Refresh" multiple times, causing request spam | Disable button, show spinner, display "Refreshing data..." message |
| Displaying API errors verbatim to users | "HTTP 429 Too Many Requests" confuses non-technical users | Translate to "We're loading data too quickly, please wait 30 seconds" |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Race results display:** Often missing data source indicator and last-updated timestamp - verify both APIs show same results
- [ ] **Driver comparison charts:** Often missing data sampling for large datasets - verify performance with >1000 data points
- [ ] **Filter interactions:** Often missing memoization causing full re-renders - verify React DevTools Profiler shows <50ms renders
- [ ] **API integration:** Often missing rate limit handling and retry logic - verify 429 errors show user-friendly message, not crash
- [ ] **Data caching:** Often missing cache invalidation strategy - verify stale data updates within 24 hours or manual refresh works
- [ ] **Next.js App Router data fetching:** Often using client-side only - verify initial HTML contains data (view source, not DevTools)
- [ ] **Chart components with D3:** Often missing cleanup in useEffect - verify no memory leaks after 10 mount/unmount cycles
- [ ] **React Query configuration:** Often missing initialData from Server Components - verify no waterfall of refetches on page load
- [ ] **Large dropdowns (900 drivers):** Often missing virtualization - verify smooth scrolling and <100ms interaction response
- [ ] **API error states:** Often showing raw errors - verify all error messages are user-friendly and actionable

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rate limit exceeded | LOW | Implement request queue + exponential backoff. Short-term: wait 60min for limit reset. Add queue system in 2-4 hours. |
| Stale data in production | LOW | Add manual cache invalidation UI button. Implement in 1-2 hours. Long-term: set finite staleTime. |
| Client-side fetch waterfall | MEDIUM | Migrate critical paths to Server Components. Requires component refactor (1-2 days per major feature). |
| Chart performance issues | MEDIUM | Add data sampling layer. Implement LTTB or interval sampling in 4-8 hours. May need to refactor data processing pipeline. |
| Data inconsistency between APIs | MEDIUM | Implement data source priority rules. Add validation layer (1-2 days). May require cache invalidation and user notification. |
| Next.js fetch cache conflict | LOW | Add `cache: 'no-store'` to all React Query fetches. Global find/replace in 30min. Test thoroughly (2-3 hours). |
| D3 memory leaks | HIGH | Audit all D3 components, add cleanup. Requires understanding of D3 lifecycle (1-2 days). May need to refactor multiple chart components. |
| LocalStorage size limit | MEDIUM | Migrate to IndexedDB. Implement new persistence layer (4-8 hours). Need data migration strategy for existing users. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Rate limit handling | Phase 1: Data Layer Foundation | Load test with 100 rapid requests, verify queue throttles correctly and 429s show user-friendly errors |
| staleTime configuration | Phase 1: Data Layer Foundation | Manually update API data, verify cache updates within 24h or on manual refresh |
| Client-side fetching in App Router | Phase 1: Data Layer Foundation | View page source (not DevTools), verify initial HTML contains driver/race data |
| Chart re-render performance | Phase 2: Visualization Layer | Use React DevTools Profiler, verify chart renders complete in <50ms with 1000+ points |
| API data inconsistencies | Phase 1: Data Layer Foundation | Cross-check 2023-2024 race results between both APIs, verify source indicator in UI |
| Next.js fetch cache conflict | Phase 1: Data Layer Foundation | Invalidate query, check Network tab shows new request (not served from cache) |
| D3 memory leaks | Phase 2: Visualization Layer | Open/close chart page 20 times, verify Memory tab shows consistent heap size (no growth) |
| LocalStorage limits | Phase 1: Data Layer Foundation | Store 1000 race results, verify IndexedDB usage (not localStorage) in Application tab |

## Sources

### Rate Limiting & API Integration
- [Jolpica F1 API Rate Limits](https://github.com/jolpica/jolpica-f1/blob/main/docs/rate_limits.md) - Official rate limit documentation (HIGH confidence)
- [Jolpica Discussion: How to prevent HTTP 429](https://github.com/jolpica/jolpica-f1/discussions/80) - Community best practices (MEDIUM confidence)
- [OpenF1 API Documentation](https://openf1.org/) - Official rate limits and usage guidelines (HIGH confidence)

### React Query Caching
- [Pitfalls of React Query](https://nickb.dev/blog/pitfalls-of-react-query/) - StaleTime and caching issues (MEDIUM confidence)
- [React Query: staleTime vs cacheTime Discussion](https://github.com/TanStack/query/discussions/1685) - Official maintainer clarifications (HIGH confidence)
- [Why cacheTime should be bigger than staleTime](https://www.codemzy.com/blog/react-query-cachetime-staletime) - Configuration best practices (MEDIUM confidence)

### Next.js App Router
- [Common mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Official Vercel guidance (HIGH confidence)
- [App Router pitfalls](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Recent practical examples (MEDIUM confidence)

### Chart Performance
- [Recharts Performance Guide](https://recharts.github.io/en-US/guide/performance/) - Official optimization documentation (HIGH confidence)
- [Recharts vs Chart.js Performance](https://www.oreateai.com/blog/recharts-vs-chartjs-navigating-the-performance-maze-for-big-data-visualizations/cf527fb7ad5dcb1d746994de18bdea30) - Large dataset benchmarks (MEDIUM confidence)
- [Recharts Large Dataset Issues](https://github.com/recharts/recharts/issues/1146) - Community-reported performance problems (MEDIUM confidence)

### D3 + React
- [Working with React and D3 together](https://gist.github.com/alexcjohnson/a4b714eee8afd2123ee00cb5b3278a5f) - Integration patterns (MEDIUM confidence)
- [D3 Memory Leak Discussion](https://groups.google.com/g/d3-js/c/sCmDXqXW-LY) - Known memory issues (LOW confidence - old discussion)

### Data Inconsistencies
- [Jolpica Data Correction: Incorrect lap times](https://github.com/jolpica/jolpica-f1/issues/103) - Documented API discrepancies (HIGH confidence)
- [Ergast API deprecation discussion](https://github.com/theOehrly/Fast-F1/discussions/445) - Context on API transition (MEDIUM confidence)

### Caching Strategies
- [React Query Persistence Plugin](https://tanstack.com/query/v4/docs/framework/react/plugins/persistQueryClient) - Official persistence documentation (HIGH confidence)
- [IndexedDB vs localStorage for React Query](https://github.com/TanStack/query/discussions/1638) - Storage strategy discussion (MEDIUM confidence)

---
*Pitfalls research for: F1 Hub - F1 Data Visualization Web Application*
*Researched: 2026-02-16*
