# Architecture Research

**Domain:** F1 Hub — Radio Module Integration
**Researched:** 2026-02-19
**Confidence:** HIGH (codebase verified by direct inspection; OpenF1 endpoint fields confirmed via web search)

---

## Radio Module Integration Overview

This document focuses on how the Radio module integrates with the existing F1 Hub architecture. For the general application architecture, see the base architecture section at the bottom.

The existing architecture is: Next.js 16 App Router, `src/` layout, `openf1Fetch` with `TokenBucketQueue` at 3 req/s, `jolpikaFetch` at 4 req/s, TanStack Query throughout, `jolpikaKeys` query-key factory in `src/lib/api/jolpica/query-keys.ts`.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                       src/app/radio/page.tsx                          │
│                       (Server Component wrapper)                      │
├──────────────────────────────────────────────────────────────────────┤
│                  src/components/radio/RadioClient.tsx                 │
│                  (Client Component — owns all radio state)            │
│                                                                       │
│  ┌──────────────────────┐   ┌──────────────────────────────────────┐  │
│  │   Session Picker     │   │           Radio List Panel           │  │
│  │  SeasonSelect (reuse)│   │  src/components/radio/RadioList.tsx  │  │
│  │  SessionSelect (new) │   │                                      │  │
│  │  DriverFilter (new)  │   │  ┌────────────────────────────────┐  │  │
│  └──────────────────────┘   │  │  RadioCard (per transmission)  │  │  │
│                              │  │  - driver name/number/color    │  │  │
│  ┌──────────────────────┐   │  │  - timestamp                   │  │  │
│  │  Race Context Panel  │   │  │  - lap / position badge        │  │  │
│  │  RaceControlFeed.tsx │   │  │  - AudioPlayer (inline)        │  │  │
│  │  (new)               │   │  └────────────────────────────────┘  │  │
│  └──────────────────────┘   └──────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│                       hooks/ (new OpenF1 hooks)                       │
│  useOpenF1Sessions   useTeamRadio   useLaps   usePosition             │
│  useRaceControl      useOpenF1Drivers                                 │
├──────────────────────────────────────────────────────────────────────┤
│                  src/lib/api/openf1/ (existing client)                │
│  client.ts — openf1Fetch + TokenBucketQueue (3 req/s) — unchanged    │
│  types.ts  — add OpenF1Session, OpenF1RaceControl — extend only       │
│  endpoints.ts (NEW) — fetch functions for radio module endpoints      │
│  query-keys.ts (NEW) — openf1Keys factory mirroring jolpikaKeys       │
├──────────────────────────────────────────────────────────────────────┤
│                     External APIs (client-side only)                  │
│  OpenF1: /sessions  /team_radio  /laps  /position  /race_control     │
│           /drivers                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## New vs Modified Files

### Files to CREATE

```
src/
├── app/
│   └── radio/
│       └── page.tsx                              # Route entry point
│
├── components/
│   └── radio/
│       ├── RadioClient.tsx                       # Top-level client component
│       ├── SessionSelect.tsx                     # OpenF1 session picker (year → sessions)
│       ├── RadioList.tsx                         # Scrollable list of radio transmissions
│       ├── RadioCard.tsx                         # Single transmission card + inline player
│       ├── AudioPlayer.tsx                       # HTML audio controls, play/pause/progress
│       ├── RaceControlFeed.tsx                   # Race Control events overlay/sidebar
│       └── loading/
│           └── RadioListSkeleton.tsx             # Skeleton while radio loads
│
├── hooks/
│   ├── useOpenF1Sessions.ts                      # /sessions?year=&session_name=Race
│   ├── useTeamRadio.ts                           # /team_radio?session_key=
│   ├── useOpenF1Drivers.ts                       # /drivers?session_key= (OpenF1 version)
│   ├── useLaps.ts                                # /laps?session_key=&driver_number=
│   ├── usePosition.ts                            # /position?session_key=&driver_number=
│   └── useRaceControl.ts                         # /race_control?session_key=
│
└── lib/
    └── api/
        └── openf1/
            ├── endpoints.ts                      # fetch functions for all Radio endpoints
            ├── query-keys.ts                     # openf1Keys factory (mirrors jolpikaKeys)
            └── utils/
                └── correlateRadioContext.ts      # timestamp → lap/position lookup util
```

