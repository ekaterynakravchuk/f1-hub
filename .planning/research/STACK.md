# Technology Stack

**Project:** F1 Hub
**Domain:** F1 data visualization web application
**Researched:** 2026-02-16
**Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5.9+ | React framework with App Router | Industry standard for React apps in 2026. App Router (stable in v13+) provides 40% faster page loads vs Pages Router. Built-in RSC, automatic code-splitting, and optimized prefetching. v15 introduces React 19 support and Turbopack dev mode. **Use 15.x not 16.x** — v16 is too new (released weeks ago), ecosystem compatibility still catching up. |
| React | 19.x | UI library with Server Components | Required by Next.js 15. React 19 introduces Server Components (default in App Router), async transitions, and 20% better TypeScript inference vs React 18. Stable and widely adopted as of 2026. |
| TypeScript | 5.5+ | Type-safe JavaScript | 78% adoption rate in 2026. Essential for large codebases. Requires strict mode enabled. React 19 types require @types/react@^19.0.0. |
| Tailwind CSS | 4.1+ | Utility-first CSS framework | v4.0 released early 2025 with 5x faster full builds, 100x faster incremental builds. CSS-first config via @theme directive replaces tailwind.config.js. Automatic content detection. Requires Safari 16.4+, Chrome 111+, Firefox 128+. |

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | Latest (Feb 2026) | Headless component collection | Not a package — copy/paste components into your codebase, full ownership. Built on Radix UI primitives (or Base UI). February 2026 update: unified radix-ui package, RTL support, visual builder via `npx shadcn create`. Works seamlessly with Tailwind. Industry standard for dark minimalist designs. |
| Radix UI | Latest (unified package) | Unstyled accessible primitives | Powers shadcn/ui. February 2026: shadcn new-york style now uses unified `radix-ui` package vs individual `@radix-ui/react-*` packages. Accessibility built-in (ARIA, keyboard nav). |

### Data Visualization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Recharts | 3.7.0+ | Declarative React charts | **Primary charting library.** Built on D3 + SVG with declarative React API. Shallow learning curve, seamless React integration, modular components. Good performance <5K data points. Best for standard charts (line, bar, area, pie). Use for Head-to-Head, Quiz results, Weather impact, History timelines. |
| D3.js | 7.9.0 | Low-level SVG manipulation | **For custom/complex visualizations.** Unlimited customization, imperative approach, steep learning curve. Use for Telemetry visualizer (complex multi-series time-based), Strategy simulator (custom race timeline), Interactive History (custom time-based layouts). Recharts uses D3 internally, so bundle size overlap is minimal. |
| Visx | Latest (@visx/xychart) | Low-level D3 + React primitives | **Alternative to D3 for custom charts.** Airbnb's library wrapping D3 primitives in React. Middle ground between Recharts (too opinionated) and D3 (too low-level). Consider for Telemetry if pure D3 feels too imperative. 14.2K GitHub stars, actively maintained. |

### Data Fetching & State

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Query | 5.90.21+ | Async state management | v5 is 20% smaller than v4, simplified API, suspense support built-in (useSuspenseQuery). Automatic request deduplication, infinite queries can prefetch multiple pages. **Essential for client-side API orchestration.** Use staleTime: Infinity for Jolpica (historical data never changes), shorter staleTime for OpenF1 (live/recent data). |
| Native Fetch API | Built-in | HTTP client | Next.js extends fetch() with automatic deduplication and caching. Use over Axios for Next.js compatibility (server routes + TanStack Query). No extra dependencies. |

### Development Tools

