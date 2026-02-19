# Project Research Summary

**Project:** F1 Hub — Radio Module (v1.1)
**Domain:** Team radio catalog with audio playback, race context, and timeline visualization
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

The Radio module is a historical audio catalog built entirely on the client side using the free OpenF1 API. The core pattern is a six-step data pipeline: session selection yields a `session_key`, which gates all subsequent queries (`team_radio`, `drivers`, `laps`, `race_control`) fired in parallel. No new npm packages are required — the stack already includes TanStack Query for data fetching, TanStack Virtual for list virtualization, and native `HTMLAudioElement` for audio playback. The only new installs are two shadcn/ui components (`slider` for the audio scrub bar, `tooltip` for hover context). The recommended approach is to treat data-layer correctness as a prerequisite to UI work: get query key scoping, `staleTime: Infinity` caching, and timestamp correlation right in Phase 1 before any component is built.

The single most important architectural decision is the module-scoped `globalAudio` singleton. Audio state must not be per-card-local — one `HTMLAudioElement` is shared across the entire module, swapped to a new `src` when a different clip is selected. This prevents simultaneous playback, survives list re-renders caused by driver filter changes, and makes a sticky player bar feasible. The second most important decision is query key scoping: lap data is per-session (not per-driver), and re-fetching it on every driver filter switch will exhaust OpenF1's 30 req/min limit within a single browsing session.

The top implementation risk is `new Audio()` running during Next.js SSR, which crashes the build with `ReferenceError: Audio is not defined`. This is non-negotiable: all audio element creation must happen inside `useEffect` or event handlers, never at module scope. The second risk is CORS — `recording_url` values point to the F1 Live Timing CDN (`livetiming.formula1.com`), not OpenF1's domain. Standard `HTMLAudioElement` playback works without CORS headers, but any code path through Web Audio API or `fetch()` will fail. A deployment-environment smoke test against a real recording URL must be part of Phase 1 before the full UI is built.

---

## Key Findings

### Recommended Stack

No new npm packages are required. The entire Radio module builds on what is already installed. Install two shadcn/ui components: `slider` (`npx shadcn@latest add slider`) for the audio scrub bar and `tooltip` (`npx shadcn@latest add tooltip`) for driver/event hover labels. Audio playback uses a custom `useAudioPlayer` hook backed by native `HTMLAudioElement` — no library — keeping bundle cost at zero. All audio libraries evaluated (react-use-audio-player/Howler, use-sound, wavesurfer.js) add dependencies that exceed the project's complexity budget for features the Radio module does not need.

**Core technologies:**
- `HTMLAudioElement` (browser-native): audio playback — zero bundle cost, sufficient for 3–30 second MP3 clips, no CORS constraint for playback-only use
- `openf1Fetch` + `TokenBucketQueue` (existing): all six new OpenF1 endpoints reuse the existing client unchanged at 3 req/s
- `@tanstack/react-virtual` (already installed): virtualizes 200+ radio item lists; must be present from the first list iteration, not retrofitted
- TanStack Query `staleTime: Infinity` (existing pattern): historical session data is immutable; cache aggressively to stay within the 30 req/min budget
- `openf1Keys` query key factory (new, mirrors existing `jolpikaKeys`): structured cache keys scoped per-session to prevent redundant fetches
- shadcn `Slider` + `Tooltip` (new installs): audio scrub bar with accessible keyboard/mouse seeking; hover context overlays

**What not to add:**
- `react-use-audio-player` — wraps Howler.js (~30KB gzipped) for Web Audio API features the module does not use; React 19 compat unverified
- `wavesurfer.js` — canvas waveform visualizer (~60KB); F1 CDN CORS policy likely blocks `AudioContext.createMediaElementSource()`
- D3 for timeline — radio timeline is a sorted virtualized list, not an SVG visualization
- Jolpica for session/radio data — Jolpica has no `session_key`, no radio data, no race control events; all post-2023 session context must come from OpenF1

### Expected Features

The feature dependency chain is strict: session selection must come first because `session_key` is required for every OpenF1 radio-related call. Driver filter and radio list come next. Lap context, position context, and race control overlay layer on top as progressive enhancements. The 2023+ data gate is a hard constraint of the OpenF1 API, not a product choice.