### Files to MODIFY

```
src/
├── app/
│   └── page.tsx                                  # Update Team Radio card: href="#" → href="/radio"
│
├── components/
│   └── layout/
│       └── navigation.tsx                        # Add "Radio" nav link
│
└── lib/
    └── api/
        └── openf1/
            └── types.ts                          # Add OpenF1Session, OpenF1RaceControl types
```

### Files that are UNCHANGED

Everything in `src/lib/api/openf1/client.ts` — the `openf1Fetch` function and `TokenBucketQueue` are exactly right. Do not modify them. The Radio module plugs into this client the same way the quiz/head-to-head modules plug into `jolpikaFetch`.

---

## New Type Definitions

Add to `src/lib/api/openf1/types.ts`:

```typescript
// Append to existing file — do not replace existing types

export interface OpenF1Session {
  circuit_key: number;
  circuit_short_name: string;       // e.g. "Monza"
  country_code: string;             // e.g. "ITA"
  country_key: number;
  country_name: string;
  date_end: string;                 // ISO datetime
  date_start: string;               // ISO datetime
  gmt_offset: string;               // e.g. "+02:00"
  location: string;                 // city
  meeting_key: number;
  session_key: number;              // primary key for all other endpoints
  session_name: string;             // e.g. "Race", "Qualifying", "Sprint"
  session_type: string;             // e.g. "Race", "Qualifying"
  year: number;
}

export interface OpenF1RaceControl {
  category: string;                 // "Flag", "SafetyCar", "DRS", etc.
  date: string;                     // ISO datetime — correlate with radio.date
  driver_number: number | null;     // null for track-wide events
  flag: string | null;              // "GREEN", "YELLOW", "RED", "CHEQUERED", etc.
  lap_number: number | null;
  meeting_key: number;
  message: string;                  // human-readable, e.g. "SAFETY CAR DEPLOYED"
  qualifying_phase: string | null;  // "Q1", "Q2", "Q3" or null
  scope: string | null;             // "Track", "Sector", "Driver"
  sector: number | null;
  session_key: number;
}

// OpenF1TeamRadio already exists in types.ts — no changes needed
// OpenF1LapData already exists in types.ts — no changes needed
// OpenF1Position already exists in types.ts — no changes needed
// OpenF1Driver already exists in types.ts — no changes needed
```

---

## New Query Key Factory

Create `src/lib/api/openf1/query-keys.ts` mirroring the existing jolpikaKeys pattern:

```typescript
/**
 * Query key factory for all OpenF1 hooks.
 * Pattern: ['openf1', domain, ...specifics]
 * Mirrors src/lib/api/jolpica/query-keys.ts structure.
 */
export const openf1Keys = {
  all: ["openf1"] as const,

  /** All sessions for a given year, optionally filtered by session name */
  sessions: (year: number, sessionName?: string) =>
    [...openf1Keys.all, "sessions", year, sessionName ?? "all"] as const,

  /** All drivers in a session (OpenF1 version, not Jolpica) */
  sessionDrivers: (sessionKey: number) =>
    [...openf1Keys.all, "drivers", sessionKey] as const,

  /** All team radio transmissions for a session */
  teamRadio: (sessionKey: number) =>
    [...openf1Keys.all, "team-radio", sessionKey] as const,

  /** Lap data for a driver within a session */
  laps: (sessionKey: number, driverNumber?: number) =>
    [...openf1Keys.all, "laps", sessionKey, driverNumber ?? "all"] as const,

  /** Position data for a driver within a session */
  position: (sessionKey: number, driverNumber?: number) =>
    [...openf1Keys.all, "position", sessionKey, driverNumber ?? "all"] as const,

  /** Race control events for a session */
  raceControl: (sessionKey: number) =>
    [...openf1Keys.all, "race-control", sessionKey] as const,
} as const;
```

---

## New Endpoint Functions

Create `src/lib/api/openf1/endpoints.ts`:

