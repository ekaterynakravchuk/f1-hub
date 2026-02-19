# Technology Stack

**Project:** F1 Hub — Radio Module (v1.1)
**Domain:** Team radio catalog with audio playback, race context, and timeline visualization
**Researched:** 2026-02-19
**Confidence:** HIGH (OpenF1 endpoints verified via docs/search; audio approach verified via MDN patterns; shadcn/ui components confirmed via official docs)

---

## Context: What Already Exists

This document covers **additions only**. The following are already installed and validated — do not re-add or replace:

| Already Installed | Version | Do Not Replace With |
|-------------------|---------|---------------------|
| Next.js (App Router) | 16.1.6 | — |
| React / React DOM | 19.2.3 | — |
| TypeScript | ^5 | — |
| Tailwind CSS | ^4 | — |
| shadcn/ui (via `shadcn` CLI) | ^3.8.5 | — |
| `radix-ui` (unified package) | ^1.4.3 | — |
| TanStack Query | ^5.90.21 | — |
| TanStack Virtual | ^3.13.18 | — |
| `lucide-react` | ^0.564.0 | — |
| `zod` | ^4.3.6 | — |
| `clsx` + `tailwind-merge` | latest | — |
| `recharts` | ^2.15.4 | D3, Visx |
| `next-themes` | ^0.4.6 | — |
| OpenF1 client (`openf1Fetch`) | custom | — |
| Jolpica client (`jolpikaFetch`) | custom | — |
| `TokenBucketQueue` rate limiter | custom | — |

---

## New Stack Requirements for Radio Module

### Audio Playback

**Decision: Native HTML5 Audio API via a custom `useAudioPlayer` hook — no new library.**

The Radio module needs: play/pause toggle, progress tracking, seek (scrub), duration display, and one-active-at-a-time enforcement. All of this is achievable with `HTMLAudioElement` and React state. The native API is:

- Browser-native, zero bundle cost
- Sufficient for short MP3 clips (team radio messages are typically 3–30 seconds)
- Compatible with React 19 ref patterns and the existing codebase style
- CORS-transparent: `HTMLAudioElement` plays cross-origin MP3s without `crossorigin` attribute constraints unless you need `createMediaElementSource` from Web Audio API (which this module does not)

The existing codebase hand-rolls its rate limiter rather than using a library. Same philosophy applies here.

**What the hook exposes:**

```typescript
// src/hooks/useAudioPlayer.ts
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;   // seconds
  duration: number;      // seconds
  isLoading: boolean;
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  load: (url: string) => void;
}
```

**Why not a library:**

| Library | Why Not |
|---------|---------|
| `react-use-audio-player` v4.0.2 | Wraps Howler.js — Howler adds ~30KB gzipped for Web Audio API features we don't need. Last published ~1 year ago, React 19 compatibility unverified. |
| `use-sound` | Designed for short sound-effect clips, not seek/progress UI. No progress tracking. |
| `react-h5-audio-player` | Opinionated UI component — incompatible with the project's shadcn/Tailwind design system. |

---

### New shadcn/ui Components

Two shadcn components are not yet installed but are needed for the audio player UI:

| Component | Install Command | Purpose |
|-----------|----------------|---------|
| `slider` | `npx shadcn@latest add slider` | Audio scrub bar — Radix Slider provides accessible keyboard/mouse seeking. Used as the progress bar with `value` and `onValueChange` wired to `currentTime`. |
| `tooltip` | `npx shadcn@latest add tooltip` | Show lap number, timestamp, and driver name on hover in the radio list. |

`scroll-area`, `badge`, `button`, `card`, `select`, `skeleton`, and `tabs` are already installed and usable as-is.

---

### New OpenF1 Endpoints and Types

The existing `openf1Fetch` client and `TokenBucketQueue` (3 req/s) are reused without modification. Three endpoints need new TypeScript types and React Query hooks:

#### 1. `/v1/team_radio` — Core data source

Already typed as `OpenF1TeamRadio` in `src/lib/api/openf1/types.ts`. Needs a new React Query hook and endpoint function.