**Must have (P1 — table stakes):**
- Session browser (year 2023+ → race → session type) — gated to 2023+ with explanatory tooltip; no entry point without this
- Driver filter (pill toggles, client-side after fetch) — primary browsing intent is driver-first
- Chronological radio list with driver identity (name, team color accent, headshot with null fallback)
- Sticky global audio player with play/pause, seek bar, elapsed/total time, spacebar support
- Lap number annotation — inferred from `/laps` via timestamp proximity; lazy-fetch per session, filter per driver client-side
- Loading skeletons, empty state ("No radio captured"), and error states with rate-limit-specific messaging
- Navigation + home page wiring — add "Radio" nav link; activate the "Planned" module card on home page

**Should have (P2 — v1.1.x enhancements after base is stable):**
- Driver race position at time of radio ("P3" badge) — bounded `/position` query for active driver only; confirm rate limit budget first
- Race Control event overlay — single session-wide `/race_control` fetch; SC/flag markers on timeline
- Safety Car / flag proximity badge on radio card ("SC LAP") — derived from race control data already fetched
- Playback speed control (0.75x / 1x / 1.25x / 1.5x) — `audio.playbackRate`, trivial to add
- Elapsed race time display — computed from `sessions.date_start`, no extra API call

**Defer (P3 — requires Supabase backend or paid API; out of scope per PROJECT.md):**
- AI transcriptions (Whisper API, server costs)
- Radio voting / community tags (Supabase + user sessions)
- Full-text keyword search across sessions (indexed transcript storage)
- Real-time live radio (paid OpenF1 auth token)
- Shareable clip URLs (OpenF1 has no stable radio IDs)

### Architecture Approach

The module follows established F1 Hub patterns exactly: a server component page wrapper routes to a single client component (`RadioClient`) that owns all state and orchestrates all hooks. Timestamp correlation (radio → lap, radio → position) is pre-computed once via `useMemo` using binary search, not inline in render. The module-scoped `globalAudio` singleton handles playback without React Context. The build order is enforced by dependency flow: types → query-keys → endpoint functions → hooks → leaf components → container components → route page → navigation wiring.

**Major components:**
1. `RadioClient` (`src/components/radio/RadioClient.tsx`) — owns `sessionKey`, `selectedDriverNumber`, `currentUrl`; orchestrates all hooks; computes `radioWithContext` via `useMemo`
2. `AudioPlayer` (`src/components/radio/AudioPlayer.tsx`) — wraps module-scoped `globalAudio` singleton; lazy-instantiates in `useEffect`; handles cleanup (`audio.src = ''; audio.load()`) on unmount
3. `RadioList` + `RadioCard` — TanStack Virtual list of transmission cards; `isActive = (url === currentUrl)` computed at list level before each card renders
4. `SessionSelect` (`src/components/radio/SessionSelect.tsx`) — new component; reads `useOpenF1Sessions(year)`; yields `session_key`; bridges SeasonSelect's Jolpica year strings to OpenF1 integer keys
5. `RaceControlFeed` (`src/components/radio/RaceControlFeed.tsx`) — read-only chronological feed of race control events (Safety Car, flags, DRS) rendered as sidebar or collapsible panel
6. `correlateRadioContext` utility (`src/lib/api/openf1/utils/`) — binary search finds lap number and race position for each radio timestamp; O(log n) per radio entry; called once via `useMemo`

**New infrastructure files:**
- `src/lib/api/openf1/query-keys.ts` — `openf1Keys` factory mirroring `jolpikaKeys`
- `src/lib/api/openf1/endpoints.ts` — six fetch functions for radio module endpoints
- Six hooks: `useOpenF1Sessions`, `useOpenF1Drivers`, `useTeamRadio`, `useLaps`, `usePosition`, `useRaceControl`
- Two new types appended to `src/lib/api/openf1/types.ts`: `OpenF1Session`, `OpenF1RaceControl`

**Files modified (not replaced):**
- `src/lib/api/openf1/types.ts` — append two new interfaces
- `src/components/layout/navigation.tsx` — add Radio nav link
- `src/app/page.tsx` — activate Team Radio card href

### Critical Pitfalls

1. **`new Audio()` crashes Next.js SSR** — Any audio element creation outside `useEffect` or a direct event handler throws `ReferenceError: Audio is not defined` during `next build`. Fix: instantiate inside `useEffect` with `useRef`; cleanup with `audio.src = ''; audio.load()`. Verify with `next build` before Phase 1 is marked complete.