```typescript
import { openf1Fetch } from "@/lib/api/openf1/client";
import type {
  OpenF1Session,
  OpenF1TeamRadio,
  OpenF1Driver,
  OpenF1LapData,
  OpenF1Position,
  OpenF1RaceControl,
} from "@/lib/api/openf1/types";

/** Fetch all sessions for a year. Filter by session_name for races only. */
export async function fetchOpenF1Sessions(
  year: number,
  sessionName?: string
): Promise<OpenF1Session[]> {
  const params = new URLSearchParams({ year: String(year) });
  if (sessionName) params.set("session_name", sessionName);
  return openf1Fetch<OpenF1Session[]>(`/sessions?${params}`);
}

/** Fetch all team radio transmissions for a session. */
export async function fetchTeamRadio(
  sessionKey: number
): Promise<OpenF1TeamRadio[]> {
  return openf1Fetch<OpenF1TeamRadio[]>(
    `/team_radio?session_key=${sessionKey}`
  );
}

/** Fetch drivers who participated in a session (OpenF1 list, has headshots). */
export async function fetchOpenF1Drivers(
  sessionKey: number
): Promise<OpenF1Driver[]> {
  return openf1Fetch<OpenF1Driver[]>(`/drivers?session_key=${sessionKey}`);
}

/** Fetch all lap data for a session, optionally filtered to one driver. */
export async function fetchLaps(
  sessionKey: number,
  driverNumber?: number
): Promise<OpenF1LapData[]> {
  const params = new URLSearchParams({ session_key: String(sessionKey) });
  if (driverNumber) params.set("driver_number", String(driverNumber));
  return openf1Fetch<OpenF1LapData[]>(`/laps?${params}`);
}

/** Fetch position data for a session, optionally filtered to one driver. */
export async function fetchPosition(
  sessionKey: number,
  driverNumber?: number
): Promise<OpenF1Position[]> {
  const params = new URLSearchParams({ session_key: String(sessionKey) });
  if (driverNumber) params.set("driver_number", String(driverNumber));
  return openf1Fetch<OpenF1Position[]>(`/position?${params}`);
}

/** Fetch all race control events for a session. */
export async function fetchRaceControl(
  sessionKey: number
): Promise<OpenF1RaceControl[]> {
  return openf1Fetch<OpenF1RaceControl[]>(
    `/race_control?session_key=${sessionKey}`
  );
}
```

---

## New Hooks

All hooks follow the exact same pattern as `src/hooks/useRaces.ts` — `skipToken` when session key is absent, `staleTime: Infinity` since historical session data is immutable.

### `src/hooks/useOpenF1Sessions.ts`

```typescript
import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchOpenF1Sessions } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useOpenF1Sessions(year: number | undefined, sessionName?: string) {
  return useQuery({
    queryKey: openf1Keys.sessions(year ?? 0, sessionName),
    queryFn: year
      ? () => fetchOpenF1Sessions(year, sessionName)
      : skipToken,
    staleTime: Infinity,
  });
}
```

### `src/hooks/useTeamRadio.ts`

```typescript
import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchTeamRadio } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useTeamRadio(sessionKey: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.teamRadio(sessionKey ?? 0),
    queryFn: sessionKey ? () => fetchTeamRadio(sessionKey) : skipToken,
    staleTime: Infinity,
  });
}
```

Repeat the same pattern for `useOpenF1Drivers`, `useLaps`, `usePosition`, `useRaceControl`.

---

## Audio State Management

### Decision: Module-Level React State (not Context)

Use `useState` in `RadioClient.tsx` to track the currently playing URL. Do NOT create a React Context for audio state. Rationale:

- Audio is only needed within the Radio module. Context would leak this concern to the root layout.
- A single `currentUrl: string | null` + `setCurrentUrl` passed down to `RadioList` → `RadioCard` → `AudioPlayer` is a two-level prop chain — manageable without Context.
- Context adds indirection and makes the component tree harder to read for what is essentially one piece of shared state within one route.

Use Context only if audio needs to persist across route navigations (e.g., playing while browsing other modules). That is not a requirement for v1.1.

### Audio State Shape

```typescript
// In RadioClient.tsx
const [currentUrl, setCurrentUrl] = useState<string | null>(null);
```

### AudioPlayer Component Pattern

Use a module-scoped `ref` singleton for the `HTMLAudioElement` to guarantee only one audio plays at a time, independent of React render cycles:

