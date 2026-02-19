import { z } from "zod";
import type {
  JolpikaDriversResponse,
  JolpikaResultsResponse,
  JolpikaStandingsResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Primitive schemas (reused across response schemas)
// ---------------------------------------------------------------------------

const DriverSchema = z.object({
  driverId: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  permanentNumber: z.string().optional(),
  code: z.string().optional(),
  url: z.string().optional(),
});

const ConstructorSchema = z.object({
  constructorId: z.string(),
  url: z.string().optional(),
  name: z.string(),
  nationality: z.string().optional(),
});

// ---------------------------------------------------------------------------
// DriversResponseSchema — validates the full MRData wrapper for /drivers.json
// ---------------------------------------------------------------------------

export const DriversResponseSchema = z.object({
  MRData: z.object({
    total: z.string(),
    limit: z.string(),
    offset: z.string(),
    DriverTable: z.object({
      Drivers: z.array(DriverSchema),
    }),
  }),
});

// ---------------------------------------------------------------------------
// ResultsResponseSchema — validates race results including nested entities
// ---------------------------------------------------------------------------

const RaceResultSchema = z.object({
  number: z.string(),
  position: z.string(),
  positionText: z.string(),
  points: z.string(),
  Driver: DriverSchema,
  Constructor: ConstructorSchema,
  grid: z.string(),
  laps: z.string(),
  status: z.string(),
  Time: z
    .object({ millis: z.string(), time: z.string() })
    .optional(),
  FastestLap: z
    .object({
      rank: z.string(),
      lap: z.string(),
      Time: z.object({ time: z.string() }),
      AverageSpeed: z
        .object({ units: z.string(), speed: z.string() })
        .optional(),
    })
    .optional(),
});

const RaceWithResultsSchema = z.object({
  season: z.string(),
  round: z.string(),
  url: z.string().optional(),
  raceName: z.string(),
  Circuit: z.object({
    circuitId: z.string(),
    url: z.string().optional(),
    circuitName: z.string(),
    Location: z.object({
      lat: z.string(),
      long: z.string(),
      locality: z.string(),
      country: z.string(),
    }),
  }),
  date: z.string(),
  time: z.string().optional(),
  Results: z.array(RaceResultSchema).optional(),
});

export const ResultsResponseSchema = z.object({
  MRData: z.object({
    limit: z.string(),
    offset: z.string(),
    total: z.string(),
    RaceTable: z.object({
      season: z.string(),
      driverId: z.string().optional(),
      Races: z.array(RaceWithResultsSchema),
    }),
  }),
});

// ---------------------------------------------------------------------------
// StandingsResponseSchema — validates driver standings including Constructors[]
// ---------------------------------------------------------------------------

const DriverStandingSchema = z.object({
  position: z.string(),
  positionText: z.string(),
  points: z.string(),
  wins: z.string(),
  Driver: DriverSchema,
  Constructors: z.array(ConstructorSchema),
});

export const StandingsResponseSchema = z.object({
  MRData: z.object({
    limit: z.string(),
    offset: z.string(),
    total: z.string(),
    StandingsTable: z.object({
      season: z.string(),
      round: z.string().optional(),
      StandingsLists: z.array(
        z.object({
          season: z.string(),
          round: z.string(),
          DriverStandings: z.array(DriverStandingSchema),
        })
      ),
    }),
  }),
});

// ---------------------------------------------------------------------------
// Soft-fail parser functions
//
// Use safeParse to avoid throwing on API schema drift. In development,
// unexpected shapes log a console.warn so engineers notice. In production,
// the raw data is returned as-is so users are not impacted by minor drift.
// ---------------------------------------------------------------------------

/**
 * Validates a Jolpika drivers response.
 * Soft-fail: logs a dev warning on schema mismatch, returns data as-is.
 */
export function parseDriversResponse(data: unknown): JolpikaDriversResponse {
  const result = DriversResponseSchema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Zod] DriversResponse validation failed:",
        result.error.format()
      );
    }
    return data as JolpikaDriversResponse;
  }
  return result.data as JolpikaDriversResponse;
}

/**
 * Validates a Jolpika results response.
 * Soft-fail: logs a dev warning on schema mismatch, returns data as-is.
 */
export function parseResultsResponse(data: unknown): JolpikaResultsResponse {
  const result = ResultsResponseSchema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Zod] ResultsResponse validation failed:",
        result.error.format()
      );
    }
    return data as JolpikaResultsResponse;
  }
  return result.data as JolpikaResultsResponse;
}

/**
 * Validates a Jolpika standings response.
 * Soft-fail: logs a dev warning on schema mismatch, returns data as-is.
 */
export function parseStandingsResponse(
  data: unknown
): JolpikaStandingsResponse {
  const result = StandingsResponseSchema.safeParse(data);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Zod] StandingsResponse validation failed:",
        result.error.format()
      );
    }
    return data as JolpikaStandingsResponse;
  }
  return result.data as JolpikaStandingsResponse;
}
