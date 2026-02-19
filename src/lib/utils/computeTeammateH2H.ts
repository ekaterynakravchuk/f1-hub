import type { JolpikaRace } from "@/lib/api/jolpica/types";

export interface TeammateQualifyingResult {
  season: string;
  round: string;
  raceName: string;
  d1Position: number;
  d2Position: number;
  winner: "d1" | "d2" | "tie";
}

export interface TeammateH2HSummary {
  races: TeammateQualifyingResult[];
  d1Wins: number;
  d2Wins: number;
  ties: number;
  totalRaces: number;
  teammateSeasonsFound: string[];
}

/**
 * Computes head-to-head qualifying comparison for two drivers across all
 * seasons they competed as teammates on the same constructor.
 *
 * @param d1Qualifying - All qualifying races for driver 1
 * @param d2Qualifying - All qualifying races for driver 2
 */
export function computeTeammateH2H(
  d1Qualifying: JolpikaRace[],
  d2Qualifying: JolpikaRace[]
): TeammateH2HSummary {
  // Build lookup map for d1: key = "season:round"
  const d1Map = new Map<
    string,
    { position: number; constructorId: string }
  >();

  for (const race of d1Qualifying) {
    const qualiResult = race.QualifyingResults?.[0];
    if (!qualiResult) continue;
    const key = `${race.season}:${race.round}`;
    d1Map.set(key, {
      position: parseInt(qualiResult.position, 10),
      constructorId: qualiResult.Constructor.constructorId,
    });
  }

  const races: TeammateQualifyingResult[] = [];
  const seasonSet = new Set<string>();

  for (const race of d2Qualifying) {
    const qualiResult = race.QualifyingResults?.[0];
    if (!qualiResult) continue;

    const key = `${race.season}:${race.round}`;
    const d1Entry = d1Map.get(key);
    if (!d1Entry) continue;

    // Only count races where both drivers were on the same constructor
    if (d1Entry.constructorId !== qualiResult.Constructor.constructorId) continue;

    const d1Position = d1Entry.position;
    const d2Position = parseInt(qualiResult.position, 10);

    let winner: "d1" | "d2" | "tie";
    if (d1Position < d2Position) {
      winner = "d1";
    } else if (d2Position < d1Position) {
      winner = "d2";
    } else {
      winner = "tie";
    }

    races.push({
      season: race.season,
      round: race.round,
      raceName: race.raceName,
      d1Position,
      d2Position,
      winner,
    });

    seasonSet.add(race.season);
  }

  const d1Wins = races.filter((r) => r.winner === "d1").length;
  const d2Wins = races.filter((r) => r.winner === "d2").length;
  const ties = races.filter((r) => r.winner === "tie").length;

  const teammateSeasonsFound = Array.from(seasonSet).sort();

  return {
    races,
    d1Wins,
    d2Wins,
    ties,
    totalRaces: races.length,
    teammateSeasonsFound,
  };
}