```typescript
// src/components/radio/AudioPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

// Module-level singleton — one audio element for the whole radio module lifetime.
// This prevents overlapping playback when React re-mounts AudioPlayer instances.
let globalAudio: HTMLAudioElement | null = null;

interface AudioPlayerProps {
  url: string;
  isActive: boolean;           // true when this card's URL === currentUrl in parent
  onPlay: (url: string) => void;
  onStop: () => void;
}

export function AudioPlayer({ url, isActive, onPlay, onStop }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // When another card becomes active, stop this one
  useEffect(() => {
    if (!isActive && isPlaying) {
      globalAudio?.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, isPlaying]);

  function handlePlay() {
    // Pause whatever is currently playing
    if (globalAudio && globalAudio.src !== url) {
      globalAudio.pause();
    }
    // Create or reuse the singleton
    if (!globalAudio || globalAudio.src !== url) {
      globalAudio = new Audio(url);
      globalAudio.addEventListener("timeupdate", () => {
        setProgress(globalAudio!.currentTime);
      });
      globalAudio.addEventListener("loadedmetadata", () => {
        setDuration(globalAudio!.duration);
      });
      globalAudio.addEventListener("ended", () => {
        setIsPlaying(false);
        onStop();
      });
    }
    globalAudio.play();
    setIsPlaying(true);
    onPlay(url);
  }

  function handlePause() {
    globalAudio?.pause();
    setIsPlaying(false);
  }

  // ... render play/pause button and progress bar
}
```

**Why not `<audio>` element in JSX:** The `<audio>` element in JSX gets unmounted and remounted as the list re-renders (e.g., driver filter changes), resetting playback state. The module-scoped singleton survives re-renders cleanly.

---

## Timestamp Correlation: Radio → Lap and Position

This is the most architecturally novel part of the Radio module.

### Problem

`OpenF1TeamRadio.date` is an ISO timestamp string. `OpenF1LapData.date_start` is also an ISO timestamp. `OpenF1Position.date` is also an ISO timestamp. There is no `lap_number` or `position` field on the team radio object — they must be derived from timestamp proximity.

### Approach: Binary Search on Pre-Sorted Arrays

Load laps and positions for the entire session (all drivers). Sort by timestamp once. For each radio transmission, binary search to find the closest lap start and most recent position entry before the radio timestamp.

Create `src/lib/api/openf1/utils/correlateRadioContext.ts`:

```typescript
import type { OpenF1LapData, OpenF1Position, OpenF1TeamRadio } from "@/lib/api/openf1/types";

export interface RadioContext {
  lapNumber: number | null;
  position: number | null;
}

/**
 * Pre-process laps and positions into sorted arrays for efficient lookup.
 * Call once when data loads; pass the result into correlateRadioContext.
 */
export function buildContextIndex(
  laps: OpenF1LapData[],
  positions: OpenF1Position[]
) {
  const sortedLaps = [...laps].sort(
    (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
  );
  const sortedPositions = [...positions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return { sortedLaps, sortedPositions };
}

/**
 * Find the lap number and race position at the moment a radio transmission occurred.
 * Uses binary search for O(log n) per radio entry — important when sessions have
 * thousands of position entries.
 */
export function correlateRadioContext(
  radio: OpenF1TeamRadio,
  sortedLaps: OpenF1LapData[],
  sortedPositions: OpenF1Position[]
): RadioContext {
  const radioTs = new Date(radio.date).getTime();

  // Lap: find the last lap whose date_start is <= radioTs for this driver
  const driverLaps = sortedLaps.filter(
    (l) => l.driver_number === radio.driver_number
  );
  const lapEntry = findLastBefore(driverLaps, radioTs, (l) =>
    new Date(l.date_start).getTime()
  );

  // Position: find the last position entry <= radioTs for this driver
  const driverPositions = sortedPositions.filter(
    (p) => p.driver_number === radio.driver_number
  );
  const posEntry = findLastBefore(driverPositions, radioTs, (p) =>
    new Date(p.date).getTime()
  );

  return {
    lapNumber: lapEntry?.lap_number ?? null,
    position: posEntry?.position ?? null,
  };
}

/** Binary search: last entry where getTs(entry) <= targetTs */
function findLastBefore<T>(
  sorted: T[],
  targetTs: number,
  getTs: (item: T) => number
): T | null {
  let lo = 0;
  let hi = sorted.length - 1;
  let result: T | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (getTs(sorted[mid]) <= targetTs) {
      result = sorted[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}
```

