import { jolpikaFetch } from "@/lib/api/jolpica/client";
import type {
  JolpikaDriver,
  JolpikaDriversResponse,
  JolpikaRace,
  JolpikaResultsResponse,
  JolpikaDriverStanding,
  JolpikaStandingsResponse,
  JolpikaSeason,
  JolpikaSeasonsResponse,
  JolpikaRacesResponse,
} from "@/lib/api/jolpica/types";
import {
  parseDriversResponse,
  parseResultsResponse,
  parseStandingsResponse,
} from "@/lib/api/jolpica/schemas";

const PAGE_SIZE = 100; // Jolpica max page size

// Fetches all ~874 F1 drivers. Takes ~2.25s at 4 req/s. Cached with staleTime: Infinity.
export async function fetchAllDrivers(): Promise<JolpikaDriver[]> {
  const firstPage = await jolpikaFetch<JolpikaDriversResponse>(
    `/drivers.json?limit=${PAGE_SIZE}&offset=0`
  );
  const validated = parseDriversResponse(firstPage);
  const total = parseInt(validated.MRData.total, 10);
  const drivers: JolpikaDriver[] = [...validated.MRData.DriverTable.Drivers];

  const pageCount = Math.ceil(total / PAGE_SIZE);

  for (let page = 1; page < pageCount; page++) {
    const offset = page * PAGE_SIZE;
    const pageData = await jolpikaFetch<JolpikaDriversResponse>(
      `/drivers.json?limit=${PAGE_SIZE}&offset=${offset}`
    );
    drivers.push(...pageData.MRData.DriverTable.Drivers);
  }

  return drivers;
}

export async function fetchDriverResults(
  driverId: string,
  season: string
): Promise<JolpikaRace[]> {
  const data = await jolpikaFetch<JolpikaResultsResponse>(
    `/${season}/drivers/${driverId}/results.json?limit=100`
  );
  const validated = parseResultsResponse(data);
  return validated.MRData.RaceTable.Races;
}

export async function fetchQualifying(
  driverId: string,
  season: string
): Promise<JolpikaRace[]> {
  const data = await jolpikaFetch<{ MRData: { RaceTable: { Races: JolpikaRace[] } } }>(
    `/${season}/drivers/${driverId}/qualifying.json?limit=100`
  );
  return data.MRData.RaceTable.Races;
}

export async function fetchStandings(
  season: string
): Promise<JolpikaDriverStanding[]> {
  const data = await jolpikaFetch<JolpikaStandingsResponse>(
    `/${season}/driverstandings.json?limit=100`
  );
  const validated = parseStandingsResponse(data);
  return validated.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function fetchSeasons(): Promise<JolpikaSeason[]> {
  const data = await jolpikaFetch<JolpikaSeasonsResponse>(
    `/seasons.json?limit=100`
  );
  const total = parseInt(data.MRData.total, 10);

  if (total > PAGE_SIZE) {
    // Future-proof: paginate if season count exceeds 100
    const seasons: JolpikaSeason[] = [...data.MRData.SeasonTable.Seasons];
    const pageCount = Math.ceil(total / PAGE_SIZE);
    for (let page = 1; page < pageCount; page++) {
      const offset = page * PAGE_SIZE;
      const pageData = await jolpikaFetch<JolpikaSeasonsResponse>(
        `/seasons.json?limit=${PAGE_SIZE}&offset=${offset}`
      );
      seasons.push(...pageData.MRData.SeasonTable.Seasons);
    }
    return seasons;
  }

  return data.MRData.SeasonTable.Seasons;
}

export async function fetchRaces(season: string): Promise<JolpikaRace[]> {
  const data = await jolpikaFetch<JolpikaRacesResponse>(
    `/${season}/races.json?limit=100`
  );
  return data.MRData.RaceTable.Races;
}

// ---------------------------------------------------------------------------
// Career-span endpoint functions (Phase 4 — Head-to-Head module)
// ---------------------------------------------------------------------------

/** Fetches all race results across a driver's entire career with pagination. */
export async function fetchCareerResults(
  driverId: string
): Promise<JolpikaRace[]> {
  const firstPage = await jolpikaFetch<JolpikaResultsResponse>(
    `/drivers/${driverId}/results.json?limit=${PAGE_SIZE}&offset=0`
  );
  const validated = parseResultsResponse(firstPage);
  const total = parseInt(validated.MRData.total, 10);
  const races: JolpikaRace[] = [...validated.MRData.RaceTable.Races];

  const pageCount = Math.ceil(total / PAGE_SIZE);
  for (let page = 1; page < pageCount; page++) {
    const offset = page * PAGE_SIZE;
    const pageData = await jolpikaFetch<JolpikaResultsResponse>(
      `/drivers/${driverId}/results.json?limit=${PAGE_SIZE}&offset=${offset}`
    );
    races.push(...pageData.MRData.RaceTable.Races);
  }

  return races;
}

/** Fetches all qualifying results across a driver's entire career with pagination. */
export async function fetchCareerQualifying(
  driverId: string
): Promise<JolpikaRace[]> {
  const firstPage = await jolpikaFetch<{
    MRData: { total: string; RaceTable: { Races: JolpikaRace[] } };
  }>(`/drivers/${driverId}/qualifying.json?limit=${PAGE_SIZE}&offset=0`);
  const total = parseInt(firstPage.MRData.total, 10);
  const races: JolpikaRace[] = [...firstPage.MRData.RaceTable.Races];

  const pageCount = Math.ceil(total / PAGE_SIZE);
  for (let page = 1; page < pageCount; page++) {
    const offset = page * PAGE_SIZE;
    const pageData = await jolpikaFetch<{
      MRData: { total: string; RaceTable: { Races: JolpikaRace[] } };
    }>(`/drivers/${driverId}/qualifying.json?limit=${PAGE_SIZE}&offset=${offset}`);
    races.push(...pageData.MRData.RaceTable.Races);
  }

  return races;
}

/** Fetches all seasons a driver competed in. Returns array of season year strings. */
export async function fetchDriverSeasons(driverId: string): Promise<string[]> {
  const data = await jolpikaFetch<JolpikaSeasonsResponse>(
    `/drivers/${driverId}/seasons.json?limit=100`
  );
  return data.MRData.SeasonTable.Seasons.map((s) => s.season);
}

/** Fetches a driver's championship standing for a specific season. Returns null if not found. */
export async function fetchDriverSeasonStanding(
  driverId: string,
  season: string
): Promise<JolpikaDriverStanding | null> {
  const data = await jolpikaFetch<JolpikaStandingsResponse>(
    `/${season}/drivers/${driverId}/driverstandings.json`
  );
  return (
    data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0] ?? null
  );
}
