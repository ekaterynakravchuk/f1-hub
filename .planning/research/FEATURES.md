# Feature Research

**Domain:** F1 Team Radio Catalog — v1.1 Radio Module (subsequent milestone)
**Researched:** 2026-02-19
**Confidence:** HIGH (OpenF1 API shapes verified from existing codebase types; UX patterns from competitor analysis)

> **Scope:** This file focuses exclusively on the Radio module (v1.1). The app already has
> Head-to-Head, Quiz, shared components, API infrastructure, and dark minimalist theme.
> Research here answers: what does a team radio catalog need to feel complete and stand out?

---

## OpenF1 API Reality Check

Before feature scoping, the data layer constraints must be clear. All feature complexity
estimates below account for these realities.

### Confirmed endpoint shapes (from `/src/lib/api/openf1/types.ts`)

**`/team_radio`**
```typescript
{
  date: string;          // ISO datetime — the ONLY way to correlate with race events
  driver_number: number; // join key to /drivers for name, team color, headshot
  meeting_key: number;
  recording_url: string; // direct MP3/audio URL; streams from OpenF1 CDN
  session_key: number;   // required filter — must select session first
}
```
Note: No lap_number field. Lap must be inferred by joining date against `/laps` date_start ranges.
Note: OpenF1 documents that only a "limited selection" of radio is captured — not exhaustive.

**`/race_control`**
```typescript
{
  category: string;        // "Flag", "SafetyCar", "Drs", "Other"
  date: string;            // ISO datetime — join key
  driver_number: number | null; // null for track-wide events (SC deploy)
  flag: string | null;     // "GREEN", "YELLOW", "RED", "CHEQUERED", "BLACK AND WHITE", etc.
  lap_number: number | null;
  meeting_key: number;
  message: string;         // human-readable FIA message text
  qualifying_phase: string | null; // "Q1"/"Q2"/"Q3" or null
  scope: string;           // "Driver", "Track", "Sector"
  sector: number | null;   // 1, 2, or 3; null if track-wide
  session_key: number;
}
```

**`/position`**
```typescript
{
  date: string;            // sample timestamp — very high frequency (~4s intervals)
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}
```
Note: No lap_number. Position at time of radio = find position record closest to radio date.
Note: High data volume — fetching all positions for a full race is expensive on rate limit.

**`/laps`**
```typescript
{
  date_start: string;      // lap start datetime — use to infer which lap radio was on
  driver_number: number;
  lap_duration: number | null;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  // plus sector times, speed traps, is_pit_out_lap, segments
}
```
Note: lap_start to lap_start+duration window = lap boundary for correlating radio date to lap.

**`/sessions`** (needed for browsing UI)
```typescript
{
  circuit_key: number;
  circuit_short_name: string; // "Monza", "Monaco"
  country_code: string;
  country_key: number;
  country_name: string;       // "Italy", "Monaco"
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;           // city name
  meeting_key: number;
  session_key: number;
  session_name: string;       // "Race", "Qualifying", "Sprint"
  session_type: string;
  year: number;
}
```

**`/drivers`** (already typed in codebase)
```typescript
{
  broadcast_name: string;  // "M VERSTAPPEN"
  driver_number: number;
  full_name: string;
  headshot_url: string;    // may be null for some entries
  name_acronym: string;    // "VER"
  team_colour: string;     // hex without "#" e.g. "3671C6"
  team_name: string;
  session_key: number;     // driver data is per-session (teams change between sessions)
  meeting_key: number;
}
```