2. **30 req/min rate limit — the per-minute bucket, not per-second, is the real constraint** — Session load fires 4 concurrent queries; 8 session loads per browsing session hits the limit. Fix: `staleTime: Infinity` + `gcTime: Infinity` on all radio data; scope lap query key per-session (not per-driver) so driver filter switches never re-fetch; use `enabled` chaining so laps only fetch after radio confirms there is data.

3. **Timestamp correlation must use nearest-preceding-record, not exact match** — OpenF1 timestamps across endpoints have millisecond drift from different telemetry sources. Exact equality joins return zero results. Fix: sort laps and positions by timestamp once; binary-search for the last record with `date <= radio.date`; pre-compute in `useMemo`, not inline in render.

4. **Module-scoped `globalAudio` singleton is required — per-card audio elements allow simultaneous playback** — Per-card local `<audio>` elements unmount on filter changes, reset playback state, and allow multiple clips to play at once. Fix: one module-level `HTMLAudioElement` reference swapped to a new `src` when a different card is selected; `isActive` prop drives pause from the list level.

5. **Mobile autoplay silently rejected if `audio.play()` is deferred** — `audio.play()` called from `useEffect`, `setTimeout`, or a state change handler is rejected on iOS Safari and Android Chrome; the Promise rejection is often swallowed. Fix: call `audio.play()` synchronously inside the click handler; catch the Promise rejection and surface a user-facing error.

---

## Implications for Roadmap

### Phase 1: Data Layer and Audio Hook Foundation

**Rationale:** Every other Radio feature depends on a working data pipeline and a SSR-safe audio instantiation pattern. The two highest-recovery-cost bugs (SSR crash, wrong query key scoping) must be prevented before any UI is built. CORS behavior is unknown until tested on the deployed origin — discovering it in Phase 1 when no UI has been written costs hours; discovering it in Phase 2 costs days.

**Delivers:** Two new types in `openf1/types.ts` (`OpenF1Session`, `OpenF1RaceControl`); `openf1Keys` query key factory; `endpoints.ts` with six fetch functions; six React Query hooks (`useOpenF1Sessions`, `useOpenF1Drivers`, `useTeamRadio`, `useLaps`, `usePosition`, `useRaceControl`); `correlateRadioContext` binary search utility with unit tests; `useAudioPlayer` hook with SSR-safe `useEffect` instantiation and unmount cleanup; deployment-environment CORS smoke test against real `recording_url` values.

**Addresses:** Session browser data requirements, driver lookup, radio fetch, lap correlation, race control fetch, audio hook pattern.

**Avoids:**
- SSR crash: `useEffect`-only audio creation established before any component uses audio
- Rate limit exhaustion: correct query key scoping (`laps` per-session, not per-driver) and `enabled` chaining established before UI builds on top
- Timestamp correlation failure: binary search utility is unit tested with real session data before the catalog UI uses it
- CORS surprises: smoke test on deployed Vercel URL in Phase 1

**Research flag:** No additional research needed. All endpoint shapes are confirmed from OpenF1 docs and existing codebase types. All code patterns (skipToken, staleTime: Infinity, hooks structure) directly mirror existing hooks.

---

### Phase 2: Core Catalog UI (P1 Features)

**Rationale:** With a verified data layer, the UI can be built in dependency order (leaf components first). Virtualization must be present from the first iteration of the list — retrofitting TanStack Virtual onto a non-virtual list requires restructuring how row components receive audio state, estimated at 1–2 days of rework. The global audio singleton and `currentUrl` state belong to this phase, not Phase 3, because audio state is a structural concern that every list item component depends on.

**Delivers:** `RadioClient`; `SessionSelect`; `RadioList` (virtualized with TanStack Virtual, `React.memo` on rows); `RadioCard` (driver name, team color `border-l-2`, headshot with fallback, lap badge, elapsed time, inline `AudioPlayer`); `AudioPlayer` (global singleton, play/pause, seek bar via shadcn Slider, spacebar shortcut); `RadioListSkeleton`; empty/error states; navigation + home page wiring.

**Uses:** shadcn `Slider` (scrub bar), shadcn `Tooltip` (hover context), `@tanstack/react-virtual` (`useVirtualizer`), `lucide-react` Play/Pause icons, shadcn `Badge`/`Card`/`Skeleton`/`Button`, `useLocalStorage` (persist last session key).

**Implements:** `RadioClient` (orchestration + `useMemo` for context), `AudioPlayer` (global singleton), `RadioList` (virtualized), `RadioCard` (display + inline player), `SessionSelect` (OpenF1 session picker).

