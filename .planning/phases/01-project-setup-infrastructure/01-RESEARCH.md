# Phase 1: Project Setup & Infrastructure - Research

**Researched:** 2026-02-16
**Domain:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, TanStack Query
**Confidence:** HIGH

## Summary

Phase 1 establishes a production-ready Next.js 15 application with TypeScript, Tailwind CSS, shadcn/ui, and TanStack Query. The modern stack leverages App Router's Server Components by default, with minimal Client Components for interactivity. Dark mode is implemented via CSS variables and next-themes. The setup follows 2026 best practices with automatic TypeScript configuration, Turbopack bundling, and proper client/server boundaries.

**Key insight:** Next.js 15's default behavior has changed significantly from Pages Router—fetch requests are cached by default, most components run server-side, and the App Router requires careful separation of server and client responsibilities. Understanding these boundaries prevents the most common pitfalls.

**Primary recommendation:** Use `create-next-app@latest` with default settings (TypeScript, Tailwind CSS, ESLint, App Router enabled), then layer in shadcn/ui and TanStack Query following established patterns. Keep 95% of components as Server Components, isolating interactivity to small client islands.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (latest) | React framework with App Router | Official React framework, built-in routing, SSR, and optimization |
| React | 19.x (canary) | UI library | App Router uses React canary releases with all stable React 19 changes |
| TypeScript | 5.1.0+ | Type safety | Built-in support, auto-generated config, IDE integration |
| Tailwind CSS | 3.x or 4.x | Utility-first CSS | Built-in Next.js support, v3 stable default, v4 CSS-first config |
| shadcn/ui | latest | Component library | Copy-paste components, full control, excellent dark theme support |
| TanStack Query | 5.x | Data fetching/caching | Industry standard for client-side data, works with App Router |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | latest | Theme management | Dark mode switching with SSR support, prevents hydration flash |
| Turbopack | built-in | Build tool | Default bundler in Next.js 15, faster than Webpack |
| ESLint | latest | Linting | Default linter with @next/eslint-plugin-next for Next.js-specific rules |
| lucide-react | latest | Icons | shadcn/ui's default icon library, tree-shakeable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Material-UI, Chakra | shadcn/ui gives full control (copy-paste), others are npm packages |
| Tailwind v3 | Tailwind v4 | v4 has CSS-first config and smaller bundles, but v3 is more stable |
| ESLint | Biome | Biome is faster and combines linting/formatting, but ESLint has more ecosystem support |
| TanStack Query | SWR | Both excellent, TanStack Query has more features and community adoption |

**Installation:**
```bash
# Create Next.js app with defaults
npx create-next-app@latest f1-hub --yes

# Add shadcn/ui
npx shadcn@latest init

# Add TanStack Query
npm install @tanstack/react-query

# Add next-themes (for dark mode)
npm install next-themes
```

## Architecture Patterns

### Recommended Project Structure
```
f1-hub/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page (/)
│   ├── globals.css          # Tailwind + CSS variables
│   └── [module]/            # Module routes (drivers, teams, etc.)
├── components/
│   ├── ui/                  # shadcn/ui components (Card, Button, etc.)
│   ├── providers/           # Client-side providers (QueryClient, Theme)
│   └── layout/              # Navigation, Footer
├── lib/
│   ├── utils.ts             # cn() helper for class names
│   └── query-client.ts      # TanStack Query configuration
├── public/                  # Static assets
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

### Pattern 1: Server Components by Default
**What:** All components in the App Router are Server Components unless marked with "use client"
**When to use:** For static content, data fetching, layouts, and any non-interactive UI
**Example:**
```typescript
// app/page.tsx - Server Component (no "use client")
// Source: https://nextjs.org/docs/app/getting-started/project-structure
export default function HomePage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold">F1 Hub</h1>
      {/* Server-rendered content */}
    </main>
  )
}
```

### Pattern 2: Client Component Islands
**What:** Isolate interactivity to small client components, pass as children to server components
**When to use:** For theme toggles, navigation menus, interactive cards
**Example:**
```typescript
// components/providers/theme-provider.tsx
// Source: https://ui.shadcn.com/docs/dark-mode/next
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Pattern 3: TanStack Query Provider Setup
**What:** Create a client provider component wrapping QueryClientProvider
**When to use:** Root layout to enable client-side data fetching throughout the app
**Example:**
```typescript
// components/providers/query-provider.tsx
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance per request to avoid sharing data between users
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Historical F1 data never changes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Pattern 4: Root Layout with Providers
**What:** Compose multiple providers in root layout, use suppressHydrationWarning for theme
**When to use:** app/layout.tsx to wrap entire application
**Example:**
```typescript
// app/layout.tsx
// Source: https://nextjs.org/docs/app/getting-started/project-structure
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 5: Responsive Navigation with Tailwind
**What:** Use Tailwind responsive classes (hidden/block at breakpoints) for mobile/desktop layouts
**When to use:** Navigation component that adapts to screen size
**Example:**
```typescript
// components/layout/navigation.tsx
// Source: https://codewithmarish.com/post/how-to-create-responsive-navbar-in-next-js
"use client"

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6 py-4">
          <a href="/">Home</a>
          <a href="/drivers">Drivers</a>
          {/* ... */}
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden">
          {/* Mobile menu implementation */}
        </div>
      </div>
    </nav>
  )
}
```