### Practical Scope Limitation

Loading `/laps` and `/position` for an entire race session for all drivers is expensive — position data is sampled at ~3.7 Hz over 1–2 hours, yielding tens of thousands of entries. Mitigation:

- Load laps for all drivers (manageable: ~20 drivers × ~60 laps = ~1200 records)
- Load position only for the currently filtered driver, not all drivers at once
- The `usePosition` hook accepts an optional `driverNumber` — use it when a driver filter is active
- When no driver filter is active, omit position data and show only lap number

This is tracked as a pitfall in PITFALLS.md.

---

## Session Selection Data Flow

The Radio module introduces a two-step OpenF1 session picker that does not exist elsewhere in the app. Existing shared components (`SeasonSelect`, `RaceSelect`) operate on Jolpica data (which knows seasons as years and races as rounds). OpenF1 operates on `session_key` — a different identifier system.

### Why a new `SessionSelect` is needed

`SeasonSelect` drives `RaceSelect` via a Jolpica round number. OpenF1 needs a `session_key` (integer). The two identifier spaces do not overlap. A new `SessionSelect` component reads from `useOpenF1Sessions` and yields a `session_key`.

### Flow

```
SeasonSelect (reuse existing)
  year (string) → cast to number
    ↓
useOpenF1Sessions(year, "Race")   ← filters to race sessions only
  returns OpenF1Session[]
    ↓
SessionSelect (new component)
  displays circuit_short_name + year
  yields session_key (number)
    ↓
All radio hooks receive session_key:
  useTeamRadio(sessionKey)
  useOpenF1Drivers(sessionKey)
  useRaceControl(sessionKey)
  useLaps(sessionKey, driverNumber?)
  usePosition(sessionKey, driverNumber?)
```

### Note on SeasonSelect reuse

The existing `SeasonSelect` reads Jolpica seasons (strings like `"2024"`). For the Radio module, cast the selected season string to a number before passing to `useOpenF1Sessions`. OpenF1 data is only available from 2023 onward — display a warning if the user selects a year before 2023. Alternatively, restrict the `SessionSelect` list to 2023+ but keep `SeasonSelect` unmodified.

---

## Component Responsibilities

| Component | File | New/Modified | Responsibility |
|-----------|------|-------------|----------------|
| `RadioClient` | `src/components/radio/RadioClient.tsx` | NEW | Owns `sessionKey`, `selectedDriverNumber`, `currentUrl` state; orchestrates all hooks; lays out the page |
| `SessionSelect` | `src/components/radio/SessionSelect.tsx` | NEW | Renders OpenF1 sessions dropdown for a given year; yields `session_key` |
| `RadioList` | `src/components/radio/RadioList.tsx` | NEW | Renders sorted list of `RadioCard` items; receives radio data + context map |
| `RadioCard` | `src/components/radio/RadioCard.tsx` | NEW | Renders one radio transmission: driver info, timestamp, lap/position badges, `AudioPlayer` |
| `AudioPlayer` | `src/components/radio/AudioPlayer.tsx` | NEW | Play/pause/progress controls for one `recording_url`; uses module-scoped audio singleton |
| `RaceControlFeed` | `src/components/radio/RaceControlFeed.tsx` | NEW | Renders chronological race control events (flags, safety car, etc.) as a sidebar or overlay |
| `RadioListSkeleton` | `src/components/radio/loading/RadioListSkeleton.tsx` | NEW | Skeleton placeholder while radio/driver data loads |
| `page.tsx` (radio) | `src/app/radio/page.tsx` | NEW | Next.js server component wrapper; wraps `RadioClient` in Suspense |
| `page.tsx` (home) | `src/app/page.tsx` | MODIFY | Change Team Radio card `href` from `"#"` to `"/radio"`, remove `status: "Planned"` |
| `navigation.tsx` | `src/components/layout/navigation.tsx` | MODIFY | Add `{ name: "Radio", href: "/radio" }` to `navLinks` array |
| `types.ts` | `src/lib/api/openf1/types.ts` | MODIFY | Append `OpenF1Session` and `OpenF1RaceControl` interfaces |

