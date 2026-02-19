import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchPositions } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function usePositions(
  sessionKey: number | undefined,
  driverNumber: number | undefined
) {
  return useQuery({
    queryKey: openf1Keys.positions(sessionKey ?? 0, driverNumber ?? 0),
    queryFn:
      sessionKey && driverNumber
        ? () => fetchPositions(sessionKey, driverNumber)
        : skipToken,
    staleTime: Infinity,
  });
}
