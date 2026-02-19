import { skipToken, useQueries } from "@tanstack/react-query";
import { fetchDriverSeasonStanding } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";
import { useDriverSeasons } from "@/hooks/useDriverSeasons";
import type { JolpikaDriverStanding } from "@/lib/api/jolpica/types";

export function useCareerStandings(driverId: string | undefined) {
  const { data: seasons } = useDriverSeasons(driverId);

  return useQueries({
    queries:
      driverId && seasons
        ? seasons.map((season) => ({
            queryKey: jolpikaKeys.driverSeasonStanding(driverId, season),
            queryFn: () => fetchDriverSeasonStanding(driverId, season),
            staleTime: Infinity,
          }))
        : [],
    combine(results) {
      const standings: JolpikaDriverStanding[] = results
        .map((r) => r.data)
        .filter((d): d is JolpikaDriverStanding => d !== null && d !== undefined);

      const isPending = results.some((r) => r.isPending);
      const isError = results.some((r) => r.isError);

      return { standings, isPending, isError };
    },
  });
}