---

## Data Flow: Full Request Sequence

```
1. User lands on /radio
   └── RadioClient mounts

2. User selects year (e.g. 2024) via SeasonSelect
   └── useOpenF1Sessions(2024, "Race") fires
   └── openf1Fetch("/sessions?year=2024&session_name=Race")
   └── Returns array of OpenF1Session for 2024 races

3. User selects session (e.g. Italian GP Race, session_key=9165)
   └── Three parallel queries fire:
       a. useTeamRadio(9165)   → openf1Fetch("/team_radio?session_key=9165")
       b. useOpenF1Drivers(9165) → openf1Fetch("/drivers?session_key=9165")
       c. useRaceControl(9165) → openf1Fetch("/race_control?session_key=9165")
   └── useLaps(9165) → openf1Fetch("/laps?session_key=9165")
       (all drivers, manageable volume)

4. Data arrives — RadioClient derives:
   └── driverMap: { [driver_number]: OpenF1Driver } for display names/colors
   └── contextIndex = buildContextIndex(laps, []) — positions loaded lazily
   └── radioWithContext = teamRadio.map(r => ({
         ...r,
         ...correlateRadioContext(r, sortedLaps, [])
       }))

5. User applies driver filter (driverNumber = 1)
   └── usePosition(9165, 1) fires
   └── openf1Fetch("/position?session_key=9165&driver_number=1")
   └── RadioClient rebuilds contextIndex with driver positions
   └── RadioList re-renders with position data for filtered driver

6. User clicks play on a RadioCard
   └── AudioPlayer.handlePlay() is called
   └── Module-scoped globalAudio is created/reused
   └── setCurrentUrl(url) in RadioClient propagates isActive to all cards
   └── Previously active card sees isActive=false, its AudioPlayer pauses
```

---

## Race Control Events Overlay

`RaceControlFeed` renders `OpenF1RaceControl[]` sorted by `date` ascending. Events relevant to correlate with audio:

- `category: "Flag"` → flag color changes (yellow, red, green, safety car)
- `category: "SafetyCar"` → safety car deployed/recalled
- `category: "Drs"` → DRS enabled/disabled
- `message` field contains human-readable text for display

The feed can be rendered as a fixed sidebar or a collapsible panel. It is read-only — no user interaction needed beyond scroll.

Correlation: when a RadioCard is active (playing), optionally highlight race control events within a ±30 second window of the radio timestamp to provide race context. This is a progressive enhancement — can be deferred to a v2 iteration.

---

## Architectural Patterns to Follow

### Pattern 1: skipToken for Conditional Queries (existing pattern — follow it)

All existing hooks (`useRaces`, `useDriverResults`) use `skipToken` when their parameter is undefined. All new Radio hooks must follow this same pattern:

```typescript
queryFn: sessionKey ? () => fetchTeamRadio(sessionKey) : skipToken,
```

### Pattern 2: staleTime: Infinity for Historical Session Data

Historical race sessions don't change. All Radio hooks should use `staleTime: Infinity` — the same as `useRaces`, `useDrivers`, etc. The only exception would be live session data (not applicable for v1.1).

### Pattern 3: No Prop Drilling Beyond Two Levels

The component tree is: `RadioClient` → `RadioList` → `RadioCard` → `AudioPlayer`. That is four levels. Keep `currentUrl`/`setCurrentUrl` at `RadioClient`, pass `isActive` and `onPlay`/`onStop` callbacks to `RadioCard`. Do not pass raw state through all levels — compute `isActive = (url === currentUrl)` at the `RadioList` level before rendering each `RadioCard`.

### Pattern 4: Module-Specific Components in `src/components/radio/`

The existing codebase puts module-specific components at `src/components/[module]/` (e.g., `src/components/quiz/`, `src/components/head-to-head/`), not in `src/app/radio/_components/`. Follow this convention for the Radio module.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Loading Position Data for All Drivers at Once

**What people do:** Call `usePosition(sessionKey)` without a `driverNumber` to get all position data.

**Why it's wrong:** Position is sampled at ~3.7 Hz. For a 20-driver, 70-lap race: 3.7 samples/sec × 5400 sec × 20 drivers = ~400,000 records. This will saturate the rate limiter and cause long load times.

