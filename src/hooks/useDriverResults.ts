import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchDriverResults } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useDriverResults(
  driverId: string | undefined,
  season: string | undefined
) {
  return useQuery({
    queryKey: jolpikaKeys.driverResults(driverId ?? "", season ?? ""),
    queryFn:
      driverId && season
        ? () => fetchDriverResults(driverId, season)
        : skipToken,
    staleTime: Infinity,
  });
}
