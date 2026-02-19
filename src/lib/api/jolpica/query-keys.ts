/**
 * Query key factory for all Jolpica hooks.
 *
 * Hierarchical keys prevent cache collisions and enable precise
 * invalidation (e.g., invalidate all jolpica queries via jolpikaKeys.all).
 *
 * Pattern: ['jolpica', domain, ...specifics]
 */
export const jolpikaKeys = {
  all: ["jolpika"] as const,

  /** All drivers — reference data, fetched once per session */
  drivers: () => [...jolpikaKeys.all, "drivers"] as const,

  /** Single driver's race results for a given season */
  driverResults: (driverId: string, season: string) =>
    [...jolpikaKeys.all, "results", season, driverId] as const,

  /** Single driver's qualifying results for a given season */
  qualifying: (driverId: string, season: string) =>
    [...jolpikaKeys.all, "qualifying", season, driverId] as const,

  /** Driver standings for a given season */
  standings: (season: string) =>
    [...jolpikaKeys.all, "standings", season] as const,

  /** All F1 seasons */
  seasons: () => [...jolpikaKeys.all, "seasons"] as const,

  /** All races for a given season */
  races: (season: string) => [...jolpikaKeys.all, "races", season] as const,

  // --- Career-span keys (Phase 4 — Head-to-Head module) ---

  /** All race results across a driver's entire career */
  careerResults: (driverId: string) =>
    [...jolpikaKeys.all, "career-results", driverId] as const,

  /** All qualifying results across a driver's entire career */
  careerQualifying: (driverId: string) =>
    [...jolpikaKeys.all, "career-qualifying", driverId] as const,

  /** All seasons a driver competed in */
  driverSeasons: (driverId: string) =>
    [...jolpikaKeys.all, "driver-seasons", driverId] as const,

  /** A driver's championship standing for a specific season */
  driverSeasonStanding: (driverId: string, season: string) =>
    [...jolpikaKeys.all, "driver-season-standing", driverId, season] as const,
} as const;