```
GET /v1/team_radio?session_key={session_key}
GET /v1/team_radio?session_key={session_key}&driver_number={driver_number}
```

Response fields (already typed):
- `date` — ISO datetime of the radio message
- `driver_number` — identifies the driver
- `meeting_key`
- `session_key`
- `recording_url` — direct MP3 URL (F1 live timing servers, browser-playable)

**Audio format:** MP3. Browser-playable directly via `HTMLAudioElement`. No proxy needed — multiple open-source F1 apps confirm direct playback works from the browser.

#### 2. `/v1/race_control` — Context overlays (Safety Car, flags, incidents)

Not yet typed. Needed to show relevant race control events alongside radio messages (e.g., "Safety Car deployed" at the time of a radio clip).

```
GET /v1/race_control?session_key={session_key}
```

New type to add to `src/lib/api/openf1/types.ts`:

```typescript
export interface OpenF1RaceControl {
  category: string;       // "Flag" | "SafetyCar" | "Drs" | "Other"
  date: string;           // ISO datetime
  driver_number: number | null;  // null for session-wide events
  flag: string | null;    // "GREEN" | "YELLOW" | "RED" | "CHEQUERED" | "BLACK AND WHITE" | null
  lap_number: number | null;
  meeting_key: number;
  message: string;        // full FIA message text e.g. "SAFETY CAR DEPLOYED"
  scope: string;          // "Track" | "Sector" | "Driver"
  sector: number | null;  // 1-3 for sector flags, null for track-wide
  session_key: number;
}
```

Filter strategy: fetch all race control for a session, then client-side filter to `category === "SafetyCar"` or `flag !== null` for the timeline overlay. Fetched once per session, `staleTime: Infinity`.

#### 3. `/v1/sessions` — Session lookup (resolve session_key from year + round)

Not yet used in any hook. The Radio module needs to resolve a `session_key` for a given season + race + session type (e.g., "Race"). The existing `useRaces` hook returns Jolpica race data — it does not provide OpenF1 `session_key` values.

```
GET /v1/sessions?year={year}&session_name=Race
GET /v1/sessions?meeting_key={meeting_key}&session_name=Race
```

New type to add:

```typescript
export interface OpenF1Session {
  circuit_key: number;
  circuit_short_name: string;   // e.g. "Monza"
  country_code: string;         // e.g. "ITA"
  country_key: number;
  country_name: string;
  date_end: string;             // ISO datetime
  date_start: string;           // ISO datetime
  gmt_offset: string;           // e.g. "+02:00"
  location: string;             // e.g. "Monza"
  meeting_key: number;
  session_key: number;          // primary key used by all other endpoints
  session_name: string;         // e.g. "Race" | "Sprint" | "Qualifying"
  session_type: string;         // e.g. "Race" | "Qualifying" | "Practice"
  year: number;
}
```

#### 4. `/v1/meetings` — Meeting lookup (resolve meeting_key from year + round name)

Needed to bridge between Jolpica race data (which uses circuit name / round number) and OpenF1's `meeting_key`. Fetched once per season, `staleTime: Infinity`.

```
GET /v1/meetings?year={year}
```

New type to add:

```typescript
export interface OpenF1Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;          // primary key
  meeting_name: string;         // e.g. "Italian Grand Prix"
  meeting_official_name: string;
  year: number;
}
```

#### 5. `/v1/position` — Driver position at time of radio

Already typed as `OpenF1Position` in `src/lib/api/openf1/types.ts`. Position data is high-frequency (sampled every ~0.5s during a session), making a full fetch expensive. Use targeted queries with `date>=` and `date<=` filters around the radio timestamp rather than fetching all positions for a session.

```
GET /v1/position?session_key={session_key}&driver_number={driver_number}&date>={radioDate-5s}&date<={radioDate+5s}
```

Take the record with `date` closest to the radio message timestamp. This is a best-effort enrichment — position context is not required for the core experience.

#### 6. `/v1/laps` — Lap number at time of radio

Already typed as `OpenF1LapData` in `src/lib/api/openf1/types.ts`. Use `date_start` of each lap to binary-search the lap number for a given radio timestamp.

```
GET /v1/laps?session_key={session_key}&driver_number={driver_number}
```

