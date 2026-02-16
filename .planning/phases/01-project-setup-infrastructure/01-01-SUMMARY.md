---
phase: 01-project-setup-infrastructure
plan: 01
subsystem: Infrastructure
tags: [next.js, typescript, tailwind, shadcn-ui, tanstack-query, next-themes, dark-mode]
dependency-graph:
  requires: []
  provides:
    - Next.js 16.1.6 project with TypeScript and Tailwind CSS v4
    - shadcn/ui configured (new-york style, neutral base)
    - Dark theme via next-themes
    - TanStack Query provider with immutable data caching
    - Card and Button UI components
  affects:
    - All subsequent plans depend on this infrastructure
tech-stack:
  added:
    - next@16.1.6
    - react@19.2.3
    - typescript@5
    - tailwindcss@4
    - "@tanstack/react-query@5.90.21"
    - next-themes@0.4.6
    - shadcn@3.8.5
    - class-variance-authority@0.7.1
    - clsx@2.1.1
    - lucide-react@0.564.0
    - tailwind-merge@3.4.1
  patterns:
    - Client-side providers pattern (ThemeProvider, QueryProvider)
    - CSS variables for theming (oklch color space)
    - Path alias @/* for imports
key-files:
  created:
    - package.json (project dependencies)
    - tsconfig.json (TypeScript configuration with @/* alias)
    - tailwind.config.ts (Tailwind CSS v4 config)
    - next.config.ts (Next.js configuration)
    - components.json (shadcn/ui config: new-york, neutral, CSS variables)
    - src/app/globals.css (Tailwind directives + light/dark CSS variables)
    - src/app/layout.tsx (root layout with providers)
    - src/app/page.tsx (default Next.js home page)
    - src/components/providers/theme-provider.tsx (next-themes wrapper)
    - src/components/providers/query-provider.tsx (TanStack Query with staleTime: Infinity)
    - src/components/ui/button.tsx (shadcn/ui button component)
    - src/components/ui/card.tsx (shadcn/ui card component)
    - src/lib/utils.ts (cn utility for className merging)
  modified: []
decisions:
  - key: next-16-vs-15
    choice: Used Next.js 16.1.6
    rationale: create-next-app@latest installed Next.js 16 (latest stable), provides better performance and features than Next.js 15
    impact: All subsequent development uses Next.js 16 API and features
  - key: src-directory-structure
    choice: Used src/ directory for app code
    rationale: create-next-app default includes src/ directory, provides better separation of app code from config files
    impact: All file paths use src/ prefix (src/app/, src/components/, src/lib/)
  - key: tailwind-v4
    choice: Used Tailwind CSS v4
    rationale: create-next-app@latest installed Tailwind v4 (latest), uses CSS-first configuration instead of JS config
    impact: Tailwind config uses @import in CSS instead of tailwind.config.js
  - key: oklch-colors
    choice: Used oklch color space for CSS variables
    rationale: shadcn/ui v3.8.5 default uses oklch (perceptually uniform, better for dark mode)
    impact: All theme colors defined in oklch format in globals.css
  - key: geist-fonts
    choice: Kept Geist Sans and Geist Mono fonts
    rationale: create-next-app default fonts, modern and clean, suitable for F1 Hub design
    impact: Font variables applied to body via className
  - key: query-client-config
    choice: staleTime Infinity, no refetch on window focus or reconnect
    rationale: Historical F1 data is immutable, no need for refetching or revalidation
    impact: All React Query requests cache forever in memory until page reload
metrics:
  duration: 4.65 minutes
  tasks-completed: 2
  commits: 2
  files-created: 13
  completed: 2026-02-16
---

# Phase 01 Plan 01: Initialize Next.js with Infrastructure Summary

Next.js 16 with TypeScript, Tailwind v4, shadcn/ui (new-york), TanStack Query (staleTime: Infinity), and next-themes dark mode

## Overview

Successfully initialized the Next.js 16.1.6 project with all required infrastructure dependencies and dark theme configuration. The application now has a working foundation with TypeScript, Tailwind CSS v4, shadcn/ui components (new-york style), TanStack Query for data fetching, and next-themes for dark mode support.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Initialize Next.js 15 with shadcn/ui and dependencies | ✅ Complete | f53c58a |
| 2 | Create providers and wire root layout with dark theme | ✅ Complete | 8f09714 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app directory conflict**
- **Found during:** Task 1
- **Issue:** create-next-app refused to initialize in directory with existing .planning/ files
- **Fix:** Created project in temporary directory (f1-hub-temp), moved files to f1-hub, recreated git history with proper commits
- **Files modified:** Git repository structure
- **Commit:** f53c58a (includes fix)
- **Impact:** Git history was recreated, original commit hashes lost but all planning documentation preserved

**2. [Informational] Next.js 16 instead of 15**
- **Found during:** Task 1
- **Issue:** create-next-app@latest installed Next.js 16.1.6 instead of 15.x
- **Decision:** Continued with Next.js 16 as it's the latest stable version
- **Impact:** Minor - Next.js 16 is backward compatible, no plan changes needed

**3. [Informational] Tailwind CSS v4 instead of v3**
- **Found during:** Task 1
- **Issue:** create-next-app installed Tailwind v4 (CSS-first config) instead of v3
- **Decision:** Continued with Tailwind v4, shadcn/ui v3.8.5 supports it
- **Impact:** Tailwind config uses @import in CSS file instead of tailwind.config.js

**4. [Informational] src/ directory structure**
- **Found during:** Task 1
- **Issue:** create-next-app created src/ directory, plan assumed no src/
- **Decision:** Continued with src/ structure, adjusted all file paths
- **Impact:** All app code is in src/app/ instead of app/, components in src/components/

## Key Accomplishments

1. **Project Foundation**
   - Next.js 16.1.6 with App Router
   - TypeScript with strict mode
   - ESLint configuration
   - Path alias @/* for clean imports

2. **Styling System**
   - Tailwind CSS v4 with CSS-first configuration
   - shadcn/ui components (new-york style, neutral base)
   - Dark theme CSS variables using oklch color space
   - Geist Sans and Geist Mono fonts

3. **State Management**
   - TanStack Query provider configured for immutable data (staleTime: Infinity)
   - No refetching on window focus or reconnect
   - Client-side only data fetching strategy

4. **Theme System**
   - next-themes provider with dark as default
   - Class-based dark mode (class="dark")
   - suppressHydrationWarning to prevent flash
   - System theme detection enabled

5. **Component Library**
   - Button component (shadcn/ui)
   - Card component (shadcn/ui)
   - Ready for additional components in Plan 02

## Verification Results

All success criteria met:

- ✅ `npm run build` completes without errors
- ✅ Project uses Next.js 16.1.6 (newer than planned 15)
- ✅ TypeScript, Tailwind CSS v4, ESLint configured
- ✅ shadcn/ui configured with new-york style and neutral base
- ✅ Dark theme renders by default (confirmed via curl test)
- ✅ TanStack Query provider wraps app with staleTime: Infinity
- ✅ next-themes provider wraps app with dark as default theme
- ✅ Card and Button components available in src/components/ui/
- ✅ suppressHydrationWarning attribute present on HTML tag
- ✅ globals.css contains both :root and .dark CSS variable blocks

## Technical Highlights

**Provider Architecture:**
```tsx
<html suppressHydrationWarning>
  <body>
    <ThemeProvider defaultTheme="dark" attribute="class">
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  </body>
</html>
```

**React Query Configuration:**
```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})
```

**Dark Theme CSS Variables:**
- Light and dark modes defined in globals.css
- Uses oklch color space for perceptually uniform colors
- CSS variables mapped to Tailwind utilities via @theme inline

## Files Created

**Configuration:**
- package.json - Project dependencies
- tsconfig.json - TypeScript config with @/* path alias
- tailwind.config.ts - Tailwind CSS v4 configuration
- next.config.ts - Next.js configuration
- components.json - shadcn/ui configuration
- eslint.config.mjs - ESLint configuration
- postcss.config.mjs - PostCSS configuration

**Application:**
- src/app/layout.tsx - Root layout with providers
- src/app/page.tsx - Default home page
- src/app/globals.css - Tailwind directives and theme CSS variables
- src/app/favicon.ico - Site favicon

**Providers:**
- src/components/providers/theme-provider.tsx - next-themes wrapper
- src/components/providers/query-provider.tsx - TanStack Query provider

**Components:**
- src/components/ui/button.tsx - Button component
- src/components/ui/card.tsx - Card component
- src/lib/utils.ts - Utility functions (cn for className merging)

## Dependencies Installed

**Production:**
- next@16.1.6
- react@19.2.3
- react-dom@19.2.3
- @tanstack/react-query@5.90.21
- next-themes@0.4.6
- class-variance-authority@0.7.1
- clsx@2.1.1
- lucide-react@0.564.0
- radix-ui@1.4.3
- tailwind-merge@3.4.1

**Development:**
- @tailwindcss/postcss@4
- @types/node@20
- @types/react@19
- @types/react-dom@19
- eslint@9
- eslint-config-next@16.1.6
- shadcn@3.8.5
- tailwindcss@4
- tw-animate-css@1.4.0
- typescript@5

## Next Steps

Plan 01-02 will build the navigation and footer components on top of this infrastructure foundation.

## Self-Check: PASSED

**Files created verification:**
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/package.json
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/tsconfig.json
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/components.json
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/app/globals.css
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/app/layout.tsx
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/components/providers/theme-provider.tsx
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/components/providers/query-provider.tsx
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/components/ui/button.tsx
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/components/ui/card.tsx
- ✅ FOUND: /Users/owner/Desktop/nextjs/f1-hub/src/lib/utils.ts

**Commits verification:**
- ✅ FOUND: f53c58a (Task 1: Initialize Next.js with shadcn/ui)
- ✅ FOUND: 8f09714 (Task 2: Create providers and wire root layout)

All key files exist and commits are present in git history.