### Pattern 6: Dark Mode CSS Variables
**What:** Define light and dark themes using CSS variables in globals.css
**When to use:** During shadcn/ui initialization, configured automatically
**Example:**
```css
/* app/globals.css */
/* Source: https://ui.shadcn.com/docs/theming */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### Anti-Patterns to Avoid
- **Adding "use client" to every component**: Makes entire tree client-side, losing server component benefits
- **Creating API routes for client components**: Use Server Actions or direct async functions in Server Components instead
- **Ignoring fetch caching defaults**: Next.js 15 caches fetch by default, causing stale data issues
- **Placing Suspense inside async components**: Suspense must wrap async components from parent
- **Storing state in shared layouts**: Layouts don't re-render when child pages change

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode toggle | Custom theme state management | next-themes | Handles SSR hydration, localStorage sync, system preference detection |
| UI components | Custom button, card, dialog components | shadcn/ui | Accessible, dark mode support, customizable, battle-tested |
| Class name merging | String concatenation with ternaries | cn() utility (clsx + tailwind-merge) | Handles conflicts, merges Tailwind classes correctly |
| Data caching | Custom fetch wrapper with state | TanStack Query | Handles caching, revalidation, background refetching, error states |
| Responsive design breakpoints | Custom media query hooks | Tailwind responsive classes | SSR-compatible, no hydration issues, consistent breakpoints |
| TypeScript config | Manual tsconfig.json | Next.js auto-generation | Includes all necessary compiler options and path aliases |

**Key insight:** The ecosystem has mature solutions for infrastructure concerns. Building custom solutions adds maintenance burden without adding value. shadcn/ui's copy-paste model gives control while avoiding reinvention.

## Common Pitfalls

### Pitfall 1: Using Client-Side Hooks in Server Components
**What goes wrong:** `useState`, `useEffect`, `onClick` fail with cryptic errors in Server Components
**Why it happens:** App Router defaults to Server Components, developers use patterns from Pages Router or client-side React
**How to avoid:** Add "use client" directive at top of file for any component using interactivity
**Warning signs:** Error messages mentioning "You're importing a component that needs useState/useEffect"

### Pitfall 2: Fetch Caching Surprises
**What goes wrong:** Data appears frozen, updates don't show, revalidation doesn't work as expected
**Why it happens:** Next.js 15 caches fetch requests by default (breaking change from Pages Router)
**How to avoid:** Explicitly set cache strategy: `fetch(url, { cache: "no-store" })` for dynamic data or `fetch(url, { next: { revalidate: 60 } })` for time-based revalidation
**Warning signs:** Data not updating after mutations, stale content persisting across refreshes

### Pitfall 3: Layout State Persistence
**What goes wrong:** State in layout.tsx persists when navigating between pages, metadata doesn't update
**Why it happens:** Layouts don't re-render when child pages change (by design for performance)
**How to avoid:** Keep page-specific state in page.tsx, not layout.tsx. Use route-specific layouts if needed
**Warning signs:** State "leaking" between different pages, inability to reset state on navigation

### Pitfall 4: Incorrect Suspense Boundary Placement
**What goes wrong:** Suspense fallback doesn't show, or async data fetching errors occur
**Why it happens:** Suspense must be placed in parent component, not inside the async component
**How to avoid:** Wrap async Server Components with `<Suspense>` from their parent
**Warning signs:** Loading states not appearing, errors about Suspense boundaries

### Pitfall 5: Route Handler Caching with GET
**What goes wrong:** GET route handlers return stale data, seem prerendered at build time
**Why it happens:** GET Route Handlers are cached by default in Next.js 15
**How to avoid:** Use route segment config `export const dynamic = 'force-dynamic'` or fetch with `cache: 'no-store'`
**Warning signs:** API routes returning old data, changes not reflected until rebuild

### Pitfall 6: redirect() in Try/Catch Blocks
**What goes wrong:** Redirects don't execute when inside try/catch
**Why it happens:** `redirect()` throws a special Next.js error with `never` return type, caught by try/catch
**How to avoid:** Keep redirects outside try/catch blocks at component/action top level
**Warning signs:** Redirects silently failing, navigation not happening after form submissions

### Pitfall 7: Missing suppressHydrationWarning with next-themes
**What goes wrong:** Console warnings about hydration mismatch on `<html>` tag
**Why it happens:** next-themes adds `class="dark"` on client, but server doesn't know the theme yet
**How to avoid:** Add `suppressHydrationWarning` to `<html>` tag in root layout
**Warning signs:** Hydration warnings in console, brief flash of wrong theme

### Pitfall 8: Wrong Import Paths After shadcn/ui Init
**What goes wrong:** Can't import components, TypeScript errors about missing modules
**Why it happens:** components.json aliases (@/components/ui) must match tsconfig.json paths
**How to avoid:** Ensure tsconfig.json includes path mappings matching components.json aliases
**Warning signs:** Import errors like "Cannot find module '@/components/ui/button'"

### Pitfall 9: Unnecessary Route Handlers with Server Components
**What goes wrong:** Creating /api routes to fetch data for Server Components, adding extra network hop
**Why it happens:** Developers assume Server Components need API routes like client components do
**How to avoid:** Call async functions directly in Server Components, no API route needed
**Warning signs:** Fetch calls to localhost in Server Components, unnecessary Route Handlers

### Pitfall 10: Overusing "use client"
**What goes wrong:** Performance degrades, bundle size increases, losing Server Component benefits
**Why it happens:** Adding "use client" to parent components makes all children client components
**How to avoid:** Push "use client" to leaf nodes, pass client components as children to server components
**Warning signs:** Large client bundle, hydration taking long time, many components with "use client"

## Code Examples

Verified patterns from official sources:

### Creating New Next.js 15 Project
```bash
# Source: https://nextjs.org/docs/app/getting-started/installation
# Default setup: TypeScript, Tailwind CSS, ESLint, App Router, Turbopack
npx create-next-app@latest f1-hub --yes

