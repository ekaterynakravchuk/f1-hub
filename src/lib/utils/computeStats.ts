import type {
  JolpikaRace,
  JolpikaDriverStanding,
} from "@/lib/api/jolpica/types";

export interface DriverStats {
  wins: number;
  podiums: number;
  poles: number;
  titles: number;
  races: number;
  dnfs: number;
  dnfRate: number;
  careerPoints: number;
  officialCareerPoints: number;
  avgFinishPosition: number;
  avgGridPosition: number;
  pointsPerRace: number;
  pointsPerSeason: Array<{ season: string; points: number }>;
}

/**
 * Returns true if a race result status represents a did-not-finish.
 * "Finished" and "+N Laps" statuses are classified as finishes.
 */
function isDNF(status: string): boolean {
  if (status === "Finished") return false;
  if (status.startsWith("+")) return false;
  return true;
}

/**
 * Derives all career statistics from raw Jolpica career data.
 *
 * @param careerResults  - All JolpikaRace objects with Results arrays
 * @param careerQualifying - All JolpikaRace objects with QualifyingResults arrays
 * @param standings - All JolpikaDriverStanding objects across career seasons
 */
export function computeStats(
  careerResults: JolpikaRace[],
  careerQualifying: JolpikaRace[],
  standings: JolpikaDriverStanding[]
): DriverStats {
  let wins = 0;
  let podiums = 0;
  let dnfs = 0;
  let totalFinishPos = 0;
  let totalGridPos = 0;
  let gridRaceCount = 0;
  let careerPoints = 0;
  const pointsBySeason: Record<string, number> = {};

  const raceCount = careerResults.length;

  for (const race of careerResults) {
    const result = race.Results?.[0];
    if (!result) continue;

    const position = parseInt(result.position, 10);
    const grid = parseInt(result.grid, 10);
    const points = parseFloat(result.points);
    const season = race.season;

    if (!isNaN(position)) {
      if (position === 1) wins++;
      if (position <= 3) podiums++;
      totalFinishPos += position;
    }

    // Grid 0 means pit lane start — exclude from grid average
    if (!isNaN(grid) && grid > 0) {
      totalGridPos += grid;
      gridRaceCount++;
    }

    if (!isNaN(points)) {
      careerPoints += points;
      pointsBySeason[season] = (pointsBySeason[season] ?? 0) + points;
    }

    if (isDNF(result.status)) {
      dnfs++;
    }
  }

  // Poles: qualifying sessions where driver started from P1
  let poles = 0;
  for (const race of careerQualifying) {
    const qualiResult = race.QualifyingResults?.[0];
    if (qualiResult?.position === "1") {
      poles++;
    }
  }

  // Titles: seasons where driver finished P1 in championship
  const titles = standings.filter((s) => s.position === "1").length;

  // Official career points: sum of standing.points per season (accounts for bonus points etc.)
  const officialCareerPoints = standings.reduce(
    (sum, s) => sum + parseFloat(s.points),
    0
  );

  // Averages — guard against zero race counts
  const avgFinishPosition = raceCount > 0 ? totalFinishPos / raceCount : 0;
  const avgGridPosition = gridRaceCount > 0 ? totalGridPos / gridRaceCount : 0;
  const pointsPerRace = raceCount > 0 ? careerPoints / raceCount : 0;
  const dnfRate = raceCount > 0 ? dnfs / raceCount : 0;

  // Points per season sorted ascending
  const pointsPerSeason = Object.entries(pointsBySeason)
    .map(([season, points]) => ({ season, points }))
    .sort((a, b) => a.season.localeCompare(b.season));

  return {
    wins,
    podiums,
    poles,
    titles,
    races: raceCount,
    dnfs,
    dnfRate,
    careerPoints,
    officialCareerPoints,
    avgFinishPosition,
    avgGridPosition,
    pointsPerRace,
    pointsPerSeason,
  };
}