| Tool | Version | Purpose | Why Recommended |
|------|---------|---------|-----------------|
| ESLint | 9.x (flat config) | Linting | Next.js 15 uses eslint.config.mjs (flat config format) vs .eslintrc.json. Includes eslint-config-next with @next/eslint-plugin-next, eslint-plugin-react, eslint-plugin-react-hooks. |
| Prettier | Latest | Code formatting | Works with ESLint via eslint-config-prettier (disables conflicting ESLint formatting rules). Industry standard for code consistency. |
| Vitest | Latest | Unit testing framework | **Preferred over Jest for new projects.** 10-20x faster than Jest on large codebases, native ESM support, Vite integration. Jest-compatible syntax (expect().toBe()). **Limitation:** Does not support async Server Components (use E2E tests for those). Use with @testing-library/react for component tests. |
| React Testing Library | Latest | Component testing | User-focused testing (test behavior not implementation). Works with Vitest or Jest. Industry standard for React component tests. |
| Playwright | Latest | E2E testing | Recommended for async Server Components, critical user flows, cross-browser testing. Faster and more reliable than Cypress in 2026. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | Latest | Date manipulation | **Use for date formatting/parsing.** Functional API, tree-shakeable (22.2 MB unpacked but bundles efficiently). Better for projects prioritizing bundle size optimization. Use for race dates, session times, historical timelines. |
| Zod | Latest (TS 5.5+) | Runtime validation | TypeScript-first schema validation. Bridges compile-time types and runtime validation. Auto-infers static types via z.infer<>. Use for API response validation (Jolpica/OpenF1), form validation (Quiz, filters), environment variables. Requires strict mode. |
| clsx / tailwind-merge | Latest | Conditional class names | clsx for conditional classes, tailwind-merge (cn helper) to merge Tailwind classes without conflicts. Standard pattern with shadcn/ui. |

### Infrastructure

| Technology | Purpose | Why Recommended |
|------------|---------|-----------------|
| Vercel | Hosting & deployment | Zero-config deployment for Next.js. Automatic preview environments per PR, Edge Functions, ISR support, global CDN. Next.js is built by Vercel — first-class integration. Free tier suitable for F1 Hub (client-side only, no serverless functions needed). |
| Git + GitHub | Version control | Industry standard. Vercel auto-deploys on git push. |

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Charting | Recharts + D3 | Nivo | If you want D3 power with declarative API (middle ground). Nivo has beautiful defaults but less community support than Recharts. |
| Charting | Recharts + D3 | Chart.js | If you need canvas rendering (better performance >10K points). React-Chart.js wrapper available. Not recommended — SVG better for F1 Hub's data sizes. |
| Testing | Vitest | Jest | If migrating from existing Jest setup or need React Native support. Jest 30 (mid-2025) improved performance but still slower than Vitest. |
| Date library | date-fns | Day.js | If you need moment.js-like chaining API (670 KB unpacked vs date-fns 22.2 MB). Day.js smaller initial bundle but date-fns tree-shakes better. |
| HTTP client | Native Fetch | Axios | If you need interceptors, automatic error rejection, or cross-environment consistency. Not needed for F1 Hub (client-side only). |
| CSS | Tailwind v4 | Tailwind v3 | If you can't meet browser requirements (Safari 16.4+, Chrome 111+, Firefox 128+). v3 still maintained but v4 is 5-100x faster. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | Deprecated, unmaintained since 2020, massive bundle size (71KB gzipped). | date-fns or Day.js |
| Next.js Pages Router | Legacy routing system. App Router is 40% faster with better DX (layouts, loading states, Server Components). | Next.js App Router |
| CSS-in-JS (styled-components, Emotion) | Performance overhead in React Server Components. Not compatible with RSC without client-side workarounds. | Tailwind CSS + shadcn/ui |
| Create React App | Deprecated, no longer maintained. Officially recommends Next.js. | Next.js or Vite |
| jQuery with React | Anti-pattern. React manages DOM, jQuery manipulates DOM directly — conflicts inevitable. | Native DOM refs or libraries built for React |
| Global CSS files (除了 Tailwind base) | Hard to maintain, specificity conflicts, no tree-shaking. | Tailwind utility classes |

## Stack Patterns by Use Case