### API constraints for Radio module
- Rate limit: 3 req/s, 30 req/min — every new session browse = multiple coordinated fetches
- Data from 2023+ only — must lock year selector to 2023 and later
- `session_key` required for all radio/position/lap/driver queries — session selection is mandatory first step
- Position data volume is very large for a full race — avoid fetching all positions; instead query position for specific driver near specific timestamps
- `recording_url` is a direct CDN link — no proxy needed; browser `<audio>` element can load directly

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any radio catalog. Missing these = feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Session browser (year → race → session type) | Without this, there is no entry point — no way to find a race | LOW | Year locked to 2023+. Use `/sessions` endpoint filtered by year. Group by meeting_key for race, then list session types (Race, Quali, Sprint). |
| Driver filter within session | Users come with "I want to hear Verstappen radio" — driver-first browsing is the primary intent | LOW | Fetch `/drivers?session_key=X`, render driver pills/chips; filter client-side after fetch |
| Audio playback — play / pause | Users cannot interact with audio catalog without basic playback | LOW | Native HTML5 `<audio>` element with custom styled controls. Keyboard spacebar = play/pause. |
| Chronological list of radio messages | Users expect to see radios in time order within a session | LOW | Sort by `date` field ascending after fetch |
| Driver identity on each card (name, team color, number) | Users need to know who is speaking before clicking play | LOW | Join radio `driver_number` to `/drivers` response; apply `team_colour` as accent; show `name_acronym` or `full_name` |
| Timestamp display per radio message | Users orient themselves temporally — "this was lap 30" or "14:23 into race" | LOW | Display ISO date formatted as HH:mm:ss offset from session start; lap number derived from laps join |
| Loading states while data fetches | Multi-API fetch (session, drivers, radios) means skeleton UX is required | LOW | Skeleton cards matching radio item shape; existing `Skeleton` component available |
| Empty state when no radios available | Some sessions have zero captured radios — OpenF1 explicitly documents partial coverage | LOW | Clear message: "No team radio captured for this session" with link to try another session |
| Error state for failed fetches | OpenF1 can return 429 (rate limit) or 5xx — must handle gracefully | LOW | Existing `QueryError` component; rate limit message distinct from other errors |
| 2023+ data limitation label | Users will try to select 2022 or older and be confused | LOW | Grey out / disable years before 2023 in year selector; tooltip: "Team radio available from 2023 onwards" |

### Differentiators (Competitive Advantage)

