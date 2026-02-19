// Jolpica F1 API TypeScript types
// Verified field names from curl against api.jolpi.ca (2026-02-19)
// IMPORTANT: All numeric values are returned as strings by the API (position, points, etc.)

/** 5 minutes — use as staleTime for current-season queries */
export const CURRENT_SEASON_STALE_TIME = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Core entity types
// ---------------------------------------------------------------------------

export interface JolpikaDriver {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url?: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  nationality?: string;
  // photoUrl?: string; // NOT from Jolpica — future field, kept extensible
}

export interface JolpikaConstructor {
  constructorId: string;
  url?: string;
  name: string;
  nationality?: string;
}

export interface JolpikaCircuit {
  circuitId: string;
  url?: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
}

export interface JolpikaRaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: JolpikaDriver;
  Constructor: JolpikaConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed?: { units: string; speed: string };
  };
}

export interface JolpikaQualifyingResult {
  number: string;
  position: string;
  Driver: JolpikaDriver;
  Constructor: JolpikaConstructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface JolpikaRace {
  season: string;
  round: string;
  url?: string;
  raceName: string;
  Circuit: JolpikaCircuit;
  date: string;
  time?: string;
  Results?: JolpikaRaceResult[];
  QualifyingResults?: JolpikaQualifyingResult[];
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
}

export interface JolpikaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: JolpikaDriver;
  Constructors: JolpikaConstructor[];
}

export interface JolpikaSeason {
  season: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// MRData response wrappers
// All Jolpica responses are wrapped in { MRData: { ... } }
// ---------------------------------------------------------------------------

export interface JolpikaDriversResponse {
  MRData: {
    xmlns: string;
    series: string;
    url: string;
    limit: string;
    offset: string;
    total: string;
    DriverTable: { Drivers: JolpikaDriver[] };
  };
}

export interface JolpikaResultsResponse {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    RaceTable: { season: string; driverId?: string; Races: JolpikaRace[] };
  };
}

export interface JolpikaStandingsResponse {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    StandingsTable: {
      season: string;
      round?: string;
      StandingsLists: Array<{
        season: string;
        round: string;
        DriverStandings: JolpikaDriverStanding[];
      }>;
    };
  };
}

export interface JolpikaSeasonsResponse {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    SeasonTable: { Seasons: JolpikaSeason[] };
  };
}

export interface JolpikaRacesResponse {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    RaceTable: { season: string; Races: JolpikaRace[] };
  };
}
