import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchDriverLaps } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useDriverLaps(
  sessionKey: number | undefined,
  driverNumber: number | undefined
) {
  return useQuery({
    queryKey: openf1Keys.driverLaps(sessionKey ?? 0, driverNumber ?? 0),
    queryFn:
      sessionKey && driverNumber
        ? () => fetchDriverLaps(sessionKey, driverNumber)
        : skipToken,
    staleTime: Infinity,
  });
}