Features that set this Radio module apart. Not required, but add real value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Lap number per radio message | Transforms raw timestamp into meaningful race context — "Lap 34" is far more useful than a UTC timestamp | MEDIUM | Fetch `/laps?session_key=X&driver_number=Y`, find lap whose `date_start` <= radio.date < `date_start + lap_duration`. Requires per-driver lap data. Cache lap data in React Query. |
| Driver race position at time of radio | "VER was P3 when this was sent" adds immediate strategic meaning | MEDIUM | Fetch `/position?session_key=X&driver_number=Y&date>=radio.date-5s&date<=radio.date+1s` and take first result. Alternative: fetch all positions and binary-search client-side. High data volume concern — use bounded date query. |
| Race Control event overlay | Shows nearby Safety Car deployments, flag events, DRS opens as timeline context markers | MEDIUM | Fetch `/race_control?session_key=X`. Annotate radio timeline with SC/flag markers where race_control.date is within ±60 seconds of a radio message. Filter to category "SafetyCar", "Flag". |
| Sticky global audio player | User clicks a radio from the list, player persists as they scroll — doesn't interrupt mid-play | MEDIUM | Client-side React state (lifted to page level or context). `<audio>` element in layout with src controlled by selected radio. Current-playing card highlighted. |
| Team color theming per driver | Visual scanability — each driver's radios have a subtle team-color left border or accent | LOW | Already have `team_colour` from OpenF1 driver data. Apply as `border-l-2` with hex color. Consistent with Head-to-Head module's team color usage. |
| Driver headshot in radio card | Instant visual recognition — F1 Live Pulse uses this pattern; makes catalog feel premium | LOW | `headshot_url` from `/drivers`. Fallback to driver number badge if URL null. Small circular avatar (32×32px). |
| Elapsed race time display | "1:23:45 into race" alongside lap number gives dual time context | LOW | Compute offset from session `date_start` (from `/sessions`). Pure client-side calculation. No extra API call. |
| "All drivers" aggregate view + per-driver filter toggle | Users want to browse everything in a session OR focus on one driver — both are valid workflows | LOW | Default to "All Drivers" sorted chronologically. Driver filter pill toggles client-side; no re-fetch. |
| Safe Car / flag proximity badge on radio card | Small badge ("SC LAP", "UNDER VSC") on radio cards that fall within a Safety Car period | MEDIUM | Subset of race control overlay. Match radio.date against SC deployment windows. Adds storytelling without full overlay. |
| Playback speed control (0.75x, 1x, 1.25x, 1.5x) | Engineers often speak fast; fans learning radio jargon benefit from slow playback | LOW | HTML5 `<audio>` element `playbackRate` property. No extra libraries needed. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI transcriptions of audio | F1 Live Pulse and MultiViewer do this — users will ask for it | Requires backend ML service (Whisper API or similar), server costs, not client-side feasible without paid API. Also: OpenF1 audio quality varies, producing unreliable transcriptions. | Ship without transcriptions for v1.1. Deferred to future milestone requiring Supabase backend. Manual transcription field could be added to future Supabase schema. |
| Full radio archive search by keyword | Searching "box box" across all sessions sounds useful | Would require fetching all radio metadata for multiple sessions and indexing client-side — with 20+ races × multiple sessions × 20 drivers, this is thousands of API calls impossible under 30 req/min. No server-side search without backend. | Per-session browsing only for v1.1. Future Supabase milestone could store transcripts and enable SQL full-text search. |
| Real-time live radio during a race | Exciting, but OpenF1 live data requires paid auth token | OpenF1 documents that live session data requires authentication (paid tier). Client-side only, no backend to store credentials. Rate limits would also be problematic during live race when 20 drivers are transmitting. | Historical sessions only for v1.1. |
| Radio voting ("Funny", "Iconic", "Angry" tags) | High engagement, community-driven discovery | Requires persistent storage (Supabase), user sessions, moderation. Explicitly out of scope per PROJECT.md. | Deferred milestone: "Radio of the Day" + voting. Currently in Out of Scope. |
| Sharing a specific radio clip via URL | Users want to share the famous "Multi 21" moment | Deep-linking to a specific radio message requires stable IDs. OpenF1 team_radio has no unique ID field — only session_key + driver_number + date composite. URL encoding a full ISO date is brittle. | For v1.1: URL encodes session_key only. Shareable session URLs (e.g., `/radio?session=9102&driver=1`). Specific clip sharing deferred. |
| Waveform visualization of audio | Looks impressive, common in podcast apps | Requires Web Audio API analysis pass over the audio data (CORS-permitting), or server-side pre-processing. OpenF1 CDN CORS policy may block cross-origin audio analysis. Implementation complexity high for aesthetic benefit. | Standard `<audio>` with styled progress bar. Clean and functional without CORS risk. |
| Download audio files | Users want to keep iconic radio moments | OpenF1 CDN files are publicly accessible URLs; downloading is trivially possible. But offering explicit download buttons signals endorsement of redistribution, which may conflict with F1's media rights even on a non-commercial app. | Do not add a Download button. Audio plays in-page only. Users can use browser dev tools if they choose. |

---

## Feature Dependencies

```
Session Browser (year → race → session)
    └──requires──> /sessions endpoint + year locked to 2023+
    └──enables──> All other Radio features (session_key is required for all other queries)

Driver List per Session
    └──requires──> /drivers?session_key=X
    └──enables──> Driver filter, team colors, headshot display

Radio Message List
    └──requires──> /team_radio?session_key=X (+ optional driver_number filter)
    └──enables──> Audio playback, lap context, position context

Audio Playback (sticky player)
    └──requires──> recording_url from radio message
    └──requires──> HTML5 <audio> element with client state management
    └──conflicts──> Multiple simultaneous players (only one audio instance globally)

Lap Number Context
    └──requires──> /laps?session_key=X&driver_number=Y (per-driver fetch)
    └──requires──> Radio message list (need radio.date to match against lap windows)
    └──enhances──> Radio Message List (adds "Lap N" annotation)

Driver Position at Radio Time
    └──requires──> /position?session_key=X&driver_number=Y (bounded date query)
    └──requires──> Radio message list (need radio.date as query anchor)
    └──enhances──> Radio Message List (adds "P3" annotation)
    └──note──> Rate limit concern: 1 API call per radio message per driver; batch with bounded date range

Race Control Event Overlay
    └──requires──> /race_control?session_key=X (single fetch, all events)
    └──requires──> Radio message list (dates to compare against)
    └──enhances──> Radio Message List (adds SC/flag markers)
    └──optional──> Can be toggled off to reduce visual noise

Driver Headshot Display
    └──requires──> headshot_url from /drivers response
    └──note──> Some entries have null headshot_url — must handle fallback

Team Color Accents
    └──requires──> team_colour from /drivers response (hex string, no "#" prefix)
    └──enhances──> Driver filter pills, radio card left border, sticky player indicator
```

