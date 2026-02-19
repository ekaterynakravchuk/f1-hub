import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchDrivers } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

/**
 * Fetch all drivers for a session.
 * Returns driver roster with full_name, name_acronym, team_colour, driver_number.
 * Used by RadioClient to display driver names and team color accents.
 */
export function useOpenF1Drivers(sessionKey: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.drivers(sessionKey ?? 0),
    queryFn: sessionKey ? () => fetchDrivers(sessionKey) : skipToken,
    staleTime: Infinity,
  });
}