Fetched once per driver per session. `staleTime: Infinity`.

---

### New React Query Hooks

All new hooks follow the existing pattern: `queryOptions()` factory export + `useX()` convenience wrapper. Add an `openf1Keys` query key factory mirroring the existing `jolpikaKeys` pattern.

```typescript
// src/lib/api/openf1/query-keys.ts (new file)
export const openf1Keys = {
  all: ["openf1"] as const,
  sessions: (year: number) => [...openf1Keys.all, "sessions", year] as const,
  session: (sessionKey: number) => [...openf1Keys.all, "session", sessionKey] as const,
  meetings: (year: number) => [...openf1Keys.all, "meetings", year] as const,
  teamRadio: (sessionKey: number) => [...openf1Keys.all, "team-radio", sessionKey] as const,
  teamRadioByDriver: (sessionKey: number, driverNumber: number) =>
    [...openf1Keys.all, "team-radio", sessionKey, driverNumber] as const,
  raceControl: (sessionKey: number) => [...openf1Keys.all, "race-control", sessionKey] as const,
  laps: (sessionKey: number, driverNumber: number) =>
    [...openf1Keys.all, "laps", sessionKey, driverNumber] as const,
} as const;
```

New hooks to create:

| Hook | File | Query | staleTime |
|------|------|-------|-----------|
| `useOpenF1Sessions` | `src/hooks/useOpenF1Sessions.ts` | `/sessions?year=X` | `Infinity` |
| `useOpenF1Meetings` | `src/hooks/useOpenF1Meetings.ts` | `/meetings?year=X` | `Infinity` |
| `useTeamRadio` | `src/hooks/useTeamRadio.ts` | `/team_radio?session_key=X` | `Infinity` |
| `useRaceControl` | `src/hooks/useRaceControl.ts` | `/race_control?session_key=X` | `Infinity` |
| `useDriverLaps` | `src/hooks/useDriverLaps.ts` | `/laps?session_key=X&driver_number=Y` | `Infinity` |

`usePosition` is explicitly **not recommended as a standalone hook** — the position data is fetched inline during radio enrichment only, and only for the specific narrow time window around each radio message. Bulk-fetching all position data for a session would hit rate limits.

---

### List Virtualization

TanStack Virtual (`@tanstack/react-virtual` ^3.13.18) is already installed. The radio catalog list (potentially 100+ messages per session) should be virtualized using the existing dependency — no new package needed.

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";
```

Use `useVirtualizer` with a fixed estimated item height (~80px per row). Each row shows driver name/number, timestamp, lap number, and a play button. The active/playing item scrolls into view on selection.

---

## Installation

```bash
# No new npm packages required.
# Only new shadcn/ui components:
npx shadcn@latest add slider
npx shadcn@latest add tooltip
```

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-use-audio-player` | Howler.js dependency for Web Audio API features we don't use; ~30KB overhead; React 19 compat unverified | Custom `useAudioPlayer` hook with `HTMLAudioElement` |
| `use-sound` | Designed for fire-and-forget sound effects; no progress bar or seek support | Custom `useAudioPlayer` hook |
| `react-h5-audio-player` | Opinionated CSS-heavy UI; won't match shadcn/Tailwind design system | shadcn `Slider` + custom layout |
| `wavesurfer.js` | Canvas waveform visualizer; adds ~60KB; team radio clips don't benefit from waveform view | Plain progress bar via shadcn Slider |
| `howler` (standalone) | Web Audio API abstraction for complex audio graphs; overkill for simple play/pause/seek | `HTMLAudioElement` directly |
| D3 for timeline | Timeline of radio messages is a sorted list, not a complex SVG visualization | CSS flexbox + TanStack Virtual |
| Jolpica API for race context | Jolpica has no session_key, no radio data, no position data. Post-2023 session context must come from OpenF1 exclusively | OpenF1 `/sessions`, `/race_control`, `/laps` |
| Fetching all `/position` for a session | Position endpoint returns ~10K rows per session per driver; rate-limit risky | Narrow time-window query around each radio timestamp |

---

## Integration Points with Existing Infrastructure

