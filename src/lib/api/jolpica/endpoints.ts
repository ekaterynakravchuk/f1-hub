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