**Avoids:**
- Virtualization retrofit: build virtual from day one (200+ items without virtualization = 400–800ms initial render, scroll jank)
- Simultaneous audio playback: global singleton + `isActive` prop at list level
- Mobile autoplay rejection: `audio.play()` only from direct click handler
- Ghost audio on navigation: cleanup in `useEffect` return (`audio.src = ''; audio.load()`)
- Eager audio metadata loading: `preload="none"` or defer `src` assignment until play

**Research flag:** Standard patterns. TanStack Virtual, shadcn components, and the audio singleton are all well-documented with official examples.

---

### Phase 3: Race Context Enhancements (P2 Features)

**Rationale:** Position data is the most rate-limit-sensitive feature and should only be added after confirming the core session fetch budget is comfortable in production usage. Race control overlay is a single session-wide fetch (low cost) and can be added alongside or slightly ahead of position. Safety Car badges derive from race control data already fetched in the base load, making them near-free once overlay is implemented. Playback speed and elapsed time are trivial and can fill out this phase.

**Delivers:** Driver position badge on radio card ("P3") via bounded `/position` query for active driver only; `RaceControlFeed` sidebar with SC/flag markers; Safety Car proximity badge ("SC LAP") on affected radio cards; playback speed control (0.75x–1.5x); elapsed race time computed from `sessions.date_start`.

**Uses:** `usePosition` and `useRaceControl` hooks (scaffolded in Phase 1, used here for the first time); no new libraries; position context path in `correlateRadioContext` (utility already supports it, just not populated until this phase).

**Avoids:**
- Position data over-fetching: load only for the active driver filter, never all 20 drivers simultaneously (~20K records per driver per race)
- Rate limit burn from position queries: confirm with empirical measurement before committing to fetch strategy

**Research flag:** Needs a brief spike. Position data volume per driver-session should be empirically validated with a real race session API call before deciding between the bounded date-window query (`date>=X&date<=Y`) and the full per-driver fetch + client-side binary search. A 30-minute investigation on a known large session is sufficient.

---

### Phase Ordering Rationale

- Phase 1 before Phase 2 is mandatory: SSR crash and query key design are both load-bearing. Building UI before these are verified means rebuilding it.
- Virtualization in Phase 2, not Phase 3: retrofitting TanStack Virtual requires restructuring per-row audio state management. It is far cheaper to build virtual from the start.
- Position context in Phase 3, not Phase 2: the 30 req/min constraint means position queries should only be added after confirming the core session fetch budget is comfortable. Race control is cheap (one session-wide fetch) and can move to Phase 2 if desired; position cannot.
- P3 features (transcriptions, voting, search, live radio) are explicitly deferred — all require Supabase backend or paid OpenF1 auth, outside the scope of this static client-only module.

### Research Flags

Phases needing deeper research during planning:
- **Phase 3:** Position data volume per driver-session needs empirical verification before committing to the bounded date-window vs. full per-driver fetch strategy. 30-minute spike on a real race session API call.

Phases with standard patterns (skip research-phase):
- **Phase 1:** All endpoint shapes confirmed from OpenF1 docs and existing codebase types. Hook patterns (skipToken, staleTime: Infinity) directly mirror `useRaces` and other existing hooks.
- **Phase 2:** TanStack Virtual, shadcn Slider, and the audio singleton pattern are all well-documented with official guides and confirmed community examples.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | OpenF1 endpoints verified from official docs + existing `types.ts`. Audio via MDN. shadcn Slider/Tooltip from official docs. TanStack Virtual v3.13.18 confirmed in `package.json`. |
| Features | HIGH | API shapes confirmed from existing codebase `src/lib/api/openf1/types.ts`. Feature set benchmarked against F1 Live Pulse and MultiViewer. API constraints (2023+, session_key required, partial radio coverage) confirmed from OpenF1 docs. |
| Architecture | HIGH | Based on direct codebase inspection of all existing hooks, clients, and components. All patterns (skipToken, staleTime: Infinity, jolpikaKeys, SeasonSelect reuse, module component folders) verified by reading source files. |
| Pitfalls | HIGH (audio/React), MEDIUM (CORS) | Audio SSR crash and cleanup patterns verified from official Next.js discussions and MDN. Mobile autoplay policy from MDN and Chrome docs. CORS behavior for the F1 Live Timing CDN is MEDIUM — no direct header inspection was possible; community projects confirm playback works but this must be validated on the deployed production origin. |