| Existing Piece | How Radio Module Uses It |
|----------------|--------------------------|
| `openf1Fetch` | All new OpenF1 endpoints use this client unchanged |
| `TokenBucketQueue` (3 req/s) | Automatic — all calls go through the existing queue |
| `useRaces` / `useSeasons` | Season + race picker reused from shared components |
| `DriverSelect`, `SeasonSelect`, `RaceSelect` | Reused as filter controls for the radio catalog |
| `staleTime: Infinity` pattern | Applied to all OpenF1 radio data (historical sessions don't change) |
| `useLocalStorage` | Persist last-selected session key between visits |
| `@tanstack/react-virtual` | Already installed — use for the radio message list |
| `lucide-react` | Play, Pause, SkipForward icons for the audio player |
| `badge.tsx` | Display driver abbreviation, flag type, lap number badges |
| `skeleton.tsx` | Loading skeletons for radio list items |
| `scroll-area.tsx` | Fallback for non-virtualized filter panels |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Audio playback | Native `HTMLAudioElement` hook | `react-use-audio-player` | Howler.js overhead, unverified React 19 compat |
| Audio playback | Native `HTMLAudioElement` hook | `<audio>` HTML element with controls | Native controls don't match shadcn design system; no one-active-at-a-time logic |
| Progress bar | shadcn `Slider` | `<input type="range">` | Unstyled — needs Tailwind CSS overrides that conflict with browser defaults |
| Race context | OpenF1 `/race_control` | Jolpica race data | Jolpica has no race control messages, no session-level events, no Safety Car data |
| Session resolution | OpenF1 `/sessions` + `/meetings` | Hard-coded session keys | Session keys change each year; must be dynamic |

---

## Version Compatibility

| Package | Version in Use | Notes |
|---------|---------------|-------|
| `@tanstack/react-virtual` | ^3.13.18 | Already installed. React 19 note: set `useFlushSync: false` if scroll update warnings appear. |
| shadcn `slider` | CLI-managed (no version pinning) | Built on Radix UI `@radix-ui/react-slider` via unified `radix-ui` package. |
| shadcn `tooltip` | CLI-managed (no version pinning) | Built on Radix UI `@radix-ui/react-tooltip` via unified `radix-ui` package. |
| `HTMLAudioElement` | Browser-native | Full support in all modern browsers. MP3 playback: Safari, Chrome, Firefox, Edge all support natively. |

---

## Sources

- [OpenF1 API Documentation](https://openf1.org/docs/) — Verified `team_radio`, `race_control`, `sessions`, `meetings`, `laps`, `position` endpoints and their fields (HIGH confidence)
- [OpenF1 GitHub — br-g/openf1](https://github.com/br-g/openf1) — Confirmed endpoint structure, data availability from 2023 (HIGH confidence)
- [react-use-audio-player npm](https://www.npmjs.com/package/react-use-audio-player) — Confirmed v4.0.2, Howler.js dependency, last published ~1 year ago (HIGH confidence)
- [Building an Audio Player With React Hooks — letsbuildui.dev](https://www.letsbuildui.dev/articles/building-an-audio-player-with-react-hooks/) — Verified `HTMLAudioElement` + `useRef` pattern for play/pause/seek/progress (MEDIUM confidence)
- [shadcn/ui Slider docs](https://ui.shadcn.com/docs/components/radix/slider) — Confirmed install command and Radix UI backing (HIGH confidence)
- [TanStack Virtual npm](https://www.npmjs.com/package/@tanstack/react-virtual) — Confirmed v3.13.18 in package.json, React 19 useFlushSync note (HIGH confidence)
- [F1-TeamRadio (siddharth-tewari)](https://github.com/siddharth-tewari/F1-TeamRadio) — Community project confirming direct browser playback of OpenF1 `recording_url` MP3s works without proxy (MEDIUM confidence)
- [LogRocket — Building an audio player in React](https://blog.logrocket.com/building-audio-player-react/) — Current (2024) patterns for HTMLAudioElement in React hooks (MEDIUM confidence)

---

*Stack research for: F1 Hub Radio Module (team radio catalog)*
*Researched: 2026-02-19*
