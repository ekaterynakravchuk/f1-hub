import { openf1Fetch } from "@/lib/api/openf1/client";
import type {
  OpenF1Driver,
  OpenF1TeamRadio,
  OpenF1RaceControl,
  OpenF1Session,
  OpenF1Meeting,
  OpenF1LapData,
  OpenF1Position,
} from "@/lib/api/openf1/types";

/**
 * Fetch all team radio recordings for a session.
 * Returns audio clip metadata including recording_url.
 */
export async function fetchTeamRadio(
  sessionKey: number
): Promise<OpenF1TeamRadio[]> {
  return openf1Fetch<OpenF1TeamRadio[]>(
    `/team_radio?session_key=${sessionKey}`
  );
}

/**
 * Fetch all race control events for a session.
 * Includes flags, safety car deployments, DRS zones, and messages.
 */
export async function fetchRaceControl(
  sessionKey: number
): Promise<OpenF1RaceControl[]> {
  return openf1Fetch<OpenF1RaceControl[]>(
    `/race_control?session_key=${sessionKey}`
  );
}

/**
 * Fetch all sessions for a given year.
 * Returns race, qualifying, practice, and sprint session metadata.
 */
export async function fetchSessions(year: number): Promise<OpenF1Session[]> {
  return openf1Fetch<OpenF1Session[]>(`/sessions?year=${year}`);
}

/**
 * Fetch all meetings (race weekends) for a given year.
 * Returns meeting metadata including circuit and country info.
 */
export async function fetchMeetings(year: number): Promise<OpenF1Meeting[]> {
  return openf1Fetch<OpenF1Meeting[]>(`/meetings?year=${year}`);
}

/**
 * Fetch lap data for a specific driver in a session.
 * Always filter by driver_number — full session lap data is excessively large.
 */
export async function fetchDriverLaps(
  sessionKey: number,
  driverNumber: number
): Promise<OpenF1LapData[]> {
  return openf1Fetch<OpenF1LapData[]>(
    `/laps?session_key=${sessionKey}&driver_number=${driverNumber}`
  );
}

/**
 * Fetch position data for a specific driver in a session.
 * IMPORTANT: Always filter by driver_number — full session position data
 * can exceed 100K records per session (research finding: ~20K per driver).
 */
export async function fetchPositions(
  sessionKey: number,
  driverNumber: number
): Promise<OpenF1Position[]> {
  return openf1Fetch<OpenF1Position[]>(
    `/position?session_key=${sessionKey}&driver_number=${driverNumber}`
  );
}

/**
 * Fetch all drivers for a session.
 * Returns driver roster including full_name, name_acronym, team_colour.
 */
export async function fetchDrivers(
  sessionKey: number
): Promise<OpenF1Driver[]> {
  return openf1Fetch<OpenF1Driver[]>(`/drivers?session_key=${sessionKey}`);
}

/**
 * Fetch all sessions for a specific meeting (race weekend).
 * More targeted than fetchSessions(year) — returns only 3-6 sessions
 * for the selected meeting instead of ~125 for the full year.
 */
export async function fetchSessionsByMeeting(
  meetingKey: number
): Promise<OpenF1Session[]> {
  return openf1Fetch<OpenF1Session[]>(`/sessions?meeting_key=${meetingKey}`);
}
