/**
 * Query key factory for all OpenF1 hooks.
 *
 * Hierarchical keys prevent cache collisions and enable precise
 * invalidation (e.g., invalidate all data for a session via
 * invalidateQueries({ queryKey: ['openf1', sessionKey] })).
 *
 * Pattern: ['openf1', sessionKey?, domain, ...specifics]
 * Session-scoped keys place sessionKey at position 1 so all session
 * data can be cleared with a single invalidation call.
 */
export const openf1Keys = {
  all: ["openf1"] as const,

  /** All team radio recordings for a session */
  teamRadio: (sessionKey: number) =>
    [...openf1Keys.all, sessionKey, "team-radio"] as const,

  /** All race control events for a session */
  raceControl: (sessionKey: number) =>
    [...openf1Keys.all, sessionKey, "race-control"] as const,

  /** All sessions for a given year */
  sessions: (year: number) =>
    [...openf1Keys.all, "sessions", year] as const,

  /** All meetings (race weekends) for a given year */
  meetings: (year: number) =>
    [...openf1Keys.all, "meetings", year] as const,

  /** Per-driver lap data for a session — always filtered by driverNumber */
  driverLaps: (sessionKey: number, driverNumber: number) =>
    [...openf1Keys.all, sessionKey, "laps", driverNumber] as const,

  /** Per-driver position data for a session — always filtered by driverNumber */
  positions: (sessionKey: number, driverNumber: number) =>
    [...openf1Keys.all, sessionKey, "positions", driverNumber] as const,
} as const;