**Do this instead:** Load position data only when a driver filter is active, and only for that driver. When no filter is active, show lap number (from `useLaps`) but omit position.

### Anti-Pattern 2: Creating a New Audio Element Per RadioCard

**What people do:** Render `<audio src={url} />` inside each `RadioCard`, relying on `ref` per card.

**Why it's wrong:** Multiple audio elements exist simultaneously, all loaded. Browser may auto-play multiple. Pausing one requires a ref to the specific card that was playing — complex and fragile when the list re-renders.

**Do this instead:** Use the module-scoped singleton in `AudioPlayer.tsx`. One `HTMLAudioElement` is created and swapped to a new src when a different card is played. This is the standard browser pattern for audio players.

### Anti-Pattern 3: Correlating Radio Context On Every Render

**What people do:** Call `correlateRadioContext(radio, laps, positions)` inline in the render function of `RadioCard` or `RadioList`.

**Why it's wrong:** Each call is O(log n) binary search × number of radio transmissions × driver re-filters. With 200+ radio entries and position arrays, this runs in the render path on every state change.

**Do this instead:** Compute the context map once in `RadioClient` using `useMemo` and pass the pre-computed `lapNumber`/`position` as props to each `RadioCard`. Recompute only when `laps`, `positions`, or `teamRadio` data changes.

```typescript
// In RadioClient.tsx
const radioWithContext = useMemo(() => {
  if (!teamRadio || !laps) return [];
  const { sortedLaps, sortedPositions } = buildContextIndex(laps, positions ?? []);
  return teamRadio.map((r) => ({
    ...r,
    ...correlateRadioContext(r, sortedLaps, sortedPositions),
  }));
}, [teamRadio, laps, positions]);
```

### Anti-Pattern 4: Mixing Jolpica and OpenF1 Driver Data

**What people do:** Use `useDrivers()` (Jolpica, all-time list) to look up driver names in the Radio module.

**Why it's wrong:** Jolpica uses `driverId` strings (e.g., `"max_verstappen"`). OpenF1 uses `driver_number` integers. The two systems don't share a common key. Mapping between them requires a fragile lookup by name that breaks with name variations.

**Do this instead:** Use `useOpenF1Drivers(sessionKey)` to get `OpenF1Driver[]` for the specific session. Build a map keyed by `driver_number`:
```typescript
const driverMap = useMemo(
  () => Object.fromEntries((drivers ?? []).map((d) => [d.driver_number, d])),
  [drivers]
);
```
Then look up by `radio.driver_number` in `RadioCard`.

---

## Build Order for Radio Module

Dependencies flow: types → query-keys → endpoints → hooks → components → routes. Within components, leaf nodes before parents.

```
Step 1: Extend types
  - Append OpenF1Session and OpenF1RaceControl to src/lib/api/openf1/types.ts

Step 2: Create OpenF1 infrastructure
  - Create src/lib/api/openf1/query-keys.ts (openf1Keys factory)
  - Create src/lib/api/openf1/endpoints.ts (all six fetch functions)
  - Create src/lib/api/openf1/utils/correlateRadioContext.ts

Step 3: Create hooks (all follow same skipToken pattern, can be done in one pass)
  - src/hooks/useOpenF1Sessions.ts
  - src/hooks/useOpenF1Drivers.ts
  - src/hooks/useTeamRadio.ts
  - src/hooks/useLaps.ts
  - src/hooks/usePosition.ts
  - src/hooks/useRaceControl.ts

Step 4: Create leaf components (no internal deps on other new components)
  - src/components/radio/AudioPlayer.tsx
  - src/components/radio/loading/RadioListSkeleton.tsx

Step 5: Create mid-level components (depend on AudioPlayer and new types)
  - src/components/radio/RadioCard.tsx   (uses AudioPlayer)
  - src/components/radio/RaceControlFeed.tsx (standalone)

Step 6: Create container components (depend on RadioCard, hooks)
  - src/components/radio/SessionSelect.tsx  (uses useOpenF1Sessions)
  - src/components/radio/RadioList.tsx      (uses RadioCard)

Step 7: Create RadioClient (depends on all above + all hooks)
  - src/components/radio/RadioClient.tsx

Step 8: Create route
  - src/app/radio/page.tsx  (wraps RadioClient in Suspense)

Step 9: Wire up navigation + landing page (independent, can do any time)
  - Modify src/components/layout/navigation.tsx  — add Radio link
  - Modify src/app/page.tsx  — activate Team Radio card href
```