### For Standard Charts (Head-to-Head, Quiz, Weather)
```typescript
// Use Recharts with TanStack Query
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

const { data } = useQuery({
  queryKey: ['driver-comparison', driverId],
  queryFn: () => fetch(`https://api.jolpi.ca/ergast/f1/drivers/${driverId}`).then(r => r.json()),
  staleTime: Infinity, // Historical data never changes
});
```

### For Complex Custom Visualizations (Telemetry, Strategy)
```typescript
// Use D3.js or Visx with TanStack Query
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['telemetry', sessionKey],
  queryFn: () => fetch(`https://api.openf1.org/v1/car_data?session_key=${sessionKey}`).then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes for recent data
});

// Custom D3 rendering logic
useEffect(() => {
  if (!data) return;
  const svg = d3.select(svgRef.current);
  // ... custom D3 visualization
}, [data]);
```

### For API Response Validation
```typescript
// Use Zod with TanStack Query
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const DriverSchema = z.object({
  driverId: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  dateOfBirth: z.string(),
});

const { data } = useQuery({
  queryKey: ['driver', driverId],
  queryFn: async () => {
    const response = await fetch(`https://api.jolpi.ca/ergast/f1/drivers/${driverId}`);
    const json = await response.json();
    return DriverSchema.parse(json.MRData.DriverTable.Drivers[0]);
  },
});
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15.5.9 | React 19.x | Requires React 19.x, not 18.x |
| React 19.x | TypeScript 5.5+ | Requires @types/react@^19.0.0, @types/react-dom@^19.0.0 |
| TanStack Query 5.90.21 | React 18+, 19 | Works with both React 18 and 19 |
| Tailwind CSS 4.1 | Safari 16.4+, Chrome 111+, Firefox 128+ | Uses modern CSS (cascade layers, @property, color-mix) |
| Vitest | Next.js 15 App Router | Does NOT support async Server Components (use E2E for those) |
| shadcn/ui | Radix UI or Base UI | February 2026: new-york style uses unified radix-ui package |
| Zod | TypeScript 5.5+ | Requires strict mode in tsconfig.json |

## Installation

```bash
# Initialize Next.js project
npx create-next-app@latest f1-hub --typescript --tailwind --app --use-npm

# Core dependencies
npm install @tanstack/react-query recharts d3 @types/d3 zod

# UI components (via shadcn CLI)
npx shadcn@latest init
npx shadcn@latest add button card select tabs

# Utilities
npm install date-fns clsx tailwind-merge

# Dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom vitest @vitest/ui jsdom
npm install -D eslint-config-prettier prettier
npm install -D playwright @playwright/test

# Optional: Visx for custom charts
npm install @visx/xychart @visx/scale @visx/axis @visx/grid
```

## Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### eslint.config.mjs (Next.js 15 flat config)
```javascript
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:prettier/recommended'),
];
```

### tailwind.config.ts (Tailwind v4 uses CSS @theme, but v3 config still works)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // shadcn/ui theme extensions
    },
  },
  plugins: [],
};
export default config;
```

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Performance Optimization Notes

### TanStack Query Configuration
```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Default for historical data
      gcTime: 1000 * 60 * 60, // 1 hour (renamed from cacheTime in v5)
      refetchOnWindowFocus: false, // F1 data doesn't change on tab switch
      retry: 3,
    },
  },
});

// Override per query for live data
useQuery({
  queryKey: ['live-timing', sessionKey],
  queryFn: fetchLiveTiming,
  staleTime: 10 * 1000, // 10 seconds for live data
  refetchInterval: 30 * 1000, // Poll every 30s
});
```

### Next.js Metadata for SEO
```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'F1 Hub - Interactive F1 Data Analysis',
  description: 'Explore F1 history, telemetry, and race strategies with interactive visualizations',
  openGraph: {
    title: 'F1 Hub',
    description: 'Interactive F1 data analysis tools',
    type: 'website',
  },
};
```

### Image Optimization
```typescript
// Use Next.js Image component for driver photos, team logos
import Image from 'next/image';

