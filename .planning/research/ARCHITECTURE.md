# Architecture Research

**Domain:** F1 Data Visualization Web Application
**Researched:** 2026-02-16
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                    (Route-based Modules)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Head-to  │  │  Quiz    │  │  Radio   │  │ History  │    │
│  │  -Head   │  │  Module  │  │  Module  │  │  Module  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Weather  │  │Telemetry │  │ Strategy │                   │
│  │  Module  │  │  Module  │  │  Module  │                   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                   │
│       │            │            │            │              │
├───────┴────────────┴────────────┴────────────┴──────────────┤
│                   Shared Components Layer                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │ DriverSelect │  │ SeasonSelect │  │  RaceSelect  │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│   ┌──────────────┐  ┌──────────────┐                        │
│   │ Chart Comps  │  │ UI Primitives│                        │
│   │  (Recharts)  │  │  (shadcn/ui) │                        │
│   └──────────────┘  └──────────────┘                        │
├─────────────────────────────────────────────────────────────┤
│                  Data Fetching Layer                         │
│                   (TanStack Query)                           │
│   ┌──────────────┐  ┌──────────────┐                        │
│   │  Custom Hooks│  │  Query Cache │                        │
│   │  useDrivers  │  │              │                        │
│   │  useRaces    │  │              │                        │
│   │  useTelemetry│  │              │                        │
│   └──────┬───────┘  └──────────────┘                        │
├──────────┴──────────────────────────────────────────────────┤
│                    API Client Layer                          │
│   ┌──────────────┐  ┌──────────────┐                        │
│   │ Jolpica API  │  │  OpenF1 API  │                        │
│   │   Client     │  │    Client    │                        │
│   └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Route Modules** | Feature-specific pages, layouts, and UI logic | Next.js App Router pages with client components |
| **Shared Components** | Reusable UI elements across modules (DriverSelect, RaceSelect) | Composable React components with shadcn/ui primitives |
| **Chart Components** | Data visualization wrappers for Recharts | Reusable chart components with consistent styling |
| **Data Fetching Hooks** | Custom TanStack Query hooks per data domain | `useDrivers()`, `useRaces()`, `useTelemetry()` etc. |
| **API Clients** | HTTP clients for external APIs | Fetch-based clients with error handling, type safety |
| **Query Cache** | Client-side data cache and synchronization | TanStack Query's QueryClient |

## Recommended Project Structure

```
f1-hub/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with QueryClientProvider
│   ├── page.tsx                  # Home page
│   ├── head-to-head/             # Head-to-Head module
│   │   ├── page.tsx              # Module page (client component)
│   │   ├── _components/          # Module-specific components (private folder)
│   │   │   ├── ComparisonChart.tsx
│   │   │   └── DriverStatsCard.tsx
│   │   └── _lib/                 # Module-specific logic
│   │       └── calculations.ts
│   ├── quiz/                     # Quiz module
│   │   ├── page.tsx
│   │   └── _components/
│   ├── radio/                    # Radio module
│   │   ├── page.tsx
│   │   └── _components/
│   ├── history/                  # History module
│   │   ├── page.tsx
│   │   └── _components/
│   ├── weather/                  # Weather module
│   │   ├── page.tsx
│   │   └── _components/
│   ├── telemetry/                # Telemetry module
│   │   ├── page.tsx
│   │   └── _components/
│   └── strategy/                 # Strategy module
│       ├── page.tsx
│       └── _components/
├── components/                   # Shared components (global)
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── selectors/                # Shared selector components
│   │   ├── DriverSelect.tsx
│   │   ├── SeasonSelect.tsx
│   │   └── RaceSelect.tsx
│   ├── charts/                   # Shared chart components
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   └── layout/                   # Layout components
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
├── lib/                          # Shared utilities and services
│   ├── api/                      # API clients
│   │   ├── jolpica.ts            # Jolpica API client
│   │   ├── openf1.ts             # OpenF1 API client
│   │   └── types.ts              # Shared API types
│   ├── hooks/                    # Shared data fetching hooks
│   │   ├── useDrivers.ts         # TanStack Query hook
│   │   ├── useRaces.ts           # TanStack Query hook
│   │   ├── useSeasons.ts
│   │   ├── useTelemetry.ts
│   │   └── useWeather.ts
│   ├── utils/                    # Utility functions
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── calculations.ts
│   └── providers.tsx             # React Context providers (QueryClientProvider)
├── public/                       # Static assets
├── styles/                       # Global styles
│   └── globals.css               # Tailwind imports, CSS variables
├── .env.local                    # Environment variables (API keys)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

### Structure Rationale

- **`app/` route-based modules**: Each module (`/head-to-head`, `/quiz`, etc.) is independent with its own page and private components in `_components/` folders. This prevents routing and keeps module-specific code colocated with the route.

- **Private folders (`_components/`, `_lib/`)**: Using the underscore prefix opts folders out of routing, allowing safe colocation of non-routable files within the `app/` directory. This is a Next.js App Router convention.

- **`components/` for shared UI**: Global components used across multiple modules live here, organized by type (ui primitives, selectors, charts, layout).

- **`lib/` for shared logic**: API clients, data fetching hooks, and utilities that multiple modules depend on. This creates clear separation between UI (components) and business logic (lib).

- **`lib/hooks/` for TanStack Query**: Custom hooks that encapsulate data fetching logic, query keys, and caching behavior. Each hook represents a data domain (drivers, races, telemetry).

- **`lib/api/` for API clients**: Separate clients for Jolpica and OpenF1 APIs, handling HTTP requests, error handling, and response parsing. These are consumed by the hooks layer.

## Architectural Patterns

### Pattern 1: Feature-Scoped Modules with Shared Services

**What:** Each module (route) is independent with its own components and logic, but shares common services (API clients, data hooks, UI components).

**When to use:** Building a multi-feature application where features don't directly depend on each other but share common infrastructure.

**Trade-offs:**
- **Pros**: Clear boundaries, easy to navigate, scales well, prevents tight coupling
- **Cons**: Some duplication if features need similar but not identical logic

**Example:**
```typescript
// app/head-to-head/page.tsx (module-specific)
"use client"
import { DriverSelect } from "@/components/selectors/DriverSelect"
import { useDrivers } from "@/lib/hooks/useDrivers"
import { ComparisonChart } from "./_components/ComparisonChart"