### Dependency Notes

- **Session selection is the mandatory first step:** All OpenF1 endpoints for Radio require `session_key`. The UI must enforce session selection before any radio data is fetched. Cannot skip to driver filter first.
- **Lap inference requires per-driver lap data:** The `/laps` endpoint must be queried per driver (not once for all). With up to 20 drivers, this is 20 extra API calls per session load — must be deferred/lazy-loaded or only fetched for the filtered driver.
- **Position lookup is the most rate-limit-sensitive feature:** Fetching position nearest to each radio date, for each radio message, can trigger many calls. Use bounded date queries (`date>=X&date<=Y`) rather than fetching all positions and filtering client-side. Or fetch all positions once per driver-session and binary-search client-side (large payload but single call).
- **Race Control is a single flat fetch:** Unlike position/laps (per-driver), race control is session-wide. One call fetches all events. Low cost; high value for context overlay.
- **Sticky player conflicts with multi-player:** Only one HTML5 `<audio>` element should be active. New selection must pause/stop the previous. Manage via React context or page-level state — not per-card local state.
- **headshot_url can be null:** OpenF1 driver data is not always complete. Graceful fallback to driver number badge prevents broken image states.

---

## MVP Definition

### Launch With (v1.1 milestone)

Minimum viable radio catalog. Validates the core experience.

- [ ] **Session browser** — year (2023+) → race → session type (Race, Qualifying, Sprint). Required entry point.
- [ ] **Driver filter** — "All Drivers" default + per-driver filter pill. Client-side after fetch.
- [ ] **Radio message list** — chronological cards with driver name, team color accent, headshot (with fallback), elapsed time.
- [ ] **Audio playback** — sticky global player with play/pause, seek bar, elapsed/total time. Keyboard spacebar support.
- [ ] **Lap number annotation** — infer lap from `/laps` date windows. Lazy-fetch per selected driver only (not all 20).
- [ ] **2023+ data gate** — disable years before 2023 with explanatory tooltip.
- [ ] **Empty state** — "No radio captured" message with session-change prompt.
- [ ] **Loading skeletons** — cards matching radio item shape during multi-API fetch.
- [ ] **Navigation update** — add "Radio" to nav links and activate module card on home page.

### Add After Validation (v1.1.x enhancements)

Once base catalog is working and stable.

- [ ] **Driver position context** — show "P3" badge on radio card. Add only after confirming rate limit budget allows bounded position queries.
- [ ] **Race Control overlay** — SC/flag markers on timeline. Single extra API call; low risk. Add alongside position or independently.
- [ ] **Safety Car badge on card** — "SC LAP" label for radios within a safety car window. Derived from race control data.
- [ ] **Playback speed control** — 0.75x / 1x / 1.25x / 1.5x. `<audio>.playbackRate`. Trivial to add.
- [ ] **Elapsed race time** — compute from `sessions.date_start`. No extra API call.

### Future Consideration (v2+ requires Supabase)

Explicitly deferred per PROJECT.md Out of Scope:

- [ ] **AI transcriptions** — requires backend (Whisper/similar), Supabase storage for transcripts.
- [ ] **Radio voting/tags** ("Funny", "Iconic", "Angry") — requires Supabase + user sessions.
- [ ] **Radio of the Day** — requires curation backend, Supabase.
- [ ] **Full-text keyword search across sessions** — requires indexed transcript storage in Supabase.
- [ ] **Shareable clip URLs** — requires stable radio IDs (OpenF1 has none; Supabase would assign them).
- [ ] **Real-time live radio** — requires paid OpenF1 auth token and backend credential storage.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Session browser (year/race/session) | HIGH | LOW | P1 |
| Driver filter | HIGH | LOW | P1 |
| Audio playback — sticky player | HIGH | LOW | P1 |
| Chronological radio list | HIGH | LOW | P1 |
| Driver identity on card (name, color, headshot) | HIGH | LOW | P1 |
| 2023+ data gate with message | HIGH | LOW | P1 |
| Loading / empty / error states | HIGH | LOW | P1 |
| Lap number annotation | HIGH | MEDIUM | P1 |
| Elapsed race time display | MEDIUM | LOW | P1 |
| Driver position at radio time | MEDIUM | MEDIUM | P2 |
| Race Control event overlay | MEDIUM | LOW | P2 |
| Safety Car / flag badge on card | MEDIUM | MEDIUM | P2 |
| Playback speed control | LOW | LOW | P2 |
| AI transcriptions | HIGH | HIGH (requires backend) | P3 |
| Voting / tags | MEDIUM | HIGH (requires backend) | P3 |
| Radio of the Day | MEDIUM | HIGH (requires backend) | P3 |
| Real-time live radio | HIGH | HIGH (requires paid API) | P3 |
| Keyword search across sessions | MEDIUM | HIGH (requires backend) | P3 |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should add in v1.1.x once base is working
- P3: Future milestone (requires Supabase backend or paid API)