# With custom settings (if not using --yes)
npx create-next-app@latest f1-hub --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### shadcn/ui Initialization
```bash
# Source: https://ui.shadcn.com/docs/installation/next
# Initialize shadcn/ui (creates components.json, adds CSS variables)
npx shadcn@latest init

# Prompts will ask:
# - Style: new-york (recommended)
# - Base color: neutral (for dark minimalist theme)
# - CSS variables: yes

# Add individual components
npx shadcn@latest add button card
```

### components.json Configuration
```json
// Source: https://ui.shadcn.com/docs/components-json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### tsconfig.json Path Aliases
```json
// Source: https://nextjs.org/docs/app/getting-started/installation
// Auto-generated by create-next-app, but verify these are present
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### TanStack Query with Immutable Data Pattern
```typescript
// lib/query-client.ts
// Source: https://github.com/TanStack/query/discussions/1685
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Historical F1 data never changes
      cacheTime: Infinity, // Keep in memory indefinitely
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})
```

### Landing Page with Module Cards
```typescript
// app/page.tsx
// Source: Next.js App Router patterns
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const modules = [
  { name: "Drivers", description: "View driver standings and profiles", href: "/drivers" },
  { name: "Teams", description: "Explore constructor standings and history", href: "/teams" },
  { name: "Races", description: "Browse race results and schedules", href: "/races" },
  { name: "Stats", description: "Dive into historical statistics", href: "/stats" },
]

export default function HomePage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">F1 Hub</h1>
        <p className="text-xl text-muted-foreground">
          Explore Formula 1 data and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {modules.map((module) => (
          <a key={module.name} href={module.href}>
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </main>
  )
}
```

### Responsive Navigation Component
```typescript
// components/layout/navigation.tsx
// Source: https://codewithmarish.com/post/how-to-create-responsive-navbar-in-next-js
"use client"

import Link from "next/link"
import { useState } from "react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/drivers", label: "Drivers" },
    { href: "/teams", label: "Teams" },
    { href: "/races", label: "Races" },
    { href: "/stats", label: "Stats" },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8 py-4">
          <Link href="/" className="text-xl font-bold">F1 Hub</Link>
          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">F1 Hub</Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {/* Hamburger icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div className="py-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
```

### Disclaimer Footer Component
```typescript
// components/layout/footer.tsx
export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        Unofficial, not affiliated with Formula 1
      </div>
    </footer>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/`) | App Router (`app/`) | Next.js 13+ (stable in 14, default in 15) | Server Components by default, new routing, layouts, loading states |
