# Pitfalls Research

**Domain:** Team Radio Catalog with Audio Playback — Radio module added to existing F1 Hub (Next.js, React Query, OpenF1)
**Researched:** 2026-02-19
**Confidence:** HIGH for audio/React pitfalls (verified with MDN, GitHub issues, official docs). MEDIUM for OpenF1-specific CORS details (no direct header inspection possible without backend).

---

## Critical Pitfalls

### Pitfall 1: `new Audio()` Crashes the Next.js Build Because It Runs During SSR

**What goes wrong:**
The Radio page loads, the build succeeds locally, but Next.js throws `ReferenceError: Audio is not defined` (or `window is not defined`) during `next build` or on the first server render. Any module that calls `new Audio()` at module scope — or in a component body outside `useEffect` — runs on the server where the Web Audio API does not exist. This crashes SSR for the entire route.

**Why it happens:**
Next.js App Router renders Client Components on the server too for the initial HTML payload. Even with `'use client'` at the top of the file, module-level code runs during server rendering. Developers coming from SPA backgrounds assume `'use client'` means "client-only execution" — it does not. The directive signals that the component can use hooks and browser events, not that it skips the server.

**How to avoid:**
1. Never instantiate `new Audio()` outside a `useEffect` or event handler.
2. Store the audio element in a `useRef` and create it lazily inside `useEffect`:
   ```typescript
   const audioRef = useRef<HTMLAudioElement | null>(null);
   useEffect(() => {
     audioRef.current = new Audio();
     return () => {
       audioRef.current?.pause();
       audioRef.current = null;
     };
   }, []);
   ```
3. If the audio player is a self-contained component with complex initialization, wrap it with `next/dynamic` and `{ ssr: false }` so Next.js never tries to render it on the server.

**Warning signs:**
- `next build` passes locally but fails in CI with `Audio is not defined`
- The error only appears on first page load (SSR), not on client-side navigation
- Any `import` of a file that calls `new Audio()` at the top level

**Phase to address:**
Radio Phase 1 (data + audio hook scaffold) — establish the `useRef`-inside-`useEffect` pattern before any audio code is written. One wrong line at module scope fails the entire build.

---

### Pitfall 2: Audio Element Not Cleaned Up on Unmount Causes Memory Leaks and Ghost Playback

**What goes wrong:**
Users navigate away from the Radio page while a clip is playing. The audio continues playing in the background (audible ghost audio). The `HTMLAudioElement` is never garbage-collected because the `src` attribute holds a reference to the network resource. After navigating back and forth a few times, multiple audio elements are playing simultaneously and memory consumption grows.

**Why it happens:**
React's cleanup model requires returning a function from `useEffect`. Audio elements are not automatically paused or destroyed when a component unmounts. Setting `audioRef.current = null` alone is insufficient — the element keeps its network connection alive until `src` is explicitly cleared and `load()` is called to reset the element's internal state.