---

## Competitor Feature Analysis

| Feature | F1 Live Pulse | MultiViewer | Our Radio Module |
|---------|---------------|-------------|-----------------|
| Historical radio browsing | Yes (archived) | No (live only) | Yes — primary use case |
| Driver filter | Yes | Yes (live) | Yes — pill filter, client-side |
| Audio playback | Yes (tap to play) | Yes (live) | Yes — sticky global player |
| AI transcriptions | Yes (Pro tier) | Yes (live, via F1 TV) | No for v1.1 — deferred to v2+ |
| Lap number context | Not visible | Yes (live timing sync) | Yes — inferred from /laps join |
| Race position context | No | Yes (live timing) | Yes — via /position query |
| Race Control overlay | Yes (separate page) | Yes (integrated) | Yes — integrated timeline markers |
| Safety Car indicators | Yes | Yes | Yes — badge on affected radio cards |
| Keyword search | No visible | No | No for v1.1 — requires backend |
| Voting / community | No | No | No for v1.1 — deferred |
| Live radio (during race) | Yes (paid) | Yes (F1 TV required) | No — historical only |
| Team color coding | No | Yes | Yes — team_colour from /drivers |
| Driver headshots | Yes | Yes | Yes — headshot_url from /drivers |
| Offline / 2023+ only | No (2023+ same) | No (live) | Explicit — year gated to 2023+ |

**Positioning:** F1 Live Pulse is closest competitor. Our differentiator: lap number + position
context integrated into the radio card without a paid tier, using only the free OpenF1 API.
MultiViewer requires F1 TV subscription. We provide comparable historical context for free.

---

## Sources

- [OpenF1 API Documentation](https://openf1.org/docs/) — endpoint fields, rate limits, data availability (2023+)
- [OpenF1 race_control example JSON](https://openf1.org/docs/) — confirmed `qualifying_phase`, `scope`, `sector`, `flag` fields
- [Formula Live Pulse — Team Radio features](https://www.f1livepulse.com/en/features/team-radio/) — competitor feature benchmark (driver filter, playback, AI transcripts, archive)
- [MultiViewer](https://multiviewer.app/) — live timing + radio integration benchmark (requires F1 TV)
- [OpenF1 GitHub (br-g/openf1)](https://github.com/br-g/openf1) — confirmed "limited selection" radio coverage note
- [F1 Live Pulse vs F1-Dash comparison](https://blog.f1livepulse.com/formula-live-pulse-vs-f1-dash-the-ultimate-f1-data-dashboard-comparison) — feature set analysis
- Existing codebase `/src/lib/api/openf1/types.ts` — authoritative shapes for TeamRadio, Position, LapData, Driver
- Existing codebase `/src/lib/api/openf1/client.ts` — confirmed rate limit (3 req/s, 30 req/min)
- Existing codebase `/src/app/page.tsx` — confirmed Radio is "Planned" (next module)
- Existing codebase `.planning/PROJECT.md` — confirmed out-of-scope items (voting, tags, Radio of the Day, real-time)

---
*Feature research for: F1 Hub — Radio Module (v1.1 Team Radio Catalog)*
*Researched: 2026-02-19*
*Confidence: HIGH (API shapes from codebase; feature patterns from competitor analysis; limitations verified from OpenF1 docs)*