| Manual TypeScript setup | Auto-generated tsconfig.json | Next.js 13+ | Rename file to `.tsx`, run `next dev`, config created automatically |
| Custom CSS modules | Tailwind CSS built-in | Next.js 11+ | Zero config Tailwind support with `create-next-app --tailwind` |
| getServerSideProps, getStaticProps | Server Components + fetch | Next.js 13+ | Data fetching directly in components, simpler mental model |
| API Routes required for data | Direct async functions in Server Components | Next.js 13+ | No intermediate API layer needed for server-side data |
| Webpack | Turbopack | Next.js 15 (default) | Faster builds and HMR, enabled by default |
| React 18 stable | React 19 canary | Next.js 15 App Router | Uses canary releases with stable features + validated experimental features |
| Tailwind v3 config file | Tailwind v4 CSS-first | Tailwind v4 (2024) | Configuration in CSS with @theme, smaller bundles, but v3 still default |
| Manual dark mode implementation | next-themes | Current standard | Handles SSR, hydration, localStorage, system preferences |

**Deprecated/outdated:**
- **Pages Router patterns in App Router**: `getServerSideProps`, `getStaticProps`, `_app.tsx` don't exist in App Router
- **Client-side only data fetching**: Server Components can fetch directly, no need for useEffect + fetch
- **Excessive API routes**: Most can be eliminated with Server Components or Server Actions
- **Class-based components**: Functional components with hooks are standard
- **Manual ESLint setup**: `create-next-app` includes @next/eslint-plugin-next by default

## Open Questions

1. **Tailwind v3 vs v4**
   - What we know: v4 has CSS-first config, smaller bundles, automatic content detection
   - What's unclear: Production readiness, migration path, ecosystem compatibility
   - Recommendation: Use v3 (stable default) for initial setup, evaluate v4 migration later

2. **Module route structure**
   - What we know: Each module (drivers, teams, races, stats) needs a route
   - What's unclear: Whether to use `/drivers`, `/teams` or group them under `/modules/drivers`
   - Recommendation: Use top-level routes (`/drivers`) for simplicity, matches user mental model

3. **Build-time vs runtime data fetching**
   - What we know: Historical F1 data is immutable (perfect for static generation)
   - What's unclear: Whether to pre-generate all data at build or use on-demand ISR
   - Recommendation: Start with client-side TanStack Query (simpler), optimize with SSR later if needed

## Sources

### Primary (HIGH confidence)
- [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation) - Official setup guide, verified 2026-02-11
- [Next.js create-next-app CLI Reference](https://nextjs.org/docs/app/api-reference/cli/create-next-app) - Command flags and options
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Official shadcn/ui setup
- [shadcn/ui components.json](https://ui.shadcn.com/docs/components-json) - Configuration reference
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - App Router organization
- [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) - Next.js App Router integration

### Secondary (MEDIUM confidence)
- [Vercel: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Official Vercel blog
- [App Router Pitfalls (imidef)](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Recent comprehensive guide (2026-02-11)
- [Tailwind + Next.js Setup Guide 2026](https://designrevision.com/blog/tailwind-nextjs-setup) - Current best practices
- [shadcn/ui Complete Guide 2026](https://designrevision.com/blog/shadcn-ui-guide) - Comprehensive overview
- [Integrate TanStack Query with Next.js App Router 2025](https://www.storieasy.com/blog/integrate-tanstack-query-with-next-js-app-router-2025-ultimate-guide) - Setup patterns
- [TanStack Query Next.js Example](https://tanstack.com/query/v5/docs/framework/react/examples/nextjs) - Official example

### Tertiary (LOW confidence - for validation)
- [Next.js 15 Upgrade Guide](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration) - Breaking changes overview
- [Medium: shadcn/ui Dark Mode](https://medium.com/@elhamrani.omar23/dark-mode-using-shadcn-with-nextjs-2b3f7163a4cb) - Implementation examples
- [Medium: Responsive Navbar Next.js](https://medium.com/@hanekcud/how-to-create-responsive-navbar-in-next-js-using-tailwind-css-eed2e7dc925a) - Pattern examples
- [GitHub Discussion: TanStack Query staleTime](https://github.com/TanStack/query/discussions/1685) - Immutable data pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All official sources, current versions verified
- Architecture: HIGH - Official Next.js and shadcn/ui documentation patterns
- Pitfalls: HIGH - Verified with official Vercel blog and recent 2026 guide
- Code examples: HIGH - All patterns from official documentation or verified guides

**Research date:** 2026-02-16
**Valid until:** 30 days (stable stack, but Next.js releases frequently)
**Recommended refresh:** Before Phase 1 execution if > 2 weeks elapsed