**Overall confidence:** HIGH

### Gaps to Address

- **F1 CDN CORS headers in production:** Cannot be verified without a deployed instance making real requests to `livetiming.formula1.com` from the Vercel origin. The smoke test in Phase 1 must be performed on the deployed Vercel URL, not localhost. If the CDN blocks no-cors playback from the production origin, a server-side audio proxy route would be required — a significant rework estimated at 1–2 days.

- **Position data volume:** The estimate of ~20K records per driver per race is based on the ~3.7 Hz sampling rate × ~5400 second race. Must be empirically validated with a real API call before Phase 3 implementation to choose the correct fetching strategy.

- **`TokenBucketQueue` per-minute accounting:** The existing rate limiter only tracks the 3 req/s constraint; it has no per-minute counter. Validate whether `staleTime: Infinity` + `enabled` chaining alone keeps the module within the 30 req/min limit across a typical browsing session (8–10 session loads) before deciding whether to enhance the rate limiter.

---

## Sources

### Primary (HIGH confidence)
- [OpenF1 Official Documentation](https://openf1.org/docs/) — team_radio, race_control, sessions, laps, position, drivers endpoints and fields; 3 req/s + 30 req/min rate limits; 2023+ data availability
- [OpenF1 GitHub (br-g/openf1)](https://github.com/br-g/openf1) — endpoint structure, `recording_url` → `livetiming.formula1.com`, partial radio coverage note
- [shadcn/ui Slider docs](https://ui.shadcn.com/docs/components/radix/slider) — install command and Radix UI backing confirmed
- [TanStack Virtual npm + docs](https://www.npmjs.com/package/@tanstack/react-virtual) — v3.13.18 in project; React 19 useFlushSync note
- [MDN: Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — Mobile autoplay policy; authoritative
- [MDN: HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) — API reference
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) — Chrome-specific autoplay rules
- [Next.js discussion: Audio is not defined (#17963)](https://github.com/vercel/next.js/discussions/17963) — Confirmed `new Audio()` at module scope crashes SSR
- [Next.js Lazy Loading / Dynamic Imports](https://nextjs.org/docs/pages/guides/lazy-loading) — `{ ssr: false }` usage confirmed
- [Mozilla bug: Web Audio API + createMediaElementSource CORS](https://bugzilla.mozilla.org/show_bug.cgi?id=937718) — Confirmed that `AudioContext.createMediaElementSource()` enforces CORS strictly; `<audio src>` playback does not
- Existing codebase (`src/lib/api/openf1/`, `src/hooks/`, `src/components/`) — types, client, rate-limiter, hook patterns verified by direct inspection

### Secondary (MEDIUM confidence)
- [react-use-audio-player npm](https://www.npmjs.com/package/react-use-audio-player) — Howler.js dependency, last published ~1 year ago, React 19 compat unverified
- [Building an Audio Player With React Hooks — letsbuildui.dev](https://www.letsbuildui.dev/articles/building-an-audio-player-with-react-hooks/) — HTMLAudioElement + useRef pattern for play/pause/seek/progress
- [HTMLAudioElement cleanup (react-h5-audio-player issue #222)](https://github.com/lhz516/react-h5-audio-player/issues/222) — Empty string (`src = ''`) + `load()` required for full cleanup; null/undefined insufficient
- [Pioneering Audio Management — Singleton Pattern](https://medium.com/@masoudshahpoori/pioneering-audio-management-music-handler-in-web-apps-the-singleton-triumph-c936303b0c7e) — Module-scoped singleton for audio management
- [Sharing Audio in React with useContext](https://campedersen.com/react-audio) — Context vs singleton tradeoffs for audio state
- [F1-TeamRadio (siddharth-tewari)](https://github.com/siddharth-tewari/F1-TeamRadio) — Community project confirming direct browser playback of OpenF1 `recording_url` MP3s without proxy
- [Formula Live Pulse — Team Radio features](https://www.f1livepulse.com/en/features/team-radio/) — Competitor feature benchmark (driver filter, playback, AI transcripts, archive)
- [MultiViewer](https://multiviewer.app/) — Live timing + radio integration benchmark (requires F1 TV subscription)
- [LogRocket — Building an audio player in React](https://blog.logrocket.com/building-audio-player-react/) — 2024 patterns for HTMLAudioElement in React hooks

---
*Research completed: 2026-02-19*
*Ready for roadmap: yes*