---

## Integration Points with Existing Architecture

| Existing Piece | How Radio Module Uses It |
|----------------|--------------------------|
| `src/lib/api/openf1/client.ts` (openf1Fetch) | All six new endpoint functions call `openf1Fetch` — unchanged |
| `src/lib/api/rate-limiter.ts` (TokenBucketQueue) | Already configured at 3 req/s in the client — Radio hooks benefit automatically |
| `src/components/shared/SeasonSelect.tsx` | Reused as-is to pick the year; result cast to `number` for OpenF1 |
| `src/components/providers/query-provider.tsx` | No changes; Radio hooks use the existing QueryClient |
| `src/lib/api/jolpica/query-keys.ts` (pattern) | openf1Keys factory mirrors this exact structure |
| `src/hooks/useRaces.ts` (pattern) | All Radio hooks copy the skipToken + staleTime: Infinity pattern |
| `src/components/shared/QueryError.tsx` | Reused in RadioList and RadioClient for error states |
| `src/components/ui/*` (shadcn primitives) | Button, Card, Scroll Area, Badge, Skeleton used in Radio components |

---

## Scaling Considerations

| Concern | For Radio v1.1 | If data grows significantly |
|---------|----------------|----------------------------|
| Team radio volume | ~50-200 transmissions per race session — renders fine in a list | Add virtualization (@tanstack/react-virtual, already in package.json) |
| Position data | Load per-driver only; ~3.7 Hz × 5400 sec = ~20K entries per driver | Already filtered to single driver; manageable |
| Race control events | ~50-100 events per race — renders fine in a timeline | No concern |
| Audio loading | Browser-native audio buffering; not a React concern | No concern |
| Cache pressure | All session data cached with staleTime: Infinity per existing pattern | No concern |

---

## Sources

**OpenF1 API endpoint fields (MEDIUM confidence — WebSearch verified against official docs URL):**
- [OpenF1 Official Documentation](https://openf1.org/docs/) — sessions, team_radio, race_control, position, laps, drivers endpoint specs
- [OpenF1 GitHub](https://github.com/br-g/openf1) — source of truth for API field definitions

**Audio singleton pattern (MEDIUM confidence — multiple sources agree):**
- [Sharing Audio in React with useContext](https://campedersen.com/react-audio) — context vs singleton tradeoffs
- [Pioneering Audio Management — Singleton Pattern](https://medium.com/@masoudshahpoori/pioneering-audio-management-music-handler-in-web-apps-the-singleton-triumph-c936303b0c7e) — module-scoped singleton for audio

**Codebase direct inspection (HIGH confidence):**
- `src/lib/api/openf1/client.ts` — openf1Fetch, TokenBucketQueue verified
- `src/lib/api/openf1/types.ts` — existing types verified (OpenF1TeamRadio, OpenF1Position, OpenF1LapData, OpenF1Driver already present)
- `src/lib/api/jolpica/query-keys.ts` — jolpikaKeys pattern used as template for openf1Keys
- `src/hooks/useRaces.ts` — skipToken pattern confirmed as house style
- `src/components/shared/SeasonSelect.tsx` — confirmed reusable as-is

---

## Base Application Architecture

For the general application architecture (pre-Radio), see the original research from 2026-02-16. Key points:

- Next.js 16 App Router, `src/` directory
- All modules are independent — they share `src/lib/` and `src/components/shared/` but do not import from each other
- TanStack Query with `QueryClientProvider` at root layout — all hooks inherit this client
- Feature components live in `src/components/[module]/`, not inside `src/app/[route]/_components/`
- `jolpikaKeys` factory in `src/lib/api/jolpica/query-keys.ts` is the established pattern for query key management

---

*Architecture research for: F1 Hub Radio Module Integration*
*Researched: 2026-02-19*
*Confidence: HIGH — based on direct codebase inspection + OpenF1 API docs verification*