export default function HeadToHeadPage() {
  const { data: drivers } = useDrivers()
  // Module-specific logic...
}

// lib/hooks/useDrivers.ts (shared)
import { useQuery } from "@tanstack/react-query"
import { jolpicaClient } from "@/lib/api/jolpica"

export function useDrivers(season?: number) {
  return useQuery({
    queryKey: ["drivers", season],
    queryFn: () => jolpicaClient.getDrivers(season),
  })
}
```

### Pattern 2: TanStack Query with Custom Hooks

**What:** Wrap TanStack Query's `useQuery` and `useMutation` in custom hooks that encapsulate query keys, fetching logic, and type safety.

**When to use:** Always. Makes query keys consistent, reduces duplication, and provides a single source of truth for each data domain.

**Trade-offs:**
- **Pros**: Type-safe, consistent query keys, easy refactoring, testable
- **Cons**: Extra layer of abstraction (minimal overhead)

**Example:**
```typescript
// lib/hooks/useRaces.ts
import { useQuery } from "@tanstack/react-query"
import { jolpicaClient } from "@/lib/api/jolpica"
import type { Race } from "@/lib/api/types"

export function useRaces(season: number) {
  return useQuery({
    queryKey: ["races", season],
    queryFn: () => jolpicaClient.getRaces(season),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useRace(season: number, round: number) {
  return useQuery({
    queryKey: ["race", season, round],
    queryFn: () => jolpicaClient.getRace(season, round),
  })
}
```

### Pattern 3: Composable Selector Components

**What:** Build reusable selector components (DriverSelect, SeasonSelect, RaceSelect) that handle their own data fetching and expose a controlled interface.

**When to use:** When multiple modules need the same selection UI with consistent behavior.

**Trade-offs:**
- **Pros**: DRY, consistent UX, centralized data fetching
- **Cons**: Must be flexible enough for different use cases (controlled vs uncontrolled)

**Example:**
```typescript
// components/selectors/DriverSelect.tsx
"use client"
import { useDrivers } from "@/lib/hooks/useDrivers"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

interface DriverSelectProps {
  season?: number
  value?: string
  onChange: (driverId: string) => void
}

export function DriverSelect({ season, value, onChange }: DriverSelectProps) {
  const { data: drivers, isLoading } = useDrivers(season)

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger>
        {drivers?.find(d => d.driverId === value)?.name || "Select driver"}
      </SelectTrigger>
      <SelectContent>
        {drivers?.map(driver => (
          <SelectItem key={driver.driverId} value={driver.driverId}>
            {driver.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Pattern 4: Client-Only App with QueryClientProvider

**What:** Since this is a client-side only app (no backend), wrap the entire app in QueryClientProvider in the root layout and mark all interactive pages as client components.

**When to use:** Client-side only applications using Next.js App Router with TanStack Query.

**Trade-offs:**
- **Pros**: Simpler architecture, no SSR complexity, faster development
- **Cons**: Slower initial page load (no pre-rendered data), no SEO benefits for dynamic content

**Example:**
```typescript
// app/layout.tsx
import { Providers } from "@/lib/providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// lib/providers.tsx
"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### Pattern 5: Recharts Component Wrappers

**What:** Create wrapper components around Recharts primitives that apply consistent theming, responsive behavior, and data formatting.

**When to use:** When multiple charts need the same styling and configuration across modules.

**Trade-offs:**
- **Pros**: Consistent appearance, centralized theming, easier maintenance
- **Cons**: Less flexibility for one-off customizations

**Example:**
```typescript
// components/charts/LineChart.tsx
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface LineChartProps {
  data: any[]
  xKey: string
  yKey: string
  color?: string
}

export function LineChart({ data, xKey, yKey, color = "#3b82f6" }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
```

## Data Flow

### Request Flow (Client-Side)

```
[User Interaction] (Select driver, change season)
    ↓
[Component] → [Custom Hook (useDrivers)] → [TanStack Query]
    ↓              ↓                            ↓
[UI Update] ← [Cache Hit?] ←──────────────────┘
              Yes ↓  No ↓
                  ↓   [API Client (jolpicaClient)]
                  ↓       ↓
                  ↓   [External API (Jolpica/OpenF1)]
                  ↓       ↓
                  └── [Cache + Return Data]
                          ↓
                      [Component Renders]
```

### State Management Flow

```
[QueryClient]
    ↓ (manages cache)
[Query Cache] ← [Custom Hooks] → [Components]
    ↓              ↓                   ↓
[Automatic      [Query Keys]     [useQuery hooks]
 invalidation,   ["drivers", 2024]
 refetching]     ["races", 2024, 5]
```

### Key Data Flows

1. **Initial Page Load**: Component mounts → Custom hook calls TanStack Query → Query checks cache → If miss, calls API client → API client fetches from external API → Data cached and returned → Component renders

2. **Subsequent Requests (Same Data)**: Component mounts → Custom hook calls TanStack Query → Cache hit (stale time not expired) → Immediately return cached data → Component renders instantly

3. **Data Mutation/Invalidation**: User action triggers mutation → API call completes → Invalidate related query keys → Affected queries refetch → Components re-render with fresh data

## Anti-Patterns

### Anti-Pattern 1: Shared Service Layer with High Fan-In

**What people do:** Create a single "services" folder with god-object service classes that every module imports.

**Why it's wrong:** Creates tight coupling, high fan-in (many modules depend on few services), makes changes risky, and violates module independence.

**Do this instead:** Use the custom hooks pattern where each data domain (drivers, races, telemetry) has its own hook. Modules import only the hooks they need. If a hook becomes complex, split it rather than creating a shared service layer.

```typescript
// BAD: services/DataService.ts
export class DataService {
  getDrivers() { ... }
  getRaces() { ... }
  getTelemetry() { ... }
  getWeather() { ... }
  // Everything in one place = tight coupling
}

// GOOD: lib/hooks/useDrivers.ts, lib/hooks/useRaces.ts, etc.
// Each module imports only what it needs
```

### Anti-Pattern 2: Direct API Calls in Components

**What people do:** Call fetch() or API clients directly inside component functions or useEffect hooks.

**Why it's wrong:** Bypasses TanStack Query's cache, loses automatic refetching, no request deduplication, manual loading/error state management, harder to test.

**Do this instead:** Always use custom hooks that wrap TanStack Query. Let the library manage cache, loading states, and refetching.

```typescript
// BAD
function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/drivers').then(r => r.json()).then(setData)
  }, [])
  // Manual state management, no cache, runs every mount
}

// GOOD
function MyComponent() {
  const { data, isLoading } = useDrivers()
  // Automatic cache, deduplication, refetching
}
```

### Anti-Pattern 3: Collocating Shared Components in app/

**What people do:** Put shared components like DriverSelect inside one module's folder (e.g., `app/head-to-head/_components/DriverSelect.tsx`) and import from other modules.

**Why it's wrong:** Creates artificial dependency (other modules depend on head-to-head module), confusing folder structure, breaks when module is removed, violates principle of least surprise.

**Do this instead:** Put truly shared components in the global `components/` directory. Module-specific components stay in `_components/` within each route.

```typescript
// BAD
// app/head-to-head/_components/DriverSelect.tsx
// app/quiz/page.tsx imports from ../head-to-head/_components/DriverSelect

// GOOD
// components/selectors/DriverSelect.tsx
// All modules import from @/components/selectors/DriverSelect
```

### Anti-Pattern 4: Inconsistent Query Keys

**What people do:** Define query keys inline where useQuery is called, leading to inconsistent formats across the app.

**Why it's wrong:** Makes cache invalidation error-prone, hard to find all related queries, typos cause bugs, can't refactor query keys easily.

**Do this instead:** Centralize query keys in custom hooks or query key factories. Use typed query keys.

```typescript
// BAD
useQuery({ queryKey: ["drivers"] })
useQuery({ queryKey: ["driver-list"] })
useQuery({ queryKey: ["allDrivers", season] })
// Inconsistent formats, hard to invalidate

// GOOD
// lib/hooks/useDrivers.ts exports consistent query key logic
export const driverKeys = {
  all: ["drivers"] as const,
  list: (season?: number) => [...driverKeys.all, "list", season] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
}

export function useDrivers(season?: number) {
  return useQuery({
    queryKey: driverKeys.list(season),
    queryFn: () => jolpicaClient.getDrivers(season),
  })
}
```

### Anti-Pattern 5: Over-Engineering with Route Handlers

**What people do:** Create Next.js API routes (`app/api/`) as a proxy layer between frontend and external APIs.

**Why it's wrong:** For client-side only apps, this adds unnecessary complexity. Creates a "mini-backend inside frontend" with no benefits. Increases latency (client → Next.js API → external API instead of client → external API).

**Do this instead:** Call external APIs directly from API client functions consumed by TanStack Query hooks. Only use Route Handlers if you need server-side logic (auth, secrets, rate limiting).

```typescript
// BAD (for client-only app)
// app/api/drivers/route.ts
export async function GET() {
  const data = await fetch('https://api.jolpica.com/drivers')
  return Response.json(data)
}
// Components call /api/drivers which calls external API (double hop)

// GOOD
// lib/api/jolpica.ts
export const jolpicaClient = {
  getDrivers: async (season?: number) => {
    const res = await fetch(`https://api.jolpica.com/drivers?season=${season}`)
    return res.json()
  }
}
// Components call external API directly via hooks
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Jolpica API | API client (`lib/api/jolpica.ts`) → TanStack Query hooks → Components | Historical F1 data, ergast.com data |
| OpenF1 API | API client (`lib/api/openf1.ts`) → TanStack Query hooks → Components | Live timing, telemetry, radio messages |
| Recharts | Component wrappers (`components/charts/`) | Install recharts, create wrapper components with theming |
| shadcn/ui | CLI-installed UI components (`components/ui/`) | Run `npx shadcn-ui@latest add [component]` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Module ↔ Shared Components | Direct import (`@/components/...`) | One-way: modules depend on shared components |
| Module ↔ Data Hooks | Direct import (`@/lib/hooks/...`) | One-way: modules depend on hooks |
| Data Hooks ↔ API Clients | Direct import (`@/lib/api/...`) | One-way: hooks depend on API clients |
| Modules ↔ Other Modules | No direct communication | Modules are independent, share nothing except via shared layers |

## Scalability Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is optimal. Client-side rendering, TanStack Query cache, no backend needed. |
| 1k-10k users | Consider CDN for static assets, add request deduplication checks in API clients, optimize Recharts rendering (memoization, virtualization for large datasets). |
| 10k+ users | Evaluate SSR for initial page load (App Router Server Components), consider edge caching for API responses, add monitoring (Sentry, Vercel Analytics). |

### Scaling Priorities

1. **First bottleneck: Client-side rendering performance**
   - **What breaks**: Large datasets in charts cause sluggish UI, especially on mobile
   - **How to fix**: Implement pagination/virtualization in chart components, use `useMemo` for expensive calculations, lazy load heavy modules with `dynamic(() => import(...), { ssr: false })`

2. **Second bottleneck: API rate limits**
   - **What breaks**: External APIs (Jolpica, OpenF1) rate limit requests as user base grows
   - **How to fix**: Increase `staleTime` in TanStack Query config (cache data longer), implement request deduplication in API clients, consider caching responses in Vercel KV/Redis for frequently accessed data

3. **Third bottleneck: Bundle size**
   - **What breaks**: Initial page load slows as more modules and chart components are added
   - **How to fix**: Code-split modules with Next.js dynamic imports, tree-shake unused Recharts components, analyze bundle with `@next/bundle-analyzer`

## Build Order Implications

Based on dependencies between components, suggested build order:

### Phase 1: Foundation
1. **Set up project structure**: Install Next.js 15, TypeScript, Tailwind, shadcn/ui
2. **Configure TanStack Query**: Create `lib/providers.tsx`, wrap app in `QueryClientProvider`
3. **Build API clients**: `lib/api/jolpica.ts` and `lib/api/openf1.ts` with basic type definitions
4. **Create first data hooks**: `useDrivers()`, `useSeasons()`, `useRaces()` in `lib/hooks/`

**Rationale**: Foundation must exist before modules. API clients and hooks are shared dependencies.

### Phase 2: Shared Components
5. **Install shadcn/ui primitives**: Button, Card, Select, Input via CLI
6. **Build selector components**: `DriverSelect`, `SeasonSelect`, `RaceSelect` in `components/selectors/`
7. **Create chart wrappers**: Basic Recharts wrappers in `components/charts/`
8. **Build layout components**: Header, Navigation in `components/layout/`

**Rationale**: Shared components are dependencies for all modules. Build these before individual module features.

### Phase 3: First Module (Validation)
9. **Build simplest module first**: Likely History or Head-to-Head
10. **Validate architecture**: Ensure data flow works (hooks → API → cache → UI)
11. **Test shared components**: Verify DriverSelect, SeasonSelect work as expected

**Rationale**: Validate the architecture with one complete module before building others.

### Phase 4: Remaining Modules (Parallel)
12. **Build remaining modules in parallel**: Each module is independent once foundation is complete
    - Quiz module
    - Radio module
    - Weather module
    - Telemetry module
    - Strategy module

**Rationale**: Modules don't depend on each other. Can be built in any order or simultaneously by different developers.

### Phase 5: Polish
13. **Add loading states**: Skeleton components, error boundaries
14. **Optimize performance**: Memoization, lazy loading, bundle analysis
15. **Dark mode refinement**: Test all charts and components in dark theme

## Sources

**Next.js Architecture & Structure (HIGH confidence - official docs):**
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)
- [The Ultimate Guide to Organizing Your Next.js 15 Project Structure - Wisp CMS](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Inside the App Router: Best Practices for Next.js File and Directory Structure (2025 Edition)](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)

**Modular Architecture Patterns (MEDIUM confidence - community patterns):**
- [Next.js Architecture in 2026 — Server-First, Client-Islands, and Scalable App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [The Ultimate Next.js App Router Architecture | Feature-Sliced Design](https://feature-sliced.design/blog/nextjs-app-router-guide)
- [Building the Future of Scalable Applications In NextJS: A Modular Approach to Architecture](https://medium.com/@priyanklad52/building-the-future-of-scalable-applications-in-nextjs-a-modular-approach-to-architecture-89d811231f81)

**TanStack Query Integration (MEDIUM confidence - official docs + community):**
- [Building a Fully Hydrated SSR App with Next.js App Router and TanStack Query](https://sangwin.medium.com/building-a-fully-hydrated-ssr-app-with-next-js-app-router-and-tanstack-query-5970aaf822d2)
- [The Complete Guide to TanStack Query in Next.js App Router](https://ihsaninh.com/blog/the-complete-guide-to-tanstack-query-next.js-app-router)
- [TanStack Query Custom Hooks](https://tanstack.com/query/v4/docs/react/examples/react/custom-hooks)
- [React Stack Patterns](https://www.patterns.dev/react/react-2026/)

**Data Visualization Architecture (MEDIUM confidence - ecosystem patterns):**
- [Building Data Visualization Dashboards in Next.js](https://arnab-k.medium.com/building-data-visualization-dashboards-in-next-js-f29e1da0fb4c)
- [Building a Next.js Dashboard with Dynamic Charts and SSR - Cube Blog](https://cube.dev/blog/building-nextjs-dashboard-with-dynamic-charts-and-ssr)
- [How to use Next.js and Recharts to build an information dashboard](https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts)

**Recharts Component Architecture (MEDIUM confidence - official docs):**
- [Recharts GitHub](https://github.com/recharts/recharts)
- [The Top 5 React Chart Libraries to Know in 2026 for Modern Dashboards](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries)
- [Best React chart libraries (2025 update)](https://blog.logrocket.com/best-react-chart-libraries-2025/)

**shadcn/ui Architecture (HIGH confidence - official docs):**
- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [The anatomy of shadcn/ui](https://manupa.dev/blog/anatomy-of-shadcn-ui)
- [shadcn UI: Complete Guide to the Most Popular React Component Collection (2026)](https://designrevision.com/blog/shadcn-ui-guide)

---
*Architecture research for: F1 Hub Data Visualization Application*
*Researched: 2026-02-16*