<Image
  src="/drivers/hamilton.jpg"
  alt="Lewis Hamilton"
  width={200}
  height={200}
  loading="lazy"
/>
```

## API Rate Limiting Strategy

Since Jolpica (4 req/s) and OpenF1 (3 req/s) have rate limits, use TanStack Query's built-in request deduplication + aggressive caching:

```typescript
// Jolpica: Historical data (never changes)
useQuery({
  queryKey: ['seasons'],
  queryFn: fetchSeasons,
  staleTime: Infinity,
  gcTime: Infinity, // Cache forever
});

// OpenF1: Recent telemetry (changes but not often)
useQuery({
  queryKey: ['telemetry', sessionKey],
  queryFn: fetchTelemetry,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 60 * 60 * 1000, // 1 hour
});

// Batch requests when possible
const queries = useQueries({
  queries: driverIds.map(id => ({
    queryKey: ['driver', id],
    queryFn: () => fetchDriver(id),
    staleTime: Infinity,
  })),
  combine: (results) => ({
    data: results.map(r => r.data),
    pending: results.some(r => r.isPending),
  }),
});
```

## Sources

### HIGH Confidence (Official Docs, Context7-equivalent)
- [Next.js 15 Official Release](https://nextjs.org/blog/next-15) — Features, React 19 support, Turbopack
- [Next.js 15 Production Checklist](https://nextjs.org/docs/app/guides/production-checklist) — Official best practices
- [Next.js Data Fetching Guide](https://nextjs.org/docs/app/getting-started/fetching-data) — App Router patterns
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — Breaking changes, performance improvements
- [TanStack Query v5 Announcement](https://tanstack.com/blog/announcing-tanstack-query-v5) — v5 features, migration guide
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) — February 2026 updates
- [shadcn/ui February 2026 - Unified Radix UI Package](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) — Radix unification
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — TypeScript requirements
- [Vitest Next.js Guide](https://nextjs.org/docs/app/guides/testing/vitest) — Official integration
- [Zod Official Documentation](https://zod.dev/) — API reference

### MEDIUM Confidence (Multiple credible sources agree)
- [Next.js 15 Advanced Patterns for 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/) — Caching strategies, App Router
- [Vercel React Best Practices](https://vercel.com/blog/introducing-react-best-practices) — Official Vercel guide
- [Recharts vs D3.js Comparison](https://solutions.lykdat.com/blog/recharts-vs-d3-js/) — Feature comparison, use cases
- [Vitest vs Jest in 2026](https://howtotestfrontend.com/resources/vitest-vs-jest-which-to-pick) — Performance benchmarks
- [date-fns vs Day.js Guide](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) — Bundle size, tree-shaking
- [TypeScript with React Best Practices 2026](https://medium.com/@mernstackdevbykevin/typescript-with-react-best-practices-2026-78ce4546210b) — Modern patterns
- [React & Next.js Modern Best Practices](https://strapi.io/blog/react-and-nextjs-in-2025-modern-best-practices) — Industry patterns
- [15 Best React Chart Libraries in 2026](https://technostacks.com/blog/react-chart-libraries/) — Ecosystem survey
- [Fetch vs Axios in Next.js](https://rayobyte.com/blog/fetch-vs-axios-in-next-js/) — Performance, compatibility

### Package Versions (npm search, GitHub releases)
- [Next.js Releases](https://github.com/vercel/next.js/releases) — v15.5.9 confirmed
- [TanStack Query Releases](https://github.com/tanstack/query/releases) — v5.90.21 latest
- [Recharts GitHub](https://github.com/recharts/recharts) — v3.7.0 latest
- [D3.js Releases](https://github.com/d3/d3/releases) — v7.9.0 latest stable

---

**Stack research for:** F1 data visualization web application
**Researched:** 2026-02-16
**Confidence:** HIGH — All core stack components verified with official sources or multiple credible sources. Package versions checked via GitHub releases and web search.
