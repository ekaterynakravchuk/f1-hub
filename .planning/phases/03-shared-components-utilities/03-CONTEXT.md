# Phase 3: Shared Components & Utilities - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Reusable selector components (DriverSelect, SeasonSelect, RaceSelect), loading/error state components, and formatting utilities (team colors, lap times, nationality flags) that downstream modules — starting with Phase 4's Head-to-Head — will consume.

</domain>

<decisions>
## Implementation Decisions

### Driver search UX
- Each result shows: driver name + nationality indicator + last/most recent team name
- Search matches against first and last name (not nationality or team)
- Component supports configurable single-select and multi-select modes via prop

### Selector look & feel
- SeasonSelect, RaceSelect presentation: Claude's discretion
- Default values (pre-filled vs empty): Claude's discretion
- RaceSelect cascading behavior (disabled vs always available): Claude's discretion

### Loading & error states
- Loading skeleton style: Claude's discretion
- Error display pattern: Claude's discretion
- Component specificity (generic vs tailored per data type): Claude's discretion
- Empty state messaging: Claude's discretion

### Team colors & data formatting
- Team color mapping scope (historical depth): Claude's discretion
- Flag display format (emoji vs SVG): Claude's discretion
- Lap time formatter scope (time-only vs status labels): Claude's discretion
- Fallback color for unknown constructors: Claude's discretion

### Claude's Discretion
Claude has broad flexibility on this phase. The user locked three decisions:
1. Driver results show name + nationality + last team
2. Driver search matches first and last name
3. DriverSelect supports configurable single/multi-select mode

Everything else — selector presentation, loading patterns, error handling, color mapping scope, flag format, formatter scope, defaults, cascading behavior — Claude can choose the best approach for the dark minimalist theme and downstream Head-to-Head consumption.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user trusts Claude's judgment on implementation details for this utility/component phase, with the three locked decisions above as anchors.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-shared-components-utilities*
*Context gathered: 2026-02-19*