The confirmed fix (verified in `react-h5-audio-player` issue #222): setting `src` to `null` or `undefined` does NOT stop loading. Only setting `src = ''` followed by calling `.load()` reliably aborts network activity and allows garbage collection.

**How to avoid:**
Always implement this exact cleanup sequence in `useEffect`:
```typescript
useEffect(() => {
  const audio = audioRef.current;
  return () => {
    if (audio) {
      audio.pause();
      audio.src = '';    // empty string — not null, not undefined
      audio.load();      // resets internal media load algorithm, aborts network
    }
  };
}, []);
```

**Warning signs:**
- Audio continues after navigating to another page
- Browser DevTools Memory tab shows heap growing each time user visits/leaves Radio page
- Multiple simultaneous audio tracks playing when returning to Radio page
- Network tab shows stalled audio requests that never complete

**Phase to address:**
Radio Phase 1 — the cleanup pattern must be in the `useAudioPlayer` hook from day one. This is not a refactor-friendly bug; retrofitting it requires auditing every audio element creation site.

---

### Pitfall 3: The Per-Minute Rate Limit (30 req/min) Is More Dangerous Than the Per-Second Limit (3 req/s) for the Radio Page

**What goes wrong:**
The existing `TokenBucketQueue` correctly throttles to 3 req/s, so no single burst exceeds the per-second limit. But the Radio page needs 4 concurrent endpoint calls on load: `team_radio`, `laps`, `position`, and optionally `race_control`. With 4 requests per page load, users who navigate between sessions, change drivers, or refresh hit 30 req/min after just 7–8 page interactions. The queue will back up silently — users see a spinner that never resolves.

**Why it happens:**
The existing rate limiter only models the per-second constraint. It has no per-minute accounting. React Query's `useQueries` fires all 4 requests simultaneously when the page mounts, consuming 4 of the 30 per-minute budget instantly. A session browser (10 sessions × 4 requests = 40 requests) exceeds the limit before the user finishes exploring.

**How to avoid:**
1. Add a per-minute token counter alongside the per-second bucket in the existing `TokenBucketQueue`. Track when the minute window resets and stop dispatching once 30 tokens are consumed in the window.
2. Aggressively cache OpenF1 responses. Radio data for past sessions is immutable — use `staleTime: Infinity` and `gcTime: Infinity`. The first load of a session costs 4 requests; every subsequent visit costs 0.
3. Prefer `enabled` flags to gate secondary requests behind the primary:
   ```typescript
   // Only fetch laps after team_radio succeeds (saves requests if radio is empty)
   const { data: radios } = useQuery({ queryKey: ['team_radio', sessionKey], ... });
   const { data: laps } = useQuery({
     queryKey: ['laps', sessionKey],
     enabled: !!radios && radios.length > 0,
   });
   ```
4. Batch timestamp-correlation data: fetch laps once per session and reuse across all driver filters — do not re-fetch laps when switching driver selection.

**Warning signs:**
- Network tab shows requests queuing up with no response for >10 seconds
- Console logs `OPENF1_RATE_LIMIT` after moderate navigation
- Changing driver filter re-triggers all 4 endpoint fetches (query keys not scoped properly)
- Lap data fetched again when user filters by driver (lap data is per-session, not per-driver)

**Phase to address:**
Radio Phase 1 (data layer) — query key design and `enabled` chaining must be established before UI is built. Retrofitting `staleTime: Infinity` is easy; retrofitting `enabled` dependencies and query key scoping requires touching every hook.

---

### Pitfall 4: CORS Blocks Audio Playback — `recording_url` Points to `livetiming.formula1.com`, Not OpenF1's Domain

**What goes wrong:**
The `team_radio` endpoint returns objects where `recording_url` points to `https://livetiming.formula1.com/static/.../*.mp3` — a domain owned by Formula 1, not OpenF1. When the browser's `HTMLAudioElement` attempts to play this URL, it may be blocked by CORS policy if the F1 Live Timing CDN does not include an `Access-Control-Allow-Origin` header. The audio element fails silently: `audio.play()` returns a rejected Promise with a `NotSupportedError` or `CORS error`, and the user sees no feedback.

**Why it happens:**
`<audio src="...">` for same-tab playback does not require CORS headers — it plays as a no-cors request and audio will play. However, if the code attempts to use the `Web Audio API` (`AudioContext.createMediaElementSource(audio)`) for any reason (waveform visualization, volume analysis), the browser immediately enforces CORS and will fail. Additionally, some CDN configurations differ between HTTP/2 clients (browser audio element) and standard fetch requests, making CORS behavior inconsistent between testing and production.

**How to avoid:**
1. Use `HTMLAudioElement` (`new Audio(url)`) for playback only. Do not pipe through `AudioContext.createMediaElementSource()` unless the CDN explicitly permits it with CORS headers. This keeps the request as a no-cors media fetch.
2. Do not use `fetch()` to download the audio blob and play it — `fetch()` enforces CORS strictly and will fail without `Access-Control-Allow-Origin: *` from the CDN.
3. Never set `audio.crossOrigin = 'anonymous'` unless confirmed that the CDN serves the correct CORS header — this flag causes the browser to reject the response entirely if the header is missing (whereas omitting it would have allowed playback).
4. If waveform visualization is needed in a future phase, that phase requires a separate investigation of F1 CDN CORS headers or a server-side audio proxy.

**Warning signs:**
- `audio.play()` rejects with `NotSupportedError` or `AbortError`
- DevTools Network tab shows the audio request with a CORS preflight (OPTIONS) that returns 403 or missing header
- Audio plays when URL is pasted directly in browser address bar but not when called from the app
- Any code that calls `audioContext.createMediaElementSource(audio)` will immediately surface this

**Phase to address:**
Radio Phase 1 — test audio playback against live `recording_url` values in the very first spike before building the UI. Discover the CORS behavior early when pivoting is cheap.

---

### Pitfall 5: Mobile Autoplay Blocked Until User Touches the Play Button — Programmatic `audio.play()` Is Silently Rejected

**What goes wrong:**
On iOS Safari and Android Chrome, calling `audio.play()` programmatically (not from a direct user click handler) returns a rejected Promise. This silently breaks features like "auto-advance to next clip" or "start playing when the page loads." On desktop, these features work fine. The bug only appears on mobile devices, making it invisible during development.

**Why it happens:**
All major mobile browsers enforce an autoplay policy: audio may only begin playback in response to a direct user gesture (touchstart, click, keydown). If `audio.play()` is called from a `useEffect`, a `setTimeout`, or a React state change handler (not directly from an event handler), the browser rejects it. The Promise rejection is often swallowed if not explicitly caught.

**How to avoid:**
1. Always call `audio.play()` synchronously inside a `click` (or `touchend`) event handler. Never call it from `useEffect` or a delayed callback.
2. Catch the Promise rejection explicitly and update UI state:
   ```typescript
   const handlePlay = async () => {
     try {
       await audioRef.current?.play();
       setIsPlaying(true);
     } catch (err) {
       // DOMException: play() failed because the user didn't interact first
       setIsPlaying(false);
       setError('Tap the play button to start audio');
     }
   };
   ```
3. Design auto-advance (moving from one radio clip to the next) to pause after each clip with a "Next" button — do not use `audio.onended = () => audio.src = nextUrl; audio.play()` unless it is user-initiated.
4. Test every audio interaction in Chrome DevTools mobile emulation with "Block media autoplay" enabled.

**Warning signs:**
- `Unhandled Promise rejection: NotAllowedError` in mobile browser console
- `isPlaying` state stays `false` on first play on mobile but works on desktop
- Auto-advance feature works on desktop, silently breaks on mobile
- Any `audio.play()` called from within `useEffect`

**Phase to address:**
Radio Phase 2 (audio player UI) — the play button handler must be the direct call site for `audio.play()`. This cannot be retrofitted without rethinking the state machine around playback.

---

### Pitfall 6: Timestamp Correlation Between Endpoints Is Unreliable If Done With Exact Matches

**What goes wrong:**
The Radio page needs to show context for each radio message: "lap 32, position 4." The `team_radio` endpoint has a `date` field (ISO datetime). The `laps` endpoint has `date_start` (lap start time). The `position` endpoint has `date`. Developers attempt to join these by finding records where timestamps match exactly — this never works. Timestamps across endpoints have millisecond-level drift from different telemetry sources. The join produces zero or wrong results.

**Why it happens:**
OpenF1 data comes from live timing feeds with multiple sources. A radio message at `2023-09-03T14:32:45.123Z` corresponds to a lap that started at `2023-09-03T14:31:02.871Z` and a position record at `2023-09-03T14:32:44.900Z`. These are correlated by proximity in time, not equality. The correct join strategy is: for each radio message's `date`, find the most recent position record with `date <= radio.date`, and the lap whose `date_start <= radio.date < date_start + lap_duration`.

**How to avoid:**
Sort all fetched records by their `date` field ascending. Then use a binary search or pointer-walk to find the nearest preceding record in each endpoint:
```typescript
// For a radio message at radioDate, find the lap it occurred during
function findLapForRadio(laps: OpenF1LapData[], radioDate: string): OpenF1LapData | null {
  const radioMs = new Date(radioDate).getTime();
  // laps must be sorted by date_start ascending
  let result: OpenF1LapData | null = null;
  for (const lap of laps) {
    const lapStart = new Date(lap.date_start).getTime();
    const lapEnd = lapStart + (lap.lap_duration ?? 0) * 1000;
    if (lapStart <= radioMs && radioMs <= lapEnd) {
      result = lap;
      break;
    }
  }
  return result;
}
```
For position: find the most recent `position` record where `new Date(pos.date) <= new Date(radioDate)`.

Parse all `date` strings to milliseconds once, not on every comparison.

**Warning signs:**
- Radio messages show "Lap: unknown" or "Position: unknown" for most entries
- Some messages show correct lap/position, others don't (inconsistent match rate)
- Exact date-equality join (`laps.find(l => l.date_start === radio.date)`) returns empty arrays

**Phase to address:**
Radio Phase 1 (data layer) — implement `findLapForRadio` and `findPositionForRadio` utility functions with unit tests before building the catalog UI. Wrong correlation is worse than no correlation because it displays incorrect data.

---

### Pitfall 7: Rendering 200 Radio Items Without Virtualization Causes Input Lag and Scroll Jank

**What goes wrong:**
A busy race session can have 200+ radio messages across all drivers. Rendering all 200 list items, each with an audio player component, a timestamp badge, a lap badge, and a position badge, creates 200+ DOM nodes simultaneously. Initial render takes 400-800ms. Filtering by driver triggers a full re-render of the list, causing 100-200ms input lag that makes the filter feel broken. Scroll becomes janky on mid-range mobile devices.

**Why it happens:**
React renders all items in the array — it does not know which items are visible in the viewport. Each audio player component has event listeners (`onplay`, `onpause`, `ontimeupdate`) attached to an `HTMLAudioElement`. Two hundred `HTMLAudioElement` instances are created eagerly, each holding a reference to its audio URL and preloading metadata (if `preload="metadata"` is set), generating 200 background network requests.

**How to avoid:**
1. Use `@tanstack/react-virtual` (already in the project's stack for DriverSelect) for the radio list. This renders only the ~10-15 visible items at any time.
2. Do not instantiate `HTMLAudioElement` until the item is actually visible in the viewport. Create the audio element in `useEffect` only when the row is rendered by the virtualizer.
3. Set `preload="none"` (or create `new Audio()` without setting `src` until play is requested) to prevent 200 network requests for audio metadata on page load.
4. Memoize list items with `React.memo` — the virtualizer re-renders rows when scroll position changes; without memoization, all visible rows re-render on each scroll tick.

**Warning signs:**
- Filter input has >100ms response lag after typing
- DevTools Performance tab shows a long task (>200ms) on initial render
- Network tab shows 50+ audio metadata requests on page load
- Memory tab shows 200+ `HTMLAudioElement` instances in heap

**Phase to address:**
Radio Phase 2 (catalog UI) — virtualization must be in the first iteration of the list component, not added as a performance fix later. Retrofitting virtual scrolling onto a non-virtual list requires restructuring how row components receive and manage their audio state.

---

### Pitfall 8: Multiple Audio Elements Play Simultaneously — No Global "Only One Playing" Constraint

**What goes wrong:**
Users click play on clip 1, then click play on clip 2. Both clips play simultaneously. The list has no awareness that another item is already playing. This is especially jarring in a compact list where the user cannot see which item is playing while scrolling.

**Why it happens:**
Each radio list item manages its own audio state locally. There is no shared signal saying "something else started playing — pause yourself." Without a global audio controller, simultaneous playback is the default behavior.

**How to avoid:**
Lift audio state to a single context (React Context or Zustand store). Store `currentlyPlayingId: string | null` at the top level. Each audio player item reads this value:
```typescript
// If another ID becomes currentlyPlayingId, pause this element
useEffect(() => {
  if (currentlyPlayingId !== myId && isPlaying) {
    audioRef.current?.pause();
    setIsPlaying(false);
  }
}, [currentlyPlayingId, myId]);
```
Only one `HTMLAudioElement` ever plays at a time. This also makes keyboard shortcuts (Space to pause) and a persistent mini-player bar feasible.

**Warning signs:**
- Two audio clips audibly playing at the same time
- No visual indication of which item is currently playing when the user scrolls away from it
- `audio.play()` called on a new item without first pausing the previous

**Phase to address:**
Radio Phase 2 (catalog UI) — design global audio state before building list items. Adding it afterward requires refactoring every audio item component's props and effects.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Fetching laps per-driver instead of per-session | Simpler query key, matches "selected driver" UX mental model | Re-fetches same lap data on every driver switch; exhausts rate limit rapidly | Never — laps are per-session, filter client-side |
| Using `preload="auto"` on each audio element | Instant playback when user hits play | 200 background network requests on list render, rate-limits the CDN | Never for list items — use `preload="none"` |
| `audio.src = url` at mount time instead of at play time | Simpler code | All audio elements begin loading immediately; compounds with no-virtualization for brutal memory usage | Never — defer src assignment until play |
| Local playback state per list item | Easy to implement | Simultaneous playback, no global pause control, no mini-player possible | Never — global audio context from the start |
| Exact timestamp matching for lap correlation | Simple to write | Returns no results; displays "unknown" for all lap/position context | Never — use nearest-preceding-record lookup |
| `crossOrigin="anonymous"` on audio element "just in case" | Seems safe | Silently breaks playback if CDN lacks CORS header (F1 CDN status unknown) | Never — omit unless CDN header confirmed |
| Fetching all sessions upfront for session select | No loading spinner on dropdown | Consumes rate limit budget before Radio page data is fetched | Never — paginate or lazy-load session list |

---

## Integration Gotchas

Common mistakes when connecting to the OpenF1 API and audio CDN for the radio module.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenF1 `team_radio` | Fetching without `session_key` filter — returns data across all sessions, huge response | Always include `?session_key={key}` to scope to one race session |
| OpenF1 `laps` | Re-fetching when user changes driver filter | Fetch once per session (`queryKey: ['laps', sessionKey]`), filter by `driver_number` client-side |
| OpenF1 `position` | Fetching all position records for a session (can be thousands of rows per driver) | Filter by `driver_number` if only showing one driver's context, or fetch once and index client-side |
| `recording_url` audio | Passing URL through `fetch()` API | Pass directly to `audio.src` — `fetch()` enforces CORS, `<audio>` does not for playback |
| `recording_url` audio | Setting `audio.crossOrigin = 'anonymous'` | Omit `crossOrigin` for playback; only set if using Web Audio API and CDN CORS headers are confirmed |
| React Query + OpenF1 rate limiter | Using default `retry: 3` — three rapid retries on 429 burns rate limit further | Override: `retry: (count, err) => count < 2 && err.message !== 'OPENF1_RATE_LIMIT'` |
| Timestamp joining | `team_radio.date === laps.date_start` exact match | Parse to milliseconds, find nearest preceding lap by `date_start <= radioDate <= date_start + lap_duration * 1000` |
| Session selection | Using `meeting_key` instead of `session_key` for team_radio | `team_radio` requires `session_key` (session_key is per-session: race, quali, FP1, etc.; meeting_key is per-weekend) |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Rendering full radio list without virtualization | 400ms+ initial render, filter lag, scroll jank | Use `@tanstack/react-virtual` from day one | >50 radio items in session |
| Eager audio metadata fetch (`preload="metadata"` on all items) | 200 network requests on page load, CDN throttling | Set `preload="none"`, load metadata only on hover or play | >20 items in list |
| Re-fetching laps/position per driver filter | Rate limit exhausted after 7-8 driver switches | `queryKey: ['laps', sessionKey]` (not driver), filter client-side | 4+ driver selections per page view |
| Multiple `HTMLAudioElement` instances left in heap | Memory grows per Radio page visit/leave cycle | Cleanup: `audio.pause(); audio.src = ''; audio.load()` on unmount | 5+ navigation cycles |
| Parsing ISO date strings on every sort/filter | Sluggish filter interactions with 200-item lists | Parse once at data-load time, store as milliseconds | >100 items with frequent re-filtering |
| `useQueries` firing 4 requests simultaneously on mount | Per-minute rate limit exhausted after 7 sessions | Use `enabled` flag chaining to sequence non-critical requests | 8+ session loads per browsing session |

---

## Security Mistakes

Domain-specific security issues for the Radio module.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering `recording_url` directly as a clickable link without validation | Open redirect if URL shape changes or API is compromised | Validate URL starts with expected CDN prefix before assigning to `audio.src` |
| Displaying raw OpenF1 error messages in UI (e.g., stack traces in error responses) | Information leakage, confusing UX | Catch errors at query boundary, display only user-friendly strings |
| No rate-limit budget awareness on session select dropdown | Eager user loading many sessions can exhaust 30 req/min quickly | Show session load cost in UI ("Loading uses 4 requests"), or serialize session loads |

---

## UX Pitfalls

Common user experience mistakes specific to audio catalog features.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visible "currently playing" indicator when user scrolls away | User forgets audio is playing, cannot find pause button | Persistent mini-player bar at page bottom showing current clip + pause control |
| No loading state while audio is buffering | User sees play icon, clicks again, starts second instance | Show spinner on play button while `audio.readyState < HAVE_ENOUGH_DATA`; disable button during buffer |
| No error state when audio CDN URL returns 404 | Silent failure; user stares at loading spinner | Catch `audio.onerror`, surface "Audio unavailable" with the clip's timestamp |
| Showing 200 clips with no filter defaults | Overwhelming wall of content | Default to a single driver (or the race winner) on page load; show other drivers via filter |
| Clip duration not displayed before play | Users cannot scan for short vs long clips | Load audio duration via `onloadedmetadata` event and display alongside each entry |
| Filter by driver resets currently playing audio | Jarring playback interruption | Preserve playback state across driver filter changes if the current clip passes the new filter |
| No keyboard shortcut for play/pause | Poor accessibility and power-user experience | Space key toggles playback on the focused clip or the currently playing clip |

---

## "Looks Done But Isn't" Checklist

Things that appear complete in the Radio module but are missing critical pieces.

- [ ] **Audio cleanup:** Component appears to play correctly — verify `audio.src = ''` and `audio.load()` are called on unmount by navigating away mid-play and back 5 times; check Memory tab for heap growth
- [ ] **Mobile playback:** Desktop play works — verify on actual iOS Safari and Android Chrome that clicking the play button directly triggers `audio.play()`; no deferred calls
- [ ] **Rate limit per-minute accounting:** Data loads for one session — verify by loading 8 different sessions in sequence; all should load without hitting 30 req/min limit
- [ ] **Lap correlation:** "Lap 32" label appears — verify the label is correct by cross-checking against official session lap data; wrong correlation is worse than no label
- [ ] **Virtualization:** List renders — verify with a session that has 150+ clips; measure initial render time in DevTools (must be <100ms)
- [ ] **Single audio playback:** One clip plays — verify clicking a second clip while first is playing stops the first clip
- [ ] **SSR compatibility:** Page renders in dev — verify `next build && next start` produces no `Audio is not defined` errors
- [ ] **CORS audio playback:** Audio plays in dev — verify on deployed Vercel URL (different origin than localhost) that audio URLs load correctly
- [ ] **Empty session handling:** Data loads for active sessions — verify behavior when a session has zero radio messages (no crashes, friendly empty state)
- [ ] **Stale cache behavior:** First session loads — verify second visit to same session uses cached data (Network tab shows no new OpenF1 requests)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| `Audio is not defined` SSR crash | LOW | Move all `new Audio()` calls inside `useEffect`. Find/replace across audio hook. 1-2 hours. |
| Ghost audio / memory leaks on unmount | LOW | Add `audio.src = ''; audio.load()` to every `useEffect` cleanup that creates an audio element. 1-2 hours. |
| Per-minute rate limit exhausted | MEDIUM | Audit all `queryKey` structures; add `enabled` chaining; change `staleTime` to `Infinity` for radio data. 4-8 hours. |
| CORS blocks audio (Web Audio API path) | HIGH | Abandon Web Audio API visualization; fall back to `HTMLAudioElement` only. If CDN truly blocks no-cors playback, requires server-side proxy route — significant rework. |
| Mobile autoplay broken | LOW | Audit all `audio.play()` call sites; ensure each is directly inside a click/touch handler. 2-4 hours. |
| Timestamp correlation wrong | MEDIUM | Replace exact-match join with nearest-preceding-record lookup. Requires data utility rewrite + unit tests. 4-8 hours. |
| List performance (no virtualization) | HIGH | Retrofitting `@tanstack/react-virtual` onto a non-virtual list requires restructuring row components and their audio state. 1-2 days. |
| Simultaneous audio playback | MEDIUM | Extract audio state to context/Zustand; add `currentlyPlayingId` signal; update each list item to subscribe. 4-8 hours. |

---

## Pitfall-to-Phase Mapping

How Radio module roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SSR crash (`new Audio` at module scope) | Radio Phase 1: Data + Audio Hook | Run `next build`; confirm no `Audio is not defined` error |
| Audio element memory leak on unmount | Radio Phase 1: Data + Audio Hook | Navigate away mid-play 5 times; Memory tab heap must not grow |
| Per-minute rate limit exhaustion | Radio Phase 1: Data layer (query keys, `enabled` flags) | Load 8 different sessions consecutively; none should hit 429 |
| CORS for audio playback | Radio Phase 1: Spike test | Play a clip from deployed Vercel URL; confirm no CORS error in DevTools |
| Timestamp correlation method | Radio Phase 1: Data utilities | Unit test `findLapForRadio` with known session data; verify correct lap assignment |
| Mobile autoplay rejection | Radio Phase 2: Audio player UI | Test on iOS Safari + Android Chrome; play button must work without deferred calls |
| List virtualization | Radio Phase 2: Catalog UI | Render 150-item session; measure initial paint <100ms in DevTools |
| Simultaneous audio playback | Radio Phase 2: Catalog UI | Click two different clips rapidly; only the second should play |
| Ghost audio on navigation | Radio Phase 2: Integration test | Navigate away mid-play; confirm audio stops; verify in Memory tab |

---

## Sources

### Audio API and React Memory Management
- [HTMLAudioElement cleanup: setting src to empty string (react-h5-audio-player issue #222)](https://github.com/lhz516/react-h5-audio-player/issues/222) — Confirmed that `null`/`undefined` does not stop loading; empty string does (MEDIUM confidence — GitHub issue with maintainer confirmation)
- [use-sound: Can't stop audio on unmount (issue #140)](https://github.com/joshwcomeau/use-sound/issues/140) — Real-world unmount cleanup failure pattern (MEDIUM confidence)
- [MDN: Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — Authoritative reference on mobile autoplay policy (HIGH confidence)
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) — Chrome-specific autoplay rules (HIGH confidence)
- [MDN: HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement) — API reference (HIGH confidence)
- [Fast playback with audio and video preload (web.dev)](https://web.dev/fast-playback-with-preload/) — `preload` attribute behavior and HTTP 206 caching (MEDIUM confidence)

### Next.js SSR and Audio
- [Next.js discussion: Audio is not defined (#17963)](https://github.com/vercel/next.js/discussions/17963) — Confirmed that `new Audio()` at module scope crashes SSR (HIGH confidence — official repo discussion)
- [Next.js: window is not defined solutions](https://nextjs.org/docs/messages/react-hydration-error) — Official Next.js hydration guidance (HIGH confidence)
- [Next.js Lazy Loading / Dynamic Imports](https://nextjs.org/docs/pages/guides/lazy-loading) — `{ ssr: false }` usage (HIGH confidence)

### OpenF1 API
- [OpenF1 API Documentation](https://openf1.org/docs/) — Confirmed `recording_url` field on `team_radio`, `session_key` requirement, 3 req/s + 30 req/min limits (HIGH confidence — official docs)
- [OpenF1 GitHub](https://github.com/br-g/openf1) — Source for confirmed `livetiming.formula1.com` URL pattern on `recording_url` values (MEDIUM confidence — community-observed)

### Rate Limiting
- [TokenBucketQueue implementation in codebase](../../../src/lib/api/rate-limiter.ts) — Existing per-second limiter; no per-minute tracking (HIGH confidence — direct code inspection)
- [Token Bucket Algorithm explanation](https://medium.com/@surajshende247/token-bucket-algorithm-rate-limiting-db4c69502283) — Algorithm reference (MEDIUM confidence)

### List Virtualization
- [TanStack Virtual documentation](https://tanstack.com/virtual/latest/docs/introduction) — Authoritative reference for `@tanstack/react-virtual` (HIGH confidence)
- [TanStack Virtual in the existing F1 Hub stack](../../STACK.md) — Already a declared dependency for DriverSelect component (HIGH confidence — codebase)

### CORS
- [Mozilla bug: Web Audio API + cross-origin createMediaElementSource](https://bugzilla.mozilla.org/show_bug.cgi?id=937718) — Confirmed that `AudioContext.createMediaElementSource()` enforces CORS strictly even for URLs that play fine as `<audio src>` (HIGH confidence — official browser bug tracker)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) — Authoritative CORS reference (HIGH confidence)

---
*Pitfalls research for: F1 Hub — Radio Module (team radio catalog with audio playback)*
*Researched: 2026-02-19*
