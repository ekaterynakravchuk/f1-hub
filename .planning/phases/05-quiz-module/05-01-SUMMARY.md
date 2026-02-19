---
phase: 05-quiz-module
plan: 01
subsystem: ui
tags: [react, localstorage, typescript, quiz, hooks, utilities]

# Dependency graph
requires:
  - phase: 02-data-layer
    provides: JolpikaDriverStanding and JolpikaRace types from jolpica/types.ts
provides:
  - SSR-safe localStorage hook using useSyncExternalStore (src/hooks/useLocalStorage.ts)
  - Fisher-Yates shuffle, pickRandom, pickN utilities (src/lib/utils/quiz/shuffleArray.ts)
  - Guess the Driver question generator (src/lib/utils/quiz/generateGuessDriver.ts)
  - Higher or Lower question generator (src/lib/utils/quiz/generateHigherOrLower.ts)
  - Guess the Race question generator (src/lib/utils/quiz/generateGuessRace.ts)
  - Shared Question interface exported from generateGuessDriver.ts
affects:
  - 05-quiz-module plan 02 (React quiz game components consume all 5 files from this plan)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useSyncExternalStore pattern for SSR-safe localStorage with getServerSnapshot returning initialValue
    - Pure TypeScript generator functions with no React coupling (testable in isolation)
    - Fisher-Yates clone-then-swap shuffle for unbiased randomisation

key-files:
  created:
    - src/hooks/useLocalStorage.ts
    - src/lib/utils/quiz/shuffleArray.ts
    - src/lib/utils/quiz/generateGuessDriver.ts
    - src/lib/utils/quiz/generateHigherOrLower.ts
    - src/lib/utils/quiz/generateGuessRace.ts
  modified: []

key-decisions:
  - "Question interface defined in generateGuessDriver.ts and re-exported via type import — keeps a single source of truth without a separate types file"
  - "generateHigherOrLower: 10-retry loop for tie-breaking with a full scan fallback — guarantees non-tie for any valid standings set"
  - "useLocalStorage dispatches synthetic StorageEvent for same-tab change propagation to useSyncExternalStore subscribers"
  - "initialValue excluded from setValue dependency array — read inside callback via getSnapshot to avoid stale closure infinite loop"

patterns-established:
  - "Quiz utilities: pure TS generators in src/lib/utils/quiz/, no React imports, consume Jolpica types directly"
  - "SSR hook pattern: useSyncExternalStore with getServerSnapshot always returning initialValue"

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 5 Plan 01: Quiz Foundation Summary

**SSR-safe useLocalStorage hook, Fisher-Yates shuffle utilities, and three pure TS question generators (guess-driver, higher/lower, guess-race) using 2024 Jolpica standings/races data**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-19T16:07:35Z
- **Completed:** 2026-02-19T16:09:04Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- useLocalStorage hook with useSyncExternalStore, SSR-safe getServerSnapshot, same-tab change propagation via synthetic StorageEvent
- Fisher-Yates shuffleArray + pickRandom + pickN pure utility functions
- generateGuessDriver: 4-choice driver name question from standings, 3 prompt templates, ordinal helper
- generateHigherOrLower: More/Fewer question with up to 10 tie-breaking retries and guaranteed fallback scan
- generateGuessRace: 4-choice race name question from races, 3 prompt templates (locality, round/date, circuit name)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useLocalStorage hook and shuffle utilities** - `db58259` (feat)
2. **Task 2: Create three question generator functions** - `d34ad2a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/hooks/useLocalStorage.ts` - SSR-safe localStorage hook using useSyncExternalStore
- `src/lib/utils/quiz/shuffleArray.ts` - Fisher-Yates shuffleArray, pickRandom, pickN
- `src/lib/utils/quiz/generateGuessDriver.ts` - Guess the Driver generator + shared Question interface
- `src/lib/utils/quiz/generateHigherOrLower.ts` - Higher or Lower generator with tie retry logic
- `src/lib/utils/quiz/generateGuessRace.ts` - Guess the Race generator

## Decisions Made

- Question interface defined in generateGuessDriver.ts and re-exported via `type` import — a single source of truth avoids a separate types file overhead for 5 files
- generateHigherOrLower uses 10-retry random loop then falls back to a deterministic scan — guarantees non-tie output for any valid standings array
- useLocalStorage dispatches a synthetic StorageEvent so useSyncExternalStore subscribers in the same tab get notified (browser native StorageEvent only fires in other tabs)
- `initialValue` intentionally excluded from setValue's useCallback dependency array — read inside callback via standalone `getSnapshot()` call to avoid stale closure / infinite update loop

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 utility files are ready for Plan 02 to consume
- Question interface (prompt, choices, correctAnswer, metadata) is stable and exported
- No blockers

---
*Phase: 05-quiz-module*
*Completed: 2026-02-19*
